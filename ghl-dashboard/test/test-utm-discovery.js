// Test script to verify UTM field discovery is working
// Run with: node test/test-utm-discovery.js

async function testUTMDiscovery() {
  try {
    console.log('🧪 Testing UTM Field Discovery...\n');
    
    const response = await fetch('http://localhost:3000/api/debug-utm-fields');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API call successful!\n');
    console.log('📊 Summary:');
    console.log(`- Total contacts checked: ${data.summary.totalContactsChecked}`);
    console.log(`- Total tracking fields found: ${data.summary.totalTrackingFieldsFound}`);
    console.log(`- UTM fields count: ${data.summary.utmFieldsCount}`);
    console.log(`- Campaign fields count: ${data.summary.campaignFieldsCount}`);
    
    if (data.categorized.utmFields.length > 0) {
      console.log('\n🎯 UTM Fields Found:');
      data.categorized.utmFields.forEach(field => {
        console.log(`\n  Field: ${field.name}`);
        console.log(`  ID: ${field.id}`);
        console.log(`  Count: ${field.count}`);
        if (field.sampleValues.length > 0) {
          console.log(`  Sample: ${field.sampleValues[0].substring(0, 100)}...`);
        }
      });
    }
    
    if (data.recentContactsWithUTM.length > 0) {
      console.log('\n📧 Recent Contacts with UTM Data:');
      data.recentContactsWithUTM.forEach(contact => {
        console.log(`\n  ${contact.name} (${contact.dateAdded})`);
        if (contact.utmFields && contact.utmFields.length > 0) {
          contact.utmFields.forEach(field => {
            console.log(`    - ${field.name}: ${field.value.substring(0, 50)}...`);
          });
        }
      });
    }
    
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nMake sure the development server is running on http://localhost:3000');
  }
}

// Run the test
testUTMDiscovery();
