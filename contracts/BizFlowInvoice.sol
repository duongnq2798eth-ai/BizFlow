// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BizFlowInvoice
 * @author BizFlow Team (Track 2 — SME Finance & Trade)
 * @notice On-chain invoice management for B2B trade workflows on Arc Testnet.
 *         Suppliers create invoices, buyers approve/reject, and settlement happens in USDC.
 *         Supports batch settlement, early payment discounts, and three-way matching
 *         (PO → Receipt → Invoice).
 * 
 * @dev Key Design Decisions:
 *   - USDC as settlement currency (6 decimals on Arc Testnet)
 *   - Three-way matching: invoices reference a purchase order and goods receipt
 *   - Early payment discount incentivizes faster settlement
 *   - Batch settlement reduces gas costs for high-volume SMEs
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract BizFlowInvoice {
    // ============ State Variables ============

    address public admin;
    IERC20 public immutable usdc;
    uint256 public invoiceCounter;

    enum InvoiceStatus {
        Created,      // Invoice submitted by supplier
        Approved,     // Buyer approved the invoice
        Rejected,     // Buyer rejected the invoice
        Settled,      // Payment completed in USDC
        Disputed,     // Under dispute
        Cancelled     // Cancelled by supplier
    }

    struct Invoice {
        uint256 id;
        address supplier;         // Who issued the invoice
        address buyer;            // Who owes payment
        uint256 amount;           // Invoice amount in USDC (6 decimals)
        uint256 dueDate;          // Unix timestamp for payment due date
        uint256 createdAt;        // When invoice was created
        uint256 settledAt;        // When invoice was paid (0 if not yet)
        InvoiceStatus status;
        string description;       // Line items / description
        bytes32 purchaseOrderRef; // Reference to purchase order hash
        bytes32 goodsReceiptRef;  // Reference to goods receipt hash (3-way match)
        uint16 earlyPayDiscount;  // Basis points discount for early payment (e.g. 200 = 2%)
    }

    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public supplierInvoices;
    mapping(address => uint256[]) public buyerInvoices;

    // ============ Events ============

    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed supplier,
        address indexed buyer,
        uint256 amount,
        uint256 dueDate,
        string description
    );

    event InvoiceApproved(
        uint256 indexed invoiceId,
        address indexed approvedBy
    );

    event InvoiceRejected(
        uint256 indexed invoiceId,
        address indexed rejectedBy,
        string reason
    );

    event InvoiceSettled(
        uint256 indexed invoiceId,
        uint256 amountPaid,
        uint256 discountApplied
    );

    event InvoiceDisputed(
        uint256 indexed invoiceId,
        address indexed disputedBy
    );

    event BatchSettled(
        uint256[] invoiceIds,
        uint256 totalAmount,
        address indexed payer
    );

    event ThreeWayMatchVerified(
        uint256 indexed invoiceId,
        bytes32 purchaseOrderRef,
        bytes32 goodsReceiptRef
    );

    // ============ Modifiers ============

    modifier onlyBuyer(uint256 invoiceId) {
        require(msg.sender == invoices[invoiceId].buyer, "Only buyer");
        _;
    }

    modifier onlySupplier(uint256 invoiceId) {
        require(msg.sender == invoices[invoiceId].supplier, "Only supplier");
        _;
    }

    // ============ Constructor ============

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        admin = msg.sender;
        invoiceCounter = 0;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new invoice.
     * @param buyer Address of the buyer who owes payment
     * @param amount Invoice amount in USDC (6 decimals)
     * @param dueDate Unix timestamp for payment deadline
     * @param description Line items or invoice description
     * @param purchaseOrderRef Hash of the associated purchase order
     * @param earlyPayDiscount Discount in basis points for early payment
     * @return invoiceId The ID of the newly created invoice
     */
    function createInvoice(
        address buyer,
        uint256 amount,
        uint256 dueDate,
        string calldata description,
        bytes32 purchaseOrderRef,
        uint16 earlyPayDiscount
    ) external returns (uint256 invoiceId) {
        require(buyer != address(0), "Invalid buyer");
        require(buyer != msg.sender, "Cannot invoice self");
        require(amount > 0, "Amount must be > 0");
        require(dueDate > block.timestamp, "Due date must be in future");
        require(earlyPayDiscount <= 1000, "Max 10% early pay discount");

        invoiceId = invoiceCounter++;

        invoices[invoiceId] = Invoice({
            id: invoiceId,
            supplier: msg.sender,
            buyer: buyer,
            amount: amount,
            dueDate: dueDate,
            createdAt: block.timestamp,
            settledAt: 0,
            status: InvoiceStatus.Created,
            description: description,
            purchaseOrderRef: purchaseOrderRef,
            goodsReceiptRef: bytes32(0),
            earlyPayDiscount: earlyPayDiscount
        });

        supplierInvoices[msg.sender].push(invoiceId);
        buyerInvoices[buyer].push(invoiceId);

        emit InvoiceCreated(invoiceId, msg.sender, buyer, amount, dueDate, description);
    }

    /**
     * @notice Approve an invoice and optionally verify three-way match.
     * @param invoiceId ID of the invoice to approve
     * @param goodsReceiptRef Hash of the goods receipt document for three-way matching
     */
    function approveInvoice(
        uint256 invoiceId,
        bytes32 goodsReceiptRef
    ) external onlyBuyer(invoiceId) {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == InvoiceStatus.Created, "Invoice not in Created status");

        inv.status = InvoiceStatus.Approved;
        inv.goodsReceiptRef = goodsReceiptRef;

        emit InvoiceApproved(invoiceId, msg.sender);

        // If goods receipt matches purchase order, emit three-way match event
        if (inv.purchaseOrderRef != bytes32(0) && goodsReceiptRef != bytes32(0)) {
            emit ThreeWayMatchVerified(invoiceId, inv.purchaseOrderRef, goodsReceiptRef);
        }
    }

    /**
     * @notice Reject an invoice with a reason.
     * @param invoiceId ID of the invoice to reject
     * @param reason Why the invoice was rejected
     */
    function rejectInvoice(
        uint256 invoiceId,
        string calldata reason
    ) external onlyBuyer(invoiceId) {
        require(invoices[invoiceId].status == InvoiceStatus.Created, "Invoice not in Created status");
        invoices[invoiceId].status = InvoiceStatus.Rejected;
        emit InvoiceRejected(invoiceId, msg.sender, reason);
    }

    /**
     * @notice Settle an approved invoice by transferring USDC to the supplier.
     * @dev Buyer must have approved this contract to spend USDC.
     *      Early payment discount is applied if paid before due date.
     * @param invoiceId ID of the invoice to settle
     */
    function settleInvoice(uint256 invoiceId) external onlyBuyer(invoiceId) {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == InvoiceStatus.Approved, "Invoice not approved");

        uint256 payAmount = inv.amount;
        uint256 discount = 0;

        // Apply early payment discount if applicable
        if (block.timestamp < inv.dueDate && inv.earlyPayDiscount > 0) {
            discount = (payAmount * inv.earlyPayDiscount) / 10000;
            payAmount -= discount;
        }

        require(usdc.transferFrom(msg.sender, inv.supplier, payAmount), "USDC payment failed");

        inv.status = InvoiceStatus.Settled;
        inv.settledAt = block.timestamp;

        emit InvoiceSettled(invoiceId, payAmount, discount);
    }

    /**
     * @notice Batch settle multiple approved invoices in a single transaction.
     * @dev Reduces gas costs for high-volume SME payment runs.
     * @param invoiceIds Array of invoice IDs to settle
     */
    function batchSettle(uint256[] calldata invoiceIds) external {
        require(invoiceIds.length > 0, "Empty batch");
        require(invoiceIds.length <= 20, "Max 20 invoices per batch");

        uint256 totalPaid = 0;

        for (uint256 i = 0; i < invoiceIds.length; i++) {
            Invoice storage inv = invoices[invoiceIds[i]];
            require(msg.sender == inv.buyer, "Not buyer for all invoices");
            require(inv.status == InvoiceStatus.Approved, "Invoice not approved");

            uint256 payAmount = inv.amount;
            uint256 discount = 0;

            if (block.timestamp < inv.dueDate && inv.earlyPayDiscount > 0) {
                discount = (payAmount * inv.earlyPayDiscount) / 10000;
                payAmount -= discount;
            }

            require(usdc.transferFrom(msg.sender, inv.supplier, payAmount), "USDC payment failed");

            inv.status = InvoiceStatus.Settled;
            inv.settledAt = block.timestamp;
            totalPaid += payAmount;

            emit InvoiceSettled(invoiceIds[i], payAmount, discount);
        }

        emit BatchSettled(invoiceIds, totalPaid, msg.sender);
    }

    /**
     * @notice Raise a dispute on an invoice.
     */
    function disputeInvoice(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(
            msg.sender == inv.buyer || msg.sender == inv.supplier,
            "Not a party"
        );
        require(
            inv.status == InvoiceStatus.Created || inv.status == InvoiceStatus.Approved,
            "Cannot dispute in current status"
        );

        inv.status = InvoiceStatus.Disputed;
        emit InvoiceDisputed(invoiceId, msg.sender);
    }

    // ============ View Functions ============

    function getInvoice(uint256 invoiceId) external view returns (Invoice memory) {
        return invoices[invoiceId];
    }

    function getSupplierInvoiceCount(address supplier) external view returns (uint256) {
        return supplierInvoices[supplier].length;
    }

    function getBuyerInvoiceCount(address buyer) external view returns (uint256) {
        return buyerInvoices[buyer].length;
    }
}
