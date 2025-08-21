# 🎬 Movie Poster AI

An AI-powered movie poster generator that creates stunning, era-authentic movie posters using Claude 3.5 Sonnet and DALL-E 3.

![Movie Poster AI](https://img.shields.io/badge/AI-Movie%20Poster%20Generator-blue)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)
![Claude](https://img.shields.io/badge/Powered%20by-Claude%203.5-orange)
![DALL-E](https://img.shields.io/badge/Images%20by-DALL--E%203-green)

## ✨ Features

- 🎨 **Smart Image Generation** - DALL-E 3 creates authentic movie poster artwork
- 🧠 **AI-Powered Concepts** - Claude 3.5 Sonnet generates compelling movie ideas
- 📐 **Intelligent Cropping** - Automatically crops images to perfect 2:3 poster ratio
- 🎭 **Era-Authentic Styling** - Matches visual styles from 1950s to 2020s
- 📱 **Instagram Ready** - Auto-generates social media captions and hashtags
- 🎵 **Soundtrack Suggestions** - Era-appropriate music recommendations
- 💾 **Save & Share** - Download posters and share with friends
- 🔄 **Recent Gallery** - Browse your recent creations

## 🎯 Genre & Era Support

**Genres:**
- Horror
- Sci-Fi  
- Sci-Fi Horror Fusion
- Auto-selected variety

**Eras:**
- 1950s - Atomic Age, hand-painted art
- 1960s - Psychedelic, mod influences  
- 1970s - Gritty realism, earth tones
- 1980s - Neon, chrome, high contrast
- 1990s - Early digital, grunge aesthetic
- 2000s - Y2K futurism, digital compositing
- 2010s - Minimalist, floating heads style
- 2020s - Modern cinematography

## 🚀 Live Demo

Visit the live application: [Movie Poster AI on Vercel](https://movie-3.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **AI Models**: 
  - Claude 3.5 Sonnet (Anthropic)
  - DALL-E 3 (OpenAI)
- **Deployment**: Vercel Serverless Functions
- **Canvas API**: For image processing and text overlay

## 📁 Project Structure

```
movie-3/
├── api/                    # Vercel serverless functions
│   ├── generate-concept.js # Claude AI concept generation
│   ├── generate-image.js   # DALL-E 3 image generation  
│   └── health.js          # Health check endpoint
├── public/                 # Static assets
│   └── index.html         # Main application
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## 🚀 Local Development

### Prerequisites

- Node.js 14+ 
- Anthropic API Key
- OpenAI API Key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movie-3.git
   cd movie-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```bash
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## 🔧 Environment Variables

For production deployment on Vercel, set these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude 3.5 Sonnet API key | ✅ |
| `OPENAI_API_KEY` | DALL-E 3 API key | ✅ |

## 📱 Usage

1. **Select Preferences** - Choose genre, era, and art style
2. **Generate** - Click "Generate New Poster" 
3. **Enjoy** - Watch AI create your custom movie poster
4. **Share** - Download or share on social media with generated captions
5. **Discover Music** - Get era-appropriate soundtrack recommendations

## 🎨 Features Deep Dive

### Smart Image Cropping
The system automatically analyzes generated images to find the optimal crop area using variance-based edge detection, ensuring the most interesting parts of the image are preserved.

### Era-Authentic Styling  
Each decade has carefully researched visual cues:
- **1950s**: Atomic age motifs, hand-painted illustration style
- **1980s**: Neon color palettes, chrome effects, synthesizer aesthetics
- **2020s**: Modern cinematography, diverse representation

### Social Media Integration
- Auto-generated Instagram captions with relevant hashtags
- Era-appropriate music recommendations with context
- One-click copy functionality for easy sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude 3.5 Sonnet API
- **OpenAI** for DALL-E 3 API  
- **Vercel** for hosting and serverless functions
- **Tailwind CSS** for styling framework

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/movie-3/issues) on GitHub.

---

Built with ❤️ and AI by [Your Name]