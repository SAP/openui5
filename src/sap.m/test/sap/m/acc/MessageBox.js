sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/App"
], function(MessageBox, CheckBox, Page, Button, coreLibrary, Toolbar, ToolbarSpacer, App) {
	"use strict";

	// shortcut for sap.m.MessageBox.Action
	var Action = MessageBox.Action;

	// shortcut for sap.m.MessageBox.Icon
	var Icon = MessageBox.Icon;

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	var oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
	});

	var iAttemptCnt = 0;

	var oPage = new Page("oPage", {
		title: "MessageBox Accessibility Test Page",
		content: [
			new Button("confirmMsgDialogButton", {
				text: "Confirm",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.confirm("Approve purchase order 12345?");
				}
			}),
			new Button("alertMsgDialogButton", {
				text: "Alert",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.alert("The quantity you have reported exceeds the quantity planed.");
				}
			}),
			new Button("errorMsgDialogButton", {
				text: "Error",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.error("Select a team in the \"Development\" area.\n\"Marketing\" isn't assigned to this area.");
				}
			}),
			new Button("informationMsgDialogButton", {
				text: "Information",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.information("You booking will be reserved for 24 hours.");
				}
			}),
			new Button("warningMsgDialogButton", {
				text: "Warning",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.warning("The project schedule was last updated over a year ago.");
				}
			}),
			new Button("successMsgDialogButton", {
				text: "Success",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.success("Project 1234567 was created and assigned to team \"ABC\".");
				}
			}),
			new Button("showDetailsMsgDialogButton", {
				text: "Show Details",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.show("Your file could not be uploaded because of a security problem.", {
						icon: Icon.INFORMATION,
						title: "Information",
						actions: [Action.YES, Action.NO],
						defaultAction: Action.NO,
						details: "The security token required to upload the file to the backend system cannot be retrieved. Try refreshing your browser."
					});
				}
			}),
			new Button("showDetailsAsyncMsgDialogButton", {
				text: "Show Details Async",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.show("Your file could not be uploaded because of a security problem.", {
						icon: Icon.INFORMATION,
						title: "Information",
						details: function () {
							return new Promise(function (resolve) {
								setTimeout(function () {
									resolve("The security token required to upload the file to the backend system cannot be retrieved. Try refreshing your browser.");
								}, 1500);
							});
						}
					});
				}
			}),

			new Button({
				text: "Show details from callback - Try again",
				width: "270px",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.show("Your file could not be uploaded because of a security problem.", {
						title: "Error",
						details: function () {
							if (iAttemptCnt === 0) {
								iAttemptCnt++;
								return new Promise(function (resolve, reject) {
									setTimeout(reject, 1500);
								});
							}
							return new Promise(function (resolve, reject) {
								setTimeout(resolve.bind(null, "The security token required to upload the file to the backend system cannot be retrieved. Try refreshing your browser."), 1500);
							});
						},
						onClose: function () {
							iAttemptCnt = 0;
						}
					});
				}
			}),
			new Button("initialFocusMsgDialogButton", {
				text: "Initial Focus Action",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.confirm(
							"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
							{
								icon: Icon.INFORMATION,
								title: "Focus on a Button",
								initialFocus: Action.CANCEL
							}
					);
				}
			}),
			new Button("initialFocusCustomMsgDialogButton", {
				text: "Initial Focus Custom Button",
				ariaHasPopup: HasPopup.Dialog,
				press: function () {
					MessageBox.show(
							'Initial button focus is set by attribute \n initialFocus: \"Custom button\" \n Note: The name is not case sensitive', {
								icon: Icon.INFORMATION,
								title: "Focus on a Custom Button",
								actions: [Action.YES, Action.NO, "Custom Button"],
								initialFocus: "Custom Button"
							}
					);
				}
			})
		],
		footer: new Toolbar({
						content: [
							new ToolbarSpacer(),
							oCompactMode
						]
				})
	});

	var app = new App("myApp", {initialPage: "oPage"});
	app.addPage(oPage);
	app.placeAt('content');
});
