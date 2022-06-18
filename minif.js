//TODO: set style from component state
class DOM{
	getWithClass(class_name, element=document){
		return element.getElementsByClassName(class_name);
	}
	getWithId(id, element=document){
		return element.getElementById(id);
	}
	getWithAttribute(attr_name, value=null, element=document){
		const attr = `[${attr_name}${value!==null?`="${value}"`:''}]`;
		return element.querySelectorAll(attr);
	}
	getWithTag(tag_name, element=document){
		return element.getElementsByTagName(tag_name);
	}
	getAttribute(element, attribute_name){
		return element.getAttribute(attribute_name).split(' ');
	}
	replaceProperty(parent=document,attr_type, new_object){
		const element = this.getWithAttribute(attr_type, null, parent)[0];
		if(element === undefined) return;
		const args = element.getAttribute(attr_type);
		const object = JSON.parse(args);
		for(let key in object){
			object[key] = new_object[object[key]] || object[key];
		}
		element.setAttribute(attr_type, JSON.stringify(object));
	}
	setValue(parent=document,attr_name, value){
		const elements = this.getWithAttribute('value', attr_name, parent);
		for(let one of elements) one.innerHTML = value;
	}
	setStyle(element=null, style_name, value){
		if(element===null) return;
		element.style[style_name] = value;
	}
	hideElement(element){
		element.style.visibility = 'hidden';
		element.style.display = 'none';
	}
	showElement(element){
		element.style.visibility = 'visible';
		element.style.display = 'block';
	}
}
const dom = new DOM();

class Minif{
	type;
	name;

	setName(name){ this.name = name || null; }
	setType(type){ this.type = type || 'component'; }
	getElement(){
		return dom.getWithAttribute(this.type, this.name);
	}
}

class Component extends Minif{
	value={}
	event;
	is_render = false;

	render(){ 
		this._getEvent();
		this._detachEvent();
		this._attachEvent();

		this._getArgs();
		this.load();

		this._updateValue(); 
		this.is_render = true;
	}
	_getArgs(){
		const elements = this.getElement();
		for(let one of elements){
			const args= one.getAttribute('args');
			if(args === null) continue;
			const args_object = JSON.parse(args);
			this.value = {...this.value, ...args_object};
		}
	}
	_getEvent(){ this.event = this.setEvent(); }
	_detachEvent(){
		const elements = this.getElement();
		for(let one of elements){
			const e_elements = dom.getWithAttribute('event', null, one);
			for(let each of e_elements) {
				each.replaceWith(each.cloneNode(true));
			}
		}
	}
	_attachEvent(){
		const elements = this.getElement();
		for(let one of elements){
			const e_element = dom.getWithAttribute('event', null, one);
			for(let each of e_element){
				var e = each.getAttribute('event'),
					e_obj = JSON.parse(e),
					e_args = each.getAttribute('event_args'),
					e_args_obj = JSON.parse(e_args);

				for(let type in e_obj){
					const listener = this.event[e_obj[type]];
					listener 
						? each.addEventListener(type, ()=>{
							listener(e_args_obj[e_obj[type]]);
						}) 
						: null;
						//TODO: create error handling 
				}
			}
		}
	}
	_updateValue(){
		const elements = this.getElement();
		for(let val_name in this.value){
			for(let one of elements){
				const val_elements = dom.getWithAttribute('value', val_name, one);
				for(let each of val_elements) each.innerHTML = this.value[val_name];
			}
		}
	}
	setEvent(){ return null; }
	load(){return null}
	setValue(new_val){
		this.value = {...this.value, ...new_val}
		if(this.is_render) this._updateValue();
	}
}

class Loop extends Minif{
	inner;
	iteratee;
	callback;
	iteration_type = 'each';
	constructor(){
		super();
		this.setType('loop');
	}

