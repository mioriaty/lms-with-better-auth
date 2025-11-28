/**
 * Estimates the reading time of content based on words per minute
 * @param content - The content to estimate reading time for (string or HTML)
 * @param wordsPerMinute - Average reading speed (default: 200 words per minute)
 * @param isHTML - Whether the content is HTML (default: false)
 * @returns Reading time in minutes and rounded text format
 */
export function estimateReadingTime(
  content: string,
  wordsPerMinute: number = 200,
  isHTML: boolean = false
): { minutes: number; text: string } {
  if (!content) {
    return { minutes: 0, text: 'less than a minute' };
  }

  // If content is HTML, strip HTML tags
  let cleanContent = content;
  if (isHTML) {
    cleanContent = content.replace(/<[^>]*>/g, '');
  }

  // Count words by splitting on whitespace
  const words = cleanContent.trim().split(/\s+/).length;

  // Calculate reading time in minutes
  const minutes = Math.round(words / wordsPerMinute);

  // Ensure we always return at least 1 minute for content with words
  const roundedMinutes = words > 0 && minutes === 0 ? 1 : minutes;

  // Format the reading time text
  let readingTimeText = '';
  if (roundedMinutes <= 1) {
    readingTimeText = 'about 1 min';
  } else {
    readingTimeText = `about ${roundedMinutes} min`;
  }

  return {
    minutes: roundedMinutes,
    text: readingTimeText
  };
}
