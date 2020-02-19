sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/DatePicker",
	"sap/m/Slider",
	"sap/m/RatingIndicator",
	"sap/ui/layout/VerticalLayout",
	"sap/m/VBox",
	"sap/base/Log"
], function(
	FlexRuntimeInfoAPI,
	PersistenceWriteAPI,
	FlexControllerFactory,
	FlUtils,
	Button,
	Label,
	DatePicker,
	Slider,
	RatingIndicator,
	VerticalLayout,
	VBox,
	Log
) {
	"use strict";
	var sMassiveLabel = "applyChangesMassive";
	var sIdForStatus = "__duration";

	var FlexPerformanceTestUtil = {};

	function _writeData (sControlId) {
		sControlId = sControlId || sIdForStatus;
		var oLayout = sap.ui.getCore().byId("idMain1--Layout");
		var sDurationText = sMassiveLabel + " = " + window.wpp.customMetrics[sMassiveLabel] + " ms";
		Log.info(sDurationText);
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

	function _startApplyScenario(sControlId, fnAddControls) {
		FlexPerformanceTestUtil.startMeasurement(sMassiveLabel);
		var oControlToBeChanged = fnAddControls(sControlId);
		return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged})
		.then(function() {
			FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
			_writeData();
			sap.ui.getCore().applyChanges();
		})
		.catch(function (vError) {
			Log.error(vError);
		});
	}

	/*
	 *	ContainerLayout (verticalLayout)
	 *		containerLabel (label)
	 *		Layout (verticalLayout)
	 *			initialLabel (label) -- will be added as selector to apply rename changes
	 */
	function _createControlsForRename(sControlId) {
		var oLayout = sap.ui.getCore().byId("idMain1--Layout");
		var oControl = new Label(sControlId, {text: sControlId});
		oLayout.addContent(oControl);
		return oControl;
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
	function _createControlsForDiverse(sControlId) {
		var oLayout = sap.ui.getCore().byId("idMain1--Layout");
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

	function _startRenameScenario() {
		return _startApplyScenario("idMain1--initialLabel", _createControlsForRename);
	}

	function _startDiverseScenario() {
		return _startApplyScenario("idMain1--dependencyScenarioControl", _createControlsForDiverse);
	}

	function _startVariantsScenario() {
		_createControlsForDiverse("idMain1--dependencyScenarioControl");
		var oComponent = FlUtils.getAppComponentForControl(sap.ui.getCore().byId("idMain1--Layout"));
		var oControlToBeChanged = sap.ui.getCore().byId("idMain1--dependencyScenarioControl.vbox");

		return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged})
		.then(function() {
			FlexPerformanceTestUtil.startMeasurement();
			return FlexPerformanceTestUtil.updateVariant(oComponent);
		})
		.then(FlexPerformanceTestUtil.stopMeasurement)
		.then(FlexPerformanceTestUtil.showMeasurementData);
	}

	function _startSaveAsScenario() {
		_createControlsForDiverse("idMain1--dependencyScenarioControl");
		var oVMControl = sap.ui.getCore().byId("idMain1--variantManagementOrdersTable");
		var oControlToBeChanged = sap.ui.getCore().byId("idMain1--dependencyScenarioControl.vbox");

		// wait for the initial changes to be applied
		return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged})
		.then(function() {
			var oComponent = FlUtils.getAppComponentForControl(oControlToBeChanged);
			var oVariantModel = oComponent.getModel(FlUtils.VARIANT_MODEL_NAME);
			// enable CUSTOMER changes
			oVariantModel.setModelPropertiesForControl("idMain1--variantManagementOrdersTable", true, oVMControl);
			FlexPerformanceTestUtil.startMeasurement(sMassiveLabel);
			oVMControl.fireSave({
				def: false,
				overwrite: false,
				name: "newVariant"
			});
			return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged});
		})
		.then(function() {
			FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
			_writeData();
			return PersistenceWriteAPI.reset({
				selector: oControlToBeChanged,
				layer: "CUSTOMER",
				generator: "Change.createInitialFileContent"
			});
		})
		.then(PersistenceWriteAPI.reset.bind(null, {
			selector: oControlToBeChanged,
			layer: "USER",
			generator: "Change.createInitialFileContent"
		}));
	}

	FlexPerformanceTestUtil.stopMeasurement = function (sMeasure) {
		sMeasure = sMeasure || sMassiveLabel;
		window.performance.measure(sMeasure, sMeasure + ".start");
		window.wpp.customMetrics[sMeasure] = window.performance.getEntriesByName(sMeasure)[0].duration;
	};

	FlexPerformanceTestUtil.startMeasurement = function (sMeasure) {
		sMeasure = sMeasure || sMassiveLabel;
		window.performance.mark(sMeasure + ".start");
	};

	FlexPerformanceTestUtil.startMeasurementForXmlPreprocessing = function (oComponent) {
		// Monkey patching of FlexController.processXmlView function
		var oFlexController = FlexControllerFactory.createForControl(oComponent);
		var fnOriginalProcessXmlView = oFlexController.processXmlView.bind(oFlexController);
		oFlexController.processXmlView = function () {
			FlexPerformanceTestUtil.startMeasurement(sMassiveLabel);
			return fnOriginalProcessXmlView.apply(this, arguments)
				.then(function (vReturn) {
					FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
					return vReturn;
				});
		};
	};

	FlexPerformanceTestUtil.waitForChangesAndWriteData = function (oControlToBeChanged) {
		return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged}).then(function() {
			_writeData();
		});
	};

	FlexPerformanceTestUtil.showMeasurementData = function() {
		_writeData();
	};

	FlexPerformanceTestUtil.runPerformanceTests = function () {
		switch (FlUtils.getUrlParameter("sap-ui-fl-test-case")) {
			case "diverse":
				return _startDiverseScenario();
			case "variants":
				return _startVariantsScenario();
			case "saveas":
				return _startSaveAsScenario();
			case "rename":
			default:
				return _startRenameScenario();
		}
	};

	FlexPerformanceTestUtil.updateVariant = function (oComponent) {
		var oVariantModel = oComponent.getModel(FlUtils.VARIANT_MODEL_NAME);
		return oVariantModel.updateCurrentVariant("idMain1--variantManagementOrdersTable", "id_1570801327284_11", oComponent);
	};

	window.runPerformanceTests = FlexPerformanceTestUtil.runPerformanceTests;

	return FlexPerformanceTestUtil;
}, true);
