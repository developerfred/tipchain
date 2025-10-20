import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Globe, QrCode, Wallet, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'

export function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-8 py-24 md:py-32">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <Zap className="mr-2 h-4 w-4 text-yellow-500" />
            <span className="font-medium">Powered by Reown AppKit + Base</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Support Creators.
            <br />
            <span className="gradient-text">Zero Friction.</span>
          </h1>
          
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Send crypto tips to your favorite creators across any chain. 
            No wallet setup, no gas fees, no complexity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/explore">
              <Button size="xl" className="w-full sm:w-auto">
                Explore Creators
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/creators">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Become a Creator
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 text-center">
            <div>
              <div className="text-3xl font-bold">$2.5M+</div>
              <div className="text-sm text-muted-foreground">Tips Sent</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-muted-foreground">Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-muted-foreground">Supporters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Why TipChain?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-[700px] mx-auto">
            Built for everyone. Powered by cutting-edge Web3 technology.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Wallet className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>No Wallet Needed</CardTitle>
              <CardDescription>
                Login with Google, email, or any social account. 
                Create a wallet instantly without seed phrases.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-500 mb-2" />
              <CardTitle>Gas Sponsorship</CardTitle>
              <CardDescription>
                Zero gas fees for all users. We sponsor your first transactions 
                to make onboarding seamless.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Multi-Chain Support</CardTitle>
              <CardDescription>
                Send and receive tips on Base, Ethereum, Solana, Bitcoin, 
                and more. One platform, any chain.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <QrCode className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Share Anywhere</CardTitle>
              <CardDescription>
                Generate QR codes and shareable links. 
                Add to Instagram, Twitter, YouTube, or anywhere.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-red-500 mb-2" />
              <CardTitle>Secure & Safe</CardTitle>
              <CardDescription>
                Built on Base L2 with Coinbase Smart Wallets. 
                Your funds are always secure and under your control.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Basenames Integration</CardTitle>
              <CardDescription>
                Get your own username.base.eth identity. 
                Easy to remember, easy to share.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-[700px] mx-auto">
            Three simple steps to start tipping
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold">Login Instantly</h3>
            <p className="text-muted-foreground">
              Connect with email, Google, or your favorite social account. 
              No crypto wallet required.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold">Find a Creator</h3>
            <p className="text-muted-foreground">
              Browse creators or use a direct link. 
              Scan a QR code or search by basename.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500 text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold">Send Your Tip</h3>
            <p className="text-muted-foreground">
              Choose an amount, add a message, and send. 
              Pay with card, crypto, or any token.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button size="xl" variant="gradient">
            Try It Now - It's Free!
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl my-24">
        <div className="text-center space-y-6 px-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="text-lg max-w-[700px] mx-auto opacity-90">
            Join thousands of creators already earning with TipChain. 
            Set up your profile in less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/creators">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                Create Your Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button 
                size="xl" 
                variant="outline" 
                className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-purple-600"
              >
                Explore Creators
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">TipChain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Support creators without friction. Built on Base.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/explore" className="hover:text-foreground">Explore</Link></li>
                <li><Link to="/how-it-works" className="hover:text-foreground">How It Works</Link></li>
                <li><Link to="/creators" className="hover:text-foreground">For Creators</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://docs.tipchain.app" className="hover:text-foreground">Documentation</a></li>
                <li><a href="https://github.com/tipchain" className="hover:text-foreground">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 TipChain. Built for Base Batch 002 & Reown AppKit Competition.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}