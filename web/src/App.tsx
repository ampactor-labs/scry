import { Routes, Route } from "react-router-dom";
import { WalletProvider } from "./wallet/WalletProvider.tsx";
import { Header } from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import { Home } from "./pages/Home.tsx";
import { Scan } from "./pages/Scan.tsx";

export function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan/:mint" element={<Scan />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
}
