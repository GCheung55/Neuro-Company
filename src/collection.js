var collectionObj = require('Neuro/src/Collection'),
    Model = require('Neuro/src/Model').Model,
    Observer = require('./observer').Observer,
    Mixins = require('../mixins/observer');

var Collection = new Class({
    Extends: collectionObj.Collection,

    Implements: [Mixins.observer],

    options: {
        Prefix: '',
        Model: Model
    },

    setup: function(models, options){
        this.setPrefix( (options && options.Prefix) || this.options.Prefix);

        this.setupUnit();

        Observer.decorate(this);

        this.parent(models, options);

        return this;
    }
});

collectionObj.Collection = exports.Collection = Collection;