/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/mdc/FilterField",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/enums/FilterBarValidationStatus",
	"sap/ui/core/library"
], function (Element, FilterBarDelegate, FilterField, JSONPropertyInfo, FilterBarValidationStatus, coreLibrary) {
	"use strict";

	const { ValueState } = coreLibrary;

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = async (sId, oProperty, oFilterBar) => {
		const sPropertyName = oProperty.key;
		const oFilterField = new FilterField(sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sPropertyName + '}',
			propertyKey: sPropertyName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Element.getElementById(sId) ?? (await _createFilterField(sId, oProperty, oFilterBar));
	};

	JSONFilterBarDelegate.visualizeValidationState = function(oFilterBar, mValidation) {
		let sErrorMessage;

		if (mValidation.status === FilterBarValidationStatus.NoError) {
			return;
		}

		if (mValidation.status === FilterBarValidationStatus.RequiredHasNoValue) {
			sErrorMessage = oFilterBar.getResourceFileText("filterbar.REQUIRED_CONDITION_MISSING");
			sErrorMessage = sErrorMessage.slice(0, -1) + ":\n";
			[].filter((oFilterField) => {
				if (oFilterField && (oFilterField.getValueState() !== ValueState.None)) {
					sErrorMessage += "\n" + oFilterField.getLabel();
				}
			});


		} else if (mValidation.status === FilterBarValidationStatus.FieldInErrorState) {
			sErrorMessage = oFilterBar.getResourceFileText("filterbar.VALIDATION_ERROR");
		}

		if (oFilterBar.getShowMessages() && !oFilterBar._hasOpenMessageBox) {

			sap.ui.require(["sap/m/MessageBox", "sap/base/Log"], (MessageBox, Log) => {
				try {

					if (oFilterBar._bIsBeingDestroyed) {
						return;
					}
					oFilterBar._hasOpenMessageBox = true;
					MessageBox.error(sErrorMessage, {
						styleClass: oFilterBar.getDomRef()?.closest(".sapUiSizeCompact") ? "sapUiSizeCompact" : "",
						onClose: function() {
							delete oFilterBar._hasOpenMessageBox;
							oFilterBar.setFocusOnFirstErroneousField();
						}
					});
				} catch (x) {
					Log.error(x.message);
				}
			});
		}
	};


	return JSONFilterBarDelegate;
});