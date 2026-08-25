import type { EventProvider, EsportsProvider } from "@/providers/types";
import { createPandaScoreProvider } from "@/providers/pandascore/pandascore-provider";

export type EsportsProviderKey = "pandascore_fixtures";

const registry: Record<EsportsProviderKey, () => EsportsProvider> = {
  pandascore_fixtures: createPandaScoreProvider,
};

export function getEsportsProvider(key: EsportsProviderKey = "pandascore_fixtures"): EsportsProvider {
  const factory = registry[key];
  if (!factory) {
    throw new Error(`Unknown esports provider: ${key}`);
  }
  return factory();
}

export function listEsportsProviders(): EsportsProviderKey[] {
  return Object.keys(registry) as EsportsProviderKey[];
}

export function asEventProvider(provider: EsportsProvider): EventProvider {
  return provider;
}
