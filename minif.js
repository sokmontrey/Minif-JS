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
	value ={}
	event ={}
	constructor({type, name}){
		this.type = type;
		this.name = name;
	}
	getElement(){
		if(this.name === null) 
			return dom.getWithTag(this.type);
		return dom.getWithTag(this.type)[this.name];
	}
}

class Component extends Minif{
	constructor({name=null}){
		super({type:'component', name: name});
	}
}

class Loop extends Minif{
	inner;
	constructor({name}){
		super({type: 'loop', name: name});

		this._storeInnerHTML();
		this._removeInnerHTML();
	}

	_storeInnerHTML(){
		this.inner = this.getElement().innerHTML;
	}
	_removeInnerHTML(){
		this.getElement().innerHTML = '';
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

		const old = this.getElement();
		old.innerHTML = old.innerHTML + element.innerHTML;
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
class Loop1 extends Loop{
	constructor({name}){
		super({name: name});

		this.each({a:1, b:2}, (value, index)=>{
			return { v: value, i: index };
		});
	}
}
const l = new Loop1({name: 'loop1'});
/*
class Template extends Minif{
	constructor(name){
		super({ type: 'template', name: name });
	}
}
class Page extends Minif{
	constructor(name){
		super({ type: 'page', name: name });
	}
}
class Component extends Minif{
	constructor(name){
		super({ type: 'component', name: name });
	}
}
*/
/*-----------------------*/

/*
class App{
	constructor(){
		const data = {
			1: {
				a: "a1",
				b: "b1"
			},
			2: {
				a: "a2",
				b: "b2"
			}
		};
	}
}
*/
