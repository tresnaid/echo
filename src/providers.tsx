import React from 'react';
import { ThemeProvider, AnnouncementProvider } from '@atlas/ds';
import '@atlas/ds/styles.css';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="atlas" defaultMode="light">
      <AnnouncementProvider>
        {children}
      </AnnouncementProvider>
    </ThemeProvider>
  );
}
