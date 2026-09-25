import React from 'react';
import { ThemeProvider, AnnouncementProvider } from '@tresnaid/atlas';
import '@tresnaid/atlas/styles.css';
import './index.css';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="classic" defaultMode="light">
      <AnnouncementProvider>
        {children}
      </AnnouncementProvider>
    </ThemeProvider>
  );
}

