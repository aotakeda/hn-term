import { HNApiStoryType } from '../types';

export const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

export const STORY_ENDPOINTS: Record<HNApiStoryType, string> = {
  top: `${HN_API_BASE}/topstories.json`,
  new: `${HN_API_BASE}/newstories.json`,
  show: `${HN_API_BASE}/showstories.json`,
  ask: `${HN_API_BASE}/askstories.json`,
  jobs: `${HN_API_BASE}/jobstories.json`,
};