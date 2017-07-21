sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'
], function(jQuery, XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.TextList", {
		metadata: {
			aggregations: {
				texts: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				outerButton: {
					type: "sap.m.Button",
					multiple: false
				},
				outerlinks: {
					type: "sap.m.Link",
					multiple: true
				}
			}
		}
	});
}, /* bExport= */true);
