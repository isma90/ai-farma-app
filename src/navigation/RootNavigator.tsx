import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { AuthNavigator } from '@navigation/AuthNavigator';
import { AppNavigator } from '@navigation/AppNavigator';

export const RootNavigator = () => {
  const { isAuthenticated, isAnonymous, user } = useSelector((state: RootState) => state.auth);

  // If there's no user at all, show auth navigator
  if (!user) {
    return <AuthNavigator />;
  }

  // Otherwise show main app
  return <AppNavigator />;
};
