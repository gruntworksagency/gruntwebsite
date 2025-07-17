# Google Places API Setup Guide

This guide explains how to configure the Google Places API integration for the audit form business search functionality.

## Overview

The audit form now includes intelligent business search powered by Google Places API. Users can search for their business and automatically populate form fields with verified Google data including:

- Business name and address
- Phone number and website
- Google Business Profile URL
- Place ID for future reference
- Business types/categories

## Prerequisites

- Google Cloud Platform account
- Existing Google Maps API key (configured as `PUBLIC_GOOGLE_MAPS_API_KEY`)
- Access to Google Cloud Console

## API Configuration Steps

### 1. Enable Required APIs

In Google Cloud Console → APIs & Services → Library, enable:

- **Places API (New)** - For business search functionality
- **Maps JavaScript API** - For loading the Places library
- **Geocoding API** (optional) - For additional location services

### 2. Configure API Key Restrictions

Edit your existing `PUBLIC_GOOGLE_MAPS_API_KEY` in Google Cloud Console:

#### Application Restrictions

Set to **HTTP referrers** and add:

- `https://yourdomain.com/*`
- `https://*.yourdomain.com/*`
- `http://localhost:*` (for development)

#### API Restrictions

Restrict key to only these APIs:

- Places API (New)
- Maps JavaScript API
- Geocoding API (if needed)

### 3. Set Usage Quotas

Configure reasonable limits to control costs:

- **Places Autocomplete**: 1,000 requests/day initially
- **Place Details**: 1,000 requests/day initially
- **Maps JavaScript API**: 25,000 loads/day

### 4. Enable Billing Alerts

Set up billing alerts at:

- $10 USD
- $25 USD
- $50 USD

## Environment Variables

Ensure the following environment variable is set:

```bash
PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

This variable is already configured in `astro.config.mjs` and loaded from your environment.

## Security Features

### API Key Protection

- HTTP referrer restrictions prevent unauthorized domain usage
- API restrictions limit functionality to only required services
- Usage quotas prevent unexpected charges

### Client-Side Security

- API key is public but protected by domain restrictions
- No sensitive server-side Google API credentials required
- Rate limiting through Google's quota system

## Usage Monitoring

### Google Cloud Console

Monitor API usage in the Cloud Console:

1. Go to APIs & Services → Dashboard
2. Select your project
3. View usage graphs for Places API
4. Set up alerts for quota thresholds

### Key Metrics to Monitor

- **Autocomplete requests per day**
- **Place details requests per day**
- **Error rate percentage**
- **Average response time**

## Troubleshooting

### Common Issues

#### "This API key is not authorized to use this service"

- Check that Places API (New) is enabled
- Verify API key restrictions include your domain
- Ensure HTTP referrer restrictions are correctly configured

#### Autocomplete not appearing

- Verify `PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Check browser console for JavaScript errors
- Confirm Google Maps script loads successfully

#### "Quota exceeded" errors

- Check current usage in Cloud Console
- Increase quotas if legitimate usage
- Investigate potential abuse if unexpected

### Testing API Configuration

Test your API key restrictions:

1. **Verify domain restrictions work**:
   - Try accessing from unauthorized domain (should fail)
   - Access from your domain (should work)

2. **Test API restrictions**:
   - Attempt to use unauthorized APIs (should fail)
   - Use Places API functionality (should work)

## Cost Optimization

### Request Optimization

- Autocomplete configured for `establishment` types only
- Limited place fields requested to reduce costs
- Session tokens used for cost-effective place details

### Usage Best Practices

- Debouncing implemented to reduce API calls
- Smart caching of recent searches
- Efficient field selection for place details

## Implementation Details

### Component Architecture

```
src/
├── components/
│   ├── PlacesAutocomplete.astro    # Main component
│   └── PlacesAutocomplete.ts       # Core logic
├── types/
│   └── places.ts                   # TypeScript interfaces
└── pages/
    └── audit.astro                 # Integration point
```

### Key Features

- Real-time business search
- Auto-population of form fields
- Visual feedback for successful selections
- Error handling and graceful degradation
- Accessibility-compliant implementation

## Future Enhancements

### Planned Improvements

- Business verification status display
- Integration with Google My Business API
- Photo integration from Places API
- Reviews and ratings display
- Multiple location support

### Performance Optimizations

- Request debouncing (already implemented)
- Progressive enhancement for non-JS users
- Loading states and skeleton UI
- Advanced caching strategies

## Support and Maintenance

### Regular Tasks

- Monitor API usage monthly
- Review and adjust quotas as needed
- Update billing alerts based on growth
- Check for Google API updates

### Emergency Procedures

If API quota is exceeded:

1. Check Cloud Console for usage spikes
2. Temporarily increase quotas if legitimate
3. Investigate potential security issues
4. Implement additional rate limiting if needed

## Contact

For technical support with this integration, contact the development team or refer to the Google Places API documentation at https://developers.google.com/maps/documentation/places/web-service/overview.
