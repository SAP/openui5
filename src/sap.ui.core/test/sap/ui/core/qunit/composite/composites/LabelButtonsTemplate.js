/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.LabelButtonsTemplate", {
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
