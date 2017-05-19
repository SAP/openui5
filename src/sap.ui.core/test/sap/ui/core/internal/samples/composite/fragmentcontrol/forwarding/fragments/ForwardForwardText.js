sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], 
    function(jQuery, FragmentControl) {
	"use strict";
	var ForwardForwardText = sap.ui.core.FragmentControl.extend("fragments.ForwardForwardText", {
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
