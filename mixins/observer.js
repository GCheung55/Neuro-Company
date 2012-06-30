var Observer = require('../src/observer');

var fn = function(){
    var args = Array.from(arguments);
    args.push(this);
    this.parent.apply(this, args);

    return this;
};

exports.observer = new Class({
    Extends: Observer,

    subscribe: fn,

    unsubscribe: fn
});