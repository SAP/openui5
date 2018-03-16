/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.LabelButtonTemplate", {
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
