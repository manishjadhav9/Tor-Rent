// Cache the price for 5 minutes
let cachedPrice = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const getMaticPrice = async () => {
    try {
        // Return cached price if available and not expired
        if (cachedPrice && (Date.now() - lastFetchTime) < CACHE_DURATION) {
            return cachedPrice;
        }

        // Fetch from multiple sources for redundancy
        const responses = await Promise.allSettled([
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd')
                .then(res => res.json())
                .then(data => data['matic-network'].usd),
            fetch('https://api.binance.com/api/v3/ticker/price?symbol=MATICUSDT')
                .then(res => res.json())
                .then(data => parseFloat(data.price)),
            // Add more price sources if needed
        ]);

        // Use the first successful response
        const successfulResponse = responses.find(r => r.status === 'fulfilled');
        if (successfulResponse) {
            cachedPrice = successfulResponse.value;
            lastFetchTime = Date.now();
            return cachedPrice;
        }

        // If all external APIs fail, return a fallback price
        return 1.0; // Fallback price
    } catch (error) {
        console.error('Error fetching MATIC price:', error);
        return cachedPrice || 1.0; // Return cached price or fallback
    }
}; 