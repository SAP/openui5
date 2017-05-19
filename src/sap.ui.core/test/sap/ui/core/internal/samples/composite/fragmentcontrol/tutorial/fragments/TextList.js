sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'], 
	function(jQuery, FragmentControl, XML) {
	"use strict";
	var TextList = FragmentControl.extend("fragments.TextList", {
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
