import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

interface BunkableClassesResult {
  maxBunkableClasses: number;
  requiredPercentage: number;
  isBelowRequired: boolean;
}

export function useBunkableClasses(attendedClasses: number, totalClasses: number) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<BunkableClassesResult>({
    queryKey: ['bunkableClasses', attendedClasses, totalClasses],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      // Fetch required percentage
      const requiredPercentage = await actor.getRequiredAttendancePercentage();
      
      // Calculate max bunkable classes
      const maxBunkable = await actor.calculateMaxBunkableClasses(
        BigInt(attendedClasses),
        BigInt(totalClasses)
      );

      // Determine if below required
      const currentPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
      const isBelowRequired = currentPercentage < Number(requiredPercentage);

      return {
        maxBunkableClasses: Number(maxBunkable),
        requiredPercentage: Number(requiredPercentage),
        isBelowRequired,
      };
    },
    enabled: !!actor && !actorFetching && totalClasses > 0,
    retry: 1,
    staleTime: 0, // Always refetch when query key changes
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}
