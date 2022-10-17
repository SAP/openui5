sap.ui.define([
	"sap/m/TextArea",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/CheckBox",
	"sap/m/App"
], function(Shell, Label, Page, Toolbar, ToolbarSpacer, CheckBox, App, ComponentContainer) {
	"use strict";

	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
		oOverLimitTA = new Shell({
			value: "This is text",
			maxLength: 6,
			showExceededText: true
		}),
		oContentTA = new Shell({
			placeholder: "{/placeholder}",
			showExceededText: true,
			value: lorem,
			editable: true,
			width: "100%",
			growing: true,
			maxLength: 40
		}),
		oDefaultTA = new Shell({
			placeholder: "{/placeholder}",
			showExceededText: true,
			editable: true,
			width: "100%",
			maxLength: 40
		}),
		oCaunterTA = new Shell({
			placeholder: "{/placeholder}",
			showExceededText: true,
			value: "This is text",
			editable: true,
			width: "60%",
			rows: 4,
			maxLength: 40
		}),
		oDisabledTA = new Shell({
			value : "Disabled Textarea:\n\n" + lorem + lorem,
			enabled : false,
			editable : false,
			width : "99%",
			rows : 4,
			ariaLabelledBy: "labelDisabled"
		}),
		oLabelDisabled = new Label("labelDisabled", {
			width: "100%",
			text: "Not interactable sample",
			labelFor: oDisabledTA
		}),
		oWarningTA = new Shell({
			value : "ValueState : Warning \n\n" + lorem + lorem,
			valueState : "Warning",
			width : "100%",
			rows : 3,
			ariaLabelledBy: "labelWarning"
		}),
		oLabelWarning = new Label("labelWarning", {
			width: "100%",
			text: "Warning value state sample",
			labelFor: oWarningTA
		}),
		oErrorTA = new Shell({
			value : "ValueState : Error \r\n\n" + lorem + lorem,
			valueState : "Error",
			width : "90%",
			rows : 3,
			ariaLabelledBy: "labelError"
		}),
		oLabelError = new Label("labelError", {
			width: "100%",
			text: "Error value state sample",
			labelFor: oErrorTA
		}),
		oWrappingTA = new Shell({
			value : "Wrapping: Off Scroll horizontal --- " + lorem,
			wrapping : "Off",
			width : "90%",
			rows : 3,
			ariaLabelledBy: "labelWrapping"
		}),
		oLabelWrapping = new Label("labelWrapping", {
			width: "100%",
			text: "Wrapping sample",
			labelFor: oWrappingTA
		}),
		oReadOnlyTA = new Shell({
			value : "Not Editable: " + lorem,
			editable : false,
			width : "100%",
			rows : 3,
			ariaLabelledBy: "labelReadOnly"
		}),
		oLabelReadOnly = new Label("labelReadOnly", {
			width: "100%",
			text: "Read only state sample",
			labelFor: oReadOnlyTA
		}),
		oPage = new Page({
			title: "TextArea Accessibility Test Page",
			enableScrolling: true,
			content: [
				oOverLimitTA,
				oContentTA,
				oDefaultTA,
				oCaunterTA,
				oLabelDisabled,
				oDisabledTA,
				oLabelWarning,
				oWarningTA,
				oLabelError,
				oErrorTA,
				oLabelWrapping,
				oWrappingTA,
				oLabelReadOnly,
				oReadOnlyTA
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					new CheckBox("compactMode", {
						text: "Compact Mode",
						selected : false,
						select : function() {
							document.body.classList.toggle("sapUiSizeCompact");
						}
					})
				]
			})
		});

	new App().addPage(oPage).placeAt("body");
});
