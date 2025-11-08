import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import type { Creator } from "../../hooks/useExplore";

interface CompactCreatorCarouselProps {
  creators: Creator[];
  title?: string;
  subtitle?: string;
  maxVisible?: number;
  autoPlay?: boolean;
  showStats?: boolean;
}

// Função para gerar avatar baseado no nome do creator
function generateAvatar(name: string, size: number = 40) {
  const colors = [
    "ff6b6b",
    "4ecdc4",
    "45b7d1",
    "96ceb4",
    "feca57",
    "ff9ff3",
    "54a0ff",
    "5f27cd",
    "00d2d3",
    "ff9f43",
    "10ac84",
    "ee5a24",
    "0984e3",
    "a29bfe",
    "fd79a8",
    "e17055",
  ];

  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const color = colors[Math.abs(hash) % colors.length];

  // Gerar iniciais
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=${size}&bold=true&font-size=0.8`;
}

// Componente de Avatar com fallback
function CreatorAvatar({
  creator,
  size = 40,
}: {
  creator: Creator;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);

  const avatarUrl =
    !imageError && creator.avatarUrl
      ? creator.avatarUrl
      : generateAvatar(creator.displayName || creator.basename, size);

  return (
    <div className="relative">
      <img
        src={avatarUrl}
        alt={creator.displayName}
        className={`h-${size} w-${size} rounded-lg object-cover border-2 border-white shadow-sm`}
        onError={() => setImageError(true)}
        loading="lazy"
      />
      {creator.tipCount > 0 && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold">
          <Star className="h-2 w-2 fill-current" />
        </div>
      )}
    </div>
  );
}

// Componente de Badge para stats
function StatsBadge({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center space-x-1">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className="text-xs font-medium">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function CompactCreatorCarousel({
  creators,
  title = "Top Creators",
  subtitle = "Most supported creators this week",
  maxVisible = 4,
  autoPlay = false,
  showStats = true,
}: CompactCreatorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= creators.length - maxVisible ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? Math.max(creators.length - maxVisible, 0)
        : prevIndex - 1,
    );
  };

  // Auto-play functionality
  useState(() => {
    if (!autoPlay || isPaused || creators.length <= maxVisible) return;

    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  });

  const visibleCreators = creators.slice(
    currentIndex,
    currentIndex + maxVisible,
  );

  if (!creators.length) {
    return (
      <div className="w-full py-8 text-center">
        <div className="text-muted-foreground">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">No creators yet</h3>
          <p className="text-sm">Be the first to join our platform!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <h3 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>
          )}
        </div>

        {creators.length > maxVisible && (
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {Array.from({
                length: Math.ceil(creators.length / maxVisible),
              }).map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / maxVisible) === index
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 w-4"
                      : "bg-gray-300 dark:bg-gray-600 w-1.5 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentIndex(index * maxVisible)}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="h-8 w-8 rounded-lg transition-all hover:scale-105 hover:shadow-sm"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="h-8 w-8 rounded-lg transition-all hover:scale-105 hover:shadow-sm"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Carousel Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleCreators.map((creator, index) => (
          <Link
            key={creator.id}
            to={`/tip/${creator.basename}`}
            className="block group"
          >
            <Card className="h-full border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardContent className="p-4 relative">
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <CreatorAvatar creator={creator} size={12} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {creator.displayName || creator.basename}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {creator.basename}.base.eth
                      </p>
                    </div>
                  </div>

                  {/* Bio truncada */}
                  {creator.bio && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                      {creator.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <StatsBadge
                        icon={Heart}
                        value={creator.tipCount || 0}
                        label="Tips"
                        color="text-red-500"
                      />

                      {creator.totalAmountReceived &&
                        BigInt(creator.totalAmountReceived) > 0 && (
                          <StatsBadge
                            icon={TrendingUp}
                            value={`${(Number(creator.totalAmountReceived) / 1e18).toFixed(1)}`}
                            label="ETH"
                            color="text-green-500"
                          />
                        )}
                    </div>

                    {/* Status Indicator */}
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        creator.tipCount > 10
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          : creator.tipCount > 0
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {creator.tipCount > 10 ? (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Popular
                        </>
                      ) : creator.tipCount > 0 ? (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        "New"
                      )}
                    </div>
                  </div>

                  {/* Progress bar para engagement */}
                  {creator.tipCount > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Engagement</span>
                        <span>{Math.min(creator.tipCount * 10, 100)}%</span>
                      </div>
                      <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(creator.tipCount * 10, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-lg transition-all duration-300 pointer-events-none" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mobile Indicators */}
      {creators.length > maxVisible && (
        <div className="flex justify-center mt-6 sm:hidden">
          <div className="flex space-x-2">
            {Array.from({
              length: Math.ceil(creators.length / maxVisible),
            }).map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / maxVisible) === index
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 w-6"
                    : "bg-gray-300 dark:bg-gray-600 w-2"
                }`}
                onClick={() => setCurrentIndex(index * maxVisible)}
              />
            ))}
          </div>
        </div>
      )}

      {/* View All CTA */}
      {creators.length > maxVisible && (
        <div className="text-center mt-8">
          <Link to="/explore">
            <Button variant="outline" size="sm" className="group">
              View All Creators
              <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
