/**
 * Example: Demonstrating how to use the Scrapeless SDK storage module
 * Filename: storage-example.mjs
 */
import { ScrapelessClient } from '@scrapeless-ai/sdk';

/**
 * Demonstrates how to create and use the dataset storage
 */
async function datasetExample(client) {
  try {
    console.log('Dataset example:');

    // Create a new dataset
    const dataset = await client.storage.dataset.createDataset('products-data');
    console.log(`Dataset created with ID: ${dataset.id}`);

    // Add items to the dataset
    await client.storage.dataset.addItems([
      { name: 'Product 1', price: 19.99, category: 'Electronics' },
      { name: 'Product 2', price: 29.99, category: 'Home' },
      { name: 'Product 3', price: 9.99, category: 'Clothing' }
    ]);
    console.log('Items added to dataset');

    // Get items from the dataset
    const items = await client.storage.dataset.getItems({
      page: 1,
      pageSize: 10
    });
    console.log('Dataset items:', items);

    console.log('Dataset example completed\n');
  } catch (error) {
    console.error('Dataset example error:', error);
  }
}

/**
 * Demonstrates how to create and use the key-value storage
 */
async function kvStorageExample(client) {
  try {
    console.log('Key-Value storage example:');

    // Create a new KV namespace
    const namespace = await client.storage.kv.createNamespace('config-store');
    console.log(`KV namespace created with ID: ${namespace.id}`);

    // Set values in the namespace
    await client.storage.kv.setValue({
      key: 'appConfig',
      value: JSON.stringify({
        apiVersion: '1.0',
        features: {
          darkMode: true,
          notifications: true
        }
      })
    });
    console.log('Value set in KV store');

    // Get value from the namespace
    const config = await client.storage.kv.getValue('appConfig');
    console.log('Retrieved config:', JSON.parse(config));

    // List keys in the namespace
    const keys = await client.storage.kv.listKeys({ page: 1, pageSize: 10 });
    console.log('KV store keys:', keys);

    console.log('KV storage example completed\n');
  } catch (error) {
    console.error('KV storage example error:', error);
  }
}

/**
 * Demonstrates how to create and use the object storage
 */
async function objectStorageExample(client) {
  try {
    console.log('Object storage example:');

    // Create a new bucket
    const bucket = await client.storage.object.createBucket({
      name: 'images-bucket',
      description: 'Storage for product images'
    });
    console.log(`Object bucket created with ID: ${bucket.id}`);

    // Upload a file to the bucket (in a real scenario, you would use a real file path)
    const uploadResult = await client.storage.object.put({
      file: 'example/sample-image.jpg'
    });
    console.log('File uploaded to object storage:', uploadResult);

    // List objects in the bucket
    const objects = await client.storage.object.list({ page: 1, pageSize: 10 });
    console.log('Objects in bucket:', objects);

    console.log('Object storage example completed\n');
  } catch (error) {
    console.error('Object storage example error:', error);
  }
}

/**
 * Demonstrates how to create and use the queue storage
 */
async function queueStorageExample(client) {
  try {
    console.log('Queue storage example:');

    // Create a new queue
    const queue = await client.storage.queue.create({
      name: 'processing-tasks',
      description: 'Queue for processing tasks'
    });
    console.log(`Queue created with ID: ${queue.id}`);

    // Push messages to the queue
    const message1 = await client.storage.queue.push({
      name: 'processImage',
      payload: JSON.stringify({
        imageId: '123',
        effects: ['resize', 'grayscale']
      }),
      retry: 3,
      timeout: 300,
      deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    });
    console.log('Message pushed to queue:', message1);

    const message2 = await client.storage.queue.push({
      name: 'generateReport',
      payload: JSON.stringify({ reportType: 'monthly', format: 'pdf' }),
      retry: 2,
      timeout: 600,
      deadline: Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
    });
    console.log('Message pushed to queue:', message2);

    // Pull messages from the queue
    const messages = await client.storage.queue.pull();
    console.log('Messages pulled from queue:', messages);

    // Acknowledge a message (if any)
    if (messages && messages.length > 0) {
      await client.storage.queue.ack(messages[0].id);
      console.log(`Message ${messages[0].id} acknowledged`);
    }

    console.log('Queue storage example completed\n');
  } catch (error) {
    console.error('Queue storage example error:', error);
  }
}

/**
 * Demonstrates how to create and use the vector storage
 */
async function vectorStorageExample(client) {
  try {
    console.log('Vector storage example:');

    // Create a new collection
    const collection = await client.storage.vector.createCollection({
      name: 'my-collection',
      dimension: 1536,
      description: 'My first collection'
    });
    console.log(`Collection created with ID: ${collection.id}`);

    // Create collection docs
    const opResponse = await client.storage.vector.createDocs([
      {
        vector: [], // your text vector
        content: '' // your text
      }
    ]);
    console.log('Create docs to collection:', opResponse);

    // Query docs from collection
    const docs = await client.storage.vector.queryDocs(collection.id, {
      vector: [], // your search vector
      topk: 1,
      includeVector: true,
      includeContent: true
    });
    console.log('Query docs from collection:', docs);

    console.log('Vector storage example completed\n');
  } catch (error) {
    console.error('Vector storage example error:', error);
  }
}

/**
 * Main example function
 */
async function runExample() {
  try {
    // Initialize the Scrapeless client
    const client = new ScrapelessClient({
      apiKey: process.env.SCRAPELESS_API_KEY || 'your_api_key_here'
    });

    // Run the examples
    await datasetExample(client);
    await kvStorageExample(client);
    await objectStorageExample(client);
    await queueStorageExample(client);
    await vectorStorageExample(client);

    console.log('All storage examples completed successfully');
  } catch (error) {
    console.error('Example error:', error);
  }
}

// Run the example
runExample().catch(console.error);
