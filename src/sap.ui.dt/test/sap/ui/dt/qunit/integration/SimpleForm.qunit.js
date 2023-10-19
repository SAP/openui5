/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/dt/plugin/MouseSelection",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/layout/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	// preload simple form layouts to avoid async requests during test execution
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/ColumnLayout"
], function(
	DesignTime,
	OverlayRegistry,
	TabHandling,
	MouseSelection,
	CutPaste,
	XMLView,
	layoutLibrary,
	nextUIUpdate,
	Element
) {
	"use strict";

	var aMovableTypes = ["sap.ui.layout.form.FormElement", "sap.ui.layout.form.FormContainer"];

	function parameterizedTest(oSimpleFormLayout) {
		QUnit.module(`Given the SimpleForm using ${oSimpleFormLayout}`, {
			beforeEach(assert) {
				var done = assert.async();

				XMLView.create({id: "testView", viewName: "dt.view.TestSimpleForm"})
				.then(async function(oView) {
					this.oView = oView;
					var oSimpleForm = Element.getElementById("testView--SimpleForm0");
					/*
						 * Attention:
						 * this call can lead to async requests that postpone
						 * SimpleForm layouting & rendering after layouts are loaded and onAfterRendering
						 * therefore we need to preload all modules upfront
						 */
					oSimpleForm.setLayout(oSimpleFormLayout);
					this.oView.placeAt("qunit-fixture");

					await nextUIUpdate();

					var oTabHandlingPlugin = new TabHandling();
					var oSelectionPlugin = new MouseSelection();
					this.oCutPaste = new CutPaste({
						movableTypes: aMovableTypes
					});

					this.oDesignTime = new DesignTime({
						plugins: [oTabHandlingPlugin, oSelectionPlugin, this.oCutPaste],
						rootElements: [oView]
					});

					this.oDesignTime.attachEventOnce("synced", function() {
						done();
					});
				}.bind(this));
			},

			afterEach() {
				this.oView.destroy();
				this.oDesignTime.destroy();
			}
		}, function() {
			QUnit.test("When moving title1 to position of title2 using cut & paste", function(assert) {
				var oElementGroup1 = Element.getElementById("testView--Group1");
				var oElementGroup2 = Element.getElementById("testView--Group2");
				var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
				var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

				return whenCutAndPaste.call(this, oSourceOverlay, oTargetOverlay).then(function() {
					var oSimpleFormForm = Element.getElementById("testView--SimpleForm0--Form");
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, 2, "and the title1 is now located at index 3");
				});
			});

			QUnit.test("When moving title2 to position of title1 using cut & paste", function(assert) {
				var oElementGroup2 = Element.getElementById("testView--Group1");
				var oElementGroup1 = Element.getElementById("testView--Group2");
				var oSourceOverlay = OverlayRegistry.getOverlay(oElementGroup1.getParent());
				var oTargetOverlay = OverlayRegistry.getOverlay(oElementGroup2.getParent());

				return whenCutAndPaste.call(this, oSourceOverlay, oTargetOverlay).then(function() {
					var oSimpleFormForm = Element.getElementById("testView--SimpleForm0--Form");
					var aFormContainers = oSimpleFormForm.getFormContainers();
					var iPosition = aFormContainers.indexOf(oElementGroup1.getParent());
					assert.equal(iPosition, 2, "and the title2 is now located at index 2");
				});
			});

			QUnit.test("When moving within group1 first element to position of second element using cut & paste", function(assert) {
				var oElementBeforeInPosition0 = Element.getElementById("testView--Input1").getParent();
				var oElementBeforeInPosition1 = Element.getElementById("testView--Input3").getParent();
				var oSourceOverlay = OverlayRegistry.getOverlay(oElementBeforeInPosition0);
				var oTargetOverlay = OverlayRegistry.getOverlay(oElementBeforeInPosition1);

				return whenCutAndPaste.call(this, oSourceOverlay, oTargetOverlay).then(function() {
					var oSimpleFormForm = Element.getElementById("testView--SimpleForm0--Form");
					var oElementNowInPosition1 = oSimpleFormForm.getFormContainers()[1].getFormElements()[1];
					assert.equal(oElementNowInPosition1, oElementBeforeInPosition0, "the element was moved properly");
				});
			});

			QUnit.test("When moving label2 group element into empty first group0 using cut & paste", function(assert) {
				var oElement0 = Element.getElementById("testView--Input1").getParent();
				var oSourceOverlay = OverlayRegistry.getOverlay(oElement0);

				var oElement1 = Element.getElementById("testView--Group0");
				var oTargetOverlay = OverlayRegistry.getOverlay(oElement1);
				oTargetOverlay = oTargetOverlay.getParentElementOverlay();

				return whenCutAndPaste.call(this, oSourceOverlay, oTargetOverlay).then(function() {
					var oSimpleFormForm = Element.getElementById("testView--SimpleForm0--Form");
					var oElementNowInGroup0 = oSimpleFormForm.getFormContainers()[0].getFormElements()[0];
					assert.equal(oElementNowInGroup0, oElement0, "the element was moved properly");
				});
			});

			QUnit.test("When moving the first group element from group1 to the second element in group2", function(assert) {
				var oSourceElement = Element.getElementById("testView--Input1").getParent();
				var oTargetElement = Element.getElementById("testView--Input6").getParent();
				var oSourceOverlay = OverlayRegistry.getOverlay(oSourceElement);
				var oTargetOverlay = OverlayRegistry.getOverlay(oTargetElement);

				return whenCutAndPaste.call(this, oSourceOverlay, oTargetOverlay).then(function() {
					var oSimpleFormForm = Element.getElementById("testView--SimpleForm0--Form");
					var oElementInGroup2Position2 = oSimpleFormForm.getFormContainers()[2].getFormElements()[2];
					assert.equal(oElementInGroup2Position2, oSourceElement, "the element was moved properly");
				});
			});

			QUnit.test("When moving a group element from group1 to group2", function(assert) {
				var oSourceElement = Element.getElementById("testView--Input1").getParent();
				var oTargetElement = Element.getElementById("testView--Input6").getParent().getParent();
				var oSourceOverlay = OverlayRegistry.getOverlay(oSourceElement);
				var oTargetOverlay = OverlayRegistry.getOverlay(oTargetElement);

				return whenCutAndPaste.call(this, oSourceOverlay, oTargetOverlay).then(function() {
					var oSimpleFormForm = Element.getElementById("testView--SimpleForm0--Form");
					var oElementInGroup2Position0 = oSimpleFormForm.getFormContainers()[2].getFormElements()[0];
					assert.equal(oElementInGroup2Position0, oSourceElement, "the element was moved properly");
				});
			});
		});
	}

	function whenCutAndPaste(oSourceOverlay, oTargetOverlay) {
		return new Promise(function(resolve) {
			// although cut and paste is more or less sync, SimpleForm might react async
			this.oDesignTime.attachEventOnce("elementOverlayMoved", function() {
				resolve();
			});

			this.oCutPaste.cut(oSourceOverlay)
			.then(function() {
				this.oCutPaste.paste(oTargetOverlay);
			}.bind(this));
		}.bind(this));
	}

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var {SimpleFormLayout} = layoutLibrary.form;

	parameterizedTest(SimpleFormLayout.ResponsiveGridLayout);
	parameterizedTest(SimpleFormLayout.ColumnLayout);

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});