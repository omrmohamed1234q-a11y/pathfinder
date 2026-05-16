import LandingPage from './pages/LandingPage';
import ProgressPage from './pages/ProgressPage';
import SkillTreePage from './pages/SkillTreePage';
import CareerPathPage from './pages/CareerPathPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import FriendsPage from './pages/FriendsPage';
import AchievementsPage from './pages/AchievementsPage';
import { SkillTreeGeneratorPage } from './pages/SkillTreeGeneratorPage';
import { CareerPathGeneratorPage } from './pages/CareerPathGeneratorPage';
import { CustomQuizPage } from './pages/CustomQuizPage';
import { PricingPage } from './pages/PricingPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />,
    public: true,
  },
  {
    name: 'Generate Skill Tree',
    path: '/generate',
    element: <SkillTreeGeneratorPage />,
    public: true,
  },
  {
    name: 'Generate Career Path',
    path: '/generate-path',
    element: <CareerPathGeneratorPage />,
    public: true,
  },
  {
    name: 'Custom Quiz',
    path: '/quiz',
    element: <CustomQuizPage />,
    public: true,
  },
  {
    name: 'Pricing',
    path: '/pricing',
    element: <PricingPage />,
    public: true,
  },
  {
    name: 'Skill Tree',
    path: '/skill-tree/:topic',
    element: <SkillTreePage />,
    public: true,
  },
  {
    name: 'Career Path',
    path: '/career-path/:pathId',
    element: <CareerPathPage />,
    public: true,
  },
  {
    name: 'My Progress',
    path: '/progress',
    element: <ProgressPage />,
    public: true,
  },
  {
    name: 'Achievements',
    path: '/achievements',
    element: <AchievementsPage />,
    public: true,
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    element: <LeaderboardPage />,
    public: true,
  },
  {
    name: 'Profile',
    path: '/profile/:username?',
    element: <ProfilePage />,
    public: true,
  },
  {
    name: 'Marketplace',
    path: '/marketplace',
    element: <MarketplacePage />,
    public: true,
  },
  {
    name: 'Friends',
    path: '/friends',
    element: <FriendsPage />,
    public: true,
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <SettingsPage />,
    public: true,
  }
];
