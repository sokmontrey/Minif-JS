class LoopSubscriber{
	_loop; _reactive;
	constructor(loop, reactive){
		this._loop = loop;
		this._reactive = reactive;
		this._subscribe();
	}
	_subscribe(){
		//TODO check this later
		this._reactive.publisher.subscribe(this, null);
	}
	updateValue(publisher_name, new_value){
		this._loop.update(new_value);
	}
}
class Loop{
	_name=null; 
	_value; 
	_subscriber=null;
	_parent_element=document;
	_callback=null;
	_reactive=null;
	onUpdate=null;
	constructor(
		name=null,
		object=null,
		callback=null,
		parent_element=document
	){
		if(!name) return;
		this.attach(name, parent_element);
		this.setCallback(callback);

		if(object.constructor.name === 'Reactive'){
			this._subscriber = new LoopSubscriber(this, object);
			this.update(object.value);
		}else{ 
			this.update(object); 
		}
	}
	attach(name, parent_element){
		this._name = name;
		this._parent_element = parent_element;

		this._reactive = new Reactive(name, 
			null, null, null,
			parent_element);
	}
	setCallback(callback){
		this._callback = callback;
		this._render();
	}
	update(value){
		this._value = ( this.onUpdate
			? this.onUpdate(this._value, value, this)
			: undefined ) || value
		this._render();
	}
	_render(){
		let result = '';
		for(let index in this._value){
			result += this._callback(this._value[index], index);
		}
		this._reactive.update(result);
	}
}

//TODO: handle return as DOM instead of string
//TODO: loop directly inside html
/*
const test = new Loop('list', [1,2,3], (value, index)=>{
	return `<p id='${index}'>${value}</p>`;
});
*/
