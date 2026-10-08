"""Local HTTP/PHP/SMTP integration tests. Never contacts a real mail server."""
from pathlib import Path
import email, email.policy, json, os, socket, socketserver, subprocess, tempfile, threading, time, urllib.request, urllib.error, uuid
ROOT=Path(__file__).resolve().parent.parent
messages=[]
class SMTP(socketserver.StreamRequestHandler):
 def handle(self):
  self.wfile.write(b'220 localhost test SMTP\r\n')
  while line:=self.rfile.readline():
   command=line.split(b' ',1)[0].strip().upper()
   if command in (b'EHLO',b'HELO'): self.wfile.write(b'250-localhost\r\n250 SIZE 20000000\r\n')
   elif command==b'DATA':
    self.wfile.write(b'354 End with dot\r\n'); content=[]
    while (part:=self.rfile.readline()) not in (b'.\r\n',b''):
     content.append(part[1:] if part.startswith(b'..') else part)
    messages.append(email.message_from_bytes(b''.join(content),policy=email.policy.default))
    self.wfile.write(b'250 accepted\r\n')
   elif command==b'QUIT': self.wfile.write(b'221 Bye\r\n'); return
   else: self.wfile.write(b'250 OK\r\n')
def free_port():
 with socket.socket() as s: s.bind(('127.0.0.1',0)); return s.getsockname()[1]
