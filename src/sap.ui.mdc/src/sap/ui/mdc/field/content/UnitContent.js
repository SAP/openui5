/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/mdc/enums/FieldEditMode"
], (DefaultContent, coreLibrary, Filter, isEmptyObject, merge, FieldEditMode) => {
	"use strict";

	const { ValueState } = coreLibrary;

	const _getUnitTypeInstance = function(oTypeUtil, oType, oFormatOptions, oConstraints, bShowNumber, bShowMeasure) {
		return oTypeUtil.getUnitTypeInstance ? oTypeUtil.getUnitTypeInstance(oType, bShowNumber, bShowMeasure) : oTypeUtil.getDataTypeInstance(oType.getMetadata().getName(), oFormatOptions, oConstraints, { showNumber: bShowNumber, showMeasure: bShowMeasure });
	};

	/**
	 * Object-based definition of the unit content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.UnitContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 */
	const UnitContent = Object.assign({}, DefaultContent, {
		getEdit: function() {
			return ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"];
		},
		getEditMultiValue: function() {
			return ["sap/ui/mdc/field/FieldMultiInput",
				"sap/ui/mdc/field/FieldInput",
				"sap/m/Token",
				"sap/ui/core/InvisibleText"
			];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getUseDefaultValueHelp: function() {
			return false;
		},
		createEdit: function(oContentFactory, aControlClasses, sId) {
			oContentFactory.setIsMeasure(true); // ValueHelp only on unit field
			const Input = aControlClasses[0];
			const InvisibleText = aControlClasses[1];
			const oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForUnit(oContentFactory);

			const sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
			let aControls = [];
			const oInput1 = new Input(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				valueHelpIconSrc: "sap-icon://slim-arrow-down",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: { path: "$field>/valueState", formatter: _setValueStateForControl },
				valueStateText: { path: "$field>/valueStateText", formatter: _setValueStateTextForControl },
				showValueHelp: false,
				width: "70%",
				tooltip: "{$field>/tooltip}",
				autocomplete: false,
				fieldGroupIds: { path: "$field>/fieldGroupIds", formatter: _setFieldGroupIds }, // use FieldGroup to fire change only if focus leaved complete Field
				ariaDescribedBy: [sInvisibleTextId],
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange()
			});
			oInput1.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oInput1);
			aControls.push(oInput1);
			aControls = this._addUnitControl(oContentFactory, aControls, sId, Input, InvisibleText);

			return aControls;
		},
		createEditMultiValue: function(oContentFactory, aControlClasses, sId) {
			oContentFactory.setIsMeasure(true); // ValueHelp only on unit field
			const MultiInput = aControlClasses[0];
			const Token = aControlClasses[2]; // is loaded by MultiInput
			const Input = aControlClasses[1];
			const InvisibleText = aControlClasses[3];
			const oConditionType = oContentFactory.getConditionType();
			const oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForUnit(oContentFactory);

			let aControls = [];
			const oToken = new Token(sId + "-token", {
				text: {
					path: '$field>',
					type: oConditionType
				}
			});

			const oFilter = new Filter({
				path: "values",
				test: function(aValues) {
					// do not show tokens for units without measure
					if (!Array.isArray(aValues[0]) || aValues[0][0]) {
						return true;
					} else {
						return false;
					}
				}
			});

			const sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
			const oMultiInput = new MultiInput(sId, {
				value: { path: "$field>/conditions", type: oConditionsType }, // only for parsing
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: { path: "$field>/valueState", formatter: _setValueStateForControl },
				valueStateText: { path: "$field>/valueStateText", formatter: _setValueStateTextForControl },
				showValueHelp: false,
				width: "70%",
				tooltip: "{$field>/tooltip}",
				fieldGroupIds: { path: "$field>/fieldGroupIds", formatter: _setFieldGroupIds }, // use FieldGroup to fire change only if focus leaved complete Field
				ariaDescribedBy: [sInvisibleTextId],
				tokens: { path: "$field>/conditions", template: oToken, filters: [oFilter] },
				dependents: [oToken], // to destroy it if MultiInput is destroyed
				autocomplete: false,
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				tokenUpdate: oContentFactory.getHandleTokenUpdate()
			});
			oMultiInput.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oMultiInput);
			aControls.push(oMultiInput);
			aControls = this._addUnitControl(oContentFactory, aControls, sId, Input, InvisibleText);

			return aControls;
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.UnitContent - createEditMultiLine not defined!");
		},
		_addUnitControl: function(oContentFactory, aControls, sId, Input, InvisibleText) {
			const oUnitConditionsType = oContentFactory.getUnitConditionsType();

			if (oContentFactory.getField().getEditMode() === FieldEditMode.EditableDisplay) {
				aControls[0].bindProperty("description", { path: "$field>/conditions", type: oUnitConditionsType });
				aControls[0].setWidth("100%");
				aControls[0].setFieldWidth("70%");
			} else {
				let sInvisibleTextId;
				const oType = oContentFactory.getUnitOriginalType();
				const sName = oType && oType.getMetadata().getName();
				if (sName && sName.indexOf("Currency") >= 0) { // TODO: better solution
					sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.CURRENCY");
				} else {
					sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.UNIT");
				}

				const oInput = new Input(sId + "-unit", {
					value: { path: "$field>/conditions", type: oUnitConditionsType },
					placeholder: "{$field>/placeholder}",
					textAlign: "{$field>/textAlign}",
					textDirection: "{$field>/textDirection}",
					required: "{$field>/required}",
					editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditableUnit },
					enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
					valueState: { path: "$field>/valueState", formatter: _setValueStateForControl },
					valueStateText: { path: "$field>/valueStateText", formatter: _setValueStateTextForControl },
					valueHelpIconSrc: oContentFactory.getValueHelpIcon(),
					showValueHelp: "{$field>/_valueHelpEnabled}",
					ariaAttributes: "{$field>/_ariaAttributes}",
					width: "30%",
					tooltip: "{$field>/tooltip}",
					autocomplete: false,
					fieldGroupIds: { path: "$field>/fieldGroupIds", formatter: _setFieldGroupIds }, // use FieldGroup to fire change only if focus leaved complete Field
					ariaDescribedBy: [sInvisibleTextId],
					change: oContentFactory.getHandleContentChange(),
					liveChange: oContentFactory.getHandleContentLiveChange(),
					valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
				});

				oInput.setPreferUserInteraction(true);
				oContentFactory.setAriaLabelledBy(oInput);
				aControls.push(oInput);
			}

			return aControls;
		},
		_adjustDataTypeForUnit: function(oContentFactory) {
			const oField = oContentFactory.getField();
			const TypeMap = oField.getTypeMap();
			const oType = oContentFactory.retrieveDataType();
			const oFormatOptions = oType.getFormatOptions();
			const oConstraints = oType.getConstraints();
			const bShowMeasure = !oFormatOptions || !oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure;
			const bShowNumber = !oFormatOptions || !oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber;

			// if measure and number needs to be shown -> create new type
			if (bShowMeasure && bShowNumber) {
				const oClonedFormatOptions = merge({}, oFormatOptions);
				const oClonedConstraints = isEmptyObject(oConstraints) ? undefined : merge({}, oConstraints);

				// Type for number
				let oNewType = _getUnitTypeInstance(TypeMap, oType, oClonedFormatOptions, oClonedConstraints, true, false);
				oContentFactory.setUnitOriginalType(oContentFactory.getDataType());
				TypeMap.initializeInternalType(oNewType, oContentFactory.getFieldTypeInitialization());
				oContentFactory.setDataType(oNewType);

				// type for unit
				oNewType = _getUnitTypeInstance(TypeMap, oType, oClonedFormatOptions, oClonedConstraints, false, true);
				TypeMap.initializeInternalType(oNewType, oContentFactory.getFieldTypeInitialization());
				oContentFactory.setUnitType(oNewType);
				oContentFactory.updateConditionType();
			}
		}
	});

	// called with contentent control as context
	function _setValueStateForControl(sValueState) {

		const oField = this.getParent();

		if (!oField || !oField.isInvalidInput() || oField._isInvalidInputForContent(this)) {
			// if there is no invalid input at all valueState seems to be set from outside -> just take it
			// if there is invalid input on current control -> take ValueState
			return sValueState;
		} else {
			return ValueState.None;
		}

	}

	function _setValueStateTextForControl(sValueStateText) {

		const oField = this.getParent();

		if (!oField || !oField.isInvalidInput()) {
			// if there is no invalid input at all valueState seems to be set from outside -> just take it
			return sValueStateText;
		} else if (oField._isInvalidInputForContent(this)) {
			// if there is invalid input on current control -> take error of this exception (as we can only have one ValueStateText)
			const oException = oField._getInvalidInputException(this);
			return oException.message;
		} else {
			return "";
		}

	}

	function _setFieldGroupIds(aFieldGroupIds) { // gets FieldGroupIds from Field

		const oField = this.getParent();

		if (oField) {
			aFieldGroupIds.push(oField.getId()); // use Field Id as FieldGroup of Field
		} else {
			// parent not already assigned, determine ID from own ID
			let sId = this.getId();
			const iIndex = sId.lastIndexOf("-inner");
			sId = sId.slice(0, iIndex);
			aFieldGroupIds.push(sId); // use Field Id as FieldGroup of Field
		}

		return aFieldGroupIds;

	}

	return UnitContent;
});