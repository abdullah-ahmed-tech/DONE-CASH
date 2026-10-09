import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}
catch(error){if(!process.env.DONECASH_NODE_MODULES)throw error;playwright=require(path.join(process.env.DONECASH_NODE_MODULES,'playwright'));}
const output=path.join(root,'design','presentation');
await fs.mkdir(output,{recursive:true});
const browser=await playwright.chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
  await page.goto(pathToFileURL(path.join(root,'START-HERE.html')).href,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(output,'00-delivery-portal.png')});
  await page.goto(pathToFileURL(path.join(root,'docs/01-product-requirements.html')).href,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(output,'01-document-reader.png')});
  await page.goto(pathToFileURL(path.join(root,'design/wireframes.html')).href,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(root,'design/wireframes.png'),fullPage:true});
}finally{await browser.close();}
console.log('Captured delivery portal, English document reader and English wireframe board.');
