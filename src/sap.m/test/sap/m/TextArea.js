// Note: the HTML page 'TextArea.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Page",
	"sap/m/TextArea",
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/m/MessageToast",
	"sap/ui/core/Popup",
	"sap/m/App",
	"sap/ui/thirdparty/jquery"
], async function(Core, Button, Dialog, Page, TextArea, FormattedText, Link, MessageToast, Popup, App, jQuery) {
	"use strict";

	await Core.ready();

	var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.";

	var oPage = new Page({
		title: "TextArea Controls",
		enableScrolling: true,
		headerContent: new Button("customCssButton", {
			text: "Toggle custom CSS for visual test",
			press: function () {
				var $body = jQuery("body");

				$body.toggleClass("customClassForVisualTests");
			}
		}),
		content: [
			oTextArea1 = new TextArea("textAreaFiftyPercentWidth", {
				value : "%50 width TextArea:\n\n" + lorem + lorem,
				width : "50%",
				rows : 4
			}),

			oTextArea2 = new TextArea("textAreaOverLimit", {
				value: "This is text",
				maxLength: 6,
				showExceededText: true
			}),

			oTextArea3 = new TextArea("textAreaGrowing", {
				showExceededText: true,
				value: lorem + lorem,
				width: "100%",
				growing: true,
				maxLength: 40
			}),
			oTextArea4 = new TextArea("textAreaWithoutGrowing",{
				placeholder: "This is a placeholder text",
				showExceededText: true,
				width: "100%",
				maxLength: 40
			}),
			oTextArea5 = new TextArea("textAreaWarningState", {
				value : "Default textarea rows: 2, cols: 20",
				valueState : "Warning",
				valueStateText: "Warning message. Extra long text used as a warning message. Extra long text used as a warning message - 2 Extra long text used as a warning message - 3..",
				width : "30%"
			}),
			oTextArea6 = new TextArea("textAreaErrorState", {
				value : "ValueState : Error",
				valueState : "Error",
				formattedValueStateText: new FormattedText({
					htmlText: "Error value state message with formatted text containing %%0 and a %%1",
					controls: [
						new Link({
							text: "link",
							href: "#",
							press: function() {
								MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
							}
						}),
						new Link({
							text: "second link",
							href: "#",
							press: function() {
								MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
							}
						})
					]
				}),
			}),
			oTextArea6 = new TextArea("textAreaSuccessState", {
				value : "ValueState : Success",
				valueState : "Success",
			}),
			oTextArea6 = new TextArea("textAreaInformationState", {
				value : "ValueState : Information",
				valueState : "Information",
			}),
			oTextArea7 = new TextArea("textAreaReadOnly", {
				value : "Not Editable: " + lorem,
				editable : false,
				width : "50%",
				rows : 3
			}),
			oTextArea8 = new TextArea("textAreaDisabled", {
				value : "Disabled Textarea:\n\n" + lorem + lorem,
				enabled : false,
				width : "40%",
				rows : 4
			}),
			oTextArea9 = new TextArea("textAreaWithoutWrapping", {
				value : "Wrapping: Off Scroll horizontal --- " + lorem,
				wrapping : "Off",
				width : "40%",
				rows : 3
			}),
			oTextArea10 = new TextArea("showExceededTextWithHeight", {
				showExceededText: true,
				maxLength: 50,
				value: 'This is some text to test the showExceededText + height',
				width: '100%',
				height: '100px'
			})
		]
	}).addStyleClass("sapUiContentPadding");

	new App().addPage(oPage).placeAt("body");
});