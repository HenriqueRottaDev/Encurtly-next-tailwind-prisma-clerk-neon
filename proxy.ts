import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/privacy',  
  '/terms',    
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/r/(.*)',
  '/api/r/(.*)',
  '/api/webhooks(.*)',
  '/api/stripe/webhook',
  '/api/links/:id/verify',
  '/api/links/:id/track-redirect',
  '/monitoring(.*)',
])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}