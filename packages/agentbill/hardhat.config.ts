// @ts-ignore — ts-node uses tsconfig.hardhat.json for this file
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'cancun',
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    '0g-testnet': {
      url: 'https://evmrpc-testnet.0g.ai',
      chainId: 16602,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    '0g-mainnet': {
      url: 'https://evmrpc.0g.ai',
      chainId: 16661,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
