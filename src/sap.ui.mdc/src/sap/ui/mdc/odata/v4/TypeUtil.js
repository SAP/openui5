/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/mdc/odata/TypeUtil', 'sap/ui/mdc/enums/BaseType',	'sap/base/util/merge'], function(ODataTypeUtil, BaseType, merge) {
	"use strict";

	ODataV4TypeUtil.getBaseType = function(sType, oFormatOptions, oConstraints) {

		switch (sType) {
			case "sap.ui.model.odata.type.Date":
				return BaseType.Date;

			case "sap.ui.model.odata.type.TimeOfDay":
				return BaseType.Time;

			case "sap.ui.model.odata.type.Unit":
			case "sap.ui.model.odata.type.Currency":
				if (!oFormatOptions || ((!oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) && (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber))) {
					return BaseType.Unit;
				} else if (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber) {
					return BaseType.Numeric; // only number to show
				} else {
					return BaseType.String; // only unit to show
				}
			default:
				return ODataTypeUtil.getBaseType.call(this, sType, oFormatOptions, oConstraints);
		}
	};

	ODataV4TypeUtil.getDataTypeClassName = function(sType) {

		// V4 specific types
		var mEdmTypes = {
			"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
			"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
		};
		if (mEdmTypes[sType]) {
			sType = mEdmTypes[sType];
		} else {
			sType = ODataTypeUtil.getDataTypeClassName.call(this, sType);
		}
		return sType;
	};

	ODataV4TypeUtil.getDataTypeInstance = function(sDataType, oFormatOptions, oConstraints) {
		switch (sDataType) {
			case "sap.ui.model.odata.type.DateTimeOffset":
			case "Edm.DateTimeOffset":
				oConstraints = merge({}, oConstraints);
				oConstraints.V4 = true;
				break;

			default:
		}

		var TypeClass = this.getDataTypeClass(sDataType);
		return new TypeClass(oFormatOptions, oConstraints);
	};

	ODataV4TypeUtil._adjustUnitFormatOptions = function (oFormatOptions, bShowNumber, bShowMeasure) {
		ODataTypeUtil._adjustUnitFormatOptions.call(this, oFormatOptions, bShowNumber, bShowMeasure);

		if (oFormatOptions.hasOwnProperty("unitOptional")) { // as per default set if both, showNumber and showMeasure set
			delete oFormatOptions.unitOptional; // let the type determine the right default
		}
	};

	return ODataV4TypeUtil;
});
