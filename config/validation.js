/**
 * Common validation helper functions
 */

/**
 * Validate song input data
 * @param {string} title - Song title
 * @param {string} lyrics - Song lyrics
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateSongInput(title, lyrics) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return { isValid: false, error: 'Title is required and must be a non-empty string' };
  }

  if (!lyrics || typeof lyrics !== 'string' || !lyrics.trim()) {
    return { isValid: false, error: 'Lyrics are required and must be a non-empty string' };
  }

  return { isValid: true };
}

/**
 * Validate setlist input data
 * @param {string} name - Setlist name
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateSetlistInput(name) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, error: 'Setlist name is required and must be a non-empty string' };
  }

  return { isValid: true };
}

/**
 * Validate song ID parameter
 * @param {string|number} songId - Song ID from request
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateSongId(songId) {
  const id = parseInt(songId, 10);
  if (isNaN(id) || id <= 0) {
    return { isValid: false, error: 'Invalid song ID' };
  }
  return { isValid: true, id };
}

/**
 * Validate setlist ID parameter
 * @param {string|number} setlistId - Setlist ID from request
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateSetlistId(setlistId) {
  const id = parseInt(setlistId, 10);
  if (isNaN(id) || id <= 0) {
    return { isValid: false, error: 'Invalid setlist ID' };
  }
  return { isValid: true, id };
}

/**
 * Validate reorder request body
 * @param {Array} songs - Array of song objects with song_id and position
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateReorderInput(songs) {
  if (!Array.isArray(songs) || songs.length === 0) {
    return { isValid: false, error: 'Songs must be a non-empty array' };
  }

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    if (!song.song_id || typeof song.position !== 'number' || song.position < 0) {
      return { isValid: false, error: 'Each song must have a valid song_id and non-negative position' };
    }
  }

  return { isValid: true };
}

module.exports = {
  validateSongInput,
  validateSetlistInput,
  validateSongId,
  validateSetlistId,
  validateReorderInput
};