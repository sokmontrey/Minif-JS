# Minif-JS

## Mini Javascript front-end Framework (sort of).

Originally created for a school building website assignment. Minif-JS is a framework that is entirely based in the front-end code base and without any complited bundle thingy.
MinifJS was meant to have Reactive State Management, Loop, and Condition for a simple dynamic website with a scalable source code. But I continue to work on this project to improve my Javascript skill and hopefully gain some knowlegdge in pattern design.

The website that was built with MinifJS V2: [Emery Sport](https://emerysport.netlify.app) (Work best with desktop resolution).

> [!NOTE]
> Please note that MinifJS is not an efficient solution for a large code base. It is just for the productivity in a small project. Like my school assignment, for example, where everything have to be in the front end side. Vanilla JS would do, but Minif can do more with less code.

---

## How can I use Minif?

1. Import (with `defer` attibute) `dom.js` and `dsm.js` in this specific order: `dom.js` $\rightarrow$ `dsm.js`
2. Import any of the [MinifClass](#MinifClass) for your requirement.
3. Import your source code file last.

Example:

```js
    //Madatory
    <script defer src="./dom.js"></script>
    <script defer src="./dsm.js"></script>
    
    //Depend on your need
    <script defer src="./reactive.js"></script>
    <script defer src="./loop.js"></script>
    <script defer src="./minif.js"></script>
    
    //Application code
    <script defer src="./app.js"></script>
```

---

## How does MinifJS works?
By using DSM or Dom Syntax Manager (I should have a better name) algorithms, it is easier to communicate between Javascript and HTML with less code.

DSM is not a part of developer interface. What MinifJS offers you, is the [**MinifClasses**](#MinifClass).

---

## MinifClass
List of MinifClass:
1. [Reactive](#Reactive)
2. [Loop](#Loop)
3. [Listener](#Listener)

Important term:
> - dsm_name: are string argument for MinifClass that let Javascript talk with HTML

### Reactive
Create Reactive:
```js
const reactive_obj = new Reactive(
    dsm_name, //String
    initial_value, //Any
    reactive_publisher, //Object of Reactive with custom name as key
    update_function, //Function
    parent_dom //DOM
);

//update reactive value
reactive_obj.update(new_value);
//get reactive value
console.log(reactive_obj.value);
```
**Simplest Reactive Example**

```js
//app.js
const reactive_obj = new Reactive('dsm_name', 'Hello world');
const reactive_obj2 = new Reactive('dsm_name2', 'visible')
```

After the Reactive is created, we can use it in HTML by:
```html
<!-- in InnerHTML -->
<h1>((dsm_name))</h1>

<!-- in Attribute -->
<h2 style='visibility: ((dsm_name2));'>Hello world</h2>
```

Changing the reactive value by:
```js
//app.js
reactive_obj.update('GoodBye');
//this will automatically update the HTML content
```

**Javascript code that react Reactive (using onUpdate)**

Using `Reactive.value` will return "one-time" value. It will not update when the `Reactive.update()` is called.

To create a Javascript code that will react to a Reactive, `Reactive.setOnUpdate(callback)` can be used. The `callback` function will be called everytime the reactive is update

```js
Reactive.setOnUpdate((old_value, new_value, reactive)=>{});
```

**Reactive that react to other Reactive (using Observer)**

>Observer is a design pattern that objects listen to the others for the update.

Reactive has a built-in observer constructor that let you create a reactive object that listen to a specific reactive.

```js
const a = new Reactive('A', 1);
const b = new Reactive('B', 0, {'a': a}, ({a})=>{return a + 1});
//b is initiated to 0. But when we update a, b will be become a + 1
const c = new Reactive('C', 0, {'a': a, 'b':b}, ({a, b})=>{return a * b});
//c is initiated to 0 and will update to a * b everytime either a or b is update.
```

- Reactive `b` is the subscriber or listener of Reactive `a`.
- Reactive `c` is the subscriber of Reactive `b` and `c`.

In reactive_publisher argument `{'a': a}`, `'a'` is your custom name that will use as parameter for the callback `update_function`. The return value of this callback function will go to update the **subscriber** reactive value.

You can also use array as reactive_publisher argument.

```js
const a = new Reactive('A', 0);
const b = new Reactive('B', 0, [a], ({A})=>{ return A + 1; });
const c = new Reactive('C', 0, [a,b], ({A,B})=>{ return A * B; });
```

In this case, Minif will use **publisher** reactive's dsm_name as the parameter hashmap key. So, the parameter of the callback, we have to use the publisher dsm_name instead.

Here is how the callback `update_function` parameter works. 
> NOTE: this is just a simplification. Minif code, under the hood, does not work like this.

---
### Loop
---
### Listener
