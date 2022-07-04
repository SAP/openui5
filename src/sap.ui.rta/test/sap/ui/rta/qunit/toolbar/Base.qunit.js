/*global QUnit*/

sap.ui.define([
	"sap/m/Button",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/BusyIndicator",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/util/Animation",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	Button,
	ManagedObject,
	BusyIndicator,
	BaseToolbar,
	Animation,
	jQuery,
	sinon,
	oCore
) {
	"use strict";

	/*********************************************************************************************************
	 * BASIC FUNCTIONALITY
	 ********************************************************************************************************/

	//RTA Toolbar needs RTA Mode settings
	jQuery("body").addClass("sapUiRtaMode");

	var sandbox = sinon.createSandbox();

	QUnit.module("Basic functionality", {
		beforeEach: function() {
			this.oToolbar = new BaseToolbar();
		},
		afterEach: function() {
			this.oToolbar.destroy();
		}
	}, function () {
		QUnit.test("initialization", function(assert) {
			assert.ok(this.oToolbar, "Toolbar instance is created");
			assert.strictEqual(this.oToolbar.getDomRef(), null, "Toolbar is not rendered");
			assert.ok(this.oToolbar.$().filter(":visible").length === 0, "Toolbar is not visible");
		});

		QUnit.test("show() method", function(assert) {
			var oPromise = this.oToolbar.show();

			assert.ok(oPromise instanceof Promise, "show() method returns Promise");

			return oPromise.then(function () {
				oCore.applyChanges();
				assert.ok(this.oToolbar.getDomRef() instanceof HTMLElement, "Toolbar is rendered");
				assert.ok(this.oToolbar.$().filter(":visible").length === 1, "Toolbar is visible");
			}.bind(this));
		});

		QUnit.test("hide() method", function(assert) {
			var oPromise = this.oToolbar.hide();

			assert.ok(oPromise instanceof Promise, "hide() method returns Promise");

			return oPromise.then(function () {
				oCore.applyChanges();
				assert.strictEqual(this.oToolbar.getDomRef(), null, "Toolbar is not rendered");
				assert.ok(this.oToolbar.$().filter(":visible").length === 0, "Toolbar is not visible");
			}.bind(this));
		});

		QUnit.test("hide() method with deactivated animation transition", function(assert) {
			var oPromise = this.oToolbar.hide(true);

			assert.ok(oPromise instanceof Promise, "hide() method returns Promise");

			return oPromise.then(function () {
				oCore.applyChanges();
				assert.strictEqual(this.oToolbar.getDomRef(), null, "Toolbar is not rendered");
				assert.ok(this.oToolbar.$().filter(":visible").length === 0, "Toolbar is not visible");
			}.bind(this));
		});

		QUnit.test("show()/hide() combination", function(assert) {
			return this.oToolbar.show().then(function () {
				oCore.applyChanges();
				assert.ok(this.oToolbar.getDomRef() instanceof HTMLElement, "Toolbar is rendered");
				assert.ok(this.oToolbar.$().filter(":visible").length === 1, "Toolbar is visible");

				return this.oToolbar.hide().then(function () {
					oCore.applyChanges();
					assert.strictEqual(this.oToolbar.getDomRef(), null, "Toolbar is not rendered");
					assert.ok(this.oToolbar.$().filter(":visible").length === 0, "Toolbar is not visible");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("setZIndex() method", function(assert) {
			return this.oToolbar.show().then(function () {
				var iInitialZIndex = parseInt(this.oToolbar.$().css("z-index"));
				assert.strictEqual(this.oToolbar.getZIndex(), iInitialZIndex, "z-index is rendered properly");

				var iZIndex = iInitialZIndex + 1;
				this.oToolbar.setZIndex(iZIndex);
				oCore.applyChanges();

				assert.strictEqual(parseInt(this.oToolbar.$().css("z-index")), iZIndex, "z-index is updated properly");
			}.bind(this));
		});

		QUnit.test("bringToFront() method", function(assert) {
			return this.oToolbar.show().then(function () {
				var iInitialZIndex = this.oToolbar.getZIndex();
				this.oToolbar.bringToFront();
				assert.ok(this.oToolbar.getZIndex() > iInitialZIndex, "current z-index is bigger than initial");
			}.bind(this));
		});

		QUnit.test("bringToFront() method with BusyIndicator", function(assert) {
			var fnDone = assert.async();
			var fnOpen = function () {
				this.oToolbar.show().then(function () {
					this.oToolbar.bringToFront(); // explicit call regardless it"s being called in show() method already
					assert.ok(this.oToolbar.getZIndex() + 2 < BusyIndicator.oPopup._iZIndex, "current z-index should be at least on 2 units lower");

					// clean up
					BusyIndicator.hide();
					BusyIndicator.detachOpen(fnOpen, this);

					fnDone();
				}.bind(this));
			};

			BusyIndicator.attachOpen(fnOpen, this);
			BusyIndicator.show(); // runs test
		});

		QUnit.test("buildControls() method", function(assert) {
			return this.oToolbar.buildControls().then(function(aControls) {
				assert.ok(Array.isArray(aControls) && aControls.length === 0, "returns an empty array");
			});
		});

		QUnit.test("onFragmentLoaded() method", function(assert) {
			var oPromise = this.oToolbar.onFragmentLoaded();

			assert.ok(oPromise instanceof Promise, "onFragmentLoaded() method returns Promise");

			return oPromise.then(function() {
				assert.ok(true, "Promise resolved");
			});
		});

		QUnit.test("get Extension", function(assert) {
			var Extension1 = ManagedObject.extend("foo.bar", {
				metadata: {
					properties: {
						context: {
							type: "sap.ui.rta.toolbar.Base"
						}
					}
				}
			});
			var Extension2 = ManagedObject.extend("foo.bar.foobar", {
				metadata: {
					properties: {
						context: {
							type: "sap.ui.rta.toolbar.Base"
						}
					}
				}
			});

			var oExtension1 = this.oToolbar.getExtension("foo.bar", Extension1);
			assert.strictEqual(oExtension1.getMetadata().getName(), "foo.bar", "the correct extension was added");

			var oNewExtension = this.oToolbar.getExtension("foo.bar", Extension2);
			assert.strictEqual(oNewExtension.getMetadata().getName(), "foo.bar", "still the same extension");

			var oExtension2 = this.oToolbar.getExtension("foo.bar.foobar", Extension2);
			assert.strictEqual(oExtension2.getMetadata().getName(), "foo.bar.foobar", "the second extension was added");

			this.oToolbar.destroy();
			assert.ok(oExtension1.isDestroyed(), true);
			assert.ok(oExtension2.isDestroyed(), true);
		});
	});


	/*********************************************************************************************************
	 * INHERITANCE FUNCTIONALITY
	 ********************************************************************************************************/

	QUnit.module("Inheritance functionality", {
		beforeEach: function() {
			var CustomToolbar = BaseToolbar.extend("CustomToolbar", {
				renderer: "sap.ui.rta.toolbar.BaseRenderer",
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
					type: "Transparent",
					icon: "sap-icon://home",
					press: this.eventHandler.bind(this, "Action")
				}).data("name", "action");

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
		QUnit.test("getControl() method", function(assert) {
			assert.strictEqual(this.oToolbar.getControl("action"), this.oButton, "returns referentially the same control");
		});

		QUnit.test("eventHandler() method", function(assert) {
			var fnDone = assert.async();

			this.oToolbar.attachEventOnce("action", function (oEvent) {
				assert.ok(true, "event is properly fired by the Toolbar");
				assert.strictEqual(oEvent.getId(), "action", "eventId is correct");
				assert.strictEqual(oEvent.getParameter("id"), this.oButton.getId(), "parameter are passed properly");
				fnDone();
			}, this);

			this.oButton.firePress(); // runs test
		});
	});

	/*********************************************************************************************************
	 * ANIMATION FUNCTIONALITY
	 ********************************************************************************************************/

	QUnit.module("Animation functionality", {
		beforeEach: function() {
			var CustomToolbar = BaseToolbar.extend("CustomToolbar", {
				renderer: "sap.ui.rta.toolbar.BaseRenderer",
				animation: true,
				type: "fiori"
			});

			this.oToolbar = new CustomToolbar();
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("show() with animation", function(assert) {
			return this.oToolbar.show().then(function () {
				assert.ok(true, "animation is completed");
				assert.ok(this.oToolbar.hasStyleClass("is_visible"), "Toolbar has proper animation class");
			}.bind(this));
		});

		QUnit.test("show()/hide() combination with animation", function(assert) {
			var oWaitTransitionSpy = sandbox.spy(Animation, "waitTransition");

			return this.oToolbar.show().then(function () {
				assert.ok(true, "animation is completed");
				assert.ok(this.oToolbar.hasStyleClass("is_visible"), "Toolbar has proper animation class");

				return this.oToolbar.hide().then(function () {
					assert.ok(true, "animation is completed");
					assert.ok(oWaitTransitionSpy.calledTwice, "waitTransition called for showing and hiding");
					assert.ok(!this.oToolbar.hasStyleClass("is_visible"), "Toolbar has no animation class");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("show()/hide() combination with animation, but transition skipped when hiding", function(assert) {
			var oWaitTransitionSpy = sandbox.spy(Animation, "waitTransition");

			return this.oToolbar.show().then(function () {
				assert.ok(true, "animation is completed");
				assert.ok(this.oToolbar.hasStyleClass("is_visible"), "Toolbar has proper animation class");

				return this.oToolbar.hide(true).then(function () {
					assert.ok(true, "animation is completed");
					assert.ok(oWaitTransitionSpy.calledOnce, "waitTransition called only for showing");
					assert.ok(!this.oToolbar.hasStyleClass("is_visible"), "Toolbar has no animation class");
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("body").removeClass("sapUiRtaMode");
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
