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
}
const dom = new DOM();

class Util{
	firstKey(Obj){
		for(let key in Obj) return key;
	}
}
const util = new Util();

class PageManager{
	_current_page;

	constructor(pages={}, default_page){
		this._pages = pages;
		this._current_page = default_page || util.firstKey(pages);
	}
	getPage(name, new_page){
		this._pages[name] = new_page;
	}
	setPage(pages){
		this._pages = new_page;
	}

	_hideAllPage(){
		const all_pages = dom.getWithClass('$page');
		for(let one of all_pages){
			one.style.visibility = 'hidden';
			one.style.display = 'none';
		}
	}
	changePageTo(new_page){
		this._current_page = new_page;
		//TODO: reload
	}
	render(){
		this._hideAllPage();
		this._pages[this._current_page].render();
	}
}

class Page{
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
}
class Home extends Page{
	constructor(){ 
		super(); 

		this.setEvent({
			updateA: ()=>{
				this.setVar({a: this.var.a + 1}); 
			}
		});
	}
	render(){
		this.setVar({
			a: 2
		});
	}
}

const pageManager = new PageManager({
	home: new Home()
});
pageManager.render();

