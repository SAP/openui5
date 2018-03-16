/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'
], function(jQuery, XMLComposite) {
	"use strict";
	var Field = XMLComposite.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.comp.field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Value Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value Input"
				},
				textFirst: {
					type: "string",
					defaultValue: "y",
					invalidate: "template"
				},
				desktop: {
					type: "string",
					defaultValue: "z",
					invalidate: "template"
				},
				tablet: {
					type: "string",
					defaultValue: "w",
					invalidate: "template"
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.comp.field"
	});
	return Field;
}, /* bExport= */ true);
