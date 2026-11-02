"use strict";

// 項目の追加・修正はこの配列で行います。各 id は保存データと紐づくため、公開後は変更しないことを推奨します。
const CATEGORIES = [
  { id: "ownership", name: "主体性", description: "指示や習慣に流されず、目的を理解して行動できるか", questions: [
    {id:"ownership-1", text:"指示された作業について、目的や背景を確認している"},
    {id:"ownership-2", text:"自分の担当業務を他人事にせず、結果まで責任を持って関わっている"},
    {id:"ownership-3", text:"必要だと感じたことについて、指示がなくても提案や相談をしている"},
    {id:"ownership-4", text:"不明点や問題を放置せず、自ら次の行動を起こしている"}
  ]},
  { id:"learning", name:"学習・適応力", description:"知らないことや変化に対して、学びながら対応できるか", questions:[
    {id:"learning-1",text:"分からないことを自分で調べ、理解する習慣がある"},
    {id:"learning-2",text:"新しい技術や方法に対して、必要性を判断したうえで試している"},
    {id:"learning-3",text:"AIの回答を鵜呑みにせず、検証しながら学習や仕事に活用している"},
    {id:"learning-4",text:"既存のやり方に固執せず、より適切な方法があれば取り入れている"}
  ]},
  { id:"discovery", name:"課題発見力", description:"日常の仕事から改善すべき問題を発見できるか", questions:[
    {id:"discovery-1",text:"日常業務で不便・非効率・リスクを見つけることができる"},
    {id:"discovery-2",text:"慣習や既存の手順について、目的や必要性を考えている"},
    {id:"discovery-3",text:"表面的な現象だけでなく、背景にある問題を考えている"},
    {id:"discovery-4",text:"発見した課題について、影響度や優先順位を整理できる"}
  ]},
  { id:"problem-solving", name:"問題解決力", description:"問題を整理し、適切な解決策を考えられるか", questions:[
    {id:"problem-1",text:"問題が発生したとき、事実と推測を分けて整理できる"},
    {id:"problem-2",text:"原因を特定するために、仮説を立てて検証できる"},
    {id:"problem-3",text:"複数の解決策を比較し、コスト・効果・リスクを考えられる"},
    {id:"problem-4",text:"自分で解決できない場合、適切な相手に相談して前進できる"}
  ]},
  { id:"technical", name:"技術実践力", description:"IT技術を使って、実際に課題を解決できるか", questions:[
    {id:"technical-1",text:"目的に応じて適切な技術やツールを選択できる"},
    {id:"technical-2",text:"調べたりAIを活用したりしながら、必要な成果物を作れる"},
    {id:"technical-3",text:"作成したものが正しく動作するか、適切に検証できる"},
    {id:"technical-4",text:"保守性・安全性・運用への影響を考えた実装や対応ができる"}
  ]},
  { id:"communication", name:"伝達・合意形成力", description:"周囲に伝え、協力を得ながら仕事を進められるか", questions:[
    {id:"communication-1",text:"報告や説明で、目的・結論・根拠を分かりやすく伝えられる"},
    {id:"communication-2",text:"相手の立場や知識に合わせて説明方法を変えられる"},
    {id:"communication-3",text:"自分の考えだけでなく、相手の意見や懸念を確認している"},
    {id:"communication-4",text:"関係者と必要な合意を取り、次の行動につなげられる"}
  ]},
  { id:"improvement", name:"継続改善力", description:"一度の成果で終わらせず、改善を積み重ねられるか", questions:[
    {id:"improvement-1",text:"仕事の結果を振り返り、うまくいった点や課題を整理している"},
    {id:"improvement-2",text:"同じ問題を繰り返さないための仕組みを考えている"},
    {id:"improvement-3",text:"手順書や自動化などを通じて、他の人も対応できる状態を作っている"},
    {id:"improvement-4",text:"過去の経験やフィードバックを、次の行動に反映している"}
  ]}
];

