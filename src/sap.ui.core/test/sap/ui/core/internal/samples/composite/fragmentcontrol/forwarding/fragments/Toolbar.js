sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], 
    function(jQuery, FragmentControl) {
	"use strict";
	var Toolbar = sap.ui.core.FragmentControl.extend("fragments.Toolbar", {
		metadata: {
			aggregations: {
				buttons: {
					type: "sap.m.Button",
					multiple: true
				},
				secondButtons: {
					type: "sap.m.Button",
					multiple: true
				},
				aggregatedText: {
					type: "sap.m.Text",
					multiple: false,
					invalidate: true
				},
				nestedToolbar: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				nestedItems: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			},
			defaultAggregation: "buttons"
		},
		alias: "inner"
	});
	
	return Toolbar;
}, /* bExport= */true);
