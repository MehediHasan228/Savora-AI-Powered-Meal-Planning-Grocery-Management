import React from 'react';
import { Youtube, ExternalLink } from 'lucide-react';

const RecipeVideoCard = ({ video }) => {
    const handleOpenVideo = () => {
        if (video.videoUrl) {
            window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
        } else if (video.playlistId) {
            window.open(`https://www.youtube.com/playlist?list=${video.playlistId}`, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
            onClick={handleOpenVideo}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-red-600 shadow-lg transform group-hover:scale-110 transition-transform">
                        <Youtube className="w-6 h-6" />
                    </div>
                </div>
                {video.createdAt && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-medium">
                        {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                    {video.title}
                </h3>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                        <Youtube className="w-3 h-3 mr-1" />
                        YouTube Content
                    </span>
                    <button
                        className="text-primary hover:text-emerald-700 transition-colors"
                        aria-label="Watch on YouTube"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeVideoCard;
