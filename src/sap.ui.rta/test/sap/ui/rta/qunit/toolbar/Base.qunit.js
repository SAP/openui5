/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/core/BusyIndicator",
	"sap/m/Button"
],
function(
	jQuery,
	BaseToolbar,
	BusyIndicator,
	Button
) {
	'use strict';

	/*********************************************************************************************************
	 * BASIC FUNCTIONALITY
	 ********************************************************************************************************/

	QUnit.module('Basic functionality', {
		beforeEach: function() {
			this.oToolbar = new BaseToolbar();
		},

		afterEach: function() {
			this.oToolbar.destroy();
		}
	}, function () {
		QUnit.test('initialization', function(assert) {
			assert.ok(this.oToolbar, 'Toolbar instance is created');
			assert.strictEqual(this.oToolbar.getDomRef(), null, 'Toolbar is not rendered');
			assert.ok(this.oToolbar.$().filter(':visible').length === 0, 'Toolbar is not visible');
		});

		QUnit.test('show() method', function(assert) {
			var oPromise = this.oToolbar.show();

			assert.ok(oPromise instanceof Promise, 'show() method returns Promise');

			return oPromise.then(function () {
				sap.ui.getCore().applyChanges();
				assert.ok(this.oToolbar.getDomRef() instanceof HTMLElement, 'Toolbar is rendered');
				assert.ok(this.oToolbar.$().filter(':visible').length === 1, 'Toolbar is visible');
			}.bind(this));
		});

		QUnit.test('hide() method', function(assert) {
			var oPromise = this.oToolbar.hide();

			assert.ok(oPromise instanceof Promise, 'hide() method returns Promise');

			return oPromise.then(function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oToolbar.getDomRef(), null, 'Toolbar is not rendered');
				assert.ok(this.oToolbar.$().filter(':visible').length === 0, 'Toolbar is not visible');
			}.bind(this));
		});

		QUnit.test('show()/hide() combination', function(assert) {
			return this.oToolbar.show().then(function () {
				sap.ui.getCore().applyChanges();
				assert.ok(this.oToolbar.getDomRef() instanceof HTMLElement, 'Toolbar is rendered');
				assert.ok(this.oToolbar.$().filter(':visible').length === 1, 'Toolbar is visible');

				return this.oToolbar.hide().then(function () {
					sap.ui.getCore().applyChanges();
					assert.strictEqual(this.oToolbar.getDomRef(), null, 'Toolbar is not rendered');
					assert.ok(this.oToolbar.$().filter(':visible').length === 0, 'Toolbar is not visible');
				}.bind(this));
			}.bind(this));
		});

		QUnit.test('setZIndex() method', function(assert) {
			return this.oToolbar.show().then(function () {
				var iInitialZIndex = parseInt(this.oToolbar.$().css('z-index'));
				assert.strictEqual(this.oToolbar.getZIndex(), iInitialZIndex, 'z-index is rendered properly');

				var iZIndex = iInitialZIndex + 1;
				this.oToolbar.setZIndex(iZIndex);
				sap.ui.getCore().applyChanges();

				assert.strictEqual(parseInt(this.oToolbar.$().css('z-index')), iZIndex, 'z-index is updated properly');
			}.bind(this));
		});

		QUnit.test('bringToFront() method', function(assert) {
			return this.oToolbar.show().then(function () {
				var iInitialZIndex = this.oToolbar.getZIndex();
				this.oToolbar.bringToFront();
				assert.ok(this.oToolbar.getZIndex() > iInitialZIndex, 'current z-index is bigger than initial');
			}.bind(this));
		});

		QUnit.test('bringToFront() method with BusyIndicator', function(assert) {
			var fnDone = assert.async();
			var fnOpen = function () {
				this.oToolbar.show().then(function () {
					this.oToolbar.bringToFront(); // explicit call regardless it's being called in show() method already
					assert.ok(this.oToolbar.getZIndex() + 2 < BusyIndicator.oPopup._iZIndex, 'current z-index should be at least on 2 units lower');

					// clean up
					BusyIndicator.hide();
					BusyIndicator.detachOpen(fnOpen, this);

					fnDone();
				}.bind(this));
			};

			BusyIndicator.attachOpen(fnOpen, this);
			BusyIndicator.show(); // runs test
		});

		QUnit.test('buildControls() method', function(assert) {
			return this.oToolbar.buildControls().then(function(aControls) {
				assert.ok(Array.isArray(aControls) && aControls.length === 0, 'returns an empty array');
			});
		});
	});


	/*********************************************************************************************************
	 * INHERITANCE FUNCTIONALITY
	 ********************************************************************************************************/

	QUnit.module('Inheritance functionality', {
		beforeEach: function() {
			var CustomToolbar = BaseToolbar.extend('CustomToolbar', {
				renderer: 'sap.ui.rta.toolbar.BaseRenderer',
				metadata: {
					events: {
						action: {}
					}
				}
			});

			var that = this;

			CustomToolbar.prototype.buildControls = function () {
				// expose button to the context of the unit test
				that.oButton = new Button("sapUiRta_action", {
					type: 'Transparent',
					icon: 'sap-icon://home',
					press: this.eventHandler.bind(this, 'Action')
				}).data('name', 'action');

				return Promise.resolve([
					that.oButton
				]);
			};

			this.oToolbar = new CustomToolbar();
		},
		afterEach: function() {
			// by default RuntimeAuthoring takes care of destroying the controls
			this.oButton.destroy();
			this.oToolbar.destroy();
		}
	}, function () {
		QUnit.test('getControl() method', function(assert) {
			assert.strictEqual(this.oToolbar.getControl('action'), this.oButton, 'returns referentially the same control');
		});

		QUnit.test('eventHandler() method', function(assert) {
			var fnDone = assert.async();

			this.oToolbar.attachEventOnce('action', function (oEvent) {
				assert.ok(true, 'event is properly fired by the Toolbar');
				assert.strictEqual(oEvent.getId(), 'action', 'eventId is correct');
				assert.strictEqual(oEvent.getParameter('id'), this.oButton.getId(), 'parameter are passed properly');
				fnDone();
			}, this);

			this.oButton.firePress(); // runs test
		});
	});

	/*********************************************************************************************************
	 * ANIMATION FUNCTIONALITY
	 ********************************************************************************************************/

	var insertStyles = function (sStyles) {
		return jQuery('<style />').text(sStyles).prependTo('body');
	};

	QUnit.module('Animation functionality', {
		beforeEach: function() {
			var CustomToolbar = BaseToolbar.extend('CustomToolbar', {
				renderer: 'sap.ui.rta.toolbar.BaseRenderer',
				animation: true,
				type: 'custom'
			});

			this.oToolbar = new CustomToolbar();

			this.$styles = insertStyles('\
				.type_custom {\
					background-color: blue;\
					transition: opacity 0.05s linear;\
					opacity: 0;\
				}\
				.type_custom.is_visible {\
					opacity: 1;\
				}\
			');
		},
		afterEach: function() {
			this.oToolbar.destroy();
			this.$styles.remove();
		}
	}, function () {
		QUnit.test('show() with animation', function(assert) {
			return this.oToolbar.show().then(function () {
				assert.ok(true, 'animation is completed');
				assert.ok(this.oToolbar.hasStyleClass('is_visible'), 'Toolbar has proper animation class');
			}.bind(this));
		});

		QUnit.test('show()/hide() combination with animation', function(assert) {
			return this.oToolbar.show().then(function () {
				assert.ok(true, 'animation is completed');
				assert.ok(this.oToolbar.hasStyleClass('is_visible'), 'Toolbar has proper animation class');

				return this.oToolbar.hide().then(function () {
					assert.ok(true, 'animation is completed');
					assert.ok(!this.oToolbar.hasStyleClass('is_visible'), 'Toolbar has no animation class');
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
