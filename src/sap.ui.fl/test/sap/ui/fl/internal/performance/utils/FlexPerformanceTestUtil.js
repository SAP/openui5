sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/DatePicker",
	"sap/m/Slider",
	"sap/m/RatingIndicator",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/VBox",
	"sap/base/Log"
], function (
	FlexRuntimeInfoAPI,
	FlexControllerFactory,
	FlUtils,
	Button,
	Label,
	DatePicker,
	Slider,
	RatingIndicator,
	VerticalLayout,
	HorizontalLayout,
	VBox,
	BaseLog
) {
	"use strict";
	var sMassiveLabel = "applyChangesMassive";
	var sIdForStatus = "__duration";

	function _writeData (oLayout, sControlId, sMeasure) {
		var sDurationText = sMeasure + " = " + window.wpp.customMetrics[sMeasure] + " ms";
		BaseLog.info(sDurationText);
		_addLabel(oLayout, sControlId, sDurationText);
		window.performance.clearMarks();
		window.performance.clearMeasures();
	}

	function _addLabel(oLayout, sControlId, sText) {
		var oControl = new Label(sControlId, {
			text: sText
		});
		oLayout.addContent(oControl);
	}

	function _startApplyScenario(sControlId, sMeasure, oLayout, fnAddControls) {
		var oPromise = Promise.resolve()
			.then(function() {
				// start performance measurement
				Util.startMeasurement(sMeasure);
				var oControlToBeChanged = fnAddControls(sControlId);
				return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged});
			})
			.then(function() {
				Util.stopMeasurement(sMeasure);
				_writeData(oLayout, sIdForStatus, sMeasure);
				sap.ui.getCore().applyChanges();
			});

		return oPromise
			.catch(function (vError) {
				BaseLog.error(vError);
			});
	}


	/*
	 *	ContainerLayout (verticalLayout)
	 *		containerLabel (label)
	 *		Layout (verticalLayout)
	 *			initialLabel (label) -- will be added as selector to apply rename changes
	 *			initialLabel1 (label) -- will be added as selector to apply rename changes
	 *			initialLabel2 (label) -- will be added as selector to apply rename changes
	 *			initialLabel3 (label) -- will be added as selector to apply rename changes
	 */
	function _startRenameScenario() {
		var oLayout = sap.ui.getCore().byId("idMain1--Layout");
		return _startApplyScenario(
			"idMain1--initialLabel",
			sMassiveLabel,
			oLayout,
			function (sControlId) {
				var oControl = new Label(sControlId, {text: sControlId});
				oLayout.addContent(oControl);
				return oControl;
			}
		);
	}

	/*
	 *	ContainerLayout (verticalLayout)
	 *		containerLabel (label)
	 *		Layout (verticalLayout)
	 *			Layout (verticalLayout) -- will be added as selector
	 *				.title (label) -- will be added as selector to apply changes
	 *				.vbox (label) -- will be added as selector to apply changes
	 *					.label (label) -- will be added as selector to apply changes
	 *					.datePicker (datePicker) -- will be added as selector to apply changes
	 *					.slider (slider) -- will be added as selector to apply changes
	 *					.ratingIndicator (ratingIndicator) -- will be added as selector to apply changes
	 *					.button (button) -- will be added as selector to apply changes
	 */
	function _startDiverseScenario() {
		var oLayout = sap.ui.getCore().byId("idMain1--Layout");
		return _startApplyScenario(
			"idMain1--dependencyScenarioControl",
			sMassiveLabel,
			oLayout,
			function (sControlId) {
				var oInnerLayout = new VerticalLayout({
					id : sControlId + ".layout",
					content :  [
						new Label(sControlId + ".title", {text: sControlId + ".title"}),
						new VBox(sControlId + ".vbox", {
							items: [
								new Label(sControlId + ".label", {text: sControlId + ".label"}),
								new DatePicker(sControlId + ".datePicker"),
								new Slider(sControlId + ".slider"),
								new RatingIndicator(sControlId + ".ratingIndicator"),
								new Button(sControlId + ".button", {text: sControlId + ".button"})
							]
						})
					]
				});
				oLayout.addContent(oInnerLayout);
				return oLayout;
			}
		);
	}

	var Util = {
		stopMeasurement: function (sMeasure) {
			sMeasure = sMeasure || sMassiveLabel;
			window.performance.measure(sMeasure, sMeasure + ".start");
			window.wpp.customMetrics[sMeasure] = window.performance.getEntriesByName(sMeasure)[0].duration;
		},

		startMeasurement: function (sMeasure) {
			sMeasure = sMeasure || sMassiveLabel;
			window.performance.mark(sMeasure + ".start");
		},

		startMeasurementForXmlPreprocessing: function (oComponent) {
			// Monkey patching of FlexController.processXmlView function
			var oFlexController = FlexControllerFactory.createForControl(oComponent);
			var fnOriginalProcessXmlView = oFlexController.processXmlView.bind(oFlexController);
			oFlexController.processXmlView = function () {
				Util.startMeasurement(sMassiveLabel);
				return fnOriginalProcessXmlView.apply(this, arguments)
					.then(function (vReturn) {
						Util.stopMeasurement(sMassiveLabel);
						return vReturn;
					});
			};
		},

		waitForChangesAndWriteData: function (oControlToBeChanged) {
			var oLayout = sap.ui.getCore().byId("idMain1--Layout");
			return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged})
				.then(function() {
					_writeData(oLayout, sIdForStatus, sMassiveLabel);
				});
		},

		runPerformanceTests: function () {
			switch (FlUtils.getUrlParameter("sap-ui-fl-test-case")) {
				case "rename":
					return _startRenameScenario();
				case "diverse":
				default:
					return _startDiverseScenario();

			}
		},

		createContent: function () {
			//create Vertical Layout
			var oLayout = new VerticalLayout(this.createId("Layout"));
			var oContainerLayout = new VerticalLayout({
				id : this.createId("ContainerLayout"),
				content :  [
					new Label(this.createId("containerLabel"), {
						text : "ContainerLayout"
					}),
					oLayout
				]
			});
			var oHorizontalLayout = new HorizontalLayout(this.createId("HorizontalLayout"), {
				content : [oContainerLayout]
			});
			return oHorizontalLayout;
		},

		updateVariant: function (oComponent) {
			var oVariantModel = oComponent.getModel(FlUtils.VARIANT_MODEL_NAME);
			return oVariantModel.updateCurrentVariant("idMain1--variantManagementOrdersTable", "id_1570801327284_11", oComponent);
		}
	};

	window.runPerformanceTests = Util.runPerformanceTests;

	return Util;
}, true);
