var modelObj = require('Neuro/src/model/main'),
    Observer = require('./observer').Observer,
    Mixins = require('../mixins/observer');

var Model = new Class({
    Extends: modelObj.Model,

    Implements: [Mixins.observer],

    options: {
        Prefix: ''
    },

    setup: function(data, options){
        // a unique prefix should always be set
        this.setPrefix(this.options.Prefix || String.uniqueID());

        this.setupUnit();

        /**
         * Decorating the instance so that Event methods will trigger
         * Observer subscribe/unsubscribe/publish methods
         */
        Observer.decorate(this);

        this.parent(data, options);

        return this;
    }
});

modelObj.Model = exports.Model = Model;