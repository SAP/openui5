jQuery.sap.declare("sap.ui.comp.sample.smarttable.Component");

sap.ui.core.UIComponent.extend("sap.ui.comp.sample.smarttable.Component", {

	metadata: {
		dependencies: {
			libs: [ "sap.m", "sap.ui.comp" ]
		},
		config: {
			sample: {
				stretch: true,
				files: [ "SmartTable.view.xml", "SmartTable.controller.js", "\mockserver\\metadata.xml" ]
			}
		},
		rootView: {
			"viewName": "sap.ui.comp.sample.smarttable.SmartTable",
			"type": "XML",
			"id": "rtaDemoApp"
		}
	}
});
