# ChemLab Virtual Chemistry Simulator

A modern, interactive virtual chemistry laboratory built with React, TypeScript, and Express. This application provides immersive chemistry experiments with realistic simulations and educational content.

## Features

- 🧪 **Interactive Virtual Lab**: Realistic chemistry equipment and procedures
- 🔬 **Multiple Experiments**: Currently includes Aspirin Synthesis and Acid-Base Titration
- 📊 **Real-time Measurements**: Temperature, pH, volume, and color tracking
- 🎯 **Educational Content**: Step-by-step guidance and safety information
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components

## Experiments Available

1. **Aspirin Synthesis** - Learn the synthesis of acetylsalicylic acid
2. **Acid-Base Titration** - Master pH curves and equivalence points

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **UI Components**: Radix UI, Lucide Icons
- **Animations**: Framer Motion
- **State Management**: React Query
- **Routing**: Wouter
- **Database**: Drizzle ORM with PostgreSQL support

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/tangytongues/tinkerlab.git
cd tinkerlab
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

### GitHub Pages Deployment

To deploy to GitHub Pages (like https://tangytongues.github.io/tinkerlab/):

1. Build and prepare for GitHub Pages:

```bash
npm run deploy:gh-pages
```

2. Commit and push the changes:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The `deploy:gh-pages` script automatically:

- Builds the application with relative paths
- Copies `index.html` and `assets/` to the root level
- Ensures GitHub Pages can find and serve your application

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (full-stack)
- `npm run build:gh-pages` - Build for GitHub Pages (frontend only)
- `npm run deploy:gh-pages` - Build and deploy to GitHub Pages
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema

## Deployment

### GitHub Pages (Static)

For static deployment, you'll need to build the client:

```bash
npm run build
```

The built files will be in the `dist/public` directory.

### Vercel/Netlify (Full-Stack)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist/public`
4. Add environment variables if needed

### Self-Hosted

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

- Database connection settings
- Session secrets
- API keys (if any)

## Project Structure

```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── data/           # Experiment data and configurations
├── package.json    # Dependencies and scripts
└── README.md       # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
