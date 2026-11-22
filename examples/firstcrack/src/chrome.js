function shell(active) {
  const items = [['house','Today'],['flame','Roasts'],['package','Orders','12'],['bean','Green coffee'],['users','Customers'],['chart-line','Analytics'],['message-square','Assistant']];
  const a = ([i, l, n]) => `<a class="${l === active ? 'on' : ''}" ${l === active ? 'aria-current="page"' : ''}><i data-lucide="${i}"></i>${l}${n ? `<span class="n">${n}</span>` : ''}</a>`;
  document.getElementById('side').innerHTML = `
    <div class="brand"><span class="mk"><i data-lucide="bean"></i></span>Firstcrack</div>
    <nav class="nav" aria-label="Main">${items.map(a).join('')}</nav>
    <div class="foot nav">${a(['settings','Settings'])}<div class="who"><span class="av">MO</span><div><b>Hollow Oak Coffee</b><span>Maya Okafor</span></div></div></div>`;
  document.getElementById('top').innerHTML = `<div class="search"><i data-lucide="search"></i>Search<span class="kbd">⌘&nbsp;K</span></div>
    <button class="bell" aria-label="Notifications, 3 new" style="border:0;background:none"><i data-lucide="bell"></i><i></i></button>`;
  lucide.createIcons();
}
