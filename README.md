# IK | Iris Kooij - Modern Website

Een moderne, hoogwaardige website gebouwd met Next.js 14, TypeScript en Tailwind CSS.

## ✨ Features

- 🎨 **Modern UI/UX** - Prachtige animaties en smooth transitions
- 🌍 **Tweetalig** - Volledig Nederlands en Engels met next-intl
- 📱 **Responsive** - Werkt perfect op alle apparaten
- ⚡ **Snel** - Next.js App Router met server-side rendering
- 🎭 **Animaties** - Framer Motion voor vloeiende animaties
- 🎯 **SEO Optimized** - Metadata en gestructureerde data
- 📧 **Contact Form** - Netlify Forms integratie

## 🚀 Installatie

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Build voor productie
npm run build

# Start productie server
npm start
```

## 📁 Project Structuur

```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── page.tsx        # Homepage
│   │   ├── behandelingen/  # Treatment pages
│   │   ├── contact/        # Contact page
│   │   └── layout.tsx      # Layout wrapper
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Navigation
│   ├── Footer.tsx          # Footer
│   └── ui/                 # Reusable UI components
├── messages/
│   ├── nl.json            # Dutch translations
│   └── en.json            # English translations
└── lib/
    └── utils.ts            # Utility functions
```

## 🎨 Design System

### Kleuren
- **Primary Green**: #8BC34A
- **Dark Green**: #689F38
- **Light Green**: #DCEDC8
- **Gray**: #555555
- **Light Gray**: #f5f5f5

### Componenten
- Button (3 varianten: primary, secondary, outline)
- Card met hover effecten
- Modern responsive navigatie
- Geanimeerde hero sectie

## 🌐 Talen

De website ondersteunt:
- Nederlands (nl) - Standaard
- Engels (en)

Schakel tussen talen via de taalknop in de navigatie.

## 📦 Deployment

### Vercel (Aanbevolen)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
1. Connect je repository
2. Build command: `npm run build`
3. Publish directory: `.next`

## 🔧 Environment Variables

Geen environment variables nodig voor de basis setup!

## 📱 Pages

1. **Homepage** (`/`) - Hero, USP, Problemen, Oplossingen, Features
2. **Fascia Behandeling** (`/behandelingen/fascia`) - Details over Gantke Fascia
3. **Gezichtsbehandelingen** (`/behandelingen/gezichtsbehandelingen`) - Pharmos Natur treatments
4. **Contact** (`/contact`) - Contact form met Netlify integratie

## 🎯 Performance

- Server-side rendering voor snelle laadtijden
- Image optimization met Next.js Image component
- Code splitting en lazy loading
- Optimized fonts (Inter)

## 💡 Tips

- Run `npm run lint` om code kwaliteit te checken
- Gebruik `npm run dev` voor live reload tijdens development
- Test op verschillende devices met Chrome DevTools

## 📄 License

© 2026 IK | Iris Kooij. Alle rechten voorbehouden.
