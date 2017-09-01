sap.ui.define(['sap/ui/core/XMLComposite'], 
    function(XMLComposite) {
	"use strict";
	var FfText = sap.ui.core.XMLComposite.extend("composites.FfText", {
		metadata: {
			aggregations: {
				items: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			defaultAggregation: "items"
		}
	});
	
	return FfText;
}, /* bExport= */true);
