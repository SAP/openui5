(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/Link",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Link, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Link",
			create: function () {
				return new Link();
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Remove and reveal actions
		var fnConfirmLinkIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), false, "then the Link element is invisible");
		};

		var fnConfirmLinkIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), true, "then the Link element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com"/>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myLink"
			},
			afterAction: fnConfirmLinkIsInvisible,
			afterUndo: fnConfirmLinkIsVisible,
			afterRedo: fnConfirmLinkIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myLink"
			},
			afterAction: fnConfirmLinkIsVisible,
			afterUndo: fnConfirmLinkIsInvisible,
			afterRedo: fnConfirmLinkIsVisible
		});
	});
})();
