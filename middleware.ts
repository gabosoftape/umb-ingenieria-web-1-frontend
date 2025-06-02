import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import { brandConfig } from '@/lib/brand';

export default async function middleware(request: NextRequest) {
  
 


  // Step 1: Use the incoming request (example)
  const defaultLocale = request.headers.get(brandConfig.localeHeader) || brandConfig.defaultLocale;
 
  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales: brandConfig.locales,
    defaultLocale,
    localePrefix: 'as-needed'
  });
  const response = handleI18nRouting(request);
 
  // Step 3: Alter the response (example)
  response.headers.set(brandConfig.localeHeader, defaultLocale);


 
  return response;
}
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|ar)/:path*']
};