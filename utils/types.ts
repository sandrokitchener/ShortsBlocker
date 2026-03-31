export type SupportedSite = 'youtube' | 'instagram' | 'facebook' | 'linkedin';

export interface PageState {
  site: SupportedSite;
  hostname: string;
  url: string;
  hiddenCount: number;
  placeholderCount: number;
  guardedLinkCount: number;
  directPathBlocked: boolean;
  lastScanAt: number;
}

export const siteLabels: Record<SupportedSite, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};
