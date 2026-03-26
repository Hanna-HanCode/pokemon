import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/poketcg',
});

export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  }
};
