class Listener{
	_name;
	_listener;
	_parent_dom;
	constructor(name='', listener=()=>{}, parent_dom=document){
		if(!name) return;

		this._name = name;
		this.setListener(listener);
		this._load();
	}
	setListener(listener=()=>{}){ this._listener = listener; }
	setParentDom(parent_dom){this._parent_dom = parent_dom;}
	_load(){
		DSM.addEventListener(this._name, this._listener, this._parent_dom);
	}
	get name(){return this._name}
	get listener(){return this._listener}
}

