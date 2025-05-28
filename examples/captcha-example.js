/**
 * Scrapeless Node SDK - Captcha Service Example (ES Module Version)
 */
import { ScrapelessClient } from '@scrapeless-ai/sdk';

// Initialize client
const client = new ScrapelessClient({
  apiKey: process.env.SCRAPELESS_API_KEY || 'your_api_key_here'
});

/**
 * Test reCAPTCHA solving
 */
async function testRecaptcha() {
  try {
    console.log('Testing reCAPTCHA solving...');
    const result = await client.captcha.captchaSolver({
      actor: 'captcha.recaptcha',
      input: {
        version: 'v2',
        pageURL: 'https://www.google.com',
        siteKey: '6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-',
        pageAction: 'scraping',
        invisible: false
      }
    });

    console.log('✅ reCAPTCHA solving successful');
    console.log('Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ reCAPTCHA solving failed:', error.message);
    throw error;
  }
}

/**
 * Test hCaptcha solving
 */
async function testHcaptcha() {
  try {
    console.log('Testing hCaptcha solving...');
    const result = await client.captcha.captchaSolver({
      actor: 'captcha.hcaptcha',
      input: {
        sitekey: '10000000-ffff-ffff-ffff-000000000001', // Test site key
        url: 'https://hcaptcha.com/playground'
      }
    });

    console.log('✅ hCaptcha solving successful');
    console.log('Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ hCaptcha solving failed:', error.message);
    throw error;
  }
}

/**
 * Test captcha task creation and status checking
 */
async function testTaskCreationAndStatus() {
  try {
    console.log('Testing captcha task creation...');
    const task = await client.captcha.captchaCreate({
      actor: 'captcha.hcaptcha',
      input: {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        url: 'https://recaptcha-demo.appspot.com'
      }
    });

    console.log('✅ Task creation successful:', task.data.taskId);

    // Wait 5 seconds before checking status
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Testing captcha task status check...');
    const status = await client.captcha.captchaResultGet(task.data.taskId);

    console.log('✅ Task status check successful');
    console.log('Status:', JSON.stringify(status.data, null, 2));

    return { task: task.data, status: status.data };
  } catch (error) {
    console.error('❌ Task creation or status check failed:', error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Scrapeless Captcha Service Tests ===\n');

  try {
    // Test reCAPTCHA
    await testRecaptcha();
    console.log('\n');

    // Test hCaptcha
    await testHcaptcha();
    console.log('\n');

    // Test task creation and status
    await testTaskCreationAndStatus();
    console.log('\n');

    console.log('🎉 All tests completed');
  } catch (error) {
    console.error('❌ Error occurred during testing:', error);
  }
}

// Run tests
runTests().catch(console.error);

// If you need to run specific tests individually, uncomment the code below
// testRecaptcha().catch(console.error);
// testHcaptcha().catch(console.error);
// testTaskCreationAndStatus().catch(console.error);
