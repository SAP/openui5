sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], 
    function(jQuery, XMLComposite) {
	"use strict";
	var ForwardForwardText = sap.ui.core.XMLComposite.extend("composites.ForwardForwardText", {
		metadata: {
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				items2: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			defaultAggregation: "items"
		},
		alias: "forwardforwardtext"
	});
	
	return ForwardForwardText;
}, /* bExport= */true);
