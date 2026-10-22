// Đoạn script người dùng tự dán vào Console của trang danh sách 永慶 (do chính người dùng đang duyệt).
// Nó CHỈ đọc những thẻ nhà đang hiển thị trên màn hình, không gửi thêm yêu cầu nào tới 永慶.
// - Gộp các tin đăng trùng 1 căn (cùng địa chỉ/loại/diện tích/tầng/phòng), bỏ loại 辦公/車位/農舍...
// - Nhớ các link đã bấm "Copy link" (lịch sử) để lần sau chỉ lấy tin MỚI.
export const YC_COLLECTOR_SNIPPET = String.raw`(function(){
  var K='yc_collect_v1', HK='yc_collect_hist_v1';
  if(window.__ycCollector){return}
  window.__ycCollector=1;
  function load(){
    var s; try{s=JSON.parse(localStorage.getItem(K))}catch(e){}
    s=s||{items:{},dup:0,skip:0,old:0};
    if(!s.seen){ // dữ liệu bản cũ: dựng lại danh sách id đã xem, đặt lại bộ đếm cho đúng
      s.seen={}; Object.keys(s.items).forEach(function(k){s.seen[s.items[k].id]=1}); s.dup=0; s.skip=0; s.old=0;
    }
    s.old=s.old||0; s.skip=s.skip||0;
    return s;
  }
  function save(s){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}
  function hist(){try{return JSON.parse(localStorage.getItem(HK))||{}}catch(e){return {}}}
  function saveHist(h){try{localStorage.setItem(HK,JSON.stringify(h))}catch(e){}}
  var t=function(c,q){var e=c.querySelector(q);return e?e.textContent.replace(/\s+/g,'').trim():''};
  function scan(){
    var s=load(),H=hist();
    document.querySelectorAll('li.search-result-list-item a.link[href*="house/"]').forEach(function(a){
      var m=(a.getAttribute('href')||'').match(/house\/(\d+)/); if(!m) return;
      var id=m[1]; if(s.seen[id]) return; s.seen[id]=1;
      if(H[id]){s.old++; return}   // đã lấy ở những lần trước
      var ct=t(a,'.caseType');
      // Chỉ lấy 住宅 / 店面 / 廠房 / 土地: bỏ văn phòng, chỗ đậu xe, nhà nông...
      if(/辦公|商辦|廠辦|車位|停車|農舍|其他/.test(ct)){s.skip++; return}
      var key=[t(a,'.address'),ct,t(a,'.regArea'),t(a,'.mainArea'),t(a,'.floor'),t(a,'.room')].join('|');
      if(s.items[key]){s.dup++} else {s.items[key]={id:id,title:t(a,'.caseName')}}
    });
    save(s); draw(s);
  }
  var box=document.createElement('div');
  box.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483647;background:#111;color:#fff;font:13px/1.4 sans-serif;padding:10px 12px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.35);max-width:280px';
  var info=document.createElement('div'); box.appendChild(info);
  function btn(txt,fn){var b=document.createElement('button');b.textContent=txt;b.style.cssText='margin:6px 6px 0 0;padding:4px 10px;border:0;border-radius:6px;cursor:pointer;font-size:12px';b.onclick=fn;box.appendChild(b);return b}
  btn('Copy link',function(){
    var s=load(),ids=Object.keys(s.items).map(function(k){return s.items[k].id});
    var txt=ids.map(function(id){return 'https://buy.yungching.com.tw/house/'+id}).join('\n');
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){
      var H=hist(); ids.forEach(function(id){H[id]=1}); saveHist(H);   // ghi nhớ: lần sau không lấy lại
      info.textContent='Đã copy '+ids.length+' link và ghi vào lịch sử. Dán vào trang 8386.tw. Bấm "Xoá hết" để bắt đầu đợt mới.';
    }).catch(function(){window.prompt('Copy (Ctrl+C):',txt)});
  }).style.background='#fbbf24';
  btn('Xoá hết',function(){if(confirm('Xoá danh sách đang thu (lịch sử link đã copy vẫn giữ)?')){save({items:{},dup:0,skip:0,old:0,seen:{}});scan()}});
  btn('Xoá lịch sử',function(){if(confirm('Xoá LỊCH SỬ các link đã copy? Lần sau sẽ lấy lại cả tin cũ.')){saveHist({});save({items:{},dup:0,skip:0,old:0,seen:{}});scan()}});
  function draw(s){info.textContent='Đã thu '+Object.keys(s.items).length+' căn mới (bỏ '+s.old+' tin đã lấy trước đó, '+s.dup+' tin trùng, '+s.skip+' tin sai loại; lịch sử '+Object.keys(hist()).length+' link). Hãy tự lật trang/cuộn xuống để thu thêm.'}
  document.body.appendChild(box);
  var tm; new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(scan,600)}).observe(document.body,{childList:true,subtree:true});
  scan();
})();`
