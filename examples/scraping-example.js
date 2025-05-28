import { ScrapelessClient, log } from '@scrapeless-ai/sdk';

const Log = log.withPrefix('Scraping');
const client = new ScrapelessClient({
  apiKey: process.env.SCRAPELESS_API_KEY || 'your-api-key'
});

async function googleSearch() {
  const task = await client.scraping.createTask({
    actor: 'scraper.google.search',
    input: {
      q: 'nike site:www.nike.com'
    }
  });
  if (task.status === 200) {
    console.log('result: ', task.data);
    return;
  }

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await client.scraping.getTaskResult(task.data.taskId);
    if (result.status === 200) {
      console.log('result: ', result.data);
      return;
    }
  }
}

async function googleSearchByScrape() {
  const result = await client.scraping.scrape({
    actor: 'scraper.google.search',
    input: {
      q: 'nike site:www.nike.com'
    }
  });

  console.log('result: ', result);
}

function main() {
  googleSearch().catch(error => {
    Log.error(error);
  });

  googleSearchByScrape().catch(error => {
    Log.error(error);
  });
}

main();
