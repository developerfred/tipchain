import { useState } from 'react'
import { TrendingUp, Users, Zap, Globe, Shield, Rocket, Heart, Star, ArrowRight, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function InvestorDeck() {
    const [activeSlide, setActiveSlide] = useState(0)

    const slides = [
        {
            title: "TipChain - Venmo for Web3",
            subtitle: "Send crypto tips to your favorite creators",
            stats: [                
                { label: "Active Creators", value: "150+" },
                { label: "Chains Supported", value: "5+" }
            ]
        },
        {
            title: "The Problem We Solve",
            points: [
                "Onboarding Complexity: 99% of users don't have crypto wallets",
                "Gas Fee Barriers: Fees often exceed tip amounts",
                "Multi-Chain Fragmentation: Creators scattered across different chains",
                "Poor User Experience: Existing tools feel like developer products"
            ]
        },
        {
            title: "Our Solution",
            features: [
                {
                    icon: <Zap className="h-6 w-6" />,
                    title: "Zero-Friction Onboarding",
                    description: "Login with email/Google, no wallet needed"
                },
                {
                    icon: <Shield className="h-6 w-6" />,
                    title: "Gas-Free Experience",
                    description: "We sponsor ALL gas fees - creators keep 97.5%"
                },
                {
                    icon: <Globe className="h-6 w-6" />,
                    title: "True Multi-Chain",
                    description: "Send from any chain, receive on preferred chain"
                }
            ]
        },
        {
            title: "Market Opportunity",
            metrics: [
                { label: "TAM", value: "200M+", description: "Global content creators" },
                { label: "SAM", value: "50M", description: "Active monetization seekers" },
                { label: "SOM", value: "1M", description: "Base ecosystem + early adopters" }
            ]
        },
        {
            title: "Competitive Advantage",
            advantages: [
                {
                    feature: "No Wallet Needed",
                    tipchain: true,
                    competitors: [true, false, false, false]
                },
                {
                    feature: "Multi-Chain Support",
                    tipchain: true,
                    competitors: [false, false, false, false]
                },
                {
                    feature: "Gas-Free",
                    tipchain: true,
                    competitors: [false, false, false, false]
                },
                {
                    feature: "Fees",
                    tipchain: "2.5%",
                    competitors: ["5-10%", "~1%", "varies", "10%"]
                }
            ]
        },
        {
            title: "Traction & Validation",
            achievements: [
                "Alpha Build: 10+ successful test tips with zero failures",
                "Onboarding Time: 32 seconds average vs 30+ minutes competitors",
                "Creator Take-Home: 97.5% vs 70% on Web2 platforms",
                "User Satisfaction: 4.6/5 from initial testing"
            ]
        },
        {
            title: "Technology Stack",
            tech: [
                { name: "Base L2", description: "Ultra-low cost transactions" },
                { name: "Reown AppKit", description: "Social login & smart wallets" },
                { name: "React + TypeScript", description: "Modern frontend framework" },
                { name: "Solidity", description: "Smart contract development" }
            ]
        },
        {
            title: "Team & Next Steps",
            team: [
                { role: "Founder", experience: "Full-stack developer with 5+ years in Web3" },
                { role: "Advisors", experience: "Base ecosystem experts & creator economy specialists" }
            ],
            roadmap: [
                "Q3 2025: Launch MVP & onboard first 50 creators",
                "Q3 2025: Farcaster integration & referral program",
                "Q1 2026: Multi-chain expansion & mobile app"
            ]
        }
    ]

    const currentSlide = slides[activeSlide]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
            <div className="container max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">TipChain Investor Deck</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Revolutionizing creator monetization with zero-friction crypto tipping
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="flex gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${activeSlide === index ? 'bg-primary' : 'bg-muted'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        {/* Slide 1: Hero */}
                        {activeSlide === 0 && (
                            <div className="text-center space-y-6">
                                <div className="text-6xl mb-4">💰</div>
                                <h2 className="text-3xl font-bold">{currentSlide.title}</h2>
                                <p className="text-xl text-muted-foreground">{currentSlide.subtitle}</p>
                                <div className="grid grid-cols-3 gap-4 mt-8">
                                    {currentSlide.stats?.map((stat, index) => (
                                        <div key={index} className="text-center">
                                            <div className="text-2xl font-bold text-primary">{stat.value}</div>
                                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Slide 2: Problem */}
                        {activeSlide === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>
                                <div className="grid gap-4">
                                    {currentSlide.points?.map((point, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                            <p className="text-lg">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Slide 3: Solution */}
                        {activeSlide === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {currentSlide.features?.map((feature, index) => (
                                        <Card key={index} className="text-center">
                                            <CardContent className="pt-6">
                                                <div className="text-primary mb-4 flex justify-center">
                                                    {feature.icon}
                                                </div>
                                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Slide 4: Market */}
                        {activeSlide === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {currentSlide.metrics?.map((metric, index) => (
                                        <Card key={index} className="text-center">
                                            <CardContent className="pt-6">
                                                <div className="text-3xl font-bold text-primary mb-2">
                                                    {metric.value}
                                                </div>
                                                <div className="font-semibold mb-1">{metric.label}</div>
                                                <p className="text-sm text-muted-foreground">{metric.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Slide 5: Competition */}
                        {activeSlide === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3">Feature</th>
                                                <th className="text-center py-3">TipChain</th>
                                                <th className="text-center py-3">Ko-fi</th>
                                                <th className="text-center py-3">Tally</th>
                                                <th className="text-center py-3">Superfluid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSlide.advantages?.map((advantage, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-3 font-medium">{advantage.feature}</td>
                                                    <td className="text-center py-3">
                                                        {typeof advantage.tipchain === 'boolean' ? (
                                                            advantage.tipchain ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : "❌"
                                                        ) : (
                                                            <span className="font-semibold">{advantage.tipchain}</span>
                                                        )}
                                                    </td>
                                                    {advantage.competitors.map((comp, compIndex) => (
                                                        <td key={compIndex} className="text-center py-3">
                                                            {typeof comp === 'boolean' ? (
                                                                comp ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : "❌"
                                                            ) : (
                                                                <span>{comp}</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Slide 6: Traction */}
                        {activeSlide === 5 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>
                                <div className="grid gap-4">
                                    {currentSlide.achievements?.map((achievement, index) => (
                                        <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-green-50">
                                            <Star className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <p className="text-lg">{achievement}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Slide 7: Technology */}
                        {activeSlide === 6 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {currentSlide.tech?.map((tech, index) => (
                                        <Card key={index}>
                                            <CardContent className="pt-6">
                                                <h3 className="font-semibold mb-2">{tech.name}</h3>
                                                <p className="text-sm text-muted-foreground">{tech.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Slide 8: Team & Roadmap */}
                        {activeSlide === 7 && (
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold text-center mb-8">{currentSlide.title}</h2>

                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Team</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {currentSlide.team?.map((member, index) => (
                                            <Card key={index}>
                                                <CardContent className="pt-6">
                                                    <h4 className="font-semibold mb-2">{member.role}</h4>
                                                    <p className="text-sm text-muted-foreground">{member.experience}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Roadmap</h3>
                                    <div className="space-y-3">
                                        {currentSlide.roadmap?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <Rocket className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                <p className="text-lg">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                        disabled={activeSlide === 0}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="https://github.com/developerfred/tipchain" target="_blank" rel="noopener noreferrer">
                                GitHub
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="https://tipchain.aipop.fun" target="_blank" rel="noopener noreferrer">
                                Live Demo
                            </a>
                        </Button>
                    </div>

                    <Button
                        onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                        disabled={activeSlide === slides.length - 1}
                    >
                        {activeSlide === slides.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Quick Stats Footer */}
                <div className="mt-12 grid grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold">97.5%</div>
                        <div className="text-sm text-muted-foreground">Creator Take-Home</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">32s</div>
                        <div className="text-sm text-muted-foreground">First Tip Time</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">5+</div>
                        <div className="text-sm text-muted-foreground">Chains</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">2.5%</div>
                        <div className="text-sm text-muted-foreground">Platform Fee</div>
                    </div>
                </div>
            </div>
        </div>
    )
}