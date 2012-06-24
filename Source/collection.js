var Neuro = require('Neuro');

var Observer = require('./observer'),
    Mixins = require('../mixins/observer');

var Collection = new Class({
    Extends: Neuro.Collection,

    Implements: [Mixins.observer],

    options: {
        Prefix: '',
        Model: Neuro.Model
    },

    setup: function(models, options){
        this.setPrefix( (options && options.Prefix) || this.options.Prefix);

        this.setupUnit();

        Observer.decorate(this);

        this.parent(models, options);

        return this;
    }
});

module.exports = Collection;