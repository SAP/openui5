/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";
	var Field = undefined/*XMLComposite*/.extend("sap.ui.core.internal.samples.composite.xmlcomposite.ex.comp.field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Value Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value Input"
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.xmlcomposite.ex.comp.field"
	});
	return Field;
});
