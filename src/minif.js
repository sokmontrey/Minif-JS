//TODO: listener
const test = new Loop('list', [], (value, index)=>{
	return `<p id='${index}'>${value}</p>`;
});
