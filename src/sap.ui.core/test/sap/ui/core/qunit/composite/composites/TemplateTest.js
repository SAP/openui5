/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.TemplateTest", {
		metadata: {
			properties: {
				text: {
					type: "string",
					invalidate: "template"
				}
			}
		}
	});
}, /* bExport= */true);
