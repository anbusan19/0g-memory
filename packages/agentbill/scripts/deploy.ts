import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying AgentPayment to 0G Chain...');

  const AgentPayment = await ethers.getContractFactory('AgentPayment');
  const contract = await AgentPayment.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ AgentPayment deployed to: ${address}`);
  console.log(`🔍 ChainScan: https://chainscan.0g.ai/address/${address}`);
  console.log(`\nAdd to .env:\nNEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
