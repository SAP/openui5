sap.ui.define([
	"sap/m/TextArea",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/CheckBox",
	"sap/m/App"
], function(TextArea, Label, Page, Toolbar, ToolbarSpacer, CheckBox, App) {
	"use strict";

	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
		oOverLimitTA = new TextArea({
			value: "This is text",
			maxLength: 6,
			width: "100%",
			showExceededText: true
		}),
		oOverLimitTALabel = new Label({
			labelFor: oOverLimitTA,
			text: "TextArea with maxLength set to 6"
		}),
		oContentTA = new TextArea({
			placeholder: "{/placeholder}",
			showExceededText: true,
			value: lorem,
			editable: true,
			width: "100%",
			growing: true,
			maxLength: 40
		}),
		oContentTALabel = new Label({
			labelFor: oContentTA,
			text: "TextArea with growing set to true"
		}),
		oDefaultTA = new TextArea({
			placeholder: "{/placeholder}",
			showExceededText: true,
			editable: true,
			width: "100%",
			maxLength: 40
		}),
		oDefaultTALabel = new Label({
			labelFor: oDefaultTA,
			text: "TextArea with maxLength set to 40"
		}),
		oCounterTA = new TextArea({
			placeholder: "{/placeholder}",
			showExceededText: true,
			value: "This is text",
			editable: true,
			width: "100%",
			rows: 4,
			maxLength: 40
		}),
		oCounterTALabel = new Label({
			labelFor: oCounterTA,
			text: "TextArea with rows set to 4"
		}),
		oDisabledTA = new TextArea({
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
		oWarningTA = new TextArea({
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
		oErrorTA = new TextArea({
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
		oWrappingTA = new TextArea({
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
		oReadOnlyTA = new TextArea({
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
				oOverLimitTALabel,
				oOverLimitTA,
				oContentTALabel,
				oContentTA,
				oDefaultTALabel,
				oDefaultTA,
				oCounterTALabel,
				oCounterTA,
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
