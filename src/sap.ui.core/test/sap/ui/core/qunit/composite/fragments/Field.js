/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], function(jQuery, FragmentControl) {
	"use strict";
	var Field = FragmentControl.extend("fragments.Field", {
		metadata: {
			properties: {
				text: {
					type: "string"
				},
				value: {
					type: "string",
					defaultValue: "Default Value",
				}
			}
		}
	});
	return Field;
}, /* bExport= */ true);
