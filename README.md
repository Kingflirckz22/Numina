# Numina Solve

**Unlock the Universe of Numbers**

An AI-powered web application that solves mathematical problems from images using Google Gemini API.

🌐 **Live Demo:** [https://numina-solve.vercel.app/](https://numina-solve.vercel.app/)

## Features

- 📸 Upload images with handwritten or printed math problems
- 🧮 Solves arithmetic, algebra, geometry, calculus, and word problems
- 📝 Step-by-step solutions with detailed explanations
- 🎨 Modern dark-themed UI with drag-and-drop support
- ⚡ Fast AI-powered processing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment

Create a `.env` file in the project root:

```
VITE_GOOGLE_API_KEY=your_api_key_here
```

### 4. Run the App

```bash
npm run dev
```

The app will start on:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## How to Use

1. Open `http://localhost:5173` in your browser
2. Upload an image with a math problem (drag & drop or click)
3. Click "Solve Problem"
4. View the step-by-step solution

## Project Structure

```
numina-solve/
├── src/
│   ├── components/
│   │   └── MathSolver.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server.js
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env
```

## Technologies

- React + Vite
- Tailwind CSS
- Express.js (backend)
- Google Gemini API

## Build for Production

```bash
npm run build
```

## Troubleshooting

**"Failed to solve problem" error:**
- Check that your API key is correct in `.env`
- Restart the servers after changing `.env`
- Ensure you have internet connection

**"Too Many Requests" error:**
- Wait 1-2 minutes between requests
- Google's free tier has rate limits

**Servers not starting:**
- Make sure ports 3001 and 5173 are available
- Try closing other applications using these ports

## Notes

- Keep your API key private (never commit `.env` to git)
- Clear, well-lit images work best
- Supported formats: JPG, PNG, WEBP
- Free tier has usage limits

## License

MIT
