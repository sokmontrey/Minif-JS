# Minif-JS

## Mini Javascript front-end Framework (sort of).
Originally created for a school building website assignment. Minif-JS is a framework that is entirely based in the front-end code base and without any complited bundle thingy.
MinifJS was meant to have Reactive State Management, Loop, and Condition for a simple dynamic website with a scalable source code. But I continue to work on this project to improve my Javascript skill and hopefully gain some knowlegdge in pattern design.

The website that was built with MinifJS V2: [Emery Sport](https://emerysport.netlify.app) (Work best with desktop resolution).

---

## How can I use Minif?

1. Import all the JS code from src in this specific order (with `defer` attibute): 
  1.1. dom.js
  1.2. dsm.js
2. Import any of the following MinifClass for your requirement:
    - reactive.js : for reactive state
    - loop.js : require reactve.js, for reactive loop
    - listener.js : for managing interactivity with event listener
3. Import your source code file after.

## How does Minif works?
DSM (dom syntax manager) is created in the purpose of having custom syntax in HTML. This object is essential for the other feature to work.

Fundamentally, you can create object from any of the MinifClass in your javascript code, then you can change the HTML value by using corresponding DSM syntax.

For example in Javascript:
```js
const a = new Reactive('A', 5);
```
Then in HTML:
```html
<h1 dsm>((A))</h1>
```
In this example, Minif will replace any ((A)) with the value of Reactive "a" (which is 5).

The attribute "dsm" is there to noticfy DSM object, where look for MinifClass.

Other MinifClasses are also having the same pattern.

### Reactive
```js
new Reactive('a', 10);
new Reactive('b', "blue");
```
```html
<h1 dsm>((a))</h1>
<h2 style='background-color: ((b));' dsm>Hello world</h2>
```

---

### Loop
```js
new Loop('loop', [1,2,3], (value)=>{
    return `<li>${value}</li>`;
});
```
```html
<ul dsm>((loop))</ul>
```

---

### Listener
```js
new Listener('update', ({a})=>{ 
  console.log(a); 
});
```
```html
<button listener="{'click': 'updateA'}" 
  listenerParam="{'updateA': {a: 5}}" dsm>
  Click
</button>
```

TODO:
- [] Creating Listener
