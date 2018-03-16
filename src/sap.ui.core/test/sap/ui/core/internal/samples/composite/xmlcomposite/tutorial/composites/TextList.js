sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'],
	function (jQuery, XMLComposite, XML) {
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
						multiple: false,
						forwarding: { idSuffix: "--innerControlContainer", aggregation: "content" }
					},
					outerLinks: {
						type: "sap.m.Link",
						multiple: true,
						invalidate: true,
						forwarding: { idSuffix: "--innerVBoxLinks", aggregation: "items" }
					}
				}
			}
		});
		return TextList;
	}, /* bExport= */true);
