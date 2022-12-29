class DSMString{
	DSMString = null;
	constructor(string){
		if(!string) return;
		string = string.split('\n').join(' ');
		const p1 = /(\(\(.*?\)\))/g;
		const p2 = /[(  )]/g;
		const p3 = /\)\)/g;
		//syntax_split: 
		//	"Hello world ((a))" => ["Hello world ", "((a))"]
		const syntax_split = string.split(p1);
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
				? v_split[0].replace(p2,'') 
				: syntax_split[i];
			//remove "))" from update_function
			//and apply decodeHTMLEntity to decode "& > < ' " character
			const update_func = v_split&&v_split[1] 
				? this.decodeHTMLEntity(v_split[1].replace(p3, '')) || null 
				: null;
			result.push({
				value: value,
				is_variable: is_variable,
				update_function: update_func
				? new Function('value', `return (${update_func})(value)`)
				: null
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
	string(value_obj={}){
		var result = "";
		for(let each of this.DSMString){
			if(each['is_variable']){
				const value = value_obj 
					? value_obj[each['value']]
					: undefined 
				result += each['update_function']
					? each['update_function'](value)
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
		this._extractAttribute();
		this._extractInnerHTML();
		this._cleanDSMString();
	}
	_extractAttribute(){
		const element = this.dom_element;
		const element_attrs = DOM.getAllAttribute(element);
		for(let attr_name in element_attrs){
			const attr_dsmstring = new DSMString(element_attrs[attr_name]);
			if(attr_dsmstring.isNull()) continue;
			this.attribute[attr_name] = attr_dsmstring;
		}
	}
	_extractInnerHTML(){
		const element = this.dom_element;
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
			name: this.name,
			variable: this.variable
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
	constructor(name=''){
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

class DSMListenerMap{
	name=null;
	/* {
		name: null,
		dsm_element:{
			type: []
		}
	} */
	dsm_element={};
	constructor(name=''){
		this.name=name;
	}
	addElement(dsm_element, type=''){
		if(!this.dsm_element[type]) this.dsm_element[type] = [];

		this.dsm_element[type].push(dsm_element);
	}
	addListener(listener_func=()=>{}, parent_dom=document){
		for(let event_type in this.dsm_element){
			const dsm_ele_list = this.dsm_element[event_type];
			for(let dsm_element of dsm_ele_list){
				if(!dsm_element.isChildOf(parent_dom)) return;
				const dom_element = dsm_element.dom_element;
				const all_param = DOM.getAttribute(dom_element, 'listenerParam');
				const all_param_obj = new Function(`return ${all_param}`)();
				const param = all_param_obj 
					? all_param_obj[this.name] 
					: {}; 
				dom_element.addEventListener(event_type, (event)=>{
					listener_func(event, param);
				});
			}
		}
	}
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

	const dsm_variable_map = {};
	function add_variable(vars=[], element, isInner=false, attr_name=null){
		if(!vars) return;
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
	
	const dsm_listener_map = {};
	function extract_dsm_listener_ele(element){
		for(let each of element){
			const dom = each.dom_element;
			const listener = DOM.getAttribute(dom, 'listener');
			if(!listener) continue;

			const listener_obj = new Function(`return ${listener}`)();
			for(let event_type in listener_obj){
				const listener_name = listener_obj[event_type];

				if(!dsm_listener_map[listener_name])
					dsm_listener_map[listener_name] = new DSMListenerMap(listener_name);
				
				const listener_map = dsm_listener_map[listener_name];
				listener_map.addElement(each, event_type);
			}
		}
	}

	function update_dsm_map(){
		extract_dsm_element(document);
		extract_dsm_variable(dsm_element);
	}

	update_dsm_map();

	return {
		update: ()=>{
			update_dsm_map();
		},
		getAllVariableMap:()=>{
			return dsm_variable_map;
		},
		getAllEventMap:()=>{
			return dsm_event_map;
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
			//TODO: add internal method in DSMVariableMap
			//method: do all the update
			const element = map.element;
			for(let ele_name in element){
				const each = element[ele_name];
				const dsm_element = each['dsm_element'];
				if(!parent_dom || dsm_element.isChildOf(parent_dom)){
					dsm_element.updateVariable(var_name, value);
					dsm_element.updateDSMString(each['isInnerHTML'], each['attribute']);
				}
			}
		},
		addEventListener:(listener_name, listener_function, parent_dom=document)=>{
			const map = dsm_listener_map[listener_name];
			if(!map) return;
			map.addListener(listener_function, parent_dom);
		}
	}
})();

//TODO: prevent from html injection
