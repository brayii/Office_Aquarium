class SaveRepository{
  constructor(key,version){this.key=key;this.version=version;}
  clone(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
  read(){try{const raw=localStorage.getItem(this.key);return raw?JSON.parse(raw):null;}catch(e){return null;}}
  exists(){return !!this.read();}
  remove(){try{localStorage.removeItem(this.key);}catch(e){}}
  write(companyState,employeeState){
    const saveCompany={...companyState};delete saveCompany.runtime;
    localStorage.setItem(this.key,JSON.stringify({saveVersion:this.version,savedAt:new Date().toISOString(),company:saveCompany,employees:employeeState}));
  }
  summary(){
    const data=this.read();if(!data)return null;
    const c=data.company||{},identity=c.crisis||Number(c.cash)<2?"Distressed Company":Number(c.customers)>80?"Market Challenger":Number(c.customers)>0?"Early Commercial Company":"Technology Startup";
    return{day:(Number(c.day)||0)+1,cash:Number(c.cash)||0,valuation:Number(c.valuation)||0,identity,savedAt:data.savedAt||null};
  }
}

class SoundController{
  constructor({musicSrc,alertSrc}){this.music=this.create(musicSrc,{loop:true,volume:.28,kind:"music"});this.alert=this.create(alertSrc,{volume:.7,kind:"alerts"});}
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
    select.options[1].disabled=!this.alert||alertsUnavailable;
    select.options[2].disabled=!this.music||musicUnavailable;
    select.options[3].disabled=!this.alert||!this.music||alertsUnavailable||musicUnavailable;
    select.title=(!this.music&&!this.alert)?"Sound unavailable":"Sound options";
    select.classList.toggle("active",company.soundMode!=="muted");
  }
  startMusic(){
    if(!this.music||!this.wantsMusic()||musicUnavailable)return;
    try{const promise=this.music.play();if(promise&&typeof promise.catch==="function")promise.catch(()=>{});}
    catch(e){musicUnavailable=true;this.stopMusic();this.syncUi();}
  }
  stopMusic(){try{if(this.music){this.music.pause();this.music.currentTime=0;}}catch(e){musicUnavailable=true;}}
  playAlert(){
    if(!this.alert||!this.wantsAlerts()||alertsUnavailable)return;
    try{this.alert.currentTime=0;const promise=this.alert.play();if(promise&&typeof promise.catch==="function")promise.catch(()=>{});}
    catch(e){alertsUnavailable=true;this.syncUi();}
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
