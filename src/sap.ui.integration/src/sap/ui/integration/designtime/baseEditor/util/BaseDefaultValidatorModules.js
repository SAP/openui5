/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/NotABinding",
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding",
	"sap/ui/integration/designtime/baseEditor/validator/IsSelectedKey",
	"sap/ui/integration/designtime/baseEditor/validator/IsUniqueKey",
	"sap/ui/integration/designtime/baseEditor/validator/IsNumber",
	"sap/ui/integration/designtime/baseEditor/validator/IsInteger",
	"sap/ui/integration/designtime/baseEditor/validator/IsBoolean",
	"sap/ui/integration/designtime/baseEditor/validator/IsDate",
	"sap/ui/integration/designtime/baseEditor/validator/IsStringList",
	"sap/ui/integration/designtime/baseEditor/validator/IsUniqueList",
	"sap/ui/integration/designtime/baseEditor/validator/MaxLength",
	"sap/ui/integration/designtime/baseEditor/validator/IsPatternMatch"
], function (
	NotABinding,
	IsValidBinding,
	IsSelectedKey,
	IsUniqueKey,
	IsNumber,
	IsInteger,
	IsBoolean,
	IsDate,
	IsStringList,
	IsUniqueList,
	MaxLength,
	IsPatternMatch
) {
	"use strict";

	return {
		"notABinding": NotABinding,
		"isValidBinding": IsValidBinding,
		"isSelectedKey": IsSelectedKey,
		"isUniqueKey": IsUniqueKey,
		"isNumber": IsNumber,
		"isInteger": IsInteger,
		"isBoolean": IsBoolean,
		"isDate": IsDate,
		"isUniqueList": IsUniqueList,
		"isStringList": IsStringList,
		"maxLength": MaxLength,
		"pattern": IsPatternMatch
	};
});
