/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/dt/plugin/MouseSelection",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/layout/form/ResponsiveLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/layout/form/GridLayout",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/dt/plugin/ElementMover",
	"sap/ui/core/mvc/XMLView"
],
function (
	DesignTime,
	OverlayRegistry,
	TabHandling,
	MouseSelection,
	CutPaste,
	ResponsiveLayout,
	ResponsiveFlowLayoutData,
	GridLayout,
	GridContainerData,
	GridElementData,
	ElementMover,
	XMLView
) {
	"use strict";

	var aMOVABLE_TYPES = ["sap.ui.layout.form.FormElement", "sap.ui.layout.form.FormContainer"];

	var fnParamerizedTest = function(oSimpleFormLayout) {

		QUnit.module("Given the SimpleForm using " + oSimpleFormLayout, {
			beforeEach : function(assert) {

				var done = assert.async();

				XMLView.create({id: "testView", viewName: "dt.view.TestSimpleForm"})
					.then(function (oView) {
						this.oView = oView;
						var oSimpleForm = sap.ui.getCore().byId("testView--SimpleForm0");
						oSimpleForm.setLayout(oSimpleFormLayout);
						this.oView.placeAt("qunit-fixture");

						sap.ui.getCore().applyChanges();

						var oTabHandlingPlugin = new TabHandling();
						var oSelectionPlugin = new MouseSelection();
						var oCutPaste = new CutPaste({
							movableTypes: aMOVABLE_TYPES
						});

						this.oDesignTime = new DesignTime({
							plugins: [oTabHandlingPlugin, oSelectionPlugin, oCutPaste],
							rootElements: [oView]
						});

						this.oDesignTime.attachEventOnce("synced", function () {
							done();
						});
					}.bind(this));
			},

			afterEach : function() {
				this.oView.destroy();
				this.oDesignTime.destroy();
			}
		});

		QUnit.test("When moving title1 to position of title2 using cut & paste", function(assert) {
			var oCutPaste = this.oDesignTime.getPlugins()[2];
			var oElementGroup1 = sap.ui.getCore().byId("testView--Group1");
			var oElementGroup2 = sap.ui.getCore().byId("testView--Group2");
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

			var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
			var aFormContainers = oSimpleFormForm.getFormContainers();
			var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
			assert.equal(iPosition, 3, "and the title1 is now located at index 3");

		});

		QUnit.test("When moving title2 to position of title1 using cut & paste", function(assert) {
			var oCutPaste = this.oDesignTime.getPlugins()[2];
			var oElementGroup2 = sap.ui.getCore().byId("testView--Group1");
			var oElementGroup1 = sap.ui.getCore().byId("testView--Group2");
			var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
			var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

			oCutPaste.cut(oSourceOverlay);
			oCutPaste.paste(oTargetOverlay);

			var oSimpleFormForm = sap.ui.getCore().byId("testView--SimpleForm0--Form");
			var aFormContainers = oSimpleFormForm.getFormContainers();
			var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
			assert.equal(iPosition, 2, "and the title2 is now located at index 2");

		});

		QUnit.test("When moving within group1 first element to position of second element using cut & paste", function(assert) {
			var oCutPaste = this.oDesignTime.getPlugins()[2];
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
			var oCutPaste = this.oDesignTime.getPlugins()[2];
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

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
