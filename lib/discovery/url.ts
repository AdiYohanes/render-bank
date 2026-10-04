// Shared URL state is implemented in plain JavaScript so Node's test runner exercises the same parser.
export { discoveryState, discoveryHref, discoveryWindow } from "./url.mjs";

export type DiscoveryState = {
  q: string;
  category: string;
  model: string;
  orientation: string;
  access: string;
  page: number;
};
