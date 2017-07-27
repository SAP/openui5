/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'
], function(jQuery, XMLComposite) {
	"use strict";
	var Field = XMLComposite.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exSimpleTemplating.comp.field", {
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
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.xmlcomposite.exSimpleTemplating.comp.field"
	});
	return Field;
}, /* bExport= */ true);
