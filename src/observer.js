var Unit = require('Company').Unit;

var resolvePrefix = function(obj, key){
    var prefix = obj && obj.getPrefix && obj.getPrefix();
    return (!!prefix ? prefix + '.' : '') + key;
};

var Observer = new Class({
    Extends: Unit,

    subscribe: function(key, fn, replay, unit) {
        if (typeof key == 'object'){
            if (typeof fn != 'function') {
                // If fn is an object, then it's the unit
                for (var i in key) this.subscribe(i, key[i], void 0, fn);
            } else {
                // fn becomes the replay, and replay becomes the unit
                for (var i in key) this.subscribe(i, key[i], fn, replay);
            }
        } else {

            // If replay is actually the unit, make it so!
            if (typeof replay == 'object') {
                unit = replay;
            }
            
            !!key && (key = resolvePrefix(unit, key));

            this.parent(key, fn, replay);
        }

        return this;
    },

    unsubscribe: function(key, fn, unit){
        if (typeof key == 'object') {
            // In this scenario, fn is actually the unit
            for (var i in key) this.unsubscribe(i, key[i], fn);
        } else {
            !!key && (key = resolvePrefix(unit, key));

            this.parent(key, fn);
        }
        
        return this;
    }
});

Observer.extend(Unit);

exports.Observer = Observer;