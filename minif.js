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
	constructor({type, name}){
		this.type = type;
		this.name = name;
	}
	getElement(){
		return dom.getWithAttribute(this.type, this.name);
	}
}
class Component extends Minif{
	value={}
	event;

	constructor({name, type}){ 
		super({type: type || 'component', name: name}); 
		this._getEvent();
		this._attachEvent();
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
	setValue(new_val){
		for(let val_name in new_val) 
			this.value[val_name] = new_val[val_name];
		this._updateValue();
	}
}
class Home extends Component{
	constructor(){
		super({name: 'home', type: 'page'});
		this.setValue({a:1});
	}
	setEvent(){
		return {
			updateA: ()=>{
				this.setValue({a: this.value.a +1})
			}
		}
	}
}
new Home();

class Loop extends Minif{
	inner;
	constructor({name}){
		super({type: 'Loop', name: name});

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
}
const l = new Loop({name: 'loop1'});
l.each({a:1, b:2}, (value, index)=>{
	return { v: value, i: index };
});