	_storeInnerHTML(){
		const elements = this.getElement();
		//TODO: store this.inner differently for different element
		for(let one of elements) this.inner = one.innerHTML;
	}
	_removeInnerHTML(){
		const elements = this.getElement();
		for(let one of elements) one.innerHTML = '';
	}
	_insertVariable(element, object){
		for(let value_name in object)
			dom.setValue(element, value_name, object[value_name]); 
	}
	_replaceArgs(element, object){
		dom.replaceProperty(element, 'args', object);
	}
	_replaceStyle(element, object){
		dom.replaceProperty(element, '_style', object);
	}
	_replaceEventArgs(element, object){
		dom.replaceProperty(element, 'event_args', object);
	}
	_push(object){
		const element = new DOMParser()
			.parseFromString(`<div>${this.inner}</div>`, 'text/xml')
			.firstChild;

		this._insertVariable(element, object);
		this._replaceArgs(element, object);
		this._replaceStyle(element, object);
		this._replaceEventArgs(element, object);

		const elements = this.getElement();
		for(let one of elements) one.innerHTML = one.innerHTML + element.innerHTML;
	}

	each(iteratee, callback){
		this.iteratee = iteratee;
		this.callback = callback;
		this.interation_type = 'each';
	}
	_each(iteratee, callback){
		if(typeof iteratee === 'object' && iteratee !== null){
			for(let i in iteratee){
				this._push(callback(iteratee[i], 
					iteratee.constructor===Array?parseInt(i):i));
			}
		}else{
			for(let i=0; i<iteratee; i++)
				this._push(callback(i, i));
		}
	}
	render(){
		this._storeInnerHTML();
		this._removeInnerHTML();
		//TODO: use switch
		if(this.iteration_type === 'each')
			this._each(this.iteratee, this.callback);
	}
}

class MinifControl{
	pages;
	components;
	loops;

	current_page;
	constructor(){ }
	getCurrentElement(){
		return dom.getWithAttribute('page', this.current_page)[0];
	}
	setLoops(loops={}){
		this.loops = loops;
	}
	setComponents(components=[]){
		this.components = components;
	}
	setPages(pages=[]){
		this.pages = pages;
		for(let name of pages) {
			this.current_page = name;
			break;
		}
	}

	_runLoop(){
		for(let name in this.loops){
			this.loops[name].setName(name);
			this.loops[name].render();
		}
	}
	_runComponent(){
		for(let name in this.components){
			this.components[name].setName(name);
			this.components[name].render();
		}
	}
	//TODO: remove innerHTML & replaceTemplate to the user 
	//only if they are in the page that is rendering
	//TODO: or just create a reset method that reset everything
	_replaceTemplate(){
		const all_user = dom.getWithAttribute('use');
		for(let one of all_user){
			var template_name = one.getAttribute('use');
			const template = dom.getWithAttribute('template', template_name);
			one.innerHTML = template[0].innerHTML;
		}
	}
	_useStyle(){
		const all_style = dom.getWithAttribute('_style');
		for(let one of all_style){
			const value = one.getAttribute('_style');
			const obj = JSON.parse(value);
			for(let s_name in obj)
				dom.setStyle(one, s_name, obj[s_name]);
		}
	}
	_useArgsNoComponent(){
		const all_args = dom.getWithAttribute('args');
		for(let one of all_args){
			if(one.getAttribute('component')!==null) continue;
			const value = one.getAttribute('args');
			const obj = JSON.parse(value);
			for(let v_name in obj)
				dom.setValue(one, v_name, obj[v_name]);
		}
	}
	changePage(new_page){
		this.current_page = new_page;
		this.run();
	}
	_hideAllPage(){
		const elements = dom.getWithAttribute('page');
		if(elements===undefined) return;
		for(let one of elements) dom.hideElement(one);
	}
	_showCurrentPage(){
		const element = this.getCurrentElement();
		if(element===undefined) return;
		dom.showElement(element);
	}
	run(){
		this._hideAllPage();
		this._showCurrentPage();

		this._runLoop();
		this._replaceTemplate();
		this._runComponent();
		this._useArgsNoComponent();
		this._useStyle();
	}
}

class Home extends Component{
	constructor(){
		super();
		this.setName('home');
		this.setType('component');
	}
	load(){
		this.setValue({a: 1});
	}
	setEvent(){
		return {
			updateA1: ({add})=>{
				this.setValue({a: this.value.a +add});
			}
		}
	}
}
new Home().render();
