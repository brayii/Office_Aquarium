function finiteNumberOr(value,fallback){
  const parsed=Number(value);
  return Number.isFinite(parsed)?parsed:fallback;
}

function runwayDaysOrUnknown(finance=company?.finance){
  return finiteNumberOr(finance?.runwayDays,OFFICE_AQUARIUM_CONSTANTS.time.unknownFutureDay);
}

class SaveRepositoryError extends Error{
  constructor(code,message,details={}){
    super(message);
    this.name="SaveRepositoryError";
    this.code=code;
    this.details=details;
  }
}

class SaveRepository{
  constructor(key,version){
    this.key=key;
    this.version=version;
    this.rules=OFFICE_AQUARIUM_CONSTANTS.storage;
    this.backupKey=`${key}${this.rules.backupKeySuffix}`;
    this.candidateKey=`${key}${this.rules.candidateKeySuffix}`;
    this.compactKeyMap=new Map((OFFICE_AQUARIUM_CONSTANTS.storage.compactKeys||[]).map((name,index)=>[name,`~${index.toString(36)}`]));
    this.expandedKeyMap=new Map([...this.compactKeyMap].map(([name,alias])=>[alias,name]));
  }
  clone(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
  compact(value){
    if(Array.isArray(value))return value.map(item=>this.compact(item));
    if(!value||typeof value!=="object")return value;
    const output={};
    Object.entries(value).forEach(([key,item])=>{
      const compactKey=this.compactKeyMap.get(key)||(key.startsWith("~")?`~${key}`:key);
      output[compactKey]=this.compact(item);
    });
    return output;
  }
  expand(value){
    if(Array.isArray(value))return value.map(item=>this.expand(item));
    if(!value||typeof value!=="object")return value;
    const output={};
    Object.entries(value).forEach(([key,item])=>{
      const expandedKey=this.expandedKeyMap.get(key)||(key.startsWith("~~")?key.slice(1):key);
      output[expandedKey]=this.expand(item);
    });
    return output;
  }
  collectStrings(value,counts=new Map()){
    if(typeof value==="string"){counts.set(value,(counts.get(value)||0)+1);return counts;}
    if(Array.isArray(value)){value.forEach(item=>this.collectStrings(item,counts));return counts;}
    if(value&&typeof value==="object")Object.values(value).forEach(item=>this.collectStrings(item,counts));
    return counts;
  }
  createStringDictionary(value){
    const minimumLength=this.rules.dictionaryMinimumLength;
    const minimumUses=this.rules.dictionaryMinimumUses;
    const prefixLength=this.rules.stringReferencePrefix.length;
    return [...this.collectStrings(value).entries()]
      .filter(([text,count])=>text.length>=minimumLength&&count>=minimumUses)
      .map(([text,count])=>{
        const referenceLength=prefixLength+Math.max(1,Math.ceil(Math.log(Math.max(2,count))/Math.log(36)));
        return {text,count,savings:count*(text.length-referenceLength)-(text.length+3)};
      })
      .filter(item=>item.savings>0)
      .sort((a,b)=>b.savings-a.savings||b.count-a.count||a.text.localeCompare(b.text))
      .slice(0,this.rules.dictionaryMaximumEntries)
      .map(item=>item.text);
  }
  encodeStrings(value,index){
    if(typeof value==="string"){
      const reference=index.get(value);
      if(reference!==undefined)return `${this.rules.stringReferencePrefix}${reference.toString(36)}`;
      if(value.startsWith(this.rules.stringReferencePrefix)||value.startsWith(this.rules.escapedStringPrefix)){
        return `${this.rules.escapedStringPrefix}${value}`;
      }
      return value;
    }
    if(Array.isArray(value))return value.map(item=>this.encodeStrings(item,index));
    if(!value||typeof value!=="object")return value;
    const output={};
    Object.entries(value).forEach(([key,item])=>{output[key]=this.encodeStrings(item,index);});
    return output;
  }
  decodeStrings(value,dictionary){
    if(typeof value==="string"){
      if(value.startsWith(this.rules.escapedStringPrefix))return value.slice(this.rules.escapedStringPrefix.length);
      if(value.startsWith(this.rules.stringReferencePrefix)){
        const reference=Number.parseInt(value.slice(this.rules.stringReferencePrefix.length),36);
        if(!Number.isInteger(reference)||reference<0||reference>=dictionary.length){
          throw new SaveRepositoryError("INVALID_STRING_REFERENCE","The save contains an invalid compact string reference.");
        }
        return dictionary[reference];
      }
      return value;
    }
    if(Array.isArray(value))return value.map(item=>this.decodeStrings(item,dictionary));
    if(!value||typeof value!=="object")return value;
    const output={};
    Object.entries(value).forEach(([key,item])=>{output[key]=this.decodeStrings(item,dictionary);});
    return output;
  }
  utf8Encode(text){
    if(typeof TextEncoder!=="undefined")return new TextEncoder().encode(text);
    const encoded=unescape(encodeURIComponent(text)),bytes=new Uint8Array(encoded.length);
    for(let i=0;i<encoded.length;i++)bytes[i]=encoded.charCodeAt(i);
    return bytes;
  }
  utf8Decode(bytes){
    if(typeof TextDecoder!=="undefined")return new TextDecoder().decode(bytes);
    let binary="";
    for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.slice(i,i+32768));
    return decodeURIComponent(escape(binary));
  }
  lzwCompress(text){
    const bytes=this.utf8Encode(text);
    if(!bytes.length)return "";
    const firstCode=this.rules.compressionFirstCode,resetCode=this.rules.compressionResetCode;
    let dictionary=new Map(),nextCode=firstCode,phrase=String.fromCharCode(bytes[0]);
    const output=[];
    for(let i=1;i<bytes.length;i++){
      const current=String.fromCharCode(bytes[i]),combined=phrase+current;
      if(dictionary.has(combined)){phrase=combined;continue;}
      output.push(phrase.length===1?phrase.charCodeAt(0):dictionary.get(phrase));
      if(nextCode<resetCode)dictionary.set(combined,nextCode++);
      else{output.push(resetCode);dictionary=new Map();nextCode=firstCode;}
      phrase=current;
    }
    output.push(phrase.length===1?phrase.charCodeAt(0):dictionary.get(phrase));
    let binary="";
    for(let i=0;i<output.length;i+=16384){
      const end=Math.min(output.length,i+16384),part=[];
      for(let j=i;j<end;j++){const code=output[j];part.push(String.fromCharCode(code&255,(code>>>8)&255));}
      binary+=part.join("");
    }
    return btoa(binary);
  }
  lzwDecompress(encoded){
    if(!encoded)return "";
    const binary=atob(encoded),codes=[];
    for(let i=0;i<binary.length;i+=2)codes.push(binary.charCodeAt(i)|(binary.charCodeAt(i+1)<<8));
    if(!codes.length)return "";
    const firstCode=this.rules.compressionFirstCode,resetCode=this.rules.compressionResetCode;
    let dictionary=new Map(),nextCode=firstCode,index=0,previous="";
    const bytes=[];
    const append=entry=>{for(let i=0;i<entry.length;i++)bytes.push(entry.charCodeAt(i));};
    while(index<codes.length){
      const code=codes[index++];
      if(code===resetCode){dictionary=new Map();nextCode=firstCode;previous="";continue;}
      let entry;
      if(code<firstCode)entry=String.fromCharCode(code);
      else if(dictionary.has(code))entry=dictionary.get(code);
      else if(code===nextCode&&previous)entry=previous+previous[0];
      else throw new SaveRepositoryError("INVALID_COMPRESSED_SAVE","The compressed save data is incomplete.");
      append(entry);
      if(previous&&nextCode<resetCode)dictionary.set(nextCode++,previous+entry[0]);
      previous=entry;
    }
    return this.utf8Decode(new Uint8Array(bytes));
  }
  packEnvelope(json){
    const compressed=this.lzwCompress(json),compressedValue=`${this.rules.compressedEnvelopePrefix}${compressed}`;
    const plainValue=`${this.rules.plainEnvelopePrefix}${json}`;
    return compressedValue.length<plainValue.length?compressedValue:plainValue;
  }
  unpackEnvelope(raw){
    if(raw.startsWith(this.rules.compressedEnvelopePrefix))return this.lzwDecompress(raw.slice(this.rules.compressedEnvelopePrefix.length));
    if(raw.startsWith(this.rules.plainEnvelopePrefix))return raw.slice(this.rules.plainEnvelopePrefix.length);
    return raw;
  }
  payload(companyState,employeeState,savedAt=new Date().toISOString()){
    const saveCompany={...companyState};
    (OFFICE_AQUARIUM_CONSTANTS.storage.transientCompanyKeys||["runtime"]).forEach(key=>delete saveCompany[key]);
    return {saveVersion:this.version,savedAt,company:saveCompany,employees:employeeState};
  }
  serialize(companyState,employeeState,savedAt=new Date().toISOString()){
    const compacted=this.compact(this.payload(companyState,employeeState,savedAt));
    const strings=this.createStringDictionary(compacted);
    const stringIndex=new Map(strings.map((text,index)=>[text,index]));
    const envelope=JSON.stringify({
      format:OFFICE_AQUARIUM_CONSTANTS.storage.compactFormat,
      strings,
      data:this.encodeStrings(compacted,stringIndex)
    });
    return this.packEnvelope(envelope);
  }
  parseRaw(raw){
    if(!raw)throw new SaveRepositoryError("SAVE_ABSENT","No saved company was found.");
    const parsed=JSON.parse(this.unpackEnvelope(raw));
    const legacyFormats=this.rules.legacyCompactFormats||[];
    if(parsed?.format===this.rules.compactFormat&&parsed?.data){
      const dictionary=Array.isArray(parsed.strings)?parsed.strings:[];
      return this.expand(this.decodeStrings(parsed.data,dictionary));
    }
    if(legacyFormats.includes(parsed?.format)&&parsed?.data)return this.expand(parsed.data);
    return parsed;
  }
  validate(data){
    if(!data||typeof data!=="object")return {ok:false,code:"INVALID_ROOT"};
    if(!data.company||typeof data.company!=="object")return {ok:false,code:"INVALID_COMPANY"};
    if(!Array.isArray(data.employees))return {ok:false,code:"INVALID_EMPLOYEES"};
    const saveVersion=Number(data.saveVersion);
    if(!Number.isFinite(saveVersion))return {ok:false,code:"INVALID_VERSION"};
    if(saveVersion>this.version)return {ok:false,code:"FUTURE_VERSION",saveVersion};
    return {ok:true,saveVersion,migrationRequired:saveVersion<this.version};
  }
  inspectKey(key){
    try{
      const raw=localStorage.getItem(key);
      if(!raw)return {status:"absent",key,raw:null,data:null,size:0};
      try{
        const data=this.parseRaw(raw);
        const validation=this.validate(data);
        if(!validation.ok)return {status:validation.code==="FUTURE_VERSION"?"future-version":"corrupt",key,raw,data:null,size:raw.length,errorCode:validation.code,saveVersion:validation.saveVersion};
        return {status:validation.migrationRequired?"migration-required":"valid",key,raw,data,size:raw.length,saveVersion:validation.saveVersion};
      }catch(error){
        return {status:"corrupt",key,raw,data:null,size:raw.length,errorCode:error.code||"PARSE_ERROR",error};
      }
    }catch(error){
      return {status:"storage-unavailable",key,raw:null,data:null,size:0,errorCode:"STORAGE_UNAVAILABLE",error};
    }
  }
  readDetailed(){
    const current=this.inspectKey(this.key);
    const backup=this.inspectKey(this.backupKey);
    let status="no-save";
    if(current.status==="storage-unavailable"||backup.status==="storage-unavailable")status="storage-unavailable";
    else if(current.status==="valid")status="valid-save";
    else if(current.status==="migration-required")status="migration-required";
    else if((current.status==="corrupt"||current.status==="future-version")&&["valid","migration-required"].includes(backup.status))status="corrupt-current-backup-available";
    else if(current.status==="absent"&&["valid","migration-required"].includes(backup.status))status="backup-only";
    else if(current.status==="corrupt"||current.status==="future-version")status="corrupt-no-backup";
    return {status,current,backup,recoverable:["valid","migration-required"].includes(backup.status)};
  }
  read(options={}){
    const slot=options.slot==="backup"?this.backupKey:this.key;
    const inspected=this.inspectKey(slot);
    return ["valid","migration-required"].includes(inspected.status)?inspected.data:null;
  }
  readBackup(){return this.read({slot:"backup"});}
  exists(){return !!this.read();}
  remove(){
    try{
      localStorage.removeItem(this.key);
      localStorage.removeItem(this.backupKey);
      localStorage.removeItem(this.candidateKey);
    }catch(e){}
  }
  exportRaw(slot="current"){
    const key=slot==="backup"?this.backupKey:this.key;
    try{return localStorage.getItem(key);}catch(error){throw new SaveRepositoryError("STORAGE_UNAVAILABLE","Saved data cannot be read from this device.",{cause:error});}
  }
  sizeStatus(size){
    if(size>this.rules.hardLimitCharacters)return "hard-limit";
    if(size>=this.rules.compactionThresholdCharacters)return "compaction";
    if(size>=this.rules.softWarningCharacters)return "warning";
    return "healthy";
  }
  write(companyState,employeeState){
    const raw=this.serialize(companyState,employeeState);
    const size=raw.length;
    const sizeStatus=this.sizeStatus(size);
    if(sizeStatus==="hard-limit"){
      throw new SaveRepositoryError("SAVE_TOO_LARGE","This company has grown beyond the safe local-save limit.",{size,limit:this.rules.hardLimitCharacters});
    }
    const previous=this.inspectKey(this.key);
    try{
      localStorage.setItem(this.candidateKey,raw);
      const candidate=this.inspectKey(this.candidateKey);
      if(!["valid","migration-required"].includes(candidate.status)){
        throw new SaveRepositoryError("CANDIDATE_VALIDATION_FAILED","The new save could not be verified.",{candidateStatus:candidate.status});
      }
      localStorage.removeItem(this.candidateKey);
      if(["valid","migration-required"].includes(previous.status))localStorage.setItem(this.backupKey,previous.raw);
      localStorage.setItem(this.key,raw);
      const promoted=this.inspectKey(this.key);
      if(!["valid","migration-required"].includes(promoted.status)){
        if(["valid","migration-required"].includes(previous.status))localStorage.setItem(this.key,previous.raw);
        throw new SaveRepositoryError("PROMOTION_VALIDATION_FAILED","The new save could not be promoted safely.");
      }
      return {ok:true,size,sizeStatus,backupCreated:["valid","migration-required"].includes(previous.status),dictionaryEntries:this.inspectEnvelope(raw).dictionaryEntries};
    }catch(error){
      try{localStorage.removeItem(this.candidateKey);}catch(cleanupError){}
      if(error instanceof SaveRepositoryError)throw error;
      const quota=error?.name==="QuotaExceededError"||error?.code===22||error?.code===1014;
      throw new SaveRepositoryError(quota?"QUOTA_EXCEEDED":"STORAGE_UNAVAILABLE",quota?"This device does not have enough local storage for the save.":"This device would not accept the save.",{size,cause:error});
    }
  }
  restoreBackup(){
    const backup=this.inspectKey(this.backupKey);
    if(!["valid","migration-required"].includes(backup.status))throw new SaveRepositoryError("BACKUP_UNAVAILABLE","No valid backup is available.");
    try{
      localStorage.setItem(this.candidateKey,backup.raw);
      const candidate=this.inspectKey(this.candidateKey);
      if(!["valid","migration-required"].includes(candidate.status))throw new SaveRepositoryError("BACKUP_VALIDATION_FAILED","The backup could not be verified.");
      localStorage.setItem(this.key,backup.raw);
      localStorage.removeItem(this.candidateKey);
      return backup.data;
    }catch(error){
      try{localStorage.removeItem(this.candidateKey);}catch(cleanupError){}
      if(error instanceof SaveRepositoryError)throw error;
      throw new SaveRepositoryError("RESTORE_FAILED","The backup could not be restored on this device.",{cause:error});
    }
  }
  inspectEnvelope(raw){
    try{
      const packed=raw.startsWith(this.rules.compressedEnvelopePrefix),parsed=JSON.parse(this.unpackEnvelope(raw));
      return {format:parsed?.format||"legacy-raw",dictionaryEntries:Array.isArray(parsed?.strings)?parsed.strings.length:0,compressed:packed};
    }catch(error){return {format:"invalid",dictionaryEntries:0};}
  }
  analyze(companyState,employeeState){
    const payload=this.payload(companyState,employeeState,"measurement");
    const companySections=Object.entries(payload.company||{}).map(([key,value])=>({key,characters:JSON.stringify(value)?.length||0})).sort((a,b)=>b.characters-a.characters);
    const employeeCharacters=JSON.stringify(payload.employees||[]).length;
    const rawCharacters=JSON.stringify(payload).length;
    const serialized=this.serialize(companyState,employeeState,"measurement");
    const envelope=this.inspectEnvelope(serialized);
    return {
      rawCharacters,
      serializedCharacters:serialized.length,
      supportedBudgetCharacters:this.rules.maxPersistedCharacters,
      budgetUsePercent:Number((serialized.length/this.rules.maxPersistedCharacters*100).toFixed(1)),
      reservedMarginCharacters:this.rules.reservedMarginCharacters,
      sizeStatus:this.sizeStatus(serialized.length),
      dictionaryEntries:envelope.dictionaryEntries,
      employees:{count:(employeeState||[]).length,characters:employeeCharacters},
      companySections
    };
  }
  summary(){
    const detail=this.readDetailed(),data=detail.current.data;
    if(!data)return null;
    const c=data.company||{},identity=c.crisis||Number(c.cash)<2?"Distressed Company":Number(c.customers)>80?"Market Challenger":Number(c.customers)>0?"Early Commercial Company":"Technology Startup";
    return{day:(Number(c.day)||0)+1,cash:Number(c.cash)||0,valuation:Number(c.valuation)||0,identity,savedAt:data.savedAt||null,status:detail.status,backupAvailable:detail.recoverable,size:detail.current.size};
  }
}

