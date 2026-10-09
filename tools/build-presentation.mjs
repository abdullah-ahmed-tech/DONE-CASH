import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
let markedPath;
try { markedPath=require.resolve('marked'); }
catch(error){
  if(!process.env.DONECASH_NODE_MODULES)throw error;
  markedPath=require.resolve(path.join(process.env.DONECASH_NODE_MODULES,'marked'));
}
const {marked}=await import(pathToFileURL(markedPath).href);
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slash=value=>value.split(path.sep).join('/');
async function walk(directory){
  const output=[];
  for(const entry of (await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    if(['node_modules','.git'].includes(entry.name))continue;
    const target=path.join(directory,entry.name);
    if(entry.isDirectory())output.push(...await walk(target));else output.push(target);
  }
  return output;
}

const docs=(await walk(root)).filter(file=>file.endsWith('.md'));
for(const file of docs){
  const source=await fs.readFile(file,'utf8');
  const title=source.match(/^# (.+)$/m)?.[1]||path.basename(file);
  let html=marked.parse(source,{gfm:true});
  html=html.replace(/href="([^"#]+\.md)(#[^"]*)?"/g,(full,url,hash='')=>{
    if(/^https?:/i.test(url))return full;
    return `href="${url.slice(0,-3)}.html${hash}"`;
  });
  const toc=[];
  const used=new Map();
  html=html.replace(/<(h[23])>(.*?)<\/\1>/g,(_,tag,content)=>{
    const text=content.replace(/<[^>]+>/g,'');
    const base=text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const count=(used.get(base)||0)+1;used.set(base,count);
    const id=count===1?base:`${base}-${count}`;
    if(tag==='h2')toc.push(`<a href="#${id}">${content}</a>`);
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
  const prefix=slash(path.relative(path.dirname(file),root))||'.';
  const page=`<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><link rel="stylesheet" href="${prefix}/presentation.css"></head><body><header class="reader-top"><a href="${prefix}/START-HERE.html">← Delivery portal</a><span>DONECASH · ENGLISH HANDOVER</span><a href="${escape(path.basename(file))}">Markdown source</a></header><div class="document-layout"><aside class="toc"><strong>IN THIS DOCUMENT</strong>${toc.join('')}</aside><main class="document">${html}<footer>DONECASH · Final English Handover · 9 October 2026 · Product blueprint, not a production application.</footer></main></div></body></html>`;
  await fs.writeFile(file.slice(0,-3)+'.html',page,'utf8');
}

const manifest=JSON.parse(await fs.readFile(path.join(root,'design/final/manifest.json'),'utf8'));
const docCards=[
  ['00','Research brief','Market signals, benchmark and product decisions','00-research-brief'],
  ['01','Product requirements','Stakeholders, requirements, stories, MVP and MoSCoW','01-product-requirements'],
  ['02','Database design','Entities, ERD, normalization and financial SQL baseline','02-database-design'],
  ['03','Technical design','Architecture, stack, endpoints, security and deployment','03-technical-design'],
  ['04','UX and UI design','Sitemap, all pages, flows and cross-platform requirements','04-ux-ui-design'],
  ['05','Business logic','Money rules, lifecycle, exceptions and acceptance catalogue','05-business-logic'],
  ['06','Design-system audit','Applied identity, deviations and production asset needs','06-design-system-audit'],
  ['07','External integrations','Sponsor, payment rails, identity and go-live gates','07-external-integrations']
];
function card(file,title,subtitle=''){
  return `<a class="image-card" href="${escape(file)}" target="_blank" rel="noopener"><img src="${escape(file)}" alt="${escape(title)}" loading="lazy"><span>${escape(title)}</span><small>${escape(subtitle)}</small></a>`;
}
const sheets=manifest.files.map(entry=>card(`design/final/${entry.file}`,entry.file.replace('.png','').replaceAll('-',' '),entry.routes?`${entry.routes.length} represented routes`:entry.kind)).join('');
const screens=['ios','android','backoffice'].map(platform=>{
  const entries=manifest.screens.filter(entry=>entry.platform===platform);
  return `<details class="screen-group"><summary>${platform==='backoffice'?'OPERATIONS':platform.toUpperCase()} · ${entries.length} individual screens</summary><div class="screen-grid ${platform==='backoffice'?'operations':''}">${entries.map(entry=>card(`design/final/${entry.file}`,`${entry.id?entry.id+' · ':''}${entry.title}`,entry.route)).join('')}</div></details>`;
}).join('');
const portal=`<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DONECASH — Final English Handover</title><link rel="stylesheet" href="presentation.css"></head><body><main class="portal"><header class="portal-top"><img src="Assets/PNG/Black%20Label.png" alt="DONECASH"><span>FINAL ENGLISH HANDOVER · 09 OCT 2026</span></header><section class="portal-hero"><div><span class="tag">PRODUCT BLUEPRINT + INTERACTIVE DESIGN</span><h1>MONEY,<br>WITHOUT THE MYSTERY.</h1><p>An Egyptian digital-wallet concept with customer experiences for iOS and Android and an integrated operations backoffice.</p><div class="quick-links"><a class="primary" href="prototype/index.html">Open interactive prototype ↗</a><a href="handover/PRESENTATION-GUIDE.html">Presentation guide</a></div></div><div class="scope-card"><strong>58</strong><span>designed routes</span><div class="scope-row"><b>36</b> mobile screens · two platform shells</div><div class="scope-row"><b>22</b> operations pages</div><div class="scope-row"><b>8</b> product and engineering documents</div><div class="scope-row"><b>94</b> individual screen captures</div><p>Predevelopment deliverable.<br>Synthetic data. No real payments.</p></div></section><div class="truth-note">This is the completed analysis/design work, not a deployed financial application. <a href="handover/DELIVERY-STATUS.html">Read completion status and remaining gates →</a></div><nav class="section-nav" aria-label="Delivery sections"><a href="#documents">Documents</a><a href="#prototype">Prototype</a><a href="#gallery">Gallery</a><a href="#sources">Source files</a><a href="#handover">Handover</a></nav><section id="documents"><div class="section-title"><span>01 / BLUEPRINT</span><h2>THE DECISIONS BEHIND THE DESIGN.</h2></div><div class="doc-grid">${docCards.map(([id,title,description,name])=>`<a class="doc-card" href="docs/${name}.html"><span class="doc-id">${id}</span><div><h3>${title}</h3><p>${description}</p></div><span aria-hidden="true">↗</span></a>`).join('')}</div></section><section id="prototype"><div class="section-title"><span>02 / EXPERIENCE</span><h2>EXPLORE THE PRODUCT.</h2></div><div class="channel-grid"><article class="channel cyan"><h3>MOBILE WALLET</h3><p>Onboarding, transfers, cash, bills, QR, support and account security. Native shells are visual previews.</p><div class="quick-links"><a href="prototype/mobile.html?platform=ios#home">iOS preview ↗</a><a href="prototype/mobile.html?platform=android#home">Android preview ↗</a></div></article><article class="channel khaki"><h3>OPERATIONS</h3><p>Customer 360, verification, transaction trace, risk, support, reconciliation, approvals and audit.</p><a href="prototype/backoffice.html">Open backoffice ↗</a></article></div></section><section id="gallery"><div class="section-title"><span>03 / VISUAL REVIEW</span><h2>EVERY LISTED SCREEN, IN VIEW.</h2><p>Open an image for full resolution. Contact sheets are overview boards; individual captures are available below.</p></div><div class="gallery-grid">${sheets}</div><div class="wireframe-link"><a href="design/wireframes.html">Open English wireframe board ↗</a><a href="design/wireframes.png">View wireframe PNG ↗</a></div>${screens}</section><section id="sources"><div class="section-title"><span>04 / SOURCE MATERIAL</span><h2>READY FOR THE NEXT PHASE.</h2></div><div class="source-grid"><a href="database/schema.sql"><h3>PostgreSQL baseline</h3><p>Readable SQL source, not an installed database.</p></a><a href="Design%20System/DESIGN%20(1).html"><h3>Supplied design system</h3><p>Original reference and product-extension files.</p></a><a href="handover/ASSET-INVENTORY.html"><h3>Brand masters</h3><p>PNG, SVG and Illustrator source inventory.</p></a><a href="tools/README.html"><h3>Reproduction tools</h3><p>Optional screenshot/document generation.</p></a></div></section><section id="handover"><div class="section-title"><span>05 / HANDOVER</span><h2>KNOW WHAT IS APPROVED NEXT.</h2></div><div class="quick-links"><a class="primary" href="handover/DELIVERY-STATUS.html">Delivery status</a><a href="handover/VALIDATION-REPORT.html">Validation evidence</a><a href="handover/PRESENTATION-GUIDE.html">Demo script</a><a href="handover/FILE-MANIFEST.json">File checksums</a></div><p>Research dates remain those of the original September 2026 review. Financial, security, accessibility and regulatory targets are proposed requirements, not certifications.</p></section><footer>DONECASH · Release 1.0 · English delivery · Original working files preserved.</footer></main></body></html>`;
const composedPortal=portal.replace('<img src="Assets/PNG/Black%20Label.png" alt="DONECASH">','<span class="wordmark"><img src="Assets/PNG/Black%20Label.png" alt="DONECASH"></span>');
await fs.writeFile(path.join(root,'START-HERE.html'),composedPortal,'utf8');

const files=[];
for(const file of await walk(root)){
  const relative=slash(path.relative(root,file));
  if(relative==='handover/FILE-MANIFEST.json')continue;
  const buffer=await fs.readFile(file);
  files.push({path:relative,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});
}
await fs.writeFile(path.join(root,'handover/FILE-MANIFEST.json'),JSON.stringify({release:'1.0',preparedDate:'2026-10-09',generatedAt:new Date().toISOString(),fileCount:files.length,checksumAlgorithm:'SHA-256',excluded:['handover/FILE-MANIFEST.json (self-reference)'],files},null,2)+'\n','utf8');
console.log(`Built ${docs.length} English HTML document views, offline presentation portal and ${files.length}-file checksum inventory.`);
