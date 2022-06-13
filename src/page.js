const util = new Util();
const dom = new DOM();
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
