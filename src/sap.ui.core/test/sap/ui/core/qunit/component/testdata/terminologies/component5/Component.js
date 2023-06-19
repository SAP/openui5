sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("testdata.terminologies.component5.Component", {
			metadata: {
				version: "1.0",
				rootView: {
					viewName: "testdata.terminologies.Main",
					type: "XML",
					id: "mainView",
					async: true
				},
				manifest: "json"
			}
		});
	});
