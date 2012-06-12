var nCollection = require('Neuro/cjs/Collection').Collection,
    Model = require('./Model').Model,
    Unit = require('Company').Unit;

var Collection = exports.Collection = new Class({
    Extends: nCollection,

    Implements: [Unit],

    options: {
        Prefix: '',
        Model: Model
    },

    setup: function(models, options){
        this.setPrefix( (options && options.Prefix) || this.options.Prefix);

        this.setupUnit();

        Unit.decorate(this);

        this.parent(models, options);

        return this;
    }
});