/*global QUnit */
sap.ui.define([
	"sap/ui/core/EventBus",
	"sap/ui/events/F6Navigation",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"../resources/fastnav"
], function(EventBus, F6Navigation, KeyCodes, qutils, fastnav) {
	"use strict";

	// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM) and the target of the event instead of the activeElement
	// to be more focus independent (-> More test stability)
	F6Navigation.handleF6GroupNavigation_orig = F6Navigation.handleF6GroupNavigation;

	F6Navigation.handleF6GroupNavigation = function(oEvent, oSettings) {
		oSettings = oSettings ? oSettings : {};
		if (!oSettings.scope) {
			oSettings.scope = document.getElementById("scope");
		}
		if (!oSettings.target) {
			oSettings.target = oEvent.target;
		}
		F6Navigation.handleF6GroupNavigation_orig(oEvent, oSettings);
	};

	function triggerTestEvent(sTarget, bForward, bUsingArrow) {
		if (bUsingArrow) {
			qutils.triggerKeydown(sTarget, bForward ? KeyCodes.ARROW_DOWN : KeyCodes.ARROW_UP, false, true, true);
		} else {
			qutils.triggerKeydown(sTarget, KeyCodes.F6, !bForward, false, false);
		}
	}



	EventBus.getInstance().subscribe("fastnav", "screenready", function() {
		// exports of 'fastnav'
		var oPopup1 = window.oPopup1;
		var oPopup2 = window.oPopup2;
		var oPopup3 = window.oPopup3;
		var oPopup4 = window.oPopup4;
		var oPopup5 = window.oPopup5;
		var oPopup6 = window.oPopup6;
		var oPopup7 = window.oPopup7;

		function injectFocusSpies(oContext, aFields, fnGenerateId){

			if (!fnGenerateId) {
				fnGenerateId = function(id) {
					return id;
				};
			}
			var mFocusSpy = {};
			for (var i = 0; i < aFields.length; i++) {
				var sId = fnGenerateId(aFields[i]);
				if (!mFocusSpy[sId]) {
					var oElement = document.getElementById(sId);
					if (oElement) {
						var focusSpy = oContext.spy(oElement, "focus");
						mFocusSpy[sId] = focusSpy;
					}
				}
			}
			return mFocusSpy;
		}

		var fnPrefixId = function(sId){
			return "id" + sId;
		};


		QUnit.module("Fast Navigation");

		QUnit.test("Page initialized", function(assert) {
			assert.ok(document.getElementById("content").children.length > 0, "Page initialized");
		});

		QUnit.test("Forward Navigation using F6", function(assert) {
			var aFields = [95, 98, 131, 136, 139, 142, 144, 145, 147, 92];

			var mSpies = injectFocusSpies(this, aFields, fnPrefixId);

			for (var i = 0; i < aFields.length - 1; i++) {
				triggerTestEvent("id" + aFields[i], true);
				assert.equal(mSpies["id" + aFields[i + 1]].firstCall.thisValue.id, "id" + aFields[i + 1], "Step " + (i + 1) + ": " + aFields[i] + "->" + aFields[i + 1]);
			}
		});

		QUnit.test("Backward Navigation using F6", function(assert) {
			var aFields = [95, 147, 145, 144, 142, 139, 136, 131, 98, 92];

			var mSpies = injectFocusSpies(this, aFields, fnPrefixId);

			for (var i = 0; i < aFields.length - 1; i++) {
				triggerTestEvent("id" + aFields[i], false);
				assert.equal(mSpies["id" + aFields[i + 1]].firstCall.thisValue.id, "id" + aFields[i + 1], "Step " + (i + 1) + ": " + aFields[i] + "->" + aFields[i + 1]);
			}
		});

		QUnit.test("Forward Navigation using 'ctrl' + 'alt' + 'ArrowUp/ArrowDown'", function(assert) {
			var aFields = [95, 98, 131, 136, 139, 142, 144, 145, 147, 92];

			var mSpies = injectFocusSpies(this, aFields, fnPrefixId);

			for (var i = 0; i < aFields.length - 1; i++) {
				triggerTestEvent("id" + aFields[i], true, true);
				assert.equal(mSpies["id" + aFields[i + 1]].firstCall.thisValue.id, "id" + aFields[i + 1], "Step " + (i + 1) + ": " + aFields[i] + "->" + aFields[i + 1]);
			}
		});

		QUnit.test("Backward Navigation using 'ctrl' + 'alt' + 'ArrowUp/ArrowDown'", function(assert) {
			var aFields = [95, 147, 145, 144, 142, 139, 136, 131, 98, 92];

			var mSpies = injectFocusSpies(this, aFields, fnPrefixId);

			for (var i = 0; i < aFields.length - 1; i++) {
				triggerTestEvent("id" + aFields[i], false, true);
				assert.equal(mSpies["id" + aFields[i + 1]].firstCall.thisValue.id, "id" + aFields[i + 1], "Step " + (i + 1) + ": " + aFields[i] + "->" + aFields[i + 1]);
			}
		});

		QUnit.test("Non-Modal Popup - Nav Mode NONE", function(assert) {

			qutils.triggerEvent("click", "openPopup1");

			var mSpies = injectFocusSpies(this, ["id1"]);

			triggerTestEvent("id1", true);
			assert.notOk(mSpies["id1"].callCount, "F6 on non-modal Popup with Nav Mode NONE has no effect");
			triggerTestEvent("id1", false);
			assert.notOk(mSpies["id1"].callCount, "Shift+F6 on non-modal Popup with Nav Mode NONE has no effect");

			oPopup1.close(0);
		});

		QUnit.test("Non-Modal Popup - Nav Mode DOCK", function(assert) {
			qutils.triggerEvent("click", "openPopup2");

			var mSpies = injectFocusSpies(this, ["id98", "id147"]);

			triggerTestEvent("id14", true);
			assert.equal(mSpies["id98"].firstCall.thisValue.id, "id98", "F6 on non-modal Popup with Nav Mode DOCK moves the focus to next element in F6 chain after the dock element");
			triggerTestEvent("id14", false);
			assert.equal(mSpies["id147"].firstCall.thisValue.id, "id147", "Shift+F6 on non-modal Popup with Nav Mode DOCK moves the focus to previous element in F6 chain before the dock element");

			oPopup2.close(0);
		});

		QUnit.test("Non-Modal Popup - Nav Mode SCOPE", function(assert) {
			qutils.triggerEvent("click", "openPopup3");

			var mSpies = injectFocusSpies(this, ["id33", "id27"]);

			triggerTestEvent("id27", true);
			assert.equal(mSpies["id33"].firstCall.thisValue.id, "id33", "Step 1: 27->33");
			assert.equal(mSpies["id33"].callCount, 1, "Step 1: 27->33");
			triggerTestEvent("id33", true);
			assert.equal(mSpies["id27"].firstCall.thisValue.id, "id27", "Step 2: 33->27");
			assert.equal(mSpies["id27"].callCount, 1, "Step 2: 33->27");
			triggerTestEvent("id27", false);
			assert.equal(mSpies["id33"].firstCall.thisValue.id, "id33", "Step 3: 27->33");
			assert.equal(mSpies["id33"].callCount, 2, "Step 3: 27->33");
			triggerTestEvent("id33", false);
			assert.equal(mSpies["id27"].firstCall.thisValue.id, "id27", "Step 4: 33->27");
			assert.equal(mSpies["id27"].callCount, 2, "Step 4: 33->27");

			oPopup3.close(0);
		});

		QUnit.test("Modal Popup - Nav Mode NONE", function(assert) {
			qutils.triggerEvent("click", "openPopup4");
			var mSpies = injectFocusSpies(this, ["id40"]);

			triggerTestEvent("id40", true);
			assert.notOk(mSpies["id40"].callCount, "F6 on modal Popup with Nav Mode NONE has no effect");
			triggerTestEvent("id40", false);
			assert.notOk(mSpies["id40"].callCount, "Shift+F6 on modal Popup with Nav Mode NONE has no effect");

			oPopup4.close(0);
		});

		QUnit.test("Modal Popup - Nav Mode SCOPE", function(assert) {
			qutils.triggerEvent("click", "openPopup5");

			var mSpies = injectFocusSpies(this, ["id53", "id59"]);

			triggerTestEvent("id53", true);
			assert.equal(mSpies["id59"].firstCall.thisValue.id, "id59", "Step 1: 53->59");
			assert.equal(mSpies["id59"].callCount, 1, "Step 1: 53->59");
			triggerTestEvent("id59", true);
			assert.equal(mSpies["id53"].firstCall.thisValue.id, "id53", "Step 2: 59->53");
			assert.equal(mSpies["id53"].callCount, 1, "Step 2: 59->53");
			triggerTestEvent("id53", false);
			assert.equal(mSpies["id59"].firstCall.thisValue.id, "id59", "Step 3: 53->59");
			assert.equal(mSpies["id59"].callCount, 2, "Step 3: 53->59");
			triggerTestEvent("id59", false);
			assert.equal(mSpies["id53"].firstCall.thisValue.id, "id53", "Step 4: 59->53");
			assert.equal(mSpies["id53"].callCount, 2, "Step 4: 59->53");

			oPopup5.close(0);
		});

		QUnit.test("Modal Popup - Nav Mode SCOPE and inner non-modal popup with Nav Mode DOCK", function(assert) {

			qutils.triggerEvent("click", "openPopup6");

			var mSpies = injectFocusSpies(this, ["id79"]);
			qutils.triggerEvent("click", "openPopup7");

			triggerTestEvent("id66", true);
			assert.equal(mSpies["id79"].firstCall.thisValue.id, "id79", "F6 on non-modal Popup with Nav Mode DOCK moves the focus to next element in F6 chain after the dock element");
			assert.equal(mSpies["id79"].callCount, 1, "called 1 time");
			triggerTestEvent("id66", false);
			assert.equal(mSpies["id79"].firstCall.thisValue.id, "id79", "Shift+F6 on non-modal Popup with Nav Mode DOCK moves the focus to previous element in F6 chain before the dock element");
			assert.equal(mSpies["id79"].callCount, 2, "called 2 times");

			oPopup7.close(0);
			oPopup6.close(0);
		});

		QUnit.start();

	});
});
