'use strict';

(function (window) {

    window.Application = Ember.Application.create({});

    window.Application.Router.map(function () {
        this.resource('content', { path: '/content' }, function () {
            this.route('view1', { path: '/1' });
            this.route('view2', { path: '/2' });
        });
    });

    var get = Ember.get, set = Ember.set, on = Ember.on;

    window.Application.StateMixin = Ember.Mixin.create({
        stateObject: Ember.Object.create({}),
        init: function () {
            this._super();

            var stateObject = Ember.Object.create({
                children: Ember.A([]),
                width: this.width,
                height: this.height,
                addState: function (state) {
                    this.children.addObject(state);
                    this.resize();
                },
                removeState: function (state) {
                    this.children.removeObject(state);
                    this.resize();
                },
                resize: function () {
                    this.children.invoke('_onResize');
                }
            });

            set(this, 'stateObject', stateObject);
        },
    });

    window.Application.StateView = Ember.View.extend(window.Application.StateMixin, {

        _setup: on('didInsertElement', function () {
            var self = this,
                parentState = get(this, 'parentView.stateObject'),
                state = get(this, 'stateObject');

            state.setProperties({
                name: this.viewName || this.renderedName,
                _onResize: function () { self._onResize(); }
            });

            parentState.addState(state);
        }),

        _teardown: on('willDestroyElement', function () {
            var parentState = get(this, 'parentView.stateObject'),
                 state = get(this, 'stateObject');

            parentState.removeState(state);
        }),

        _onResize: function () {
            var state = get(this, 'stateObject');
            state.resize();
        }
    });

    window.Application.ApplicationView = Ember.View.extend(window.Application.StateMixin, {
        templateName: 'application',
        classNames: ['full'],
        _setup: on('didInsertElement', function () {
            var self = this, $window = Ember.$(window);

            $window.on('resize', function () {
                self._onResize();
            });

            Ember.run.next(self, self._onResize);
        }),

        _teardown: on('willDestroyElement', function () {
            var $window = Ember.$(window);
            $window.off(resize);
        }),

        _onResize: function () {
            var $window = Ember.$(window),
                state = get(this, 'stateObject');

            set(state, 'width', $window.width());
            set(state, 'height', $window.height());

            state.resize();
        }
    });

    window.Application.TopView = Ember.View.extend({
        tagName: 'nav',
        templateName: 'top',
        classNames: ['navbar', 'navbar-default', 'navbar-fixed-top']
    });

    window.Application.ResizeView = window.Application.StateView.extend({

        _onResize: function () {
            var parentState = get(this, 'parentView.stateObject'),
                children = get(parentState, 'children'),
                state = get(this, 'stateObject'),
                childrenWidth = children.filter(function (child) { return get(child, 'name') !== get(state, 'name'); })
                    .reduce(function (a, b) {
                        return a + get(b, 'width');
                    }, 0),
                width = get(parentState, 'width') - (childrenWidth || 0);

            set(state, 'width', width);
            this.$().width(width);
            this._super();
        }
    });

    window.Application.SidebarView = window.Application.StateView.extend({
        classNames: ['sidebar', 'bg-primary'],
        init: function () {
            this._super();
            set(this, 'stateObject.width', this.width);
        },
        _onResize: function () {
            this.$().width(get(this, 'stateObject.width'));
            this._super();
        },
        actions: {
            toggle: function () {
                var width = get(this, 'stateObject.width'), parentState = get(this, 'parentView.stateObject');
                set(this, 'stateObject.width', width == 100 ? this.width : 100);
                get(parentState, 'children').invoke('_onResize');
            }
        }
    });

    window.Application.ContentView = window.Application.ResizeView.extend({
        templateName: 'content',
        classNames: ['content-wrapper', 'full', 'bg-warning']
    });

    window.Application.LeftSidebarView = window.Application.SidebarView.extend({
        templateName: 'leftSidebar',
        classNames: ['static', 'full', 'pull-left'],
        width: 200
    });

    window.Application.RightSidebarView = window.Application.SidebarView.extend({
        templateName: 'rightSidebar',
        classNames: ['right'],
        width: 300
    });

    window.Application.ContentView1View = window.Application.ResizeView.extend({
        templateName: 'content/view1',
        classNames: ['pull-left']
    });

    window.Application.ContentView2View = window.Application.ResizeView.extend({
        templateName: 'content/view2',
        classNames: ['pull-left']
    });

})(window);

