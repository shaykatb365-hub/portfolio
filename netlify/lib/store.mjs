import { getStore } from '@netlify/blobs';

// Deploy previews and branch deploys use a separate store so testing never
// pollutes the real numbers.
export function eventStore(context) {
  const env = context?.deploy?.context;
  return getStore(!env || env === 'production' ? 'events' : 'events-preview');
}
