const a = new Reactive('a', 1);

function toJSON(string){
	return (new Function(`return ${string}`))();
}
const b = DOM.g("#button");
b.addEventListener('click', toJSON(b.getAttribute('listener'))['click']);

console.log(DSM.getAllElement());
