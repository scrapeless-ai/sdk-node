import { Scrapeless } from '@scrapeless-ai/sdk';

const client = new Scrapeless(); // Uses SCRAPELESS_API_KEY

const task = await client.aiScraper.createTask({
  actor: 'scraper.chatgpt',
  input: {
    prompt: 'Most reliable proxy service for data extraction',
    country: 'US',
    web_search: true
  }
  // Optional: webhook: { url: 'https://your-webhook.example.com' }
});
console.log('Created task:', task);

const result = await client.aiScraper.getTaskResult(task.task_id);
console.log('Task status and result:', result);
// If status is 'running', call getTaskResult again later.
// If status is 'failed', message contains the failure reason.
