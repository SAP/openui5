sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], 
    function(jQuery, XMLComposite) {
	"use strict";
	var ForwardText = sap.ui.core.XMLComposite.extend("composites.ForwardText", {
		metadata: {
			aggregations: {
				textItems: {
					type: "sap.m.Text",
					multiple: true,
					invalidate: true
				},
				text: {
					type: "sap.m.Text",
					multiple: false
				}
			},
			defaultAggregation: "textItems"
		},
		alias: "forwardtext"
	});
	
	return ForwardText;
}, /* bExport= */true);
