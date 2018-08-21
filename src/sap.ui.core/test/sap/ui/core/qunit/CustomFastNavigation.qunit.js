/*global QUnit */
sap.ui.define([
	"sap/ui/events/F6Navigation",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Control",
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.dom",
	"jquery.sap.strings"
], function(F6Navigation, KeyCodes, Control, qutils) {
	"use strict";

	// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM) and the target of the event instead of the activeElement
	// to be more focus independent (-> More test stability)
	F6Navigation.handleF6GroupNavigation_orig = F6Navigation.handleF6GroupNavigation;

	jQuery.sap.handleF6GroupNavigation = F6Navigation.handleF6GroupNavigation = function(oEvent, oSettings) {
		oSettings = oSettings ? oSettings : {};
		if (!oSettings.scope) {
			oSettings.scope = jQuery.sap.domById("scope");
		}
		if (!oSettings.target) {
			oSettings.target = oEvent.target;
		}
		F6Navigation.handleF6GroupNavigation_orig(oEvent, oSettings);
	};

	function triggerTestEvent(sTarget, bForward) {
		qutils.triggerKeydown(sTarget, KeyCodes.F6, !bForward, false, false);
	}

	var CustomAreaTestControl = Control.extend("my.CustomAreaTestControl", {

		metadata: {},

		renderer: {
			render: function(rm, oCtrl) {
				var id = oCtrl.getId();

				rm.write("<div");
				rm.writeControlData(oCtrl);
				rm.writeAttribute("data-sap-ui-customfastnavgroup", "true");
				rm.writeAttribute("class", "TestControl");
				rm.write(">");

				rm.write("<div><input value='2' id='", id, "-input-2'><input id='", id, "-input-2a'></div>");
				rm.write("<div><input value='1' id='", id, "-input-1'><input id='", id, "-input-1a'></div>");
				rm.write("<div><input value='3' id='", id, "-input-3'><input id='", id, "-input-3a'></div>");

				rm.write("</div>");
			}
		},

		onsapskipforward: function(oEvent) {
			var sTarget;
			if (jQuery.sap.startsWith(oEvent.target.id, this.getId() + "-input-1")) {
				sTarget = this.getId() + "-input-2";
			} else if (jQuery.sap.startsWith(oEvent.target.id, this.getId() + "-input-2")) {
				sTarget = this.getId() + "-input-3";
			}

			if (sTarget) {
				jQuery.sap.focus(jQuery.sap.domById(sTarget));
				oEvent.preventDefault();
			}
		},

		onsapskipback: function(oEvent) {
			var sTarget;
			if (jQuery.sap.startsWith(oEvent.target.id, this.getId() + "-input-2")) {
				sTarget = this.getId() + "-input-1";
			} else if (jQuery.sap.startsWith(oEvent.target.id, this.getId() + "-input-3")) {
				sTarget = this.getId() + "-input-2";
			}

			if (sTarget) {
				jQuery.sap.focus(jQuery.sap.domById(sTarget));
				oEvent.preventDefault();
			}
		},

		onBeforeFastNavigationFocus: function(oEvent) {
			if (jQuery.contains(this.getDomRef(), oEvent.source)) {
				return;
			}
			var oNewDomRef = oEvent.forward ? jQuery.sap.domById(this.getId() + "-input-1") : jQuery.sap.domById(this.getId() + "-input-3");
			if (oNewDomRef) {
				jQuery.sap.focus(oNewDomRef);
				oEvent.preventDefault();
			}
		}

	});

	var testControlId = "test";

	var oCustomArea = new CustomAreaTestControl(testControlId).placeAt("content");

	oCustomArea.onAfterRendering = function() {

		QUnit.test("Forward Navigation", function(assert) {
			var aFields = ["before", testControlId + "-input-1", testControlId + "-input-2", testControlId + "-input-3", "after", "before"];

			var mFocusSpy = {};
			for (var i = 0; i < aFields.length - 1; i++) {
				if(!mFocusSpy[aFields[i]]) {
					var oElement = document.getElementById(aFields[i]);
					var focusSpy = this.spy(oElement, "focus");
					mFocusSpy[aFields[i]] = focusSpy;
				}
			}

			for (var i = 0; i < aFields.length - 1; i++) {
				triggerTestEvent(aFields[i], true);
				assert.equal(mFocusSpy[aFields[i + 1]].firstCall.thisValue.id, aFields[i + 1], "Step " + (i + 1) + ": " + aFields[i] + "->" + aFields[i + 1]);
			}
		});

		QUnit.test("Backward Navigation", function(assert) {
			var aFields = ["before", "after", testControlId + "-input-3", testControlId + "-input-2", testControlId + "-input-1", "before"];


			var mFocusSpy = {};
			for (var i = 0; i < aFields.length - 1; i++) {
				if(!mFocusSpy[aFields[i]]) {
					var oElement = document.getElementById(aFields[i]);
					var focusSpy = this.spy(oElement, "focus");
					mFocusSpy[aFields[i]] = focusSpy;
				}
			}

			for (var i = 0; i < aFields.length - 1; i++) {
				triggerTestEvent(aFields[i], false);
				assert.equal(mFocusSpy[aFields[i + 1]].firstCall.thisValue.id, aFields[i + 1], "Step " + (i + 1) + ": " + aFields[i] + "->" + aFields[i + 1]);
			}
		});

		QUnit.start();

	};

});
