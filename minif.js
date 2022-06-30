const DOM = (function(){
	return {
		getWithClass:(class_name, element=document)=>{
			return element.getElementsByClassName(class_name);
		},
		getWithId:(id, element=document)=>{
			return element.getElementById(id);
		},
		getWithAttribute:(attr_name, value=null, element=document)=>{
			const attr = `[${attr_name}${value!==null?`="${value}"`:''}]`;
			return element.querySelectorAll(attr);
		},
		getWithTag:(tag_name, element=document)=>{
			return element.getElementsByTagName(tag_name);
		},
		getAttribute:(element, attribute_name)=>{
			return element.getAttribute(attribute_name).split(' ');
		},
		replaceProperty:(parent=document,attr_type, new_object)=>{
			const element = this.getWithAttribute(attr_type, null, parent)[0];
			if(element === undefined) return;
			const args = element.getAttribute(attr_type);
			const object = JSON.parse(args);
			for(let key in object){
				if(typeof object[key] !== "object")
					object[key] = new_object[object[key]] || object[key];
				else{
					for(let key2 in object[key])
						object[key][key2] = new_object[object[key][key2]] || object[key][key2];
				}
			}
			element.setAttribute(attr_type, JSON.stringify(object));
		},
		setValue:(parent=document,attr_name, value)=>{
			const elements = this.getWithAttribute('value', attr_name, parent);
			for(let one of elements) one.innerHTML = value;
		},
		setStyle:(element=null, style_name, value)=>{
			if(element===null) return;
			element.style[style_name] = value;
		},
		hideElement: (element)=>{
			element.style.visibility = 'hidden';
			element.style.display = 'none';
		},
		showElement: (element)=>{
			element.style.visibility = 'visible';
			element.style.display = 'block';
		}
	}
})();

/*
//test
const r = DOM.getWithAttribute('reactive')[0];
let inn = r.innerHTML;
const m = inn.match(/\(\(.*?\)\)/g);
for(let one of m){
	const key = one.match(/[^(  )]/g);
	inn = inn.replace(one, 
		`<span reactive='${key}'></span>`);
}
r.innerHTML = inn;
*/

const ReactiveController = (function(){
	function insert_span(){
		const all_reactive = DOM.getWithAttribute('reactive');
		for(let one of all_reactive){
			let innerHTML = one.innerHTML;
			const match = innerHTML.match(/\(\(.*?\)\)/g);
			for(let each of match){
				const reactive_name = each.match(/[^(  )]/g);
				innerHTML = innerHTML.replace(each, `<span reactive='${reactive_name}'></span>`);
			}
			one.innerHTML = innerHTML;
		}
	}
	insert_span();

	return ;
})();
//TODO: use Observer pattern
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

		this.subscribe();
		this.initValue();
	}
	subscribe(){
		for(let name in this._subscription)
			this._subscription[name].publisher.subscribe(this, name);
	}
	initValue(){
		for(let name in this._subscription)
			this._value[name] = this._subscription[name].value;
	}
	updateValue(publisher_name, new_value){
		this._value[publisher_name] = new_value;
	}
	renderValue(){
		const reactive = this._reactive;
		const updateFunction = reactive.update_function;
		reactive.setValue(updateFunction(this._value));
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
			subscriber.renderValue();
		})
	}
}

class Reactive{
	_element; _name; _value;
	constructor(
		name=null, 
		initial_value=null,
		update_function=null,
		reactive_publisher=null,
		parent_element=document
	){
		if(!name) return;
		this._name = name;

		this._publisher = new ReactivePublisher();

		this.attach(name, parent_element);
		this.setValue(initial_value);

		this._update_function = update_function;
		if(reactive_publisher){
			this._subscriber = new ReactiveSubscriber(this, reactive_publisher);
		}else{
			this._subscriber = null;
		}
	}

	setValue(value){
		this._value = value;
		this._publisher.publishUpdate(value);
		for(let one of this._element) one.innerHTML = value;
		return this;
	}

	attach(name, parent_element=document){
		this._name = name;
		this._element = DOM.getWithAttribute('reactive', name, parent_element);
		return this;
	}

	get name(){return this._name}
	get value(){return this._value}
	get publisher(){return this._publisher}
	get subscriber(){return this._subscriber}
	get update_function(){return this._update_function}
}

const a = new Reactive('a', 2);
const b = new Reactive('b', 5)
const c = new Reactive('c', 2, ({a, b})=>a+b, [a, b]);
a.setValue(1);
