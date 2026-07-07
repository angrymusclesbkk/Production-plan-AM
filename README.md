<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>แผนการผลิต — Angry Run &amp; OG</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root{
    --bg:#f6f5f0; --surface:#ffffff; --surface-alt:#f1efe8;
    --text:#2c2c2a; --text-2:#5f5e5a; --text-3:#898781;
    --border:#e1e0d9; --border-strong:#d3d1c7;
    --danger-bg:#fcebeb; --danger-tx:#a32d2d; --danger-bd:#e24b4a;
    --warn-bg:#faeeda; --warn-tx:#854f0b;
    --ok-bg:#e1f5ee; --ok-tx:#0f6e56;
    --accent-bg:#e6f1fb; --accent-tx:#185fa5;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --bg:#1a1a19; --surface:#242422; --surface-alt:#2c2c2a;
      --text:#f1efe8; --text-2:#c3c2b7; --text-3:#898781;
      --border:#33332f; --border-strong:#444441;
      --danger-bg:#3a1414; --danger-tx:#f09595; --danger-bd:#e24b4a;
      --warn-bg:#3a2a10; --warn-tx:#fac775;
      --ok-bg:#0a2a22; --ok-tx:#5dcaa5;
      --accent-bg:#0c2a44; --accent-tx:#85b7eb;
    }
  }
  *{box-sizing:border-box;}
  body{margin:0; background:var(--bg); color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Sarabun","Noto Sans Thai",sans-serif;
    line-height:1.6; -webkit-font-smoothing:antialiased;}
  .wrap{max-width:920px; margin:0 auto; padding:24px 16px 60px;}
  h1{font-size:24px; font-weight:600; margin:0 0 2px;}
  .sub{font-size:13px; color:var(--text-3); margin-bottom:22px;}
  .cards{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:28px;}
  .card{border-radius:12px; padding:14px 16px;}
  .card .lbl{font-size:13px; margin-bottom:4px;}
  .card .val{font-size:26px; font-weight:600;}
  .card .val small{font-size:14px; font-weight:400;}
  .sec-title{font-size:17px; font-weight:600; margin:0 0 4px;}
  .sec-sub{font-size:13px; color:var(--text-2); margin-bottom:16px;}
  .round{background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px 16px; margin-bottom:12px;}
  .round.urgent{border:2px solid var(--danger-bd);}
  .round-head{display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:12px;}
  .round-head .left{display:flex; align-items:center; gap:10px; flex-wrap:wrap;}
  .badge-n{display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; font-size:13px; font-weight:600; background:var(--accent-bg); color:var(--accent-tx);}
  .badge-n.u{background:var(--danger-bg); color:var(--danger-tx);}
  .rlabel{font-size:15px; font-weight:600;}
  .rnote{font-size:12px; color:var(--text-3);}
  .rtotal{font-size:13px; color:var(--text-2);}
  .items{display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:8px;}
  .item{border:1px solid var(--border); border-radius:8px; padding:8px 10px; background:var(--surface-alt);}
  .item .nm{font-size:13px; font-weight:600; margin-bottom:2px;}
  .item .row{display:flex; align-items:center; justify-content:space-between; gap:6px;}
  .item .qty{font-size:17px; font-weight:600;}
  .tag{font-size:11px; padding:2px 6px; border-radius:4px; white-space:nowrap;}
  .tag.d{background:var(--danger-bg); color:var(--danger-tx);}
  .tag.w{background:var(--warn-bg); color:var(--warn-tx);}
  .tag.n{background:var(--surface); color:var(--text-3);}
  .chart-box{position:relative; width:100%; height:600px; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:12px;}
  .legend{display:flex; flex-wrap:wrap; gap:16px; font-size:12px; color:var(--text-2); margin:12px 0;}
  .legend span{display:flex; align-items:center; gap:6px;}
  .dot{width:11px; height:11px; border-radius:3px; display:inline-block;}
  .note{margin-top:20px; padding:14px 16px; background:var(--surface); border:1px solid var(--border); border-radius:12px; font-size:13px; color:var(--text-2);}
  .note b{color:var(--text);}
  .foot{margin-top:24px; font-size:12px; color:var(--text-3); text-align:center;}
