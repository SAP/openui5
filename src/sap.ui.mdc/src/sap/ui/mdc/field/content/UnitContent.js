/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/model/Filter",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/mdc/enum/EditMode"
], function(DefaultContent, Filter, isEmptyObject, merge, ObjectPath, EditMode) {
	"use strict";

	/**
	 * Object-based definition of the unit content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.UnitContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var UnitContent = Object.assign({}, DefaultContent, {
		getEditMulti: function() {
			return ["sap/ui/mdc/field/FieldMultiInput", "sap/ui/mdc/field/FieldInput", "sap/m/Token"];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getUseDefaultFieldHelp: function() {
			return false;
		},
		createEdit: function(oContentFactory, aControlClasses, sId) {
			oContentFactory.setIsMeasure(true); // FieldHelp only on unit field
			var Input = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForUnit(oContentFactory);

			var aControls = [];
			var oInput1 = new Input(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				valueHelpIconSrc: "sap-icon://slim-arrow-down",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: false,
				width: "70%",
				tooltip: "{$field>/tooltip}",
				autocomplete: false,
				fieldGroupIds: [oContentFactory.getField().getId()], // use FieldGroup to fire change only if focus leaved complete Field
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange()
			});
			oInput1._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oInput1);
			aControls.push(oInput1);
			aControls = this._addUnitControl(oContentFactory, aControls, sId, Input);

			oContentFactory.setBoundProperty("value");

			return aControls;
		},
		createEditMulti: function(oContentFactory, aControlClasses, sId) {
			oContentFactory.setIsMeasure(true); // FieldHelp only on unit field
			var MultiInput = aControlClasses[0];
			var Token = aControlClasses[2]; // is loaded by MultiInput
			var Input = aControlClasses[1];
			var oConditionType = oContentFactory.getConditionType();
			this._adjustDataTypeForUnit(oContentFactory);

			var aControls = [];
			var oToken = new Token(sId + "-token", {
				text: {
					path: '$field>',
					type: oConditionType
				}
			});

			var oFilter = new Filter({
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

			var oMultiInput = new MultiInput(sId, {
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: false,
				width: "70%",
				tooltip: "{$field>/tooltip}",
				fieldGroupIds: [oContentFactory.getField().getId()], // use FieldGroup to fire change only if focus leaved complete Field
				tokens: { path: "$field>/conditions", template: oToken, filters: [oFilter] },
				dependents: [oToken], // to destroy it if MultiInput is destroyed
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				tokenUpdate: oContentFactory.getHandleTokenUpdate()
			});
			oMultiInput._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oMultiInput);
			aControls.push(oMultiInput);
			aControls = this._addUnitControl(oContentFactory, aControls, sId, Input);

			oContentFactory.setBoundProperty("value");

			return aControls;
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.UnitContent - createEditMultiLine not defined!");
		},
		_addUnitControl: function(oContentFactory, aControls, sId, Input) {
			var oUnitConditionsType = oContentFactory.getUnitConditionsType();

			if (oContentFactory.getField().getEditMode() === EditMode.EditableDisplay) {
				aControls[0].bindProperty("description", { path: "$field>/conditions", type: oUnitConditionsType });
				aControls[0].setWidth("100%");
				aControls[0].setFieldWidth("70%");
			} else {
				var oInput = new Input(sId + "-unit", {
					value: { path: "$field>/conditions", type: oUnitConditionsType },
					placeholder: "{$field>/placeholder}",
					textAlign: "{$field>/textAlign}",
					textDirection: "{$field>/textDirection}",
					required: "{$field>/required}",
					editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditableUnit },
					enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
					valueState: "{$field>/valueState}",
					valueHelpIconSrc: oContentFactory.getFieldHelpIcon(),
					valueStateText: "{$field>/valueStateText}",
					showValueHelp: "{$field>/_fieldHelpEnabled}",
					ariaAttributes: "{$field>/_ariaAttributes}",
					width: "30%",
					tooltip: "{$field>/tooltip}",
					autocomplete: false,
					fieldGroupIds: [oContentFactory.getField().getId()], // use FieldGroup to fire change only if focus leaved complete Field
					change: oContentFactory.getHandleContentChange(),
					liveChange: oContentFactory.getHandleContentLiveChange(),
					valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
				});

				oInput._setPreferUserInteraction(true);
				oContentFactory.setAriaLabelledBy(oInput);
				aControls.push(oInput);
			}

			return aControls;
		},
		_adjustDataTypeForUnit: function(oContentFactory) {
			var oField = oContentFactory.getField();
			var oType = oContentFactory.retrieveDataType();
			var sName = oType.getMetadata().getName();
			var oFormatOptions = oType.getFormatOptions();
			var oConstraints = isEmptyObject(oType.getConstraints()) ? undefined : oType.getConstraints();

			// if type is used from binding (Field) or format options are not set correctly -> create new type
			if (!oFormatOptions || !oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) {
				oFormatOptions = merge({}, oFormatOptions); // do not manipulate original object
				oFormatOptions.showMeasure = false;
				oFormatOptions.strictParsing = true; // do not allow to enter unit in number field
				var TypeClass = ObjectPath.get(sName);
				oContentFactory.setUnitOriginalType(oContentFactory.getDataType());
				oContentFactory.setDataType(new TypeClass(oFormatOptions, oConstraints));
				oField.getControlDelegate().initializeInternalUnitType(oField.getPayload(), oContentFactory.getDataType(), oContentFactory.getFieldTypeInitialization());
				oContentFactory.updateConditionType();
			}
		}
	});

	return UnitContent;
});