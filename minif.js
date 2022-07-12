//TODO add doc comment for every methods
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
		getAllAttribute:(element=document)=>{
			const attrs = {};
			element.getAttributeNames().forEach((attr_name)=>{
				return attrs[attr_name] = element.getAttribute(attr_name);
			})
			return attrs;
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

class DSMString{
	DSMString = null;
	constructor(string){
		if(!string) return;
		//syntax_split: 
		//	"Hello world ((a))" => ["Hello world ", "((a))"]
		const syntax_split = string.split(/(\(\(.*?\)\))/g);
		//if there is no "(())" to split
		//length will be 1
		if(syntax_split.length <= 1) return ;
		const result = [];
		for(let i=0; i<syntax_split.length; i++){
			if(!syntax_split[i]) continue;
			//after the split
			//"(())" will always be in i+1 even number
			//ex: "a ((a))" => ["a ", "((a))"]
			//"((a))" => ["", "((a))", ""]
			const is_variable = (i+1)%2===0; 
			//in case there is update_function
			//ex: ((a: (v)=>v+1)),
			//split them by the first ":"
			const v_split = is_variable
				? this.splitFirstColon(syntax_split[i])
				: null;

			//remove "((" & spaces & "))" if variable
			const value = v_split 
				? v_split[0].replace(/[( )]/g,'') 
				: syntax_split[i];
			//remove "))" from update_function
			//and apply decodeHTMLEntity to decode "& > < ' " character
			const update_func = v_split&&v_split[1] 
				? this.decodeHTMLEntity(v_split[1].replace(/\)\)/g, '')) || null 
				: null;
			result.push({
				value: value,
				is_variable: is_variable,
				update_function: update_func
			})
		}
		this.DSMString = result;
	}
	isNull(){return !this.DSMString}
	decodeHTMLEntity(string){
		const txt = document.createElement('textarea');
		txt.innerHTML = string;
		return txt.value;
	}
	splitFirstColon(string){
		let index = null;
		for(let i=0; i<string.length; i++){
			if(string[i] === ':'){
				index = i;
				break;
			}
		}
		const result = index 
			? [string.slice(0, index), string.slice(index+1)]
			: [string];
		return result;
	}
	useUpdateFunction(func_def, value){
		console.log(func_def)
		const func = new Function('value', `return (${func_def})(value)`);
		return func(value);
	}
	string(variable_obj={}){
		var result = "";
		for(let each of this.DSMString){
			if(each['is_variable']){
				const value = variable_obj[each['value']] || ''
				result += each['update_function'] 
					? this.useUpdateFunction(each['update_function'], value)
					: value
			}else result += each['value'] || '';
		}
		return result;
	}
}
class DSMElement{
	DSMElement = {};
	constructor(parent_dom_element=document){
		this.extract(parent_dom_element=document);
	}
	extract(parent_dom_element=document){
		const DSM_DOM_elements = DOM.getWithAttribute('dsm', null, parent_dom_element);
		for(let i=0; i<DSM_DOM_elements.length; i++){
			const each = DSM_DOM_elements[i];

			const attr = {};
			const each_attrs = DOM.getAllAttribute(each);
			for(let attr_name in each_attrs){
				const attr_dsmstring = new DSMString(each_attrs[attr_name]);
				if(attr_dsmstring.isNull()) continue;
				attr[attr_name] = attr_dsmstring;
			}
			
			const inner_dsmstring = new DSMString(each.innerHTML);
			//TODO use different unique name for element
			//to prevent in case of re-extract
			this.DSMElement[i] = {
				attribute: attr,
				innerHTML: inner_dsmstring.isNull() ? null : inner_dsmstring,
				element: each,
			}
		}
	}
	updateAttrValue(ele_name, attr_name, variable_obj={}){
		//TODO: handle undefined dsm string
		const dsm_element = this.DSMElement[ele_name];
		const dsm_string = dsm_element['attribute'][attr_name];
		dsm_element['element'][attr_name] = dsm_string.string(variable_obj);
	}
	updateInnerValue(ele_name, variable_obj={}){
		const dsm_element = this.DSMElement[ele_name];
		const dsm_string = dsm_element['innerHTML'];
		dsm_element['element'].innerHTML = dsm_string.string(variable_obj);
	}
	get all(){
		return this.DSMElement;
	}
}
class DSMVariable{
	DSMVariable = {};
	constructor(DSMElement){
		const all_element = DSMElement.all;
		console.log(all_element[1]['innerHTML'].string({a:1}))

		/* (Irelevent here) convert string to a function with one arg
		const s = "(v)=>v+2";
		const f = new Function('value', `return (${s})(value)`);
		console.log(f(5));
		*/
	}
}

const DSM = (function(){
	const _DSM_element = new DSMElement(document);
	const _DSM_variable = new DSMVariable(_DSM_element);
	return {}
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
	_elements; _name; _value;
	constructor(
		name=null, 
		initial_value=null,
		update_function=null,
		reactive_publisher=null,
		parent_element=document
	){
		if(!name) return;
		this._name = name;
		this._parent_element = parent_element;

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
		this._render();
		return this;
	}
	attach(){
		this._elements = DOM.getWithAttribute(
			'reactive', 
			this._name, 
			this._parent_element
		);
		return this;
	}

	_render(){
		for(let one of this._elements) one.innerHTML = this._value;
	}

	get name(){return this._name}
	get value(){return this._value}
	get publisher(){return this._publisher}
	get subscriber(){return this._subscriber}
	get update_function(){return this._update_function}
}
