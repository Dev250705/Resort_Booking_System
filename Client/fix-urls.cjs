const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/Resort_Booking_System/Client/src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('https://resort-booking-system-cizy.vercel.app')) {
    // This matches: "https://resort-booking-system-cizy.vercel.app/some/path", 'http...', or `http...`
    // and replaces it with a template literal using window.location.hostname
    const newContent = content.replace(/(['"`])http:\/\/localhost:5000(.*?)\1/g, '`https://resort-booking-system-cizy.vercel.app$2`');
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Fixed ' + file);
      count++;
    }
  }
});
console.log(`Replacement complete. Modified ${count} files.`);
