import React, { useState } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function MathSolver() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setImage(e.target.result.split(',')[1]); // Get base64 without prefix
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const solveProblem = async () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use production backend URL or local for development
      const apiUrl = import.meta.env.PROD 
        ? 'https://nubina-backend.onrender.com/api/solve'
        : 'http://localhost:3001/api/solve';
        
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: image
        })
      });

      const data = await response.json();
      
      if (data.content && data.content.length > 0) {
        const solution = data.content
          .filter(item => item.type === "text")
          .map(item => item.text)
          .join("\n");
        
        setResult(solution);
      } else {
        setError("No solution received from the API");
      }
    } catch (err) {
      setError("Failed to solve problem: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img 
              src="images/numina-logo.png" 
              alt="Numina Solve Logo" 
              className="w-32 h-32 mx-auto mb-4 b-5"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">NUMINA SOLVE</h1>
            <p className="text-cyan-300 font-semibold text-lg mb-2">Unlock the Universe of Numbers</p>
            <p className="text-navy-blue-300">Upload an image of any math problem and get step-by-step solutions</p>
          </div>

          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-4 border-dashed border-cyan-400 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer bg-slate-800/50"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                <p className="text-lg font-semibold text-gray-200 mb-2">
                  Drop your image here or click to upload
                </p>
                <p className="text-sm text-navy-blue-400">
                  Supports JPG, PNG and other image formats
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-400/30">
                <h3 className="font-semibold text-gray-200 mb-3">Uploaded Image:</h3>
                <img
                  src={imagePreview}
                  alt="Math problem"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                  style={{ maxHeight: '400px' }}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={solveProblem}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Solving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Solve Problem
                    </>
                  )}
                </button>
                <button
                  onClick={reset}
                  disabled={loading}
                  className="bg-slate-700 text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-slate-600 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  Upload New
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-900/30 border border-green-500/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-green-300">Solution:</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-200 font-sans bg-slate-800/50 p-4 rounded-lg shadow-sm border border-cyan-400/30">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Supports arithmetic, algebra, geometry, calculus, and word problems</p>
        </div>
      </div>
       <footer className="mt-6 text-center text-sm text-gray-400">© 2026 Numina solve. All rights reserved</footer>
    </div>
  );
}