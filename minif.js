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
		const func = new Function('value', `return (${func_def})(value)`);
		return func(value) || '';
	}
	string(variable_obj=null){
		var result = "";
		for(let each of this.DSMString){
			if(each['is_variable']){
				const value = variable_obj
					? variable_obj[each['value']] || ''
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
		for(let attr_name in this.attribute){
			this.updateAttrValue(attr_name, null);
		} 
	}
	updateAttrValue(attr_name, variable_obj=null){
		//TODO: handle undefined dsm string
		const dsm_string = this.attribute[attr_name];
		if(!dsm_string) return;
		const string = dsm_string.string(variable_obj);
		this.dom_element.setAttribute(attr_name, string)
	}
	updateInnerValue(variable_obj=null){
		const dsm_string = this.innerHTML;
		if(!dsm_string) return;
		this.dom_element.innerHTML = dsm_string.string(variable_obj);
	}
	get name(){return this.name}
	get attribute(){return this.attribute} 
	get innerHTML(){return this.innerHTML}
	get all(){
		return {
			attribute: this.attribute,
			innerHTML: this.innerHTML,
			dom_element: this.dom_element,
			name: this.name
		}
	}
}
/*
class DSMVariable{
	name=null;
	value=null;
	//TODO: method that can remove element from a variable
	subscriber_element={};
	constructor(name){
		this.name = name;
	}
	addElement(dsm_element){
		const element_name = dsm_element.name;
		if(this.subscriber_element[element_name]) return;
		this.subscriber_element[element_name] = {
			attr: [],
			inner: false,
			dsm_element: dsm_element,
		};
	}
	addElementAttr(element_name, attr_name){
		this.subscriber_element[element_name]['attr'].push(attr_name);
	}
	setElementInner(element_name, hasInner=false){
		this.subscriber_element[element_name]['inner'] = hasInner;
	}
	updateValue(new_value){
		this.value = new_value;
		this.notifyElement();
	}
	notifyElement(){
		for(let name in this.subscriber_element){
			const subscriber = this.subscriber_element[name];
			const dsm_element = subscriber['dsm_element'];
			//inner
			//TODO: problem: when updating Element we need to know all the variables
			//aka variable obj
			//but if we update from inside we cannot get global var_obj
		}
	}
	get value(){return this.value;}
	get all(){
		return {
			name: this.name,
			value: this.value,
			dsm_element: this.dsm_element
		}
	}
}
*/
class DSM {
	dsm_element = {};
	constructor(parent_element=document){
		this.dsm_element = this._extract_dsm_element(parent_element);
	}
	_extract_dsm_element(parent_element){
		const dsm_elements = {};
		const dsm_dom_element = DOM.getWithAttribute('dsm', null, parent_element);
		for(let i=0; i<dsm_dom_element.length; i++){
			const name = i;
			const element = dsm_dom_element[i]
			dsm_elements[name] = new DSMElement(name, element);
		}
		return dsm_elements;
	}
	/*
	const _dsm_variable = {};
	function _subscribe_to_variable(variables, dsm_element, attr_name=null){
		for(let name of variables){
			if(!_dsm_variable[name]) 
				_dsm_variable[name] = new DSMVariable(name);
			_dsm_variable[name].addElement(dsm_element);
			if(attr_name)
				_dsm_variable[name].addElementAttr(dsm_element.name, attr_name);
			else
				_dsm_variable[name].setElementInner(dsm_element.name, true);
		}
	}
	function _extract_dsm_variable(dsm_element){
		for(let ele_name in dsm_element){
			const attr = dsm_element[ele_name].attribute;
			for(let attr_name in attr){
				const var_names = attr[attr_name].variable();
				_subscribe_to_variable(var_names, dsm_element[ele_name], attr_name);
			}

			const inner = dsm_element[ele_name].innerHTML;
			const var_names = inner ? inner.variable() : null;
			if(!var_names) continue;
			_subscribe_to_variable(var_names, dsm_element[ele_name]);
		}
	}
	_extract_dsm_variable(_dsm_element);
	*/
}
const DSMGlobal = new DSM();
console.log(DSMGlobal)

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
