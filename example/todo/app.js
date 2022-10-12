const list = new Reactive('list', []);

DOM.g('#button').addEventListener('click', ()=>{
    const value = DOM.g('#input').value;
    list.value.push(value);
    list.update(list.value);
}); 
