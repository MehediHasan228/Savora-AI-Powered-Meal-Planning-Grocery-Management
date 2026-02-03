/**
 * Service for fetching recipe data from external sources.
 */

const YOUTUBE_PLAYLIST_API = 'https://app.tqfbd.org/wp-json/custom/v1/youtube-playlist';

/**
 * Fetches the YouTube playlist from the WordPress API.
 * @returns {Promise<Array>} Normalized array of video objects
 */
export const fetchYoutubePlaylist = async () => {
    try {
        const response = await fetch(YOUTUBE_PLAYLIST_API);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();

        // Extract items from rawData
        // Handles: { data: [] }, { Data: [] }, or direct []
        let items = [];
        if (Array.isArray(rawData)) {
            items = rawData;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            items = rawData.data;
        } else if (rawData.Data && Array.isArray(rawData.Data)) {
            items = rawData.Data;
        } else if (rawData.results && Array.isArray(rawData.results)) {
            items = rawData.results;
        }

        if (items.length > 0) {
            return items.map(item => {
                // Determine property values with fallback for different casing
                const id = item.id || item.ID || '';
                const title = item.title || item.Title || '';
                const subtitle = item.subtitle || item.Subtitle || '';
                const ytubeUrl = item.ytube_url || item.youtube_url || item.url || '';
                const imageUrl = item.image || item.Image || item.thumbnail || item.Thumbnail || '';
                const createdAt = item.created_at || item.createdAt || item.date || '';

                // Extract Video ID
                let videoId = '';
                const thumbUrl = ytubeUrl || imageUrl || '';
                const match = thumbUrl.match(/\/vi\/([^/]+)\//);
                if (match && match[1]) {
                    videoId = match[1];
                }

                return {
                    id: id,
                    title: title,
                    thumbnail: imageUrl || ytubeUrl,
                    videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
                    playlistId: subtitle,
                    createdAt: createdAt,
                    description: '',
                };
            });
        }

        return [];
    } catch (error) {
        console.error('Error fetching YouTube playlist:', error);
        throw error;
    }
};
