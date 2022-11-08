const list = new Reactive('list', []);
const input = new Reactive('input', '');

const display_list = new Loop('display_list', list, (value)=>{
    return `<li>${value}</li>`;
});

new Listener('inputChange', (event)=>{
    input.update(event.target.value);
});

new Listener('updateList', ()=>{
    list.value.push(input.value);
    list.update(list.value);
});
