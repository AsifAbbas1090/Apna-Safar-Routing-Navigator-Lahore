# Concurrent Users Analysis - Apna Safar

## Current Architecture

### Backend
- **Framework**: NestJS 11
- **Database**: PostgreSQL (Supabase) with PostGIS
- **ORM**: Prisma
- **Server**: Single Node.js process (default)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Hosting**: Development mode (single process)

### External APIs
- **Google Maps API**: Rate-limited by quota
- **Supabase**: Managed PostgreSQL

## Concurrent User Capacity Analysis

### 1. Google Maps API Limits (Primary Bottleneck)

**Free Tier (per month):**
- Dynamic Maps: 10,000 loads
- Places Autocomplete: 10,000 requests
- Directions: 10,000 requests
- Geocoding: 10,000 requests
- Static Maps: 10,000 requests

**Premium Tier (per month):**
- All APIs: 1,000,000 requests each

**Current Implementation:**
- Guest users: **No tracking** (unlimited usage)
- Authenticated free users: 10,000/month per API type
- Authenticated premium users: 1,000,000/month per API type

**Concurrent User Impact:**
- If all users are guests: **Unlimited concurrent users** (until Google API quota is hit)
- If all users are authenticated free: **~333 users/month** (assuming 30 API calls per user per month)
- If all users are authenticated premium: **~33,333 users/month** (assuming 30 API calls per user per month)

### 2. Database (Supabase PostgreSQL)

**Typical Supabase Limits:**
- Free tier: ~500 concurrent connections
- Pro tier: ~2,000+ concurrent connections
- Enterprise: Custom limits

**Current Usage:**
- Prisma connection pooling (default: 10 connections per instance)
- Single backend instance = ~10 database connections
- **Bottleneck**: Not database, but backend server capacity

### 3. Backend Server (NestJS)

**Single Process Limitations:**
- Node.js event loop: Handles ~1,000-10,000 concurrent connections efficiently
- Memory: ~100-200MB base + ~2-5MB per active connection
- CPU: Single-threaded event loop

**Estimated Capacity (Single Instance):**
- **Concurrent requests**: 500-1,000 (depending on request complexity)
- **Concurrent users**: 200-500 (assuming 2-5 requests per user session)

**Bottlenecks:**
- Google Maps API calls (external, async)
- Database queries (PostGIS spatial queries can be CPU-intensive)
- Route calculation (Dijkstra's algorithm)

### 4. Frontend (Next.js)

**Development Mode:**
- Single process
- **Capacity**: ~100-200 concurrent users

**Production Mode (with proper hosting):**
- Can scale horizontally
- **Capacity**: Unlimited (with proper infrastructure)

## Realistic Concurrent User Estimates

### Scenario 1: All Guest Users (Current Default)
- **Concurrent Users**: 200-500 (limited by backend server)
- **Monthly Active Users**: Unlimited (until Google API quota)
- **Bottleneck**: Backend server capacity

### Scenario 2: Mix of Free/Premium Users
- **Concurrent Users**: 200-500 (limited by backend server)
- **Monthly Active Users**: 
  - Free tier: ~333 users/month
  - Premium tier: ~33,333 users/month
- **Bottleneck**: Google Maps API quotas

### Scenario 3: Production with Scaling
- **Horizontal Scaling**: Multiple backend instances
- **Load Balancer**: Distribute traffic
- **Concurrent Users**: 1,000-5,000+ (with 5-10 backend instances)
- **Monthly Active Users**: Limited by Google Maps API quotas

## Recommendations for Scaling

### Immediate (Current Setup)
1. **Enable guest user tracking** to monitor actual API usage
2. **Add rate limiting** per IP/user to prevent abuse
3. **Cache frequent routes** to reduce API calls
4. **Monitor Google Maps API usage** closely

### Short-term (100-1,000 concurrent users)
1. **Add Redis caching** for route calculations
2. **Implement request queuing** for route planning
3. **Add database connection pooling** (increase Prisma pool size)
4. **Use CDN** for static assets

### Medium-term (1,000-10,000 concurrent users)
1. **Horizontal scaling**: Multiple backend instances
2. **Load balancer** (Nginx, AWS ALB, etc.)
3. **Database read replicas** for spatial queries
4. **Message queue** (RabbitMQ, Redis Queue) for heavy operations
5. **Upgrade Google Maps API** to premium tier

### Long-term (10,000+ concurrent users)
1. **Microservices architecture** (separate routing service)
2. **Kubernetes orchestration**
3. **Database sharding** by city
4. **Edge computing** for route calculations
5. **Custom transit data** (reduce Google Maps dependency)

## Current Capacity Summary

**With current single-instance setup:**
- **Concurrent Users**: **200-500 users** (limited by backend server)
- **Monthly Active Users**: 
  - Guest users: Unlimited (until Google quota)
  - Free tier: ~333 users/month
  - Premium tier: ~33,333 users/month

**Primary Bottleneck**: Backend server capacity (single process)

**Secondary Bottleneck**: Google Maps API quotas (for authenticated users)

**Recommendation**: Start with current setup, monitor usage, and scale horizontally when you reach 200+ concurrent users.

