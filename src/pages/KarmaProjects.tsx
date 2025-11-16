/**
 * Karma Projects Page
 * Browse and tip projects from Karma GAP
 */

import React, { useState } from 'react';
import { Search, ExternalLink, Rocket, Users, TrendingUp } from 'lucide-react';
import { useKarmaProjects, useKarmaProjectSearch, useKarmaProjectTip } from '@/hooks/useKarmaProjects';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { KarmaProject } from '@/services/karma.service';
import { formatCompactNumber } from '@/lib/formatters';
import { TipModal } from '@/components/TipModal';

export function KarmaProjects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<KarmaProject | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const { data: projects, isLoading, error } = useKarmaProjects({ limit: 50 });
  const { data: searchResults } = useKarmaProjectSearch(searchQuery);
  const { getProjectUrl } = useKarmaProjectTip();

  const displayProjects = searchQuery ? searchResults : projects;

  const handleOpenTipModal = (project: KarmaProject) => {
    setSelectedProject(project);
    setIsTipModalOpen(true);
  };

  const handleCloseTipModal = () => {
    setIsTipModalOpen(false);
    setSelectedProject(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading Karma projects..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load projects from Karma. Please try again later."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">
          Tip Projects on{' '}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Karma GAP
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Support innovative Web3 projects building the future. Browse projects
          from Karma's Grantee Accountability Protocol and tip directly.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6 text-center">
          <Rocket className="mx-auto mb-2 h-8 w-8 text-purple-600" />
          <div className="text-3xl font-bold">{projects?.length || 0}</div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </Card>
        <Card className="p-6 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-blue-600" />
          <div className="text-3xl font-bold">5K+</div>
          <div className="text-sm text-gray-600">Builders</div>
        </Card>
        <Card className="p-6 text-center">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <div className="text-3xl font-bold">$10M+</div>
          <div className="text-sm text-gray-600">Funding</div>
        </Card>
      </div>

      {/* Projects Grid */}
      {!displayProjects || displayProjects.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title={searchQuery ? 'No projects found' : 'No projects available'}
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Check back later for new projects'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              getProjectUrl={getProjectUrl}
              onTipClick={handleOpenTipModal}
            />
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <p className="mb-4 text-gray-600">
          Want to list your project on Karma GAP?
        </p>
        <Button
          onClick={() =>
            window.open('https://gap.karmahq.xyz', '_blank')
          }
          variant="outline"
        >
          Visit Karma GAP
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Tip Modal */}
      {selectedProject && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={handleCloseTipModal}
          creator={{
            address: selectedProject.owner?.address || (selectedProject as any).address || '',
            basename: selectedProject.slug || (selectedProject as any).basename || '',
            displayName: selectedProject.title || (selectedProject as any).displayName || 'Untitled Project',
            avatarUrl: selectedProject.logoUrl || '',
            isRegistered: false,
          }}
        />
      )}
    </div>
  );
}

/**
 * Project Card Component
 */
function ProjectCard({
  project,
  getProjectUrl,
  onTipClick,
}: {
  project: KarmaProject;
  getProjectUrl: (slug: string) => string;
  onTipClick: (project: KarmaProject) => void;
}) {
  // Handle both API structures
  const projectData = project as any;
  const title = project.title || projectData.displayName || 'Untitled Project';
  const slug = project.slug || projectData.basename || '';
  const bannerUrl = project.bannerUrl || projectData.bannerImageUrl;
  const logoUrl = project.logoUrl || projectData.imageUrl;
  const category = project.category || projectData.category || 'Other';
  const description = project.description || projectData.description || '';

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Banner */}
      {bannerUrl ? (
        <div className="h-32 overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
          <img
            src={bannerUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500" />
      )}

      {/* Content */}
      <div className="p-6">
        {/* Logo & Title */}
        <div className="mb-4 flex items-start gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={title}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
              {title.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 line-clamp-1">
              {title}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {category}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600 line-clamp-3">
          {description}
        </p>

        {/* Stats */}
        {project.funding && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">Raised:</span>
              <span className="ml-1 font-semibold text-gray-900">
                ${formatCompactNumber(parseFloat(project.funding.totalRaised))}
              </span>
            </div>
            {project.funding.goalAmount && (
              <div>
                <span className="text-gray-500">Goal:</span>
                <span className="ml-1 font-semibold text-gray-900">
                  ${formatCompactNumber(parseFloat(project.funding.goalAmount))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onTipClick(project)}
            className="flex-1"
            size="sm"
          >
            Send Tip
          </Button>
          <Button
            onClick={() => window.open(getProjectUrl(slug), '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
