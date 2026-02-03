import React, { useState, useEffect } from 'react';
import { X, Search, Clock, Flame } from 'lucide-react';
import { recipeService } from '../services/api';

const RecipeSelectorModal = ({ isOpen, onClose, onSelect }) => {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRecipes();
        }
    }, [isOpen]);

    const fetchRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await recipeService.getAll();
            setRecipes(response.data);
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Select a Recipe</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your recipes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading recipes...</div>
                    ) : filteredRecipes.length > 0 ? (
                        filteredRecipes.map(recipe => (
                            <div
                                key={recipe.id}
                                onClick={() => onSelect(recipe)}
                                className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                            >
                                <img
                                    src={recipe.image || 'https://images.unsplash.com/photo-1495521841625-27a630a5f7a9?w=150&q=80'}
                                    alt={recipe.title}
                                    className="w-16 h-16 rounded-md object-cover bg-gray-100"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{recipe.title}</h3>
                                        {recipe.matchPercentage && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${recipe.matchPercentage >= 90 ? 'bg-emerald-100 text-emerald-700' :
                                                    recipe.matchPercentage >= 80 ? 'bg-green-100 text-green-700' :
                                                        recipe.matchPercentage >= 70 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {recipe.matchPercentage >= 90 ? '🔥' : '✨'} {recipe.matchPercentage}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {recipe.time} min
                                        </div>
                                        <div className="flex items-center">
                                            <Flame className="w-3 h-3 mr-1" />
                                            {recipe.calories} kcal
                                        </div>
                                        {recipe.cuisine && (
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">{recipe.cuisine}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No recipes found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeSelectorModal;
