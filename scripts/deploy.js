const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { createWalletClient, createPublicClient, http, formatUnits } = require('viem');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');
const { arcTestnet } = require('viem/chains');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// Helper to update env file
function updateEnv(key, value) {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }
  
  // Use regex that supports both quoted and unquoted values
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}="${value}"`);
  } else {
    content += `\n${key}="${value}"`;
  }
  fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
  console.log(`Updated env var: ${key} = ${value}`);
}

// Compile a Solidity file using local solc
function compileContract(fileName, contractClassName) {
  const filePath = path.join(projectRoot, 'contracts', fileName);
  console.log(`Reading contract file: ${filePath}`);
  const sourceCode = fs.readFileSync(filePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: {
        content: sourceCode
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object']
        }
      }
    }
  };

  console.log(`Compiling ${fileName}...`);
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    output.errors.forEach(err => {
      console.log(err.formattedMessage);
      if (err.severity === 'error') {
        hasError = true;
      }
    });
    if (hasError) {
      throw new Error(`Solidity compilation failed for ${fileName}`);
    }
  }

  const contractObj = output.contracts[fileName][contractClassName];
  return {
    abi: contractObj.abi,
    bytecode: '0x' + contractObj.evm.bytecode.object
  };
}

async function main() {
  // 1. Ensure private key exists, otherwise generate one
  let privateKey = '';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^MERCHANT_PRIVATE_KEY=["']?(0x[a-fA-F0-9]{64})?["']?/m);
    if (match && match[1]) {
      privateKey = match[1];
    }
  }

  if (!privateKey) {
    console.log('No MERCHANT_PRIVATE_KEY found in .env.local.');
    console.log('Generating a new private key...');
    privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    console.log(`Generated Address: ${account.address}`);
    updateEnv('MERCHANT_PRIVATE_KEY', privateKey);
    console.log('\n================================================================');
    console.log('ACTION REQUIRED:');
    console.log(`Please fund the address ${account.address} with USDC from the Arc faucet:`);
    console.log('https://faucet.circle.com');
    console.log('Then, re-run this deployment script.');
    console.log('================================================================\n');
    process.exit(0);
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`Using Merchant Account: ${account.address}`);

  // 2. Compile Contracts (Do this first to verify code correctness)
  console.log('Compiling contracts...');
  let escrowArtifact, invoiceArtifact;
  try {
    escrowArtifact = compileContract('BizFlowEscrow.sol', 'BizFlowEscrow');
    invoiceArtifact = compileContract('BizFlowInvoice.sol', 'BizFlowInvoice');
    console.log('Solidity compilation successful!');
  } catch (err) {
    console.error('Compilation failed:', err.message);
    process.exit(1);
  }

  // 3. Connect to Arc Testnet and check balance
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network')
  });

  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network')
  });

  console.log('Checking balance on Arc Testnet...');
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Native gas balance: ${formatUnits(balance, 18)} USDC`);

  if (balance === 0n) {
    console.log('\n================================================================');
    console.log('INSUFFICIENT FUNDS:');
    console.log(`Account ${account.address} has 0 balance.`);
    console.log('Please request native USDC (gas token) from the Arc Faucet:');
    console.log('https://faucet.circle.com');
    console.log('================================================================\n');
    process.exit(1);
  }

  // 4. Deploy BizFlowEscrow
  console.log('Deploying BizFlowEscrow...');
  const escrowDeployHash = await walletClient.deployContract({
    abi: escrowArtifact.abi,
    bytecode: escrowArtifact.bytecode,
    args: [USDC_ADDRESS]
  });
  console.log(`Escrow Deployment Transaction Hash: ${escrowDeployHash}`);
  console.log('Waiting for confirmation...');
  const escrowReceipt = await publicClient.waitForTransactionReceipt({ hash: escrowDeployHash });
  const escrowAddress = escrowReceipt.contractAddress;
  console.log(`BizFlowEscrow deployed at: ${escrowAddress}`);

  // 5. Deploy BizFlowInvoice
  console.log('Deploying BizFlowInvoice...');
  const invoiceDeployHash = await walletClient.deployContract({
    abi: invoiceArtifact.abi,
    bytecode: invoiceArtifact.bytecode,
    args: [USDC_ADDRESS]
  });
  console.log(`Invoice Deployment Transaction Hash: ${invoiceDeployHash}`);
  console.log('Waiting for confirmation...');
  const invoiceReceipt = await publicClient.waitForTransactionReceipt({ hash: invoiceDeployHash });
  const invoiceAddress = invoiceReceipt.contractAddress;
  console.log(`BizFlowInvoice deployed at: ${invoiceAddress}`);

  // 6. Update env configuration
  console.log('Updating .env.local with deployed contract addresses...');
  updateEnv('ESCROW_CONTRACT_ADDRESS', escrowAddress);
  updateEnv('INVOICE_CONTRACT_ADDRESS', invoiceAddress);

  console.log('\n================================================================');
  console.log('DEPLOYMENT COMPLETE!');
  console.log(`BizFlowEscrow:  ${escrowAddress}`);
  console.log(`BizFlowInvoice: ${invoiceAddress}`);
  console.log('ArcScan Explorer Links:');
  console.log(`  - Escrow:  https://testnet.arcscan.app/address/${escrowAddress}`);
  console.log(`  - Invoice: https://testnet.arcscan.app/address/${invoiceAddress}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Deployment script crashed:', err);
  process.exit(1);
});
