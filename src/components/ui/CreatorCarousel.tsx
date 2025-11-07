import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import type { Creator } from "../../hooks/useExplore";
import { formatEth } from "../../lib/utils";

interface CreatorCarouselProps {
  creators: Creator[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function CreatorCarousel({
  creators,
  title = "Featured Creators",
  subtitle = "Discover amazing creators to support",
  autoPlay = true,
  autoPlayInterval = 5000,
}: CreatorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === creators.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? creators.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || creators.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, creators.length, autoPlayInterval]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (!creators.length) return null;

  return (
    <section className="w-full py-12 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows */}
          {creators.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-0 shadow-lg hover:bg-background"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous slide</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-0 shadow-lg hover:bg-background"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next slide</span>
              </Button>
            </>
          )}

          {/* Carousel Content */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {creators.map((creator, index) => (
                <div key={creator.id} className="w-full flex-shrink-0 px-4">
                  <CreatorFeaturedCard
                    creator={creator}
                    isActive={index === currentIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          {creators.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {creators.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/explore">
            <Button size="lg" variant="outline">
              View All Creators
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Componente para o card em destaque
function CreatorFeaturedCard({
  creator,
  isActive,
}: {
  creator: Creator;
  isActive: boolean;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left Column - Creator Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={creator.avatarUrl || "/api/placeholder/80/80"}
                    alt={creator.displayName}
                    className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {creator.displayName}
                  </h3>
                  <p className="text-muted-foreground font-mono">
                    {creator.basename}.base.eth
                  </p>
                </div>
              </div>
            </div>

            {creator.bio && (
              <p className="text-lg leading-relaxed text-muted-foreground line-clamp-3">
                {creator.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatEth(BigInt(creator.totalAmountReceived || "0"), 2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Received
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {creator.tipCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Tips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {creator.tippedByCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Supporters</div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Link to={`/tip/${creator.basename}`} className="flex-1">
                <Button size="lg" className="w-full">
                  View Profile
                </Button>
              </Link>
              <Link to={`/tip/${creator.basename}`} className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  Send Tip
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-500" />

            {/* Network Badges */}
            <div className="absolute top-6 right-6 flex space-x-2">
              <div className="flex items-center space-x-1 bg-blue-500/20 px-3 py-1 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Base</span>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute bottom-8 left-8 transform rotate-12">
              <div className="bg-yellow-500/20 p-4 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {creator.tipCount || 0}x
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Tips Received
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl text-white text-center shadow-2xl">
                <div className="text-3xl font-bold">
                  {formatEth(BigInt(creator.totalAmountReceived || "0"), 0)}
                </div>
                <div className="text-sm opacity-90">Total Earned</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