const STORAGE_KEY = "it-self-reliance-check-v1";
const allQuestions = CATEGORIES.flatMap(c => c.questions);
const questionIds = new Set(allQuestions.map(q => q.id));
const $ = id => document.getElementById(id);
let state = { answers: {}, note: "" };
let toastTimer;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored && typeof stored === "object") state = sanitizeState(stored);
  } catch (error) { console.warn("保存済みの診断データを読み込めませんでした", error); }
}
function sanitizeState(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("JSONの形式が正しくありません");
  const answers = {};
  if (data.answers && typeof data.answers === "object" && !Array.isArray(data.answers)) {
    for (const [id, score] of Object.entries(data.answers)) {
      if (questionIds.has(id) && Number.isInteger(score) && score >= 1 && score <= 4) answers[id] = score;
    }
  }
  return {answers, note: typeof data.note === "string" ? data.note.slice(0, 20000) : ""};
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) {console.warn("回答をブラウザに保存できませんでした", error); showToast("保存できませんでした。ブラウザの設定をご確認ください。");}
}
function createQuestion(question, number) {
  const wrapper = document.createElement("div"); wrapper.className = "question";
  const title = document.createElement("p"); title.className = "question-title";
  const ordinal = document.createElement("span"); ordinal.className = "ordinal"; ordinal.textContent = `${String(number).padStart(2,"0")}.`;
  title.append(ordinal, document.createTextNode(question.text));
  const ratings = document.createElement("div"); ratings.className = "rating"; ratings.setAttribute("role","radiogroup"); ratings.setAttribute("aria-label",question.text);
  for (const value of [1,2,3,4,0]) {
    const label = document.createElement("label");
    const input = document.createElement("input"); input.type="radio"; input.name = question.id; input.value = String(value); input.checked = (state.answers[question.id] || 0) === value;
    input.addEventListener("change", () => {if (value === 0) delete state.answers[question.id]; else state.answers[question.id] = value; persist(); updateResults();});
    const display = document.createElement("span"); display.textContent = value === 0 ? "未評価" : String(value);
    label.append(input,display); ratings.append(label);
  }
  wrapper.append(title, ratings); return wrapper;
}
function renderQuestions() {
  const container = $("questions"); container.replaceChildren();
  let questionIndex = 1;
  CATEGORIES.forEach((category,index) => {
    const details = document.createElement("details"); details.className="category"; details.dataset.category = category.id; if (index === 0) details.open=true;
    const summary=document.createElement("summary");
    const number=document.createElement("span"); number.className="category-number"; number.textContent=String(index+1).padStart(2,"0");
    const info=document.createElement("span"); info.className="category-label";
    const label=document.createElement("strong"); label.textContent=category.name;
    const description=document.createElement("small"); description.textContent=category.description;
    info.append(label,description);
    const count=document.createElement("span"); count.className="category-count"; count.dataset.count=category.id;
    const arrow=document.createElement("span"); arrow.className="chevron"; arrow.setAttribute("aria-hidden","true"); arrow.textContent="⌄";
    summary.append(number,info,count,arrow);
    const body=document.createElement("div"); body.className="category-body";
    category.questions.forEach(q => body.append(createQuestion(q,questionIndex++)));
    details.append(summary,body); container.append(details);
  });
  updateToggleButton();
}
function stats(category) {
  const values=category.questions.map(q=>state.answers[q.id]).filter(v=>typeof v === "number");
  return {count:values.length, total:category.questions.length, average:values.length ? values.reduce((a,b)=>a+b,0)/values.length : null};
}
function updateResults() {
  const counts=CATEGORIES.map(stats), answered=counts.reduce((a,s)=>a+s.count,0), all=allQuestions.length;
  $("answered-count").textContent=answered; $("question-count").textContent=all;
  $("progress-bar").setAttribute("aria-valuemax",String(all)); $("progress-bar").setAttribute("aria-valuenow",String(answered));
  $("progress-fill").style.width=`${answered/all*100}%`;
  CATEGORIES.forEach((c,i)=>document.querySelector(`[data-count="${c.id}"]`).textContent=`${counts[i].count}/${counts[i].total}`);
  const values=Object.values(state.answers); const mean=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
  $("overall-average").textContent=mean===null?"—":mean.toFixed(2);
  $("result-note").textContent=answered===0?"項目を評価すると、ここに分野別の結果が表示されます。":answered===all?"すべての項目を評価しました。点数だけでなく具体的な行動と次の目標も振り返りましょう。":`現在 ${answered}/${all} 項目を評価しています。未評価の項目は平均値の計算に含めていません。`;
  const container=$("category-results"); container.replaceChildren();
  CATEGORIES.forEach((cat,index)=>{
    const {count,average,total}=counts[index];
    const row=document.createElement("div"); row.className="result-item";
    const label=document.createElement("span"); label.className="result-label";label.textContent=cat.name;
    const track=document.createElement("div"); track.className="result-track"; track.setAttribute("role","meter");track.setAttribute("aria-label",`${cat.name}の平均点`);track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","4");track.setAttribute("aria-valuenow",String(average??0));
    const fill=document.createElement("div");fill.className="result-fill";fill.style.width=`${average===null?0:average/4*100}%`;track.append(fill);
    const score=document.createElement("span");score.className="result-score";score.textContent=average===null?"—":`${average.toFixed(1)} (${count}/${total})`;
    row.append(label,track,score);container.append(row);
  });
}
function updateToggleButton() {
  const details=[...document.querySelectorAll(".category")]; const allOpen=details.length && details.every(d=>d.open);
  $("toggle-all").textContent=allOpen?"すべて閉じる":"すべて開く";
}
function showToast(message) {const element=$("toast");element.textContent=message;element.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove("visible"),3200);}
function download(content,mime,filename) {const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function snapshot(){return {version:1,exportedAt:new Date().toISOString(),answers:state.answers,note:state.note,categories:CATEGORIES.map(c=>({id:c.id,name:c.name,...stats(c)}))};}
function toCSV() {
  // UTF-8 BOMを付け、Excelでも日本語を開きやすくする。
  const escape = value => `"${String(value??"").replaceAll('"','""')}"`;
  const lines=[["分野","項目ID","チェック項目","評価（1〜4）"],...CATEGORIES.flatMap(c=>c.questions.map(q=>[c.name,q.id,q.text,state.answers[q.id]??""])),[],["振り返りメモ",state.note]];
  return "\ufeff"+lines.map(line=>line.map(escape).join(",")).join("\r\n");
}
function syncAnswersToInputs() {document.querySelectorAll('.rating input').forEach(input=>{input.checked=(state.answers[input.name]||0)===Number(input.value);});$("reflection-note").value=state.note;updateResults();}
function init() {
  loadState();renderQuestions();syncAnswersToInputs();
  $("reflection-note").addEventListener("input",event=>{state.note=event.target.value;persist();});
  $("toggle-all").addEventListener("click",()=>{const nodes=[...document.querySelectorAll(".category")];const shouldOpen=!nodes.every(d=>d.open);nodes.forEach(node=>{node.open=shouldOpen;});updateToggleButton();});
  $("questions").addEventListener("toggle",updateToggleButton,true);
  $("download-json").addEventListener("click",()=>download(JSON.stringify(snapshot(),null,2),"application/json;charset=utf-8","self-reliance-results.json"));
  $("download-csv").addEventListener("click",()=>download(toCSV(),"text/csv;charset=utf-8","self-reliance-results.csv"));
  $("print-result").addEventListener("click",()=>{document.querySelectorAll(".category").forEach(d=>d.open=true);window.print();});
  $("import-json").addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data.answers||typeof data.answers!=="object"||Array.isArray(data.answers))throw new Error("回答データがありません");state=sanitizeState(data);persist();syncAnswersToInputs();showToast("診断結果を読み込みました");}catch(error){showToast(`読み込みに失敗しました：${error.message}`);}finally{event.target.value="";}});
  $("clear-data").addEventListener("click",()=>{if(!window.confirm("すべての回答とメモを削除します。よろしいですか？"))return;state={answers:{},note:""};persist();syncAnswersToInputs();showToast("回答をリセットしました");});
}
document.addEventListener("DOMContentLoaded",init);
