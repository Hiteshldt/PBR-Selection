/* ════════ PBR Product Configurator — Client JS v1.1 ════════ */

/* ════════ CURRENCY ════════
   - India: INR, shown as ₹, GST @18% applicable
   - Other countries: USD, shown as $, converted from INR using USD_RATE × USD_MULT
*/
const USD_RATE=85;      // 1 USD ≈ ₹85
const USD_MULT=2.5;     // International markup multiplier
function cvNum(n){
  if(ST && ST.currency==='USD')return Math.round(n/USD_RATE*USD_MULT);
  return n;
}
function F(n){
  // Mask all pricing until user picks a country
  if(!ST || !ST.country) return '\u2014\u2014\u2014';
  if(ST.currency==='USD'){
    return '$'+cvNum(n).toLocaleString('en-US');
  }
  return '\u20B9'+n.toLocaleString('en-IN');
}

/* ════════ TANK CONFIG ════════
   - Custom: up to 50L with user-defined volume & dimensions
   - 100, 250, 500: fixed sizes
   - 1000L: largest configurable size; 1000L+: contact us
   - Frame + Hardware Kit combined into one price
   - LED strips 30% lower, tubes unchanged (always more expensive)
   - LED driver: 3000–6000 range
   - Fans: ₹2,700/unit
*/
const T={
  custom:{label:'Custom',maxVol:50,minVol:5,
    tank:74105,
    frameSS:39025,frameMS:27495,
    ledStrip:{qty:4,unit:3010,label:'4 strips'},ledTube:{qty:2,unit:6915,label:'2 tubes'},ledDrv:3755,
    heater:[{w:100,price:2760}],
    pump:{lpm:'2\u00d74 LPM (8 LPM)',w:'4W',price:3305},
    diffuser:{desc:'Single outlet',qty:1,price:2075},
    wavemaker:null,fans:1,fanPrice:3165},
  100:{label:'100 Litre',tank:111510,
    frameSS:50150,frameMS:34810,
    ledStrip:{qty:4,unit:3240,label:'4 strips'},ledTube:{qty:2,unit:7480,label:'2 tubes'},ledDrv:4105,
    heater:[{w:200,price:3955}],
    pump:{lpm:'10\u201315 LPM',w:'8W',price:4955},
    diffuser:{desc:'Dual outlet',qty:1,price:2905},
    wavemaker:null,fans:1,fanPrice:3165},
  250:{label:'250 Litre',tank:175230,
    frameSS:72570,frameMS:50150,
    ledStrip:{qty:6,unit:2820,label:'6 strips'},ledTube:{qty:4,unit:6640,label:'4 tubes'},ledDrv:5405,
    heater:[{w:300,price:5525}],
    pump:{lpm:'20\u201325 LPM',w:'15W',price:8850},
    diffuser:{desc:'Multi-outlet bar',qty:1,price:4545},
    wavemaker:{lpm:'40 LPM',price:9205},fans:1,fanPrice:3165},
  500:{label:'500 Litre',tank:246035,
    frameSS:106200,frameMS:73160,
    ledStrip:{qty:6,unit:3080,label:'6 strips'},ledTube:{qty:4,unit:7175,label:'4 tubes'},ledDrv:6890,
    heater:[{w:500,price:7495}],
    pump:{lpm:'45\u201355 LPM',w:'25W',price:16520},
    diffuser:{desc:'Diffuser manifold',qty:1,price:7410},
    wavemaker:{lpm:'60 LPM',price:13925},fans:2,fanPrice:3165},
  1000:{label:'1000 Litre',tank:368750,
    frameSS:141600,frameMS:100300,
    ledStrip:{qty:8,unit:3080,label:'8 strips'},ledTube:{qty:6,unit:7175,label:'6 tubes'},ledDrv:6890,
    heater:[{w:500,price:7495},{w:500,price:7495}],
    pump:{lpm:'60\u201380 LPM',w:'40W',price:21005},
    diffuser:{desc:'Diffuser manifold (dual)',qty:2,price:7410},
    wavemaker:{lpm:'80 LPM',price:17230},fans:2,fanPrice:3165}
};

/* Combined Electrical Panel + Misc (30% reduced) */
const ELEC_COMBINED=22715;
const HMI=135100;

/* ════════ SENSOR DATA ════════ */
const SENS={
  ph:{on:true,v:'ind',label:'pH Sensor + Transmitter',
    opts:{ind:{price:29265,name:'High-Precision Probe',grade:'Industrial',tag:'tg-i',
      desc:'Range: 0\u201314 pH \u2022 Accuracy: \u00b10.01 pH\nTemp: 0\u201360 \u00b0C \u2022 BNC probe \u2022 0\u20135V output\nDashboard-guided calibration \u2022 Auto temp compensation\nBest for continuous trend monitoring & long-term culture tracking'},
      norm:{price:5840,name:'Standard Probe',grade:'Normal',tag:'tg-n',
      desc:'Range: 0\u201314 pH \u2022 Accuracy: \u00b10.01 pH\nTemp: 0\u201350 \u00b0C \u2022 BNC connector \u2022 Analog output\nManual calibration\nSuited for periodic spot-check readings'}}},
  turb:{on:true,label:'Turbidity Sensor',grade:'Normal',tag:'tg-n',price:5840,
    specs:[['Range','0\u20133000 NTU'],['Accuracy','\u00b15% Full Scale'],['Supply','5 V DC'],['Output','Analog 0\u20134.5 V'],['Application','Algal density estimation, water clarity monitoring'],['Type','Laboratory \u2014 suited for periodic spot-check readings']]},
  tds:{on:true,label:'TDS Sensor',grade:'Normal',tag:'tg-n',price:5310,
    specs:[['Range','0\u20131000 ppm'],['Accuracy','\u00b110% Full Scale'],['Supply','3.3\u20135.5 V'],['Output','Analog 0\u20132.3 V'],['Application','Nutrient concentration monitoring'],['Type','Laboratory \u2014 suited for periodic spot-check readings']]},
  temp:{on:true,label:'Water Temperature \u2014 PT-100 RTD + Transmitter',grade:'Industrial',tag:'tg-i',price:4695,
    specs:[['Sensor Type','RTD PT-100, Pencil Type'],['Sheath','SS316, 6 mm dia, 100 mm length'],['Configuration','3-Wire Simplex'],['Range','-30 \u00b0C to 250 \u00b0C'],['Accuracy','\u00b10.5 \u00b0C @ 0 \u00b0C'],['Cable','7\u00d732 AWG, 3-core Teflon, 4 m'],['Transmitter','4\u201320 mA, -15 to 100 \u00b0C'],['Application','Continuous culture temperature & heater feedback']]},
  level:{on:true,label:'Liquid Level \u2014 Pressure Sensor',grade:'Industrial',tag:'tg-i',price:6960,
    specs:[['Type','Piezoresistive Pressure Transducer'],['Working Pressure','0\u201350 kPa'],['Accuracy','\u00b10.05% Full Scale'],['Output','4\u201320 mA'],['Supply','10\u201332 V DC'],['Response','\u226410 ms'],['Overload','200% rated'],['Operating Temp','-20 to 85 \u00b0C'],['IP / Conn.','IP65, G1/4'],['Application','Volume tracking, evaporation & fill monitoring']]},
  do:{on:true,v:'galv',label:'Dissolved Oxygen (DO) Sensor',
    opts:{galv:{price:20650,name:'Galvanic Membrane Probe',grade:'Normal',tag:'tg-n',
      desc:'Range: 0\u201320.0 ppm \u2022 Resolution: 0.1 ppm \u2022 Accuracy: \u00b10.2 ppm\nGold/Silver amperometric membrane type\nAnalog output via signal converter \u2022 9 V supply\nIncludes: probe, signal converter, 4\u00d7 DO membranes, KCL\nRequires periodic KCL electrolyte & membrane replacement'},
      opt:{price:68200,name:'Optical Fluorescence Probe',grade:'Industrial',tag:'tg-i',
      desc:'Range: 0\u201320 mg/L (0\u2013200% sat.) \u2022 Resolution: 0.01 mg/L\nAccuracy: \u00b13% FS \u2022 Response: \u226460 s \u2022 0\u201340 \u00b0C\nRS-485 Modbus RTU \u2022 DC 10\u201330 V \u2022 0.2 W \u2022 IP68\nNo electrolyte \u2022 Auto temp compensation\nFluorescent film life: 1 year \u2022 5 m cable'}}}
};

/* ════════ STATE ════════ */
let ST={
  country:'',      // empty until user selects — masks all pricing
  currency:'',     // 'INR' for India, 'USD' for everyone else, '' = unset
  size:'custom',
  customVol:50,
  customW:'',customH:'',customD:'',
  frame:'ss',      // 'ss','ms','none'
  led:'strip',     // 'strip','tube','none'
  air:'A',         // 'A','O','B','none'
  heater:false,
  wavemaker:false,
  aeration:true,
  fans:true,
  conn:'wifi',
  iotDash:true,
  electrical:true,
  hmi:true
};

