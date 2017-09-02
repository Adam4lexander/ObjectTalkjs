# ObjectTalkjs
Create javascript objects with multiple prototypes and dynamically change their prototypes as needed. ObjectTalkjs is inspired by a language called ObjectTalk: a pure object oriented language with a very flexible prototypal inheritance system. It seemed like this could be a useful paradigm for solving certain kinds of problems, such as modelling entity component systems for game dev, so I've made this package to explore its uses in javascript.

Other multiple inheritance packages may let you extend multiple objects at instantiation. This package lets you change an objects prototypes at any point in its lifetime. I've provided an extended example below in a gamedev context for when this might be useful.

## Getting Started

ObjectTalkjs can be used as a node module or in the browser. You must create an ObjectTalk object explicitely before you can assign it multiple prototypes. All normal javascript objects won't be affected.

```js
ot = require('object-talk');
otObj = ot.newObject();
```

ObjectTalk objects expose a property called 'prototypes'. This will return a Set of objects, and you may assign to it a Set or an Array.

```js
obj1 = {name: 'foo'};
obj2 = {sayHello: function(){console.log("Hello!")}}
otObj.prototypes = [obj1, obj2];
otObj.prototypes.add({name2: 'bar'});
otObj.prototypes.remove(obj1);
```

Note how we are using plain old javascript objects as prototypes. You are free to use normal objects and ObjectTalk objects together.

### Prerequisites

This package uses the Proxy object introduced in ECMA 6. Proxy objects cannot be polyfilled so transpilers like Babel will not work.

### Installing

If using npm
```bash
npm install object-talk
```

Otherwise you may download the lib/object-talk.js file and load it standalone in a script tag.

### Important concepts

You can create an ObjectTalk object from an existing object like this:
```js
existingObject = {name: 'foo'};
otObj = ot.newObject(existingObject); // This will clone the existing object.
```

If a method is matched on a prototype, 'this' will always be the invocation receiver.
```js
prot = {
	callFunc: function() {
		this.test = 'foo';
	}
}
otObj.prototypes.add(prot);
otObj.callFunc(); // 'test' property is added to otObj and not prot
prot.test;	// will be undefined
```

The prototypes list is scanned from first index to last, if there are multiple prototypes with the same property then the prototype with the earliest index will shadow the others.
```js
prot1 = {name: 'foo'};
prot2 = {name: 'bar'};
otObj.prototypes = [prot1, prot2];
otObj.name; // Will be 'foo'
otObj.prototype = [prot2, prot1];
otObj.name; // Will be 'bar'
```

Object.isPrototypeOf, instanceof and Object.getPrototypeOf will not give meaningful answers with ObjectTalk objects. Instead you can try:
```js
otObj.prototypes.has(prot);
```

Currently this package will allow you to define a prototype graph with cycles in it (a is prototype for b is prototype for c is prototype for a). Doing this will probably lead to a stack overflow. Don't do this.

### Is it performant?

Probably not, this package is mainly intended for experimenting. My guess is that it's performant enough to have some fun with, but I wouldn't use it for anything in production. I plan to do some tests on on its performance soon.

### Example
```js
/* In this example we have a knight and a dragon which are both entities. The knight is able
 * to walk and talk, the dragon is able to fly and roar. If the knight drinks a potion then
 * he is also able to fly temporarily.
 */

const ot = require('object-talk');

// Create the knight and dragon entities as ObjectTalkjs objects.
let knight = ot.newObject({
  name: 'Knight'
});
let dragon = ot.newObject({
  name: 'Dragon'
});

// I've modelled each of the required behaviours: walking, flying etc. as a seperate component
// entity. The dragon and knight may add and remove these components as prototypes when needed.
let altitudeComponent = createAltitudeComponent();
let walkComponent = createWalkComponent();
let talkComponent = createTalkComponent();
let flyComponent = createFlyComponent();
let roarComponent = createRoarComponent();

knight.prototypes = new Set([altitudeComponent, walkComponent, talkComponent]);
dragon.prototypes = new Set([altitudeComponent, flyComponent, roarComponent]);

// Now the knight and dragon should have their behaviours modelled correctly
knight.move();
knight.speak();
knight.stop();

dragon.move();
dragon.speak();
dragon.stop();

// On seeing the dragon the knight drinks a potion of flight.
knight.prototypes.delete(walkComponent);
knight.prototypes.add(flyComponent);
knight.move();
// ..But the potion soon wears off, perhaps it wasn't very strong.
knight.prototypes.delete(flyComponent);
knight.prototypes.add(walkComponent);
knight.move();

// Below are the constructor functions for each of the components. 
function createAltitudeComponent() {
  return {
    get altitude() { return this._altitude !== undefined ? this._altitude : 0; },
    set altitude(value) { this._altitude = value; }
  };
}

function createWalkComponent() {
  
  function checkFalling(){
    if (this.altitude > 0){
      console.log(this.name + " has fallen to the ground... Ouch");
      this.altitude = 0;
      return true;
    } else {
      return false;
    }
  }

  function move(){
    if (!checkFalling.apply(this)) {
      console.log(this.name + " is walking along.");
    }
  }

  function stop(){
    if (!checkFalling.apply(this)) {
      console.log(this.name + " is standing still.");
    }
  }

  return {move, stop};
}

function createFlyComponent() {

  function move(){
    if (this.altitude === 0) {
      console.log(this.name + " has lifted off into the air.");
      this.altitude = 10;
    } else {
      console.log(this.name + " is flying through the air.");
    }
  }

  function stop(){
    if (this.altitude === 0) {
      console.log(this.name + " is perched on the ground.");
    } else {
      console.log(this.name + " has landed on the ground.");
      this.altitude = 0;
    }
  }

  return {move, stop};
}

function createTalkComponent() {
  function speak() { console.log(this.name + " says: `For honour and glory!`"); }
  return {speak};
}

function createRoarComponent() {
  function speak() { console.log("ROOOOAAAAARRRRRR!!!"); }
  return {speak};
}
```

## Author

Adam Alexander - https://twitter.com/AdamAlexandr

## Acknowledgments

* This package is inspired by the ObjectTalk language, I recommend you check it out.