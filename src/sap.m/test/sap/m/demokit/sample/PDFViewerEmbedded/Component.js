sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.sample.PDFViewerEmbedded.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.m.sample.PDFViewerEmbedded.Page",
					"type": "XML",
					"async": true
				},
				dependencies : {
					libs : [
						"sap.m",
						"sap.ui.layout"
					]
				},
				config : {
					sample : {
						stretch: true,
						files : [
							"Page.view.xml",
							"Page.controller.js"
						]
					}
				}
			}
		});

		return Component;

	});
