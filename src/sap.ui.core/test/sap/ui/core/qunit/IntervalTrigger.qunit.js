/* global QUnit */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IntervalTrigger",
	"sap/m/Button",
	"sap/m/ButtonRenderer",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(Control, IntervalTrigger, Button, ButtonRenderer, HorizontalLayout, VerticalLayout, createAndAppendDiv) {
	"use strict";

	createAndAppendDiv("triggers");

	var iListeners = 10;

	var mySampleListener = Control.extend("mySampleListener", {
		init: function() {
			this._bGreenBG = false;
		},

		metadata: {
			properties: {
				"index": "int"
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sampleListener");
				oRm.style("display", "inline-block");
				oRm.style("margin", "2px");
				oRm.style("padding", "3px 5px");
				oRm.style("width", "20rem");
				oRm.style("text-align", "center");
				oRm.openEnd();

				oRm.text("Lorem Ipsum");

				oRm.close("div");
			}
		},

		onclick: function(oEvent) {
			this.trigger();
		},

		trigger: function() {
			this._bGreenBG = !this._bGreenBG;

			if (this._bGreenBG) {
				this.$().css("background-color", "green");
			} else {
				this.$().css("background-color", "red");
			}
		}
	});

	function removeListener(oTriggerBtn) {
		var index = oTriggerBtn.getIndex();
		oTrigger.removeListener(aListeners[index].trigger, aListeners[index]);
	}

	var oTrigger = new IntervalTrigger();

	var myTriggerButton = Button.extend("myTriggerButton", {
		metadata: {
			properties: {
				"index": "int"
			}
		},

		renderer: ButtonRenderer
	});

	var aListeners = [];
	var oBtn = {};
	var oLayout = new VerticalLayout().placeAt("triggers");

	function onPress() {
		removeListener(this);
	}

	for (var i = 0; i < iListeners; i++) {
		aListeners[i] = new mySampleListener();
		oBtn = new myTriggerButton({
			text: "Remove from trigger",
			index: i,
			press: onPress
		});

		oLayout.addContent(
			new HorizontalLayout({
				content: [aListeners[i], oBtn]
			})
		);
		oTrigger.addListener(aListeners[i].trigger, aListeners[i]);
	}

	QUnit.module("Basics");

	QUnit.test("All listeners registered", function(assert) {
		assert.expect(1);

		var id = "sapUiIntervalTrigger-event";
		var aList = oTrigger._oEventBus._defaultChannel.mEventRegistry[id];
		var bTest = aList.length === iListeners ? true : false;

		assert.ok(bTest, "All " + iListeners + " listeners successfully registered within EventProvider");
	});

	QUnit.test("Test triggering", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oldColorIsGreen = aListeners[0]._bGreenBG;
		var newColorIsGreen = false;
		var stillIsGreen = false;

		// start triggering
		oTrigger.setInterval(500);

		setTimeout(function() {
			newColorIsGreen = aListeners[0]._bGreenBG;

			var bTest = oldColorIsGreen !== newColorIsGreen ? true : false;
			assert.ok(bTest, "Triggering occured");

			// stop triggering
			oTrigger.setInterval(0);

			setTimeout(function() {
				stillIsGreen = aListeners[0]._bGreenBG;
				bTest = newColorIsGreen === stillIsGreen ? true : false;

				assert.ok(bTest, "Triggering stopped but listeners still registered");

				done();
			}, 500);
		}, 250);
	});

	QUnit.test("Remove listeners", function(assert) {
		assert.expect(1);
		oTrigger.removeListener(aListeners[0].trigger, aListeners[0]);
		oTrigger.removeListener(aListeners[1].trigger, aListeners[1]);

		var id = "sapUiIntervalTrigger-event";
		var aList = oTrigger._oEventBus._defaultChannel.mEventRegistry[id];
		var bTest = aList.length === (iListeners - 2) ? true : false;

		assert.ok(bTest, "2 listeners successfully removed from EventProvider");
	});

	QUnit.test("Removed listeners don't trigger", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oldColorIsGreen = aListeners[0]._bGreenBG;
		var newColorIsGreen = false;

		var iOtherIndex = 3;
		var otherOldColorIsGreen = aListeners[iOtherIndex]._bGreenBG;
		var otherNewColorIsGreen = false;

		// start triggering
		oTrigger.setInterval(500);

		setTimeout(function() {
			newColorIsGreen = aListeners[0]._bGreenBG;

			var bTest = oldColorIsGreen === newColorIsGreen ? true : false;
			assert.ok(bTest, "Triggering didn't occure for removed listener");

			// stop triggering
			oTrigger.setInterval(0);

			setTimeout(function() {
				otherNewColorIsGreen = aListeners[iOtherIndex]._bGreenBG;
				bTest = otherOldColorIsGreen !== otherNewColorIsGreen ? true : false;

				assert.ok(bTest, "Triggering occured for other listeners");

				done();
			}, 500);
		}, 250);
	});

	QUnit.test("Test if trigger stops when all listeners removed", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oldColorIsGreen = aListeners[3]._bGreenBG;
		var newColorIsGreen = false;

		// start trigger
		oTrigger.setInterval(500);

		setTimeout(function() {
			newColorIsGreen = aListeners[3]._bGreenBG;

			var bTest = oldColorIsGreen !== newColorIsGreen ? true : false;
			assert.ok(bTest, "Trigger is running");

			// remove all listeners
			for (var i = 0; i < iListeners; i++) {
				oTrigger.removeListener(aListeners[i].trigger, aListeners[i]);
			}

			setTimeout(function() {
				newColorIsGreen = aListeners[3]._bGreenBG;
				bTest = oldColorIsGreen !== newColorIsGreen ? true : false;

				assert.ok(bTest, "Trigger stopped due to no listeners available");

				done();
			}, 250);
		}, 250);
	});

	QUnit.test("Singleton access", function(assert) {
		var done = assert.async();
		assert.expect(9);
		assert.equal(typeof IntervalTrigger.addListener, "function", "must be a function");
		assert.equal(typeof IntervalTrigger.removeListener, "function", "must be a function");
		assert.equal(typeof IntervalTrigger.destroy, "undefined", "destroy must not be exposed since it modifies the global singleton");
		assert.equal(typeof IntervalTrigger.setInterval, "undefined", "setInterval must not be exposed since it modifies the global singleton");

		var oTasks = {};
		oTasks.run = function() {
			assert.ok(true, "internal task executed");
		};
		var oTaskSpy = this.spy(oTasks, "run");

		var iExpectedCallCount = 0;
		setTimeout(function() {
			iExpectedCallCount = oTaskSpy.callCount;
			assert.ok(iExpectedCallCount > 1, "Listener was called a second time by the iteration.");
			IntervalTrigger.removeListener(oTasks.run);
			setTimeout(function() {
				assert.equal(oTaskSpy.callCount, iExpectedCallCount, "Listener was removed and not called again.");
				oTaskSpy.restore();
				done();
			}, 300);
		}, 300);

		IntervalTrigger.addListener(oTasks.run);
		assert.equal(oTaskSpy.callCount, 1, "Listener was called once after adding it.");
	});
});