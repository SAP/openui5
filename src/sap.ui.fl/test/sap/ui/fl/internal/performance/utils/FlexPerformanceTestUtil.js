sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/DatePicker",
	"sap/m/Label",
	"sap/m/RatingIndicator",
	"sap/m/Slider",
	"sap/m/VBox",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Log,
	Button,
	DatePicker,
	Label,
	RatingIndicator,
	Slider,
	VBox,
	Element,
	FlexObjectState,
	XmlPreprocessor,
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	PersistenceWriteAPI,
	Layer,
	FlUtils,
	VerticalLayout,
	nextUIUpdate
) {
	"use strict";
	var sMassiveLabel = "applyChangesMassive";
	var sIdForStatus = "__duration";

	var FlexPerformanceTestUtil = {};

	function areAllChangesApplied() {
		const {aChanges} = FlexObjectState.getLiveDependencyMap("fl.performance.flexApplyChanges");
		return !aChanges.some(function(oChange) {
			return !oChange.isSuccessfullyApplied();
		});
	}

	function writeData(sControlId) {
		sControlId ||= sIdForStatus;
		var oLayout = Element.getElementById("idMain1--Layout");
		var sDurationText = `${sMassiveLabel} = ${window.wpp.customMetrics[sMassiveLabel]} ms`;
		Log.info(sDurationText);
		if (!Element.getElementById(sControlId)) {
			addLabel(oLayout, sControlId, sDurationText);
		} else {
			Element.getElementById(sControlId).setText(sDurationText);
		}
		performance.clearMarks();
		performance.clearMeasures();
	}

	function addLabel(oLayout, sControlId, sText) {
		var oControl = new Label(sControlId, {
			text: sText
		});
		oLayout.addContent(oControl);
	}

	function startApplyScenario(sControlId, fnAddControls) {
		FlexPerformanceTestUtil.startMeasurement(sMassiveLabel);
		var aControlsToBeChanged = [].concat(fnAddControls(sControlId));
		return FlexRuntimeInfoAPI.waitForChanges({ selectors: aControlsToBeChanged })
		.then(async function() {
			FlexPerformanceTestUtil.stopMeasurement(sMassiveLabel);
			if (!areAllChangesApplied()) {
				var oLayout = Element.getElementById("idMain1--Layout");
				addLabel(oLayout, "_error", "Error: not all changes were applied");
				throw new Error("Not all changes were applied");
			}
			writeData();
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
	function createControlForRename(sControlId) {
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
	function createControlsForDiverse(sControlId) {
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

	function startRenameScenario() {
		return startApplyScenario("idMain1--initialLabel", createControlForRename);
	}

	function startDiverseScenario() {
		return startApplyScenario("idMain1--dependencyScenarioControl", createControlsForDiverse);
	}

	function startVariantsScenario() {
		createControlsForDiverse("idMain1--dependencyScenarioControl");
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

	function startSaveAsScenario() {
		createControlsForDiverse("idMain1--dependencyScenarioControl");
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
			writeData();
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

	let iCounter = 0;
	async function startSwitchVariant() {
		if (iCounter === 0) {
			createControlsForDiverse("idMain1--dependencyScenarioControl");
		}
		performance.clearMeasures();
		FlexPerformanceTestUtil.startMeasurement();
		await ControlVariantApplyAPI.activateVariant({
			element: "idMain1--variantManagementOrdersTable",
			variantReference: iCounter % 2 === 0 ? "id_1710319473139_86_flVariant1" : "id_1710319473139_86_flVariant10"
		});
		FlexPerformanceTestUtil.stopMeasurement();
		FlexPerformanceTestUtil.showMeasurementData();
		iCounter++;
	}

	FlexPerformanceTestUtil.stopMeasurement = function(sMeasure) {
		sMeasure ||= sMassiveLabel;
		performance.measure(sMeasure, `${sMeasure}.start`);
		window.wpp.customMetrics[sMeasure] = performance.getEntriesByName(sMeasure)[0].duration;
	};

	FlexPerformanceTestUtil.startMeasurement = function(sMeasure) {
		sMeasure ||= sMassiveLabel;
		performance.mark(`${sMeasure}.start`);
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
			writeData();
		});
	};

	FlexPerformanceTestUtil.showMeasurementData = function() {
		writeData();
	};

	FlexPerformanceTestUtil.runPerformanceTests = function() {
		switch (FlUtils.getUrlParameter("sap-ui-fl-test-case")) {
			case "diverse":
				return startDiverseScenario();
			case "variants":
				return startVariantsScenario();
			case "saveas":
				return startSaveAsScenario();
			case "variantSwitch":
				return startSwitchVariant();
			case "rename":
			default:
				return startRenameScenario();
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
});
