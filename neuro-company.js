(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    window["Neuro"] = require("0");
})({
    "0": function(require, module, exports, global) {
        var Neuro = require("1");
        Neuro.Observer = require("8").Observer;
        Neuro.Model = require("a").Model;
        Neuro.Collection = require("c").Collection;
        exports = module.exports = Neuro;
    },
    "1": function(require, module, exports, global) {
        var Neuro = require("2");
        Neuro.Model = require("3").Model;
        Neuro.Collection = require("7").Collection;
        exports = module.exports = Neuro;
    },
    "2": function(require, module, exports, global) {
        var Neuro = {
            version: "0.1.8"
        };
        exports = module.exports = Neuro;
    },
    "3": function(require, module, exports, global) {
        var Is = require("4").Is, Silence = require("5").Silence, Connector = require("6").Connector;
        var createGetter = function(type) {
            var isPrevious = type == "_previousData" || void 0;
            return function(prop) {
                var val = this[type][prop], accessor = this.getAccessor(prop), getter = accessor && accessor.get;
                return getter ? getter.call(this, isPrevious) : val;
            }.overloadGetter();
        };
        var Model = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            primaryKey: undefined,
            _data: {},
            _changed: false,
            _changedProperties: {},
            _previousData: {},
            _accessors: {},
            options: {
                primaryKey: undefined,
                accessors: {},
                defaults: {}
            },
            initialize: function(data, options) {
                if (instanceOf(data, this.constructor)) {
                    return data;
                }
                this.setup(data, options);
            },
            setup: function(data, options) {
                this.setOptions(options);
                this.primaryKey = this.options.primaryKey;
                this.setAccessor(this.options.accessors);
                this.__set(this.options.defaults);
                this._resetChanged();
                if (data) {
                    this.set(data);
                }
                return this;
            },
            __set: function(prop, val) {
                var accessor = this.getAccessor(prop), setter = accessor && accessor.set, setterVal;
                if (setter) {
                    setterVal = setter.apply(this, arguments);
                }
                this._changed = true;
                this._data[prop] = this._changedProperties[prop] = setter && setterVal !== null ? setterVal : val;
                return this;
            }.overloadSetter(),
            _set: function(prop, val) {
                var old = this._data[prop], accessor = this.getAccessor(prop), setter = accessor && accessor.set, setterVal;
                switch (typeOf(val)) {
                  case "array":
                    val = val.slice();
                    break;
                  case "object":
                    if (!val.$constructor || val.$constructor && !instanceOf(val.$constructor, Class)) {
                        val = Object.clone(val);
                    }
                    break;
                }
                if (!Is.Equal(old, val)) {
                    this.__set(prop, val);
                }
                return this;
            }.overloadSetter(),
            set: function(prop, val) {
                if (prop) {
                    this._setPreviousData();
                    this._set(prop, val);
                    this.changeProperty(this._changedProperties);
                    this.change();
                    this._resetChanged();
                }
                return this;
            },
            unset: function(prop) {
                var props = {}, len, i = 0, item;
                prop = Array.from(prop);
                len = prop.length;
                while (len--) {
                    props[prop[i++]] = void 0;
                }
                this.set(props);
                return this;
            },
            reset: function(prop) {
                var props = {}, len, i = 0, item;
                if (prop) {
                    prop = Array.from(prop);
                    len = prop.length;
                    while (len--) {
                        item = prop[i++];
                        props[item] = this.options.defaults[item];
                    }
                } else {
                    props = this.options.defaults;
                }
                this.set(props);
                this.signalReset();
                return this;
            },
            get: createGetter("_data"),
            getData: function() {
                var props = this.keys(), obj = {};
                props.each(function(prop) {
                    var val = this.get(prop);
                    switch (typeOf(val)) {
                      case "array":
                        val = val.slice();
                        break;
                      case "object":
                        if (!val.$constructor || val.$constructor && !instanceOf(val.$constructor, Class)) {
                            val = Object.clone(val);
                        }
                        break;
                    }
                    obj[prop] = val;
                }.bind(this));
                return obj;
            },
            _setPreviousData: function() {
                this._previousData = Object.clone(this._data);
                return this;
            },
            getPrevious: createGetter("_previousData"),
            getPreviousData: function() {
                return Object.clone(this._previousData);
            },
            _resetChanged: function() {
                if (this._changed) {
                    this._changed = false;
                    this._changedProperties = {};
                }
                return this;
            },
            change: function() {
                if (this._changed) {
                    this.signalChange();
                }
                return this;
            },
            changeProperty: function(prop, val) {
                if (this._changed) {
                    this.signalChangeProperty(prop, val, this.getPrevious(prop));
                }
                return this;
            }.overloadSetter(),
            destroy: function() {
                this.signalDestroy();
                return this;
            },
            signalChange: function() {
                !this.isSilent() && this.fireEvent("change");
                return this;
            },
            signalChangeProperty: function(prop, newVal, oldVal) {
                !this.isSilent() && this.fireEvent("change:" + prop, [ prop, newVal, oldVal ]);
                return this;
            },
            signalDestroy: function() {
                !this.isSilent() && this.fireEvent("destroy");
                return this;
            },
            signalReset: function() {
                !this.isSilent() && this.fireEvent("reset");
                return this;
            },
            toJSON: function() {
                return this.getData();
            },
            setAccessor: function(key, val) {
                this._accessors[key] = val;
                return this;
            }.overloadSetter(),
            getAccessor: function(key) {
                return this._accessors[key];
            }.overloadGetter(),
            unsetAccessor: function(key) {
                delete this._accessors[key];
                this._accessors[key] = undefined;
                return this;
            },
            spy: function(prop, callback) {
                if (typeOf(prop) == "string" && prop in this._data && typeOf(callback) == "function") {
                    this.addEvent("change:" + prop, callback);
                }
                return this;
            }.overloadSetter(),
            unspy: function(prop, callback) {
                if (typeOf(prop) == "string" && prop in this._data) {
                    this.addEvent("change:" + prop, callback);
                }
                return this;
            }.overloadSetter()
        });
        [ "subset", "map", "filter", "every", "some", "keys", "values", "getLength", "keyOf", "contains", "toQueryString" ].each(function(method) {
            Model.implement(method, function() {
                return Object[method].apply(Object, [ this._data ].append(Array.from(arguments)));
            });
        });
        exports.Model = Model;
    },
    "4": function(require, module, exports, global) {
        (function(context) {
            var toString = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, oldType = window.Type, Is = context.Is = {};
            var Type = window.Type = function(name, object) {
                var obj = new oldType(name, object), str;
                if (!obj) {
                    return obj;
                }
                str = "is" + name, Is[name] = Is.not[name] = Type[str] = oldType[str];
                return obj;
            }.extend(oldType);
            Type.prototype = oldType.prototype;
            for (var i in oldType) {
                if (Type.hasOwnProperty(i) && i.test("is")) {
                    i = i.replace("is", "");
                    Is[i] = Type["is" + i];
                }
            }
            Is["NaN"] = function(a) {
                return a !== a;
            };
            Is["Null"] = function(a) {
                return a === null;
            };
            Is["Undefined"] = function(a) {
                return a === void 0;
            };
            var matchMap = {
                string: function(a, b) {
                    return a == String(b);
                },
                number: function(a, b) {
                    return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
                },
                date: function(a, b) {
                    return +a == +b;
                },
                "boolean": function(a, b) {
                    return this.date(a, b);
                },
                regexp: function(a, b) {
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
            };
            var has = function(obj, key) {
                return obj.hasOwnProperty(key);
            };
            var eq = function(a, b, stack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a.isEqual && Is.Function(a.isEqual)) return a.isEqual(b);
                if (b.isEqual && Is.Function(b.isEqual)) return b.isEqual(a);
                var typeA = typeOf(a), typeB = typeOf(b);
                if (typeA != typeB) {
                    return false;
                }
                if (matchMap[typeA]) {
                    return matchMap[typeA](a, b);
                }
                if (typeA != "object" || typeB != "object") return false;
                var length = stack.length;
                while (length--) {
                    if (stack[length] == a) return true;
                }
                stack.push(a);
                var size = 0, result = true;
                if (typeA == "array") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
                        }
                    }
                } else {
                    if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) return false;
                    for (var key in a) {
                        if (has(a, key)) {
                            size++;
                            if (!(result = has(b, key) && eq(a[key], b[key], stack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                stack.pop();
                return result;
            };
            Is.Equal = function(a, b) {
                return eq(a, b, []);
            };
            (function(obj) {
                var not = {};
                for (var key in obj) {
                    if (has(obj, key)) {
                        not[key] = function(name) {
                            return function(a, b) {
                                return !obj[name].call(obj, a, b);
                            };
                        }(key);
                    }
                }
                obj.not = not;
            })(Is);
        })(typeof exports != "undefined" ? exports : window);
    },
    "5": function(require, module, exports, global) {
        var Silence = new Class({
            _silent: 0,
            silence: function(fnc) {
                this._silent++;
                fnc();
                this._silent--;
                return this;
            },
            isSilent: function() {
                return !!this._silent;
            }
        });
        exports.Silence = Silence;
    },
    "6": function(require, module, exports, global) {
        var uid = String.uniqueID(), $boundFnStr = uid + "_$boundFn";
        var isBound = function(fn) {
            return fn && typeOf(fn[$boundFnStr]) == "function";
        };
        var bindFn = function(fn, to) {
            if (!isBound(fn) && typeOf(fn) == "function") {
                fn[$boundFnStr] = fn.bind(to);
            }
            return fn;
        };
        var getBoundFn = function(fn) {
            return fn[$boundFnStr];
        };
        var processFn = function(type, evt, fn, obj) {
            if (type == "string") {
                fn = obj[fn];
                if (typeOf(fn) == "function") {
                    if (!isBound(fn)) {
                        bindFn(fn, obj);
                    }
                    fn = getBoundFn(fn);
                }
            }
            return fn;
        };
        var mapSubEvents = function(obj, baseEvt) {
            var map = {};
            Object.each(obj, function(val, key) {
                if (key == "*") {
                    key = baseEvt;
                } else {
                    key = baseEvt + ":" + key;
                }
                map[key] = val;
            });
            return map;
        };
        var process = function(methodStr, map, obj) {
            Object.each(map, function(methods, evt) {
                methods = Array.from(methods);
                methods.each(function(method) {
                    var type = typeOf(method);
                    switch (type) {
                      case "object":
                        if (!instanceOf(method, Class)) {
                            process.call(this, methodStr, mapSubEvents(method, evt), obj);
                        }
                        break;
                      case "string":
                      case "function":
                        method = processFn.call(this, type, evt, method, obj);
                        method && this[methodStr](evt, method);
                        break;
                    }
                }, this);
            }, this);
        };
        var curryConnection = function(str) {
            var methodStr = str == "connect" ? "addEvent" : "removeEvent";
            return function(obj, hasConnected) {
                if (obj && typeOf(obj[str]) == "function") {
                    var map = this.options.connector;
                    process.call(this, methodStr, map, obj);
                    !hasConnected && obj[str](this, true);
                }
                return this;
            };
        };
        var Connector = new Class({
            connect: curryConnection("connect"),
            disconnect: curryConnection("disconnect")
        });
        exports.Connector = Connector;
    },
    "7": function(require, module, exports, global) {
        var Model = require("3").Model, Silence = require("5").Silence, Connector = require("6").Connector;
        var Collection = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            _models: [],
            _bound: {},
            _Model: Model,
            length: 0,
            primaryKey: undefined,
            options: {
                primaryKey: undefined,
                Model: undefined,
                modelOptions: undefined
            },
            initialize: function(models, options) {
                this.setup(models, options);
            },
            setup: function(models, options) {
                this.setOptions(options);
                this._bound = {
                    remove: this.remove.bind(this)
                };
                this.primaryKey = this.options.primaryKey;
                if (this.options.Model) {
                    this._Model = this.options.Model;
                }
                if (models) {
                    this.add(models);
                }
                return this;
            },
            hasModel: function(model) {
                var pk = this.primaryKey, has, modelId;
                has = this._models.contains(model);
                if (pk && !has) {
                    modelId = instanceOf(model, Model) ? model.get(pk) : model[pk];
                    has = this.some(function(item) {
                        return modelId === item.get(pk);
                    });
                }
                return !!has;
            },
            _add: function(model) {
                model = new this._Model(model, this.options.modelOptions);
                if (!this.hasModel(model)) {
                    model.addEvent("destroy", this._bound.remove);
                    this._models.push(model);
                    this.length = this._models.length;
                    this.signalAdd(model);
                }
                return this;
            },
            add: function(models) {
                models = Array.from(models);
                var len = models.length, i = 0;
                while (len--) {
                    this._add(models[i++]);
                }
                return this;
            },
            get: function(index) {
                var len = arguments.length, i = 0, results;
                if (len > 1) {
                    results = [];
                    while (len--) {
                        results.push(this.get(arguments[i++]));
                    }
                    return results;
                }
                return this._models[index];
            },
            _remove: function(model) {
                model.removeEvent("destroy", this._bound.remove);
                this._models.erase(model);
                this.length = this._models.length;
                this.signalRemove(model);
                return this;
            },
            remove: function(models) {
                models = Array.from(models).slice();
                var l = models.length, i = 0;
                while (l--) {
                    this._remove(models[i++]);
                }
                return this;
            },
            replace: function(oldModel, newModel, signal) {
                var index;
                if (oldModel && newModel) {
                    index = this.indexOf(oldModel);
                    if (index > -1) {
                        newModel = new this._Model(newModel, this.options.modelOptions);
                        this._models.splice(index, 1, newModel);
                        if (signal) {
                            this.signalAdd(newModel);
                            this.signalRemove(oldModel);
                        }
                    }
                }
                return this;
            },
            sort: function(fnc) {
                this._models.sort(fnc);
                this.signalSort();
                return this;
            },
            reverse: function() {
                this._models.reverse();
                this.signalSort();
                return this;
            },
            empty: function() {
                this.remove(this._models);
                this.signalEmpty();
                return this;
            },
            signalAdd: function(model) {
                !this.isSilent() && this.fireEvent("add", model);
                return this;
            },
            signalRemove: function(model) {
                !this.isSilent() && this.fireEvent("remove", model);
                return this;
            },
            signalEmpty: function() {
                !this.isSilent() && this.fireEvent("empty");
                return this;
            },
            signalSort: function() {
                !this.isSilent() && this.fireEvent("sort");
                return this;
            },
            toJSON: function() {
                return this.map(function(model) {
                    return model.toJSON();
                });
            }
        });
        [ "forEach", "each", "invoke", "every", "filter", "clean", "indexOf", "map", "some", "associate", "link", "contains", "getLast", "getRandom", "flatten", "pick" ].each(function(method) {
            Collection.implement(method, function() {
                return Array.prototype[method].apply(this._models, arguments);
            });
        });
        exports.Collection = Collection;
    },
    "8": function(require, module, exports, global) {
        var Unit = require("9").Unit;
        var resolvePrefix = function(obj, key) {
            var prefix = obj && obj.getPrefix && obj.getPrefix();
            return (!!prefix ? prefix + "." : "") + key;
        };
        var Observer = new Class({
            Extends: Unit,
            subscribe: function(key, fn, replay, unit) {
                if (typeof key == "object") {
                    if (typeof fn != "function") {
                        for (var i in key) this.subscribe(i, key[i], void 0, fn);
                    } else {
                        for (var i in key) this.subscribe(i, key[i], fn, replay);
                    }
                } else {
                    if (typeof replay == "object") {
                        unit = replay;
                    }
                    !!key && (key = resolvePrefix(unit, key));
                    this.parent(key, fn, replay);
                }
                return this;
            },
            unsubscribe: function(key, fn, unit) {
                if (typeof key == "object") {
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
    },
    "9": function(require, module, exports, global) {
        (function() {
            var removeOnRegexp = /^on([A-Z])/, removeOnFn = function(_, ch) {
                return ch.toLowerCase();
            };
            var wrap = function(fn) {
                return function() {
                    return fn.apply(this, arguments);
                };
            };
            var mix = function() {
                var len = arguments.length;
                while (len--) {
                    var Current = arguments[len];
                    switch (typeOf(Current)) {
                      case "type":
                      case "class":
                        Current.$prototyping = true;
                        Object.append(this, new Current);
                        delete Current.$prototyping;
                        break;
                      case "unit":
                        for (var i in Current) {
                            if (!Current.hasOwnProperty(i)) continue;
                            var value = Current[i];
                            this[i] = typeof value == "function" && !value.exec ? wrap(value) : value;
                        }
                        break;
                      default:
                        Object.append(this, Current);
                        break;
                    }
                }
                return this;
            };
            var callback = function() {
                var current = callback.current;
                current.apply(current.$ownerObj, callback.args);
            };
            var Dispatcher = new Events;
            unwrapClassMethods : for (var prop in Dispatcher) {
                var item = Dispatcher[prop];
                if (typeof item != "function" || item.exec || !item.$origin) continue;
                Dispatcher[prop] = item.$origin;
            }
            Object.append(Dispatcher, {
                $dispatched: {},
                $finished: {},
                $mediator: this.document ? this.document.createElement("script") : null,
                setup: function() {
                    var mediator = this.$mediator;
                    if (!mediator || !mediator.attachEvent && !mediator.addEventListener) return this;
                    if (mediator.addEventListener) {
                        mediator.addEventListener("publishDispatch", callback, false);
                        this.dispatch = function(fn, args) {
                            var e = document.createEvent("UIEvents");
                            e.initEvent("publishDispatch", false, false);
                            callback.args = args;
                            callback.current = fn;
                            mediator.dispatchEvent(e);
                        };
                    } else if (mediator.attachEvent && !mediator.addEventListener) {
                        $(document.head).appendChild(mediator);
                        mediator.publishDispatch = 0;
                        mediator.attachEvent("onpropertychange", callback);
                        this.dispatch = function(fn, args) {
                            callback.args = args;
                            callback.current = fn;
                            mediator.publishDispatch++;
                        };
                        var cleanUp = function() {
                            mediator.detachEvent("onpropertychange", callback);
                            mediator.parentNode.removeChild(mediator);
                            this.detachEvent("onunload", cleanUp);
                        };
                        window.attachEvent("onunload", cleanUp);
                    }
                    return this;
                },
                getFinished: function(key) {
                    return this.$finished[key] || null;
                },
                getDispatched: function(key) {
                    return this.$dispatched[key] || [];
                },
                dispatch: function(fn, args) {
                    callback.args = args;
                    callback.current = fn;
                    callback.call(null);
                },
                replay: function(type, fn) {
                    var dispatched = this.$dispatched, args = null;
                    if (!dispatched || !(args = dispatched[type])) return false;
                    this.dispatch(fn, args);
                    return true;
                },
                redispatch: function(type, fn) {
                    var finished = this.$finished, args = null;
                    if (!finished || !(args = finished[type])) return false;
                    this.dispatch(fn, args);
                    return true;
                },
                fireEvent: function(type, args, finish) {
                    var self = this, dispatched = this.$dispatched, finished = this.$finished, events = this.$events, handlers = null;
                    type = type.replace(removeOnRegexp, removeOnFn);
                    args = Array.from(args);
                    dispatched[type] = args;
                    if (finish) finished[type] = args;
                    if (!events || !(handlers = events[type])) return this;
                    for (var i = 0, l = handlers.length; i < l; i++) {
                        this.dispatch(handlers[i], args);
                    }
                    return this;
                },
                removeEvents: function(events) {
                    var type;
                    if (typeOf(events) == "object") {
                        for (type in events) {
                            if (!events.hasOwnProperty(type)) continue;
                            this.removeEvent(type, events[type]);
                        }
                        return this;
                    }
                    if (events) events = events.replace(removeOnRegexp, removeOnFn);
                    for (type in this.$events) {
                        if (events && events != type) continue;
                        var fns = this.$events[type];
                        for (var i = fns.length; i--; ) {
                            if (i in fns) this.removeEvent(type, fns[i]);
                        }
                    }
                    return this;
                },
                removeFinished: function() {
                    var finished = this.$finished;
                    for (var i in finished) {
                        if (!finished.hasOwnProperty(i) || i == "window.domready" || i == "window.load") continue;
                        delete finished[i];
                    }
                    return this;
                },
                removeDispatched: function() {
                    var dispatched = this.$dispatched;
                    for (var i in dispatched) {
                        if (!dispatched.hasOwnProperty(i) || i == "window.domready" || i == "window.load") continue;
                        delete dispatched[i];
                    }
                    return this;
                },
                flush: function() {
                    this.removeEvents();
                    delete Dispatcher.$events;
                    Dispatcher.$events = {};
                    this.removeFinished();
                    this.removeDispatched();
                    return this;
                }
            }).setup();
            window.addEvents({
                domready: function() {
                    Dispatcher.fireEvent("window.domready", [], true);
                },
                load: function() {
                    Dispatcher.fireEvent("window.load", [], true);
                }
            });
            function Unit(desc) {
                if (!(this instanceof Unit)) return new Unit(desc);
                this.$unitAttached = true;
                this.$unitHandlers = {};
                this.$unitPrefix = "";
                if (Unit.$prototyping) return this;
                if (desc) {
                    this.extendUnit(desc);
                    this.setupUnit();
                }
                return this;
            }
            var decorateFireEvent = function(origin, rep) {
                var fn = function() {
                    rep.apply(this, arguments);
                    return origin.apply(this, arguments);
                };
                fn.$unwrapped = origin;
                return fn;
            };
            var decorateFn = function(value, unit) {
                var fn = function() {
                    return value.apply(unit, arguments);
                };
                fn.$origin = value;
                return fn;
            };
            this.Unit = (new Type("Unit", Unit)).extend({
                isUnit: function(obj) {
                    if (typeOf(obj) === "unit") {
                        return true;
                    } else {
                        return obj.$unitInstance ? obj.$unitInstance instanceof Unit : false;
                    }
                },
                decorate: function(obj, nowrap) {
                    if (obj.$unitInstance) return obj;
                    var unit = obj.$unitInstance = new Unit;
                    unit.extendUnit = function(ext) {
                        mix.call(obj, ext);
                        return this;
                    };
                    for (var i in unit) {
                        var value = unit[i];
                        if (obj[i] || i == "$family" || typeof value !== "function" || value.exec) continue;
                        obj[i] = decorateFn(value, unit);
                    }
                    obj.setupUnit();
                    return !nowrap ? this.wrapEvents(obj) : obj;
                },
                undecorate: function(obj) {
                    var unit = obj.$unitInstance;
                    if (!unit) return obj;
                    for (var key in unit) {
                        var value = obj[key];
                        if (!value || value.$origin == value) continue;
                        delete obj[key];
                    }
                    this.unwrapEvents(obj);
                    delete obj.$unitInstance;
                    return obj;
                },
                wrapEvents: function(unit) {
                    var fireEvent = unit.fireEvent;
                    if (!fireEvent || fireEvent.$unwrapped) return unit;
                    unit.fireEvent = decorateFireEvent(fireEvent, function(type, args) {
                        unit.publish(type, args);
                    });
                    return unit;
                },
                unwrapEvents: function(unit) {
                    var fireEvent = unit.fireEvent;
                    if (fireEvent && fireEvent.$unwrapped) unit.fireEvent = fireEvent.$unwrapped;
                    return unit;
                }
            }).implement({
                setupUnit: function() {
                    var self = this;
                    if (this.Uses) {
                        Array.from(this.Uses).each(this.extendUnit.bind(this));
                        delete this.Uses;
                    }
                    if (this.Prefix) {
                        this.setPrefix(this.Prefix);
                        delete this.Prefix;
                    }
                    if (this.initSetup) Dispatcher.dispatch(function() {
                        self.initSetup.apply(self);
                    });
                    if (this.readySetup) this.subscribe("window.domready", function() {
                        self.readySetup();
                    });
                    if (this.loadSetup) this.subscribe("window.load", function() {
                        self.loadSetup();
                    });
                    return this;
                },
                extendUnit: function(obj) {
                    mix.call(this, obj);
                    return this;
                },
                getPrefix: function() {
                    return this.$unitPrefix;
                },
                setPrefix: function(str) {
                    this.$unitPrefix = (str || "").toString();
                    return this;
                },
                isAttached: function() {
                    return !!this.$unitAttached;
                },
                detachUnit: function() {
                    var attached = this.$unitHandlers;
                    if (!this.$unitAttached) return this;
                    for (var key in attached) {
                        var len = attached[key].length;
                        while (len--) {
                            Dispatcher.removeEvent(key, attached[key][len]);
                        }
                    }
                    this.$unitAttached = false;
                    return this;
                },
                attachUnit: function() {
                    var attached = this.$unitHandlers;
                    if (this.$unitAttached) return this;
                    for (var key in attached) {
                        var len = attached[key].length;
                        while (len--) {
                            Dispatcher.addEvent(key, attached[key][len]);
                        }
                    }
                    this.$unitAttached = true;
                    return this;
                },
                destroyUnit: function() {
                    this.detachUnit();
                    this.$unitHandlers = {};
                    return this;
                },
                subscribe: function(key, fn, replay) {
                    if (typeof key == "object") {
                        for (var i in key) this.subscribe(i, key[i], fn);
                    } else {
                        if (key.charAt(0) == "!") replay = !!(key = key.substring(1));
                        fn.$ownerObj = this;
                        if (!Dispatcher.redispatch(key, fn)) {
                            Events.prototype.addEvent.call({
                                $events: this.$unitHandlers
                            }, key, fn);
                            if (this.$unitAttached) {
                                Dispatcher.addEvent(key, fn);
                                if (replay) Dispatcher.replay(key, fn);
                            }
                        }
                    }
                    return this;
                },
                unsubscribe: function(key, fn) {
                    if (typeof key !== "string") {
                        for (var i in key) this.unsubscribe(i, key[i]);
                    } else {
                        Dispatcher.removeEvent(key, fn);
                        Events.prototype.removeEvent.call({
                            $events: this.$unitHandlers
                        }, key, fn);
                    }
                    return this;
                },
                publish: function(type, args, finish) {
                    if (type.charAt(0) == "!") finish = type = type.substring(1); else if (this.$unitPrefix) type = this.$unitPrefix + "." + type;
                    if (this.$unitAttached) Dispatcher.fireEvent.call(Dispatcher, type, args, finish);
                    return this;
                }
            });
            var wrapDispatcherFn = function(origin) {
                var fn = function() {
                    fn.$spy.apply(null, arguments);
                    fn.$unwrapped.apply(Dispatcher, arguments);
                };
                return Object.append(fn, {
                    $unwrapped: origin
                });
            };
            Unit.Dispatcher = {
                flush: function() {
                    Dispatcher.flush();
                    return this;
                },
                getFinished: function() {
                    return Object.clone(Dispatcher.$finished);
                },
                removeFinished: function() {
                    Dispatcher.removeFinished();
                    return this;
                },
                getDispatched: function(key) {
                    return key ? (Dispatcher.$dispatched[key] || []).clone() : Object.clone(Dispatcher.$dispatched);
                },
                removeDispatched: function() {
                    Dispatcher.removeDispatched();
                    return this;
                },
                getSubscribers: function(key) {
                    return key ? (Dispatcher.$events[key] || []).clone() : Object.clone(Dispatcher.$events);
                },
                spySubscribe: function(spy) {
                    var fnAddEvent = Dispatcher.addEvent;
                    if (!fnAddEvent.$unwrapped) Dispatcher.addEvent = wrapDispatcherFn(fnAddEvent);
                    Dispatcher.addEvent.$spy = spy;
                    return this;
                },
                unspySubscribe: function() {
                    var fnAddEvent = Dispatcher.addEvent;
                    if (fnAddEvent.$unwrapped) {
                        Dispatcher.addEvent = fnAddEvent.$unwrapped;
                    }
                    return this;
                },
                spyUnsubscribe: function(spy) {
                    var fnRemoveEvent = Dispatcher.removeEvent;
                    if (!fnRemoveEvent.$unwrapped) Dispatcher.removeEvent = wrapDispatcherFn(fnRemoveEvent);
                    Dispatcher.removeEvent.$spy = spy;
                    return this;
                },
                unspyUnsubscribe: function() {
                    var fnRemoveEvent = Dispatcher.removeEvent;
                    if (fnRemoveEvent.$unwrapped) {
                        Dispatcher.removeEvent = fnRemoveEvent.$unwrapped;
                    }
                    return this;
                },
                spyPublish: function(spy) {
                    var fnFireEvent = Dispatcher.fireEvent;
                    if (!fnFireEvent.$unwrapped) Dispatcher.fireEvent = wrapDispatcherFn(fnFireEvent);
                    Dispatcher.fireEvent.$spy = spy;
                    return this;
                },
                unspyPublish: function() {
                    var fnFireEvent = Dispatcher.fireEvent;
                    if (fnFireEvent.$unwrapped) {
                        Dispatcher.fireEvent = fnFireEvent.$unwrapped;
                    }
                    return this;
                }
            };
        }).call(this);
    },
    a: function(require, module, exports, global) {
        var modelObj = require("3"), Observer = require("8").Observer, Mixins = require("b");
        var Model = new Class({
            Extends: modelObj.Model,
            Implements: [ Mixins.observer ],
            options: {
                Prefix: ""
            },
            setup: function(data, options) {
                this.parent(data, options);
                this.setPrefix(this.options.Prefix || String.uniqueID());
                this.setupUnit();
                Observer.decorate(this);
                return this;
            }
        });
        modelObj.Model = exports.Model = Model;
    },
    b: function(require, module, exports, global) {
        var Observer = require("8").Observer;
        var fn = function() {
            var args = Array.from(arguments);
            args.push(this);
            this.parent.apply(this, args);
            return this;
        };
        exports.observer = new Class({
            Extends: Observer,
            subscribe: fn,
            unsubscribe: fn
        });
    },
    c: function(require, module, exports, global) {
        var collectionObj = require("7"), Model = require("3").Model, Observer = require("8").Observer, Mixins = require("b");
        var Collection = new Class({
            Extends: collectionObj.Collection,
            Implements: [ Mixins.observer ],
            options: {
                Prefix: "",
                Model: Model
            },
            setup: function(models, options) {
                this.setPrefix(options && options.Prefix || this.options.Prefix);
                this.setupUnit();
                Observer.decorate(this);
                this.parent(models, options);
                return this;
            }
        });
        collectionObj.Collection = exports.Collection = Collection;
    }
});