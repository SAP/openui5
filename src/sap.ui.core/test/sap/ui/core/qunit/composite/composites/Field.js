/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.Field", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text"
				},
				value: {
					type: "string",
					defaultValue: "Default Value"
				}
			}
		}
	});
}, /* bExport= */true);
