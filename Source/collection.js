var nCollection = require('Neuro/cjs/Collection'),
    Unit = require('Company').Unit;

var Collection = exports.Collection = new Class({
    Extends: nCollection,

    Implements: [Unit],

    options: {
        Prefix: ''
    },

    setup: function(models, options){
        this.setPrefix(options.Prefix || this.options.Prefix);

        this.setupUnit();

        Unit.decorate(this);

        this.parent(models, options);

        return this;
    }
});