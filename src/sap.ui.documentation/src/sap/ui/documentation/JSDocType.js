/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control'
], function(Control) {
	"use strict";

	const REGEXP_TEMPLATE_PLACEHOLDER = /(\$\{\d+\})/; // matches ${i} where i is a number

	/**
	 * @class
	 * Renders composite types of JSDoc entities inside the Demo Kit
	 * @extends sap.ui.core.Control
	 * @private
	 * @ui5-restricted sdk
	 * @name sap.ui.documentation.JSDocType
	 */
	return Control.extend("sap.ui.documentation.JSDocType", {
		metadata: {
			library: "sap.ui.documentation",
			properties: {
				/**
				 * @type {{template=: string, UI5Types=: string[]}}
				 */
				typeInfo: {type : "object", defaultValue : {}}
			}
		},

		renderer: {
			apiVersion: 2,

			render: function (oRm, oControl) {

				function renderLinkForType(oRm, sType) {
					if (!sType) {
						return;
					}
					oRm.openStart("a");
					oRm.class("sapUiJSDocTypeLink");
					oRm.attr("href", "api/" + sType);
					oRm.openEnd();
					oRm.text(sType);
					oRm.close("a");
				}

				var oTypeInfo = oControl.getTypeInfo();
				if (!oTypeInfo?.UI5Types && !oTypeInfo?.template) {
					// try to get the old 'types' array and convert it to the new typeInfo structure
					const aTypes = oControl.getBinding("typeInfo")?.getContext()?.getProperty("types");
					// TODO share this code with formatter
					if ( Array.isArray(aTypes) ) {
						const UI5Types = [];
						const template = aTypes.map(({value, linkEnabled}) => {
							if ( linkEnabled ) {
								UI5Types.push(value);
								return `\${${UI5Types.length - 1}}`;
							}
							return value;
						}).join(" | ");
						oTypeInfo = {
							template,
							UI5Types
						};
					}
				}
				if (!oTypeInfo?.UI5Types && !oTypeInfo?.template) {
					return;
				}

				var sTemplate = oTypeInfo.template || "${0}", // default template
					iNextType = 0;

				oRm.openStart("div", oControl);
				oRm.class("sapUiJSDocType");
				oRm.openEnd();

				sTemplate.split(REGEXP_TEMPLATE_PLACEHOLDER).forEach(function (sPart) {
					if (REGEXP_TEMPLATE_PLACEHOLDER.test(sPart)) {
						renderLinkForType(oRm, oTypeInfo.UI5Types[iNextType++]);
					} else {
						oRm.text(sPart);
					}
				});

				oRm.close("div");
			}
	}});

});