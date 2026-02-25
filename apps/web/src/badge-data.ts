/**
 * Single source of truth for project badges.
 * Used by DemoBadges.tsx and should match README.md badge sections.
 */

const GITHUB_REPO = 'aram-devdocs/flappy-gouda';
const NPM_PACKAGE = 'flappy-gouda-game';
const SITE_URL = 'https://flappy-gouda.aramhammoudeh.com';

export interface BadgeDefinition {
  label: string;
  href: string;
  imgSrc: string;
  alt: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    label: 'View Flappy Gouda on GitHub',
    href: `https://github.com/${GITHUB_REPO}`,
    imgSrc:
      'https://img.shields.io/badge/GitHub-flappy--gouda-181717?logo=github&style=flat-square',
    alt: 'GitHub',
  },
  {
    label: 'View Flappy Gouda Storybook',
    href: `${SITE_URL}/storybook/`,
    imgSrc: 'https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&style=flat-square',
    alt: 'Storybook',
  },
  {
    label: 'View Flappy Gouda on npm',
    href: `https://www.npmjs.com/package/${NPM_PACKAGE}`,
    imgSrc: `https://img.shields.io/npm/v/${NPM_PACKAGE}?style=flat-square&logo=npm`,
    alt: 'npm',
  },
  {
    label: 'View CI status',
    href: `https://github.com/${GITHUB_REPO}/actions/workflows/ci.yml`,
    imgSrc: `https://img.shields.io/github/actions/workflow/status/${GITHUB_REPO}/ci.yml?branch=main&style=flat-square&label=CI`,
    alt: 'CI',
  },
  {
    label: 'MIT License',
    href: `https://github.com/${GITHUB_REPO}/blob/main/LICENSE`,
    imgSrc: 'https://img.shields.io/badge/License-MIT-blue?style=flat-square',
    alt: 'License: MIT',
  },
  {
    label: 'View bundle size',
    href: `https://bundlephobia.com/package/${NPM_PACKAGE}`,
    imgSrc: `https://img.shields.io/bundlephobia/minzip/${NPM_PACKAGE}?style=flat-square`,
    alt: 'Bundle Size',
  },
];
