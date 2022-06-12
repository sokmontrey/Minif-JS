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

class ComponentManager{
	_hideAllComponent(){
		const elements = dom.getWithAttribute('component');
		for(let one of elements) dom.hideElement(one);
	}
	_removeAllUser(){
		const elements = dom.getWithAttribute('use');
		for(let one of elements) one.innerHTML = '';
	}
	_replaceAllComponent(){
		const elements = dom.getWithAttribute('component');
		for(let one of elements){
			const com_name = one.getAttribute('component');
			const user_element = dom.getWithAttribute('use', com_name);
			for(let element of user_element) 
				element.innerHTML = one.innerHTML;
		}
	}
	_replaceComponent(page_name){
		const container = dom.getWithAttribute('page', page_name)[0];
		const user_elements = dom.getWithAttribute('use', null, container);
		for(let one of user_elements){
			const com_name = one.getAttribute('use');
			const component = dom.getWithAttribute('component', com_name);
			one.innerHTML = component[0].innerHTML;
		}
	}
	render(page_name=null){
		this._hideAllComponent();
		this._removeAllUser();

		page_name!==null
			? this._replaceComponent(page_name) 
			: this._replaceAllComponent();
	}
}
class PageManager{
	current_page;

	constructor(pages={}, components={}, default_page){
		this.componentManager = new ComponentManager();
		this.pages = pages;
		this.components = components;
		this.current_page = default_page || util.firstKey(pages);
	}
	setPage(pages){ 
		this.pages = pages; 
		this.current_page = util.firstKey(pages);
	}
	setComponent(components){
		this.components = components;
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
	_loadComponentState(){
		const user_elements = dom.getWithAttribute('use');
		const all_components = {};
		for(let one of user_elements)
			all_components[one.getAttribute('use')] = 1;
		for(let c_name in all_components)
			this.components[c_name].loadState();
	}
	render(){
		this._hideAllPage();
		this.componentManager.render(this.current_page);
		this._loadComponentState();
		this.pages[this.current_page].loadState();
		this._showPage();
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
			for(let type of event_types)
				one.addEventListener(type, this.event[e_name]);
		}
	}

	setVar(new_var){
		for(let name in new_var){
			this.var[name] = new_var[name];
			this._updateVar(name);
		}
	}

	setEvent(new_event){
		let method_tobe_reset = '';
		for(let name in new_event){
			if(this.event[name]){
				method_tobe_reset += name + ", ";
			}else{
				this.event[name] = new_event[name];
				this._updateEvent(name);
			}
		}
		if(method_tobe_reset.length) 
			throw `${method_tobe_reset}cannot be set again`;
	}
	loadState(){}
}

class Home extends Component{
	constructor(){ super(); }
	loadState(){
		this.setEvent({
			toHome: ()=>{
				pageManager.changeRouteTo('home');
			},
			toView: ()=>{
				pageManager.changeRouteTo('view');
			}
		});
	}
}
class View extends Component{
	constructor(){ super(); }
}

class Topbar extends Component{
	constructor(){ super(); }
}

const pageManager = new PageManager();
pageManager.setPage({
	home: new Home(),
	view: new View(),
})
pageManager.setComponent({
	topbar: new Topbar()
});
pageManager.render();

