import { Link } from "react-router-dom";
import {
  Wallet,
  Search,
  Send,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Coins,
  Users,
  Heart,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

export function HowItWorks() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            How TipChain Works
          </h1>
          <p className="text-xl text-muted-foreground">
            Supporting creators has never been easier. No wallets, no gas fees,
            no complexity.
          </p>
        </div>
      </section>

      {/* For Supporters */}
      <section className="container py-24 bg-muted/50">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">For Supporters</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Send tips to your favorite creators in three simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white text-xl font-bold">
                      1
                    </div>
                    <Wallet className="h-8 w-8 text-blue-500 opacity-20" />
                  </div>
                  <CardTitle>Login Instantly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with email, Google, or your favorite social account.
                    No crypto wallet or seed phrases required.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Email login</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Social accounts (Google, Discord, Apple)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Or use your existing wallet</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white text-xl font-bold">
                      2
                    </div>
                    <Search className="h-8 w-8 text-purple-500 opacity-20" />
                  </div>
                  <CardTitle>Find a Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Browse creators or use a direct link. Scan a QR code or
                    search by username.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Explore creators by category</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Scan QR codes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use direct profile links</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
            </div>

            {/* Step 3 */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white text-xl font-bold">
                      3
                    </div>
                    <Send className="h-8 w-8 text-pink-500 opacity-20" />
                  </div>
                  <CardTitle>Send Your Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Choose an amount, add a message, and send. Pay with card,
                    crypto, or any token.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Pay with credit card or crypto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Zero gas fees (we sponsor it!)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Add a personal message</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/explore">
              <Button size="lg" variant="gradient">
                Try It Now - It's Free!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Creators */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500 text-white mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">For Creators</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start receiving tips from your supporters today
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  1
                </div>
                <CardTitle>Create Your Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="ml-16">
              <p className="text-muted-foreground mb-4">
                Register with your basename (username.base.eth) and set up your
                profile in less than 2 minutes.
              </p>
              <div className="flex gap-2">
                <Link to="/creators">
                  <Button variant="outline" size="sm">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  2
                </div>
                <CardTitle>Share Your Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="ml-16">
              <p className="text-muted-foreground mb-4">
                Get your unique profile link and QR code. Share it on social
                media, your website, or anywhere you engage with your audience.
              </p>
              <div className="p-4 border rounded-lg bg-muted/50 font-mono text-sm">
                tipchain.app/tip/yourname
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  3
                </div>
                <CardTitle>Receive Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="ml-16">
              <p className="text-muted-foreground mb-4">
                Accept tips in ETH, stablecoins, or any token. Tips are sent
                directly to your wallet with a small 2.5% platform fee.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Coins className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Instant deposits to your wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Support for multiple tokens and chains</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track your earnings in real-time</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose TipChain?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge Web3 technology for the best user experience
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-500 mb-4" />
              <CardTitle>Gas Sponsorship</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We sponsor gas fees for all users, making it completely free to
                send and receive tips.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-blue-500 mb-4" />
              <CardTitle>Multi-Chain Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Send and receive tips on Base, Ethereum, Solana, Bitcoin, and
                more. One platform, any chain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-green-500 mb-4" />
              <CardTitle>Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built on Base L2 with Coinbase Smart Wallets. Your funds are
                always secure and under your control.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Wallet className="h-10 w-10 text-purple-500 mb-4" />
              <CardTitle>No Wallet Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Login with email or social accounts. Smart wallets are created
                automatically in the background.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Coins className="h-10 w-10 text-orange-500 mb-4" />
              <CardTitle>Token Swaps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in token swapping. Send any token and creators receive it
                in their preferred currency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-pink-500 mb-4" />
              <CardTitle>Basenames</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get your own username.base.eth identity. Easy to remember, easy
                to share.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Do I need a crypto wallet to use TipChain?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No! You can login with email or social accounts. A smart wallet
                will be created for you automatically. If you already have a
                wallet, you can connect it directly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Are there any fees?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                TipChain charges a 2.5% platform fee on all tips. Gas fees are
                sponsored by us, so you never pay for transactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                What cryptocurrencies are supported?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                TipChain supports ETH, USDC, and other ERC-20 tokens on Base,
                Ethereum, and other EVM chains. We also support Solana and
                Bitcoin through our multi-chain infrastructure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                How do I withdraw my tips?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tips are sent directly to your wallet. You have full control and
                can withdraw or transfer your funds anytime using your wallet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is TipChain secure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! TipChain is built on Base L2 (an Ethereum Layer 2) and uses
                Coinbase Smart Wallets. All smart contracts are audited and your
                funds are always under your control.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl my-24">
        <div className="text-center space-y-6 px-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Join thousands of creators and supporters using TipChain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/creators">
              <Button size="xl" variant="secondary">
                Become a Creator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button
                size="xl"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-purple-600"
              >
                Explore Creators
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
