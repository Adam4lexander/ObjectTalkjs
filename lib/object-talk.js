(function( global ){

let handler = {
  get: function(target, name) {
    if (name === 'addPrototype' || name === 'removePrototype'){
      return x => this[name](target, x);
    } else if (name === 'prototypes'){
      return target.__prototypeList;
    } else {
      for (let p of target.__prototypeList){
        let x = p[name];
        if (x !== undefined){
          return x;
        }
      }
    }
    return target[name];
  },
  set: function(target, property, value, receiver) {
    if (property === 'prototypes') {
      if (value instanceof Set) {
        target.__prototypeList = value;
      } else if (value instanceof Array) {
        target.__prototypeList = new Set(value);
      } else {
        throw new Error("prototypes must be Set or Array object");
      }
    } else {
      Reflect.set(target, property, value, receiver);
    }
    return true;
  },
  ownKeys: function(target) {
    keys = [];
    for (let o of target.__prototypeList){
      while (o !== Object.prototype){
        keys = keys.concat(Reflect.ownKeys(o));
        o = Reflect.getPrototypeOf(o);
      }
    }
    keys = keys.concat(['prototypes']);
    return Array.from(new Set(keys));
  }
}

function newObject(from) {
  let p = new Proxy({__prototypeList: new Set()}, handler);
  let o = Object.create(p);
  let _from = typeof from === 'object' ? from : {};
  Object.assign(o, _from);
  if (_from.constructor !== Object){
    o.addPrototype(Object.getPrototypeFor(_from));
  }
  return o;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.newObject = newObject;
} else {
  global.ot = {newObject};
}

})(this);