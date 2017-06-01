
/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/m/Text'
], function(Text) {
	"use strict";

	/**
	 * @class
	 * Provides the parameters texts in the API Reference with a custom CSS class so that the texts are displayed indented.
	 * @extends sap.m.Text
	 */
	var ParamText = Text.extend("sap.ui.documentation.sdk.controls.ParamText", {
		metadata: {
			properties: {
				/**
				 * Defines the custom CSS class needed for the parameter's text in the tables.
				 */
				customClass : {type : "string", group : "Behavior", defaultValue : "sapUiDocumentationParamBold"}
			}
		},

		onAfterRendering: function () {
			this.$().addClass(this.getCustomClass());
		},

		renderer: Text.prototype.getRenderer().render
	});

	return ParamText;
});