</style>
</head>
<body>
<div class="wrap">

  <h1>แผนการผลิต — Angry Run &amp; OG</h1>
  <div class="sub">เป้าหมาย: สต็อกอยู่ถึง 31 ส.ค. 2026 · ข้อมูล ณ 7 ก.ค. 2026 · เรียงตามความด่วน สีแดง = ผลิตก่อน</div>

  <div class="cards">
    <div class="card" style="background:var(--danger-bg);">
      <div class="lbl" style="color:var(--danger-tx);">หมดสต็อกแล้ว</div>
      <div class="val" style="color:var(--danger-tx);">4 <small>รายการ</small></div>
    </div>
    <div class="card" style="background:var(--warn-bg);">
      <div class="lbl" style="color:var(--warn-tx);">ใกล้หมด (&lt;20 วัน)</div>
      <div class="val" style="color:var(--warn-tx);">7 <small>รายการ</small></div>
    </div>
    <div class="card" style="background:var(--surface-alt);">
      <div class="lbl" style="color:var(--text-2);">ต้องผลิตรวม</div>
      <div class="val">~4,300 <small>ชิ้น</small></div>
    </div>
    <div class="card" style="background:var(--surface-alt);">
      <div class="lbl" style="color:var(--text-2);">แบ่งเป็น</div>
      <div class="val">5 <small>รอบส่ง</small></div>
    </div>
  </div>

  <div class="sec-title">แผนรับของแต่ละรอบ (ล็อตละ ~120 ชิ้น คละสี/ไซส์)</div>
  <div class="sec-sub">โรงงานส่งเฉลี่ย ~670 ชิ้น/รอบ ทุก ~5-7 วัน · แต่ละรอบด้านล่างคุมไว้ที่ ~600-660 ชิ้น</div>
  <div id="rounds"></div>

  <div class="sec-title" style="margin-top:28px;">ภาพรวมสต็อกคงเหลือ — จะหมดในกี่วัน</div>
  <div class="legend">
    <span><span class="dot" style="background:#d03b3b;"></span>หมดแล้ว / วิกฤต</span>
    <span><span class="dot" style="background:#eda100;"></span>ใกล้หมด (&lt;40 วัน)</span>
    <span><span class="dot" style="background:#1baf7a;"></span>สต็อกพอ</span>
  </div>
  <div class="chart-box">
    <canvas id="stockChart" role="img" aria-label="กราฟแท่งแสดงจำนวนวันที่สต็อกแต่ละสีจะพอขาย">White S และ Pink S หมดแล้ว, ที่เหลือเรียงเพิ่มขึ้นถึง Purple M 114 วัน</canvas>
  </div>

  <div class="note">
    <b>หมายเหตุถึงโรงงาน:</b> White (S) และ Pink (S) เป็น 2 สีขายดีที่สุด (ขาย 18 และ 14 ตัว/วัน) ตอนนี้ของหมด — ขอให้มาในรอบ 1 และเติมซ้ำรอบ 2 เพราะ 1 ล็อตอยู่ไม่ถึง 2 สัปดาห์ · รุ่น HNY ยกเลิกการผลิตทั้งหมด · OG NEW White/Black มียอดขายแต่ไม่พบในตารางสต็อก ควรตรวจสอบ
  </div>

  <div class="foot">อัปเดตล่าสุด 7 ก.ค. 2026 · จำนวนวัน/ยอดขายคำนวณจากยอดขายเฉลี่ยที่ผ่านมา เผื่อ buffer 15%</div>
</div>

