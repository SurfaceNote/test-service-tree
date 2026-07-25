const assert=require('node:assert/strict');
const expertise=require('../assets/service-expertise-data.js');
const expected=['accounting','tax','payroll','management','cfo','treasury','audit','modeling'];
assert.deepEqual(Object.keys(expertise).sort(),expected.sort());
for(const key of expected){
  const service=expertise[key];
  assert.equal(typeof service.format,'string',`${key}: format`);
  assert.equal(typeof service.firstStep,'string',`${key}: firstStep`);
  assert.ok(service.symptoms.length>=5,`${key}: symptoms`);
  assert.ok(service.inputs.length>=5,`${key}: inputs`);
  assert.ok(service.workflow.length>=4,`${key}: workflow`);
  assert.ok(service.artifacts.length>=4,`${key}: artifacts`);
  assert.ok(service.acceptance.length>=4,`${key}: acceptance`);
  assert.ok(service.exclusions.length>=3,`${key}: exclusions`);
  assert.ok(service.faq.length>=2,`${key}: faq`);
  for(const step of service.workflow){assert.ok(step.title&&step.text,`${key}: workflow fields`)}
  for(const artifact of service.artifacts){
    assert.ok(artifact.title&&artifact.format&&artifact.cadence,`${key}: artifact metadata`);
    assert.ok(Array.isArray(artifact.contains)&&artifact.contains.length>=4,`${key}: artifact structure`);
  }
}
const firstSymptoms=expected.map(key=>expertise[key].symptoms[0]);
assert.equal(new Set(firstSymptoms).size,expected.length,'Услуги не должны использовать одинаковый шаблон симптомов.');
console.log('Service expertise: all service passports are complete.');
