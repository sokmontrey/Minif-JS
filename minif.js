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
		const element = this.getWithAttribute(attr_type, null, parent)[0]
		const object = JSON.parse(element.getAttribute('args'));
		for(let key in object){
			object[key] = new_object[object[key]];
		}
		element.setAttribute(attr_type, JSON.stringify(object));
	}
	setValue(parent=document,attr_name, value){
		const elements = this.getWithAttribute('value', attr_name, parent);
		for(let one of elements) one.innerHTML = value;
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

/*
 template -> replace
*/
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
	_attachEvent(){
		const elements = this.getElement();
		for(let e_name in this.event){
			for(let one of elements){
				const e_elements = dom.getWithAttribute('event', e_name, one);
				for(let each of e_elements) {
					const e_type = each.getAttribute('on');
					each.removeEventListener(e_type, this.event[e_name]);
					each.addEventListener(e_type, this.event[e_name]);
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
class Home extends Component{
	constructor(){
		super();
		this.setName('home');
		this.setType('page');
	}
	load(){
		this.setValue({a: this.value.a + 1})
	}
	setEvent(){
		return {
			updateA: ()=>{
				this.setValue({a: this.value.a +1})
			}
		}
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
		this._storeInnerHTML();
		this._removeInnerHTML();
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
	_push(object){
		const element = new DOMParser()
			.parseFromString(`<div>${this.inner}</div>`, 'text/xml')
			.firstChild;

		this._insertVariable(element, object);
		this._replaceArgs(element, object);

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
		//TODO: use switch
		if(this.iteration_type === 'each')
			this._each(this.iteratee, this.callback);
	}
}

class MinifControl{
	pages;
	components;
	loops;
	constructor(){
	}
	setLoops(loops={}){
		this.loops = loops;
	}
	setComponents(components=[]){
		this.components = components;
	}
	setPages(pages=[]){
		this.pages = pages;
	}

	_setNameAndRender(component){
		for(let name in component){
			component[name].setName(name);
			component[name].render();
		}
	}
	_runLoop(){
		this._setNameAndRender(this.loops);
	}
	_runComponent(){
		this._setNameAndRender(this.components);
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
	run(){
		this._runLoop();
		this._replaceTemplate();
		this._runComponent();
		this._useArgsNoComponent();
	}
}

class App{
	constructor(){
		const loop = new Loop();
		loop.each({a:1, b:2, c:3}, (value, index)=>{
			return { v: value, i: index };
		});

		const control = new MinifControl();
		control.setPages(['home', 'view']);
		control.setLoops({'loop1': loop});
		control.setComponents({'home': new Home});
		control.run();
	}
}

new App();
