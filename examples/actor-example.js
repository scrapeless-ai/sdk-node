/**
 * Complete Actor Usage Example
 * Demonstrates how to use various features of the Actor class
 */
import { Actor } from '@scrapeless-ai/sdk';

// Mock environment variables - in a real Actor runtime, these would be set by the platform
process.env.SCRAPELESS_ACTOR_ID = 'act_12345';
process.env.SCRAPELESS_RUN_ID = 'run_67890';
process.env.SCRAPELESS_USER_ID = 'user_12345';
process.env.SCRAPELESS_TEAM_ID = 'team_12345';
process.env.SCRAPELESS_API_KEY = 'your_api_key_here';
process.env.SCRAPELESS_DATASET_ID = 'dat_12345';
process.env.SCRAPELESS_KV_NAMESPACE_ID = 'ns_12345';
process.env.SCRAPELESS_BUCKET_ID = 'buck_12345';
process.env.SCRAPELESS_QUEUE_ID = 'q_12345';
process.env.SCRAPELESS_INPUT = JSON.stringify({
  url: 'https://example.com',
  maxResults: 10,
  keywords: ['apple', 'banana', 'orange'],
  useProxy: true,
  captcha: {
    enabled: true,
    type: 'recaptcha'
  },
  options: {
    headless: false,
    screenshot: true,
    waitTime: 5000
  }
});

/**
 * Run the complete Actor example
 */
