import React from 'react';
import { X, ChefHat, Sparkles, ArrowRight, Info } from 'lucide-react';

const AIAnalysisModal = ({ isOpen, onClose, suggestions, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <Sparkles className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Savora AI Analysis</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="text-gray-500 font-medium">Chef Savora is analyzing your kitchen...</p>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="space-y-6">
                            {suggestions.map((item, idx) => (
                                idx === 0 && item.suggestion && (
                                    <div key="raw" className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4">
                                        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                            <ChefHat className="w-4 h-4" /> AI Chef's Suggestion
                                        </h4>
                                        <div className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                                            {item.suggestion}
                                        </div>
                                    </div>
                                )
                            ))}

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p>These recommendations are based on your current inventory. Higher match percentages mean you likely have all or most ingredients.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.map((item, idx) => (
                                    <div key={idx} className="group border border-gray-100 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.title}</h4>
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                                {item.matchPercent}% Match
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                                        <button className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                            VIEW RECIPE <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400">
                            <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No specific suggestions found. Try adding more items to your inventory!</p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-dark text-white rounded-lg font-medium hover:bg-black transition-colors"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisModal;
