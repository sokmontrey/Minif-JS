const dom = new DOM();

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

class Component{
	var = {};
	event = {};

	_updateVar(v_name){
		const elements = dom.getWithAttribute('var', v_name);
		for(let one of elements) one.innerHTML = this.var[v_name];
	}

	_removeEvent(e_name){
		const elements = dom.getWithAttribute('event', e_name);
		for(let one of elements){
			const event_types = one.getAttribute('on').split(' ');
			for(let type of event_types){
				one.removeEventListener(type, this.event[e_name]);
			}
		}
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

	setEvent(new_event){
		for(let name in new_event){
			this._removeEvent(name);
			this.event[name] = new_event[name];
			this._updateEvent(name);
		}
	}
	loadState(){}
}
