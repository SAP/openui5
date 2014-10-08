jQuery.sap.declare("sap.ui.unified.sample.CalendarMultipleDaySelection.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.CalendarMultipleDaySelection.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.CalendarMultipleDaySelection.CalendarMultipleDaySelection",
		dependencies : {
			libs : [
				"sap.ui.unified"
			]
		},
		includes: ["style.css"],
		config : {
			sample : {
				files : [
					"CalendarMultipleDaySelection.view.xml",
					"CalendarMultipleDaySelection.controller.js"
				]
			}
		}
	}
});