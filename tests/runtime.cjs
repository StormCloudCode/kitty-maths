/* Normal npm install first; optional external Playwright for local workspaces. */
try{module.exports=require('playwright');}catch(error){
 if(!process.env.PLAYWRIGHT_MODULE)throw error;
 module.exports=require(process.env.PLAYWRIGHT_MODULE);
}
