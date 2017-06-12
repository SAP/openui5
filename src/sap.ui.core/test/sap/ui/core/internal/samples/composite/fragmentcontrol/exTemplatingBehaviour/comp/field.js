/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'
], function(jQuery, FragmentControl) {
	"use strict";
	var Field = FragmentControl.extend("sap.ui.core.internal.samples.composite.fragmentcontrol.exTemplatingBehaviour.comp.field", {
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
		fragment: "sap.ui.core.internal.samples.composite.fragmentcontrol.exTemplatingBehaviour.comp.field"
	});
	return Field;
}, /* bExport= */ true);
