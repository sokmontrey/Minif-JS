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
		checkDescendant:(parent, child)=>{
			let node = child.parentNode;
			while (node) {
				if (node === parent) {
					return true;
				}
				node = node.parentNode;
			}
			return false;
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
		const func = new Function('value', `return (${func_def})(value)`);
		return func(value) || '';
	}
	string(value_obj={}){
		var result = "";
		for(let each of this.DSMString){
			if(each['is_variable']){
				const value = value_obj 
					? value_obj[each['value']]
					: undefined 
				result += each['update_function'] 
					? this.useUpdateFunction(each['update_function'], value)
					: value
			}else result += each['value'] || '';
		}
		return result;
	}
	variable(){
		const result = [];
		for(let each of this.DSMString){
			if(each['is_variable']) result.push(each['value']);
		}
		return result;
	}
}
class DSMElement{
	name=null;
	dom_element=null;
	attribute={};
	innerHTML=null;
	variable={};
	constructor(name, dom_element){
		this.name = name;
		this.dom_element = dom_element;
		this._extractAttribute(dom_element);
		this._extractInnerHTML(dom_element);
		this._cleanDSMString();
	}
	_extractAttribute(element){
		const element_attrs = DOM.getAllAttribute(element);
		for(let attr_name in element_attrs){
			const attr_dsmstring = new DSMString(element_attrs[attr_name]);
			if(attr_dsmstring.isNull()) continue;
			this.attribute[attr_name] = attr_dsmstring;
		}
	}
	_extractInnerHTML(element){
		const inner_dsmstring = new DSMString(element.innerHTML);
		this.innerHTML = inner_dsmstring.isNull() ? null : inner_dsmstring;
	}
	_cleanDSMString(){
		this.updateInnerValue(null);
		for(let attr_name in this.attribute)
			this.updateOneAttrValue(attr_name, null);
	}
	isChildOf(parent_element=document){
		return DOM.checkDescendant(parent_element, this.dom_element)
	}
	updateOneAttrValue(attr_name, variable){
		//TODO: handle undefined dsm string
		const dsm_string = this.attribute[attr_name];
		if(!dsm_string) return;
		const string = dsm_string.string(variable);
		this.dom_element.setAttribute(attr_name, string)
	}
	updateAttrValue(attr_names=[], variable=this.variable){
		for(let attr_name of attr_names){
			this.updateOneAttrValue(attr_name, variable)
		}
	}
	updateInnerValue(variable=this.variable){
		const dsm_string = this.innerHTML;
		if(!dsm_string) return;
		this.dom_element.innerHTML = dsm_string.string(variable);
	}
	updateVariable(var_name, value){
		this.variable[var_name] = value;
	}
	updateDSMString(isInnerHTML=false, attribute=[]){
		if(isInnerHTML) this.updateInnerValue();
		this.updateAttrValue(attribute);
	}
	get name(){return this.name}
	get attribute(){return this.attribute} 
	get innerHTML(){return this.innerHTML}
	get dom_element(){return this.dom_element}
	get all(){
		return {
			attribute: this.attribute,
			innerHTML: this.innerHTML,
			dom_element: this.dom_element,
			name: this.name
		}
	}
}
class DSMVariableMap{
	//DSMVariableMap use to map variable-name 
	//to DSMElements that has that variable in it
	name=null;
	/* {
		dsm_element: element,
		attribute: [],
		isInnerHTML: false,
	} */
	dsm_element = {};
	constructor(name){
		this.name = name;
	}
	addElement(dsm_element){
		const element_name = dsm_element.name;
		if(this.dsm_element[element_name]) return;
		this.dsm_element[element_name] = {
			dsm_element: dsm_element,
			isInnerHTML: false,
			attribute: []
		}
	}
	setIsInnerHTML(element_name, isInnerHTML=false){
		if(isInnerHTML === null) return;
		const element = this.dsm_element[element_name];
		//error handling
		element.isInnerHTML = isInnerHTML;
	}
	addAttribute(element_name, new_attribute){
		const element = this.dsm_element[element_name]
		element['attribute'].push(new_attribute);
	}
	get element(){return this.dsm_element}
}
const DSM = (function(){
	const dsm_element = [];
	function extract_dsm_element(parent_element){
		const dsm_dom_ele = DOM.getWithAttribute('dsm', null, parent_element);
		for(let i=0; i<dsm_dom_ele.length; i++){
			const name = i;
			const element = dsm_dom_ele[i];
			dsm_element.push(new DSMElement(name, element));
		}
	}
	extract_dsm_element(document);

	const dsm_variable_map = {};
	function add_variable(vars=[], element, isInner=false, attr_name=null){
		for(let var_name of vars){
			if(!dsm_variable_map[var_name])
				dsm_variable_map[var_name] = new DSMVariableMap(var_name); 
			
			const var_map = dsm_variable_map[var_name];
			var_map.addElement(element);
			isInner 
				? var_map.setIsInnerHTML(element.name, true) 
				: attr_name 
					? var_map.addAttribute(element.name, attr_name) 
					: null;
		}
	}
	function extract_dsm_variable(element){
		for(let each of element){
			for(let attr_name in each.attribute){
				const attr_dsm_string = each.attribute[attr_name];
				const attr_vars = attr_dsm_string.variable();
				add_variable(attr_vars, each, false, attr_name);
			}
			const inner_dsm_string = each.innerHTML;
			const inner_vars = inner_dsm_string 
				? inner_dsm_string.variable() : null;
			add_variable(inner_vars, each, true)
		}
	}
	extract_dsm_variable(dsm_element);

	return {
		getAllMap:()=>{
			return dsm_variable_map;
		},
		getElementChildOf: (parent_dom)=>{
			const result = [];
			for(let element of dsm_element){
				if(element.isChildOf(parent_dom)) result.push(element);
			}
			return result;
		},
		getAllElement: ()=>{
			const result = [];
			for(let element of dsm_element){
				result.push(element);
			}
			return result;
		},
		updateVariable:(var_name, value, parent_dom=null)=>{
			const map = dsm_variable_map[var_name];
			if(!map) return; 
			const element = map.element;
			for(let ele_name in element){
				const each = element[ele_name];
				const dsm_element = each['dsm_element'];
				if(!parent_dom || dsm_element.isChildOf(parent_dom)){
					dsm_element.updateVariable(var_name, value);
					dsm_element.updateDSMString(each['isInnerHTML'], each['attribute']);
				}
			}
		}
	}
})();

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
			subscriber.renderValue();
		})
	}
}
class Reactive{
	_name; _value; _parent_element;
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
	update(value){
		this._value = value;
		this._publisher.publishUpdate(value);
		this._render();
		return this;
	}

	_render(){
		DSM.updateVariable(this._name, this._value, this._parent_element)
	}

	get name(){return this._name}
	get value(){return this._value}
	get publisher(){return this._publisher}
	get subscriber(){return this._subscriber}
	get update_function(){return this._update_function}
}

const a = new Reactive('a', 10);
const b = new Reactive('b', 10);
const c = new Reactive('c', a.value + b.value, [a, b], ({a, b})=>a+b);