/* ════════ HELPERS ════════ */
function cfg(){return ST.size==='custom'?T.custom:T[ST.size];}
function tankPrice(){return cfg().tank;}
function sizeLabel(){
  if(ST.size==='custom')return ST.customVol+'L (Custom)';
  return cfg().label;
}
function senP(k){const s=SENS[k];if(!s.on)return 0;return s.opts?s.opts[s.v].price:s.price;}
function anySen(){return Object.values(SENS).some(s=>s.on);}
function tSen(){let t=0;for(const k in SENS)t+=senP(k);return t;}
function tStruct(){
  let t=tankPrice();
  if(ST.frame!=='none')t+=(ST.frame==='ss'?cfg().frameSS:cfg().frameMS);
  return t;
}
function tLed(){
  if(ST.led==='none')return 0;
  const c=cfg();const l=ST.led==='strip'?c.ledStrip:c.ledTube;
  return l.qty*l.unit+c.ledDrv;
}
function tAir(){
  if(ST.air==='none')return 0;
  return ST.air==='B'?91800:51035;
}
function tThermal(){
  const c=cfg();let t=0;
  if(ST.heater)c.heater.forEach(h=>t+=h.price);
  if(ST.aeration){t+=c.pump.price+c.diffuser.price;}
  if(ST.wavemaker&&c.wavemaker)t+=c.wavemaker.price;
  if(ST.fans)t+=c.fans*c.fanPrice;
  return t;
}
function tElec(){
  let t=0;
  if(ST.electrical)t+=ELEC_COMBINED;
  if(ST.hmi)t+=HMI;
  return t;
}
function tIoT(){return ST.iotDash?((ST.conn==='wifi'?4435:25960)+41300):0;}
function sub(){return tStruct()+tLed()+tSen()+tAir()+tThermal()+tElec()+tIoT();}

function tick(){
  document.getElementById('tkTank').textContent=sizeLabel();
  document.getElementById('tkSen').textContent=F(tSen());
  document.getElementById('tkGr').textContent=F(sub());
}

/* ════════ CUSTOM TANK INPUTS ════════ */
function updateCustomVol(fromSlider){
  const slider=document.getElementById('fCustomSlider');
  const numInput=document.getElementById('fCustomVol');
  let v;
  if(fromSlider){v=parseInt(slider.value)||5;numInput.value=v;}
  else{v=parseInt(numInput.value)||5;if(v<5)v=5;if(v>50)v=50;numInput.value=v;slider.value=v;}
  ST.customVol=v;
  const lbl=document.getElementById('customVolLabel');
  if(lbl)lbl.textContent=v+'L';
  tick();
}
function updateCustomDim(){
  const w=parseInt(document.getElementById('fCustomW').value)||0;
  const h=parseInt(document.getElementById('fCustomH').value)||0;
  const d=parseInt(document.getElementById('fCustomD').value)||0;
  if(w>0&&w<20)document.getElementById('fCustomW').value=20;
  if(h>0&&h<20)document.getElementById('fCustomH').value=20;
  if(d>0&&d<20)document.getElementById('fCustomD').value=20;
  ST.customW=document.getElementById('fCustomW').value||'';
  ST.customH=document.getElementById('fCustomH').value||'';
  ST.customD=document.getElementById('fCustomD').value||'';
}

/* ════════ RENDER STEP 2 — Structure ════════ */
function rStep2(){
  const c=cfg();
  // Size cards
  let h='';
  h+=`<div class="sz${ST.size==='custom'?' pk':''}" onclick="pSz('custom')"><div class="sz-vol">Custom</div><div class="sz-lbl">Up to 50L</div></div>`;
  [100,250,500,1000].forEach(s=>{
    h+=`<div class="sz${ST.size===s?' pk':''}" onclick="pSz(${s})"><div class="sz-vol">${s}L</div><div class="sz-lbl">${F(T[s].tank)}</div></div>`;
  });
  h+=`<div class="sz" style="opacity:.65;cursor:default;border-style:dashed"><div class="sz-vol" style="font-size:14px">1000L+</div><div class="sz-lbl"><a href="https://wa.me/918590325180?text=Hi%20Carbelim%2C%20I%20need%20a%20quote%20for%201000L%2B%20PBR." target="_blank" rel="noopener" style="color:var(--g);text-decoration:none;font-weight:700">Contact Us</a></div></div>`;
  document.getElementById('szCards').innerHTML=h;

  // Custom inputs visibility
  const ci=document.getElementById('customTankInputs');
  if(ci){
    ci.style.display=ST.size==='custom'?'block':'none';
    if(ST.size==='custom'){
      const pr=document.getElementById('customTankPrice');
      if(pr)pr.textContent=F(tankPrice());
    }
  }

  // Frame options with toggle in sec-label
  const fSS=c.frameSS,fMS=c.frameMS;
  const frameOn=ST.frame!=='none';
  const frameSec=document.getElementById('frameSec');
  if(frameSec) frameSec.innerHTML=`<span class="n">2</span>Frame Structure &amp; Hardware Kit<label class="sw sec-sw" onclick="event.stopPropagation()"><input type="checkbox" ${frameOn?'checked':''} onchange="togFrame()"><span class="tk"></span></label>`;

  if(frameOn){
    document.getElementById('frameOpts').innerHTML=
      `<div class="opt${ST.frame==='ss'?' pk':''}" onclick="pFrame('ss')"><div class="opt-n">SS304 Matte Frame + Hardware Kit</div><div class="opt-d">Stainless Steel 304 square tube + complete SS hardware kit &bull; Corrosion resistant &bull; Powder coated</div><div class="opt-p">${F(fSS)}</div></div>
       <div class="opt${ST.frame==='ms'?' pk':''}" onclick="pFrame('ms')"><div class="opt-n">MS Frame + Hardware Kit</div><div class="opt-d">Mild Steel square tube + complete hardware kit &bull; Powder coated finish</div><div class="opt-p">${F(fMS)}</div></div>`;
  } else {
    document.getElementById('frameOpts').innerHTML='';
  }

  // Color picker visibility
  document.getElementById('colorRow').style.display=ST.frame!=='none'?'block':'none';

  // Preview
  let pv=`<strong>Auto-configured for ${sizeLabel()}:</strong> `;
  pv+=c.heater.map(h=>`${h.w}W Culture Heater`).join(' + ')+' &bull; ';
  pv+=`${c.pump.lpm} Aeration Pump &bull; Fine Bubble Diffuser`;
  if(c.wavemaker)pv+=` &bull; ${c.wavemaker.lpm} Wavemaker`;
  pv+=` &bull; ${c.fans} Auxiliary Fan${c.fans>1?'s':''}`;
  document.getElementById('sizePreview').innerHTML=pv;
}

function pSz(s){ST.size=s;rStep2();if(cur===3)rStep3Dyn();tick();}
function pFrame(f){ST.frame=f;rStep2();tick();}
function togFrame(){
  if(ST.frame==='none'){ST.frame='ss';}else{ST.frame='none';}
  rStep2();tick();
}


/* ═══ COLOUR PICKER ═══ */
const RAL_COLORS=[
  {name:'Jet Black',ral:'RAL 9005',hex:'#0A0A0A'},
  {name:'Anthracite Grey',ral:'RAL 7016',hex:'#293133'},
  {name:'Graphite Grey',ral:'RAL 7024',hex:'#474A50'},
  {name:'Light Grey',ral:'RAL 7035',hex:'#D7D7D7'},
  {name:'White Aluminium',ral:'RAL 9006',hex:'#A5A5A5'},
  {name:'Traffic White',ral:'RAL 9016',hex:'#F6F6F6'},
  {name:'Steel Blue',ral:'RAL 5011',hex:'#1A2B3C'},
  {name:'Sky Blue',ral:'RAL 5015',hex:'#2271B3'},
  {name:'Moss Green',ral:'RAL 6005',hex:'#2F4538'},
  {name:'Chocolate Brown',ral:'RAL 8017',hex:'#45322E'},
  {name:'Ruby Red',ral:'RAL 3003',hex:'#8D1D2C'},
  {name:'Signal Yellow',ral:'RAL 1003',hex:'#F3AD24'}
];
let selColorIdx=3;

