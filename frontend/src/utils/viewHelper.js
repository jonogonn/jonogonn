import { getEffectiveViews } from '../config/viewConfig';

/**
 * View count formatting helper for Jonogon News
 * Accepts either an article object or a numeric view count.
 * Formats nicely with Bengali locale digits and commas (e.g., ১,৪২০, ২,৩৪০).
 */
export function formatViewsBn(viewsOrArticle, isBn = true) {
  let val = 1;
  if (typeof viewsOrArticle === 'object' && viewsOrArticle !== null) {
    val = getEffectiveViews(viewsOrArticle);
  } else {
    val = parseInt(viewsOrArticle || 0, 10);
  }
  if (!val || val < 1) val = 1;

  if (isBn) {
    return val.toLocaleString('bn-BD');
  }
  return val.toLocaleString('en-US');
}
