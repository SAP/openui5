sap.ui.define([
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/SearchField",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/core/HTML",
	"sap/ui/core/Icon",
	"sap/ui/core/library"
], function(App, Bar, Button, Dialog, Label, mobileLibrary, Page, SearchField, MText, Title, HTML, Icon, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	var _buttonWidth = "200px",
		oSimpleDialog = new Dialog({
			title: "Simple Dialog",
			content: new HTML({
				content: '<div id="helloWorld">Hello world text</div>' +
					'<div id="testPageText">This is accessibility test page for sap.m.Dialog</div>'
			}),
			beginButton: new Button('simpleDialogAcceptButton', {
				text: "Accept", press: function () {
					oSimpleDialog.close();
				}
			}),
			endButton: new Button('simpleDialogCancelButton', {
				text: "Cancel", press: function () {
					oSimpleDialog.close();
				}
			}),
			ariaLabelledBy : ["helloWorld", "testPageText"]
		}),
		oMessageDialog = new Dialog({
			title: "Message Dialog",
			type: DialogType.Message,
			content: new HTML({
				content: '<div id="messageDialogText">Sample text</div>'
			}),
			beginButton: new Button({
				text: "Accept", press: function () {
					oMessageDialog.close();
				}
			}),
			endButton: new Button({
				text: "Cancel", press: function () {
					oMessageDialog.close();
				}
			}),
			ariaLabelledBy : ["messageDialogText"]
		}),
		oCustomHeaderDialog = new Dialog({
			title: "Dialog with Select",
			customHeader: new Bar({
				contentLeft: [new Icon({src: "sap-icon://manager"}), new Label({text: "Custom Header"})],
				contentMiddle: [],
				contentRight: []
			}),
			content: [
				new MText("contentText", {text: "This is a dialog with custom header"})
			],
			beginButton: new Button({
				press: function () {
					oCustomHeaderDialog.close();
				},
				text: "Close"
			}),
			ariaLabelledBy : ["contentText"]
		}),
		oSuccessStateDialog = new Dialog("dialogWithSuccessState", {
			title: "Set your goals",
			icon: "sap-icon://employee",
			ariaLabelledBy: "p2",
			state: ValueState.Success,
			content: [
				new HTML({content: '<p id="p2" class="valueStateDialogContent">' +
				'One of the keys to success is creating realistic goals that can be achieved in a reasonable amount of time.</p>'})
			],
			buttons: [
				new Button({
					text: "OK",
					press: function () {
						oSuccessStateDialog.close();
					}
				})
			]
		}),
		oWarningStateDialog = new Dialog("dialogWithWarningState", {
			title: "World Domination",
			icon: "sap-icon://employee",
			ariaLabelledBy: "p3",
			state: ValueState.Warning,
			content: [
				new HTML({content: '<p id="p3" class="valueStateDialogContent">Do you want to start a new world domination campaign?</p>'})
			],
			buttons: [
				new Button({
					text: "Accept",
					press: function () {
						oWarningStateDialog.close();
					}
				}),
				new Button({
					text: "Reject",
					icon: "sap-icon://employee",
					press: function () {
						oWarningStateDialog.close();
					}
				})
			]
		}),
		oErrorStateDialog = new Dialog("dialogWithErrorState", {
			title: "Don't Give Up",
			icon: "sap-icon://employee",
			ariaLabelledBy: "p1",
			state: ValueState.Error,
			content: [
				new HTML({content: '<p id="p1" class="valueStateDialogContent">' +
				'The only error you can make is not even trying.</p>'})
			],
			buttons: [
				new Button({
					text: "OK",
					press: function () {
						oErrorStateDialog.close();
					}
				})
			]
		}),
		oSearchFieldDialog = new Dialog({
			title: "Dialog with Search Field",
			subHeader: new Bar({
				contentMiddle: [
					new Label({
						text: "Search Text:",
						labelFor: "sf1",
						width: "100px"
					}),
					new SearchField("sf1")
				]
			}),
			content: new HTML({
				content: '<div class="searchDialogContent">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi assumenda autem corporis cupiditate dicta dolores enim est eveniet laborum magnam magni maxime mollitia nostrum odit quasi, sunt! Nemo, sapiente.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi assumenda autem corporis cupiditate dicta dolores enim est eveniet laborum magnam magni maxime mollitia nostrum odit quasi, sunt! Nemo, sapiente.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi assumenda autem corporis cupiditate dicta dolores enim est eveniet laborum magnam magni maxime mollitia nostrum odit quasi, sunt! Nemo, sapiente.</div>'
			}),
			contentWidth: "40rem",
			contentHeight: "250px",
			beginButton: new Button({
				text: "Close",
				press: function () {
					oSearchFieldDialog.close();
				}
			})
		}),
		oSubtitledDialog = new Dialog({
			subHeader: new Bar({
				contentMiddle: [
					new Title({
						text: "This is a subtitle"
					})
				]
			}),
			contentWidth: "40rem",
			contentHeight: "250px",
			beginButton: new Button({
				text: "Close",
				press: function () {
					oSubtitledDialog.close();
				}
			})
		});

	var page = new Page("page", {
		title: "Dialog Accessibility Test Page",
		content: [
			new Button('simpleDialogButton', {
				text: "Simple Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oSimpleDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('msgDialogButton', {
				text: "Message Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oMessageDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('cutomHeaderDialogButton', {
				text: "With Custom Header",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oCustomHeaderDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('dialogWithSuccessStateButton', {
				text: "Success Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oSuccessStateDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('dialogWithWarningStateButton', {
				text: "Warning Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oWarningStateDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('dialogWithErrorStateButton', {
				text: "Error Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oErrorStateDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('searchFieldInDialogButton', {
				text: "SearchField in Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oSearchFieldDialog.open();
				}
			}),
			new HTML({content: "<br>"}),
			new Button('subtitleDialogButton', {
				text: "subtitle in Dialog",
				width: _buttonWidth,
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					oSubtitledDialog.open();
				}
			})
		]
	}).placeAt('content');

	var oApp = new App("myApp", { initialPage: "page" });
	oApp.addPage(page).placeAt("content");
});
