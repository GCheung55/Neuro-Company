var Observer = require('../src/observer').Observer;

var fn = function(){
    Array.prototype.push.call(arguments, this);

    this.parent.apply(this, arguments);

    return this;
};

exports.observer = new Class({
    Extends: Observer,

    subscribe: fn,

    unsubscribe: fn
});