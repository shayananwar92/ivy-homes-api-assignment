import fs from 'fs';

const BASE_URL = 'https://solve.ivy.homes';
const API_KEY = 'IVY26-355F3CA5026E';

async function login() {
    console.log("Logging in to get authentication token...");
    
    const url = `${BASE_URL}/auth/login`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        },
        body: JSON.stringify({ 
            email: "demo1@ivy.homes", 
            password: "03196253a8" 
        })
    });

    if (!response.ok) {
        console.error("Login failed:", response.status, await response.text());
        return null;
    }
    
    const data = await response.json();
    console.log("Login successful!\n");
    console.log("Here is the real data:", data);
    return data.access_token;
}

async function fetchAllData(endpoint, filename, token) {
    let page = 1;
    const limit = 200;
    let allResults = [];
    let totalExpected = null;

    console.log(`Starting download for ${endpoint}...`);

    while (true) {
        const url = `${BASE_URL}${endpoint}?page=${page}&limit=${limit}`;
        
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'X-API-Key': API_KEY // And added it to the headers here!
            }
        });
        
        if (!response.ok) {
            console.error(`Error on page ${page}:`, response.status, await response.text());
            break;
        }
        
        const data = await response.json();
        
        if (totalExpected === null) totalExpected = data.total;
        allResults.push(...data.results);
        
        console.log(`Fetched ${allResults.length} / ${totalExpected} records...`);
        
        if (allResults.length >= totalExpected || data.results.length === 0) {
            break;
        }
        page++;
    }

    fs.writeFileSync(filename, JSON.stringify(allResults, null, 2));
    console.log(`✅ Saved all ${endpoint} to ${filename}\n`);
}

async function run() {
    const token = await login();
    
    if (token) {
        await fetchAllData('/v1/listings', 'listings.json', token);
        await fetchAllData('/v1/rentals', 'rentals.json', token);
        await fetchAllData('/v1/projects', 'projects.json', token);
    }
}

run();