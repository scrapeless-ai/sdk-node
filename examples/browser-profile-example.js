import { ScrapelessClient } from '@scrapeless-ai/sdk';

async function runExample() {
  const client = new ScrapelessClient();

  // Create a new profile
  const createResponse = await client.profiles.create('My Profile');
  console.log('Profile created:', createResponse);

  // List profiles
  const profiles = await client.profiles.list({ page: 1, pageSize: 10 });
  console.log('Profiles:', profiles.docs);

  // Get a specific profile
  const profile = await client.profiles.get(createResponse.profileId);
  console.log('Profile details:', profile);

  // Delete the profile
  const deleteResponse = await client.profiles.delete(createResponse.profileId);
  console.log('Profile deleted:', deleteResponse);

  console.log('Example completed successfully');
}

// Run the example
runExample().catch(console.error);
