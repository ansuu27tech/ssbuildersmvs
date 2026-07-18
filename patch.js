const fs = require('fs');
const files = ['js/animations.js', 'js/pages.js', 'js/hero-cinematic.js'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Only patch if it looks like a GSAP end tween containing opacity: 1 and missing clearProps
    if (lines[i].includes('opacity: 1') && !lines[i].includes('clearProps')) {
      lines[i] = lines[i].replace('opacity: 1', 'opacity: 1, clearProps: "all"');
    }
  }
  fs.writeFileSync(file, lines.join('\n'));
});
