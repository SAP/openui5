/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/library",
	"./Validators",
	"./BindingResolver",
	"sap/base/Log"],
	function (coreLibrary,
			  Validators,
			  BindingResolver,
			  Log) {
		"use strict";

		var ValueState = coreLibrary.ValueState;

		function _getValidationValue(oControl) {
			if (oControl.isA("sap.m.ComboBox")) {
				return {
					key: oControl.getSelectedKey(),
					value: oControl.getValue()
				};
			} else {
				return oControl.getValue();
			}
		}

		function _getInputType(oItem) {
			switch (oItem.type) {
				case "ComboBox":
					return "keyValuePair";
				default:
					return "string";
			}
		}

		function removeMessageFromControl(oControl, oMessagesModel) {
			var sBindingPath = "/" + oControl._oItem.id,
				oMessagesModelData = oMessagesModel.getData(),
				i,
				bHasChange = false;

			oControl.setValueState(ValueState.None);

			for (i = 0; i < oMessagesModelData.records.length; i++) {
				if (oMessagesModelData.records[i].bindingPath === sBindingPath) {
					oMessagesModelData.records.splice(i, 1);
					bHasChange = true;
					break;
				}
			}

			if (bHasChange) {
				oMessagesModel.setData(oMessagesModelData);
			}
		}

		function updateMessageModel(oMessagesModel) {
			var aRecords = oMessagesModel.getProperty("/records");

			oMessagesModel.setProperty("/hasErrors", !!aRecords.find(function (oRecord) {
				return oRecord.type === ValueState.Error;
			}));

			oMessagesModel.setProperty("/hasWarnings", !!aRecords.find(function (oRecord) {
				return oRecord.type === ValueState.Warning;
			}));
		}

		function getExtensionFunctionName (sValue, oExtension) {
			var sValidationFunctionName;

			if (!sValue.startsWith("extension.")) {
				Log.error("Validation function should start with 'extension.'");
				return false;
			}

			if (!oExtension) {
				Log.error("Extension is not defined.");
				return false;
			}

			sValidationFunctionName = sValue.replace("extension.", "");

			if (!oExtension[sValidationFunctionName]) {
				Log.error("No such function.", sValidationFunctionName, "sap.ui.integration.widgets.Card");
				return false;
			}

			return sValidationFunctionName;
		}

		/**
		 * Utility class helping with form validation.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @alias sap.ui.integration.util.Forms
		 */
		var Forms = {
			validateControl: function (oControl, oCard, bShowValueState) {
				var oValue = _getValidationValue(oControl),
					oMessagesModel = oCard.getModel("messages"),
					oResourceBundle = oCard.getModel("i18n").getResourceBundle(),
					oExtension = oCard.getAggregation("_extension"),
					oItem = oControl._oItem,
					sInputType,
					oValidator,
					oValidationValue,
					fnValidationFunc,
					sValueState,
					sValueStateText,
					bValid,
					bHasErrorSet = false,
					oMessagesModelData,
					aResolvedValidations;

				removeMessageFromControl(oControl, oMessagesModel);

				if (!oItem || !oItem.validations) {
					return;
				}

				aResolvedValidations = BindingResolver.resolveValue(oItem.validations, oControl, oControl.getBindingContext().getPath());

				sInputType = _getInputType(oItem);
				oValidator = Validators[sInputType];

				aResolvedValidations.forEach(function (mValidationConfig) {

					for (var sKey in mValidationConfig) {
						if (bHasErrorSet) {
							return;
						}
						oValidationValue = mValidationConfig[sKey];

						if (sKey === "validate") {
							var sValidationFunctionName = getExtensionFunctionName(oValidationValue, oExtension);

							if (sValidationFunctionName) {
								fnValidationFunc = oExtension[sValidationFunctionName];
							}
						} else {
							fnValidationFunc = oValidator[sKey];
						}

						if (typeof fnValidationFunc !== "function") {
							continue;
						}

						bValid = fnValidationFunc(oValue, oValidationValue);
						if (!bValid) {
							sValueState = mValidationConfig.type || ValueState.Error;
							sValueStateText = mValidationConfig.message || oResourceBundle.getText(oValidator[sKey + "Txt"], oValidationValue);

							oMessagesModelData = oMessagesModel.getData();
							oMessagesModelData.records.push({
								message: sValueStateText,
								type: sValueState,
								bindingPath: "/" + oItem.id
							});
							oMessagesModel.setData(oMessagesModelData);

							if (bShowValueState || oControl._bShowValueState) {
								oControl._bShowValueState = true;
								oControl.setValueState(sValueState);
								oControl.setValueStateText(sValueStateText);
							}
							bHasErrorSet = true;
						}
					}
				});

				updateMessageModel(oMessagesModel);
			},
			getRequiredValidationValue: function (oItem) {
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
			}
		};

		return Forms;
	});