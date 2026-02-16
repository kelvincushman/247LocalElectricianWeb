# EICR PWA Cloudflare Deployment Design

## Overview
Deploy the EICR Scanner PWA to Cloudflare Pages with a Worker-based API proxy and Cloudflare Access password protection.

## Architecture
- Cloudflare Pages: serves static PWA files
- Cloudflare Pages Function (Worker): proxies API calls to Anthropic, injects API key from secret
- Cloudflare Access: email OTP or service token password gate

## Code Changes
1. Remove API key input UI from index.html
2. Change API fetch URLs from api.anthropic.com to /api/claude (relative)
3. Remove anthropic-dangerous-direct-browser-access header
4. Remove localStorage API key storage
5. Update service worker to not special-case anthropic.com
6. Add functions/api/claude.js as the Worker proxy
7. Add wrangler.toml for Worker config

## Security Layers
1. Cloudflare Access - authentication required
2. Worker validates request origin
3. API key server-side only (Worker secret)
4. CORS restricted to deployment domain

## Cloudflare IDs
- Account ID: 4ea3fd01634d8d6afc74f76ff2d980dc
- Zone ID: 438b465084b6b257adb837220247cbab
