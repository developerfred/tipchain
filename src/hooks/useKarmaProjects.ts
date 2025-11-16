/**
 * React hooks for Karma HQ integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  karmaService,
  type KarmaProject,
  type KarmaMilestone,
  type KarmaUpdate,
  type KarmaGrantProgram,
} from '@/services/karma.service';
import { KarmaProjectCategory, KarmaProjectStatus } from '@/config/karma.config';

/**
 * Hook to fetch all Karma projects
 */
export function useKarmaProjects(params?: {
  category?: KarmaProjectCategory;
  status?: KarmaProjectStatus;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['karma-projects', params],
    queryFn: () => karmaService.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single Karma project
 */
export function useKarmaProject(id: string | undefined) {
  return useQuery({
    queryKey: ['karma-project', id],
    queryFn: () => (id ? karmaService.getProjectById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch Karma project by slug
 */
export function useKarmaProjectBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['karma-project-slug', slug],
    queryFn: () => (slug ? karmaService.getProjectBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search Karma projects
 */
export function useKarmaProjectSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ['karma-search', debouncedQuery],
    queryFn: () =>
      debouncedQuery ? karmaService.searchProjects(debouncedQuery) : [],
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch project milestones
 */
export function useKarmaProjectMilestones(projectId: string | undefined) {
  return useQuery({
    queryKey: ['karma-milestones', projectId],
    queryFn: () =>
      projectId ? karmaService.getProjectMilestones(projectId) : [],
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch project updates
 */
export function useKarmaProjectUpdates(projectId: string | undefined) {
  return useQuery({
    queryKey: ['karma-updates', projectId],
    queryFn: () => (projectId ? karmaService.getProjectUpdates(projectId) : []),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch grant programs
 */
export function useKarmaGrantPrograms() {
  return useQuery({
    queryKey: ['karma-grant-programs'],
    queryFn: () => karmaService.getGrantPrograms(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for Karma project tipping
 */
export function useKarmaProjectTip() {
  const canTipProject = useCallback(
    (project: KarmaProject, chainId: number) => {
      return karmaService.canTipOnNetwork(project, chainId);
    },
    [],
  );

  const getProjectWallet = useCallback((project: KarmaProject): string => {
    // Return project owner wallet for tips
    return project.owner.address;
  }, []);

  const getProjectUrl = useCallback((slug: string): string => {
    return karmaService.getProjectUrl(slug);
  }, []);

  return {
    canTipProject,
    getProjectWallet,
    getProjectUrl,
  };
}
