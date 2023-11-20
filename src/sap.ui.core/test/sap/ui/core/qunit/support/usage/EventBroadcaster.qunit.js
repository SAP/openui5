/*global QUnit*/
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/support/usage/EventBroadcaster",
	"sap/ui/core/Element",
	"sap/ui/core/routing/Router",
	"sap/ui/core/routing/HashChanger",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Image"
], function (EventBroadcaster, Element, Router, HashChanger, Button, Link, Image) {
	"use strict";


	QUnit.module("Public API");
	QUnit.test("Enable", function (assert) {
		EventBroadcaster.disable();

		// Pre-assert
		assert.notOk(Element._broadcastEvent, "Initially there is no intercept logic attached to Element");
		assert.notOk(Router._broadcastRouteMatched, "Initially there is no intercept logic attached to Router");

		// Act
		EventBroadcaster.enable();

		// Assert
		assert.ok(Element._interceptEvent, "After enabling there is intercept logic attached to Element");
		assert.ok(Router._interceptRouteMatched, "After enabling there is intercept logic attached to Router");
	});

	QUnit.test("Disable", function (assert) {
		//Prepare
		EventBroadcaster.enable();

		// Pre-assert
		assert.ok(Element._interceptEvent, "After enabling there is intercept logic attached to Element");
		assert.ok(Router._interceptRouteMatched, "After enabling there is intercept logic attached to Router");

		// Act
		EventBroadcaster.disable();
		assert.notOk(Element._interceptEvent, "After calling #disable there is no broadcasting logic attached to Element");
		assert.notOk(Router._interceptRouteMatched, "Initially #disable is no intercept logic attached to Router");
	});

	QUnit.test("set/get EventsExcludeList", function (assert) {
		//Prepare
		var oConfig = {
				global: ["modelContextChange", "beforeRendering", "afterRendering", "propertyChanged", "beforeGeometryChanged", "geometryChanged",
					"aggregationChanged", "componentCreated", "afterInit", "updateStarted", "updateFinished", "load", "scroll"
					],
				controls: {
					"sap.m.Button": {
						include: ["tap"]
					}
				}
			};

		// Act
		EventBroadcaster.setEventsExcludeList(oConfig);

		// Assert
		assert.deepEqual(EventBroadcaster.getEventsExcludeList(), oConfig, "ExcludeList configuration is set correctly");
	});

	QUnit.test("configuration ExcludeList can't be changed without the setter", function (assert) {
		//Prepare
		var oConfig = {
				global: ["modelContextChange", "beforeRendering", "afterRendering", "propertyChanged", "beforeGeometryChanged", "geometryChanged",
					"aggregationChanged", "componentCreated", "afterInit", "updateStarted", "updateFinished", "load", "scroll"
					],
				controls: {
					"sap.m.Button": {
						include: ["tap"]
					}
				}
			};

		// Act
		EventBroadcaster.setEventsExcludeList(oConfig);

		oConfig = {
			global: [],
			controls: {
				"sap.m.Switch": {}
			}
		};

		// Assert
		assert.notDeepEqual(EventBroadcaster.getEventsExcludeList().controls, oConfig.controls, "ExcludeList configuration wasn't modified when the configuration object was modified");
	});

	QUnit.module("Integration", {
		beforeEach: function () {
			var origDate = this.origDate = window.Date;
			window.Date = function () {
				return new origDate(2018, 0, 1);
			};
			window.Date.now = this.origDate.now;

			this.sinon = window.sinon;
			this.sinon.useFakeTimers = true;
			EventBroadcaster.enable();
		},
		afterEach: function () {
			window.Date = this.origDate;

			this.sinon.useFakeTimers = false;

			EventBroadcaster.disable();
		}
	});

	QUnit.test("Control Event is broadcast", function (assert) {
		//Prepare
		var done = assert.async(),
			oButton = new Button("myButton");

		window.addEventListener("UI5Event", fnAssert);

		// Act
		oButton.firePress();
		this.sinon.clock.create().tick();

		// Assert
		assert.expect(5);

		function fnAssert(oEvent) {
			assert.ok(true, "Generic UI5Event is fired");
			assert.equal(oEvent.detail.eventName, "press", "with correct event name");
			assert.equal(oEvent.detail.targetId, "myButton", "for the right targetId");
			assert.equal(oEvent.detail.targetType, "sap.m.Button", "for the right targetType");
			assert.equal(oEvent.detail.timestamp, new Date(2018, 0, 1).getTime(), "at correct time");

			//Clean-up
			oButton.destroy();
			window.removeEventListener("UI5Event", fnAssert);
			done();
		}
	});

	QUnit.test("routeMatched events is broadcast", function (assert) {
		//Prepare
		var done = assert.async(),
			router = new Router([{
				name: "r1",
				pattern: "/home"
			}, {
				name: "r2",
				pattern: "/register"
			}], {
				async: true
			}),
			sUrl,
			that = this;

		router.initialize();
		window.addEventListener("UI5Event", fnAssertR1);

		sUrl = router.getURL("r1");
		//Act
		HashChanger.getInstance().setHash(sUrl);
		this.sinon.clock.create().tick();

		// Assert
		assert.expect(8);

		// First routeMatched handler
		function fnAssertR1(oEvent) {
			var oEvtDetail = oEvent.detail;

			assert.ok(true, "Generic UI5Event is fired");
			assert.equal(oEvtDetail.eventName, "routeMatched", "with correct event name");
			assert.equal(oEvtDetail.targetType, "sap.ui.core.routing.Router", "for the right targetType");
			assert.equal(oEvtDetail.timestamp, new Date(2018, 0, 1).getTime(), "at correct time");
			assert.equal(oEvtDetail.additionalAttributes.hash, "/home", "with correct hash");

			// Clean up
			window.removeEventListener("UI5Event", fnAssertR1);

			// Prepare
			window.addEventListener("UI5Event", fnAssertR2);
			sUrl = router.getURL("r2");

			// Act
			HashChanger.getInstance().setHash(sUrl);
			that.sinon.clock.create().tick();
		}

		// Second routeMatched handler (in order to check the hash & previousHash property)
		function fnAssertR2(oEvent) {
			assert.ok(true, "Generic UI5Event is fired");
			assert.equal(oEvent.detail.additionalAttributes.hash, "/register", "with correct hash");
			assert.equal(oEvent.detail.additionalAttributes.previousHash, "/home", "with correct previous hash");

			//Clean up
			router.destroy();
			window.removeEventListener("UI5Event", fnAssertR2);
			done();
		}
	});

	QUnit.module("Private functions");

	QUnit.test("_shouldExpose function filters out excluded events ", function (assert) {
		assert.notOk(EventBroadcaster._shouldExpose("load", new Image()), "event 'load' should not be exposed");
		assert.notOk(EventBroadcaster._shouldExpose("load", new Image()), "event 'load' should not be exposed");
	});

	QUnit.test("_isTrackableControlEvent function filters out excluded events ", function (assert) {
		var oConfig = {
				global: ["modelContextChange", "beforeRendering", "afterRendering", "propertyChanged", "beforeGeometryChanged", "geometryChanged",
					"aggregationChanged", "componentCreated", "afterInit", "updateStarted", "updateFinished", "load", "scroll"],
			controls: {
				"sap.m.Button": {
					exclude: ["tap"]
				},
				"sap.m.Image": {
					include: ["load"]
				},
				"sap.m.Link": {}
			}
		};
		assert.notOk(EventBroadcaster._isTrackableControlEvent(oConfig, "tap", new Button()), "event 'tap' of the Button should not be tracked");
		assert.ok(EventBroadcaster._isTrackableControlEvent(oConfig, "load", new Image()), "event 'load' of the Image should be tracked");
		assert.notOk(EventBroadcaster._isTrackableControlEvent(oConfig, "click", new Link()), "control Link should not be tracked at all");
	});

	QUnit.test("_isValidConfig function", function (assert) {
		var oValidConfig = {
				global: [],
				controls: {}
		};
		var oValidConfig2 = {
				global: [],
				controls: {},
				something_else: []
		};
		var oInvalidConfig = {something: {}, something_else: "test"};
		var oInvalidConfig2 = {global: [], something: "test"};

		assert.ok(EventBroadcaster._isValidConfig(oValidConfig), "ExcludeList is valid");
		assert.ok(EventBroadcaster._isValidConfig(oValidConfig2), "ExcludeList containing 'global' and 'controls' is valid, even if it contains some additional properties");
		assert.notOk(EventBroadcaster._isValidConfig(oInvalidConfig), "ExcludeList is not valid");
		assert.notOk(EventBroadcaster._isValidConfig(oInvalidConfig2), "ExcludeList containing only one of the needed properties is not valid");
	});

});
