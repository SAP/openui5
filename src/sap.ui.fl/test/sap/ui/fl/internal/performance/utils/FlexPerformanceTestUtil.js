sap.ui.define([
	"sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/DatePicker",
	"sap/m/Slider",
	"sap/m/RatingIndicator",
	"sap/ui/layout/VerticalLayout",
	"sap/m/VBox",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
], function(
	XmlPreprocessor,
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	PersistenceWriteAPI,
	Layer,
	FlUtils,
	ChangePersistenceFactory,
	Button,
	Label,
	DatePicker,
	Slider,
	RatingIndicator,
	VerticalLayout,
	VBox,
	Log,
	nextUIUpdate,
	Element
) {
	"use strict";
	var sMassiveLabel = "applyChangesMassive";
	var sIdForStatus = "__duration";

	var FlexPerformanceTestUtil = {};

	function _areAllChangesApplied() {
		var oInstanceCache = ChangePersistenceFactory._instanceCache;
		var sComponent = Object.keys(oInstanceCache)[0];
		var {aChanges} = oInstanceCache[sComponent]._mChanges;
		return !aChanges.some(function(oChange) {
			return !oChange.isSuccessfullyApplied();
		});
	}

	function _writeData(sControlId) {
		sControlId ||= sIdForStatus;
		var oLayout = Element.getElementById("idMain1--Layout");
		var sDurationText = `${sMassiveLabel} = ${window.wpp.customMetrics[sMassiveLabel]} ms`;
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
		var aControlsToBeChanged = [].concat(fnAddControls(sControlId));
		return FlexRuntimeInfoAPI.waitForChanges({ selectors: aControlsToBeChanged })
		.then(async function() {
			FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
			if (!_areAllChangesApplied()) {
				var oLayout = Element.getElementById("idMain1--Layout");
				_addLabel(oLayout, "_error", "Error: not all changes were applied");
				throw new Error("Not all changes were applied");
			}
			_writeData();
			await nextUIUpdate();
		})
		.catch(function(vError) {
			Log.error(vError);
		});
	}

	/*
	 *	ContainerLayout (verticalLayout)
	 *		containerLabel (label)
	 *		Layout (verticalLayout)
	 *			initialLabel (label) -- will be added as selector to apply rename changes
	 */
	function _createControlForRename(sControlId) {
		var oLayout = Element.getElementById("idMain1--Layout");
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
		var oLayout = Element.getElementById("idMain1--Layout");
		var oTitleLabel = new Label(`${sControlId}.title`, {text: `${sControlId}.title`});
		var oInnerLabel = new Label(`${sControlId}.label`, {text: `${sControlId}.label`});
		var oDatePicker = new DatePicker(`${sControlId}.datePicker`);
		var oSlider = new Slider(`${sControlId}.slider`);
		var oRatingIndicator = new RatingIndicator(`${sControlId}.ratingIndicator`);
		var oButton = new Button(`${sControlId}.button`, {text: `${sControlId}.button`});
		var oVBox = new VBox(`${sControlId}.vbox`, {
			items: [
				oInnerLabel,
				oDatePicker,
				oSlider,
				oRatingIndicator,
				oButton
			]
		});
		var oInnerLayout = new VerticalLayout({
			id: `${sControlId}.layout`,
			content: [
				oTitleLabel,
				oVBox
			]
		});
		oLayout.addContent(oInnerLayout);
		return [
			oInnerLayout,
			oTitleLabel,
			oInnerLabel,
			oDatePicker,
			oSlider,
			oRatingIndicator,
			oButton,
			oVBox
		];
	}

	function _startRenameScenario() {
		return _startApplyScenario("idMain1--initialLabel", _createControlForRename);
	}

	function _startDiverseScenario() {
		return _startApplyScenario("idMain1--dependencyScenarioControl", _createControlsForDiverse);
	}

	function _startVariantsScenario() {
		_createControlsForDiverse("idMain1--dependencyScenarioControl");
		var oComponent = FlUtils.getAppComponentForControl(Element.getElementById("idMain1--Layout"));
		var oControlToBeChanged = Element.getElementById("idMain1--dependencyScenarioControl.vbox");

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
		var oVMControl = Element.getElementById("idMain1--variantManagementOrdersTable");
		var oControlToBeChanged = Element.getElementById("idMain1--dependencyScenarioControl.vbox");

		// wait for the initial changes to be applied
		return FlexRuntimeInfoAPI.waitForChanges({
			selectors: [oControlToBeChanged, oControlToBeChanged.getParent()].concat(oControlToBeChanged.getItems())
		})
		.then(function() {
			FlexPerformanceTestUtil.startMeasurement(sMassiveLabel);
			return oVMControl.getModel(ControlVariantApplyAPI.getVariantModelName())._handleSave(oVMControl, {
				name: "newVariant",
				layer: Layer.CUSTOMER
			});
		})
		.then(function() {
			FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
			_writeData();
			return PersistenceWriteAPI.reset({
				selector: oControlToBeChanged,
				layer: Layer.CUSTOMER,
				generator: "Change.createInitialFileContent"
			});
		})
		.then(PersistenceWriteAPI.reset.bind(null, {
			selector: oControlToBeChanged,
			layer: Layer.USER,
			generator: "Change.createInitialFileContent"
		}));
	}

	FlexPerformanceTestUtil.stopMeasurement = function(sMeasure) {
		sMeasure ||= sMassiveLabel;
		window.performance.measure(sMeasure, `${sMeasure}.start`);
		window.wpp.customMetrics[sMeasure] = window.performance.getEntriesByName(sMeasure)[0].duration;
	};

	FlexPerformanceTestUtil.startMeasurement = function(sMeasure) {
		sMeasure ||= sMassiveLabel;
		window.performance.mark(`${sMeasure}.start`);
	};

	FlexPerformanceTestUtil.startMeasurementForXmlPreprocessing = function() {
		// Monkey patching of FlexController.processXmlView function
		var fnOriginalProcessXmlView = XmlPreprocessor.process;
		XmlPreprocessor.process = function(...aArgs) {
			FlexPerformanceTestUtil.startMeasurement(sMassiveLabel);
			return fnOriginalProcessXmlView.apply(this, aArgs)
			.then(function(vReturn) {
				FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
				return vReturn;
			});
		};
	};

	FlexPerformanceTestUtil.waitForChangesAndWriteData = function(oControlToBeChanged) {
		return FlexRuntimeInfoAPI.waitForChanges({element: oControlToBeChanged}).then(function() {
			_writeData();
		});
	};

	FlexPerformanceTestUtil.showMeasurementData = function() {
		_writeData();
	};

	FlexPerformanceTestUtil.runPerformanceTests = function() {
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

	FlexPerformanceTestUtil.updateVariant = function(oComponent) {
		var oVariantModel = oComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		return oVariantModel.updateCurrentVariant({
			variantManagementReference: "idMain1--variantManagementOrdersTable",
			newVariantReference: "id_1570801327284_11",
			appComponent: oComponent
		});
	};

	window.runPerformanceTests = FlexPerformanceTestUtil.runPerformanceTests;

	return FlexPerformanceTestUtil;
}, true);
