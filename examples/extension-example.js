import { Scrapeless } from '@scrapeless-ai/sdk';
import puppeteer from 'puppeteer-core';

const client = new Scrapeless();
const { browser: scrapingBrowser } = client;

async function uploadExtension() {
  const response = await scrapingBrowser.extension.upload('your-file-path.zip', 'Scrapeless');
  console.log(response);
}

async function updateExtension(extensionId) {
  const response = await scrapingBrowser.extension.update(extensionId, 'your-file-path.zip', 'Scrapeless');
  console.log(response);
}

async function listExtensions() {
  const response = await scrapingBrowser.extension.list();
  console.log(response);
}

async function deleteExtension(extensionId) {
  const response = await scrapingBrowser.extension.delete(extensionId);
  console.log(response);
}

async function getExtension(extensionId) {
  const response = await scrapingBrowser.extension.get(extensionId);
  console.log(response);
}

async function useExtension(extensionIds) {
  const { browserWSEndpoint } = scrapingBrowser.create({
    sessionName: 'use-extension',
    sessionTTL: 180,
    sessionRecording: true,
    extensionIds: extensionIds
  });

  const browser = await puppeteer.connect({
    browserWSEndpoint,
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto('https://example.com');
}

async function runExtensionTests() {
  try {
    console.log('=== Scrapeless Browser Extension Tests ===\n');

    // Upload a new extension
    await uploadExtension();
    console.log('\n');

    // List all extensions
    await listExtensions();
    console.log('\n');

    // Get details of a specific extension (replace with actual ID)
    const extensionId = 'your-extension-id-here'; // Replace with actual extension ID
    await getExtension(extensionId);
    console.log('\n');

    // Update the extension (replace with actual ID)
    await updateExtension(extensionId);
    console.log('\n');

    // Delete the extension (replace with actual ID)
    await deleteExtension(extensionId);
    console.log('\n');

    // Use the extension in a new browser session
    await useExtension(extensionId);
    console.log('\n');

    console.log('🎉 All extension tests completed successfully');
  } catch (error) {
    console.error('❌ Extension tests failed with error:', error);
  }
}

// Run the extension tests
runExtensionTests().catch(console.error);
