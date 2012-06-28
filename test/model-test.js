buster.testCase('Neuro Model', {
    setUp: function(){
        var testModel = new Class({
            Extends: Neuro.Model,
            _accessors: {
                'fullName': {
                    set: function(prop, val){
                        if (val) {
                            var names = val.split(' '),
                                first = names[0],
                                last = names[1];

                            this.set('firstName', first);
                            this.set('lastName', last);
                            return val;
                        }
                    },
                    get: function(isPrevious){
                        var data = isPrevious ? this._data : this._previousData;

                        return data['fullName'];
                    }
                }
            }
        });

        this.mockModel = new testModel();

        this.mockData = {
            'firstName': 'Garrick',
            'lastName': 'Cheung',
            'fullName': 'Garrick Cheung',
            'age': 29
        };

        this.mockModelWithData = new testModel(this.mockData);
    },

    'PubSub': {
        setUp: function(){
            this.dispatcher = Neuro.Observer.Dispatcher;

            this.mockPrefix = 123;
        },

        'should be be able to set an optional prefix': function(){
            var result = new Neuro.Model(null, {Prefix: this.mockPrefix}).getPrefix();

            assert.equals(this.mockPrefix, result);
        },

        'should notify subscribers of changes': function(){
            var spy = this.spy(),
                model = this.mockModelWithData,
                prefix = model.getPrefix(),
                unit = new Neuro.Observer().subscribe(prefix + '.change', spy);

            model.set('age', 30);

            assert.called(spy);
        },

        'should notify subscribers of a changed data property': function(){
            var key = 'age',
                val = 30,
                spy = this.spy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.change:' + key, spy),
                model = this.mockModelWithData;

            model.setPrefix(this.mockPrefix).set(key, val);

            assert.called(spy);
            assert.calledWith(spy, key, val);
        },

        'use of custom accessors should notify subscribers of changed data property': function(){
            var key = 'fullName',
                val = 'Mark Obcena',
                spy = this.spy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.change:' + key, spy),
                model = this.mockModelWithData;

            model.setPrefix(this.mockPrefix).set(key, val);

            assert.called(spy);
            assert.calledWith(spy, key, val);
        },

        'should automatically use the the prefix when subscribing': function(){
            var modelSpy = this.spy(),
                unitSpy = this.spy(),
                model = this.mockModel,
                unit = new Neuro.Observer();

            // Subscribe with unit
            unit.subscribe(model.getPrefix() + '.change', unitSpy);

            // Subscribe with model
            model.subscribe('change', modelSpy);

            model.set(this.mockData);

            assert.called(modelSpy);
            assert.called(unitSpy);
        }
    }
});