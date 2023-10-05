/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"./Validators",
	"./BindingHelper",
	"./BindingResolver",
	"./DateRangeHelper",
	"./Duration",
	"sap/ui/core/Lib"
], function(
	ManagedObject,
	coreLibrary,
	Core,
	Log,
	deepExtend,
	Validators,
	BindingHelper,
	BindingResolver,
	DateRangeHelper,
	Duration,
	Lib
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Utility class for handling forms in the cards.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted
	 * @alias sap.ui.integration.util.Form
	 */
	var Form = ManagedObject.extend("sap.ui.integration.util.Form", {
		constructor: function (oCard) {
			ManagedObject.apply(this);

			this._oCard = oCard;
		},

		metadata: {
			library: "sap.ui.integration"
		}
	});

	Form.prototype.init = function () {
		this._mControls = new Map();
	};

	Form.prototype.exit = function () {
		this._mControls.clear();
		delete this._mControls;
		delete this._oCard;
	};

	/**
	 * Adds the ObjectGroupItem to the form.
	 * Changes based on the provided event fired by the ObjectGroupItem will be reflected in the model "form".
	 * @param {string} sEventType event type
	 * @param {sap.ui.core.Control} oControl control instance
	 * @param {object} oItem ObjectGroupItem definition from the manifest
	 * @param {string} sPath path to this ObjectGroupItem in the manifest
	 * @public
	 */
	Form.prototype.addControl = function (sEventType, oControl, oItem, sPath) {
		if (!this._isValidControlId(oItem.id)) {
			return;
		}

		this._syncToFormModelOn(sEventType, oControl, oItem, sPath);
	};

	/**
	 * Performs the defined validations on the form controls.
	 * @param {boolean} bShowValueState Whether to show the value state on the form controls
	 * @param {boolean} bSkipFiringStateChangedEvent Whether to skip firing stateChanged event
	 */
	Form.prototype.validate = function (bShowValueState, bSkipFiringStateChangedEvent) {
		var bStateChanged = false;

		this._mControls.forEach(function (oControl) {
			if (this._validateControl(oControl, bShowValueState)) {
				bStateChanged = true;
			}
		}.bind(this));

		if (bStateChanged && !bSkipFiringStateChangedEvent) {
			this._oCard.scheduleFireStateChanged();
		}
	};

	/**
	 * Resolves an ObjectGroupItem with the values from the form control it corresponds to
	 * @param {object} oItem ObjectGroupItem definition
	 * @returns {object} object containing the form control data
	 * @public
	 */
	Form.prototype.resolveControl = function (oItem) {
		var oResolved = {},
			vValue = this.getModel("form").getProperty("/" + oItem.id),
			aValidations = this.getModel("messages").getProperty("/records"),
			oValueState = aValidations.find(function (oValidation) {
				return oValidation.bindingPath === "/" + oItem.id;
			}),
			oControl = this._mControls.get(oItem.id);

		if (oValueState && (oControl && oControl._bShowValueState)) { // should we return the very first validation, even when the control hasn't been touched yet? this is when the form control is not dirty
			oResolved.valueState = { message: oValueState.message, type: oValueState.type };
		}

		switch (oItem.type) {
			case "ComboBox":
				oResolved.selectedKey = vValue.key;
				vValue = vValue.value;
				break;
			case "DateRange":
				vValue = vValue.value;
				break;
			default:
				// do nothing
				break;
		}

		oResolved.value = vValue;

		return oResolved;
	};

	/**
	 * Assigns a value to a form control.
	 * @param {object} oFormControlData Object with key and respective value property to set.
	 * The name of the value property is named based on the type of the ObjectGroupItem as defined in the manifest.
	 * @public
	 */
	Form.prototype.setControlValue = function (oFormControlData) {
		if (!this._isControlDataValid(oFormControlData)) {
			return;
		}

		var sId = oFormControlData.id,
			oControl = this._mControls.get(sId),
			vValue = oFormControlData.value;

		if (oControl.isA("sap.m.ComboBox")) {
			this._setComboBoxValue(oControl, oFormControlData);
		} else if (vValue) {
			if (oControl.isA("sap.m.DatePicker") || oControl.isA("sap.m.DynamicDateRange")) {
				DateRangeHelper.setValue(oControl, vValue, this._oCard);
			} else if (oControl.isA("sap.m.TimePicker")) {
				oControl.setValue(Duration.fromISO(vValue));
			} else {
				oControl.setValue(vValue);
			}
		}

		this._validateAndUpdate(oControl);
	};

	Form.prototype.updateModel = function () {
		this._mControls.forEach(this._updateModel.bind(this));
	};

	Form.prototype._setComboBoxValue = function (oComboBox, oControlData) {
		var oSelectedItem;

		if ("key" in oControlData) {
			oComboBox.setSelectedKey(oControlData.key);

			oSelectedItem = oComboBox.getItems().find(function (oItem) {
				return oItem.getKey() === oControlData.key;
			});

			oComboBox.setValue(oSelectedItem ? oSelectedItem.getText() : "");
		}

		if ("value" in oControlData && !("key" in oControlData)) {
			oSelectedItem = oComboBox.getItems().find(function (oItem) {
				return oItem.getText() === oControlData.value;
			});

			if (oSelectedItem) {
				oComboBox.setSelectedItem(oSelectedItem);
			} else {
				oComboBox.setSelectedKey(""); // now entering unknown value, reset selectedKey to keep it in sync
				oComboBox.setValue(oControlData.value);
			}
		}
	};

	Form.prototype._isValidControlId = function (sId) {
		if (!sId) {
			Log.error("Each input control must have an ID.", "sap.ui.integration.widgets.Card");
			return false;
		}

		if (this._mControls.has(sId)) {
			Log.error("Duplicate form control ID - '" + sId + "'" , "sap.ui.integration.widgets.Card");
			return false;
		}

		return true;
	};

	Form.prototype._syncToFormModelOn = function (sEventType, oControl, oItem, sPath) {
		this._prepareValidationForControl(oControl, oItem, sPath);
		oControl.attachEvent(sEventType, this._validateAndUpdate, this);

		if (oItem.value && !BindingHelper.isBindingInfo(oItem.value)) {
			this._updateModel(oControl);
		}

		this._mControls.set(oItem.id, oControl);
	};

	Form.prototype._updateModel = function (oControl) {
		this.getModel("form").setProperty("/" + oControl._oItem.id, _getValue(oControl));
	};

	Form.prototype._validateAndUpdate = function (oControlOrEvent) {
		var oControl = oControlOrEvent.getSource ? oControlOrEvent.getSource() : oControlOrEvent;

		this._validateControl(oControl, true);
		this._updateModel(oControl);

		this._oCard.scheduleFireStateChanged();
	};

	Form.prototype._isControlDataValid = function (oData) {
		if (!oData) {
			return false;
		}

		var sId = oData.id;
		if (!sId) {
			Log.error("Form control data is missing property 'id'." , "sap.ui.integration.widgets.Card");
			return false;
		}

		var oControl = this._mControls.get(sId);
		if (!oControl) {
			Log.error("Form control with ID - '" + sId + "' does not exist." , "sap.ui.integration.widgets.Card");
			return false;
		}

		if (oControl.isA(["sap.m.TextArea", "sap.m.Input"]) && !("value" in oData)) {
			Log.error("Form data for control ID - '" + sId + "' is missing property 'value'." , "sap.ui.integration.widgets.Card");
			return false;
		}

		if (oControl.isA("sap.m.ComboBox")) {
			if ("value" in oData || "key" in oData) {
				return true;
			}

			Log.error("Form data for control ID - '" + sId + "' requires properties 'key' or 'value'." , "sap.ui.integration.widgets.Card");
			return false;
		}

		return true;
	};

	Form.prototype._prepareValidationForControl = function (oControl, oItem, sPath) {
		var oClonedItem = deepExtend({}, oItem);

		// this is needed in order to skip binding for "pattern"
		if (oClonedItem.validations) {
			oClonedItem.validations.forEach(function (oValidation, iIndex) {
				if (oValidation.pattern) {
					oValidation.pattern = this._oCard.getManifestEntry(sPath + "/validations/" + iIndex)["pattern"];
				}
			}.bind(this));
		}

		oControl._oItem = oClonedItem;
	};

	/**
	 * Validates control based on the defined validations from the manifest.
	 * The control will receive a validation error message for the first defined validation that fails.
	 *
	 * @param {sap.ui.core.Control} oControl control instance to validate
	 * @param {boolean} bShowValueState whether to display the new value state on the control
	 * @returns {boolean} true if the control is invalid
	 */
	Form.prototype._validateControl = function (oControl, bShowValueState) {
		var oExtension = this._oCard.getAggregation("_extension"),
			oItem = oControl._oItem,
			oBindingContext = oControl.getBindingContext(),
			sBindingPath = oBindingContext ? oBindingContext.getPath() : "",
			bHasErrorSet = false,
			aResolvedValidations;

		this._removeMessageFromControl(oControl);

		if (!oItem) {
			return bHasErrorSet;
		}

		bHasErrorSet = !this._checkBuiltInValidations(oControl, oItem, bShowValueState);

		if (!bHasErrorSet && oItem.validations) {
			aResolvedValidations = BindingResolver.resolveValue(oItem.validations, oControl, sBindingPath);
			bHasErrorSet = !aResolvedValidations.every(function (mValidationConfig) {
				return this._checkValidationItem(mValidationConfig, oControl, oItem, bShowValueState, oExtension);
			}.bind(this));
		}

		this._updateMessageModel();

		return bHasErrorSet;
	};

	Form.prototype._checkValidationItem = function (mValidationConfig, oControl, oItem, bShowValueState, oExtension) {
		var oValidator = Validators[this._getFormControlType(oItem)],
			oValidationValue,
			bValid,
			sValidationFunctionName,
			fnValidationFunc,
			oRB = this.getModel("i18n").getResourceBundle(),
			bValidationPassed = true;

		for (var sKey in mValidationConfig) {
			oValidationValue = mValidationConfig[sKey];

			if (sKey === "validate") {
				sValidationFunctionName = this._getExtensionFunctionName(oValidationValue, oExtension);

				if (sValidationFunctionName) {
					fnValidationFunc = oExtension[sValidationFunctionName];
				}
			} else {
				fnValidationFunc = oValidator[sKey];
			}

			if (typeof fnValidationFunc !== "function") {
				continue;
			}

			bValid = fnValidationFunc(_getValue(oControl), oValidationValue);
			if (!bValid) {
				this._addMessageToControl(oControl, bShowValueState, {
					type: mValidationConfig.type || ValueState.Error,
					message: mValidationConfig.message || oRB.getText(oValidator[sKey + "Txt"], oValidationValue),
					bindingPath: "/" + oItem.id
				});

				bValidationPassed = false;
				break;
			}
		}

		return bValidationPassed;
	};

	Form.prototype._checkBuiltInValidations = function (oControl, oItem, bShowValueState) {
		var bValidationPassed = true;

		if (oControl.isA("sap.m.DatePicker") && !oControl.isValidValue()) {
			this._addMessageToControl(oControl, bShowValueState, {
				type: ValueState.Error,
				message: Lib.getResourceBundleFor("sap.ui.core").getText("VALUE_STATE_ERROR"),
				bindingPath: "/" + oItem.id
			});

			bValidationPassed = false;
		}

		return bValidationPassed;
	};

	Form.prototype._addMessageToControl = function (oControl, bShowValueState, oMessage) {
		var oMessagesModel = this.getModel("messages"),
			oModelData = oMessagesModel.getData();

		oModelData.records.push(oMessage);

		oMessagesModel.setData(oModelData);

		if (bShowValueState || oControl._bShowValueState) {
			oControl._bShowValueState = true; // control has been touched once. mark it "dirty"
			oControl.setValueState(oMessage.type);
			oControl.setValueStateText(oMessage.message);
		}

		this._updateMessageModel();
	};

	Form.prototype._removeMessageFromControl = function (oControl) {
		var oMessagesModel = this.getModel("messages"),
			sBindingPath = "/" + oControl._oItem.id,
			oMessagesModelData = oMessagesModel.getData(),
			bHasChange = false;

		oControl.setValueState(ValueState.None);

		for (var i = 0; i < oMessagesModelData.records.length; i++) {
			if (oMessagesModelData.records[i].bindingPath === sBindingPath) {
				oMessagesModelData.records.splice(i, 1);
				bHasChange = true;
				break;
			}
		}

		if (bHasChange) {
			oMessagesModel.setData(oMessagesModelData);
		}

		this._updateMessageModel();
	};

	Form.prototype._updateMessageModel = function () {
		var oMessagesModel = this.getModel("messages"),
			aRecords = oMessagesModel.getProperty("/records");

		oMessagesModel.setProperty("/hasErrors", aRecords.some(function (oRecord) {
			return oRecord.type === ValueState.Error;
		}));

		oMessagesModel.setProperty("/hasWarnings", aRecords.some(function (oRecord) {
			return oRecord.type === ValueState.Warning;
		}));
	};

	Form.prototype.getRequiredValidationValue = function (oItem) {
		var aValidations = oItem.validations || [],
			oValidation,
			i,
			sKey;

		for (i = 0; i < aValidations.length; i++) {
			oValidation = aValidations[i];

			for (sKey in oValidation) {
				if (sKey === "required") {
					return oValidation[sKey];
				}
			}
		}

		return false;
	};

	Form.prototype._getExtensionFunctionName = function (sValue, oExtension) {
		if (!sValue.startsWith("extension.")) {
			Log.error("Validation function should start with 'extension'.");
			return false;
		}

		if (!oExtension) {
			Log.error("Extension is not defined.");
			return false;
		}

		var sValidationFunctionName = sValue.replace("extension.", "");

		if (!oExtension[sValidationFunctionName]) {
			Log.error("No such function.", sValidationFunctionName, "sap.ui.integration.widgets.Card");
			return false;
		}

		return sValidationFunctionName;
	};

	Form.prototype._getFormControlType = function (oItem) {
		switch (oItem.type) {
			case "ComboBox":
				return "keyValuePair";
			case "DateRange":
				return "dateRange";
			default:
				return "string";
		}
	};

	function _getValue(oControl) {
		if (oControl.isA("sap.m.ComboBox")) {
			oControl.synchronizeSelection(); // force ComboBox to synchronize selectedKey with the value in cases where the card is not being rendered
			return {
				key: oControl.getSelectedKey(),
				value: oControl.getValue()
			};
		} else if (oControl.isA("sap.m.DynamicDateRange") || oControl.isA("sap.m.DatePicker")) {
			return DateRangeHelper.getValueForModel(oControl);
		} else if (oControl.isA("sap.m.TimePicker")) {
			return Duration.toISO(oControl.getValue());
		} else {
			return oControl.getValue();
		}
	}

	return Form;
});