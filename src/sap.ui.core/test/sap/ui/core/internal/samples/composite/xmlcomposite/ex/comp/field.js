/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], function(jQuery, XMLComposite) {
	"use strict";
	var Field = XMLComposite.extend("sap.ui.core.internal.samples.composite.xmlcomposite.ex.comp.field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Value Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value Input",
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.xmlcomposite.ex.comp.field"
	});
	return Field;
}, /* bExport= */ true);
