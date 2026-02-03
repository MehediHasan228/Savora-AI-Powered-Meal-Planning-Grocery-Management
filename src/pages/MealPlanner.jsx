import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Plus, Trash2, SlidersHorizontal, ShoppingCart, ArrowRight, Flame } from 'lucide-react';
import { mealPlanService } from '../services/api';
import RecipeSelectorModal from '../components/RecipeSelectorModal';

const MealPlanner = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekPlan, setWeekPlan] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal State
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { date, slot }

    // Calculate start of week (Monday)
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const slots = ['breakfast', 'lunch', 'dinner'];

    useEffect(() => {
        fetchWeekPlan();
    }, [currentDate]);

    const fetchWeekPlan = async () => {
        setIsLoading(true);
        try {
            const startStr = startOfWeek.toISOString();
            const end = new Date(startOfWeek);
            end.setDate(end.getDate() + 6);
            const endStr = end.toISOString();

            const response = await mealPlanService.getWeekPlan(startStr, endStr);
            setWeekPlan(response.data);
        } catch (error) {
            console.error('Failed to fetch plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!window.confirm('Generate a new meal plan for this week? This will overwrite existing empty slots.')) return;

        setIsGenerating(true);
        try {
            await mealPlanService.generateWeekPlan(startOfWeek.toISOString());
            await fetchWeekPlan(); // Refresh
        } catch (error) {
            alert('Failed to generate plan: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleWeekChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (offset * 7));
        setCurrentDate(newDate);
    };

    const handleSyncToGrocery = async () => {
        if (!window.confirm('Add all ingredients from this week\'s plan to your Grocery List?')) return;

        try {
            const startStr = startOfWeek.toISOString();
            const end = new Date(startOfWeek);
            end.setDate(end.getDate() + 6);
            const endStr = end.toISOString();

            const res = await mealPlanService.addToGrocery(startStr, endStr);
            alert(res.data.message);
        } catch (error) {
            alert('Failed to sync to grocery: ' + (error.response?.data?.message || error.message));
        }
    };

    const openRecipeSelector = (dayIndex, slotName) => {
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(targetDate.getDate() + dayIndex);

        setSelectedSlot({
            date: targetDate,
            slot: slotName
        });
        setIsSelectorOpen(true);
    };

    const handleRecipeSelect = async (recipe) => {
        if (!selectedSlot) return;

        try {
            await mealPlanService.updateSlot({
                date: selectedSlot.date.toISOString(),
                slot: selectedSlot.slot,
                recipeId: recipe.id
            });

            setIsSelectorOpen(false);
            fetchWeekPlan(); // Refresh
        } catch (error) {
            alert('Failed to update slot');
            console.error(error);
        }
    };

    const handleRemoveSlot = async (e, dayIndex, slotName) => {
        e.stopPropagation(); // prevent triggering select
        if (!window.confirm('Clear this meal?')) return;

        const targetDate = new Date(startOfWeek);
        targetDate.setDate(targetDate.getDate() + dayIndex);

        try {
            await mealPlanService.deleteSlot(targetDate.toISOString(), slotName);
            fetchWeekPlan();
        } catch (error) {
            alert('Failed to clear slot');
        }
    };

    const handleUpdateServings = async (e, dayIndex, slotName, currentServings, change) => {
        e.stopPropagation();
        const newServings = Math.max(1, currentServings + change);

        const targetDate = new Date(startOfWeek);
        targetDate.setDate(targetDate.getDate() + dayIndex);

        try {
            // Optimistic update (could be done here, but fetchWeekPlan is safer)
            await mealPlanService.updateSlot({
                date: targetDate.toISOString(),
                slot: slotName,
                servings: newServings
            });
            fetchWeekPlan();
        } catch (error) {
            console.error(error);
        }
    };

    const getPlanForSlot = (dayIndex, slot) => {
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(targetDate.getDate() + dayIndex);

        // Simple comparison ignoring time
        return weekPlan.find(p => {
            const planDate = new Date(p.date);
            return planDate.getDate() === targetDate.getDate() &&
                planDate.getMonth() === targetDate.getMonth() &&
                p.slot === slot;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Smart Meal Planner</h1>
                    <p className="text-gray-500 mt-1">Automated weekly meal schedules based on your preferences</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleSyncToGrocery}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-emerald-700 transition-colors flex items-center"
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add Week to Grocery
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-emerald-600 transition-colors flex items-center disabled:opacity-70"
                    >
                        {isGenerating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                        {isGenerating ? 'Generating...' : 'Auto-Generate Week'}
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
                    >
                        <SlidersHorizontal className="w-5 h-5 mr-2" />
                        Preferences
                    </button>
                </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <button onClick={() => handleWeekChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft /></button>
                <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{startOfWeek.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} - {new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6)).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                </div>
                <button onClick={() => handleWeekChange(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight /></button>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-7 gap-4 overflow-x-auto pb-4 min-w-[1000px]">
                {days.map((day, i) => (
                    <div key={day} className="flex flex-col gap-3 min-w-[140px]">
                        <div className="text-center font-semibold text-gray-700 bg-gray-50 py-2 rounded-lg border border-gray-100">
                            {day} <br />
                            <span className="text-xs font-normal text-gray-500">
                                {new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + i)).getDate()}
                            </span>
                        </div>

                        {slots.map(slot => {
                            const plan = getPlanForSlot(i, slot);
                            return (
                                <div
                                    key={slot}
                                    onClick={() => openRecipeSelector(i, slot)}
                                    className="flex-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm min-h-[120px] relative hover:shadow-md transition-shadow group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-xs uppercase font-bold text-gray-400">{slot}</div>
                                        {plan && (
                                            <button
                                                onClick={(e) => handleRemoveSlot(e, i, slot)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-all"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {plan ? (
                                        <div className="space-y-2">
                                            {plan.recipe ? (
                                                <>
                                                    {plan.recipe.image && (
                                                        <img
                                                            src={plan.recipe.image}
                                                            alt={plan.recipe.title}
                                                            className="w-full h-24 object-cover rounded-lg mb-2"
                                                        />
                                                    )}
                                                    <div className="text-sm font-medium text-gray-800 line-clamp-2">{plan.recipe.title}</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Flame className="w-3 h-3" />
                                                            {plan.recipe.calories * (plan.servings || 1)} kcal
                                                        </div>
                                                        <div className="flex items-center bg-gray-50 rounded-lg p-0.5" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={(e) => handleUpdateServings(e, i, slot, plan.servings || 1, -1)}
                                                                className="p-1 hover:bg-gray-200 rounded text-gray-600 w-5 h-5 flex items-center justify-center text-xs"
                                                            >-</button>
                                                            <span className="text-xs font-semibold px-1.5 text-gray-700">{plan.servings || 1}</span>
                                                            <button
                                                                onClick={(e) => handleUpdateServings(e, i, slot, plan.servings || 1, 1)}
                                                                className="p-1 hover:bg-gray-200 rounded text-gray-600 w-5 h-5 flex items-center justify-center text-xs"
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm italic text-gray-500">Custom Item</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <RecipeSelectorModal
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={handleRecipeSelect}
            />
        </div>
    );
};

export default MealPlanner;
