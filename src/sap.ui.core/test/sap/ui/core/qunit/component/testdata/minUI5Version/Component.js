sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("testdata.minUI5version", {
			metadata: {
				version: "1.0",
				rootView: {
					viewName: "testdata.minUI5version.Main",
					type: "XML",
					id: "mainView",
					async: true
				},
				manifest: "json",
				interfaces: ["sap.ui.core.IAsyncContentCreation"]
			}
		});
	});
