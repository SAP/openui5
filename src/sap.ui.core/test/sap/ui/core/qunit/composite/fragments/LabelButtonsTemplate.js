/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	return FragmentControl.extend("fragments.LabelButtonsTemplate", {
		metadata: {
			properties: {
				labelFirst: {
					type: "boolean",
					defaultValue: true,
					invalidate: "template"
				}
			},
			aggregations: {
				items: {
					type: "TemplateMetadataContext",
					multiple: true,
					invalidate: "template"
				}
			}
		},
		alias: "myFC"
	});
}, /* bExport= */true);
