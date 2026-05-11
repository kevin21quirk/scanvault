# ScanVault - Professional Archiving & Digitalization Platform

A modern, full-stack web application for ScanVault, an archiving company that digitalizes paper archives and provides comprehensive document management solutions.

## Features

### Public Website
- **Modern Landing Page** - Showcasing services with red, white, and black branding
- **About Page** - Company information and values
- **Services Page** - Detailed service offerings including HR, Admin, Client Records, and Accounts management
- **Responsive Design** - Mobile-friendly interface with TailwindCSS

### Client Portal
- **Secure Authentication** - NextAuth.js with credential-based login
- **Invoice Management** - View and track invoices with status indicators
- **Receipt Access** - Download payment receipts and confirmations
- **Document Archive** - Browse and download digitalized documents by category
- **User Dashboard** - Personalized view of all client resources

### Admin Dashboard
- **Client Management** - Oversee all client accounts
- **Document Upload** - Add new documents to client archives
- **Invoice Generation** - Create and manage invoices
- **Analytics** - View system statistics and activity

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom ScanVault theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Authentication**: NextAuth.js v4
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon.tech recommended)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ScanVault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   # Database - Get from Neon.tech dashboard
   DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/scanvault?sslmode=require"

   # NextAuth - Generate secret with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # App
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push
   ```

5. **Create an admin user**
   
   You'll need to manually create an admin user in your database. Use a tool like Prisma Studio:
   ```bash
   npm run db:studio
   ```

   Or use SQL:
   ```sql
   INSERT INTO "User" (id, email, name, password, role)
   VALUES (
     'admin-id',
     'admin@scanvault.com',
     'Admin User',
     -- Hash of 'password123' - CHANGE THIS!
     '$2a$10$YourHashedPasswordHere',
     'ADMIN'
   );
   ```

   To generate a password hash, you can use:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your-password', 10);
   console.log(hash);
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ScanVault/
├── app/                      # Next.js app directory
│   ├── about/               # About page
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes
│   │   └── auth/           # NextAuth configuration
│   ├── login/              # Login page
│   ├── portal/             # Client portal
│   ├── services/           # Services page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Client-side providers
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── footer.tsx          # Footer component
│   └── navbar.tsx          # Navigation component
├── lib/                     # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/                  # Database schema
│   └── schema.prisma       # Prisma schema
├── types/                   # TypeScript type definitions
│   └── next-auth.d.ts      # NextAuth types
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Database Schema

### User
- Stores client and admin user information
- Includes authentication credentials
- Role-based access control (CLIENT/ADMIN)

### Invoice
- Client invoices with status tracking
- Supports PENDING, PAID, OVERDUE, CANCELLED statuses
- Links to user accounts

### Receipt
- Payment receipts and confirmations
- File attachment support
- Linked to user accounts

### Document
- Archived documents by category
- Categories: HR, ADMIN, CLIENT_RECORDS, RESIDENT_RECORDS, ACCOUNTS, ARCHIVE, OTHER
- Metadata and file information

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Neon.tech Database Setup

1. Create a new project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Add it to your `.env` file as `DATABASE_URL`
4. Run `npm run db:push` to create tables

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET` (generate a new one for production)
- `NODE_ENV=production`

## Customization

### Brand Colors

The ScanVault brand colors are defined in `tailwind.config.ts`:
- **Red**: `#DC2626`
- **Black**: `#0A0A0A`
- **White**: `#FFFFFF`

### Adding New Features

1. **New Pages**: Add to `app/` directory
2. **New Components**: Add to `components/` directory
3. **Database Changes**: Update `prisma/schema.prisma` and run `npm run db:push`
4. **API Routes**: Add to `app/api/` directory

## Security Considerations

- Always use HTTPS in production
- Keep `NEXTAUTH_SECRET` secure and unique
- Regularly update dependencies
- Implement rate limiting for API routes
- Use environment variables for sensitive data
- Enable CORS protection
- Implement file upload validation

## Support

For questions or issues:
- Email: info@scanvault.com
- Documentation: See inline code comments

## License

Proprietary - ScanVault © 2026

---

Built with ❤️ for ScanVault