class SoundController{
  constructor({musicSrc,alertSrc}){this.music=this.create(musicSrc,{loop:true,volume:.28,kind:"music"});this.alert=this.create(alertSrc,{volume:.78,kind:"alerts"});this.userGestureSeen=false;this.musicBlocked=false;this.alertBlocked=false;}
  create(src,{loop=false,volume=1,kind="audio"}={}){
    try{
      if(typeof Audio==="undefined")return null;
      const audio=new Audio(src);audio.loop=loop;audio.volume=volume;
      audio.addEventListener?.("error",()=>{if(kind==="music")musicUnavailable=true;else alertsUnavailable=true;this.syncUi();});
      return audio;
    }catch(e){if(kind==="music")musicUnavailable=true;else alertsUnavailable=true;return null;}
  }
  wantsMusic(){return company?.soundMode==="music"||company?.soundMode==="both";}
  wantsAlerts(){return company?.soundMode==="alerts"||company?.soundMode==="both";}
  syncUi(){
    const select=document.getElementById("soundMode");if(!select||!company)return;
    if(!this.music&&company.soundMode==="music")company.soundMode="muted";
    if(!this.music&&company.soundMode==="both")company.soundMode=this.alert?"alerts":"muted";
    if(!this.alert&&company.soundMode==="alerts")company.soundMode="muted";
    if(!this.alert&&company.soundMode==="both")company.soundMode=this.music?"music":"muted";
    company.soundEnabled=company.soundMode!=="muted";
    select.value=company.soundMode;
    select.options[1].disabled=!this.alert;
    select.options[2].disabled=!this.music;
    select.options[3].disabled=!this.alert||!this.music;
    select.title=(!this.music&&!this.alert)?"Sound unavailable":"Sound options";
    select.classList.toggle("active",company.soundMode!=="muted");
  }
  startMusic(){
    if(!this.music||!this.wantsMusic()||musicUnavailable)return;
    this.musicBlocked=false;
    try{const promise=this.music.play();if(promise&&typeof promise.catch==="function")promise.catch(error=>{this.musicBlocked=true;});}
    catch(e){this.musicBlocked=true;}
  }
  stopMusic(){try{if(this.music){this.music.pause();this.music.currentTime=0;}}catch(e){this.musicBlocked=true;}}
  playAlert(){
    if(!this.alert||!this.wantsAlerts()||alertsUnavailable)return;
    this.alertBlocked=false;
    try{this.alert.volume=this.wantsMusic()?.95:.78;this.alert.currentTime=0;const promise=this.alert.play();if(promise&&typeof promise.catch==="function")promise.catch(error=>{this.alertBlocked=true;});}
    catch(e){alertsUnavailable=true;this.syncUi();}
  }
  unlockFromGesture(){
    this.userGestureSeen=true;
    if(this.music&&this.wantsMusic()&&!musicUnavailable)this.startMusic();
  }
  applyMode(value){
    if(!company)return;
    company.soundMode=["muted","alerts","music","both"].includes(value)?value:"muted";
    company.soundEnabled=company.soundMode!=="muted";
    this.syncUi();
    if(this.wantsMusic())this.startMusic();else this.stopMusic();
  }
}

