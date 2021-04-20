/*global QUnit */
sap.ui.define([
	"sap/ui/test/actions/Scroll",
	"sap/ui/test/actions/Press",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/thirdparty/jquery"
], function (Scroll, Press, Opa5, opaTest, $) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true
	});

	QUnit.module("Scroll");

	function isInViewport (element) {
		var mRect = element.getBoundingClientRect();
		return mRect.top >= 0 && mRect.left >= 0 &&
			mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			mRect.right <= (window.innerWidth || document.documentElement.clientWidth);
	}

	opaTest("Should scroll in control - ObjectPageLayout", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.uxap.sample.ObjectPageLazyLoadingWithoutBlocks"
			}
		});

		Then.waitFor({
			controlType: "sap.uxap.ObjectPageSubSection",
			properties: {
				title: "Section 20"
			},
			success: function  (aControls) {
				Opa5.assert.ok(!isInViewport(aControls[0].getDomRef()), "The page is in initial state");
			}
		});

		When.waitFor({
			controlType: "sap.uxap.ObjectPageLayout",
			actions: new Scroll({
				x: 0,
				y: 2200
			})
		});

		Then.waitFor({
			controlType: "sap.uxap.ObjectPageSubSection",
			properties: {
				title: "Section 20"
			},
			success: function  (aControls) {
				Opa5.assert.ok(isInViewport(aControls[0].getDomRef()), "The page is scrolled");
			}
		});

		Then.iTeardownMyApp();
	});

	opaTest("Should scroll in control - Dialog", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.m.sample.Dialog"
			}
		});

		When.waitFor({
			controlType: "sap.m.Button",
			properties: {
				text: "Dialog"
			},
			actions: new Press()
		});

		Then.waitFor({
			controlType: "sap.m.StandardListItem",
			properties: {
				title: "Mousepad"
			},
			success: function  (aControls) {
				Opa5.assert.ok(!isInViewport(aControls[0].getDomRef()), "The page is in initial state");
			}
		});

		When.waitFor({
			controlType: "sap.m.Dialog",
			actions: new Scroll({
				x: 0,
				y: 1000
			})
		});

		Then.waitFor({
			controlType: "sap.m.StandardListItem",
			properties: {
				title: "Mousepad"
			},
			success: function  (aControls) {
				Opa5.assert.ok(isInViewport(aControls[0].getDomRef()), "The page is scrolled");
			}
		});

		Then.iTeardownMyApp();
	});

});
