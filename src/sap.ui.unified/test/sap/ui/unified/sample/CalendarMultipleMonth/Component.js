jQuery.sap.declare("sap.ui.unified.sample.CalendarMultipleMonth.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.CalendarMultipleMonth.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.CalendarMultipleMonth.CalendarMultipleMonth",
		dependencies : {
			libs : [
				"sap.ui.unified"
			]
		},
		includes: ["style.css"],
		config : {
			sample : {
				files : [
					"CalendarMultipleMonth.view.xml",
					"CalendarMultipleMonth.controller.js"
				]
			}
		}
	}
});