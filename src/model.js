var Neuro = require('Neuro');

var Observer = require('./observer'),
    Mixins = require('../mixins/observer');

var Model = new Class({
    Extends: Neuro.Model,

    Implements: [Mixins.observer],

    options: {
        Prefix: ''
    },

    setup: function(data, options){
        this.parent(data, options);

        // a unique prefix should always be set
        this.setPrefix(this.options.Prefix || String.uniqueID());

        this.setupUnit();

        /**
         * Decorating the instance so that Event methods will trigger
         * Observer subscribe/unsubscribe/publish methods
         */
        Observer.decorate(this);

        return this;
    }
});

module.exports = Model;