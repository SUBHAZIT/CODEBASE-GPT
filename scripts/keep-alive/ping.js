import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config.json');
const LOG_FILE = path.join(__dirname, 'keep-alive.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(`[${timestamp}] ${message}`);
}

async function pingEndpoint(project, endpoint) {
  const apiKey = process.env[project.apiKeyEnv];
  
  if (!apiKey) {
    logToFile(`Error: API Key not found in environment for ${project.name} (${project.apiKeyEnv})`);
    return { success: false, endpoint: endpoint.name, error: 'Missing API Key' };
  }

  try {
    logToFile(`Pinging ${project.name} - ${endpoint.name}...`);
    
    // Add a random delay if requested (up to 30 seconds)
    if (process.env.RANDOM_DELAY === 'true') {
      const delay = Math.floor(Math.random() * 30000);
      logToFile(`Adding random delay of ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const response = await fetch(endpoint.url, {
      method: endpoint.method || 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      logToFile(`Success: ${project.name} - ${endpoint.name} responded with status ${response.status}`);
      return { success: true, endpoint: endpoint.name, status: response.status };
    } else {
      // Some endpoints might return 401/404 but still "touch" the project to keep it warm
      logToFile(`Warning: ${project.name} - ${endpoint.name} responded with status ${response.status}`);
      return { success: response.status < 500, endpoint: endpoint.name, status: response.status };
    }
  } catch (error) {
    logToFile(`Error: Failed to ping ${project.name} - ${endpoint.name}: ${error.message}`);
    return { success: false, endpoint: endpoint.name, error: error.message };
  }
}

async function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    logToFile(`Error: Configuration file not found at ${CONFIG_PATH}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const allResults = [];

  for (const project of config) {
    for (const endpoint of project.endpoints) {
      const result = await pingEndpoint(project, endpoint);
      allResults.push({ project: project.name, ...result });
    }
  }

  const failed = allResults.filter(r => !r.success);
  if (failed.length > 0) {
    logToFile(`Completed with ${failed.length} failures out of ${allResults.length} pings.`);
    // If all pings for a project failed, we might have a problem
    if (failed.length === allResults.length) {
      process.exit(1);
    }
  } else {
    logToFile(`All projects and endpoints pinged successfully.`);
  }
}

main();
