#!/usr/bin/env node

/**
 * API Testing Script for AI-powered Educational Companion App Backend
 * 
 * This scri        logTest('Get All Channels', true, `Found ${channels.length} channels: ${channels.map(c => c.title || 'Untitled').join(', ')}`;t tests all the main backend endpoints to verify functionality.
 * Make sure the backend server is running on http://localhost:3000 before running this script.
 * 
 * Usage: node test-api.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const httpModule = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = httpModule.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          // If response is not JSON, return as text
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test result logging
function logTest(testName, success, details = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  console.log('');
}

// Main testing function
async function runTests() {
  console.log('🚀 Starting API Tests for AI-powered Educational Companion App\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  
  let totalTests = 0;
  let passedTests = 0;

  try {
    // Test 1: Health Check
    totalTests++;
    console.log('📋 Test 1: Health Check Endpoint');
    try {
      const response = await makeRequest(`${BASE_URL}/health`);
      
      if (response.statusCode === 200) {
        passedTests++;
        logTest('Health Check', true, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      } else {
        logTest('Health Check', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('Health Check', false, `Error: ${error.message}`);
    }

    // Test 2: Get All Channels
    totalTests++;
    console.log('📋 Test 2: Get All Channels');
    try {
      const response = await makeRequest(`${BASE_URL}/api/channels`);
      
      if (response.statusCode === 200 && response.data.success) {
        const channels = response.data.data;
        passedTests++;
        logTest('Get All Channels', true, `Found ${channels.length} channels: ${channels.map(c => c.name).join(', ')}`);
      } else {
        logTest('Get All Channels', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('Get All Channels', false, `Error: ${error.message}`);
    }

    // Test 3: Get Random Videos
    totalTests++;
    console.log('📋 Test 3: Get Random Videos');
    try {
      const response = await makeRequest(`${BASE_URL}/api/videos/random?limit=5`);
      
      if (response.statusCode === 200 && response.data.success) {
        const videos = response.data.data;
        passedTests++;
        logTest('Get Random Videos', true, `Found ${videos.length} videos: ${videos.map(v => v.title).join(', ')}`);
      } else {
        logTest('Get Random Videos', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('Get Random Videos', false, `Error: ${error.message}`);
    }

    // Test 4: AI Health Check
    totalTests++;
    console.log('📋 Test 4: AI Health Check');
    try {
      const response = await makeRequest(`${BASE_URL}/api/ai/health`);
      
      if (response.statusCode === 200) {
        passedTests++;
        logTest('AI Health Check', true, `Gemini API: ${response.data.gemini ? 'Connected' : 'Not Connected'}, Qdrant: ${response.data.qdrant ? 'Connected' : 'Not Connected'}`);
      } else {
        logTest('AI Health Check', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('AI Health Check', false, `Error: ${error.message}`);
    }

    // Test 5: Get Specific Channel (if channels exist)
    totalTests++;
    console.log('📋 Test 5: Get Specific Channel');
    try {
      // First get all channels to find one to test with
      const channelsResponse = await makeRequest(`${BASE_URL}/api/channels`);
      
      if (channelsResponse.statusCode === 200 && channelsResponse.data.data.length > 0) {
        const firstChannel = channelsResponse.data.data[0];
        const response = await makeRequest(`${BASE_URL}/api/channels/${firstChannel.channelId}`);
        
        if (response.statusCode === 200 && response.data.success) {
          passedTests++;
          logTest('Get Specific Channel', true, `Channel: ${response.data.data.title || 'Untitled'}, Videos: ${response.data.data.videos?.length || 0}`);
        } else {
          logTest('Get Specific Channel', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
        }
      } else {
        logTest('Get Specific Channel', false, 'No channels available to test with');
      }
    } catch (error) {
      logTest('Get Specific Channel', false, `Error: ${error.message}`);
    }

    // Test 6: Search Videos
    totalTests++;
    console.log('📋 Test 6: Search Videos');
    try {
      const response = await makeRequest(`${BASE_URL}/api/videos/search?query=physics&limit=3`);
      
      if (response.statusCode === 200) {
        const videos = response.data.data || [];
        passedTests++;
        logTest('Search Videos', true, `Found ${videos.length} videos matching "physics"`);
      } else {
        logTest('Search Videos', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('Search Videos', false, `Error: ${error.message}`);
    }

    // Test 7: Get NCERT Concepts (if any exist)
    totalTests++;
    console.log('📋 Test 7: Get NCERT Concepts');
    try {
      const response = await makeRequest(`${BASE_URL}/api/concepts`);
      
      if (response.statusCode === 200) {
        const concepts = response.data.data || [];
        passedTests++;
        logTest('Get NCERT Concepts', true, `Found ${concepts.length} concepts`);
        if (concepts.length > 0) {
          console.log(`   Sample concepts: ${concepts.slice(0, 3).map(c => c.title).join(', ')}`);
        }
      } else {
        logTest('Get NCERT Concepts', false, `Status: ${response.statusCode}, Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      logTest('Get NCERT Concepts', false, `Error: ${error.message}`);
    }

    // Test 8: Test Invalid Endpoint (should return 404)
    totalTests++;
    console.log('📋 Test 8: Invalid Endpoint (should fail)');
    try {
      const response = await makeRequest(`${BASE_URL}/api/nonexistent`);
      
      if (response.statusCode === 404) {
        passedTests++;
        logTest('Invalid Endpoint', true, 'Correctly returned 404 for non-existent endpoint');
      } else {
        logTest('Invalid Endpoint', false, `Expected 404, got ${response.statusCode}`);
      }
    } catch (error) {
      logTest('Invalid Endpoint', false, `Error: ${error.message}`);
    }

  } catch (globalError) {
    console.error('❌ Global test error:', globalError.message);
  }

  // Summary
  console.log('═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above for details.');
    console.log('💡 Common issues:');
    console.log('   - Make sure the backend server is running on port 3000');
    console.log('   - Check if MongoDB is connected and seeded with data');
    console.log('   - Verify API keys in .env file for external services');
  }
  
  console.log('\n🔗 To start the backend server: cd backend && pnpm run dev');
}

// Check if server is running before starting tests
async function checkServerHealth() {
  try {
    console.log('🔍 Checking if backend server is running...\n');
    await makeRequest(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    console.error('❌ Backend server is not running or not accessible.');
    console.error('💡 Please start the backend server first:');
    console.error('   cd backend && pnpm run dev\n');
    console.error(`Error details: ${error.message}\n`);
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServerHealth();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
