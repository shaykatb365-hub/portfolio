// Receives visitor events from track.js and stores each one in Netlify Blobs.
// Stored per event: type, project, ref, a random visitor/session id, country/city
// (from Netlify's edge geo lookup), device class and referrer domain.
// No IP address, cookies or personal data are stored.
import { eventStore } from '../lib/store.mjs';

const TYPES = new Set([
  'pageview', 'case_open', 'case_close', 'video_play', 'category',
  'resume_open', 'resume_download', 'certs_open', 'cert_download',
  'share', 'click', 'leave', 'contact_sent',
]);

const str = (v, n = 80) => (typeof v === 'string' ? v.slice(0, n) : '');
const num = (v, max) => (Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : undefined);

export default async (req, context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body;
  try {
    const text = await req.text();
    if (text.length > 4000) return new Response('Too large', { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  if (!body || !TYPES.has(body.type)) return new Response('Bad request', { status: 400 });

  const ua = req.headers.get('user-agent') || '';
  if (/bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(ua)) return new Response(null, { status: 204 });
  const device = /mobi|android|iphone/i.test(ua) ? 'mobile' : /ipad|tablet/i.test(ua) ? 'tablet' : 'desktop';

  const now = new Date();
  const event = {
    type: body.type,
    at: now.toISOString(),
    ref: str(body.ref, 60),
    vid: str(body.vid, 24),
    sid: str(body.sid, 24),
    project: str(body.project, 40),
    detail: str(body.detail, 80),
    referrer: str(body.referrer, 80),
    firstVisit: body.firstVisit === true ? true : undefined,
    seconds: num(body.seconds, 6 * 3600),
    depth: num(body.depth, 100),
    maxSlide: num(body.maxSlide, 500),
    slides: num(body.slides, 500),
    video: num(body.video, 100),
    country: context?.geo?.country?.name || context?.geo?.country?.code || '',
    city: context?.geo?.city || '',
    device,
  };
  for (const k of Object.keys(event)) if (event[k] === undefined || event[k] === '') delete event[k];

  const day = now.toISOString().slice(0, 10);
  const key = `${day}/${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  await eventStore(context).setJSON(key, event);
  return new Response(null, { status: 204 });
};
