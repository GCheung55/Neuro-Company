var viewObj = require('Neuro/src/view/main'),
    Observer = require('./observer').Observer,
    Mixins = require('../mixins/observer');

var View = new Class({
    Extends: viewObj.View,

    Implements: [Mixins.observer],

    options: {
        Prefix: ''
    },

    setup: function(options){
        this.parent(options);

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

viewObj.View = exports.View = View;