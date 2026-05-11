# Hero Video Instructions

## Adding Your Background Video

To add a background video to the hero section of the homepage:

1. **Prepare your video:**
   - Recommended format: MP4 (H.264 codec)
   - Recommended resolution: 1920x1080 (Full HD) or higher
   - Keep file size under 10MB for faster loading
   - Duration: 10-30 seconds (it will loop)
   - Content: Office, documents, archiving, or business-related footage

2. **Add the video file:**
   - Place your video file in the `/public` folder
   - Name it `hero-video.mp4`
   - The path should be: `/public/hero-video.mp4`

3. **Alternative: Use an external URL:**
   - Edit `app/page.tsx`
   - Replace the video source URL with your hosted video URL

## Free Stock Video Sources

If you need professional stock footage:

- **Coverr**: https://coverr.co/ (Free, no attribution required)
- **Pexels Videos**: https://www.pexels.com/videos/
- **Pixabay**: https://pixabay.com/videos/
- **Videvo**: https://www.videvo.net/

## Search Terms for Relevant Videos

- "office documents"
- "paperwork"
- "filing cabinet"
- "business archive"
- "document scanning"
- "office organization"
- "data management"

## Current Fallback

If no video is found, the page will display a beautiful gradient background with animated blobs, so the site will still look professional.
