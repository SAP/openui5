sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], 
    function(jQuery, FragmentControl) {
	"use strict";
	var Toolbar2 = sap.ui.core.FragmentControl.extend("fragments.Toolbar2", {
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
		}
	});
	
	return Toolbar2;
}, /* bExport= */true);
