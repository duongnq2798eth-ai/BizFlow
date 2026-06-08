export const USDC_ADDRESSES = {
  5042002: "0x3600000000000000000000000000000000000000", // Arc Testnet
  84532: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",   // Base Sepolia
} as const;

export const SIMPLE_TOKEN_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [
      { "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const SIMPLE_TOKEN_BYTECODE = "0x6080604052601260025f6101000a81548160ff021916908360ff1602179055503480156200002b575f80fd5b506040516200164e3803806200164e8339818101604052810190620000519190620002e4565b815f90816200006191906200059e565b5080600190816200007391906200059e565b5060025f9054906101000a900460ff1660ff16600a620000949190620007ff565b620f4240620000a491906200084f565b60038190555060035460045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055503373ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6003546040516200014f9190620008aa565b60405180910390a35050620008c5565b5f604051905090565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b620001c08262000178565b810181811067ffffffffffffffff82111715620001e257620001e162000188565b5b80604052505050565b5f620001f66200015f565b9050620002048282620001b5565b919050565b5f67ffffffffffffffff82111562000226576200022562000188565b5b620002318262000178565b9050602081019050919050565b5f5b838110156200025d57808201518184015260208101905062000240565b5f8484015250505050565b5f6200027e620002788462000209565b620001eb565b9050828152602081018484840111156200029d576200029c62000174565b5b620002aa8482856200023e565b509392505050565b5f82601f830112620002c957620002c862000170565b5b8151620002db84826020860162000268565b91505092915050565b5f8060408385031215620002fd57620002fc62000168565b5b5f83015167ffffffffffffffff8111156200031d576200031c6200016c565b5b6200032b85828601620002b2565b925050602083015167ffffffffffffffff8111156200034f576200034e6200016c565b5b6200035d85828601620002b2565b9150509250929050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680620003b657607f821691505b602082108103620003cc57620003cb62000371565b5b50919050565b5f819050815f5260205f20905b81548152906001019060200180831161026357829003601f168201915b505050505081565b5f6020601f8301049050919050565b5f82821b905092915050565b5f60088302620004307fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82620003f3565b620004308683620003f3565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f62000486620004806200047a8462000454565b6200045d565b62000454565b9050919050565b5f819050919050565b620004a18362000466565b620004b9620004b0826200048d565b848454620003ff565b825550505050565b5f90565b620004cf620004c1565b620004dc81848462000496565b505050565b5b818110156200050357620004f75f82620004c5565b600181019050620004e2565b5050565b601f82111562000552576200051c81620003d2565b6200052784620003e4565b8101602085101562000537578190505b6200054f6200054685620003e4565b830182620004e1565b50505b50505b505050565b5f82821c905092915050565b5f620005745f198460080262000557565b1980831691505092915050565b5f6200058e838362000563565b9150826002028217905092915050565b620005a98262000367565b67ffffffffffffffff811115620005c557620005c462000188565b5b620005d182546200039e565b620005de82828562000507565b5f60209050601f83116001811462000614575f8415620005ff578287015190505b6200060b858262000581565b8655506200067a565b601f1984166200062486620003d2565b5f5b828110156200064d5784890151825560018201915060208501945060208101905062000626565b868310156200066d578489015162000669601f89168262000563565b8355505b6001600288020188555050505b505050505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f60011c9050919050565b5f808291508390505b60018511156200070c57808604811115620006e457620006e362000682565b5b6001851615620006f45780820291505b80810290506200070485620006af565b9450620006c4565b94509492505050565b5f82620007265760019050620007f8565b8162000735575f9050620007f8565b81600181146200074e576002811462000759576200078f565b6001915050620007f8565b60ff8411156200076e576200076d62000682565b5b8360020a91508482111562000788576200078762000682565b5b50620007f8565b5060208310610133831016604e8410600b8410161715620007c95782820a905083811115620007c357620007c262000682565b5b620007f8565b620007d88484846001620006bb565b92509050818404811115620007f257620007f162000682565b5b81810290505b9392505050565b5f6200080b8262000454565b9150620008188362000454565b9250620008477fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff848462000715565b905092915050565b5f6200085b8262000454565b9150620008688362000454565b9250828202620008788162000454565b9150828204841483151762000892576200089162000682565b5b5092915050565b620008a48162000454565b82525050565b5f602082019050620008bf5f83018462000899565b9291505056ff";

export const SEARCH_ITEMS = [
  { id: "deposit", title: "Gateway Deposit (Unified Balance)", category: "Core Products", desc: "kit.unifiedBalance.deposit() for cross-chain USDC inflow" },
  { id: "checkout", title: "Embeddable Checkout Widget", category: "Core Products", desc: "User-Controlled Wallet creation and XSS httpOnly sessions" },
  { id: "invoices", title: "B2B Invoices (Three-way Matching)", category: "Core Products", desc: "Create, approve, dispute, and settle invoices with early-pay discounts on-chain" },
  { id: "credit", title: "B2B Credit API & Underwriting", category: "Trade Credit", desc: "Corporate credit limits, scoring rating, and drawdowns" },
  { id: "payments", title: "Supplier Payouts (Batch & Schedule)", category: "Payments Engine", desc: "Bulk zero-gas payouts and scheduled payment routing" },
  { id: "treasury", title: "Treasury Swap & Yield Optimizations", category: "Treasury Management", desc: "Optimize idle USDC to USYC and CCTP cross-chain bridging" },
  { id: "fee", title: "Platform Fee Policy Configurator", category: "Infrastructure", desc: "setCustomFeePolicy split 90% Admin and 10% Arc Network" },
  { id: "webhooks", title: "Webhook Events Hub", category: "Infrastructure", desc: "Receive real-time notifications for payment/credit state changes" },
  { id: "templates", title: "Smart Contract ERC-20 Templates", category: "Developer Hub", desc: "Deploy audited standard tokens on Arc Testnet" },
  { id: "sdk", title: "Client SDK Downloads & API Status", category: "Developer Hub", desc: "TypeScript, Python, and Go libraries setup templates" },
];
