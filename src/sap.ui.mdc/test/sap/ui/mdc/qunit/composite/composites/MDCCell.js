/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/XMLComposite'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.MDCCell", {
		metadata: {
			specialSettings: {
				metadataContexts: {
					defaultValue: "{ model: 'column', path:'',  name: 'column'}"
				}
			},
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