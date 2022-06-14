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
	type =''
	name =''
	value ={}
	event ={}
	constructor({type}){
		this.type = type;
	}
}

class Loop extends Minif{
	constructor(){
		super({type: 'loop'});
	}
	setName(name){ this.name=name; }
	each(iteratee){
		for(let i=0; i<iteratee; i++){
			console.log(i);
		}
	}
}
class Loop1 extends Loop{
	constructor(){
		super();

		this.setName('loop1');
		this.each(5);
	}
}
const l = new Loop1();
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
