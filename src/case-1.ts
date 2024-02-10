import { arrayBuffer } from 'stream/consumers';
import { getConnection } from './get-connection.js';
import { readFile } from 'fs/promises';
const case1 = async () => {
  const connection = getConnection();
  await connection.execute('DROP TABLE IF EXISTS binary_test');
  await connection.execute(`
    CREATE TABLE binary_test (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        bytes longblob NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE InnoDB,
        CHARSET utf8mb4,
        COLLATE utf8mb4_unicode_ci;
    `
  );

  // the original case from https://github.com/planetscale/database-js/issues/161
  const minimalBuffer = Buffer.from('FDSF');
  // a real world case...
  const kittenBuffer = await readFile('./src/kitten.jpg');
  
  const inputBuffers: Buffer[] = [
    minimalBuffer,
    kittenBuffer
  ];
  // base64 encoded strings...
  const inputStrings: string[] = inputBuffers.map(b => b.toString('base64'));
  for (const s of inputStrings) {
    // insert as encoded string...
    await connection.execute('INSERT INTO `binary_test` (`bytes`) VALUES (?)', [s]);
  }


 
  const {rows} = await connection.execute<{id: string, bytes: string}>('SELECT * FROM binary_test');
  for(let i = 0; i < rows.length; i++) {
    const row = rows[i];
   
    console.log(row.id, inputStrings[i] === row.bytes)
  }
  

};

case1();
