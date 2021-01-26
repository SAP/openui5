/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent"
], function(DefaultContent) {
	"use strict";

	/**
	 * Object-based definition of the Boolean content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.BooleanContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var BooleanContent = Object.assign({}, DefaultContent, {
		getEditMulti: function() {
			return [null];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getUseDefaultFieldHelp: function() {
			return { name: "bool", oneOperatorSingle: true, oneOperatorMulti: true };
		},
		createEditMulti: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createEditMulti not defined!");
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createEditMultiLine not defined!");
		}
	});

	return BooleanContent;
});