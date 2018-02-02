sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'], 
    function(jQuery, XMLComposite) {
	"use strict";
	var ForwardForwardText = sap.ui.core.XMLComposite.extend("composites.ForwardForwardText", {
		metadata: {
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: { idSuffix: "--VBox", aggregation: "items" }
				},
				items2: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: { idSuffix: "--ForwardText", aggregation: "textItems" }
				}
			},
			defaultAggregation: "items"
		}
	});
	
	return ForwardForwardText;
}, /* bExport= */true);
