import { useState, useRef, useCallback } from "react";

const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const T = {
  ru: {
    by: "by Calathea Bibigoniya",
    nav: { diary:"Растения", plan:"План", finder:"Подбор", analysis:"Фото" },
    diary_title: "Мои растения",
    diary_empty: "Пока нет растений. Добавьте первое!",
    diary_add: "Добавить",
    diary_edit: "Изменить",
    diary_save: "Сохранить",
    diary_cancel: "Отмена",
    diary_delete: "Удалить растение",
    diary_name_label: "Название",
    diary_name_ph: "Монстера, Фикус, Антуриум…",
    diary_location_label: "Место в квартире",
    diary_location_ph: "Восточное окно, кухня…",
    diary_notes_label: "Заметки",
    diary_notes_ph: "Особенности, проблемы, история…",
    diary_watered_label: "Последний полив",
    diary_repotted_label: "Последняя пересадка",
    diary_water_days: "Поливать каждые (дней)",
    diary_repot_months: "Пересаживать каждые (мес.)",
    diary_days_ago: "дн. назад",
    diary_months_ago: "мес. назад",
    diary_never: "не указано",
    diary_water_now: "✓ Полито",
    diary_needs_water: "💧 Пора полить",
    diary_needs_repot: "🪴 Пора пересадить",
    plan_title: "План ухода на неделю",
    plan_plants_label: "Растения из дневника",
    plan_city_label: "Ваш город",
    plan_city_ph: "Москва, Алматы, Минск…",
    plan_no_plants: "Сначала добавьте растения в дневник",
    plan_no_city_hint: "Укажите город — получите рекомендации по освещению",
    plan_btn: "Составить план",
    plan_loading: "Составляю план…",
    plan_result: "План на эту неделю",
    finder_title: "Подбор растения",
    finder_sub: "Ответьте на 4 вопроса — подберём идеальное растение для ваших условий",
    finder_light: "Освещение",
    finder_light_opts: ["Много света — южное окно", "Среднее — восток или запад", "Мало света — север или вглубь"],
    finder_humidity: "Влажность воздуха",
    finder_humidity_opts: ["Сухой воздух (батареи зимой)", "Средняя влажность", "Высокая (есть увлажнитель)"],
    finder_pets: "Есть животные или дети?",
    finder_pets_opts: ["Нет", "Есть кошка или собака", "Есть маленькие дети"],
    finder_want: "Что хотите?",
    finder_want_opts: ["Цветущее растение", "Крупное и эффектное", "Неприхотливое", "Редкое / коллекционное"],
    finder_btn: "Подобрать растения",
    finder_loading: "Подбираю…",
    finder_result: "Рекомендации",
    analysis_title: "Анализ по фото",
    analysis_warning: "Определение приблизительное — для точной идентификации обратитесь к специалисту",
    upload_hint: "Нажмите или перетащите фото растения",
    upload_sub: "JPG, PNG или WEBP",
    change_photo: "изменить фото",
    mode_label: "Режим анализа",
    modes: [
      { v:"identify", icon:"◎", label:"Определить", desc:"Название и описание" },
      { v:"health",   icon:"◈", label:"Состояние",  desc:"Диагноз + уход" },
      { v:"both",     icon:"◉", label:"Полный",     desc:"Всё сразу" },
    ],
    city_label: "Ваш город (для рекомендаций по свету)",
    city_ph: "Москва, Казань, Новосибирск…",
    analysis_btn: "Анализировать",
    analysis_loading: "Анализирую…",
    analyses_left: "анализов осталось",
    result_label: "Результат анализа",
    paywall_title: "Бесплатные анализы закончились",
    paywall_sub: "Выберите план для продолжения",
    plans: [
      { name:"Бесплатно", price:"0 ₽",      feats:["5 анализов в месяц","Дневник растений","План ухода","Подбор растений"], btn:"Текущий план", disabled:true },
      { name:"Pro",       price:"390 ₽/мес", feats:["Безлимитные анализы","Облачное хранение","Напоминания о поливе","PDF-карточки"], btn:"Подключить Pro", highlight:true },
      { name:"Пакет",     price:"190 ₽",     feats:["50 анализов","Без подписки","Не сгорают"], btn:"Купить пакет" },
    ],
    payment_note: "Оплата будет доступна при запуске. Пока — тестируйте бесплатно!",
    close: "Закрыть",
    footer: "Анализ выполняется с помощью ИИ · Данные хранятся на вашем устройстве · © 2025 Botaniq",
    err: "Ошибка: ",
    prompt_plan: (plants, city) => `Ты эксперт по комнатным растениям. Составь конкретный план ухода на текущую неделю.

Растения:
${plants.map(p=>`- ${p.name}${p.location?` (${p.location})`:""}`).join("\n")}

Город: ${city||"Россия, центр"}
Месяц: ${new Date().toLocaleString("ru",{month:"long"})}

Составь план по дням (Пн–Вс). Для каждого растения — конкретные действия с учётом сезона и климата. Полив, подкормка, осмотр, досветка. Будь конкретным и кратким.`,
    prompt_finder: (l,h,p,w) => `Ты эксперт по комнатным растениям. Подбери 4-5 растений:
Освещение: ${l}
Влажность: ${h}
Животные/дети: ${p}
Пожелание: ${w}

Для каждого: название (рус + лат), почему подходит, сложность ухода 1-5, главный совет.`,
    prompt_identify: "Определи комнатное растение на фото: название русское и латинское, описание вида. Только идентификация.",
    prompt_health: (c)=>`Оцени комнатное растение на фото:
🩺 СОСТОЯНИЕ: видимые проблемы и причины
💊 ВОССТАНОВЛЕНИЕ: конкретные шаги
🪴 УХОД: состав грунта с пропорциями, полив, влажность
💡 ОСВЕЩЕНИЕ (город: ${c||"Россия"}): лучшее место, нужна ли досветка`,
    prompt_both: (c)=>`Полный анализ растения на фото:
🌿 ИДЕНТИФИКАЦИЯ: название (рус + лат), описание
🩺 СОСТОЯНИЕ: видимые проблемы
💊 ВОССТАНОВЛЕНИЕ: конкретные шаги
🪴 УХОД: грунт с пропорциями, полив, влажность
💡 ОСВЕЩЕНИЕ (город: ${c||"Россия"}): лучшее место, досветка`,
  },
  en: {
    by: "by Calathea Bibigoniya",
    nav: { diary:"Plants", plan:"Plan", finder:"Finder", analysis:"Photo" },
    diary_title: "My Plants",
    diary_empty: "No plants yet. Add your first one!",
    diary_add: "Add plant",
    diary_edit: "Edit",
    diary_save: "Save",
    diary_cancel: "Cancel",
    diary_delete: "Delete plant",
    diary_name_label: "Plant name",
    diary_name_ph: "Monstera, Ficus, Anthurium…",
    diary_location_label: "Location in home",
    diary_location_ph: "East window, kitchen…",
    diary_notes_label: "Notes",
    diary_notes_ph: "Details, issues, history…",
    diary_watered_label: "Last watered",
    diary_repotted_label: "Last repotted",
    diary_water_days: "Water every (days)",
    diary_repot_months: "Repot every (months)",
    diary_days_ago: "d ago",
    diary_months_ago: "mo ago",
    diary_never: "not set",
    diary_water_now: "✓ Watered",
    diary_needs_water: "💧 Water now",
    diary_needs_repot: "🪴 Repot soon",
    plan_title: "Weekly Care Plan",
    plan_plants_label: "Plants from diary",
    plan_city_label: "Your city",
    plan_city_ph: "London, Auckland, Berlin…",
    plan_no_plants: "Add plants to your diary first",
    plan_no_city_hint: "Add your city for lighting recommendations",
    plan_btn: "Generate plan",
    plan_loading: "Generating…",
    plan_result: "This week's plan",
    finder_title: "Find a Plant",
    finder_sub: "Answer 4 questions — we'll find your perfect match",
    finder_light: "Light",
    finder_light_opts: ["Bright — south window", "Medium — east or west", "Low light — north or far from window"],
    finder_humidity: "Humidity",
    finder_humidity_opts: ["Dry air (heating)", "Average", "High (humidifier)"],
    finder_pets: "Pets or children?",
    finder_pets_opts: ["None", "Cat or dog", "Small children"],
    finder_want: "What do you want?",
    finder_want_opts: ["Flowering plant", "Large & impressive", "Low maintenance", "Rare / collector's"],
    finder_btn: "Find plants",
    finder_loading: "Finding…",
    finder_result: "Recommendations",
    analysis_title: "Photo Analysis",
    analysis_warning: "Approximate identification — consult a specialist for certainty",
    upload_hint: "Click or drag a plant photo here",
    upload_sub: "JPG, PNG or WEBP",
    change_photo: "change photo",
    mode_label: "Analysis mode",
    modes: [
      { v:"identify", icon:"◎", label:"Identify", desc:"Name & description" },
      { v:"health",   icon:"◈", label:"Health",   desc:"Diagnosis + care" },
      { v:"both",     icon:"◉", label:"Full",     desc:"Everything" },
    ],
    city_label: "Your city (for lighting tips)",
    city_ph: "London, Auckland, Berlin…",
    analysis_btn: "Analyse",
    analysis_loading: "Analysing…",
    analyses_left: "analyses left",
    result_label: "Analysis result",
    paywall_title: "Free analyses used up",
    paywall_sub: "Choose a plan to continue",
    plans: [
      { name:"Free",  price:"$0",    feats:["5 analyses/month","Plant diary","Care plan","Plant finder"], btn:"Current plan", disabled:true },
      { name:"Pro",   price:"$5/mo", feats:["Unlimited analyses","Cloud storage","Watering reminders","PDF care cards"], btn:"Get Pro", highlight:true },
      { name:"Pack",  price:"$2",    feats:["50 analyses","One-time","Never expire"], btn:"Buy pack" },
    ],
    payment_note: "Payments coming at launch. For now — test for free!",
    close: "Close",
    footer: "AI-powered analysis · Data stored on your device · © 2025 Botaniq",
    err: "Error: ",
    prompt_plan: (plants, city) => `You are a houseplant expert. Create a specific weekly care plan.
Plants: ${plants.map(p=>`${p.name}${p.location?` (${p.location})`:""}`).join(", ")}
City: ${city||"temperate climate"}, Month: ${new Date().toLocaleString("en",{month:"long"})}
Day-by-day plan Mon–Sun. Concrete actions per plant: watering, feeding, inspection, grow lights. Be specific and concise.`,
    prompt_finder: (l,h,p,w) => `Houseplant expert. Recommend 4-5 plants:
Light: ${l}, Humidity: ${h}, Pets/children: ${p}, Want: ${w}
For each: name (common+Latin), why it fits, care difficulty 1-5, top tip.`,
    prompt_identify: "Identify the houseplant in this photo: common and Latin name, species description. Identification only.",
    prompt_health: (c)=>`Assess the houseplant in this photo:
🩺 CONDITION: visible problems and causes
💊 RECOVERY: specific steps
🪴 CARE: soil mix with proportions, watering, humidity
💡 LIGHTING (city: ${c||"temperate"}): best spot, grow lights needed?`,
    prompt_both: (c)=>`Full plant analysis:
🌿 ID: name (common+Latin), description
🩺 CONDITION: visible problems
💊 RECOVERY: steps if needed
🪴 CARE: soil proportions, watering, humidity
💡 LIGHTING (city: ${c||"temperate"}): best spot, grow lights?`,
  },
};

