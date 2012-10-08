var collectionObj = require('Neuro/src/collection/main'),
    Model = require('Neuro/src/model/main').Model,
    Observer = require('./observer').Observer,
    Mixins = require('../mixins/observer');

var Collection = new Class({
    Extends: collectionObj.Collection,

    Implements: [Mixins.observer],

    options: {
        Prefix: '',
        Model: {
            constructor: Model
        }
    },

    setup: function(models, options){
        this.setPrefix(this.options.Prefix);

        this.setupUnit();

        Observer.decorate(this);

        this.parent(models, options);

        return this;
    }
});

collectionObj.Collection = exports.Collection = Collection;