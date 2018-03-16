/* global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "sap/ui/dt");
}

jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.dt.OverlayRegistry");
jQuery.sap.require("sap.ui.dt.plugin.TabHandling");
jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
jQuery.sap.require("sap.ui.dt.plugin.CutPaste");
jQuery.sap.require("sap.ui.layout.form.ResponsiveLayout");
jQuery.sap.require("sap.ui.layout.form.ResponsiveLayout");
jQuery.sap.require("sap.ui.layout.ResponsiveFlowLayoutData");
jQuery.sap.require("sap.ui.layout.form.GridLayout");
jQuery.sap.require("sap.ui.layout.form.GridContainerData");
jQuery.sap.require("sap.ui.layout.form.GridElementData");

jQuery.sap.require("sap.ui.dt.plugin.ElementMover");
(function(DesignTime, OverlayRegistry, TabHandlingPlugin, MouseSelectionPlugin, CutPastePlugin, ElementMover) {
	"use strict";

	var aMOVABLE_TYPES = ["sap.ui.layout.form.FormElement", "sap.ui.layout.form.FormContainer"];

	var fnParamerizedTest = function(oSimpleFormLayout) {

		var oView;
		var oCutPaste;
		var oDesignTime;
		var oSimpleForm;

		QUnit.module("Given the SimpleForm using " + oSimpleFormLayout, {
			beforeEach : function(assert) {

				var done = assert.async();

				oView = sap.ui.xmlview("testView", "dt.view.TestSimpleForm");
				oSimpleForm = sap.ui.getCore().byId("testView--SimpleForm0");
				oSimpleForm.setLayout(oSimpleFormLayout);
				oView.placeAt("content");

				sap.ui.getCore().applyChanges();

				var oTabHandlingPlugin = new TabHandlingPlugin();
				var oSelectionPlugin = new MouseSelectionPlugin();
				oCutPaste = new CutPastePlugin({
					movableTypes : aMOVABLE_TYPES
				});

				oDesignTime = new sap.ui.dt.DesignTime({
					plugins : [oTabHandlingPlugin, oSelectionPlugin, oCutPaste],
					rootElements : [oView]
				});

				oDesignTime.attachEventOnce("synced", function() {
					done();
				});

			},

			afterEach : function() {
				oView.destroy();
				oDesignTime.destroy();
				oCutPaste.destroy();
			}
		});

		QUnit.test("When moving title1 to position of title2 using cut & paste", function(assert) {

			var oElementGroup1 = sap.ui.getCore().byId("testView--Group1");
			var oElementGroup2 = sap.ui.getCore().byId("testView--Group2");
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

			var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
			var aFormContainers = oSimpleFormForm.getFormContainers();
			var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
			assert.equal(iPosition, 2, "and the title1 is now located at index 2");

		});

		QUnit.test("When moving title2 to position of title1 using cut & paste", function(assert) {

			var oElementGroup2 = sap.ui.getCore().byId("testView--Group1");
			var oElementGroup1 = sap.ui.getCore().byId("testView--Group2");
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

			var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
			var aFormContainers = oSimpleFormForm.getFormContainers();
			var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
			assert.equal(iPosition, 1, "and the title2 is now located at index 1");

		});

		QUnit.test("When moving within group1 first element to position of second element using cut & paste", function(assert) {

			var oElementBeforeInPosition0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oElementBeforeInPosition1 = sap.ui.getCore().byId("testView--Input3").getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementBeforeInPosition0);
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementBeforeInPosition1);

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

			var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
			var oElementNowInPosition1 = oSimpleFormForm.getAggregation("form").
				getAggregation("formContainers")[1].
					getAggregation("formElements")[1];
			assert.equal(oElementNowInPosition1, oElementBeforeInPosition0, "the element was moved properly");

		});

		QUnit.test("When moving label2 group element into empty first group0 using cut & paste", function(assert) {

			var oElement0 = sap.ui.getCore().byId("testView--Input1").getParent();
			var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

			var oElement1 = sap.ui.getCore().byId("testView--Group0");
			var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
			oTargetOverlay = oTargetOverlay.getParentElementOverlay();

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

			var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form").getParent();
			var oElementNowInGroup0 = oSimpleFormForm.getAggregation("form").
				getAggregation("formContainers")[0].
					getAggregation("formElements")[0];
			assert.equal(oElementNowInGroup0, oElement0, "the element was moved properly");

		});

		// TODO!
		// QUnit.test("When moving title1 to position of title2 using drag & drop", function(assert) {



		// });

	};

	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.GridLayout);
	fnParamerizedTest(sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout);

}(sap.ui.dt.plugin.ElementMover, sap.ui.dt.OverlayRegistry, sap.ui.dt.plugin.TabHandling,
		sap.ui.dt.plugin.MouseSelection, sap.ui.dt.plugin.CutPaste));