const FREE_LIMIT = 5;
const PLANTS_KEY  = "botaniq_plants_v1";
const CITY_KEY    = "botaniq_city_v1";
const USED_KEY    = "botaniq_used_v1";

function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function daysSince(d)   { if(!d) return null; return Math.floor((Date.now()-new Date(d))/86400000); }
function monthsSince(d) { if(!d) return null; return Math.floor((Date.now()-new Date(d))/(86400000*30)); }

async function askClaude(prompt, b64, mime) {
  const content = b64
    ? [{type:"image",source:{type:"base64",media_type:mime,data:b64}},{type:"text",text:prompt}]
    : [{type:"text",text:prompt}];
  const r = await fetch("/.netlify/functions/claude",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content}]})
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  return d.content?.find(b=>b.type==="text")?.text||"—";
}

function Logo({size=32}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#2d5a27"/>
      <path d="M20 32C20 32 11 25 11 17.5C11 13.358 14.358 10 18.5 10C19.01 10 19.51 10.05 20 10.145C20.49 10.05 20.99 10 21.5 10C25.642 10 29 13.358 29 17.5C29 25 20 32 20 32Z" fill="#f5f0e8"/>
      <path d="M20 32V16" stroke="#2d5a27" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 22C20 22 15 19 15 15" stroke="#2d5a27" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M20 19C20 19 24 17 25 14" stroke="#2d5a27" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function ResultBox({title,text}){
  return(
    <div style={{marginTop:20,background:"#f7f3ec",border:"1px solid #ede8e0",borderRadius:14,overflow:"hidden"}}>
      <div style={{padding:"9px 16px",borderBottom:"1px solid #ede8e0",background:"#f0ebe0",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#2d5a27"}}/>
        <span style={{fontSize:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:2,color:"#6b6358",textTransform:"uppercase"}}>{title}</span>
      </div>
      <div style={{padding:"16px 16px 18px",whiteSpace:"pre-wrap",lineHeight:1.85,fontSize:14,color:"#1a1a18",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>{text}</div>
    </div>
  );
}

function Label({children}){
  return <div style={{fontSize:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:2.5,color:"#9a8f82",textTransform:"uppercase",marginBottom:8}}>{children}</div>;
}

function Btn({onClick,disabled,loading,loadingText,children,style:{}}){
  const on=!disabled&&!loading;
  return(
    <button onClick={onClick} disabled={disabled||loading} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:on?"#2d5a27":"#e8e2d9",color:on?"#fff":"#9a8f82",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:on?"pointer":"not-allowed",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:on?"0 4px 14px rgba(45,90,39,0.18)":"none"}}>
      {loading?(<><svg width="15" height="15" viewBox="0 0 15 15" style={{animation:"spin 1s linear infinite"}}><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="28" strokeDashoffset="7"/></svg>{loadingText}</>):children}
    </button>
  );
}

function CityInput({value,onChange,label,ph}){
  return(
    <div style={{marginBottom:16}}>
      <Label>{label}</Label>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={ph}
        style={{width:"100%",background:"#faf8f4",border:"1.5px solid #ede8e0",borderRadius:10,padding:"11px 13px",color:"#1a1a18",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>
    </div>
  );
}

// ── DIARY ────────────────────────────────────────────────────────────────────
function DiaryTab({t,plants,setPlants}){
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const F=(f,type="text")=>({
    type, value:form[f]??"",
    onChange:e=>setForm(p=>({...p,[f]:type==="number"?Number(e.target.value):e.target.value})),
    style:{width:"100%",background:"#faf8f4",border:"1.5px solid #ede8e0",borderRadius:10,padding:"11px 13px",color:"#1a1a18",fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:14}
  });
  const save=()=>{
    if(!form.name?.trim()) return;
    const updated = editing==="new"
      ? [...plants,{...form,id:uid()}]
      : plants.map(p=>p.id===editing?{...form,id:editing}:p);
    setPlants(updated); LS.set(PLANTS_KEY,updated); setEditing(null);
  };
  const del=(id)=>{ const u=plants.filter(p=>p.id!==id); setPlants(u); LS.set(PLANTS_KEY,u); setEditing(null); };
  const waterNow=(id)=>{ const u=plants.map(p=>p.id===id?{...p,wateredAt:new Date().toISOString().slice(0,10)}:p); setPlants(u); LS.set(PLANTS_KEY,u); };

  if(editing!==null){
    return(
      <div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,marginBottom:20}}>{editing==="new"?t.diary_add:t.diary_edit}</h2>
        <Label>{t.diary_name_label}</Label>
        <input {...F("name")} placeholder={t.diary_name_ph}/>
        <Label>{t.diary_location_label}</Label>
        <input {...F("location")} placeholder={t.diary_location_ph}/>
        <Label>{t.diary_notes_label}</Label>
        <textarea {...F("notes")} placeholder={t.diary_notes_ph} style={{...F("notes").style,minHeight:80,resize:"vertical"}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><Label>{t.diary_watered_label}</Label><input {...F("wateredAt","date")}/></div>
          <div><Label>{t.diary_repotted_label}</Label><input {...F("repottedAt","date")}/></div>
          <div><Label>{t.diary_water_days}</Label><input {...F("waterDays","number")} min={1} max={60}/></div>
          <div><Label>{t.diary_repot_months}</Label><input {...F("repotMonths","number")} min={1} max={36}/></div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <Btn onClick={save} disabled={!form.name?.trim()}>{t.diary_save}</Btn>
          <button onClick={()=>setEditing(null)} style={{flex:"0 0 auto",padding:"14px 20px",borderRadius:12,border:"1.5px solid #ede8e0",background:"#faf8f4",color:"#6b6358",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>{t.diary_cancel}</button>
        </div>
        {editing!=="new"&&<button onClick={()=>del(editing)} style={{width:"100%",marginTop:10,padding:"12px",borderRadius:12,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#b91c1c",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>{t.diary_delete}</button>}
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700}}>{t.diary_title}</h2>
        <button onClick={()=>{setForm({name:"",location:"",notes:"",wateredAt:"",repottedAt:"",waterDays:7,repotMonths:12});setEditing("new");}} style={{padding:"8px 14px",borderRadius:10,border:"1.5px solid #2d5a27",background:"#f0f4ef",color:"#2d5a27",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>+ {t.diary_add}</button>
      </div>
      {plants.length===0?(
        <div style={{textAlign:"center",padding:"52px 20px",color:"#9a8f82",fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{fontSize:44,marginBottom:12}}>🪴</div>
          <div style={{fontSize:14,marginBottom:18}}>{t.diary_empty}</div>
          <button onClick={()=>{setForm({name:"",location:"",notes:"",wateredAt:"",repottedAt:"",waterDays:7,repotMonths:12});setEditing("new");}} style={{padding:"10px 22px",borderRadius:10,border:"none",background:"#2d5a27",color:"#fff",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>+ {t.diary_add}</button>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {plants.map(p=>{
            const dW=daysSince(p.wateredAt), mR=monthsSince(p.repottedAt);
            const nW=dW!==null&&dW>=(p.waterDays||7), nR=mR!==null&&mR>=(p.repotMonths||12);
            return(
              <div key={p.id} style={{background:"#fff",border:`1.5px solid ${nW||nR?"#fde68a":"#ede8e0"}`,borderRadius:14,padding:"16px 16px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:700,lineHeight:1.2}}>{p.name}</div>
                    {p.location&&<div style={{fontSize:12,color:"#9a8f82",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>{p.location}</div>}
                  </div>
                  <button onClick={()=>{setForm({...p});setEditing(p.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#9a8f82",fontFamily:"'DM Sans',sans-serif",padding:"2px 4px"}}>{t.diary_edit}</button>
                </div>
                {p.notes&&<div style={{fontSize:12,color:"#6b6358",fontFamily:"'DM Sans',sans-serif",marginBottom:10,lineHeight:1.5}}>{p.notes}</div>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#9a8f82",fontFamily:"'DM Sans',sans-serif"}}>💧 {p.wateredAt?`${dW} ${t.diary_days_ago}`:t.diary_never}</span>
                  <span style={{fontSize:11,color:"#9a8f82",fontFamily:"'DM Sans',sans-serif"}}>🪴 {p.repottedAt?`${mR} ${t.diary_months_ago}`:t.diary_never}</span>
                  {nW&&<span style={{fontSize:10,background:"#fef9c3",color:"#854d0e",borderRadius:6,padding:"2px 8px",fontFamily:"'DM Sans',sans-serif"}}>{t.diary_needs_water}</span>}
                  {nR&&<span style={{fontSize:10,background:"#fce7f3",color:"#9d174d",borderRadius:6,padding:"2px 8px",fontFamily:"'DM Sans',sans-serif"}}>{t.diary_needs_repot}</span>}
                  <button onClick={()=>waterNow(p.id)} style={{marginLeft:"auto",fontSize:11,padding:"3px 10px",borderRadius:8,border:"1px solid #c5d9c2",background:"#f0f4ef",color:"#2d5a27",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>{t.diary_water_now}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── PLAN ─────────────────────────────────────────────────────────────────────
function PlanTab({t,plants,city,setCity}){
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const generate=async()=>{
    setLoading(true); setError(null); setResult(null);
    try{ const text=await askClaude(t.prompt_plan(plants,city)); setResult(text); }
    catch(e){ setError(t.err+e.message); } finally{ setLoading(false); }
  };
  return(
    <div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,marginBottom:16}}>{t.plan_title}</h2>
      {plants.length>0&&(
        <div style={{marginBottom:16,padding:"10px 14px",background:"#f0f4ef",border:"1px solid #c5d9c2",borderRadius:10}}>
          <div style={{fontSize:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:2,color:"#6b6358",textTransform:"uppercase",marginBottom:6}}>{t.plan_plants_label}</div>
          <div style={{fontSize:13,color:"#1a1a18",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{plants.map(p=>p.name).join(" · ")}</div>
        </div>
      )}
      <CityInput value={city} onChange={v=>{setCity(v);LS.set(CITY_KEY,v);}} label={t.plan_city_label} ph={t.plan_city_ph}/>
      {!city&&<div style={{fontSize:12,color:"#b59a4a",fontFamily:"'DM Sans',sans-serif",marginBottom:14,background:"#fefce8",padding:"8px 12px",borderRadius:8,border:"1px solid #fde68a"}}>📍 {t.plan_no_city_hint}</div>}
      <Btn onClick={generate} disabled={plants.length===0} loading={loading} loadingText={t.plan_loading}>{plants.length===0?t.plan_no_plants:t.plan_btn}</Btn>
      {error&&<div style={{marginTop:12,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"12px",color:"#b91c1c",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{error}</div>}
      {result&&<ResultBox title={t.plan_result} text={result}/>}
    </div>
  );
}

// ── FINDER ───────────────────────────────────────────────────────────────────
function FinderTab({t}){
  const [sel,setSel]=useState({light:0,humidity:0,pets:0,want:0});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const find=async()=>{
    setLoading(true); setError(null); setResult(null);
    try{ const text=await askClaude(t.prompt_finder(t.finder_light_opts[sel.light],t.finder_humidity_opts[sel.humidity],t.finder_pets_opts[sel.pets],t.finder_want_opts[sel.want])); setResult(text); }
    catch(e){ setError(t.err+e.message); } finally{ setLoading(false); }
  };
  const Group=({label,opts,field})=>(
    <div style={{marginBottom:16}}>
      <Label>{label}</Label>
      {opts.map((o,i)=>(
        <button key={i} onClick={()=>setSel(s=>({...s,[field]:i}))} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${sel[field]===i?"#2d5a27":"#ede8e0"}`,background:sel[field]===i?"#f0f4ef":"#faf8f4",color:sel[field]===i?"#2d5a27":"#1a1a18",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",marginBottom:6,transition:"all .15s"}}>
          {o}
        </button>
      ))}
    </div>
  );
  return(
    <div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,marginBottom:6}}>{t.finder_title}</h2>
      <p style={{fontSize:13,color:"#9a8f82",fontFamily:"'DM Sans',sans-serif",marginBottom:20,lineHeight:1.5}}>{t.finder_sub}</p>
      <Group label={t.finder_light} opts={t.finder_light_opts} field="light"/>
      <Group label={t.finder_humidity} opts={t.finder_humidity_opts} field="humidity"/>
      <Group label={t.finder_pets} opts={t.finder_pets_opts} field="pets"/>
      <Group label={t.finder_want} opts={t.finder_want_opts} field="want"/>
      <Btn onClick={find} loading={loading} loadingText={t.finder_loading}>{t.finder_btn}</Btn>
      {error&&<div style={{marginTop:12,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"12px",color:"#b91c1c",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{error}</div>}
      {result&&<ResultBox title={t.finder_result} text={result}/>}
    </div>
  );
}

// ── ANALYSIS ─────────────────────────────────────────────────────────────────
function AnalysisTab({t,city,setCity,used,setUsed,onLimit}){
  const [image,setImage]=useState(null);
  const [b64,setB64]=useState(null);
  const [mime,setMime]=useState("image/jpeg");
  const [mode,setMode]=useState("both");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [drag,setDrag]=useState(false);
  const ref=useRef();
  const remaining=Math.max(0,FREE_LIMIT-used);
  const handleFile=useCallback(f=>{
    if(!f||!f.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(f)); setMime(f.type||"image/jpeg"); setResult(null); setError(null);
    const r=new FileReader(); r.onload=e=>setB64(e.target.result.split(",")[1]); r.readAsDataURL(f);
  },[]);
  const onDrop=useCallback(e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);},[handleFile]);
  const buildPrompt=()=>mode==="identify"?t.prompt_identify:mode==="health"?t.prompt_health(city):t.prompt_both(city);
  const analyze=async()=>{
    if(!b64) return;
    if(remaining<=0){onLimit();return;}
    setLoading(true); setError(null); setResult(null);
    try{
      const text=await askClaude(buildPrompt(),b64,mime); setResult(text);
      LS.set(USED_KEY,used+1); setUsed(used+1);
    }catch(e){setError(t.err+e.message);}finally{setLoading(false);}
  };
  return(
    <div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,marginBottom:8}}>{t.analysis_title}</h2>
      <div style={{fontSize:12,color:"#b59a4a",fontFamily:"'DM Sans',sans-serif",marginBottom:16,background:"#fefce8",padding:"8px 12px",borderRadius:8,border:"1px solid #fde68a",lineHeight:1.5}}>⚠️ {t.analysis_warning}</div>
      <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onClick={()=>ref.current.click()}
        style={{border:`1.5px dashed ${drag?"#2d5a27":image?"#c5d9c2":"#d8d2c8"}`,borderRadius:14,minHeight:image?0:148,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all .2s",background:drag?"#f2f6f1":"#faf8f4",overflow:"hidden",position:"relative",marginBottom:16}}>
        {image?(<><img src={image} alt="" style={{width:"100%",maxHeight:260,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",bottom:10,right:10,background:"rgba(255,255,255,0.93)",border:"1px solid #ede8e0",borderRadius:8,padding:"4px 12px",fontSize:11,color:"#6b6358",fontFamily:"'DM Sans',sans-serif"}}>{t.change_photo}</div></>)
        :(<div style={{textAlign:"center",padding:24,opacity:.5}}><div style={{fontSize:34,marginBottom:8}}>🪴</div><div style={{fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>{t.upload_hint}</div><div style={{fontSize:11,marginTop:3,color:"#8a7f72",fontFamily:"'DM Sans',sans-serif"}}>{t.upload_sub}</div></div>)}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      <Label>{t.mode_label}</Label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {t.modes.map(m=>(
          <button key={m.v} onClick={()=>setMode(m.v)} style={{background:mode===m.v?"#f0f4ef":"#faf8f4",border:`1.5px solid ${mode===m.v?"#2d5a27":"#ede8e0"}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
            <span style={{fontSize:15,marginBottom:4,display:"block"}}>{m.icon}</span>
            <div style={{fontSize:11,color:mode===m.v?"#2d5a27":"#1a1a18",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{m.label}</div>
            <div style={{fontSize:10,color:"#9a8f82",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>{m.desc}</div>
          </button>
        ))}
      </div>
      {(mode==="health"||mode==="both")&&<CityInput value={city} onChange={v=>{setCity(v);LS.set(CITY_KEY,v);}} label={t.city_label} ph={t.city_ph}/>}
      <Btn onClick={analyze} disabled={!b64} loading={loading} loadingText={t.analysis_loading}>{t.analysis_btn} · {remaining} {t.analyses_left}</Btn>
      {error&&<div style={{marginTop:12,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"12px",color:"#b91c1c",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{error}</div>}
      {result&&<ResultBox title={t.result_label} text={result}/>}
    </div>
  );
}

// ── PAYWALL ──────────────────────────────────────────────────────────────────
function Paywall({t,onClose}){
  const [note,setNote]=useState(false);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,24,0.5)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#fff",border:"1px solid #ede8e0",borderRadius:24,padding:"30px 22px",maxWidth:500,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.14)"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",fontSize:26,marginBottom:8}}>🌿</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,textAlign:"center",marginBottom:6}}>{t.paywall_title}</h2>
        <p style={{fontSize:13,color:"#6b6358",textAlign:"center",fontFamily:"'DM Sans',sans-serif",marginBottom:22,lineHeight:1.6}}>{t.paywall_sub}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {t.plans.map((p,i)=>(
            <div key={i} style={{background:p.highlight?"#f0f4ef":"#faf8f4",border:`1.5px solid ${p.highlight?"#2d5a27":"#ede8e0"}`,borderRadius:14,padding:"16px 10px",textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#2d5a27",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>{p.name}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,marginBottom:10}}>{p.price}</div>
              <div style={{marginBottom:10}}>{p.feats.map((f,j)=><div key={j} style={{fontSize:10,color:"#6b6358",fontFamily:"'DM Sans',sans-serif",marginBottom:3,lineHeight:1.4}}>✓ {f}</div>)}</div>
              <button disabled={p.disabled} onClick={()=>{if(!p.disabled){setNote(true);setTimeout(()=>setNote(false),4000);}}}
                style={{width:"100%",padding:"7px 4px",borderRadius:8,border:`1.5px solid ${p.highlight?"#2d5a27":"#ede8e0"}`,background:p.disabled?"transparent":p.highlight?"#2d5a27":"transparent",color:p.disabled?"#b0a898":p.highlight?"#fff":"#1a1a18",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:p.disabled?"default":"pointer"}}>
                {p.btn}
              </button>
            </div>
          ))}
        </div>
        {note&&<div style={{background:"#f0f4ef",border:"1px solid #c5d9c2",borderRadius:10,padding:"9px 14px",fontSize:12,color:"#2d5a27",fontFamily:"'DM Sans',sans-serif",textAlign:"center",marginBottom:10}}>{t.payment_note}</div>}
        <button onClick={onClose} style={{width:"100%",padding:"10px",background:"none",border:"none",color:"#9a8f82",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.close}</button>
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function Botaniq(){
  const [lang,setLang]=useState(()=>navigator.language?.startsWith("ru")?"ru":"en");
  const t=T[lang];
  const [tab,setTab]=useState("diary");
  const [plants,setPlants]=useState(()=>LS.get(PLANTS_KEY,[]));
  const [city,setCity]=useState(()=>LS.get(CITY_KEY,""));
  const [used,setUsed]=useState(()=>LS.get(USED_KEY,0));
  const [paywall,setPaywall]=useState(false);

  const tabs=[
    {key:"diary", icon:"🌿", label:t.nav.diary},
    {key:"plan",  icon:"📋", label:t.nav.plan},
    {key:"finder",icon:"🔍", label:t.nav.finder},
    {key:"analysis",icon:"📷",label:t.nav.analysis},
  ];

  return(
    <div style={{minHeight:"100vh",background:"#faf8f4",paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#faf8f4;}
        input:focus,textarea:focus{border-color:#2d5a27!important;box-shadow:0 0 0 3px rgba(45,90,39,0.1);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .fade-up{animation:fadeUp .35s ease both;}
      `}</style>

      {/* NAV */}
      <nav style={{background:"#fff",borderBottom:"1px solid #ede8e0",padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Logo size={32}/>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"#1a1a18",lineHeight:1}}>Botaniq</div>
            <div style={{fontSize:9,color:"#9a8f82",fontFamily:"'DM Sans',sans-serif",letterSpacing:1.6,textTransform:"uppercase",marginTop:1}}>{t.by}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2}}>
          {["ru","en"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{background:"none",border:"none",cursor:"pointer",padding:"3px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:11,letterSpacing:1.2,textTransform:"uppercase",color:lang===l?"#1a1a18":"#b0a898",borderBottom:lang===l?"1.5px solid #2d5a27":"1.5px solid transparent",transition:"all .15s"}}>{l}</button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{maxWidth:600,margin:"0 auto",padding:"22px 16px 0"}} className="fade-up">
        {tab==="diary"    &&<DiaryTab    t={t} plants={plants} setPlants={setPlants}/>}
        {tab==="plan"     &&<PlanTab     t={t} plants={plants} city={city} setCity={setCity}/>}
        {tab==="finder"   &&<FinderTab   t={t}/>}
        {tab==="analysis" &&<AnalysisTab t={t} city={city} setCity={setCity} used={used} setUsed={setUsed} onLimit={()=>setPaywall(true)}/>}
      </div>

      <div style={{maxWidth:600,margin:"28px auto 0",padding:"0 16px",textAlign:"center",color:"#c0b8ae",fontSize:10,fontFamily:"'DM Sans',sans-serif",lineHeight:1.8}}>{t.footer}</div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #ede8e0",display:"flex",zIndex:100,boxShadow:"0 -2px 10px rgba(0,0,0,0.05)"}}>
        {tabs.map(tb=>(
          <button key={tb.key} onClick={()=>setTab(tb.key)} style={{flex:1,padding:"10px 4px 12px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:18}}>{tb.icon}</span>
            <span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif",letterSpacing:.4,color:tab===tb.key?"#2d5a27":"#9a8f82",fontWeight:tab===tb.key?600:400,textTransform:"uppercase"}}>{tb.label}</span>
            {tab===tb.key&&<div style={{width:18,height:2,borderRadius:1,background:"#2d5a27"}}/>}
          </button>
        ))}
      </div>

      {paywall&&<Paywall t={t} onClose={()=>setPaywall(false)}/>}
    </div>
  );
}