with tempfile.TemporaryDirectory(prefix='cegforma-api-test-') as tmp:
 private=Path(tmp); port=free_port(); origin=f'http://127.0.0.1:{port}'
 smtp=socketserver.ThreadingTCPServer(('127.0.0.1',0),SMTP)
 threading.Thread(target=smtp.serve_forever,daemon=True).start()
 config=private/'quote.php'
 config.write_text("<?php return "+"['enabled'=>true,'origin'=>'"+origin+"','secret'=>'"+'a'*64+"','private_dir'=>'"+tmp+"','smtp_host'=>'127.0.0.1','smtp_port'=>"+str(smtp.server_address[1])+",'smtp_security'=>'','smtp_username'=>'','smtp_password'=>'','from_email'=>'website@example.test','development'=>true];")
 log=(private/'php.log').open('w')
 process=subprocess.Popen(['php','-d','opcache.enable=0','-d','upload_max_filesize=5M','-d','post_max_size=12M','-d','max_file_uploads=10','-S',f'127.0.0.1:{port}','-t',str(ROOT/'dist')],env={**os.environ,'CEGFORMA_CONFIG':str(config)},stdout=log,stderr=log)
 def request(data=None,files=(),origin_value=origin):
  headers={}
  if data is not None:
   boundary='test-'+uuid.uuid4().hex; parts=[]
   for name,value in data.items(): parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
   for name,content,mime in files:
    parts.extend([f'--{boundary}\r\nContent-Disposition: form-data; name="artwork[]"; filename="{name}"\r\nContent-Type: {mime}\r\n\r\n'.encode(),content,b'\r\n'])
   parts.append(f'--{boundary}--\r\n'.encode()); data=b''.join(parts)
   headers={'Content-Type':f'multipart/form-data; boundary={boundary}','Origin':origin_value}
  try:
   with urllib.request.urlopen(urllib.request.Request(origin+'/api/quote.php',data=data,headers=headers),timeout=35) as response: return response.status,json.load(response)
  except urllib.error.HTTPError as error: return error.code,json.load(error)
 def fresh():
  (private/'requests.json').unlink(missing_ok=True)
  code,body=request(); assert code==200,body
  return {'token':body['token'],'contact':'Teszt Elek','company':'Árvíztűrő Kft.','phone':'+36 20 000 0000','email':'test@example.test','products[1][id]':'basic-134','products[1][color]':'01','products[1][quantity]':'5','placement':'Elöl','frontHeight':'12','backHeight':'999','notes':'Teszt, nem valódi megkeresés','artworkSide[0]':'Elöl','artworkSide[1]':'Hátul'}
 try:
  for _ in range(60):
   try: request(); break
   except OSError: time.sleep(.1)
  data=fresh(); svg=b'<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L10 10"/></svg>'
  png=next((ROOT/'assets/swatches').glob('*.png')).read_bytes()
  code,result=request(data,[('logo.svg',svg,'image/svg+xml'),('hatul.png',png,'image/png')]); assert code==200,(code,result)
  assert len(messages)==1
  mail=messages[0]; assert mail['To']=='cegforma@gmail.com'; assert mail['Reply-To']=='test@example.test'
  assert mail['From']=='Cégforma weboldal <website@example.test>'
  body=mail.get_body(preferencelist=('plain',)).get_content(); assert 'Összesen: 5 darab' in body and 'Basic 134' in body and 'Hátsó grafika magassága' not in body
  assert 'logo.svg – Elöl' in body and 'hatul.png – Hátul' in body
  assert [part.get_payload(decode=True) for part in mail.iter_attachments()]==[svg,png]
  assert request(data)[0]==200 and len(messages)==1, 'Repeated token sent duplicate mail'
  for key,value in [('products[1][quantity]','4'),('products[1][quantity]','1.5'),('products[1][quantity]','-5'),('products[1][id]','invented'),('products[1][color]','invented'),('contact',' '),('email','test@example.test\r\nBcc: x@example.test'),('technology','invented'),('website','bot'),('artworkSide[0]','invented')]:
   data=fresh(); data[key]=value
   assert request(data,[('logo.svg',svg,'image/svg+xml')])[0]==422,key
  for name,content in [('fake.png',b'<?php echo 1;'),('empty.pdf',b''),('run.php',b'<?php'),('script.svg',b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),('entity.svg',b'<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>'),('event.svg',b'<svg onload="alert(1)"/>'),('external.svg',b'<svg><use href="https://example.com/evil.svg"/></svg>')]:
   assert request(fresh(),[(name,content,'application/octet-stream')])[0]==422,name
  assert request(fresh(),[('logo.svg',svg,'image/svg+xml')]*6)[0]==422
  assert request(fresh(),[('big.pdf',b'%PDF-'+b'0'*(5*1024*1024),'application/pdf')])[0]==422
  assert request(fresh(),origin_value='https://evil.example')[0]==403
  data=fresh(); data['token']='bad'; assert request(data)[0]==403
  data=fresh(); data['products[1][quantity]']='2'; data.update({'products[7][id]':'other','products[7][custom]':'Egyedi bögre','products[7][customColor]':'Fehér','products[7][quantity]':'3'})
  assert request(data)[0]==200
  data=fresh()
  for _ in range(5):
   data['token']=request()[1]['token']; assert request(data)[0]==200
  data['token']=request()[1]['token']; assert request(data)[0]==429
  # Browser sends to the actual local PHP endpoint and the captured local SMTP server.
  (private/'requests.json').unlink(missing_ok=True)
  before=len(messages)
  subprocess.run(['node',str(ROOT/'scripts/check-delivery.cjs')],env={**os.environ,'CEGFORMA_TEST_BASE':origin+'/'},cwd=ROOT,check=True)
  assert len(messages)==before+1, 'Browser retry duplicated email'
  stored=(private/'requests.json').read_text(); assert 'test@example' not in stored and 'Teszt' not in stored and '127.0.0.1' not in stored
  # SMTP connection failure stays uncertain and never gets sent again automatically.
  data=fresh(); previous_config=config.read_text()
  config.write_text(previous_config.replace("'smtp_port'=>"+str(smtp.server_address[1]),"'smtp_port'=>"+str(free_port())))
  before=len(messages)
  assert request(data)[0]==409
  config.write_text(previous_config)
  assert request(data)[0]==409 and len(messages)==before
  # Scheduled cleanup removes old metadata but retains recent duplicate protection.
  state={'requests':{'old':{'time':int(time.time())-90000,'status':'sent'},'new':{'time':int(time.time()),'status':'sent'}},'limits':{'old':[int(time.time())-4000]}}
  (private/'requests.json').write_text(json.dumps(state))
  subprocess.run(['php',str(ROOT/'scripts/prune-quote.php')],env={**os.environ,'CEGFORMA_CONFIG':str(config)},check=True)
  state=json.loads((private/'requests.json').read_text()); assert 'old' not in state['requests'] and 'new' in state['requests'] and not state['limits']
  # Fail closed on disabled configuration.
  config.write_text(config.read_text().replace("'enabled'=>true","'enabled'=>false")); disabled=request(); assert disabled[0]==503,disabled
  print('PASS: PHP HTTP validation, actual local SMTP/MIME attachments, duplicate suppression, rate limit, upload attacks, disabled mode, and browser delivery. No external mail sent.')
 finally:
  process.terminate();process.wait();smtp.shutdown();smtp.server_close();log.close()
