function slopShell(active, counts = {}) {
  const items = [['🏠','Dashboard'],['🔥','Roast Schedule'],['📦','Orders'],['🌱','Green Coffee'],['👥','Customers']];
  const ins = [['📊','Analytics'],['🤖','AI Assistant']];
  const nav = ([e, l]) => `<div class="nav${l === active ? ' on' : ''}"><span class="e">${e}</span>${l}${counts[l] ? `<span class="ct">${counts[l]}</span>` : ''}${l === 'AI Assistant' ? '<span class="nw">New ✨</span>' : ''}</div>`;
  document.getElementById('side').innerHTML = `
    <div class="logo"><div class="sq">☕</div><span class="nm">Firstcrack</span><span class="ai">AI</span></div>
    <div class="sec">MAIN MENU</div>${items.map(nav).join('')}
    <div class="sec">INSIGHTS</div>${ins.map(nav).join('')}${nav(['⚙️','Settings'])}
    <div class="up"><b>Upgrade to Pro 🚀</b><p>Unlock AI-powered roast analytics and unlimited batches!</p><div class="btn">Upgrade Now ✨</div></div>
    <div class="me"><div class="av">MO</div><div><b>Maya Okafor</b><span>Hollow Oak Coffee</span></div></div>`;
  document.getElementById('top').innerHTML = `<div class="search">🔍 Search anything...<span class="k">⌘K</span></div><div class="bell">🔔<i>3</i></div><div class="av">MO</div>`;
}
