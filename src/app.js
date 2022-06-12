class DOM{
	getWithClass(class_name){
		return document.getElementsByClassName(class_name);
	}
	getWithId(id){
		return document.getElementById(id);
	}
	getWithAttribute(attr_name, value=null){
		const attr = `[${attr_name}${value!==null?`="${value}"`:''}]`;
		return document.querySelectorAll(attr);
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

class Util{
	firstKey(Obj){
		for(let key in Obj) return key;
	}
}
const util = new Util();

class PageManager{
	current_page;

	constructor(pages={}, default_page){
		this.pages = pages;
		this.current_page = default_page || util.firstKey(pages);
	}
	addPage(name, new_page){
		this.pages[name] = new_page;
	}
	getPage(name){
		return this.pages[name];
	}
	setPage(pages){
		this.pages = new_page;
	}

	_hideAllPage(){
		const all_pages = dom.getWithAttribute('page');
		for(let one of all_pages) dom.hideElement(one);
	}
	changePageTo(new_page){
		this.current_page = new_page;
		this.render();
	}
	_showPage(){
		const element = dom.getWithAttribute('page', this.current_page);
		dom.showElement(element[0]);
	}
	render(){
		this._hideAllPage();
		this.pages[this.current_page].loadState();
		this._showPage();
	}
}
class ComponentManager{
	_hideAllComponent(){
		const elements = dom.getWithAttribute('component');
		for(let one of elements) one.hideElement(one);
	}
	render(){
	}
}

class Component{
	var = {};
	event = {};

	_updateVar(v_name){
		const elements = dom.getWithAttribute('var', v_name);
		for(let one of elements) one.innerHTML = this.var[v_name];
	}

	_updateEvent(e_name){
		const elements = dom.getWithAttribute('event', e_name);
		for(let one of elements){
			const event_types = one.getAttribute('on').split(' ');
			for(let type of event_types){
				one.addEventListener(type, this.event[e_name]);
			}
		}
	}

	setVar(new_var){
		for(let name in new_var){
			this.var[name] = new_var[name];
			this._updateVar(name);
		}
	}

	isSetEvent = false;
	setEvent(new_event){
		if(this.isSetEvent) throw "'setEvent' method cannot be called twice";

		for(let name in new_event){
			this.event[name] = new_event[name];
			this._updateEvent(name);
		}
		this.isSetEvent = true;
	}
	loadState(){}
}
class Home extends Component{
	constructor(){ 
		super(); 

		this.setEvent({
			updateA: ()=>{
				this.setVar({a: this.var.a + 1}); 
			}
		});
	}
	loadState(){
		this.setVar({
			a: 2
		});
	}
}
class View extends Component{
	constructor(){ 
		super(); 
	}
}

const pageManager = new PageManager({
	home: new Home(),
	view: new View()
});
pageManager.render();

