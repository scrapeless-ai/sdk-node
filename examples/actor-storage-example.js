/**
 * Example: Demonstrating how to use Actor storage methods with environment variables
 * This simulates the environment in which your Actor would run
 */
import { Actor } from '@scrapeless-ai/sdk';

// Mock environment variables for testing
// In a real Actor runtime, these would be set by the platform
process.env.SCRAPELESS_INPUT = JSON.stringify({
  keywords: ['apple', 'banana', 'orange'],
  maxResults: 10
});

async function runActorExample() {
  try {
    console.log('Starting Actor storage example');

    // Initialize Actor
    const actor = new Actor();

    // Get input data from environment
    const input = await actor.input();
    console.log('Actor input:', input);

    // Dataset operations
    console.log('\n--- Dataset operations ---');
    try {
      // Get dataset ID from environment
      const datasetId = process.env.SCRAPELESS_DATASET_ID;

      // Add items to dataset (using Actor convenience method)
      const items = input.keywords.map(keyword => ({
        keyword,
        timestamp: new Date().toISOString()
      }));
      const addResult = await actor.addItems(items);
      console.log('Added items to dataset:', addResult);

      // Get items from dataset (using Actor convenience method)
      const getResult = await actor.getItems({ page: 1, pageSize: 10 });
      console.log('Items from dataset:', getResult);

      // Using direct storage service
      const getResultDirect = await actor.storage.dataset.getItems(datasetId, {
        page: 1,
        pageSize: 10
      });
      console.log('Direct API call result matches:', getResultDirect === getResult);
    } catch (error) {
      console.error('Dataset operations error:', error.message);
    }

    // KV storage operations
    console.log('\n--- KV storage operations ---');
    try {
      // Get KV namespace ID from environment
      const namespaceId = process.env.SCRAPELESS_KV_NAMESPACE_ID;

      // Set value (using Actor convenience method)
      const setValue = await actor.setValue({
        key: 'last_run',
        value: new Date().toISOString()
      });
      console.log('Set KV value:', setValue);

      // Get value (using Actor convenience method)
      const getValue = await actor.getValue('last_run');
      console.log('Get KV value:', getValue);

      // Using direct storage service
      const getValueDirect = await actor.storage.kv.getValue(namespaceId, 'last_run');
      console.log('Direct API call result matches:', getValueDirect === getValue);
    } catch (error) {
      console.error('KV storage operations error:', error.message);
    }

    // // Object storage operations
    // console.log('\n--- Object storage operations ---');
    // try {
    //   // Get bucket ID from environment
    //   const bucketId = process.env.SCRAPELESS_BUCKET_ID;
    //
    //   // Upload object (simulated - would fail in real execution without a file)
    //   console.log(`Would upload to bucket ${bucketId}`);
    //
    //   // List objects (using direct storage service)
    //   // actor.storage.object.list(bucketId, { page: 1, pageSize: 10 });
    //   console.log('Object list would be called with bucketId:', bucketId);
    // } catch (error) {
    //   console.error('Object storage operations error:', error.message);
    // }

    // Queue operations
    console.log('\n--- Queue operations ---');
    try {
      // Get queue ID from environment
      const queueId = process.env.SCRAPELESS_QUEUE_ID;

      // Push message to queue (using Actor convenience method)
      const pushResult = await actor.pushMessage({
        body: {
          task: 'process_data',
          params: { id: 123 }
        }
      });
      console.log('Pushed message to queue:', pushResult);

      // Pull message from queue (using Actor convenience method)
      const pullResult = await actor.pullMessage();
      console.log('Pulled message from queue:', pullResult);

      // Acknowledge message (using Actor convenience method)
      if (pullResult && pullResult.length > 0) {
        const ackResult = await actor.ackMessage(pullResult[0].id);
        console.log('Acknowledged message:', ackResult);
      }

      // Using direct storage service
      const pullResultDirect = await actor.storage.queue.pull(queueId);
      console.log('Direct API call example for pull:', pullResultDirect.length === pullResult.length);
    } catch (error) {
      console.error('Queue operations error:', error.message);
    }

    // Vector operations
    console.log('\n--- Vector operations ---');
    try {
      // Get collection ID from environment
      const collectionId = process.env.SCRAPELESS_COLLECTION_ID;

      // Create docs to collection (using Actor convenience method)
      const opResponse = await actor.createDocs([
        {
          vector: [], // your text vector
          content: '' // your text
        }
      ]);
      console.log('Create docs to collection:', opResponse);

      const queryParam = {
        vector: [], // your query vector
        topk: 1,
        includeContent: true,
        includeVector: true
      };

      // Query docs from collection (using Actor convenience method)
      const queryResult = await actor.queryDocs(queryParam);

      console.log('Query docs:', docs);

      // Using direct storage service
      const queryResultDirect = await actor.storage.vector.queryDocs(collectionId, queryParam);
      console.log('Direct API call example for pull:', queryResultDirect.length === queryResult.length);
    } catch (error) {
      console.error('Vector operations error:', error.message);
    }
  } catch (error) {
    console.error('Actor example error:', error);
  }
}

// Run the example
runActorExample().catch(console.error);
