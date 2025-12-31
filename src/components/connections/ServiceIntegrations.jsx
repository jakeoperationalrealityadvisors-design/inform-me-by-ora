import { apiClient } from './APIClient';

export class ServiceIntegrations {
    constructor() {
        this.services = new Map();
    }

    // Register a new service
    register(name, config) {
        apiClient.createClient(name, config.baseURL, {
            headers: config.headers || {},
            timeout: config.timeout || 30000
        });
        
        this.services.set(name, {
            name,
            isActive: true,
            ...config
        });
    }

    // REST API integration
    async callREST(serviceName, endpoint, method = 'GET', data = null) {
        return apiClient.request(serviceName, method, endpoint, data);
    }

    // SOAP integration
    async callSOAP(serviceName, action, envelope) {
        const service = this.services.get(serviceName);
        if (!service) throw new Error(`Service ${serviceName} not found`);

        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    ${envelope}
                </soap:Body>
            </soap:Envelope>`;

        return apiClient.post(serviceName, '', soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml',
                'SOAPAction': action
            }
        });
    }

    // GraphQL integration
    async queryGraphQL(serviceName, query, variables = {}) {
        return apiClient.graphql(serviceName, query, variables);
    }

    // gRPC-Web integration (if supported)
    async callGRPC(serviceName, method, request) {
        // gRPC-Web implementation would go here
        // This is a placeholder for gRPC-Web protocol
        console.warn('gRPC-Web integration requires additional setup');
        throw new Error('gRPC-Web not yet implemented');
    }

    // MQTT integration (via WebSocket bridge)
    connectMQTT(brokerUrl, options = {}) {
        // MQTT over WebSocket
        const client = {
            url: brokerUrl,
            topics: new Map(),
            ws: null
        };

        client.ws = new WebSocket(brokerUrl);
        
        client.subscribe = (topic, callback) => {
            client.topics.set(topic, callback);
        };

        client.publish = (topic, message) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify({ topic, message }));
            }
        };

        return client;
    }

    // OAuth 2.0 flow helper
    async initiateOAuth(serviceName, clientId, redirectUri, scope) {
        const service = this.services.get(serviceName);
        if (!service || !service.authEndpoint) {
            throw new Error('OAuth configuration missing');
        }

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scope,
            response_type: 'code',
            state: Math.random().toString(36).substring(7)
        });

        window.location.href = `${service.authEndpoint}?${params.toString()}`;
    }

    // API Key authentication
    setAPIKey(serviceName, apiKey) {
        const client = apiClient.getClient(serviceName);
        if (client) {
            client.defaults.headers.common['X-API-Key'] = apiKey;
        }
    }

    // Bearer token authentication
    setBearerToken(serviceName, token) {
        const client = apiClient.getClient(serviceName);
        if (client) {
            client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }

    // Basic authentication
    setBasicAuth(serviceName, username, password) {
        const client = apiClient.getClient(serviceName);
        if (client) {
            const encoded = btoa(`${username}:${password}`);
            client.defaults.headers.common['Authorization'] = `Basic ${encoded}`;
        }
    }

    // Service health check
    async checkHealth(serviceName) {
        try {
            await apiClient.get(serviceName, '/health');
            return { status: 'healthy', service: serviceName };
        } catch (error) {
            return { status: 'unhealthy', service: serviceName, error: error.message };
        }
    }

    // Batch requests
    async batchRequest(serviceName, requests) {
        const client = apiClient.getClient(serviceName);
        const promises = requests.map(req => 
            client({ method: req.method, url: req.url, data: req.data })
        );
        return Promise.allSettled(promises);
    }
}

export const serviceIntegrations = new ServiceIntegrations();

// Example service registrations (can be configured via UI)
serviceIntegrations.register('stripe', {
    baseURL: 'https://api.stripe.com/v1',
    headers: { 'Stripe-Version': '2023-10-16' }
});

serviceIntegrations.register('sendgrid', {
    baseURL: 'https://api.sendgrid.com/v3',
});

serviceIntegrations.register('twilio', {
    baseURL: 'https://api.twilio.com/2010-04-01',
});