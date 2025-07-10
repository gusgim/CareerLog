# CareeLog Web App

## Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# NextAuth Configuration (if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create your `.env.local` file with the above variables

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. 