sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], 
	function(jQuery, XMLComposite, XML) {
	"use strict";
	var TextList = XMLComposite.extend("composites.TextList", {
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
				outerLinks: {
					type: "sap.m.Link",
					multiple: true,
					invalidate: true
				}
			}
		}
	});
	
	return TextList;
}, /* bExport= */true);
