import React, { useState } from 'react';
import { Loader2, ChefHat, ThumbsUp, ThumbsDown } from 'lucide-react';
import OpenAI from 'openai';

const generateRecipe = async (preferences, feedback = '') => {
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const prompt = feedback 
    ? `Generate a different recipe than the previous one. The user ${feedback}. Make it ${preferences.dietary || 'any'} diet, ${preferences.cuisine || 'any'} cuisine, takes ${preferences.time || 'any'} minutes, and ${preferences.difficulty || 'any'} difficulty.`
    : `Generate a recipe that is ${preferences.dietary || 'any'} diet, ${preferences.cuisine || 'any'} cuisine, takes ${preferences.time || 'any'} minutes, and ${preferences.difficulty || 'any'} difficulty.`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful cooking assistant that generates detailed recipes." },
      { role: "user", content: prompt }
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
};

function App() {
  const [preferences, setPreferences] = useState({
    dietary: '',
    cuisine: '',
    time: '',
    difficulty: ''
  });
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const newRecipe = await generateRecipe(preferences);
      setRecipe({ title: newRecipe });
    } catch (err) {
      setError('Failed to generate recipe. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleFeedback = async (liked) => {
    setLoading(true);
    setError(null);
    try {
      const feedback = liked ? 'liked the previous recipe but wants something different' : 'disliked the previous recipe';
      const newRecipe = await generateRecipe(preferences, feedback);
      setRecipe({ title: newRecipe });
    } catch (err) {
      setError('Failed to generate new recipe.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <ChefHat className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Recipe Recommender</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Dietary Preferences
            </label>
            <select
              name="dietary"
              value={preferences.dietary}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="omnivore">Omnivore</option>
              <option value="gluten-free">Gluten-free</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cuisine Type
            </label>
            <select
              name="cuisine"
              value={preferences.cuisine}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select cuisine</option>
              <option value="italian">Italian</option>
              <option value="asian">Asian</option>
              <option value="mexican">Mexican</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cooking Time
            </label>
            <select
              name="time"
              value={preferences.time}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select time</option>
              <option value="15">Under 15 minutes</option>
              <option value="30">Under 30 minutes</option>
              <option value="60">Under 1 hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={preferences.difficulty}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Advanced</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateRecipe}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              <ChefHat className="w-5 h-5" />
              Generate Recipe
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {recipe && !loading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap">{recipe.title}</pre>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => handleFeedback(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <ThumbsUp size={16} /> Generate Similar
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <ThumbsDown size={16} /> Generate Different
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;