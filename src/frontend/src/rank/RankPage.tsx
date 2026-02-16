// Entry point for the Rank module that delegates to RankingScreen with proper actor and user context
import React from 'react';
import { useActor } from '../hooks/useActor';
import { useAppStore } from '../state/appStore';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { RankingScreen } from './RankingScreen';

export function RankPage() {
  const { actor } = useActor();
  const { state } = useAppStore();
  const { identity } = useInternetIdentity();
  
  const currentUserName = state.userProfile?.displayName || '';
  const currentUserId = identity?.getPrincipal().toString();

  return (
    <RankingScreen 
      actor={actor} 
      currentUserName={currentUserName}
      currentUserId={currentUserId}
    />
  );
}
