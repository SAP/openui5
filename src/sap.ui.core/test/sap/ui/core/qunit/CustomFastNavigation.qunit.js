/*global QUnit */
sap.ui.define([
	"sap/ui/events/F6Navigation",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Control",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/jquery"
], function(F6Navigation, KeyCodes, Control, qutils, jQuery) {
	"use strict";

	jQuery("<div id=\"scope\"></div>").append(
		"<input value=\"0\" id=\"before\">",
		jQuery("<div id=\"content\"></div>").css("padding", "5px"),
		"<input value=\"4\" id=\"after\">"
	).appendTo("body");

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

	function triggerTestEvent(sTarget, bForward) {
		qutils.triggerKeydown(sTarget, KeyCodes.F6, !bForward, false, false);
	}

	var CustomAreaTestControl = Control.extend("my.CustomAreaTestControl", {

		metadata: {},

		renderer: {

			apiVersion: 2,

			render: function(rm, oCtrl) {
				var id = oCtrl.getId();

				rm.openStart("div", oCtrl)
					.attr("data-sap-ui-customfastnavgroup", "true")
					.style("border", "1px solid black")
					.style("padding", "5px");

				rm.openEnd();

					rm.openStart("div")
						.style("border", "1px solid green")
						.style("padding", "5px")
						.openEnd();
						rm.voidStart("input", id + "-input-2").attr("value", "2").voidEnd();
						rm.voidStart("input", id + "-input-2a").voidEnd();
					rm.close("div");
					rm.openStart("div")
						.style("border", "1px solid green")
						.style("padding", "5px")
						.openEnd();
						rm.voidStart("input", id + "-input-1").attr("value", "1").voidEnd();
						rm.voidStart("input", id + "-input-1a").voidEnd();
					rm.close("div");
					rm.openStart("div")
						.style("border", "1px solid green")
						.style("padding", "5px")
						.openEnd();
						rm.voidStart("input", id + "-input-3").attr("value", "3").voidEnd();
						rm.voidStart("input", id + "-input-3a").voidEnd();
					rm.close("div");

				rm.close("div");
			}
		},

		onsapskipforward: function(oEvent) {
			var sTarget;
			if (oEvent.target.id && oEvent.target.id.startsWith(this.getId() + "-input-1")) {
				sTarget = this.getId() + "-input-2";
			} else if (oEvent.target.id && oEvent.target.id.startsWith(this.getId() + "-input-2")) {
				sTarget = this.getId() + "-input-3";
			}

			if (sTarget) {
				document.getElementById(sTarget).focus();
				oEvent.preventDefault();
			}
		},

		onsapskipback: function(oEvent) {
			var sTarget;
			if (oEvent.target.id && oEvent.target.id.startsWith(this.getId() + "-input-2")) {
				sTarget = this.getId() + "-input-1";
			} else if (oEvent.target.id && oEvent.target.id.startsWith(this.getId() + "-input-3")) {
				sTarget = this.getId() + "-input-2";
			}

			if (sTarget) {
				document.getElementById(sTarget).focus();
				oEvent.preventDefault();
			}
		},

		onBeforeFastNavigationFocus: function(oEvent) {
			if (jQuery.contains(this.getDomRef(), oEvent.source)) {
				return;
			}
			var oNewDomRef = oEvent.forward ? this.getDomRef("input-1") : this.getDomRef("input-3");
			if (oNewDomRef) {
				oNewDomRef.focus();
				oEvent.preventDefault();
			}
		}

	});

	var testControlId = "test";

	var oCustomArea = new CustomAreaTestControl(testControlId).placeAt("content");

	oCustomArea.onAfterRendering = function() {

		QUnit.module("");

		QUnit.test("Forward Navigation", function(assert) {
			var aFields = ["before", testControlId + "-input-1", testControlId + "-input-2", testControlId + "-input-3", "after", "before"];

			var mFocusSpy = {};
			for (var i = 0; i < aFields.length - 1; i++) {
				if (!mFocusSpy[aFields[i]]) {
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
				if (!mFocusSpy[aFields[i]]) {
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
