/**
 * Scrapeless Node SDK - Proxies Service Example (ES Module Version)
 *
 * This example demonstrates how to use the ProxiesService to generate and work
 * with residential proxies.
 */
import { ScrapelessClient } from '@scrapeless-ai/sdk';

// Initialize the client
const client = new ScrapelessClient({
  apiKey: process.env.SCRAPELESS_API_KEY || 'your_api_key_here'
});

/**
 * Test creating a proxy with specific parameters
 */
async function testCreateProxy() {
  try {
    console.log('Testing proxy creation with specific parameters...');

    const proxyUrl = client.proxies.proxy({
      type: 'residential',
      country: 'US',
      state: 'KS',
      city: 'gardner',
      sessionDuration: 30,
      sessionId: 'test-session-123',
      gateway: 'gate.smartproxy.com:7000'
    });

    console.log('✅ Proxy URL generated successfully');
    console.log('Proxy URL:', proxyUrl);
    return proxyUrl;
  } catch (error) {
    console.error('❌ Proxy creation failed:', error.message);
    throw error;
  }
}

/**
 * Test creating a proxy with the createProxy method
 */
async function testCreateProxyAlias() {
  try {
    console.log('Testing createProxy alias method...');

    const proxyUrl = client.proxies.createProxy({
      type: 'ipv6',
      country: 'UK',
      sessionDuration: 60,
      sessionId: 'test-session-456',
      gateway: 'gate.smartproxy.com:7000'
    });

    console.log('✅ Proxy URL generated successfully using createProxy');
    console.log('Proxy URL:', proxyUrl);
    return proxyUrl;
  } catch (error) {
    console.error('❌ createProxy method failed:', error.message);
    throw error;
  }
}

/**
 * Test generating a session ID
 */
async function testGenerateSessionId() {
  try {
    console.log('Testing session ID generation...');

    const sessionId = client.proxies.generateSessionId();

    console.log('✅ Session ID generated successfully');
    console.log('Session ID:', sessionId);

    // Create a proxy with the generated session ID
    const proxyUrl = client.proxies.proxy({
      type: 'ipv6',
      country: 'JP',
      sessionDuration: 15,
      sessionId: sessionId,
      gateway: 'gate.smartproxy.com:7000'
    });

    console.log('Created proxy with generated session ID:', proxyUrl);

    return { sessionId, proxyUrl };
  } catch (error) {
    console.error('❌ Session ID generation failed:', error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Scrapeless Proxies Service Tests ===\n');

  try {
    // Test proxy creation
    await testCreateProxy();
    console.log('\n');

    // Test createProxy alias
    await testCreateProxyAlias();
    console.log('\n');

    // Test session ID generation
    await testGenerateSessionId();
    console.log('\n');

    console.log('🎉 All tests completed successfully');
  } catch (error) {
    console.error('❌ Tests failed with error:', error);
  }
}

// Run the tests
runTests().catch(console.error);

// To run individual tests, uncomment the desired test:
// testCreateProxy().catch(console.error);
// testCreateProxyAlias().catch(console.error);
// testGenerateSessionId().catch(console.error);
