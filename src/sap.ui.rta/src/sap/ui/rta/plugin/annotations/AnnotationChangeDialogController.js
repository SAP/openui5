
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/layout/form/FormElement",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/rta/util/validateText"
], function(
	Input,
	Label,
	Select,
	Switch,
	Controller,
	Element,
	Item,
	FormElement,
	Filter,
	FilterOperator,
	AnnotationTypes,
	validateText
) {
	"use strict";

	/**
	 * @class Controller for the AnnotationChangeDialog.
	 * @extends sap.ui.core.mvc.Controller
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.132
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const AnnotationChangeDialogController = Controller.extend("sap.ui.rta.plugin.annotations.AnnotationChangeDialogController");

	AnnotationChangeDialogController.prototype.initialize = function() {
		return new Promise((resolve) => {
			this._fnResolveAfterClose = resolve;
		});
	};

	AnnotationChangeDialogController.prototype.filterProperties = function(sQuery) {
		const aFilters = [];
		if (sQuery && sQuery.length > 0) {
			const oLabelFilter = new Filter("label", FilterOperator.Contains, sQuery);
			const oValueFilter = new Filter("currentValue", FilterOperator.Contains, sQuery);
			const oCombinedFilter = new Filter({
				filters: [oLabelFilter, oValueFilter],
				and: false
			});
			aFilters.push(oCombinedFilter);
		}

		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		const oBinding = oList.getBinding("formElements");
		oBinding.filter(aFilters);
	};

	AnnotationChangeDialogController.prototype.onFilterProperties = function(oEvent) {
		const sQuery = oEvent.getSource().getValue();
		this.filterProperties(sQuery);
	};

	function isValueEqual(bStringType, oProperty) {
		// The string input stores the raw text; trailing spaces are removed only now, on save.
		// Both sides are trimmed for the change check so a trailing-only edit is not persisted.
		const vCurrentValue = bStringType ? validateText.getTrimmedText(oProperty.currentValue) : oProperty.currentValue;
		const vOriginalValue = bStringType ? validateText.getTrimmedText(oProperty.originalValue) : oProperty.originalValue;
		return { bValueEqual: vCurrentValue === vOriginalValue, vCurrentValue };
	}

	AnnotationChangeDialogController.prototype.switchDisplayMode = function(oEvent) {
		const bShowChangedPropertiesOnly = oEvent.getParameter("state");
		const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
		const oModel = oList.getModel();
		oModel.setProperty("/showChangedPropertiesOnly", bShowChangedPropertiesOnly);

		if (bShowChangedPropertiesOnly) {
			const bStringType = oModel.getProperty("/valueType") === AnnotationTypes.StringType;
			const aOriginallyChangedProperties = oModel.getProperty("/changedProperties");
			const aAllChangedProperties = oModel.getProperty("/properties").filter((oProperty) => {
				const bIsOriginallyChanged = aOriginallyChangedProperties.some((oOriginallyChangedProperty) => (
					oOriginallyChangedProperty.annotationPath === oProperty.annotationPath
				));
				return bIsOriginallyChanged || !isValueEqual(bStringType, oProperty).bValueEqual;
			});
			oModel.setProperty("/propertiesToDisplay", aAllChangedProperties);
		} else {
			oModel.setProperty("/propertiesToDisplay", oModel.getProperty("/properties"));
		}
	};

	function onSave(oEvent) {
		const oModelData = oEvent.getSource().getModel().getData();
		const bStringType = oModelData.valueType === AnnotationTypes.StringType;
		const aChanges = oModelData.properties
		.map((oProperty) => {
			const { bValueEqual, vCurrentValue } = isValueEqual(bStringType, oProperty);
			if (bValueEqual) {
				return null;
			}
			const oChangeSpecificData = {
				serviceUrl: oModelData.serviceUrl,
				content: {
					annotationPath: oProperty.annotationPath
				}
			};
			oChangeSpecificData.content[bStringType ? "text" : "value"] =
			oModelData.objectAsKey ? JSON.parse(vCurrentValue) : vCurrentValue;
			return oChangeSpecificData;
		})
		.filter(Boolean);

		this._fnResolveAfterClose(aChanges);
	}

	function onSubmit(oEvent) {
		// The Enter key bypasses the Save button, so ignore it while the input is invalid.
		// An unchanged value is allowed through (onSave resolves with no changes and closes the dialog).
		if (oEvent.getSource().getModel().getProperty("/errorCount") > 0) {
			return;
		}
		onSave.call(this, oEvent);
	}

	AnnotationChangeDialogController.prototype.onSave = function(oEvent) {
		onSave.call(this, oEvent);
	};

	AnnotationChangeDialogController.prototype.onCancel = function() {
		this._fnResolveAfterClose([]);
	};

	AnnotationChangeDialogController.prototype._validateInput = function(oInput, sNewValue, sOldValue) {
		const oModel = oInput.getModel();
		if (!oModel) {
			return;
		}
		const aValidators = oModel.getProperty("/validators");
		const bSingleFieldRename = oModel.getProperty("/singleFieldRename");
		try {
			validateText(sNewValue, sOldValue, { validators: aValidators, skipSameTextValidator: !bSingleFieldRename });
		} catch (oError) {
			if (oError.message !== "sameTextError") {
				oInput.setValueState("Error");
				oInput.setValueStateText(oError.message);
				return;
			}
		}
		oInput.setValueState("None");
		oInput.setValueStateText("");
	};

	AnnotationChangeDialogController.prototype._updateSaveEnabled = function(oModel, mPropertyBag) {
		const [bWasError, bHasError, bWasChanged, bIsChanged] = [
			mPropertyBag.wasError,
			mPropertyBag.hasError,
			mPropertyBag.wasChanged,
			mPropertyBag.isChanged
		];
		// avoid counting existing errors multiple times
		if (bHasError !== bWasError) {
			oModel.setProperty("/errorCount", oModel.getProperty("/errorCount") + (bHasError ? 1 : -1));
		}
		// track changed-vs-original transitions so we can disable save in multi-rename mode
		// when nothing actually differs from the original values
		if (bIsChanged !== bWasChanged) {
			oModel.setProperty("/changedCount", oModel.getProperty("/changedCount") + (bIsChanged ? 1 : -1));
		}
		const bNoErrors = oModel.getProperty("/errorCount") === 0;
		const bHasChanges = oModel.getProperty("/changedCount") > 0;
		oModel.setProperty("/isSaveEnabled", bNoErrors && bHasChanges);
	};

	function createEditorField(sValueType, bSingleFieldRename) {
		if (sValueType === AnnotationTypes.ValueListType) {
			const oSelect = new Select({
				selectedKey: {
					path: "currentValue",
					mode: "OneWay"
				},
				change: (oEvent) => {
					const oSource = oEvent.getSource();
					const oContext = oSource.getBindingContext();
					const oModel = oSource.getModel();
					const sOriginalValue = oContext.getProperty("originalValue");
					const sNewKey = oEvent.getParameter("selectedItem").getKey();
					const mPropertyBag = {
						wasError: false,
						hasError: false,
						wasChanged: oContext.getProperty("currentValue") !== sOriginalValue,
						isChanged: sNewKey !== sOriginalValue
					};
					oModel.setProperty("currentValue", sNewKey, oContext);
					this._updateSaveEnabled(oModel, mPropertyBag);
				}
			});

			const oItemTemplate = new Item({
				key: "{key}",
				text: "{text}"
			});

			oSelect.bindItems({
				path: "/possibleValues",
				template: oItemTemplate,
				templateShareable: false
			});

			return oSelect;
		}

		if (sValueType === AnnotationTypes.StringType) {
			return new Input({
				// A single-field rename shows exactly one text input, so it carries a stable ID that
				// onAfterOpen uses to focus it. Multi-field dialogs keep auto-generated IDs (no collision).
				id: bSingleFieldRename ? "sapUiRtaChangeAnnotationDialog_singleRenameField" : undefined,
				value: "{currentValue}",
				liveChange: (oEvent) => {
					const oSource = oEvent.getSource();
					const oContext = oSource.getBindingContext();
					const oModel = oSource.getModel();
					const sRawValue = oEvent.getParameter("newValue");
					const sNewText = validateText.getTrimmedText(sRawValue);
					const sOriginalValue = oContext.getProperty("originalValue");
					// Change detection and the same-text validator both compare the trimmed values on
					// both sides so that adding only a trailing blank does not count as a change (and
					// the empty baseline stays balanced).
					const sOriginalValueTrimmed = validateText.getTrimmedText(sOriginalValue);
					const mPropertyBag = {};
					mPropertyBag.wasChanged = validateText.getTrimmedText(oContext.getProperty("currentValue")) !== sOriginalValueTrimmed;
					oModel.setProperty("currentValue", sRawValue, oContext);
					mPropertyBag.isChanged = sNewText !== sOriginalValueTrimmed;
					mPropertyBag.wasError = oSource.getValueState() === "Error";
					this._validateInput(oSource, sNewText, sOriginalValueTrimmed);
					mPropertyBag.hasError = oSource.getValueState() === "Error";
					this._updateSaveEnabled(oModel, mPropertyBag);
				},
				submit: bSingleFieldRename ? onSubmit.bind(this) : () => {}
			});
		}

		if (sValueType === AnnotationTypes.BooleanType) {
			return new Switch({
				state: {
					path: "currentValue",
					mode: "OneWay"
				},
				change: (oEvent) => {
					const oSource = oEvent.getSource();
					const oContext = oSource.getBindingContext();
					const oModel = oSource.getModel();
					const bOriginalValue = oContext.getProperty("originalValue");
					const bNewState = oEvent.getParameter("state");
					const mPropertyBag = {
						wasError: false,
						hasError: false,
						wasChanged: oContext.getProperty("currentValue") !== bOriginalValue,
						isChanged: bNewState !== bOriginalValue
					};
					oModel.setProperty("currentValue", bNewState, oContext);
					this._updateSaveEnabled(oModel, mPropertyBag);
				}
			});
		}

		throw new Error(`Unsupported value type: ${sValueType}`);
	}

	AnnotationChangeDialogController.prototype.editorFactory = function(sId, oContext) {
		const sValueType = oContext.getProperty("/valueType");
		const bSingleFieldRename = !!oContext.getProperty("/singleFieldRename");

		return new FormElement({
			id: sId,
			label: new Label({
				text: bSingleFieldRename
					? "{i18n>ANNOTATION_CHANGE_DIALOG_SINGLE_RENAME_LABEL}"
					: "{= ${label} || ${propertyName}}",
				tooltip: "{tooltip}"
			}),
			fields: [
				createEditorField.call(this, sValueType, bSingleFieldRename)
			]
		});
	};

	return AnnotationChangeDialogController;
});