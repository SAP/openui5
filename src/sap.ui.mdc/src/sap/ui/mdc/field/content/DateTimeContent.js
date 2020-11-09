/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DateContent"
], function(DateContent) {
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
		}
	});

	return DateTimeContent;
});