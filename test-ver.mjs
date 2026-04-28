import { JSDOM } from 'jsdom';
async function run() {
  const html = await fetch('https://tasnim-power-engineering.vercel.app/').then(r => r.text());
  const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "https://tasnim-power-engineering.vercel.app/" });
  dom.window.console.error = (...args) => console.log('ERROR:', ...args);
  dom.window.console.warn = (...args) => console.log('WARN:', ...args);
  dom.window.console.log = (...args) => console.log('LOG:', ...args);
  setTimeout(() => process.exit(0), 4000);
}
run();
