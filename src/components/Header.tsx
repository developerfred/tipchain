import { Link } from "react-router-dom";
import { Coins, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { useAccount } from "wagmi";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">TipChain</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/explore"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Explore Creators
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            How It Works
          </Link>
          {isConnected && (
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/scan"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            TipScan
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isConnected ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  My Profile
                </Button>
              </Link>
              <appkit-button />
            </>
          ) : (
            <>
              <Link to="/creators">
                <Button variant="outline" size="sm">
                  Become a Creator
                </Button>
              </Link>
              <appkit-button />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col space-y-4 py-4">
            <Link
              to="/explore"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Creators
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/scan"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              TipScan
            </Link>
            {isConnected && (
              <Link
                to="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-4 space-y-2">
              {isConnected ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      My Profile
                    </Button>
                  </Link>
                  <appkit-button />
                </>
              ) : (
                <>
                  <Link to="/creators" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Become a Creator
                    </Button>
                  </Link>
                  <div className="w-full">
                    <appkit-button />
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