function renderSwatches(){
  const el=document.getElementById('clrSwatches');if(!el)return;
  el.innerHTML=RAL_COLORS.map((c,i)=>
    `<div class="clr-sw${i===selColorIdx?' pk':''}" onclick="pickSwatch(${i})">
      <div class="swatch" style="background:${c.hex}"></div>
      <div class="sw-info"><div class="sw-name">${c.name}</div><div class="sw-code">${c.ral}</div></div>
    </div>`
  ).join('');
}
function updatePreview(name,hex,code){
  const s=document.getElementById('cpvSwatch');if(s)s.style.background=hex;
  ['pbrTop','pbrBottom','pbrLegL','pbrLegR'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.background=hex;});
  const tank=document.getElementById('pbrTank');if(tank)tank.style.borderColor=hex;
  const n=document.getElementById('cpvName'),cd=document.getElementById('cpvCode'),pk=document.getElementById('fColorPick');
  if(n)n.innerHTML=name;if(cd)cd.textContent=code||hex;if(pk)pk.value=hex;
}
function pickSwatch(i){
  selColorIdx=i;const c=RAL_COLORS[i];
  document.getElementById('fColor').value=c.ral+' - '+c.name;
  updatePreview(c.ral+' &mdash; '+c.name,c.hex,c.hex);renderSwatches();
}
function colorPickerChanged(hex){
  selColorIdx=-1;document.getElementById('fColor').value='Custom: '+hex;
  updatePreview('Custom Colour',hex,hex);renderSwatches();
}
function customColorTyped(){
  const v=document.getElementById('fColor').value.trim();if(!v)return;
  const lower=v.toLowerCase();
  const found=RAL_COLORS.findIndex(c=>lower.includes(c.ral.toLowerCase())||lower.includes(c.name.toLowerCase()));
  if(found>=0){selColorIdx=found;const c=RAL_COLORS[found];updatePreview(c.ral+' &mdash; '+c.name,c.hex,c.hex);renderSwatches();}
  else{selColorIdx=-1;const hexMatch=v.match(/#([0-9a-fA-F]{3,8})/);
    if(hexMatch){updatePreview('Custom: '+v,'#'+hexMatch[1],'#'+hexMatch[1]);}
    else{updatePreview('Custom: '+v,'#888888','We will best-match this');}
    renderSwatches();}
}

function pLed(l){ST.led=l;rStep3Dyn();tick();}
function togLed(){
  if(ST.led==='none'){ST.led='strip';}else{ST.led='none';}
  rStep3Dyn();tick();
}

/* ════════ RENDER STEP 3 — Core Technology ════════ */
function rStep3Dyn(){
  const c=cfg();

  // LED options with toggle in sec-label
  const ls=c.ledStrip,lt=c.ledTube;
  const ledOn=ST.led!=='none';
  const ledSec=document.getElementById('ledSec');
  if(ledSec) ledSec.innerHTML=`<span class="n">1</span>LED Grow Lighting<label class="sw sec-sw" onclick="event.stopPropagation()"><input type="checkbox" ${ledOn?'checked':''} onchange="togLed()"><span class="tk"></span></label>`;

  if(ledOn){
    document.getElementById('ledOpts').innerHTML=
      `<div class="opt${ST.led==='strip'?' pk':''}" onclick="pLed('strip')"><div class="opt-n">LED Grow Strips</div><div class="opt-d">${ls.label}, full perimeter &bull; Full-spectrum grow light &bull; Relay-controlled &bull; 24V DC</div><div class="opt-p">${F(ls.qty*ls.unit)}</div></div>
       <div class="opt${ST.led==='tube'?' pk':''}" onclick="pLed('tube')"><div class="opt-n">High-Output LED Grow Tubes</div><div class="opt-d">${lt.label}, enhanced PAR output &bull; Maximum lumination &bull; Relay-controlled &bull; 24V DC</div><div class="opt-p">${F(lt.qty*lt.unit)}</div></div>`;
  } else {
    document.getElementById('ledOpts').innerHTML='';
  }

  // LED driver (only if LED selected)
  document.getElementById('ledDrvRow').innerHTML=ST.led!=='none'
    ?`<div class="ib"><div class="in">LED Driver / Power Supply 24 V</div><div class="is">DIN-rail mount &bull; Overload &amp; short-circuit protection</div></div><div class="ie"><div class="ip">${F(c.ledDrv)}</div><div class="it">Included</div></div>`
    :'';
  document.getElementById('ledDrvRow').style.display=ST.led!=='none'?'flex':'none';

  // Heater toggle (custom <30L: not available)
  const htrEl=document.getElementById('heaterToggle');
  const htrAvail=!(ST.size==='custom'&&ST.customVol<30);
  if(htrAvail){
    const htrTotal=c.heater.reduce((a,h)=>a+h.price,0);
    const htrDesc=c.heater.map(h=>h.w+'W').join(' + ');
    htrEl.innerHTML=
      `<div class="sen ${ST.heater?'on':'off'}" id="sen-heater"><div class="sen-hd" onclick="tog('heater')">
        <span class="sen-nm">Culture Heater &mdash; ${htrDesc}${c.heater.length>1?' (Dual)':''}</span>
        <span class="sen-tg tg-i" style="margin-right:4px">Free Panel Integration</span>
        <span class="sen-pr">${F(htrTotal)}</span>
        <label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${ST.heater?'checked':''} onchange="tog('heater')"><span class="tk"></span></label>
      </div>
      <div class="sen-bd"><div class="sen-sp"><table>
        <tr><td>Capacity</td><td>${htrDesc} &bull; Sized for ${sizeLabel()} tank</td></tr>
        <tr><td>Control</td><td>SSR-controlled via HMI &bull; Auto temperature setpoint</td></tr>
        <tr><td>Integration</td><td>Free integration with control panel included</td></tr>
      </table></div></div></div>`;
  } else {
    if(ST.heater)ST.heater=false;
    htrEl.innerHTML=`<p style="font-size:10px;color:var(--ink4);padding:8px 0">Heater available for custom tanks 30L and above.</p>`;
  }

  // Aeration toggle
  const aerTotal=c.pump.price+c.diffuser.price;
  document.getElementById('elDynamic').innerHTML=
    `<div class="sen ${ST.aeration?'on':'off'}" id="sen-aeration"><div class="sen-hd" onclick="tog('aeration')">
      <span class="sen-nm">Aeration System &mdash; ${c.pump.lpm} + ${c.diffuser.desc} Diffuser</span>
      <span class="sen-pr">${F(aerTotal)}</span>
      <label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${ST.aeration?'checked':''} onchange="tog('aeration')"><span class="tk"></span></label>
    </div>
    <div class="sen-bd"><div class="sen-sp"><table>
      <tr><td>Pump</td><td>${c.pump.lpm} &bull; ${c.pump.w} &bull; Manual flow control valve</td></tr>
      <tr><td>Diffuser</td><td>${c.diffuser.desc} &bull; Optimised for ${sizeLabel()} volume</td></tr>
      <tr><td>Total</td><td>Pump ${F(c.pump.price)} + Diffuser ${F(c.diffuser.price)}</td></tr>
    </table></div></div></div>`;

  // Wavemaker toggle (only for 250L+)
  const wmEl=document.getElementById('wavemakerToggle');
  if(c.wavemaker){
    wmEl.innerHTML=
      `<div class="sen ${ST.wavemaker?'on':'off'}" id="sen-wavemaker"><div class="sen-hd" onclick="tog('wavemaker')">
        <span class="sen-nm">Wavemaker &mdash; ${c.wavemaker.lpm}</span>
        <span class="sen-tg tg-i" style="margin-right:4px">Free Panel Integration</span>
        <span class="sen-pr">${F(c.wavemaker.price)}</span>
        <label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${ST.wavemaker?'checked':''} onchange="tog('wavemaker')"><span class="tk"></span></label>
      </div>
      <div class="sen-bd"><div class="sen-sp"><table>
        <tr><td>Capacity</td><td>${c.wavemaker.lpm} &bull; Recirculation &amp; mixing for ${sizeLabel()} volume</td></tr>
        <tr><td>Control</td><td>Timer-based relay control via HMI &bull; Configurable ON/OFF cycles</td></tr>
        <tr><td>Integration</td><td>Free integration with control panel included</td></tr>
      </table></div></div></div>`;
  } else {
    wmEl.innerHTML=`<p style="font-size:10px;color:var(--ink4);padding:8px 0">Wavemaker is available for 250L+ tanks. Select a larger tank to enable this option.</p>`;
  }

  // Fan toggle
  document.getElementById('fanDynamic').innerHTML=
    `<div class="sen ${ST.fans?'on':'off'}" id="sen-fans"><div class="sen-hd" onclick="tog('fans')">
      <span class="sen-nm">Auxiliary Circulation Fan${c.fans>1?'s (\u00d7'+c.fans+')':''}</span>
      <span class="sen-pr">${F(c.fans*c.fanPrice)}</span>
      <label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${ST.fans?'checked':''} onchange="tog('fans')"><span class="tk"></span></label>
    </div>
    <div class="sen-bd"><div class="sen-sp"><table>
      <tr><td>Type</td><td>Air intake &amp; HVAC circulation &bull; Relay-controlled</td></tr>
      <tr><td>Price</td><td>${F(c.fanPrice)} &times; ${c.fans} unit${c.fans>1?'s':''}</td></tr>
    </table></div></div></div>`;
}

/* ════════ RENDER SENSORS ════════ */
function rSensors(){
  let h='';
  for(const k in SENS){
    const s=SENS[k];const on=s.on;const cls=on?'on':'off';
    const price=s.opts?s.opts[s.v].price:s.price;
    h+=`<div class="sen ${cls}" id="sen-${k}"><div class="sen-hd" onclick="togS('${k}')">`;
    h+=`<span class="sen-nm">${s.label}</span>`;
    if(!s.opts&&s.grade)h+=`<span class="sen-tg ${s.tag}">${s.grade} Grade</span>`;
    h+=`<span class="sen-pr" id="${k}-pr">${F(price)}</span>`;
    h+=`<label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${on?'checked':''} onchange="togS('${k}')"><span class="tk"></span></label></div>`;
    h+=`<div class="sen-bd">`;
    if(s.opts){
      h+=`<div class="vars">`;
      for(const vk in s.opts){
        const o=s.opts[vk];const pk=s.v===vk?'pk':'';
        h+=`<div class="vr ${pk}" data-s="${k}" data-v="${vk}" onclick="pickV(this)">`;
        h+=`<div class="vr-n">${o.name}</div><div class="vr-t ${o.tag}">${o.grade} Grade</div>`;
        h+=`<div class="vr-p">${F(o.price)}</div>`;
        h+=`<div class="vr-d">${o.desc.replace(/\n/g,'<br>')}</div></div>`;
      }
      h+=`</div>`;
    } else if(s.specs){
      h+=`<div class="sen-sp"><table>`;
      s.specs.forEach(r=>h+=`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`);
      h+=`</table></div>`;
    }
    h+=`</div></div>`;
  }
  document.getElementById('sensorCards').innerHTML=h;
}
function togS(k){SENS[k].on=!SENS[k].on;rSensors();tick();}
function pickV(el){const k=el.dataset.s,v=el.dataset.v;SENS[k].v=v;rSensors();tick();}

/* ════════ AIR SENSOR OPTIONS (dynamic) ════════ */
function rAirOpts(){
  const airOn=ST.air!=='none';
  // Sync header checkbox
  const chk=document.getElementById('airToggleChk');
  if(chk)chk.checked=airOn;
  // Show/hide body
  const body=document.getElementById('airBody');
  if(body)body.style.display=airOn?'block':'none';
  // Placement options
  if(airOn){
    const opts=[
      {key:'A',name:'Inlet Only',desc:'Single module at air inlet. Monitors incoming air quality fed to the culture.',price:51035},
      {key:'O',name:'Outlet Only',desc:'Single module at air outlet. Monitors exhaust gases &mdash; CO\u2082 uptake & O\u2082 production.',price:51035},
      {key:'B',name:'Inlet + Outlet',desc:'Dual modules. Differential analysis &mdash; CO\u2082 uptake, O\u2082 production, air purification efficiency.',price:91800}
    ];
    let h='<div class="opts opts3">';
    opts.forEach(o=>{
      h+=`<div class="opt${ST.air===o.key?' pk':''}" data-air="${o.key}" onclick="pAir(this)"><div class="opt-n">${o.name}</div><div class="opt-d">${o.desc}</div><div class="opt-p">${F(o.price)}</div></div>`;
    });
    h+='</div>';
    document.getElementById('airOpts').innerHTML=h;
  } else {
    const el=document.getElementById('airOpts');
    if(el)el.innerHTML='';
  }
}
function togAirSensor(){
  if(ST.air==='none'){ST.air='A';}else{ST.air='none';}
  rAirOpts();tick();
}

/* ════════ RENDER STEP 5 — Control & Electrical (dynamic) ════════ */
function rStep5(){
  let h='';

  // Combined Electrical Panel + Misc
  h+=`<div class="sec-label"><span class="n">1</span>Electrical Panel &amp; Accessories</div>`;
  h+=`<div class="sen ${ST.electrical?'on':'off'}" id="sen-electrical"><div class="sen-hd" onclick="tog('electrical')">
    <span class="sen-nm">Electrical Panel, MCB, RCCB, SMPS &amp; Wiring Kit</span>
    <span class="sen-pr">${F(ELEC_COMBINED)}</span>
    <label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${ST.electrical?'checked':''} onchange="tog('electrical')"><span class="tk"></span></label>
  </div>
  <div class="sen-bd"><div class="sen-sp"><table>
    <tr><td>Panel</td><td>DIN-rail IP65 enclosure &bull; 2P 16A MCB + 30mA RCCB &bull; 24V + 12V SMPS (150W)</td></tr>
    <tr><td>Accessories</td><td>Complete wiring, cables, connectors, labels, ferrules &amp; documentation pack</td></tr>
  </table></div></div></div>`;

  // HMI / PLC
  h+=`<div class="sec-label"><span class="n">2</span>PLC / HMI &mdash; FT2J-7U</div>`;
  h+=`<div class="sen ${ST.hmi?'on':'off'}" id="sen-hmi"><div class="sen-hd" onclick="tog('hmi')">
    <span class="sen-nm">All-in-One HMI + PLC Control Unit (WiFi included)</span>
    <span class="sen-pr">${F(HMI)}</span>
    <label class="sw" onclick="event.stopPropagation()"><input type="checkbox" ${ST.hmi?'checked':''} onchange="tog('hmi')"><span class="tk"></span></label>
  </div>
  <div class="sen-bd"><div class="sen-sp"><table>
    <tr><td>Display</td><td>7\u2033 TFT LCD, 800\u00d7400, PCAP multi-touch, glove-compatible</td></tr>
    <tr><td>I/O</td><td>14 digital in (sink/source) + 8 relay out (2A) &bull; Expandable</td></tr>
    <tr><td>Analog</td><td>Built-in 4\u201320 mA &amp; 0\u201310 V &bull; RTD/thermocouple via expansion</td></tr>
    <tr><td>Comm</td><td>Ethernet + RS-485 + USB + WiFi &bull; FTP, email, remote web, mobile app</td></tr>
    <tr><td>Control</td><td>PID + PWM + data logging + scripting &bull; Alarms &amp; setpoints</td></tr>
    <tr><td>Power</td><td>24 V DC, 5 W &bull; IP66F/IP67F &bull; -20 to +55 \u00b0C</td></tr>
  </table></div></div></div>`;

  document.getElementById('controlContent').innerHTML=h;
}

/* ════════ OTHER HANDLERS ════════ */
function pAir(el){ST.air=el.dataset.air;rAirOpts();tick();}
function syncIoTUI(){
  const sec=document.getElementById('connSection'),hint=document.getElementById('connHint');
  if(sec)sec.style.display=ST.iotDash?'block':'none';
  if(hint)hint.style.display=ST.iotDash?'none':'block';
}
function tog(k){
  if(k==='iotDash'&&ST.hmi){
    ST.iotDash=!ST.iotDash;
    const el=document.getElementById('sen-iotDash'),cb=el.querySelector('input');
    cb.checked=ST.iotDash;el.classList.toggle('on',ST.iotDash);el.classList.toggle('off',!ST.iotDash);
    syncIoTUI();
  }
  if(k==='heater'){ST.heater=!ST.heater;if(cur===3)rStep3Dyn();}
  if(k==='wavemaker'){ST.wavemaker=!ST.wavemaker;if(cur===3)rStep3Dyn();}
  if(k==='aeration'){ST.aeration=!ST.aeration;if(cur===3)rStep3Dyn();}
  if(k==='fans'){ST.fans=!ST.fans;if(cur===3)rStep3Dyn();}
  if(k==='electrical'){ST.electrical=!ST.electrical;if(cur===4)rStep5();}
  if(k==='hmi'){
    ST.hmi=!ST.hmi;
    if(!ST.hmi){
      // Disable IoT and sensors when HMI is off
      ST.iotDash=false;
      for(const sk in SENS)SENS[sk].on=false;
      ST.air='none';
    }
    syncHmiDeps();
    if(cur===4)rStep5();
  }
  tick();
}

function syncHmiDeps(){
  // IoT card
  const iotCard=document.getElementById('iotCard');
  const notice=document.getElementById('noHmiNotice');
  if(iotCard)iotCard.style.display=ST.hmi?'block':'none';

  // IoT toggle sync
  const iotEl=document.getElementById('sen-iotDash');
  if(iotEl){
    const cb=iotEl.querySelector('input');
    if(cb)cb.checked=ST.iotDash;
    iotEl.classList.toggle('on',ST.iotDash);iotEl.classList.toggle('off',!ST.iotDash);
  }
  syncIoTUI();

  // Air sensor sync
  rAirOpts();

  // Notice
  if(notice){
    if(!ST.hmi){
      // Build list of active components
      const active=[];
      if(ST.led!=='none')active.push('LED Lighting');
      if(ST.heater)active.push('Culture Heater');
      if(ST.aeration)active.push('Aeration System');
      if(ST.wavemaker&&cfg().wavemaker)active.push('Wavemaker');
      if(ST.fans)active.push('Circulation Fans');

      let msg=`<div class="card" style="background:#fef2f2;border-color:#fecaca">
        <div class="card-h" style="border-bottom-color:#fecaca"><h2 style="color:#991b1b">HMI + PLC Not Selected</h2></div>
        <p style="font-size:11px;color:#7f1d1d;line-height:1.7;margin-bottom:8px">
          Without the HMI + PLC control unit, the following will not be available:
        </p>
        <ul style="font-size:11px;color:#991b1b;padding-left:18px;line-height:1.8;margin-bottom:10px">
          <li><strong>Sensors disabled</strong> &mdash; All water quality and air sensors require PLC for data acquisition and display</li>
          <li><strong>IoT &amp; Cloud Dashboard disabled</strong> &mdash; Remote monitoring requires PLC as the data gateway</li>
          <li><strong>Automation disabled</strong> &mdash; No PID temperature control, no scheduled light cycles, no automated alerts</li>
        </ul>`;
      if(active.length>0){
        msg+=`<p style="font-size:11px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;line-height:1.7">
          <strong>Manual control enabled for:</strong> ${active.join(', ')}. These components will operate via direct relay switches on the electrical panel (ON/OFF only, no scheduling or automation).
        </p>`;
      }
      msg+=`</div>`;
      notice.innerHTML=msg;
      notice.style.display='block';
    } else {
      notice.style.display='none';
    }
  }

  // Re-render sensors if on step 5
  if(cur===5){syncSensorPage();rSensors();rAirOpts();}
}

function syncSensorPage(){
  const noHmi=document.getElementById('sensorNoHmi');
  const sCard=document.getElementById('sensorCard');
  const airCard=sCard?sCard.nextElementSibling:null;
  if(!ST.hmi){
    if(noHmi){
      noHmi.innerHTML=`<div class="card" style="background:#fef2f2;border-color:#fecaca">
        <div class="card-h" style="border-bottom-color:#fecaca"><h2 style="color:#991b1b">Sensors Unavailable</h2></div>
        <p style="font-size:11px;color:#7f1d1d;line-height:1.7">
          Sensors require the <strong>HMI + PLC Control Unit</strong> for data acquisition, signal processing, and display. Without PLC, sensor data cannot be read or recorded.
        </p>
        <p style="font-size:11px;color:#7f1d1d;line-height:1.7;margin-top:6px">
          Go to <strong>Step 4 (Control &amp; IoT)</strong> to enable the HMI + PLC, then return here to configure sensors.
        </p>
      </div>`;
      noHmi.style.display='block';
    }
    if(sCard)sCard.style.display='none';
    // hide air card (next sibling card)
    if(airCard)airCard.style.display='none';
  } else {
    if(noHmi)noHmi.style.display='none';
    if(sCard)sCard.style.display='block';
    if(airCard)airCard.style.display='block';
  }
}

function pConn(el){if(!ST.iotDash)return;ST.conn=el.dataset.conn;document.querySelectorAll('[data-conn]').forEach(o=>o.classList.remove('pk'));el.classList.add('pk');tick();}

function addAddon(id,btn){
  if(id==='heater')ST.heater=true;
  if(id==='wavemaker')ST.wavemaker=true;
  if(id==='iotSuite'){ST.iotDash=true;ST.conn='wifi';syncIoTUI();}
  if(id==='hmi')ST.hmi=true;
  if(id==='electrical')ST.electrical=true;
  if(id==='frame'){ST.frame='ss';}
  if(id==='led'){ST.led='strip';}
  if(id==='aeration')ST.aeration=true;
  if(id==='airSensor'){ST.air='A';}
  if(id==='fans')ST.fans=true;
  btn.textContent='Added';btn.classList.add('added');btn.disabled=true;
  tick();rStep6();
}

/* ════════ BADGES ════════ */
function badges(){
  const b=[];b.push(sizeLabel()+' PBR');
  if(ST.frame!=='none')b.push(ST.frame==='ss'?'SS304 Frame':'MS Powder Coated');
  else b.push('Tank Only');
  if(ST.led!=='none')b.push(ST.led==='strip'?'LED Strips':'LED Tubes');
  else b.push('No LED');
  const nm={ph:'pH',turb:'Turbidity',tds:'TDS',temp:'Temperature',level:'Level',do:'DO'};
  for(const k in SENS){
    if(SENS[k].on){let l=nm[k];
      if(SENS[k].opts){const o=SENS[k].opts[SENS[k].v];l+=` (${o.grade})`;}
      b.push(l);
    }
  }
  if(ST.air!=='none')b.push(ST.air==='A'?'Air: Inlet':ST.air==='O'?'Air: Outlet':'Air: In+Out');
  else b.push('No Air Sensor');
  if(ST.aeration)b.push('Aeration');
  if(ST.fans)b.push('Fans');
  if(ST.heater)b.push('Heater');
  if(ST.wavemaker&&cfg().wavemaker)b.push('Wavemaker');
  if(ST.electrical)b.push('Elec Panel');
  if(ST.hmi)b.push('HMI/PLC');
  if(ST.iotDash){
    b.push(ST.conn==='wifi'?'WiFi':'WiFi+4G');
    b.push('Cloud IoT');
  }
  return b.map(x=>`<span class="badge">${x}</span>`).join('');
}

/* ════════ BOM ════════ */
function rBOM(){
  const c=cfg(),tb=document.getElementById('bomTb');let h='',n=0,tot=0;
  const sec=t=>{h+=`<tr class="cat"><td colspan="7">${t}</td></tr>`;};
  const row=(d,q,u,p,r)=>{n++;const t=q*p;tot+=t;h+=`<tr><td>${n}</td><td>${d}</td><td class="ac">${q}</td><td>${u}</td><td class="ar">${F(p)}</td><td class="ar">${F(t)}</td><td>${r}</td></tr>`;return t;};
  const srow=(v)=>{h+=`<tr class="sub"><td colspan="5" class="ar">Subtotal</td><td class="ar">${F(v)}</td><td></td></tr>`;};
  let s;

  // STRUCTURE
  s=0;sec('STRUCTURE &amp; MECHANICAL');
  s+=row(`Acrylic Culture Tank ${ST.size==='custom'?ST.customVol+'L (Custom)':ST.size+'L'}`,1,'pcs',tankPrice(),'Cast acrylic, sealed, drain port + valves');
  if(ST.frame!=='none'){
    s+=row(ST.frame==='ss'?'SS304 Frame + Hardware Kit':'MS Frame + Hardware Kit',1,'set',ST.frame==='ss'?c.frameSS:c.frameMS,'Frame + bolts, nuts, standoffs');
  }
  srow(s);

  // LED
  if(ST.led!=='none'){
    s=0;sec('LED GROW LIGHTING');
    const ld=ST.led==='strip'?c.ledStrip:c.ledTube;
    s+=row(ST.led==='strip'?'Full-Spectrum LED Grow Strips':'High-Output LED Grow Tubes',ld.qty,ST.led==='strip'?'strips':'tubes',ld.unit,'24V DC, full-spectrum grow light');
    s+=row('LED Driver / PSU 24V',1,'pcs',c.ledDrv,'DIN-rail, OLP/SCP');
    srow(s);
  }

  // WATER QUALITY SENSORS
  if(anySen()){
    s=0;sec('WATER QUALITY SENSORS');
    if(SENS.ph.on){const o=SENS.ph.opts[SENS.ph.v];s+=row(`pH Sensor (${o.grade})`,1,'pcs',o.price,'BNC, 0\u201314 pH, \u00b10.01');}
    if(SENS.turb.on)s+=row('Turbidity Sensor (Normal)',1,'pcs',SENS.turb.price,'0\u20133000 NTU, analog');
    if(SENS.tds.on)s+=row('TDS Sensor (Normal)',1,'pcs',SENS.tds.price,'0\u20131000 ppm, analog');
    if(SENS.temp.on)s+=row('Temperature PT-100 + Transmitter',1,'set',SENS.temp.price,'SS316, 4\u201320mA');
    if(SENS.level.on)s+=row('Level Pressure Transducer',1,'pcs',SENS.level.price,'0\u201350kPa, 4\u201320mA, IP65');
    if(SENS.do.on){const o=SENS.do.opts[SENS.do.v];s+=row(`DO Sensor (${o.name})`,1,'pcs',o.price,SENS.do.v==='galv'?'0\u201320 ppm, membrane':'0\u201320 mg/L, RS-485, IP68');}
    srow(s);
  }

  // AIR QUALITY SENSORS
  if(ST.air!=='none'){
    s=0;sec('AIR QUALITY SENSORS');
    if(ST.air==='A')s+=row('ZPHS01B Air Quality Module (Inlet)',1,'pcs',51035,'11 parameters, UART');
    else if(ST.air==='O')s+=row('ZPHS01B Air Quality Module (Outlet)',1,'pcs',51035,'11 parameters, UART');
    else{s+=row('ZPHS01B Air Quality Module (Inlet+Outlet)',2,'pcs',45900,'Dual, 11 params each');}
    srow(s);
  }

  // AERATION, MIXING & CIRCULATION
  const hasAerSection=ST.aeration||ST.fans||(ST.wavemaker&&c.wavemaker);
  if(hasAerSection){
    s=0;sec('AERATION, MIXING &amp; CIRCULATION');
    if(ST.aeration){
      s+=row(`Aeration Pump (${c.pump.lpm})`,1,'pcs',c.pump.price,c.pump.w+', valve control');
      s+=row('Fine Bubble Diffuser',c.diffuser.qty,'pcs',c.diffuser.price,c.diffuser.desc);
    }
    if(ST.fans)s+=row('Circulation Fan (HVAC)',c.fans,'pcs',c.fanPrice,'Air intake, relay-controlled');
    if(ST.wavemaker&&c.wavemaker)s+=row(`Wavemaker (${c.wavemaker.lpm})`,1,'pcs',c.wavemaker.price,'Timer-based relay, recirculation');
    srow(s);
  }

  // ELECTRICAL & CONTROL
  const hasElecSection=ST.electrical||ST.hmi;
  if(hasElecSection){
    s=0;sec('ELECTRICAL &amp; CONTROL');
    if(ST.electrical)s+=row('Electrical Panel, MCB, RCCB, SMPS & Wiring Kit',1,'set',ELEC_COMBINED,'IP65, MCB, RCCB, SMPS + cables & connectors');
    if(ST.hmi)s+=row('FT2J-7U HMI + PLC',1,'pcs',HMI,'7\u2033 touch, 22 I/O, WiFi included');
    srow(s);
  }

  // OPTIONAL ADD-ONS (heater)
  if(ST.heater){
    s=0;sec('OPTIONAL ADD-ONS (free panel integration)');
    c.heater.forEach((ht,i)=>s+=row(`Culture Heater ${ht.w}W${c.heater.length>1?' #'+(i+1):''}`,1,'pcs',ht.price,'SSR-controlled, auto temp setpoint'));
    srow(s);
  }

  // IoT
  if(ST.iotDash){
    s=0;sec('CONNECTIVITY &amp; IoT');
    if(ST.conn==='wifi')s+=row('WiFi Connectivity (Standard)',1,'pcs',4435,'802.11 b/g/n, MQTT over TLS');
    else s+=row('WiFi + 4G LTE Cat-4',1,'pcs',25960,'Standalone SIM, no router required');
    s+=row('Cloud IoT Dashboard (setup + 1yr)',1,'service',41300,'WebSocket, remote control, data retention');
    srow(s);
  }

  h+=`<tr class="sub"><td colspan="5" class="ar">Components Subtotal</td><td class="ar">${F(tot)}</td><td></td></tr>`;
  h+=`<tr class="grand"><td colspan="5" class="ar">Total${ST.currency==='INR'?' (ex-GST)':''}</td><td class="ar">${F(sub())}</td><td>${ST.currency==='INR'?'+ GST @18% applicable':'USD, ex-works'}</td></tr>`;
  tb.innerHTML=h;
  document.getElementById('bomBdg').innerHTML=badges();
}

/* ════════ STEP 6 — REVIEW & RECOMMENDATIONS ════════ */
function rStep6(){
  const v=id=>document.getElementById(id).value||'\u2014';
  let clInfo=`<div><span class="lk">Organisation</span><span class="lv">${v('fOrg')}</span></div>
     <div><span class="lk">Contact</span><span class="lv">${v('fName')}</span></div>
     <div><span class="lk">Email</span><span class="lv">${v('fEmail')}</span></div>
     <div><span class="lk">Phone</span><span class="lv">${v('fPhone')}</span></div>
     <div><span class="lk">Country</span><span class="lv">${v('fCountry')}</span></div>
     <div><span class="lk">Date</span><span class="lv">${v('fDate')}</span></div>
     <div><span class="lk">Reference</span><span class="lv">${v('fRef')}</span></div>
     <div><span class="lk">Delivery</span><span class="lv">${v('fLoc')}</span></div>`;
  if(ST.size==='custom'&&(ST.customW||ST.customH||ST.customD)){
    clInfo+=`<div><span class="lk">Tank Dims</span><span class="lv">${ST.customW||'?'} \u00d7 ${ST.customH||'?'} \u00d7 ${ST.customD||'?'} cm</span></div>`;
  }
  document.getElementById('sCl').innerHTML=clInfo;
  document.getElementById('sBdg').innerHTML=badges();

  // Smart addon suggestions
  const c2=cfg(),suggestions=[];
  const sz=sizeLabel();

  // HMI — critical for automation
  if(!ST.hmi){
    suggestions.push({id:'hmi',name:'FT2J-7U HMI + PLC Control Unit',
      desc:`Without an HMI, your ${sz} PBR will need manual operation. The 7\u2033 touchscreen gives you automated scheduling, PID temperature control, real-time sensor readouts, alarm management, and data logging \u2014 all from one screen.`,
      price:HMI,pulse:true,tag:'Strongly Recommended'});
  }

  // IoT Dashboard
  if(!ST.iotDash){
    suggestions.push({id:'iotSuite',name:'Cloud IoT Dashboard + WiFi Connectivity',
      desc:'Monitor your PBR remotely from any device. Get live sensor data, automated alerts when parameters drift, remote relay control, and historical trends for research documentation. One-time setup with web + mobile access.',
      price:45735,pulse:true,tag:'Remote Access'});
  }

  // Electrical panel
  if(!ST.electrical){
    suggestions.push({id:'electrical',name:'Electrical Panel, MCB, RCCB, SMPS & Wiring Kit',
      desc:'Provides safe, organised power distribution with overload protection (MCB), earth leakage safety (RCCB), and regulated 24V/12V DC supply for all sensors and actuators. Essential for any production setup.',
      price:ELEC_COMBINED,tag:'Safety Critical'});
  }

  // Heater
  const htrAvail=!(ST.size==='custom'&&ST.customVol<30);
  if(!ST.heater&&htrAvail){
    const hd=c2.heater.map(h=>h.w+'W').join(' + ');
    const hp=c2.heater.reduce((a,h)=>a+h.price,0);
    suggestions.push({id:'heater',name:`${hd} Culture Heater${c2.heater.length>1?' (Dual)':''}`,
      desc:`Maintain optimal growth temperature (25\u201330\u00b0C) automatically. SSR-controlled with setpoint adjustment via HMI. Critical for consistent culture productivity, especially in cooler environments.`,
      price:hp,tag:'Free Panel Integration'});
  }

  // Frame
  if(ST.frame==='none'){
    suggestions.push({id:'frame',name:'Frame Structure & Hardware Kit',
      desc:`A frame provides structural support, vibration isolation, and proper positioning for your ${sz} tank. SS304 frame recommended for lab environments \u2014 corrosion resistant with powder-coated finish.`,
      price:c2.frameSS,tag:'Structural Support'});
  }

  // LED
  if(ST.led==='none'){
    suggestions.push({id:'led',name:'LED Grow Lighting',
      desc:'Full-spectrum LED lighting is essential for photosynthetic cultures. Provides controlled PAR output with relay-based scheduling for light/dark cycles. 24V DC, energy efficient.',
      price:c2.ledStrip.qty*c2.ledStrip.unit+c2.ledDrv,tag:'Growth Essential'});
  }

  // Wavemaker
  if(!ST.wavemaker&&c2.wavemaker){
    suggestions.push({id:'wavemaker',name:`Wavemaker \u2014 ${c2.wavemaker.lpm}`,
      desc:`Improves culture homogeneity and prevents sedimentation in your ${sz} tank. Timer-controlled recirculation with configurable ON/OFF cycles.`,
      price:c2.wavemaker.price,tag:'Free Panel Integration'});
  }

  // Aeration
  if(!ST.aeration){
    suggestions.push({id:'aeration',name:'Aeration System',
      desc:`CO\u2082 supply and gas exchange are fundamental to photobioreactor performance. Fine bubble diffuser maximises gas transfer efficiency for your ${sz} volume.`,
      price:c2.pump.price+c2.diffuser.price,tag:'Growth Essential'});
  }

  // Air sensor
  if(ST.air==='none'){
    suggestions.push({id:'airSensor',name:'Air Quality Sensor \u2014 ZPHS01B',
      desc:'Monitors 11 air parameters including CO\u2082, O\u2082, PM2.5, and VOCs. Track photosynthetic CO\u2082 uptake and O\u2082 production rates for culture health assessment and research documentation.',
      price:51035,tag:'Research Grade'});
  }

  // Fans
  if(!ST.fans){
    suggestions.push({id:'fans',name:`Auxiliary Circulation Fan${c2.fans>1?'s':''}`,
      desc:'Prevents heat buildup around the tank and ensures consistent air exchange. Relay-controlled for automated scheduling.',
      price:c2.fans*c2.fanPrice,tag:'Thermal Management'});
  }

  const sgEl=document.getElementById('addonSuggest');
  if(suggestions.length>0){
    sgEl.style.display='block';
    let sh=`<div class="addon-suggest"><h3><span>Recommended for Your ${sz} PBR</span></h3>
      <p style="font-size:10px;color:#92400e;margin-bottom:10px">Based on your configuration, our team recommends considering the following additions.</p>`;
    suggestions.forEach(sg=>{
      sh+=`<div class="addon-item${sg.pulse?' iot-pulse':''}"><div class="ai-info"><div class="ai-name">${sg.name}${sg.tag?'<span class="free-tag">'+sg.tag+'</span>':''}</div><div class="ai-desc">${sg.desc}</div></div><div class="ai-price">${F(sg.price)}</div><button class="ai-btn" onclick="addAddon('${sg.id}',this)">+ Add</button></div>`;
    });
    sh+=`</div>`;sgEl.innerHTML=sh;
  } else {sgEl.style.display='none';}

  rBOM();

  // Pricing summary
  const lines=[];
  lines.push({k:'Structure (Tank'+(ST.frame!=='none'?' + Frame':'')+')',v:tStruct()});
  if(ST.led!=='none')lines.push({k:'LED Grow Lighting',v:tLed()});
  if(tSen()>0)lines.push({k:'Water Quality Sensors',v:tSen()});
  if(ST.air!=='none')lines.push({k:'Air Quality Sensor',v:tAir()});
  if(ST.aeration||ST.fans){
    let aerVal=0;
    if(ST.aeration)aerVal+=cfg().pump.price+cfg().diffuser.price;
    if(ST.fans)aerVal+=cfg().fans*cfg().fanPrice;
    lines.push({k:'Aeration & Circulation',v:aerVal});
  }
  if(ST.heater){const hp=cfg().heater.reduce((a,h)=>a+h.price,0);lines.push({k:'Culture Heater',v:hp});}
  if(ST.wavemaker&&cfg().wavemaker)lines.push({k:'Wavemaker',v:cfg().wavemaker.price});
  if(ST.electrical)lines.push({k:'Electrical Panel & Accessories',v:ELEC_COMBINED});
  if(ST.hmi)lines.push({k:'HMI + PLC Control Unit',v:HMI});
  if(ST.iotDash){
    lines.push({k:ST.conn==='wifi'?'WiFi Connectivity':'WiFi + 4G LTE',v:ST.conn==='wifi'?4435:25960});
    lines.push({k:'Cloud IoT Dashboard',v:41300});
  }
  let ph='';lines.forEach(l=>ph+=`<div class="row"><span class="k">${l.k}</span><span class="v">${F(l.v)}</span></div>`);
  const st=sub();
  ph+=`<div class="row total"><span class="k">Total${ST.currency==='INR'?' (ex-GST)':' ('+ST.currency+')'}</span><span class="v">${F(st)}</span></div>`;
  if(ST.currency==='INR'){
    ph+=`<div class="row"><span class="k" style="font-size:10px;color:var(--ink4)">GST @18% applicable additionally</span><span class="v" style="font-size:10px;color:var(--ink4)"></span></div>`;
  } else {
    ph+=`<div class="row"><span class="k" style="font-size:10px;color:var(--ink4)">International quote — shipping, duties &amp; taxes as applicable at destination</span><span class="v" style="font-size:10px;color:var(--ink4)"></span></div>`;
  }
  document.getElementById('sPL').innerHTML=ph;
  document.getElementById('sGr').textContent=F(st);
}

/* ════════ COUNTRY / CURRENCY ════════ */
function onCountryChange(){
  const sel=document.getElementById('fCountry');
  if(!sel)return;
  ST.country=sel.value;
  ST.currency=(ST.country==='India')?'INR':'USD';
  // Re-render current step so all prices reflect new currency
  rCurrent();
  tick();
  // Update topbar GST note visibility
  const gstNote=document.getElementById('gstTopNote');
  if(gstNote)gstNote.style.display=(ST.currency==='INR')?'inline':'none';
  // Update static GST/ex-GST text on review & terms pages
  const isINR=ST.currency==='INR';
  const setTxt=(id,t)=>{const el=document.getElementById(id);if(el)el.textContent=t;};
  setTxt('bomSubtitle',isINR?'Prices in INR, ex-works. GST @18% additional.':'Prices in USD, ex-works. Duties & taxes extra at destination.');
  setTxt('sGrLbl',isINR?'Total (ex-GST)':'Total (USD)');
  setTxt('sGrSub',isINR?'GST @18% applicable additionally':'Shipping, duties & taxes extra');
  setTxt('termPrices',isINR?'All prices are indicative and ex-works Coimbatore, India.':'All prices are indicative in USD and ex-works Coimbatore, India.');
  setTxt('termTax',isINR?'GST @ 18% applicable as per Indian tax regulations.':'Shipping, import duties and destination taxes are additional, borne by the buyer.');
  setTxt('tkGrLbl',isINR?'Total (ex-GST)':'Total (USD)');
  setTxt('bomPriceHdr',isINR?'Price (INR)':'Price (USD)');
  setTxt('bomTotalHdr',isINR?'Total (INR)':'Total (USD)');
}
function rCurrent(){
  // Re-render whichever step is currently active
  if(cur===2)rStep2();
  if(cur===3)rStep3Dyn();
  if(cur===4){rStep5();syncHmiDeps();rFixedPrices();}
  if(cur===5){rSensors();rAirOpts();}
  if(cur===6)rStep6();
}

/* ════════ STEP 1 VALIDATION ════════ */
function validateStep1AndGo(){
  const v=id=>(document.getElementById(id).value||'').trim();
  const err=document.getElementById('step1Error');
  const missing=[];
  if(!v('fOrg'))missing.push('Organisation');
  if(!v('fName'))missing.push('Contact Person');
  const em=v('fEmail');
  if(!em)missing.push('Email');
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))missing.push('Email (valid format)');
  if(!v('fCountry'))missing.push('Country');
  if(!v('fLoc'))missing.push('Delivery Location');
  if(missing.length>0){
    err.style.display='block';
    err.innerHTML='<strong>Please complete the following:</strong> '+missing.join(', ');
    return;
  }
  err.style.display='none';
  // Ensure country state is synced before moving forward
  onCountryChange();
  go(2);
}

