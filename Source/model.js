var nModel = require('Neuro/cjs/Model').Model,
    Unit = require('Company').Unit;

var Model = exports.Model = new Class({
    Extends: nModel,

    Implements: [Unit],

    options: {
        Prefix: ''
    },

    setup: function(data, options){
        this.parent(data, options);

        // a unique prefix should always be set
        this.setPrefix(this.options.Prefix || String.uniqueID());

        this.setupUnit();

        Unit.decorate(this);

        return this;
    }
});