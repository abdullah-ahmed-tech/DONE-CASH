import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}
catch(error){if(!process.env.DONECASH_NODE_MODULES)throw error;playwright=require(path.join(process.env.DONECASH_NODE_MODULES,'playwright'));}
const failures=[];
const results=[];
const verifyOnly=process.argv.includes('--verify-only');
async function walk(directory){
  const files=[];
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    if(['node_modules','.git'].includes(entry.name))continue;
    const item=path.join(directory,entry.name);
    if(entry.isDirectory())files.push(...await walk(item));else files.push(item);
  }
  return files;
}
const files=await walk(root);
const texts=files.filter(file=>/\.(md|html|css|sql|json)$/.test(file));
let linkCount=0;
for(const file of texts){
  const source=await fs.readFile(file,'utf8');
  const relative=path.relative(root,file);
  if(/[\u0600-\u06ff]/.test(source))failures.push(`Non-English script found in ${relative}`);
  if(/SOURCE_(DIAGRAM|REFERENCES):/.test(source))failures.push(`Unresolved source marker in ${relative}`);
  if(!/\.(md|html|css)$/.test(file))continue;
  const references=file.endsWith('.md')?[...source.matchAll(/!?\[[^\]]*\]\(([^)\n]+)\)/g)].map(match=>match[1]):[
    ...[...source.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]),
    ...[...source.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match=>match[1])
  ];
  for(let url of references){
    if(/^(https?:|data:|mailto:|#)/i.test(url)||url.includes('${'))continue;
    url=url.split('#')[0].split('?')[0];
    if(!url)continue;
    const decoded=decodeURIComponent(url);
    const target=path.resolve(path.dirname(file),decoded);
    if(!target.startsWith(root+path.sep)&&target!==root){failures.push(`Out-of-package link: ${relative} → ${url}`);continue;}
    try{await fs.access(target);linkCount++;}catch{failures.push(`Missing local link: ${relative} → ${url}`);}
  }
}
results.push(`English-script scan: ${texts.length} text artifacts checked.`);
results.push(`Local references: ${linkCount} existing file references checked.`);

const manifest=JSON.parse(await fs.readFile(path.join(root,'design/final/manifest.json'),'utf8'));
if(manifest.routeCount!==58)failures.push('Screenshot manifest route count is not 58');
for(const platform of ['ios','android','backoffice']){
  const group=manifest.screens.filter(item=>item.platform===platform);
  const expected=platform==='backoffice'?22:36;
  if(group.length!==expected||new Set(group.map(item=>item.route)).size!==expected)failures.push(`Incomplete screenshot coverage: ${platform}`);
}
for(const item of [...manifest.files,...manifest.screens]){
  const buffer=await fs.readFile(path.join(root,'design/final',item.file));
  if(buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')failures.push(`Invalid PNG signature: ${item.file}`);
}
results.push(`Screenshot inventory: ${manifest.files.length} boards/hero images; ${manifest.screens.length} individual screens; 58 unique product routes across both channels.`);
const sql=await fs.readFile(path.join(root,'database/schema.sql'),'utf8');
results.push(`SQL source inventory: ${(sql.match(/CREATE TABLE /g)||[]).length} CREATE TABLE statements. SQL was not executed against PostgreSQL in this check.`);

const browser=await playwright.chromium.launch({headless:true});
try{
  for(const [filename,count] of [['mobile.html',36],['backoffice.html',22]]){
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
    const runtime=[];
    const resourceFailures=[];
    page.on('pageerror',error=>runtime.push(error.message));
    page.on('requestfailed',request=>resourceFailures.push(request.url()));
    await page.goto(pathToFileURL(path.join(root,'prototype',filename)).href,{waitUntil:'networkidle'});
    const audit=await page.evaluate(()=>{
      const prototype=window.__prototype;
      const invalid=[];
      const empty=[];
      for(const route of prototype.routes){
        prototype.go(route);
        if(!document.querySelector('#screen-body,#page')?.textContent.trim())empty.push(route);
        for(const element of document.querySelectorAll('[data-next],[data-route],[data-go]')){
          const destination=element.dataset.next||element.dataset.route||element.dataset.go;
          if(destination&&!prototype.routes.includes(destination))invalid.push(`${route} → ${destination}`);
        }
      }
      return{count:prototype.count,empty,invalid};
    });
    if(audit.count!==count||audit.empty.length||audit.invalid.length||runtime.length||resourceFailures.length)failures.push(`${filename}: ${JSON.stringify({audit,runtime,resourceFailures})}`);
    results.push(`${filename}: ${audit.count} non-empty routes; ${audit.invalid.length} invalid declared navigation targets; ${runtime.length} browser runtime errors; ${resourceFailures.length} failed local requests.`);
    if(filename==='mobile.html'){
      for(const [start,steps,expected] of [['recipient',4,'Money delivered.'],['billers',3,'North Cairo Electricity'],['qr',3,'Payment complete.'],['cash-in',2,'Waiting for the ATM.'],['cash-out',2,'ATM cash withdrawal']]){
        await page.evaluate(route=>window.__prototype.go(route),start);
        for(let index=0;index<steps;index++)await page.locator('#actions .primary').click();
        const body=await page.locator('#screen-body').innerText();
        if(!body.includes(expected))failures.push(`Contextual demo failed: ${start}; expected ${expected}`);
      }
      for(const platform of ['ios','android']){
        await page.evaluate(value=>window.__prototype.setPlatform(value),platform);
        const valid=await page.evaluate(value=>document.body.classList.contains(`platform-${value}`),platform);
        if(!valid)failures.push(`Platform shell failed: ${platform}`);
      }
      results.push('Five scripted primary-CTA journeys and both platform switches checked. Secondary controls/validation/business execution are not comprehensively tested.');
    }
    await page.close();
  }
  const portal=await browser.newPage({viewport:{width:1600,height:1000}});
  const portalErrors=[];portal.on('pageerror',error=>portalErrors.push(error.message));
  await portal.goto(pathToFileURL(path.join(root,'START-HERE.html')).href,{waitUntil:'networkidle'});
  if(portalErrors.length)failures.push(`Portal runtime errors: ${portalErrors.join('; ')}`);
  const portalText=await portal.locator('body').innerText();
  if(!portalText.includes('FINAL ENGLISH HANDOVER'))failures.push('Portal headline missing');
  await portal.close();
  results.push('Offline portal opened successfully in Chromium.');
}finally{await browser.close();}

if(verifyOnly){
  const inventory=JSON.parse(await fs.readFile(path.join(root,'handover/FILE-MANIFEST.json'),'utf8'));
  for(const item of inventory.files){
    const buffer=await fs.readFile(path.join(root,item.path));
    const hash=createHash('sha256').update(buffer).digest('hex');
    if(hash!==item.sha256||buffer.length!==item.bytes)failures.push(`Checksum mismatch: ${item.path}`);
  }
  const actual=files.map(file=>path.relative(root,file).split(path.sep).join('/')).filter(file=>file!=='handover/FILE-MANIFEST.json');
  if(actual.length!==inventory.fileCount||actual.some(file=>!inventory.files.some(item=>item.path===file)))failures.push('File inventory differs from checksum manifest');
  results.push(`SHA-256 inventory: ${inventory.fileCount} files verified.`);
}else{
  const report=`# DONECASH — Delivery Validation Report\n\nChecked: ${new Date().toISOString()} · English handover release 1.0.\n\n## Packaging and navigation checks\n\n${results.map(result=>'- '+result).join('\n')}\n\n## Outcome\n\n${failures.length?'FAILED — '+failures.length+' issues.\n\n'+failures.map(failure=>'- '+failure).join('\n'):'PASS for the checks listed above.'}\n\n## Evidence limits\n\nThis is packaging, browser rendering and selected navigation evidence. It does not certify native iOS/Android execution, all interactive states/secondary actions, financial correctness, SQL execution/migrations, performance, WCAG compliance, vendor connectivity or legal eligibility. See [delivery status](DELIVERY-STATUS.md). Screenshots are synthetic-data design artifacts.\n\nSource assets/design-system preservation and final archive integrity are separately recorded in [archive verification](ARCHIVE-VERIFICATION.md). The checksum manifest excludes itself to avoid recursive hashing.\n`;
  await fs.writeFile(path.join(root,'handover/VALIDATION-REPORT.md'),report,'utf8');
}
console.log(JSON.stringify({passed:failures.length===0,results,failures},null,2));
if(failures.length)process.exitCode=1;
