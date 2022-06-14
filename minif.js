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

class Component{
	type = "component";
	constructor({type}){
		this.type = type;
	}

	_getComponent(){
		dom.getWithTag
	}

}
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
