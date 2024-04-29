/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/field/content/DefaultContent',
	'sap/ui/mdc/field/content/DateContent',
	'sap/ui/mdc/enums/OperatorName',
	'sap/ui/mdc/util/DateUtil',
	'sap/base/util/merge'
], (DefaultContent, DateContent, OperatorName, DateUtil, merge) => {
	"use strict";

	/**
	 * Object-based definition of the date and time content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.DateTimeContent
	 * @extends sap.ui.mdc.field.content.DateContent
	 */
	const DateTimeContent = Object.assign({}, DateContent, {
		getEditOperator: function() {
			return {
				[OperatorName.EQ]: { name: "sap/m/DateTimePicker", create: this._createDatePickerControl } // as same API as DatePicker
			};
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.DateTimeContent - createEditMultiLine not defined!");
		},
		_createDatePickerControl: function(oContentFactory, aControlClasses, sId) {
			const aControls = DateContent._createDatePickerControl.apply(this, arguments);
			const oType = oContentFactory.getDateOriginalType() || oContentFactory.getDataType(); // if no clone-type created use original type

			if (DateUtil.showTimezone(oType)) {
				// bind timezone to timezone part; handle as "unit"
				const oUnitConditionsType = oContentFactory.getUnitConditionsType();
				aControls[0].bindProperty("timezone", { path: "$field>/conditions", type: oUnitConditionsType, targetType: "sap.ui.mdc.raw:1" }); // use own target type to allow special handling in ConditionType (DateTimePicker needs the raw value of the timezone, not translated)
				aControls[0].setShowTimezone(true);
			}

			return aControls;
		},
		_adjustDataTypeForDate: function(oContentFactory) {
			const oType = oContentFactory.retrieveDataType();
			let oFormatOptions = oType.getFormatOptions();

			if (DateUtil.showTimezone(oType)) {
				// create internal type without showing timezone
				this._getDatePattern(oContentFactory, oFormatOptions); // to determine pattern
				oContentFactory.setDateOriginalType(oContentFactory.getDataType());
				oContentFactory.setDataType(DateUtil.createInternalType(oType, oContentFactory.getValueFormat()));
				oContentFactory.updateConditionType();

				// handle timezone as "unit"; create internal type to show only timezone
				oFormatOptions = merge({}, oFormatOptions); // do not manipulate original object
				delete oFormatOptions.pattern; // remove pattern, if set at it might prevent showing the timezone but show the DateTime
				oFormatOptions.showDate = false;
				oFormatOptions.showTime = false;
				oFormatOptions.showTimezone = true;
				const oConstraints = oType.getConstraints();
				const TypeClass = oType.getMetadata().getClass();
				oContentFactory.setUnitType(new TypeClass(oFormatOptions, oConstraints));
			} else {
				DateContent._adjustDataTypeForDate.apply(this, arguments);
			}
		}

	});

	return DateTimeContent;
});