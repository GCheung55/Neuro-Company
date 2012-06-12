buster.testCase('Neuro Collection', {
    setUp: function(){
        this.mockCollection = new Neuro.Collection();

        this.mockData = {
            a: 'str', b: [], c: {}
        };
    },

    'PubSub': {
        setUp: function(){
            this.mockPrefix = '123';
        },

        'should notify subscribers of models added': function(){
            var spy = this.spy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.add', spy),
                model;

            this.mockCollection.setPrefix(this.mockPrefix).add(this.mockData);

            model = this.mockCollection.get(0);
            // make sure the model has the correct data
            assert.equals(model.getData(), this.mockData);

            assert.called(spy),
            assert.calledWith(spy, this.mockCollection, model);
        },

        'should notify subscribers of models removed': function(){
            var spy = this.spy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.remove', spy),
                model;

            this.mockCollection.setPrefix(this.mockPrefix).add(this.mockData);
            model = this.mockCollection.get(0);
            // make sure the model has the correct data
            assert.equals(model.getData(), this.mockData);

            this.mockCollection.remove(model);

            assert.called(spy);
            assert.calledWith(spy, this.mockCollection, model);
        },

        'should notify subscribers emptying Collection instance': function(){
            var spy = this.spy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.empty', spy),
                model;

            this.mockCollection.setPrefix(this.mockPrefix).add(this.mockData);
            model = this.mockCollection.get(0);
            // make sure the model has the correct data
            assert.equals(model.getData(), this.mockData);

            this.mockCollection.empty();

            assert.called(spy);
            assert.calledWith(spy, this.mockCollection);
            refute(this.mockCollection._models.length);
        }
    }
});