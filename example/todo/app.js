const list = new Reactive('list', []);
const display_list = new Loop('display_list', list, (value)=>{
    return `<li>${value}</li>`;
});

DOM.g('#button').addEventListener('click', ()=>{
    const value = DOM.g('#input').value;
    list.value.push(value);
    list.update(list.value);
}); 
