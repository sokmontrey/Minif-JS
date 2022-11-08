# Minif-JS

## Mini Javascript front-end Framework (sort of).

Originally created for a school building website assignment. Minif-JS is a framework that is entirely based in the front-end code base and without any complited bundle thingy.
MinifJS was meant to have Reactive State Management, Loop, and Condition for a simple dynamic website with a scalable source code. But I continue to work on this project to improve my Javascript skill and hopefully gain some knowlegdge in pattern design.

The website that was built with MinifJS V2: [Emery Sport](https://emerysport.netlify.app) (Work best with desktop resolution).

> [!NOTE]
> Please note that MinifJS is not an efficient solution for a large code base. It is just for the productivity in a small project. Like my school assignment, for example, where everything have to be in the front end side. Vanilla JS would do, but Minif can do more with less code.

---

## How can I use Minif?

1. Import (with `defer` attibute) `dom.js` and `dsm.js` in this specific order: `dom.js` -> `dsm.js`
2. Import any of the following MinifClass for your requirement:
   - reactive.js : for reactive state
   - loop.js : require reactve.js, for reactive loop
   - listener.js : for managing interactivity with event listener
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

## How to use MinifJS
By using DSM or Dom Syntax Manager (I should use a better name) algorithms, it is easier to communicate between Javascript and HTML with less code.

DSM is not a part of developer interface. What MinifJS offers you, is the **MinifClasses**.

## MinifClass
List of MinifClass:
> [Reactive](#Reactive)

### Reactive
### Loop
### Listener
