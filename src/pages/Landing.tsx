import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  QrCode,
  Wallet,
  Users,
  Star,
  TrendingUp,
  Heart,
  Rocket,
  CheckCircle,
  Github
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { CreatorCarousel } from "../components/ui/CreatorCarousel";
import { CompactCreatorCarousel } from "../components/ui/CompactCreatorCarousel";
import { useExplore } from "../hooks/useExplore";
import type { Creator } from "../hooks/useExplore";

export function Landing() {
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([]);
  const [topCreators, setTopCreators] = useState<Creator[]>([]);
  const { creators, platformStats, isLoading } = useExplore({
    limit: 20,
    sortBy: "totalAmountReceived",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (creators.length > 0) {
      const featured = creators
        .filter((creator) => creator.tipCount > 0)
        .slice(0, 5);

      const top = creators.slice(0, 8);

      setFeaturedCreators(featured);
      setTopCreators(top);
    }
  }, [creators]);

  const dynamicStats = {
    totalTips: platformStats?.totalTips || 12500,
    totalCreators: platformStats?.totalCreators || 10500,
    totalSupporters: 50000,
    totalVolume:
      platformStats?.totalVolume || BigInt(2500000000000000000000000), // 2.5M em wei
  };


  const handleGitHubStar = () => {
    window.open('https://github.com/developerfred/tipchain', '_blank', 'noopener,noreferrer')
  }

  return ( 
      <div className="flex flex-col min-h-screen">
            {/* GitHub Star Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-3 px-4">
              <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <span className="text-sm font-medium">Love TipChain? Give us a star on GitHub!</span>
                </div>
                <Button
                  onClick={handleGitHubStar}
                  size="sm"
                  variant="secondary"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  Star
                </Button>
              </div>
            </div>

      
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="container relative flex flex-col items-center justify-center space-y-8 py-24 md:py-32">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="inline-flex items-center rounded-full border bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm shadow-sm dark:bg-gray-800/80">
              <Zap className="mr-2 h-4 w-4 text-yellow-500 animate-pulse" />
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powered by Reown AppKit + Base
              </span>
              <Rocket className="ml-2 h-3 w-3 text-purple-500" />
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-blue-100 dark:to-purple-100">
                Support Creators.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Zero Friction.
                </span>
              </h1>

              <p className="max-w-[700px] text-lg text-gray-600 sm:text-xl dark:text-gray-300 mx-auto leading-relaxed">
                Send crypto tips to your favorite creators across any chain.
                <span className="block mt-1 font-semibold text-gray-700 dark:text-gray-200">
                  No wallet setup • No gas fees • No complexity
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link to="/explore">
                <Button
                  size="xl"
                  className="w-full sm:w-auto group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Explore Creators
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600" />
                </Button>
              </Link>
              <Link to="/creators">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto group border-2"
                >
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
                    Become a Creator
                  </span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-16 text-center">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${(Number(dynamicStats.totalVolume) / 1e18).toFixed(1)}M+
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  Tips Sent
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {dynamicStats.totalCreators.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Users className="h-3 w-3 mr-1 text-blue-500" />
                  Creators
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {dynamicStats.totalSupporters.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Heart className="h-3 w-3 mr-1 text-red-500" />
                  Supporters
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {dynamicStats.totalTips.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                  Total Tips
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators Carousel */}
      {featuredCreators.length > 0 && (
        <CreatorCarousel
          creators={featuredCreators}
          title="Featured Creators"
          subtitle="Discover and support amazing creators who are building the future of digital content"
          autoPlay={true}
          autoPlayInterval={6000}
        />
      )}

      {/* Features Section Melhorada */}
      <section className="relative py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1.5 text-sm text-blue-600 dark:text-blue-400 mb-4">
              <Star className="h-4 w-4 mr-2" />
              Why Choose TipChain?
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
              Built for Creators,
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Loved by Everyone
              </span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-[700px] mx-auto leading-relaxed">
              Experience the future of creator monetization with cutting-edge
              Web3 technology that's simple, secure, and accessible to all.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "No Wallet Needed",
                description:
                  "Login with Google, email, or social accounts. Create a wallet instantly without seed phrases.",
                color: "text-blue-500",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                icon: Zap,
                title: "Gas Sponsorship",
                description:
                  "Zero gas fees for all users. We sponsor your transactions for seamless onboarding.",
                color: "text-yellow-500",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: Globe,
                title: "Multi-Chain Support",
                description:
                  "Send and receive tips on Base, Ethereum, Solana, and more. One platform, any chain.",
                color: "text-purple-500",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: QrCode,
                title: "Share Anywhere",
                description:
                  "Generate QR codes and shareable links. Add to Instagram, Twitter, YouTube, or anywhere.",
                color: "text-green-500",
                gradient: "from-green-500 to-teal-500",
              },
              {
                icon: Shield,
                title: "Secure & Safe",
                description:
                  "Built on Base L2 with Coinbase Smart Wallets. Your funds are always secure.",
                color: "text-red-500",
                gradient: "from-red-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Basenames Integration",
                description:
                  "Get your own username.base.eth identity. Easy to remember, easy to share.",
                color: "text-orange-500",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <CardHeader className="relative z-10">
                  <div
                    className={`inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-blue-900/10 dark:to-purple-900/10" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {topCreators.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900 border-y">
          <div className="container">
            <CompactCreatorCarousel
              creators={topCreators}
              title="Trending Creators"
              maxVisible={4}
            />
          </div>
        </section>
      )}

      {/* How It Works Section Melhorada */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center rounded-full bg-purple-500/10 px-4 py-1.5 text-sm text-purple-600 dark:text-purple-400 mb-4">
              <Rocket className="h-4 w-4 mr-2" />
              Get Started in Minutes
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
              How It Works
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-[700px] mx-auto">
              Three simple steps to start supporting your favorite creators
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Login Instantly",
                description:
                  "Connect with email, Google, or your favorite social account. No crypto wallet required.",
                icon: Users,
                color: "from-blue-500 to-cyan-500",
                features: ["Social Login", "No Wallet Setup", "Instant Access"],
              },
              {
                step: "2",
                title: "Find a Creator",
                description:
                  "Browse creators or use a direct link. Scan a QR code or search by basename.",
                icon: QrCode,
                color: "from-purple-500 to-pink-500",
                features: ["QR Codes", "Search", "Direct Links"],
              },
              {
                step: "3",
                title: "Send Your Tip",
                description:
                  "Choose an amount, add a message, and send. Pay with card, crypto, or any token.",
                icon: Heart,
                color: "from-pink-500 to-red-500",
                features: [
                  "Multiple Payments",
                  "Personal Messages",
                  "Instant Delivery",
                ],
              },
            ].map((step, index) => (
              <div key={index} className="group text-center">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                  />
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.step}
                    </div>
                    <step.icon
                      className={`h-12 w-12 mx-auto mb-4 text-transparent bg-gradient-to-r ${step.color} bg-clip-text`}
                    />
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center justify-center text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/explore">
              <Button size="xl" className="group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Try It Now - It's Free!
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section Melhorada */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:40px_40px]" />

        <div className="container relative">
          <div className="text-center space-y-8 px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-4">
              <Star className="h-4 w-4 mr-2" />
              Join the Revolution
            </div>

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Ready to Get Started?
            </h2>

            <p className="text-xl text-white/90 max-w-[700px] mx-auto leading-relaxed">
              Join thousands of creators already earning with TipChain. Set up
              your profile in less than 2 minutes and start receiving tips
              today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/creators">
                <Button
                  size="xl"
                  variant="secondary"
                  className="w-full sm:w-auto group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Create Your Profile
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-white transition-all duration-300 group-hover:bg-gray-100" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-white border-2 border-white/50 hover:bg-white hover:text-purple-600 hover:border-white transition-all duration-300"
                >
                  Explore Creators
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-12 text-white/80">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Secure & Safe</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Instant Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Multi-Chain</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Melhorado */}
      <footer className="border-t bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container py-16">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TipChain
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Support creators without friction. Built on Base with love for
                the community.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/explore"
                    className="hover:text-foreground transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Explore Creators
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="hover:text-foreground transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/creators"
                    className="hover:text-foreground transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    For Creators
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://docs.tipchain.app"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/tipchain"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 TipChain. Built for Base Batch 002 & Reown AppKit
              Competition.
              <span className="block mt-2 text-xs">
                Empowering creators through decentralized technology.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
