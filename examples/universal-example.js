import { Universal } from '@scrapeless-ai/sdk';

const universal = new Universal({ timeout: 60000 });

async function jsRender() {
  const result = await universal.jsRender({
    actor: 'unlocker.webunlocker',
    input: {
      url: 'https://www.scrapeless.com',
      jsRender: {
        enabled: true,
        headless: true,
        instructions: [
          {
            waitFor: ['main', 30000]
          },
          {
            evaluate: 'window.scrollTo(0, document.body.scrollHeight)'
          }
        ],
        block: {
          resources: ['image']
        },
        response: {
          type: 'content'
        }
      }
    }
  });

  console.log('Result:', result);
}

async function webUnlocker() {
  const result = await universal.webUnlocker({
    actor: 'unlocker.webunlocker',
    input: {
      url: 'https://www.google.com',
      redirect: false,
      method: 'GET'
    }
  });

  console.log('Result:', result);
}

async function main() {
  // Uncomment the function you want to run
  await jsRender();
  await webUnlocker();
}

main().catch(console.error);
