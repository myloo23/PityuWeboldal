// Existing local preview must serve the project at 127.0.0.1:8080.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'cegforma-qa-'));
for(const file of ['check-site.cjs','check-quote.cjs','check-responsive.cjs','check-usability.cjs','check-seo-privacy.cjs']) {
 const filename=path.resolve(__dirname,file);
 const source=fs.readFileSync(filename,'utf8').replaceAll('docs/qa/',output+'/');
 const boot=`const Module=require('module');const filename=${JSON.stringify(filename)};const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(require('path').dirname(filename));mod._compile(${JSON.stringify(source)},filename);`;
 const result=spawnSync(process.execPath,['-e',boot],{stdio:'inherit',cwd:path.dirname(__dirname)});
 if(result.status!==0) process.exit(result.status||1);
}
console.log('Screenshots: '+output);
