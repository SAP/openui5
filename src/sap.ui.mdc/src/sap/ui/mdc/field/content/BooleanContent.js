/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent"
], (DefaultContent) => {
	"use strict";

	/**
	 * Object-based definition of the Boolean content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.BooleanContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 */
	const BooleanContent = Object.assign({}, DefaultContent, {
		getDisplayMultiValue: function() {
			return [null];
		},
		getDisplayMultiLine: function() {
			return [null];
		},
		getEditMultiValue: function() {
			return [null];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getUseDefaultValueHelp: function() {
			return { name: "bool", oneOperatorSingle: true, oneOperatorMulti: true, single: true, multi: true };
		},
		createEditMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createEditMultiValue not defined!");
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createEditMultiLine not defined!");
		},
		createDisplayMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createDisplayMultiValue not defined!");
		},
		createDisplayMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createDisplayMultiLine not defined!");
		}
	});

	return BooleanContent;
});