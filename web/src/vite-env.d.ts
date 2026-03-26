/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOKENSAFE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_TREASURY_WALLET: string;
  readonly VITE_USDC_MINT: string;
  readonly VITE_SOLANA_NETWORK: string;
  readonly VITE_PAYMENT_AMOUNT: string;
  readonly VITE_HELIUS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
