/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.Cell", {
		metadata: {
			properties: {
				asLink: {
					type: "boolean",
					defaultValue: false,
					invalidate: "template"
				},
				value: {
					type: "string"
				}
			}
		}
	});
}, /* bExport= */true);