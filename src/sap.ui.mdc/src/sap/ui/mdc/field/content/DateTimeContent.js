/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/field/content/DateContent",
	"sap/ui/mdc/util/DateUtil",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath"
], function(DefaultContent, DateContent, DateUtil, merge, ObjectPath) {
	"use strict";

	/**
	 * Object-based definition of the date and time content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.DateTimeContent
	 * @extends sap.ui.mdc.field.content.DateContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var DateTimeContent = Object.assign({}, DateContent, {
		getEditOperator: function() {
			return {
				"EQ": { name: "sap/m/DateTimePicker", create: this._createDatePickerControl }  // as same API as DatePicker
			};
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.DateTimeContent - createEditMultiLine not defined!");
		},
		_createDatePickerControl: function(oContentFactory, aControlClasses, sId) {
			var aControls = DateContent._createDatePickerControl.apply(this, arguments);
			var oType = oContentFactory.getDateOriginalType() || oContentFactory.getDataType(); // if no clone-type created use original type

			if (DateUtil.showTimezone(oType)) {
				// bind timezone to timezone part; handle as "unit"
				var oUnitConditionsType = oContentFactory.getUnitConditionsType();
				aControls[0].bindProperty("timezone", { path: "$field>/conditions", type: oUnitConditionsType });
				aControls[0].setShowTimezone(true);
			}

			return aControls;
		},
		_adjustDataTypeForDate: function(oContentFactory) {
			var oType = oContentFactory.retrieveDataType();
			var oFormatOptions = oType.getFormatOptions();

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
				var oConstraints = oType.getConstraints();
				var sName = oType.getMetadata().getName();
				var TypeClass = ObjectPath.get(sName);
				oContentFactory.setUnitType(new TypeClass(oFormatOptions, oConstraints));
			} else {
				DateContent._adjustDataTypeForDate.apply(this, arguments);
			}
		}

	});

	return DateTimeContent;
});