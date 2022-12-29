class ReactiveSubscriber{
	_reactive;
	_publisher;
	_value = {};
	_subscription = {};
	constructor(reactive, publisher){
		this._reactive = reactive;

		if(publisher.constructor == Array){
			for(let one of publisher){
				const name = one.name;
				this._subscription[name] = one;
			}
		}else{
			for(let name in publisher)
				this._subscription[name] = publisher[name];
		}

		this._subscribe();
		this._initValue();
	}
	_subscribe(){
		for(let name in this._subscription)
			this._subscription[name].publisher.subscribe(this, name);
	}
	_initValue(){
		for(let name in this._subscription)
			this._value[name] = this._subscription[name].value;
	}
	updateValue(publisher_name, new_value){
		this._value[publisher_name] = new_value;
		this._renderValue();
	}
	_renderValue(){
		const reactive = this._reactive;
		const updateFunction = reactive.update_function;
		reactive.update(updateFunction(this._value));
	}
} 
class ReactivePublisher{
	_subscribers = new Array();
	subscribe(subscriber, assign_name){
		this._subscribers.push({
			assign_name: assign_name,
			subscriber: subscriber
		})
	}
	publishUpdate(new_value){
		this._subscribers.forEach((each)=>{
			const subscriber = each['subscriber'];;
			const assign_name = each['assign_name'];
			subscriber.updateValue(assign_name, new_value);
		})
	}
}
class Reactive{
	_name; _value; _parent_element;
	onUpdate=null;
	constructor(
		name=null, 
		initial_value=null,
		reactive_publisher=null,
		update_function=null,
		parent_element=document
	){
		if(!name) return;
		this._name = name;
		this._parent_element = parent_element;

		this._publisher = new ReactivePublisher();

		this.setUpdateFunction(update_function);
		if(reactive_publisher){
			this.setReactivePublisher(reactive_publisher);
		}else{
			this.setReactivePublisher();
		}

		this.update(initial_value);
	}
	setUpdateFunction(update_function){
		this._update_function = update_function;
	}
	setReactivePublisher(reactive_publisher=null, update_function=null){
		this._subscriber = reactive_publisher
			? new ReactiveSubscriber(this, reactive_publisher)
			: null;
		update_function ? this.setUpdateFunction(update_function) : null;
	}
	setOnUpdate(onUpdate_function=()=>{}){
		//onUpdate(old_value, new_value, reactive);
		this.onUpdate = onUpdate_function;
	}
	update(value){
		if(this.onUpdate) this.onUpdate(this._value, value, this);
		this._value = value;
		this._publisher.publishUpdate(this._value);
		this._render();
		return this;
	}

	_render(){
		DSM.updateVariable(this._name, this._value, this._parent_element);
		DSM.update();
	}

	get name(){return this._name}
	get value(){return this._value}
	get publisher(){return this._publisher}
	get subscriber(){return this._subscriber}
	get update_function(){return this._update_function}
}

//TODO add Reactive Doc
/*
 * Reactive: example
const a = new Reactive('a', 10);
const b = new Reactive('b', 10);
const c = new Reactive('c', a.value + b.value, [a, b], ({a, b})=>a+b);

//TODO Reactive.onUpdate
//
DOM.g('#button').addEventListener('click', ()=>{
	a.update(a.value +1);
})
DOM.g('#button').addEventListener('mouseover', ()=>{
	a.update(a.value -1);
})
*/
