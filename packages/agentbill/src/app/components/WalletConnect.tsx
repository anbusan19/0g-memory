'use client';
import { useState, useEffect, useCallback } from 'react';

interface Props {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

const OG_TESTNET = {
  chainId: '0x40DA', // 16602
  chainName: '0G Galileo Testnet',
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

export function WalletConnect({ onConnect, onDisconnect }: Props) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
    setWrongNetwork(chainId !== OG_TESTNET.chainId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        onConnect(accounts[0]);
        checkNetwork();
      }
    });

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) { setAddress(null); onDisconnect(); }
      else { setAddress(accounts[0]); onConnect(accounts[0]); }
    };
    const handleChainChanged = () => checkNetwork();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [onConnect, onDisconnect, checkNetwork]);

  async function switchToOG() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: OG_TESTNET.chainId }],
      });
    } catch (e: unknown) {
      if ((e as { code?: number }).code === 4902) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [OG_TESTNET] });
      }
    }
    setWrongNetwork(false);
  }

  async function connect() {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask to use AgentBill.');
      return;
    }
    setConnecting(true);
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      onConnect(accounts[0]);
      await checkNetwork();
    } catch {
      // user rejected
    } finally {
      setConnecting(false);
    }
  }

  function disconnect() {
    setAddress(null);
    onDisconnect();
  }

  if (address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {wrongNetwork && (
          <div className="hl" style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.08)', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b', letterSpacing: '0.06em' }}>
              WRONG NETWORK — Switch to 0G Galileo Testnet
            </span>
            <button
              onClick={switchToOG}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b', background: 'none', border: '1px solid rgba(245,158,11,0.4)', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.06em' }}
            >
              Switch Network →
            </button>
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', border: 'var(--border-lg)', background: 'var(--og-green-dim)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--og-green)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--og-green)', letterSpacing: '0.04em' }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.04em' }}>
              0G Galileo
            </span>
          </div>
          <button
            onClick={disconnect}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="btn-primary"
      style={{ width: '100%', textAlign: 'center', opacity: connecting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
    >
      {connecting ? (
        <><span className="spin">◌</span> Connecting...</>
      ) : (
        '→ Connect Wallet'
      )}
    </button>
  );
}
