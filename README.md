# WanderGroup Frontend

A modern React.js web application for connecting travelers and creating group trips with AI-powered itinerary generation.

## 🚀 Features

- **User Authentication**: Secure login/signup with Firebase Auth
- **Trip Management**: Create, discover, and join travel groups
- **AI-Powered Itineraries**: Intelligent trip planning with Google Maps integration
- **Real-time Chat**: Group communication for trip coordination
- **Rating System**: Post-trip feedback and user reputation
- **Responsive Design**: Works seamlessly on desktop and mobile browsers

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Maps**: Google Maps JavaScript API
- **AI**: OpenAI/Gemini API
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── navigation/     # Navigation components
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard pages
│   ├── trips/         # Trip-related pages
│   ├── profile/       # User profile pages
│   └── onboarding/    # Onboarding flow
├── services/          # API services and external integrations
├── hooks/             # Custom React hooks
├── contexts/          # React Context providers
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── assets/            # Static assets (images, icons)
└── styles/            # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase project setup
- Google Maps API key
- OpenAI/Gemini API key (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wanderCrew-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_APP_NAME=WanderGroup
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## 🏗️ Development Guidelines

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error boundaries
- Write accessible components (ARIA labels, keyboard navigation)
- Use semantic HTML elements
- Follow React best practices

### Component Structure

```typescript
import React, { useState, useCallback } from 'react';

interface ComponentProps {
  // Define props with proper types
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState<StateType>(initialState);
  
  // Memoized callbacks
  const handleAction = useCallback(() => {
    // implementation
  }, [dependencies]);
  
  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Testing

- Write unit tests for all components with logic
- Use React Testing Library for component tests
- Aim for 80%+ test coverage
- Test accessibility features
- Mock external dependencies

### Performance

- Use React.memo() for expensive components
- Implement code splitting with React.lazy()
- Optimize bundle size with proper imports
- Use useCallback and useMemo appropriately
- Implement virtualization for large lists

## 🔧 Configuration

### ESLint

The project uses ESLint with TypeScript and React rules. Configuration is in `eslint.config.js`.

### Prettier

Code formatting is handled by Prettier. Configuration is in `.prettierrc.json`.

### TypeScript

Strict TypeScript configuration with path mapping for clean imports.

### Vite

Build tool configuration with optimized bundling and development server.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform:

- Firebase configuration
- Google Maps API key
- OpenAI API key (if using AI features)

### Deployment Platforms

The app can be deployed to:
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront
- Any static hosting service

## 📚 Documentation

- [Phase 1: Foundation & Authentication](./docs/phase-1-foundation-auth.md)
- [Phase 2: Core Trip Features](./docs/phase-2-core-features.md)
- [Phase 3: AI Integration & Advanced Features](./docs/phase-3-ai-integration.md)
- [Phase 4: Social Features & Polish](./docs/phase-4-social-features.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@wandergroup.com or join our Discord community.