class SimulationTimer{
  constructor(){this.id=null;}
  stop(){if(this.id!==null){clearInterval(this.id);this.id=null;}timer=null;}
  start(callback,delay){this.stop();this.id=setInterval(callback,delay);timer=this.id;}
}

class InMemorySaveRepository{
  constructor(){this.data=null;this.writeCount=0;}
  clone(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
  read(){return this.clone(this.data);}
  exists(){return !!this.data;}
  remove(){this.data=null;}
  write(companyState,employeeState){
    this.writeCount+=1;
    this.data=this.clone({company:companyState,employees:employeeState});
  }
}

class ManualSimulationTimer{
  constructor(){this.ticks=0;this.running=false;}
  start(){this.running=true;}
  stop(){this.running=false;}
  tick(context,minutes=5){
    assertIsolatedValidationEnvironment(context);
    this.ticks+=Math.max(1,Math.floor(minutes/5));
    simulateMinutesInContext(context,minutes);
  }
}

class IsolatedEventBus{
  constructor(){this.events=[];}
  emit(type,payload={}){this.events.push({type,payload});}
}

class SimulationContext{
  constructor({company,employees,rng,runtimeIds,repository,timer,eventBus,services,mode}){
    this.company=company;
    this.employees=employees;
    this.rng=rng;
    this.runtimeIds=runtimeIds;
    this.repository=repository;
    this.timer=timer;
    this.eventBus=eventBus;
    this.services=services||{};
    this.mode=mode||"live";
    this.isIsolatedValidation=this.mode==="isolated-validation";
    this.report=null;
    this.id=`${this.mode}-${this.runtimeIds?.next?.()||"context"}`;
  }
}

function assertIsolatedValidationEnvironment(context){
  if(!context?.isIsolatedValidation||context.mode!=="isolated-validation"){
    throw new Error("Balance validation cannot run inside the active company session.");
  }
}

class ValidationSession{
  constructor(repository,timerService){this.repository=repository;this.timerService=timerService;this.snapshot=null;}
  begin(){
    this.snapshot={company:this.repository.clone(company),employees:this.repository.clone(employees),debugMode,selectedEmployeeId};
    this.timerService.stop();
    validationMode=true;
  }
  restore(){
    validationMode=false;
    if(!this.snapshot)return;
    company=this.snapshot.company;
    employees=this.snapshot.employees;
    debugMode=this.snapshot.debugMode;
    selectedEmployeeId=this.snapshot.selectedEmployeeId;
    this.snapshot=null;
    buildOffice();
    renderDecisionEvent();
    render();
    restartTimer();
  }
}
