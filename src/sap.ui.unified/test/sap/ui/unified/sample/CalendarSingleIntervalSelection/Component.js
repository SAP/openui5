jQuery.sap.declare("sap.ui.unified.sample.CalendarSingleIntervalSelection.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.CalendarSingleIntervalSelection.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.CalendarSingleIntervalSelection.CalendarSingleIntervalSelection",
		dependencies : {
			libs : [
				"sap.ui.unified"
			]
		},
		includes: ["style.css"],
		config : {
			sample : {
				files : [
					"CalendarSingleIntervalSelection.view.xml",
					"CalendarSingleIntervalSelection.controller.js"
				]
			}
		}
	}
});