// Đoạn script người dùng tự dán vào Console của trang danh sách 永慶 (do chính người dùng đang duyệt).
// Nó CHỈ đọc những thẻ nhà đang hiển thị trên màn hình, không gửi thêm yêu cầu nào tới 永慶.
export const YC_COLLECTOR_SNIPPET = String.raw`(function(){
  var K='yc_collect_v1';
  if(window.__ycCollector){return}
  window.__ycCollector=1;
  function load(){try{return JSON.parse(localStorage.getItem(K))||{items:{},dup:0}}catch(e){return {items:{},dup:0}}}
  function save(s){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}
  var t=function(c,q){var e=c.querySelector(q);return e?e.textContent.replace(/\s+/g,'').trim():''};
  function scan(){
    var s=load(),seenId={};
    Object.keys(s.items).forEach(function(k){seenId[s.items[k].id]=1});
    document.querySelectorAll('li.search-result-list-item a.link[href*="house/"]').forEach(function(a){
      var m=(a.getAttribute('href')||'').match(/house\/(\d+)/); if(!m) return;
      var id=m[1]; if(seenId[id]) return; seenId[id]=1;
      var ct=t(a,'.caseType');
      // Chỉ lấy 住宅 / 店面 / 廠房 / 土地: bỏ văn phòng, chỗ đậu xe, nhà nông...
      if(/辦公|商辦|廠辦|車位|停車|農舍|其他/.test(ct)){s.skip=(s.skip||0)+1; return}
      var key=[t(a,'.address'),t(a,'.caseType'),t(a,'.regArea'),t(a,'.mainArea'),t(a,'.floor'),t(a,'.room')].join('|');
      if(s.items[key]){s.dup++} else {s.items[key]={id:id,title:t(a,'.caseName')}}
    });
    save(s); draw(s);
  }
  var box=document.createElement('div');
  box.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483647;background:#111;color:#fff;font:13px/1.4 sans-serif;padding:10px 12px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.35);max-width:260px';
  var info=document.createElement('div'); box.appendChild(info);
  function btn(txt,fn){var b=document.createElement('button');b.textContent=txt;b.style.cssText='margin:6px 6px 0 0;padding:4px 10px;border:0;border-radius:6px;cursor:pointer;font-size:12px';b.onclick=fn;box.appendChild(b);return b}
  btn('Copy link',function(){
    var s=load(),txt=Object.keys(s.items).map(function(k){return 'https://buy.yungching.com.tw/house/'+s.items[k].id}).join('\n');
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){info.textContent='Đã copy '+Object.keys(s.items).length+' link. Dán vào trang 8386.tw.'}).catch(function(){window.prompt('Copy (Ctrl+C):',txt)});
  }).style.background='#fbbf24';
  btn('Xoá hết',function(){if(confirm('Xoá danh sách đã thu?')){save({items:{},dup:0});scan()}});
  function draw(s){info.textContent='Đã thu '+Object.keys(s.items).length+' căn (bỏ '+s.dup+' tin trùng, '+(s.skip||0)+' tin sai loại). Hãy tự lật trang/cuộn xuống để thu thêm.'}
  document.body.appendChild(box);
  var tm; new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(scan,600)}).observe(document.body,{childList:true,subtree:true});
  scan();
})();`