async function runActorExample() {
  console.log('Starting Actor example execution');

  try {
    // 1. Initialize Actor
    const actor = new Actor();
    console.log('Actor initialized');

    // 2. Get input data
    const input = actor.input();
    console.log('Actor input data:', input);

    // 3. Dataset operations
    console.log('\n--- Dataset Operations ---');
    try {
      const datasetId = process.env.SCRAPELESS_DATASET_ID;

      // Add items to dataset
      const items = input.keywords.map(keyword => ({
        keyword,
        url: input.url,
        timestamp: new Date().toISOString()
      }));

      // Use Actor convenience method to add data
      const addResult = await actor.addItems(items);
      console.log('Added data to dataset:', addResult);

      // Get data from dataset
      const getResult = await actor.getItems({ page: 1, pageSize: 10 });
      console.log('Retrieved data from dataset:', getResult);

      // You can also use the underlying API directly
      console.log('Using underlying API to operate on datasets');
      await actor.storage.dataset.createDataset('New Dataset');
      // In a real scenario, you might want to store the returned dataset ID for later use
    } catch (error) {
      console.error('Dataset operations error:', error.message);
    }

    // 4. KV storage operations
    console.log('\n--- KV Storage Operations ---');
    try {
      const namespaceId = process.env.SCRAPELESS_KV_NAMESPACE_ID;

      // Store data
      await actor.setValue({
        key: 'last_run',
        value: new Date().toISOString()
      });
      console.log('Set KV value successfully');

      // Retrieve data
      const lastRun = await actor.getValue('last_run');
      console.log('Retrieved KV value:', lastRun);

      // Store structured data
      await actor.setValue({
        key: 'config',
        value: JSON.stringify(input.options)
      });

      // Retrieve and parse structured data
      const configStr = await actor.getValue('config');
      const config = JSON.parse(configStr);
      console.log('Parsed configuration:', config);
    } catch (error) {
      console.error('KV storage operations error:', error.message);
    }

    // 5. Object storage operations
    console.log('\n--- Object Storage Operations ---');
    try {
      const bucketId = process.env.SCRAPELESS_BUCKET_ID;

      // In a real environment, you can upload files here
      // Due to example environment limitations, only showing the code
      /*
      // Upload file to object storage
      const uploadResult = await actor.putObject({
        file: './screenshot.png'
      });
      console.log('File upload result:', uploadResult);
      
      // Download file
      const fileBlob = await actor.getObject(uploadResult.object_id);
      */

      console.log('Object storage operations example (for use in real environment)');
    } catch (error) {
      console.error('Object storage operations error:', error.message);
    }

    // 6. Queue operations
    console.log('\n--- Queue Operations ---');
    try {
      const queueId = process.env.SCRAPELESS_QUEUE_ID;

      // Push message to queue
      const pushResult = await actor.pushMessage({
        body: {
          task: 'process_url',
          params: {
            url: input.url,
            keywords: input.keywords
          }
        }
      });
      console.log('Pushed message to queue:', pushResult);

      // Pull message from queue
      const pullResult = await actor.pullMessage();
      console.log('Pulled message from queue:', pullResult);

      // Acknowledge message completion
      if (pullResult && pullResult.length > 0) {
        const ackResult = await actor.ackMessage(pullResult[0].id);
        console.log('Acknowledged message completion:', ackResult);
      }
    } catch (error) {
      console.error('Queue operations error:', error.message);
    }

    // 7. Browser automation
    console.log('\n--- Browser Automation ---');
    try {
      // Create browser session
      console.log('In a real environment, this would create a browser session for automation');

      /*
      // Create browser session
      const sessionOptions = {
        session_ttl: 180,
        proxy_country: input.useProxy ? 'US' : null,
        session_recording: true,
        ...input.options
      };
      
      const browserSession = await actor.browser.createSession(sessionOptions);
      console.log('Browser session created successfully:', browserSession);
      
      // Navigate to webpage
      const navigateResult = await actor.browser.navigate({
        session_id: browserSession.id,
        url: input.url,
        wait_until: 'networkidle2'
      });
      
      // Take screenshot
      if (input.options.screenshot) {
        const screenshotResult = await actor.browser.screenshot({
          session_id: browserSession.id
        });
        
        // Save screenshot to object storage
        await actor.putObject({
          file: screenshotResult.data
        });
      }
      
      // Extract data
      const extractResult = await actor.browser.evaluate({
        session_id: browserSession.id,
        script: `
          return {
            title: document.title,
            links: Array.from(document.querySelectorAll('a')).map(a => ({
              text: a.innerText,
              href: a.href
            })).slice(0, ${input.maxResults})
          }
        `
      });
      
      // Save extracted data to dataset
      await actor.addItems([{
        url: input.url,
        data: extractResult.result,
        timestamp: new Date().toISOString()
      }]);
      
      // Close session
      await actor.browser.closeSession({
        session_id: browserSession.id
      });
      */
    } catch (error) {
      console.error('Browser automation error:', error.message);
    }

    // 8. CAPTCHA solving
    console.log('\n--- CAPTCHA Solving ---');
    try {
      if (input.captcha && input.captcha.enabled) {
        console.log('In a real environment, this would handle CAPTCHAs');

        /*
        // Solve reCAPTCHA
        const captchaResult = await actor.captcha.solveRecaptcha({
          websiteURL: input.url,
          websiteKey: 'site-key-here',
          invisible: false
        });
        
        console.log('CAPTCHA solving result:', captchaResult);
        */
      }
    } catch (error) {
      console.error('CAPTCHA solving error:', error.message);
    }

    // 9. Proxy usage
    console.log('\n--- Proxy Usage ---');
    try {
      if (input.useProxy) {
        console.log('In a real environment, this would obtain and use proxies');

        /*
        // Get proxy
        const proxy = await actor.proxy.getSession({
          country: 'US',
          session_ttl: 180
        });
        
        console.log('Proxy session:', proxy);
        */
      }
    } catch (error) {
      console.error('Proxy usage error:', error.message);
    }

    // 10. Actor execution
    console.log('\n--- Actor Execution ---');
    try {
      console.log('In a real environment, this would run other Actors');

      /*
      // Run another Actor
      const runOptions = {
        actorId: 'another-actor-id',
        input: {
          url: input.url,
          processData: true
        }
      };
      
      const runResult = await actor.runner.run(runOptions);
      console.log('Actor run result:', runResult);
      */
    } catch (error) {
      console.error('Actor execution error:', error.message);
    }

    console.log('\nActor example execution completed');
  } catch (error) {
    console.error('Actor example execution error:', error);
  }
}

// Run the example
runActorExample().catch(console.error);
