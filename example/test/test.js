const a = new Reactive('A', 0);
const b = new Reactive('B', 0, [a], ({A})=>{ return A + 1; })

new Listener('updateA', ()=>{ a.update(a.value + 1); });
