/**
 * Karma HQ Integration Service
 * Provides functionality to interact with Karma GAP projects
 */

import {
  KARMA_API_BASE_URL,
  KARMA_ENDPOINTS,
  KARMA_GAP_URL,
  KarmaProjectCategory,
  KarmaProjectStatus,
} from '@/config/karma.config';

export interface KarmaProject {
  id: string;
  uid: string;
  slug: string;
  title: string;
  description: string;
  category: KarmaProjectCategory;
  status: KarmaProjectStatus;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    address: string;
    name?: string;
    avatarUrl?: string;
  };
  team?: Array<{
    address: string;
    name?: string;
    role?: string;
  }>;
  funding?: {
    totalRaised: string;
    currency: string;
    goalAmount?: string;
  };
  milestones?: KarmaMilestone[];
  tags?: string[];
}

export interface KarmaMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  createdAt: string;
}

export interface KarmaUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface KarmaGrantProgram {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  totalFunding: string;
  projectCount: number;
}

export class KarmaService {
  private baseUrl: string;

  constructor(baseUrl: string = KARMA_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all projects from Karma
   */
  async getProjects(params?: {
    category?: KarmaProjectCategory;
    status?: KarmaProjectStatus;
    limit?: number;
    offset?: number;
  }): Promise<KarmaProject[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(
        `${this.baseUrl}${KARMA_ENDPOINTS.PROJECTS}?${queryParams}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error fetching Karma projects:', error);
      return [];
    }
  }

  /**
   * Fetch a single project by ID
   */
  async getProjectById(id: string): Promise<KarmaProject | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}${KARMA_ENDPOINTS.PROJECT_BY_ID(id)}`,
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      const data = await response.json();
      return data.project || null;
    } catch (error) {
      console.error('Error fetching Karma project:', error);
      return null;
    }
  }

  /**
   * Fetch a project by slug
   */
  async getProjectBySlug(slug: string): Promise<KarmaProject | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}${KARMA_ENDPOINTS.PROJECT_BY_SLUG(slug)}`,
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      const data = await response.json();
      return data.project || null;
    } catch (error) {
      console.error('Error fetching Karma project by slug:', error);
      return null;
    }
  }

  /**
   * Search projects by name or description
   */
  async searchProjects(query: string): Promise<KarmaProject[]> {
    try {
      const projects = await this.getProjects();
      const lowerQuery = query.toLowerCase();

      return projects.filter(
        (project) =>
          project.title.toLowerCase().includes(lowerQuery) ||
          project.description.toLowerCase().includes(lowerQuery) ||
          project.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      );
    } catch (error) {
      console.error('Error searching Karma projects:', error);
      return [];
    }
  }

  /**
   * Get project milestones
   */
  async getProjectMilestones(projectId: string): Promise<KarmaMilestone[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${KARMA_ENDPOINTS.MILESTONES(projectId)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch milestones: ${response.statusText}`);
      }

      const data = await response.json();
      return data.milestones || [];
    } catch (error) {
      console.error('Error fetching project milestones:', error);
      return [];
    }
  }

  /**
   * Get project updates
   */
  async getProjectUpdates(projectId: string): Promise<KarmaUpdate[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${KARMA_ENDPOINTS.UPDATES(projectId)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch updates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.updates || [];
    } catch (error) {
      console.error('Error fetching project updates:', error);
      return [];
    }
  }

  /**
   * Get grant programs
   */
  async getGrantPrograms(): Promise<KarmaGrantProgram[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${KARMA_ENDPOINTS.GRANT_PROGRAMS}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch grant programs: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.programs || [];
    } catch (error) {
      console.error('Error fetching grant programs:', error);
      return [];
    }
  }

  /**
   * Get project URL on Karma GAP
   */
  getProjectUrl(slug: string): string {
    return `${KARMA_GAP_URL}/project/${slug}`;
  }

  /**
   * Check if project accepts tips on given network
   */
  canTipOnNetwork(project: KarmaProject, chainId: number): boolean {
    // For now, assume all projects can receive tips on supported networks
    // This could be enhanced to check project-specific network preferences
    return true;
  }
}

/**
 * Create Karma service instance
 */
export function createKarmaService(): KarmaService {
  return new KarmaService();
}

// Export singleton instance
export const karmaService = createKarmaService();
