/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	return FragmentControl.extend("fragments.LabelButtonTemplate", {
		metadata: {
			properties: {
				label: {
					type: "string"
				},
				value: {
					type: "string"
				},
				labelFirst: {
					type: "boolean",
					defaultValue: true,
					invalidate: "template"
				}
			}
		}
	});
}, /* bExport= */true);
