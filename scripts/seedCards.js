import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

// Configurações de Banco de Dados (Refletindo src/lib/db/index.ts para consistência)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const API_URL = 'https://api.pokemontcg.io/v2/cards';
const PAGE_SIZE = 250;

async function seedCards() {
  let page = 1;
  let totalInserted = 0;
  let hasMore = true;

  console.log('--- Iniciando Ingestão de Cartas ---');

  while (hasMore) {
    try {
      console.log(`[API] Buscando página ${page} (pageSize=${PAGE_SIZE})...`);
      const response = await fetch(`${API_URL}?page=${page}&pageSize=${PAGE_SIZE}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const cards = data.data;

      if (!cards || cards.length === 0) {
        hasMore = false;
        console.log('[API] Fim dos dados.');
        break;
      }

      console.log(`[SYNC] Inserindo ${cards.length} cartas no banco...`);
      
      let batchInserted = 0;
      for (const card of cards) {
        const { id, name, set, images, number } = card;
        const setName = set.name;
        const imageUrl = images.large || images.small;
        const collectorNumber = number;

        try {
          await pool.query(
            `INSERT INTO cards (id, name, set, image, collector_number)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [id, name, setName, imageUrl, collectorNumber]
          );
          batchInserted++;
        } catch (dbErr) {
          console.error(`[DB] Erro ao inserir carta ${id}:`, dbErr.message);
        }
      }

      totalInserted += batchInserted;
      console.log(`[PÁGINA ${page}] Sucesso: ${batchInserted} cartas. Total acumulado: ${totalInserted}`);

      if (cards.length < PAGE_SIZE) {
        hasMore = false;
        console.log('[API] Última página alcançada.');
      } else {
        page++;
      }

    } catch (err) {
      console.error(`[ERRO] Falha na página ${page}:`, err.message);
      // Tentativa de continuar para a próxima página ou parar
      break; 
    }
  }

  console.log('--- Ingestão Concluída ---');
  console.log(`Total final de cartas processadas: ${totalInserted}`);
  await pool.end();
}

seedCards().catch(err => {
  console.error('[FATAL] Script falhou:', err);
  process.exit(1);
});
