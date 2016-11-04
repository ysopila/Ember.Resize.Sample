'use strict';

(function (window) {

    window.Application = Ember.Application.create({});

    window.Application.Router.map(function () {
        this.resource('content', { path: '/content' }, function () {
            this.route('view1', { path: '/1' });
            this.route('view2', { path: '/2' });
        });
    });

    window.Application.EventBus = Ember.Object.extend(Ember.Evented, {
        publish: function () {
            return this.trigger.apply(this, arguments);
        },
        subscribe: function () {
            return this.on.apply(this, arguments);
        },
        unsubscribe: function () {
            return this.off.apply(this, arguments);
        }
    });

    window.Application.UIStateService = Ember.Object.extend({
        states: Ember.A(),
        addState: function (key, event, width, height) {

            var state = Ember.Object.create({
                children: Ember.A([]),
                key: key,
                event: event,
                width: width,
                height: height
            });

            this.states.addObject(state);

            return state;
        },
        removeState: function (state) {
            this.states.removeObject(state);
        },
        find: function (key) {
            return this.states.findBy('key', key);
        }
    });

    Ember.Application.initializer({
        name: 'load-services',
        initialize: function (container, application) {
            var eventBus = window.Application.EventBus.create();

            application.register('event-bus:current', eventBus, {
                instantiate: false
            });

            application.inject('controller', 'eventBus', 'event-bus:current');
            application.inject('view', 'eventBus', 'event-bus:current');

            var stateService = window.Application.UIStateService.create();

            application.register('state-service:current', stateService, {
                instantiate: false
            });

            application.inject('controller', 'stateService', 'state-service:current');
            application.inject('view', 'stateService', 'state-service:current');

        }
    });

    var get = Ember.get, set = Ember.set, on = Ember.on;


    window.Application.StateView = Ember.View.extend({

        //_setup: on('didInsertElement', function (parentState) {

        //    var key = this.viewName || this.renderedName, event = key + '-resize';

        //    this.stateService.addState(key, event);

        //    this.eventBus.subscribe(get(parentState, 'event'), this, '_onResize');
        //    this.eventBus.publish(get(parentState, 'event'), parentState);

        //}),

        //_teardown: on('willDestroyElement', function () {
        //    var parentState = get(this, 'parentView.stateObject'),
        //         children = get(parentState, 'children'),
        //         state = get(this, 'stateObject');

        //    children.removeObject(state);

        //    this.eventBus.unsubscribe(get(parentState, 'event'), this, '_onResize');
        //}),

        //_onResize: function () {
        //    var state = get(this, 'stateObject');
        //    this.eventBus.publish(get(state, 'event'));
        //}
    });

    window.Application.ApplicationView = Ember.View.extend({
        templateName: 'application',
        classNames: ['full'],
        //_setup: on('didInsertElement', function () {
        //    var self = this, $window = Ember.$(window);

        //    var key = self.viewName || self.renderedName, event = key + '-resize';
        //    var state = self.stateService.addState(key, event);

        //    $window.on('resize', function () {
        //        self._onResize();
        //    });

        //    Ember.run.next(self, self._onResize);
        //}),

        //_teardown: on('willDestroyElement', function () {
        //    var $window = Ember.$(window);
        //    $window.off(resize);
        //}),

        //_onResize: function () {
        //    var $window = Ember.$(window),
        //        state = get(this, 'stateObject');

        //    set(state, 'width', $window.width());
        //    set(state, 'height', $window.height());

        //    this.eventBus.publish(get(state, 'event'));
        //}
    });

    window.Application.TopView = Ember.View.extend({
        tagName: 'nav',
        templateName: 'top',
        classNames: ['navbar', 'navbar-default', 'navbar-fixed-top']
    });

    window.Application.ResizeView = window.Application.StateView.extend({

        //_onResize: function () {
        //    var parentState = get(this, 'parentView.stateObject'),
        //        children = get(parentState, 'children'),
        //        state = get(this, 'stateObject'),
        //        childrenWidth = children.filter(function (child) { return get(child, 'key') !== get(state, 'key'); })
        //            .reduce(function (a, b) {
        //                return a + get(b, 'width');
        //            }, 0),
        //        width = get(parentState, 'width') - (childrenWidth || 0);

        //    set(state, 'width', width);
        //    this.$().width(width);
        //    this._super();
        //}
    });

    window.Application.SidebarView = window.Application.StateView.extend({
        classNames: ['sidebar', 'bg-primary'],
       
        _onResize: function () {
            var state = this.stateService.find(this.viewName || this.renderedName);
            this.$().width(get(state, 'width'));
            this._super();
        },
        actions: {
            toggle: function (parentState) {
                var state = this.stateService.find(this.viewName || this.renderedName);
                var width = get(state, 'width');
                set(state, 'width', width == 100 ? this.width : 100);
                this.eventBus.publish(get(parentState, 'event'));
            }
        }
    });

    window.Application.StaticView = Ember.View.extend({
        classNames: ['full']
    });

    window.Application.ContentView = window.Application.StateView.extend({
        templateName: 'content',
        classNames: ['content-wrapper', 'full', 'bg-warning']
    });

    window.Application.LeftSidebarView = window.Application.SidebarView.extend({
        templateName: 'leftSidebar',
        classNames: ['static', 'full', 'pull-left'],
        width: 200,
        _setup: on('didInsertElement', function () {
            var parentState = this.stateService.find('content');
            this._super(parentState);
        }),
        actions: {
            toggle: function () {
                var parentState = this.stateService.find('content');
                this._super(parentState);
            }
        }
    });

    window.Application.RightSidebarView = window.Application.SidebarView.extend({
        templateName: 'rightSidebar',
        classNames: ['right'],
        width: 300,
        _setup: on('didInsertElement', function () {
            var parentState = this.stateService.find('application');
            this._super(parentState);
        }),
        actions: {
            toggle: function () {
                var parentState = this.stateService.find('application');
                this._super(parentState);
            }
        }
    });

    window.Application.ContentView1View = Ember.View.extend({
        templateName: 'content/view1',
        classNames: ['pull-left']
    });

    window.Application.ContentView2View = Ember.View.extend({
        templateName: 'content/view2',
        classNames: ['pull-left']
    });

})(window);

