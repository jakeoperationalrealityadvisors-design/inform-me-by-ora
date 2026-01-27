import axios from 'axios';

class APIClient {
    constructor() {
        this.clients = new Map();
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2
        };
    }

    createClient(name, baseURL, options = {}) {
        const client = axios.create({
            baseURL,
            timeout: options.timeout || 30000,
            headers: options.headers || {},
            ...options
        });

        // Request interceptor
        client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor with retry logic
        client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const config = error.config;

                if (!config || !config.retry) {
                    config.retry = 0;
                }

                if (config.retry >= this.retryConfig.maxRetries) {
                    return Promise.reject(error);
                }

                config.retry += 1;

                const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, config.retry - 1);
                
                await new Promise(resolve => setTimeout(resolve, delay));

                return client(config);
            }
        );

        this.clients.set(name, client);
        return client;
    }

    getClient(name) {
        return this.clients.get(name);
    }

    async request(clientName, method, url, data = null, options = {}) {
        const client = this.getClient(clientName);
        if (!client) {
            throw new Error(`Client "${clientName}" not found`);
        }

        try {
            const response = await client({
                method,
                url,
                data,
                ...options
            });
            return response.data;
        } catch (error) {
            console.error(`API request failed: ${method} ${url}`, error);
            throw error;
        }
    }

    // HTTP Methods
    async get(clientName, url, options = {}) {
        return this.request(clientName, 'GET', url, null, options);
    }

    async post(clientName, url, data, options = {}) {
        return this.request(clientName, 'POST', url, data, options);
    }

    async put(clientName, url, data, options = {}) {
        return this.request(clientName, 'PUT', url, data, options);
    }

    async patch(clientName, url, data, options = {}) {
        return this.request(clientName, 'PATCH', url, data, options);
    }

    async delete(clientName, url, options = {}) {
        return this.request(clientName, 'DELETE', url, null, options);
    }

    // GraphQL support
    async graphql(clientName, query, variables = {}) {
        return this.post(clientName, '/graphql', { query, variables });
    }

    // SSE (Server-Sent Events) support
    subscribeSSE(url, onMessage, onError) {
        const eventSource = new EventSource(url);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('SSE parse error:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            if (onError) onError(error);
        };

        return () => {
            eventSource.close();
        };
    }

    // Webhook registration
    async registerWebhook(clientName, webhookUrl, events = []) {
        return this.post(clientName, '/webhooks', {
            url: webhookUrl,
            events
        });
    }
}

export const apiClient = new APIClient();

// Initialize default clients
apiClient.createClient('inform-me-by-ora', window.location.origin);
apiClient.createClient('external', 'https://api.example.com');