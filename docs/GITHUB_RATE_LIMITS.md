# GitHub API Rate Limits - Explained

## Is GitHub API Paid?

**No, GitHub API is completely free!** However, it has rate limits to prevent abuse and ensure fair usage.

## Rate Limit Tiers

### Authenticated Requests (Using Personal Access Token)
- **5,000 requests per hour**
- This is what you're using when you set `GITHUB_TOKEN` in your `.env` file
- Applies per token, not per user
- Resets every hour

### Unauthenticated Requests (No Token)
- **60 requests per hour**
- Much lower limit
- Not recommended for production use

## Why You're Seeing Rate Limit Errors

The error you're seeing is from **our application's rate limiter**, not GitHub's. Here's why:

1. **Our Rate Limiter**: We implemented a client-side rate limiter set to 4,000 requests/hour (conservative buffer)
2. **GitHub's Actual Limit**: 5,000 requests/hour with your authenticated token
3. **The Issue**: Our limiter is preventing requests even though GitHub would allow them

## Solutions

### Option 1: Wait for Reset (Current Behavior)
- The rate limiter resets every hour
- Wait until the reset time shown in the error message

### Option 2: Increase Rate Limiter (Recommended)
The rate limiter has been updated to 4,000 requests/hour. If you need more:

1. Edit `src/lib/studio/rate-limiter.ts`
2. Change the limit (currently 4000) to a higher value
3. **Note**: Don't exceed 4,500 to leave buffer for GitHub's 5,000 limit

### Option 3: Disable Client-Side Rate Limiting (Advanced)
You can rely entirely on GitHub's rate limit headers:

1. Remove or comment out the rate limit check in `github-api.ts`
2. GitHub will return proper error messages when you hit their limit
3. **Warning**: This means you could hit GitHub's limit faster

## Checking Your Rate Limit Status

GitHub provides rate limit information in response headers:
- `x-ratelimit-limit`: Your limit (5000 for authenticated)
- `x-ratelimit-remaining`: Requests remaining
- `x-ratelimit-reset`: Unix timestamp when limit resets

## Best Practices

1. **Use Authenticated Requests**: Always use `GITHUB_TOKEN` (you're already doing this ✅)
2. **Batch Operations**: When possible, combine multiple operations
3. **Cache Results**: Don't re-fetch data unnecessarily
4. **Monitor Usage**: Check rate limit headers in responses

## For High-Volume Usage

If you need more than 5,000 requests/hour:
- **GitHub Enterprise**: Paid plans offer higher limits
- **GitHub Apps**: OAuth apps have different rate limits
- **Multiple Tokens**: Rotate between multiple tokens (not recommended)

## Current Configuration

- **Rate Limiter**: 4,000 requests/hour
- **GitHub Limit**: 5,000 requests/hour (authenticated)
- **Buffer**: 1,000 requests/hour safety margin

This configuration should work well for most use cases. If you're hitting the limit frequently, consider:
- Optimizing API calls (reduce unnecessary requests)
- Implementing caching
- Increasing the rate limiter limit slightly
