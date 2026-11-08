// Private stats for stats.html. Requires the STATS_KEY environment variable
// (set it in Netlify: Site configuration > Environment variables) and the same
// value sent as the x-stats-key header.
import { eventStore } from '../lib/store.mjs';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function loadEvents(store, days) {
  const keys = [];
  const today = Date.now();
  for (let d = 0; d < days; d++) {
    const prefix = new Date(today - d * 864e5).toISOString().slice(0, 10) + '/';
    const { blobs } = await store.list({ prefix });
    for (const b of blobs) keys.push(b.key);
  }
  const events = [];
  for (let i = 0; i < keys.length; i += 50) {
    const batch = await Promise.all(keys.slice(i, i + 50).map((k) => store.get(k, { type: 'json' }).catch(() => null)));
    for (const e of batch) if (e) events.push(e);
  }
  events.sort((a, b) => (a.at < b.at ? -1 : 1));
  return events;
}

const inc = (obj, key, by = 1) => {
  if (!key) return;
  obj[key] = (obj[key] || 0) + by;
};

export function summarize(events) {
  const visitors = new Set();
  const sessions = new Map(); // sid -> {vid, ref, seconds, start, country, city, device, referrer}
  const daily = {};
  const projects = {}; // id -> {opens, visitors:Set, views: Map(sid -> {seconds, depth, slidePct, video})}
  const actions = {};
  const clicks = {};
  const refs = {};
  const countries = {};
  const referrers = {};
  const devices = {};

  for (const e of events) {
    const day = e.at.slice(0, 10);
    if (e.vid) visitors.add(e.vid);
    let s = sessions.get(e.sid);
    if (!s) {
      s = { vid: e.vid, ref: e.ref, start: e.at, seconds: 0, country: e.country, city: e.city, device: e.device };
      sessions.set(e.sid, s);
      daily[day] = daily[day] || { visitors: new Set(), sessions: 0 };
      daily[day].sessions++;
      inc(countries, e.country);
      inc(devices, e.device);
    }
    if (e.vid) (daily[day] = daily[day] || { visitors: new Set(), sessions: 0 }).visitors.add(e.vid);
    if (e.type === 'pageview' && e.referrer) inc(referrers, e.referrer);
    if (e.type === 'leave' && e.seconds > s.seconds) s.seconds = e.seconds;

    if (e.project && ['case_open', 'case_close', 'video_play'].includes(e.type)) {
      const p = (projects[e.project] = projects[e.project] || { opens: 0, visitors: new Set(), views: new Map() });
      const v = p.views.get(e.sid) || { seconds: 0, depth: 0, slidePct: null, video: 0 };
      if (e.type === 'case_open') {
        p.opens++;
        if (e.vid) p.visitors.add(e.vid);
      }
      if (e.type === 'case_close') {
        v.seconds += e.seconds || 0;
        v.depth = Math.max(v.depth, e.depth || 0);
        if (e.slides) v.slidePct = Math.max(v.slidePct || 0, Math.round(((e.maxSlide || 0) / e.slides) * 100));
        v.video = Math.max(v.video, e.video || 0);
      }
      if (e.type === 'video_play') v.video = Math.max(v.video, 1);
      p.views.set(e.sid, v);
    }

    if (['resume_open', 'resume_download', 'certs_open', 'cert_download', 'share', 'category', 'contact_sent'].includes(e.type)) inc(actions, e.type);
    if (e.type === 'click') inc(clicks, e.detail);

    if (e.ref) {
      const r = (refs[e.ref] = refs[e.ref] || {
        ref: e.ref, first: e.at, last: e.at, sessions: new Set(), visitors: new Set(),
        projects: {}, resumeOpened: false, resumeDownloaded: false, clicks: {}, seconds: 0, places: new Set(),
      });
      r.last = e.at;
      r.sessions.add(e.sid);
      if (e.vid) r.visitors.add(e.vid);
      if (e.country) r.places.add([e.city, e.country].filter(Boolean).join(', '));
      if (e.type === 'case_open') inc(r.projects, e.project);
      if (e.type === 'resume_open') r.resumeOpened = true;
      if (e.type === 'resume_download') r.resumeDownloaded = true;
      if (e.type === 'contact_sent') r.contacted = true;
      if (e.type === 'click') inc(r.clicks, e.detail);
    }
  }

  for (const r of Object.values(refs)) {
    r.seconds = [...r.sessions].reduce((t, sid) => t + (sessions.get(sid)?.seconds || 0), 0);
    r.sessions = r.sessions.size;
    r.visitors = r.visitors.size;
    r.places = [...r.places];
  }

  const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
  const projectRows = Object.entries(projects).map(([id, p]) => {
    const views = [...p.views.values()];
    const slideViews = views.filter((v) => v.slidePct !== null);
    return {
      id,
      opens: p.opens,
      visitors: p.visitors.size,
      avgSeconds: avg(views.map((v) => v.seconds).filter((x) => x > 0)),
      avgDepth: avg(views.map((v) => v.depth).filter((x) => x > 0)),
      avgSlidePct: avg(slideViews.map((v) => v.slidePct)),
      finishedSlides: slideViews.filter((v) => v.slidePct >= 95).length,
      videoPlays: views.filter((v) => v.video > 0).length,
      videoFinished: views.filter((v) => v.video >= 100).length,
    };
  });
  projectRows.sort((a, b) => b.opens - a.opens);

  const sessionSeconds = [...sessions.values()].map((s) => s.seconds).filter((x) => x > 0);

  return {
    totals: {
      visitors: visitors.size,
      sessions: sessions.size,
      avgSessionSeconds: avg(sessionSeconds),
      caseOpens: projectRows.reduce((t, p) => t + p.opens, 0),
      resumeDownloads: actions.resume_download || 0,
    },
    daily: Object.entries(daily)
      .map(([day, d]) => ({ day, visitors: d.visitors.size, sessions: d.sessions }))
      .sort((a, b) => (a.day < b.day ? -1 : 1)),
    projects: projectRows,
    actions,
    clicks,
    refs: Object.values(refs).sort((a, b) => (a.last < b.last ? 1 : -1)),
    countries,
    referrers,
    devices,
    recent: events.slice(-150).reverse(),
  };
}

export default async (req, context) => {
  const expected = Netlify.env.get('STATS_KEY');
  if (!expected) return json({ error: 'STATS_KEY is not set in Netlify environment variables yet.' }, 503);
  if (!sameKey(req.headers.get('x-stats-key') || '', expected)) return json({ error: 'Wrong key.' }, 401);

  const url = new URL(req.url);
  const days = Math.max(1, Math.min(90, parseInt(url.searchParams.get('days') || '30', 10) || 30));
  const events = await loadEvents(eventStore(context), days);
  return json({ days, generatedAt: new Date().toISOString(), ...summarize(events) });
};