/* ════════ NAV ════════ */
let cur=1;
function go(n){
  cur=n;
  document.querySelectorAll('.vw').forEach((v,i)=>v.classList.toggle('on',i+1===n));
  document.querySelectorAll('.stepper .st').forEach((s,i)=>{s.classList.remove('on','done');if(i+1===n)s.classList.add('on');if(i+1<n)s.classList.add('done');});
  if(n===2)rStep2();
  if(n===3)rStep3Dyn();
  if(n===4){rStep5();syncHmiDeps();rFixedPrices();}
  if(n===5){syncSensorPage();rSensors();rAirOpts();}
  if(n===6)rStep6();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ════════ EXCEL — delegates to shared export-utils ════════ */
function exportXL(){
  rBOM();
  if(typeof exportQuoteXL==='function'){ exportQuoteXL(collectData()); return; }
  _exportXL_legacy();
}
function _exportXL_legacy(){
  rBOM();
  const wb=XLSX.utils.book_new(),v=id=>document.getElementById(id).value||'';
  const c1=[['CARBELIM PRIVATE LIMITED'],['Photobioreactor (PBR) Custom Design \u2014 Quotation'],['No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, Tamil Nadu 641020'],['mail@carbelim.io | +91 85903 25180'],[''],
    ['Organisation',v('fOrg')],['Contact',v('fName')],['Email',v('fEmail')],['Phone',v('fPhone')],['Country',v('fCountry')],['Currency',ST.currency],['Date',v('fDate')],['Reference',v('fRef')],['Delivery',v('fLoc')]];
  if(ST.size==='custom'&&(ST.customW||ST.customH||ST.customD)){
    c1.push(['Tank Dimensions',`${ST.customW||'?'} × ${ST.customH||'?'} × ${ST.customD||'?'} cm`]);
  }
  c1.push([''],['CONFIGURATION'],['Tank Size',sizeLabel()],['Tank Price ('+ST.currency+')',cvNum(tankPrice())],
    ['Frame',ST.frame==='none'?'No Frame':(ST.frame==='ss'?'SS304 Matte + HW Kit':'MS + HW Kit')],
    ['Frame Colour',ST.frame!=='none'?(v('fColor')||'N/A'):'N/A'],
    ['LED Type',ST.led==='none'?'No LED':(ST.led==='strip'?'LED Grow Strips':'High-Output LED Tubes')]);
  const nm={ph:'pH',turb:'Turbidity',tds:'TDS',temp:'Temperature',level:'Level',do:'DO'};
  for(const k in SENS){let l=nm[k],val=SENS[k].on?'Selected':'Not included';
    if(SENS[k].opts&&SENS[k].on)val=SENS[k].opts[SENS[k].v].name+' ('+SENS[k].opts[SENS[k].v].grade+')';
    c1.push([l+' Sensor',val]);}
  c1.push(['Air Sensors',ST.air==='none'?'Not selected':(ST.air==='A'?'Inlet Only':ST.air==='O'?'Outlet Only':'Inlet + Outlet')],
    ['Aeration',ST.aeration?'Yes':'No'],['Fans',ST.fans?'Yes':'No'],
    ['Culture Heater',ST.heater?'Yes \u2014 '+cfg().heater.map(h=>h.w+'W').join(' + '):'No'],
    ['Wavemaker',ST.wavemaker&&cfg().wavemaker?'Yes \u2014 '+cfg().wavemaker.lpm:'No'],
    ['Electrical Panel',ST.electrical?'Yes ('+F(ELEC_COMBINED)+')':'No'],
    ['HMI/PLC',ST.hmi?'Yes ('+F(HMI)+')':'No'],
    ['Connectivity',ST.iotDash?(ST.conn==='wifi'?'WiFi Only ('+F(4435)+')':'WiFi + 4G LTE ('+F(25960)+')'):'Not selected'],
    ['Cloud IoT Dashboard',ST.iotDash?'Yes ('+F(41300)+' + annual TBD)':'No'],
    [''],['TOTAL ('+ST.currency+(ST.currency==='INR'?', ex-GST':'')+')',cvNum(sub())],['Note',ST.currency==='INR'?'GST @18% applicable additionally':'International quote in USD. Shipping, duties & taxes as applicable at destination.'],[''],
    ['REMARKS',v('fRemarks')||'None'],[''],['Ex-works Coimbatore. Validity 30 days. Payment: 50% advance, 50% before dispatch.'],['Carbelim Private Limited | No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, TN 641020'],['mail@carbelim.io | +91 85903 25180']);
  const ws1=XLSX.utils.aoa_to_sheet(c1);ws1['!cols']=[{wch:26},{wch:50}];
  XLSX.utils.book_append_sheet(wb,ws1,'Configuration');

  const bd=[['CARBELIM \u2014 PBR Bill of Materials'],[''],['#','Component','Qty','Unit','Price','Total','Remarks']];
  document.getElementById('bomTb').querySelectorAll('tr').forEach(tr=>{const c=tr.querySelectorAll('td'),r=[];c.forEach(td=>r.push(td.textContent.trim()));if(r.length===1)bd.push([r[0]]);else if(r.length)bd.push(r);});
  const ws2=XLSX.utils.aoa_to_sheet(bd);ws2['!cols']=[{wch:4},{wch:44},{wch:4},{wch:7},{wch:14},{wch:14},{wch:36}];
  XLSX.utils.book_append_sheet(wb,ws2,'BOM & Pricing');

  XLSX.writeFile(wb,`Carbelim_PBR_Quotation_${v('fRef')||'CBL-PBR-001'}.xlsx`);
}

/* ════════ PDF EXPORT — delegates to shared export-utils ════════ */
function exportPDF(){
  rStep6();
  if(typeof exportQuotePDF==='function'){ exportQuotePDF(collectData()); return; }
  _exportPDF_legacy();
}
function _exportPDF_legacy(){
  rStep6();
  const v=id=>document.getElementById(id).value||'';
  const ref=v('fRef')||'CBL-PBR-001';

  const wrap=document.createElement('div');
  wrap.style.cssText='padding:20px;font-family:Inter,system-ui,sans-serif;font-size:11px;color:#111827;max-width:900px';

  let headerExtra='';
  if(ST.size==='custom'&&(ST.customW||ST.customH||ST.customD)){
    headerExtra=`<div><strong>Tank Dimensions:</strong> ${ST.customW||'?'} \u00d7 ${ST.customH||'?'} \u00d7 ${ST.customD||'?'} cm</div>`;
  }

  wrap.innerHTML=`
    <div style="text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #065f46">
      <img src="/img/logo.png" alt="Carbelim" style="height:40px;margin-bottom:6px" onerror="this.style.display='none'">
      <div style="font-size:16px;font-weight:800;color:#065f46;letter-spacing:1px">CARBELIM PRIVATE LIMITED</div>
      <div style="font-size:12px;color:#374151;margin-top:2px">Photobioreactor (PBR) Custom Design \u2014 Quotation</div>
      <div style="font-size:8px;color:#6b7280;margin-top:4px">No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, Tamil Nadu 641020</div>
      <div style="font-size:8px;color:#6b7280;margin-top:1px">mail@carbelim.io | +91 85903 25180</div>
      <div style="font-size:9px;color:#6b7280;margin-top:4px">Ex-works Coimbatore, India | Ref: ${ref} | ${v('fDate')||'\u2014'}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;font-size:10px;margin-bottom:14px">
      <div><strong>Organisation:</strong> ${v('fOrg')||'\u2014'}</div>
      <div><strong>Contact:</strong> ${v('fName')||'\u2014'}</div>
      <div><strong>Email:</strong> ${v('fEmail')||'\u2014'}</div>
      <div><strong>Phone:</strong> ${v('fPhone')||'\u2014'}</div>
      <div><strong>Country:</strong> ${v('fCountry')||'\u2014'}</div>
      <div><strong>Delivery:</strong> ${v('fLoc')||'\u2014'}</div>
      ${headerExtra}
    </div>
    <div style="margin-bottom:14px">${document.getElementById('sBdg').innerHTML}</div>
  `;

  const bomTable=document.querySelector('table.bom');
  if(bomTable){
    const bomClone=bomTable.cloneNode(true);
    bomClone.style.cssText='width:100%;border-collapse:collapse;font-size:9px;margin-bottom:14px';
    wrap.appendChild(bomClone);
  }

  const plClone=document.getElementById('sPL');
  if(plClone){
    const plDiv=document.createElement('div');
    plDiv.innerHTML=`<div style="margin-top:10px;padding:12px;border:1px solid #d1d5db;border-radius:8px">
      <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#065f46">Cost Breakdown</div>
      ${plClone.innerHTML}
    </div>
    <div style="text-align:center;margin-top:12px;padding:16px;background:#065f46;color:#fff;border-radius:8px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;opacity:.7">Total${ST.currency==='INR'?' (ex-GST)':' ('+ST.currency+')'}</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px">${F(sub())}</div>
      <div style="font-size:9px;opacity:.6;margin-top:2px">${ST.currency==='INR'?'GST @18% applicable additionally':'International quote — shipping, duties &amp; taxes as applicable at destination'}</div>
    </div>`;
    wrap.appendChild(plDiv);
  }

  const remarksVal=(document.getElementById('fRemarks').value||'').trim();
  if(remarksVal){
    const remDiv=document.createElement('div');
    remDiv.style.cssText='margin-top:12px;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:10px';
    remDiv.innerHTML=`<div style="font-size:11px;font-weight:700;color:#065f46;margin-bottom:4px">Comments / Remarks</div><div style="color:#374151;line-height:1.6;white-space:pre-wrap">${remarksVal}</div>`;
    wrap.appendChild(remDiv);
  }

  const foot=document.createElement('div');
  foot.style.cssText='margin-top:14px;font-size:8px;color:#6b7280;text-align:center;border-top:1px solid #d1d5db;padding-top:8px';
  foot.innerHTML=`All prices indicative, ex-works Coimbatore. ${ST.currency==='INR'?'GST @18% applicable.':'International quote in USD, duties & taxes extra at destination.'} Validity 30 days. Payment: 50% advance, 50% before dispatch.<br>Carbelim Private Limited | No 52, Prime Industrial Estate, Periyanaickenpalayam, Coimbatore, TN 641020 | mail@carbelim.io | +91 85903 25180`;
  wrap.appendChild(foot);

  document.body.appendChild(wrap);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
  doc.html(wrap, {
    callback: function(doc) {
      document.body.removeChild(wrap);
      doc.save(`Carbelim_PBR_Quotation_${ref}.pdf`);
    },
    x: 8,
    y: 8,
    width: 194,
    windowWidth: 900,
    margin: [8, 8, 8, 8],
    autoPaging: 'text',
    html2canvas: { scale: 0.215, useCORS: true }
  });
}

/* ════════ SUBMIT TO SERVER ════════ */
function collectData(){
  const v=id=>document.getElementById(id).value||'';
  const c=cfg();
  const nm={ph:'pH',turb:'Turbidity',tds:'TDS',temp:'Temperature',level:'Level',do:'DO'};
  const sensors={};
  for(const k in SENS){
    const s=SENS[k];
    if(s.on){sensors[k]={selected:true,variant:s.opts?s.opts[s.v].name:'Standard',price:senP(k)};}
    else{sensors[k]={selected:false,variant:'',price:0};}
  }
  const result={
    timestamp:new Date().toISOString(),
    client:{
      organisation:v('fOrg'),contact:v('fName'),
      email:v('fEmail'),phone:v('fPhone'),
      country:v('fCountry')||ST.country,currency:ST.currency,
      date:v('fDate'),reference:v('fRef'),delivery:v('fLoc')
    },
    config:{
      tank:sizeLabel(),tank_price:tankPrice(),
      custom_dimensions:ST.size==='custom'?{volume:ST.customVol,width:ST.customW,height:ST.customH,depth:ST.customD}:null,
      frame:ST.frame==='none'?'No Frame':(ST.frame==='ss'?'SS304 Matte + HW Kit':'MS + HW Kit'),
      frame_price:ST.frame==='none'?0:(ST.frame==='ss'?c.frameSS:c.frameMS),
      color:ST.frame!=='none'?(v('fColor')||'Not specified'):'N/A',
      led:ST.led==='none'?'No LED':(ST.led==='strip'?'LED Grow Strips':'High-Output LED Tubes'),
      led_price:tLed(),
      sensors:sensors,
      sensors_total:tSen(),
      air_sensor:ST.air==='none'?'Not selected':(ST.air==='A'?'Inlet Only':ST.air==='O'?'Outlet Only':'Inlet + Outlet'),
      air_price:tAir(),
      aeration:ST.aeration?'Yes':'No',
      fans:ST.fans?'Yes':'No',
      heater:ST.heater?c.heater.map(h=>h.w+'W').join(' + '):'Not selected',
      heater_price:ST.heater?c.heater.reduce((a,h)=>a+h.price,0):0,
      wavemaker:(ST.wavemaker&&c.wavemaker)?c.wavemaker.lpm:'Not selected',
      wavemaker_price:(ST.wavemaker&&c.wavemaker)?c.wavemaker.price:0,
      electrical_panel:ST.electrical?'Yes':'No',
      electrical_price:ST.electrical?ELEC_COMBINED:0,
      hmi:ST.hmi?'Yes':'No',
      hmi_price:ST.hmi?HMI:0,
      connectivity:ST.iotDash?(ST.conn==='wifi'?'WiFi Only':'WiFi + 4G LTE'):'Not selected',
      connectivity_price:ST.iotDash?(ST.conn==='wifi'?4435:25960):0,
      iot_dashboard:ST.iotDash?'Yes':'No',
      iot_dashboard_price:ST.iotDash?41300:0,
      iot_suite:ST.iotDash?((ST.conn==='wifi'?'WiFi Only':'WiFi + 4G LTE')+' + Cloud IoT Dashboard'):'Not selected',
    },
    remarks:v('fRemarks'),
    pricing:{
      total_ex_gst_inr:sub(),
      grand_total_inr:sub(),
      display_currency:ST.currency,
      display_total:cvNum(sub()),
      usd_rate:USD_RATE,
      usd_multiplier:USD_MULT
    }
  };
  return result;
}

function submitQuote(){
  const v=id=>(document.getElementById(id).value||'').trim();
  if(!v('fOrg')||!v('fName')||!v('fEmail')||!v('fCountry')||!v('fLoc')){
    alert('Please complete all required client details in Step 1 before submitting.');go(1);return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('fEmail'))){
    alert('Please enter a valid email address in Step 1.');go(1);return;
  }
  const btn=document.getElementById('btnSubmit');
  const status=document.getElementById('submitStatus');
  btn.disabled=true;btn.textContent='Submitting...';btn.style.opacity='.6';
  status.style.display='none';

  const data=collectData();

  fetch('/api/submit',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(res=>res.json()).then(result=>{
    if(result.status==='ok'){
      status.style.display='block';status.style.color='var(--g)';
      let msg='<strong>Submitted successfully!</strong> Our team will review your configuration and get in touch.';
      if(result.reference){msg+='<br><span style="font-size:11px;color:var(--ink3)">Reference: <strong>'+result.reference+'</strong></span>';}
      if(result.portal_url){
        msg+='<div style="margin-top:12px;padding:12px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;text-align:left"><div style="font-size:11px;color:#065f46;font-weight:600;margin-bottom:6px">Track your request anytime:</div><a href="'+result.portal_url+'" target="_blank" style="font-size:11px;color:#065f46;word-break:break-all">'+result.portal_url+'</a><div style="font-size:10px;color:#065f46;opacity:.75;margin-top:6px">A copy of this link has been emailed to you.</div></div>';
      }
      status.innerHTML=msg;
      btn.textContent='Submitted \u2713';
      const dl=document.getElementById('downloadSection');
      if(dl)dl.style.display='block';
    } else {throw new Error(result.error||'Unknown error');}
  }).catch(err=>{
    status.style.display='block';status.style.color='#dc2626';
    status.innerHTML='<strong>Submission failed.</strong> Please try again or email us at <a href="mailto:mail@carbelim.io">mail@carbelim.io</a>';
    btn.disabled=false;btn.textContent='Retry Submit';btn.style.opacity='1';
  });
}

/* ════════ FIXED PRICE LABELS ════════ */
function rFixedPrices(){
  const el=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=F(v);};
  el('iotDashPr',41300);el('connWifiPr',4435);el('conn4gPr',25960);
}

/* ════════ INIT ════════ */
function genRef(){
  const d=new Date();
  const dd=String(d.getDate()).padStart(2,'0');
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const yy=String(d.getFullYear()).slice(-2);
  const sn=String(Math.floor(Math.random()*900)+100);
  return 'CBL-PBR-'+dd+mm+yy+'-'+sn;
}
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('fDate').valueAsDate=new Date();
  document.getElementById('fRef').value=genRef();
  document.getElementById('fColor').value='RAL 7035 - Light Grey';
  renderSwatches();
  rStep2();rSensors();rAirOpts();rFixedPrices();rStep5();syncIoTUI();tick();
});
