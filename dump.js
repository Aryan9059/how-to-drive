const fs = require('fs');
const dump = (p) => { 
  try { 
    const buf = fs.readFileSync(p); 
    const chunkLen = buf.readUInt32LE(12); 
    // Strip trailing nulls and spaces from JSON chunk (GLTF padding)
    const str = buf.toString('utf8', 20, 20+chunkLen).replace(/[\0\s]+$/g, ''); 
    const json = JSON.parse(str);
    const names = json.nodes.map(n => n.name);
    fs.appendFileSync('dump.txt', `--- ${p} ---\n${names.join(', ')}\n\n`);
  } catch (e) { 
    fs.appendFileSync('dump.txt', `Error on ${p}: ${e.message}\n`);
  } 
}; 
fs.writeFileSync('dump.txt', '');
dump('public/models/car.glb'); 
dump('public/models/car2.glb');
