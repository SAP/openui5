sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'],
    function(jQuery, FragmentControl) {
	"use strict";
	var ForwardText = sap.ui.core.FragmentControl.extend("fragments.ForwardText", {
		metadata: {
			aggregations: {
				textItems: {
					type: "sap.m.Text",
					multiple: true
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
