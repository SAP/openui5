/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], function(jQuery, FragmentControl) {
	"use strict";
	var Field = FragmentControl.extend("sap.ui.core.internal.samples.composite.fragmentcontrol.ex.comp.field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Value Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value Input",
				},
				textFirst: {
					type: "string",
					defaultValue: "x"
				}
			}
		},
		fragment: "sap.ui.core.internal.samples.composite.fragmentcontrol.ex.comp.field"
	});
	return Field;
}, /* bExport= */ true);
