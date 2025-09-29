# Real Estate Management UI

A modern React-based user interface for managing real estate properties, built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Property Management**: View, add, edit, and delete properties
- **Image Gallery**: Upload and manage property images
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Stack**: Built with React 18, TypeScript, and Vite
- **State Management**: Uses React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Built with Headless UI and custom Tailwind components

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- [Backend API](https://github.com/your-org/real-estate-api) running locally or remotely

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/real-estate-ui.git
   cd real-estate-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   The application will be available at http://localhost:5173

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build locally
- `test` - Run tests
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `type-check` - Run TypeScript type checking
- `prepare` - Install git hooks (runs automatically after `npm install`)

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API clients
├── pages/           # Page components
├── services/        # API service functions
├── types/           # TypeScript type definitions
└── utils/           # Helper utilities
```

## API Integration

The UI communicates with the backend API using React Query. API service functions are defined in `src/services/`.

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
# or
pnpm test
```

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. The production build will be in the `dist` directory.

## Deployment

The application can be deployed to any static hosting service:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
