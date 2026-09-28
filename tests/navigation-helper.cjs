module.exports=async function navigate(page,ci,si=0){
 if(!await page.locator('#contents-dialog').evaluate(d=>d.open))await page.locator('#contents-toggle').click();
 const step=page.locator(`[data-nav-step="${ci}:${si}"]`);
 const chapter=step.locator('xpath=ancestor::details[contains(@class,"contents-chapter")]');
 if(!await chapter.evaluate(d=>d.open))await chapter.locator(':scope > summary').click();
 const section=step.locator('xpath=ancestor::details[contains(@class,"contents-section")]');
 if(!await section.evaluate(d=>d.open))await section.locator(':scope > summary').click();
 await step.click();
};
