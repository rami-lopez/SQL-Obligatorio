import * as React from 'react';
import { Stack } from "expo-router";
import PaperProviderWrapper from './PaperProvider';

export default function RootLayout() {
  return (
    <PaperProviderWrapper>
      <Stack />
    </PaperProviderWrapper>
  );
}
