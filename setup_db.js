import pkg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pkg;

async function setup() {
  const defaultClient = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });

  try {
    console.log('Connecting to default postgres database...');
    await defaultClient.connect();
    
    console.log('Checking if database poketcg exists...');
    const result = await defaultClient.query("SELECT 1 FROM pg_database WHERE datname='poketcg'");
    if (result.rowCount === 0) {
      console.log('Creating database poketcg...');
      await defaultClient.query('CREATE DATABASE poketcg');
    } else {
      console.log('Database poketcg already exists.');
    }
  } catch (error) {
    console.error('Failed to configure database:', error.message);
    process.exit(1);
  } finally {
    await defaultClient.end();
  }

  const targetClient = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/poketcg'
  });

  try {
    console.log('Connecting to poketcg database...');
    await targetClient.connect();

    console.log('Executing schema.sql...');
    const schemaPath = path.resolve('src/lib/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await targetClient.query(schemaSql);
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Failed to execute schema:', error.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

setup();
