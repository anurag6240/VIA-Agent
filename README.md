# VIA-Agent (Voice Interview Assistant)

A modern, AI-powered voice interview assistant for real-time Q&A practice. Built with React, TypeScript, and Gemini API, VIA-Agent helps you practice technical and HR interview questions using your voice, with instant, professional, and well-formatted answers.

## Features

- 🎤 **Voice Input**: Ask questions using your microphone, with robust auto-correction and phonetic matching.
- 🤖 **AI-Powered Answers**: Get concise, markdown-formatted answers for interview questions, including code snippets, advantages, and disadvantages.
- 📱 **Mobile-First UI**: Responsive, chat-style interface optimized for mobile and desktop.
- 📝 **Markdown Rendering**: Clean, compact formatting for easy reading and review.
- 💾 **Chat History**: Automatically saves your Q&A sessions for later review.

## Demo

[Live Demo](https://via-agent.vercel.app)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/anurag6240/VIA-Agent.git
   cd VIA-Agent
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and add your Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

### Running Locally
```sh
npm run dev
# or
yarn dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Usage
- Tap the microphone button and ask any interview question.
- The AI will detect, auto-correct, and answer your question in a clean, readable format.
- Review your chat history or clear it anytime.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

[MIT](LICENSE)

---

**Made with ❤️ by [anurag6240](https://github.com/anurag6240)** 