<script>
const rounds = [
  { n:1, label:"รอบ 1 — ด่วนสุด", note:"ของหมด + ขายดี", total:660, urgent:true, items:[
      {name:"White (S)", qty:240, tag:"หมดแล้ว", t:"d"},
      {name:"Pink (S)", qty:120, tag:"หมดแล้ว", t:"d"},
      {name:"White (M)", qty:120, tag:"14 วัน", t:"w"},
      {name:"Mint (S)", qty:120, tag:"10 วัน", t:"w"},
      {name:"Neon Green (S)", qty:60, tag:"14 วัน", t:"w"},
  ]},
  { n:2, label:"รอบ 2 — สัปดาห์ถัดไป", note:"เติมตัวขายเร็ว", total:660, urgent:false, items:[
      {name:"White (S)", qty:240, tag:"เติมต่อ", t:"n"},
      {name:"Pink (S)", qty:120, tag:"เติมต่อ", t:"n"},
      {name:"Black (S)", qty:120, tag:"17 วัน", t:"w"},
      {name:"Black (M)", qty:120, tag:"18 วัน", t:"w"},
      {name:"Purple (S)", qty:60, tag:"12 วัน", t:"w"},
  ]},
  { n:3, label:"รอบ 3", note:"เติมกลุ่ม S", total:600, urgent:false, items:[
      {name:"White (M)", qty:120, tag:"", t:"n"},
      {name:"Purple (S)", qty:120, tag:"", t:"n"},
      {name:"Neon Green (S)", qty:120, tag:"", t:"n"},
      {name:"Pride (S)", qty:120, tag:"", t:"n"},
      {name:"Orange (S)", qty:120, tag:"", t:"n"},
  ]},
  { n:4, label:"รอบ 4", note:"เติมกลุ่ม M", total:600, urgent:false, items:[
      {name:"Pink (M)", qty:120, tag:"", t:"n"},
      {name:"Pride (M)", qty:120, tag:"", t:"n"},
      {name:"Black (S)", qty:120, tag:"", t:"n"},
      {name:"Mint (M)", qty:120, tag:"", t:"n"},
      {name:"Blue-gray (S)", qty:120, tag:"", t:"n"},
  ]},
  { n:5, label:"รอบ 5 — เก็บตก + OG", note:"ปิดยอดถึงสิ้น ส.ค.", total:790, urgent:false, items:[
      {name:"Orange (M)", qty:90, tag:"", t:"n"},
      {name:"Red (S)", qty:60, tag:"", t:"n"},
      {name:"OG Socks White", qty:270, tag:"หมดแล้ว", t:"d"},
      {name:"OG Socks Black", qty:210, tag:"3 วัน", t:"w"},
      {name:"OG NEW (คละ)", qty:160, tag:"", t:"n"},
  ]},
];

const rc = document.getElementById('rounds');
rounds.forEach(r=>{
  const card = document.createElement('div');
  card.className = 'round' + (r.urgent?' urgent':'');
  let head = '<div class="round-head"><div class="left">'
    +'<span class="badge-n'+(r.urgent?' u':'')+'">'+r.n+'</span>'
    +'<span class="rlabel">'+r.label+'</span>'
    +'<span class="rnote">'+r.note+'</span></div>'
    +'<span class="rtotal">รวม ~'+r.total+' ชิ้น</span></div>';
  let grid = '<div class="items">';
  r.items.forEach(it=>{
    grid += '<div class="item"><div class="nm">'+it.name+'</div><div class="row">'
      +'<span class="qty">'+it.qty+'</span>'
      +(it.tag?'<span class="tag '+it.t+'">'+it.tag+'</span>':'')
      +'</div></div>';
  });
  grid += '</div>';
  card.innerHTML = head+grid;
  rc.appendChild(card);
});

const chartData = [
  {name:"White (S)", days:0},{name:"Pink (S)", days:0},
  {name:"Mint (S)", days:10},{name:"Purple (S)", days:12},
  {name:"Neon Green (S)", days:14},{name:"White (M)", days:14},
  {name:"Black (S)", days:17},{name:"Black (M)", days:18},
  {name:"Blue-gray (S)", days:24},{name:"Pride (S)", days:24},
  {name:"Pride (M)", days:24},{name:"Pink (M)", days:26},
  {name:"Orange (S)", days:26},{name:"Mint (M)", days:27},
  {name:"Orange (M)", days:42},{name:"Blue-gray (M)", days:48},
  {name:"Red (S)", days:55},{name:"Neon Green (M)", days:59},
  {name:"Red (M)", days:67},{name:"Purple (M)", days:114},
];
const barColors = chartData.map(d=> d.days===0?'#d03b3b' : d.days<20?'#e24b4a' : d.days<40?'#eda100' : '#1baf7a');
const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
const gridC = isDark ? '#2c2c2a' : '#e1e0d9';
const tickC = isDark ? '#c3c2b7' : '#52514e';
const axisC = '#898781';
new Chart(document.getElementById('stockChart'), {
  type:'bar',
  data:{ labels: chartData.map(d=>d.name),
    datasets:[{ data: chartData.map(d=>d.days), backgroundColor:barColors, borderRadius:4, borderSkipped:false, barThickness:18 }] },
  options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(c)=> c.parsed.x===0?'หมดแล้ว':'พอขายอีก '+c.parsed.x+' วัน' } } },
    scales:{
      x:{ title:{display:true, text:'จำนวนวันที่สต็อกจะพอขาย', color:axisC, font:{size:12}}, grid:{color:gridC}, ticks:{color:axisC} },
      y:{ grid:{display:false}, ticks:{color:tickC, font:{size:12}} }
    } }
});
</script>
</body>
</html>
