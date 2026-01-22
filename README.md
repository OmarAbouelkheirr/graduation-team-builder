# UniConnect - Graduation Project Team Matching Platform

A Next.js platform for matching graduation project students and forming teams based on track, skills, and experience.

## Features

- Student application form with dynamic skill suggestions
- Public student directory with search and filtering
- Admin panel for managing applications
- OTP-based email verification for student profile editing
- Maintenance mode and site settings

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Resend account (for email OTP)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=graduation_teams
ADMIN_SECRET_KEY=your_secure_admin_secret_key
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
SITE_NAME=UniConnect
```

### SendGrid Setup (Email Service)

**الفرق بين Resend و SendGrid:**

| الميزة | Resend | SendGrid |
|--------|--------|----------|
| **Free Tier** | 3,000 email/شهر | 100 email/يوم (3,000/شهر) |
| **Domain Verification** | ✅ لازم للإنتاج | ❌ مش لازم للاختبار |
| **Sender Email** | محتاج domain verified | ممكن تستخدم أي إيميل (مش محتاج verify) |
| **Testing Mode** | بس يرسل لإيميلك المسجل | يرسل لأي إيميل مباشرة ✅ |

**الخلاصة**: SendGrid أفضل للاختبار لأنك ممكن ترسل لأي إيميل مباشرة بدون domain verification!

**Setup Steps:**

1. Sign up at [SendGrid.com](https://sendgrid.com) (free account)
2. Go to **Settings** → **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "UniConnect OTP")
5. Select **Full Access** or **Restricted Access** (with Mail Send permissions)
6. Copy the API key (starts with `SG.`)
7. Add it to `.env.local`:
   ```env
   SENDGRID_API_KEY=SG.your_actual_api_key_here
   SENDGRID_FROM_EMAIL=any-email@example.com
   ```
   
   **Note**: يمكنك استخدام أي إيميل في `SENDGRID_FROM_EMAIL` - مش محتاج verify! (لكن ممكن يروح للـspam folder)

**Free Tier**: 100 emails/day (3,000/month) - **No domain verification needed!**

**Troubleshooting**:
- If emails aren't sending, check the server console for error messages
- Make sure `SENDGRID_API_KEY` is in `.env.local` (not `.env`)
- Restart the dev server after adding environment variables
- Check SendGrid dashboard → **Activity** for email delivery status
- Make sure the API key has "Mail Send" permissions
- If emails go to spam, verify the sender email in SendGrid dashboard (optional)

### Installation

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
