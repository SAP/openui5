/* global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "sap/ui/dt");
}

jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");

(function(DesignTime, OverlayRegistry) {
	"use strict";

	var oView;
	var oDesignTime;

	QUnit.module("Given a ObjectPage with an invisible Section", {
		beforeEach : function(assert) {

			var done = assert.async();

			oView = sap.ui.xmlview("testView", "sap.ui.dt.demo.ObjectPageWithDesignTime");
			oDesignTime = oView.getController().oDesignTime;

			oDesignTime.attachEventOnce("synced", function() {
				done();
			});

			oView.placeAt("content");
			sap.ui.getCore().applyChanges();

		},

		afterEach : function() {
			oView.destroy();
			oDesignTime.destroy();
		}
	});

	QUnit.test("When revealing the invisible Section", function(assert) {
		var done = assert.async();

		var oInvisibleSection = sap.ui.getCore().byId("testView--invisibleSection");
		oInvisibleSection.setVisible(true);

		oDesignTime.attachEventOnce("synced", function() {
			var oLabel = sap.ui.getCore().byId("testView--name5");
			var oLabelOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oLabel.getId());
			sap.ui.getCore().applyChanges();
			assert.deepEqual(oLabelOverlay.$().offset(), oLabelOverlay.getElementInstance().$().offset(), "then the style is set and overlay position is correct");
			done();
		});
	});

}());
