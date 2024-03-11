/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FieldBaseDelegate",
	'sap/ui/core/date/UI5Date',
	"sap/ui/mdc/enums/ContentMode"

], function (FieldBaseDelegate, UI5Date, ContentMode) {
	"use strict";

	var FieldBaseOrdersSampleDelegate = Object.assign({}, FieldBaseDelegate);

	/*
	* In this exemplatory override, the created DateTimePicker is customized with a maxDate
	*/
	FieldBaseOrdersSampleDelegate.createContent = async function(oField, sContentMode, sId) {
		const oDefaultContent = await FieldBaseDelegate.createContent.apply(this, arguments);
		if (sContentMode === ContentMode.EditOperator && oDefaultContent?.[0]?.isA("sap.m.DateTimePicker")) {
			oDefaultContent?.[0]?.setMaxDate(UI5Date.getInstance());
		}
		return oDefaultContent;
	};
	return FieldBaseOrdersSampleDelegate;
});
