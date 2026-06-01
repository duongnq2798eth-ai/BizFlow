// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BizFlowEscrow
 * @author BizFlow Team (Track 2 — SME Finance & Trade)
 * @notice Milestone-based USDC escrow contract for B2B trade finance on Arc Testnet.
 *         Buyers lock USDC into escrow deals with defined milestones.
 *         Upon milestone completion (verified by proof hash), funds are released to sellers.
 * 
 * @dev Key Design Decisions:
 *   - Uses IERC20 interface for USDC (address 0x360... on Arc Testnet, 6 decimals)
 *   - Milestone-based release prevents all-or-nothing risk
 *   - Dispute mechanism allows buyer to freeze releases pending resolution
 *   - Events are indexed for frontend ArcScan indexing
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BizFlowEscrow {
    // ============ State Variables ============

    IERC20 public immutable usdc;
    address public admin;
    uint256 public dealCounter;

    struct Milestone {
        uint256 amount;       // USDC amount (6 decimals) for this milestone
        bool completed;       // Whether milestone is verified complete
        bytes32 proofHash;    // IPFS/document hash proving completion
    }

    struct Deal {
        address buyer;
        address seller;
        uint256 totalAmount;      // Total USDC locked in escrow
        uint256 releasedAmount;   // Total USDC already released to seller
        uint256 milestoneCount;
        bool disputed;            // If true, releases are frozen
        bool completed;           // If true, all milestones done
        bool cancelled;           // If true, deal was cancelled
        uint256 createdAt;        // Block timestamp of creation
        string description;       // Purchase order / deal description
    }

    mapping(uint256 => Deal) public deals;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;

    // ============ Events ============

    event DealCreated(
        uint256 indexed dealId,
        address indexed buyer,
        address indexed seller,
        uint256 totalAmount,
        uint256 milestoneCount,
        string description
    );

    event DealFunded(
        uint256 indexed dealId,
        uint256 amount
    );

    event MilestoneCompleted(
        uint256 indexed dealId,
        uint256 indexed milestoneIndex,
        uint256 amount,
        bytes32 proofHash
    );

    event FundsReleased(
        uint256 indexed dealId,
        address indexed seller,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed dealId,
        address indexed raisedBy
    );

    event DisputeResolved(
        uint256 indexed dealId,
        address indexed resolvedBy
    );

    event DealCancelled(
        uint256 indexed dealId,
        uint256 refundAmount
    );

    // ============ Modifiers ============

    modifier onlyBuyer(uint256 dealId) {
        require(msg.sender == deals[dealId].buyer, "Only buyer");
        _;
    }

    modifier onlyParty(uint256 dealId) {
        require(
            msg.sender == deals[dealId].buyer || msg.sender == deals[dealId].seller,
            "Not a deal party"
        );
        _;
    }

    modifier dealActive(uint256 dealId) {
        require(!deals[dealId].completed, "Deal already completed");
        require(!deals[dealId].cancelled, "Deal cancelled");
        _;
    }

    modifier notDisputed(uint256 dealId) {
        require(!deals[dealId].disputed, "Deal is disputed — releases frozen");
        _;
    }

    // ============ Constructor ============

    /**
     * @param _usdc Address of USDC token contract (0x3600000000000000000000000000000000000000 on Arc Testnet)
     */
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        admin = msg.sender;
        dealCounter = 0;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new escrow deal with milestones.
     * @dev Buyer must have approved this contract to spend `totalAmount` USDC beforehand.
     *      Funds are transferred to this contract upon creation.
     * @param seller Address of the seller/supplier
     * @param milestoneAmounts Array of USDC amounts for each milestone (6 decimals)
     * @param description Human-readable deal/PO description
     * @return dealId The ID of the newly created deal
     */
    function createDeal(
        address seller,
        uint256[] calldata milestoneAmounts,
        string calldata description
    ) external returns (uint256 dealId) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Buyer cannot be seller");
        require(milestoneAmounts.length > 0, "At least 1 milestone required");
        require(milestoneAmounts.length <= 10, "Max 10 milestones");

        uint256 total = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone amount must be > 0");
            total += milestoneAmounts[i];
        }

        // Transfer USDC from buyer to escrow
        require(usdc.transferFrom(msg.sender, address(this), total), "USDC transfer failed");

        dealId = dealCounter++;

        deals[dealId] = Deal({
            buyer: msg.sender,
            seller: seller,
            totalAmount: total,
            releasedAmount: 0,
            milestoneCount: milestoneAmounts.length,
            disputed: false,
            completed: false,
            cancelled: false,
            createdAt: block.timestamp,
            description: description
        });

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            milestones[dealId][i] = Milestone({
                amount: milestoneAmounts[i],
                completed: false,
                proofHash: bytes32(0)
            });
        }

        emit DealCreated(dealId, msg.sender, seller, total, milestoneAmounts.length, description);
        emit DealFunded(dealId, total);
    }

    /**
     * @notice Mark a milestone as completed and release funds to seller.
     * @dev Only the buyer can confirm milestones. Proof hash is stored for audit trail.
     * @param dealId ID of the deal
     * @param milestoneIndex Index of the milestone to complete
     * @param proofHash IPFS hash or document hash proving milestone completion
     */
    function completeMilestone(
        uint256 dealId,
        uint256 milestoneIndex,
        bytes32 proofHash
    ) external onlyBuyer(dealId) dealActive(dealId) notDisputed(dealId) {
        require(milestoneIndex < deals[dealId].milestoneCount, "Invalid milestone");
        
        Milestone storage m = milestones[dealId][milestoneIndex];
        require(!m.completed, "Milestone already completed");

        m.completed = true;
        m.proofHash = proofHash;

        // Release milestone funds to seller
        uint256 releaseAmount = m.amount;
        deals[dealId].releasedAmount += releaseAmount;
        require(usdc.transfer(deals[dealId].seller, releaseAmount), "USDC transfer to seller failed");

        emit MilestoneCompleted(dealId, milestoneIndex, releaseAmount, proofHash);
        emit FundsReleased(dealId, deals[dealId].seller, releaseAmount);

        // Check if all milestones are completed
        if (deals[dealId].releasedAmount >= deals[dealId].totalAmount) {
            deals[dealId].completed = true;
        }
    }

    /**
     * @notice Raise a dispute to freeze fund releases.
     * @param dealId ID of the deal
     */
    function raiseDispute(uint256 dealId) external onlyParty(dealId) dealActive(dealId) {
        require(!deals[dealId].disputed, "Already disputed");
        deals[dealId].disputed = true;
        emit DisputeRaised(dealId, msg.sender);
    }

    /**
     * @notice Resolve a dispute (admin only).
     * @param dealId ID of the deal
     */
    function resolveDispute(uint256 dealId) external {
        require(msg.sender == admin, "Only admin");
        require(deals[dealId].disputed, "Not disputed");
        deals[dealId].disputed = false;
        emit DisputeResolved(dealId, msg.sender);
    }

    /**
     * @notice Cancel a deal and refund remaining escrowed USDC to buyer.
     * @dev Only admin can cancel. Already-released funds are not refunded.
     * @param dealId ID of the deal
     */
    function cancelDeal(uint256 dealId) external dealActive(dealId) {
        require(msg.sender == admin || msg.sender == deals[dealId].buyer, "Not authorized");
        
        uint256 refundAmount = deals[dealId].totalAmount - deals[dealId].releasedAmount;
        deals[dealId].cancelled = true;

        if (refundAmount > 0) {
            require(usdc.transfer(deals[dealId].buyer, refundAmount), "Refund failed");
        }

        emit DealCancelled(dealId, refundAmount);
    }

    // ============ View Functions ============

    /**
     * @notice Get deal details
     */
    function getDeal(uint256 dealId) external view returns (
        address buyer,
        address seller,
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 milestoneCount,
        bool disputed,
        bool completed,
        bool cancelled,
        uint256 createdAt,
        string memory description
    ) {
        Deal storage d = deals[dealId];
        return (d.buyer, d.seller, d.totalAmount, d.releasedAmount, d.milestoneCount, d.disputed, d.completed, d.cancelled, d.createdAt, d.description);
    }

    /**
     * @notice Get milestone details
     */
    function getMilestone(uint256 dealId, uint256 milestoneIndex) external view returns (
        uint256 amount,
        bool completed,
        bytes32 proofHash
    ) {
        Milestone storage m = milestones[dealId][milestoneIndex];
        return (m.amount, m.completed, m.proofHash);
    }

    /**
     * @notice Get the total USDC balance held in escrow by this contract
     */
    function escrowBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
