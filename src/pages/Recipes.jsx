import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, ExternalLink, Clock, Flame, ChefHat, X, Edit2, Eye, Trash2, PlusCircle, Info, Youtube, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import { calculateMatchScore, getMatchColor, getMatchBreakdown } from '../utils/matchCalculator';
import { fetchYoutubePlaylist } from '../services/recipeApi';
import RecipeVideoCard from '../components/RecipeVideoCard';
import { externalRecipeService, recipeService, groceryService } from '../services/api';
import { ShoppingCart } from 'lucide-react';

const Recipes = () => {
    const navigate = useNavigate();
    const { getInventoryNames } = useInventory();
    const { userPreferences } = useUser();
    const { searchQuery, setSearchQuery, debouncedSearchQuery } = useUI();
    const { authUser } = useAuth();
    const isAdmin = authUser?.role?.toLowerCase() === 'admin';
    const isManager = authUser?.role?.toLowerCase() === 'manager';
    const canEdit = isAdmin || isManager;

    // Cuisine List (dynamic)
    const [cuisines, setCuisines] = useState([
        'Italian', 'Asian', 'Mediterranean', 'Mexican', 'Seafood', 'American'
    ]);

    const [recipes, setRecipes] = useState([]);
    const [isRecipesLoading, setIsRecipesLoading] = useState(true);
    const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines');

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        time: 'All',
        calories: 'All',
        match: 'All'
    });

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);

    // Add Cuisine Modal State
    const [isAddCuisineOpen, setIsAddCuisineOpen] = useState(false);
    const [newCuisineName, setNewCuisineName] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        cuisine: 'Italian',
        time: '',
        calories: '',
        image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500&q=80',
        ingredients: []
    });

    const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'online', or 'video'
    const [videoRecipes, setVideoRecipes] = useState([]);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [visibleVideos, setVisibleVideos] = useState(12); // Pagination state
    const [isMockData, setIsMockData] = useState(false);

    // Fetch Manual Recipes
    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setIsRecipesLoading(true);
        try {
            const response = await recipeService.getAll();
            setRecipes(response.data);
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
        } finally {
            setIsRecipesLoading(false);
        }
    };

    // Fetch YouTube Tutorials
    const fetchYoutubeVideos = async () => {
        setIsVideoLoading(true);
        setVideoError(null);
        try {
            const data = await fetchYoutubePlaylist();
            setVideoRecipes(data);
        } catch (error) {
            console.error('Failed to fetch YouTube videos:', error);
            setVideoError('Failed to load video tutorials. Please try again later.');
        } finally {
            setIsVideoLoading(false);
        }
    };

    useEffect(() => {
        const loadExternal = async () => {
            setIsVideoLoading(true);
            setVideoError(null);
            try {
                const params = {
                    query: debouncedSearchQuery || 'healthy',
                    diet: userPreferences.dietaryRestrictions?.join(','),
                };
                const response = await externalRecipeService.search(params);
                setVideoRecipes(response.data.results.map(r => ({
                    id: r.id,
                    title: r.title,
                    image: r.image,
                    time: r.readyInMinutes,
                    calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                    cuisine: r.cuisines?.[0] || 'Unknown',
                    ingredients: r.analyzedInstructions?.[0]?.steps?.flatMap(s => s.ingredients?.map(i => i.name)) || [],
                    instructions: r.analyzedInstructions?.[0]?.steps?.map(s => s.step).join(' ') || ''
                })));
                setIsMockData(response.data.isMock || false);
            } catch (err) {
                setVideoError('Failed to load online recipes. Please check your Spoonacular API key in Settings.');
                console.error(err);
            } finally {
                setIsVideoLoading(false);
            }
        };

        if (activeTab === 'online') {
            loadExternal();
            setVisibleVideos(12);
        } else if (activeTab === 'video') {
            fetchYoutubeVideos();
            setVisibleVideos(12);
        }
    }, [activeTab, debouncedSearchQuery, userPreferences]);

    // Get inventory names for matching
    const inventoryNames = useMemo(() => getInventoryNames(), [getInventoryNames]);

    // Calculate match scores for all recipes
    const recipesWithMatch = useMemo(() => {
        return recipes.map(recipe => ({
            ...recipe,
            match: calculateMatchScore(recipe, inventoryNames, userPreferences)
        }));
    }, [recipes, inventoryNames, userPreferences]);

    // Filtering Logic (using global debounced search)
    const filteredRecipes = recipesWithMatch.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            recipe.cuisine.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesCuisine = selectedCuisine === 'All Cuisines' || recipe.cuisine === selectedCuisine;

        let matchesTime = true;
        if (filters.time === '< 15 min') matchesTime = recipe.time < 15;
        if (filters.time === '< 30 min') matchesTime = recipe.time < 30;
        if (filters.time === '< 60 min') matchesTime = recipe.time < 60;

        let matchesCalories = true;
        if (filters.calories === '< 300 kcal') matchesCalories = recipe.calories < 300;
        if (filters.calories === '300-600 kcal') matchesCalories = recipe.calories >= 300 && recipe.calories <= 600;
        if (filters.calories === '> 600 kcal') matchesCalories = recipe.calories > 600;

        let matchesMatchScore = true;
        if (filters.match === '> 90%') matchesMatchScore = recipe.match > 90;
        if (filters.match === '> 80%') matchesMatchScore = recipe.match > 80;

        return matchesSearch && matchesCuisine && matchesTime && matchesCalories && matchesMatchScore;
    });

    const resetFilters = () => {
        setFilters({ time: 'All', calories: 'All', match: 'All' });
        setSelectedCuisine('All Cuisines');
        setIsFilterOpen(false);
    };

    // Handlers
    const handleAddNew = () => {
        setFormData({
            title: '',
            cuisine: cuisines[0] || 'Italian',
            time: '',
            calories: '',
            image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500&q=80',
            ingredients: [],
            instructions: ''
        });
        setCurrentRecipe(null);
        setIsEditModalOpen(true);
    };

    const handleEdit = (recipe) => {
        setFormData(recipe);
        setCurrentRecipe(recipe);
        setIsEditModalOpen(true);
    };

    const handleView = (recipe) => {
        setCurrentRecipe(recipe);
        setShowMatchBreakdown(false);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this recipe?')) {
            try {
                await recipeService.delete(id);
                setRecipes(recipes.filter(r => r.id !== id));
            } catch (error) {
                console.error('Failed to delete recipe:', error);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentRecipe) {
                const response = await recipeService.update(currentRecipe.id, formData);
                setRecipes(recipes.map(r => r.id === currentRecipe.id ? response.data : r));
            } else {
                const response = await recipeService.create(formData);
                setRecipes([response.data, ...recipes]);
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to save recipe:', error);
        }
    };

    const handleSaveFromExternal = async (recipe) => {
        try {
            await recipeService.create({
                title: recipe.title,
                cuisine: recipe.cuisine,
                time: recipe.time,
                calories: recipe.calories,
                image: recipe.image,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions
            });
            alert(`"${recipe.title}" saved to your recipes!`);
            fetchRecipes(); // Refresh manual list
        } catch (error) {
            console.error('Failed to save external recipe:', error);
            alert('Failed to save recipe.');
        }
    };

    const handleAddToGrocery = async (recipe, e) => {
        e.stopPropagation();
        const ingredients = recipe.ingredients || [];
        if (ingredients.length === 0) {
            alert("This recipe has no ingredients listed.");
            return;
        }

        if (!window.confirm(`Add ${ingredients.length} ingredients to your grocery list?`)) return;

        try {
            const items = ingredients.map(ing => ({
                name: ing,
                price: 0,
                qty: 1,
                unit: 'unit',
                buyStatus: 'NOW',
                source: 'MANUAL'
            }));
            await groceryService.bulkAdd(items);
            alert("Ingredients added to Grocery List! 🛒");
        } catch (error) {
            console.error('Failed to add to grocery:', error);
            alert("Failed to add items. Please try again.");
        }
    };

    // Get match breakdown for current recipe
    const currentBreakdown = currentRecipe ? getMatchBreakdown(currentRecipe, inventoryNames, userPreferences) : null;

    return (
        <div className="space-y-6" onClick={() => setIsFilterOpen(false)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Recipe Management</h1>
                    <p className="text-gray-500 mt-1">Discover, add, or edit recipes for the platform</p>
                </div>
                {canEdit && (
                    <button
                        onClick={handleAddNew}
                        className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-emerald-600 transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Manual Recipe
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'manual'
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        Manual Recipes
                    </div>
                    {activeTab === 'manual' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('online')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'online'
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Online Search
                    </div>
                    {activeTab === 'online' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'video'
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Video Tutorials
                    </div>
                    {activeTab === 'video' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={activeTab === 'manual' ? "Search manual recipes..." : activeTab === 'online' ? "Search online recipes..." : "Search video tutorials..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                {activeTab === 'manual' && (
                    <div className="flex gap-4">
                        <select
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:border-primary"
                        >
                            <option>All Cuisines</option>
                            {cuisines.map(c => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                                className={`flex items-center px-4 py-2.5 border rounded-lg transition-colors ${isFilterOpen || Object.values(filters).some(v => v !== 'All')
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="w-5 h-5 mr-2" />
                                Filters
                                {Object.values(filters).some(v => v !== 'All') && (
                                    <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
                                )}
                            </button>

                            {/* Filter Popover */}
                            {isFilterOpen && (
                                <div
                                    className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-30 p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Max Cook Time</label>
                                            <div className="space-y-2">
                                                {['All', '< 15 min', '< 30 min', '< 60 min'].map(opt => (
                                                    <label key={opt} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="time"
                                                            className="w-4 h-4 text-primary focus:ring-primary"
                                                            checked={filters.time === opt}
                                                            onChange={() => setFilters({ ...filters, time: opt })}
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Calories</label>
                                            <select
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none"
                                                value={filters.calories}
                                                onChange={(e) => setFilters({ ...filters, calories: e.target.value })}
                                            >
                                                <option value="All">Any Calories</option>
                                                <option value="< 300 kcal">Less than 300 kcal</option>
                                                <option value="300-600 kcal">300 - 600 kcal</option>
                                                <option value="> 600 kcal">More than 600 kcal</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Match Score</label>
                                            <div className="flex gap-2">
                                                {['All', '> 80%', '> 90%'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setFilters({ ...filters, match: opt })}
                                                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.match === opt
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-3 flex justify-between items-center border-t border-gray-100">
                                            <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-600 font-medium">Reset All</button>
                                            <button onClick={() => setIsFilterOpen(false)} className="text-xs text-primary font-medium hover:underline">Apply Filters</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Recipe Content */}
            {activeTab === 'manual' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecipes.map((recipe) => {
                        const matchColor = getMatchColor(recipe.match);
                        return (
                            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative">
                                {canEdit && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id); }}
                                        className="absolute top-2 left-2 z-10 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => handleView(recipe)}>
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Dynamic Match Badge */}
                                    <div className={`absolute top-3 right-3 ${matchColor.badgeClass} backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm`}>
                                        {recipe.match}% Match
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between min-h-[3rem]">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 cursor-pointer hover:text-primary" onClick={() => handleView(recipe)}>{recipe.title}</h3>
                                    </div>
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md mb-4">{recipe.cuisine}</span>

                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {recipe.time} min
                                        </div>
                                        <div className="flex items-center">
                                            <Flame className="w-4 h-4 mr-1" />
                                            {recipe.calories} kcal
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                                        {canEdit && (
                                            <button onClick={() => handleEdit(recipe)} className="flex-1 text-sm font-medium text-gray-600 bg-gray-50 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2">
                                                <Edit2 className="w-4 h-4" /> Edit
                                            </button>
                                        )}
                                        <button onClick={() => handleView(recipe)} className="flex-1 text-sm font-medium text-primary bg-primary/10 py-2 rounded-lg hover:bg-primary/20 flex items-center justify-center gap-2">
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        <button
                                            onClick={(e) => handleAddToGrocery(recipe, e)}
                                            className="px-3 py-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                            title="Add ingredients to Grocery List"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-6">
                    {isVideoLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500 font-medium">Fetching the latest video tutorials...</p>
                        </div>
                    ) : videoError ? (
                        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-red-800">{videoError}</h3>
                            <button
                                onClick={() => setActiveTab('video')}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : activeTab === 'online' ? (
                        <div className="space-y-6">
                            {isMockData && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                            <Info className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-amber-900 text-sm">Demo Mode Active</h4>
                                            <p className="text-amber-700 text-xs">A Spoonacular API key was not found. Showing high-quality sample recipes for demonstration.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className="text-xs font-bold text-amber-700 hover:underline uppercase tracking-wider"
                                    >
                                        Add API Key
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {videoRecipes
                                    .slice(0, visibleVideos)
                                    .map(video => (
                                        <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                                            <div className="relative h-40">
                                                <img src={video.image} alt={video.title} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-bold">
                                                    SPOONACULAR
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-3 h-10">{video.title}</h4>
                                                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-4">
                                                    <span>{video.time} min</span>
                                                    <span>{video.calories} kcal</span>
                                                </div>
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleSaveFromExternal(video)}
                                                        className="w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <PlusCircle className="w-3 h-3" /> SAVE TO MY RECIPES
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            {videoRecipes.filter(v => v.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())).length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No online recipes match your search.
                                </div>
                            ) : videoRecipes.filter(v => v.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())).length > visibleVideos && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => setVisibleVideos(prev => prev + 12)}
                                        className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Load More Results
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {videoRecipes
                                    .slice(0, visibleVideos)
                                    .map(video => (
                                        <RecipeVideoCard key={video.id} video={video} />
                                    ))
                                }
                            </div>
                            {videoRecipes.filter(v => v.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())).length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No video tutorials match your search.
                                </div>
                            ) : videoRecipes.filter(v => v.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())).length > visibleVideos && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => setVisibleVideos(prev => prev + 12)}
                                        className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Load More Tutorials
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'manual' && filteredRecipes.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    No recipes found. Try adjusting your search or filters.
                </div>
            )}

            {/* Empty State / API Promo */}
            <div className="text-center py-12 border-t border-gray-100 mt-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">Want more recipes?</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Connect the <b>Spoonacular API</b> in Settings to unlock access to 5,000+ recipes automatically.</p>
                <button onClick={() => navigate('/settings')} className="mt-4 text-primary font-medium hover:underline flex items-center justify-center mx-auto">
                    Configure API Keys <ExternalLink className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* View Recipe Modal */}
            {isViewModalOpen && currentRecipe && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200" onClick={() => setIsViewModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="relative h-64">
                            <img src={currentRecipe.image} alt={currentRecipe.title} className="w-full h-full object-cover" />
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className={`absolute bottom-4 left-4 ${getMatchColor(currentRecipe.match).badgeClass} backdrop-blur px-3 py-1 rounded-lg text-sm font-bold shadow-sm`}>
                                {currentRecipe.match}% Match
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{currentRecipe.title}</h2>
                                    <span className="text-gray-500">{currentRecipe.time} mins • {currentRecipe.calories} kcal • {currentRecipe.cuisine}</span>
                                </div>
                                <button onClick={() => { setIsViewModalOpen(false); handleEdit(currentRecipe); }} className="text-gray-400 hover:text-primary transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Match Breakdown Toggle */}
                            <button
                                onClick={() => setShowMatchBreakdown(!showMatchBreakdown)}
                                className="w-full mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-sm hover:bg-gray-100 transition-colors"
                            >
                                <span className="flex items-center text-gray-600">
                                    <Info className="w-4 h-4 mr-2" />
                                    Why this match score?
                                </span>
                                <span className="text-primary font-medium">{showMatchBreakdown ? 'Hide' : 'Show'}</span>
                            </button>

                            {/* Match Breakdown Details */}
                            {showMatchBreakdown && currentBreakdown && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">🥬 Inventory Match</span>
                                        <span className="text-sm font-medium">{currentBreakdown.inventory.matched}/{currentBreakdown.inventory.total} ingredients ({currentBreakdown.inventory.score}/70)</span>
                                    </div>
                                    {currentBreakdown.inventory.matchedItems.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {currentBreakdown.inventory.matchedItems.map((item, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">{item}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">🍽️ Cuisine Match</span>
                                        <span className="text-sm font-medium">{currentBreakdown.dietary.matched ? '✓ Matches preferences' : '✗ No match'} ({currentBreakdown.dietary.score}/15)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">⏱️ Time & Calories</span>
                                        <span className="text-sm font-medium">
                                            {currentBreakdown.timeCalorie.timeOk ? '✓ Time OK' : '✗ Too long'} •
                                            {currentBreakdown.timeCalorie.caloriesOk ? ' ✓ Cal OK' : ' ✗ Too high'} ({currentBreakdown.timeCalorie.score}/15)
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold">
                                        <span className="text-gray-800">Total Score</span>
                                        <span className={`${getMatchColor(currentBreakdown.total).bg.replace('bg-', 'text-')}`}>{currentBreakdown.total}%</span>
                                    </div>
                                </div>
                            )}

                            <h4 className="font-semibold text-gray-800 mb-2">Ingredients</h4>
                            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                                {currentRecipe.ingredients ? currentRecipe.ingredients.map((ing, i) => (
                                    <li key={i}>{ing}</li>
                                )) : <li>No ingredients listed.</li>}
                            </ul>

                            <h4 className="font-semibold text-gray-800 mb-2">Instructions</h4>
                            <p className="text-gray-600 leading-relaxed">
                                {currentRecipe.instructions || "No instructions provided."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="font-bold text-lg text-gray-800">{currentRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-primary"
                                            value={formData.cuisine}
                                            onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                        >
                                            {cuisines.map(c => (
                                                <option key={c}>{c}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddCuisineOpen(true)}
                                            className="p-2 border border-dashed border-gray-300 rounded-lg text-primary hover:bg-primary/5 hover:border-primary transition-colors"
                                            title="Add New Cuisine"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                        value={formData.calories}
                                        onChange={e => setFormData({ ...formData, calories: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 font-medium">Save Recipe</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Cuisine Modal */}
            {isAddCuisineOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Add New Cuisine</h3>
                            <button onClick={() => { setIsAddCuisineOpen(false); setNewCuisineName(''); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Indian, French, Thai..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    value={newCuisineName}
                                    onChange={e => setNewCuisineName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCuisine(); } }}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Existing Cuisines</label>
                                <div className="flex flex-wrap gap-2">
                                    {cuisines.map(c => (
                                        <span key={c} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{c}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddCuisineOpen(false); setNewCuisineName(''); }}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddCuisine}
                                    disabled={!newCuisineName.trim()}
                                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Cuisine
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Recipes;
