sap.ui.define([
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/thirdparty/jquery",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Select",
	"sap/ui/core/library",
	"sap/m/Switch",
	"sap/ui/core/Item",
	"sap/ui/core/Element",
	"sap/base/Log"
], function (
	library,
	App,
	Page,
	MessageBox,
	Text,
	Button,
	HorizontalLayout,
	jQuery,
	VerticalLayout,
	Select,
	coreLibrary,
	Switch,
	Item,
	Element,
	Log
) {
	"use strict";

	//Shortcuts
	var app = new App("myApp", {initialPage: "page1"}),
			sMessage = "MessageBox opened!",
			sTitle = "MessageBox";

	var page1 = new Page("page1", {
		title: "MessageBox"
	});

	var oHL = new HorizontalLayout({
		allowWrapping: true
	});
	var oHL1 = new HorizontalLayout({
		allowWrapping: true
	});
	var oVL = new VerticalLayout();

	oVL.addContent(oHL);
	oVL.addContent(oHL1);
	page1.addContent(oVL);

	var aItems = [];

	jQuery.map(MessageBox.Icon, function (value, key) {
		var item = new Item("type" + value, {
			key: key,
			text: value
		});

		aItems.push(item);
	});

	var oSelect = new Select("selectType", {
		items: aItems
	});

	var oSwitch = new Switch({
		customTextOn: "CPT",
		customTextOff: "CZY",
		change: function (ev) {
			var $body = jQuery("body");

			ev.getParameter("state") ?
				$body.addClass("sapUiSizeCompact") :
				$body.removeClass("sapUiSizeCompact");
		}
	});

	jQuery.map(MessageBox.Action, function (value, key) {
		oHL.addContent(new Button("button" + key, {
			text: value + "(Action)",
			press: function () {
				MessageBox.show(sMessage, {
					icon: oSelect.getSelectedItem().getProperty("key"),
					title: sTitle,
					actions: key,
					id: "mBox" + value
				});
			}
		}));
	});

	oHL.addContent(new Button("buttonConfirm", {
		text: "Confirm",
		press: function () {
			MessageBox.confirm("Confirmation dialog is opened?", {
				id: "mBoxConfirm",
				onClose: function (bConfirmed) {
					Log.info("Dialog is " + (bConfirmed ? "" : "NOT ") + "confirmed");
				}
			});
		}
	}));

	oHL.addContent(new Button("buttonAlert", {
		text: "Alert",
		press: function () {
			MessageBox.alert("Alert some message", {
				id: "mBoxAlert"
			});
		}
	}));

	oHL1.addContent(oSelect);
	oHL1.addContent(oSwitch);

	oVL.addContent(new Text("text1", {
				text: "\nSet initial button focus by:"
			})
	);

	oVL.addContent(new Button({
		text: "Action",
		width: "270px",
		press: function () {
			MessageBox.confirm("Initial button focus is set by attribute \n initialFocus: MessageBox.Action.CANCEL", {
				onClose: function (bConfirmed) {
					Log.info("Dialog is " + (bConfirmed ? "" : "NOT ") + "confirmed");
				},
				icon: MessageBox.Icon.INFORMATION,
				title: "Set initial button focus",
				initialFocus: MessageBox.Action.CANCEL
			});
		}
	}));

	oVL.addContent(new Button({
		text: "Custom button text",
		width: "270px",
		press: function () {
			MessageBox.show("Initial button focus is set by attribute \n initialFocus: \"Custom button text\" \n Note: The name is not case sensitive", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Set initial button focus",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO, "Custom button text"],
				id: "messageBoxId1",
				initialFocus: "Custom button text"
			});
		}
	}));

	oVL.addContent(new Text("textEmphasizedAction", {
				text: "\nemphasizedAction"
			})
	);

	oVL.addContent(new Button("btnEmphasizedAction", {
		text: "Custom actions with emphasizedAction",
		width: "300px",
		press: function () {
			MessageBox.alert("MessageBox with custom actions and emphasizedAction set to YES", {
				title: "This is an alert",
				actions: [MessageBox.Action.YES],
				emphasizedAction: MessageBox.Action.YES,
				id: "mboxEmphasizedAction"
			});
		}
	}));

	oVL.addContent(new Button("btnNoEmphasizedAction", {
		text: "Custom actions with no emphasizedAction",
		width: "300px",
		press: function () {
			MessageBox.alert("MessageBox with custom actions and emphasizedAction set to null", {
				title: "This is an alert",
				actions: [MessageBox.Action.YES],
				emphasizedAction: null,
				id: "mboxNoEmphasizedAction"
			});
		}
	}));

	oVL.addContent(new Text("text2", {
				text: "\nShow long text"
			})
	);

	var sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dnec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus.";


	oVL.addContent(new Button("buttonLongText", {
		text: "Long text",
		width: "270px",
		press: function () {
			MessageBox.show(sLongText, {
				icon: MessageBox.Icon.WARNING,
				title: "MessageBox title",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						var oCheck = Element.getElementById("checkBoxId");
						var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";
						MessageBox.alert(sText, {title: "Result of CheckBox"});
					}
				},
				id: "messageBoxId"
			});
		}
	}));

	oVL.addContent(new Text("text3", {
		text: "\n Show details in MessageBox content"
	}));

	oVL.addContent(new Button("buttonDetails", {
		text: "Show details",
		width: "270px",
		press: function () {
			MessageBox.show("Ask for more...", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Info MessageBox",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO, "Test Callback"],
				id: "messageBoxId1",
				initialFocus: "Test Callback",
				details: "message1:1\nmessage2:2",
				onClose: function (oAction) {
					if (oAction === "Test Callback") {
						MessageBox.alert("Callback is working", {title: "Result of CheckBox"});
					}
				}
			});
		}
	}));

	oVL.addContent(new Button({
		text: "Show JSON details",
		width: "270px",
		press: function () {
			var oJSON = {
				"success": false,
				"error": {
					"code": 231,
					"message": "An error occurred!"
				}
			};
			MessageBox.show("Error message", {
				icon: MessageBox.Icon.ERROR,
				title: "Error",
				actions: [MessageBox.Action.OK],
				id: "messageBoxId1",
				details: oJSON
			});
		}
	}));

	oVL.addContent(new Button({
		text: "Show details from callback",
		width: "270px",
		press: function () {
			var oJSON = {
				"success": false,
				"error": {
					"code": 231,
					"message": "An error occurred!"
				}
			};
			MessageBox.show("Error message", {
				title: "Error",
				details: function () {
					return Promise.resolve(oJSON);
				}
			});
		}
	}));

	oVL.addContent(new Button({
		text: "Show details from callback - error case",
		width: "270px",
		press: function () {
			MessageBox.show("Error message", {
				title: "Error",
				details: function () {
					return new Promise(function (resolve, reject) {
						setTimeout(reject, 1500);
					});
				}
			});
		}
	}));
	var iAttemptCnt = 0;
	oVL.addContent(new Button({
		text: "Show details from callback - error on first attempt",
		width: "270px",
		press: function () {
			MessageBox.show("Error message", {
				title: "Error",
				details: function () {
					if (iAttemptCnt === 0) {
						iAttemptCnt++;
						return new Promise(function (resolve, reject) {
							setTimeout(reject, 1500);
						});
					}
					return new Promise(function (resolve, reject) {
						setTimeout(resolve.bind(null, "Display this data"), 1500);
					});
				},
				onClose: function () {
					iAttemptCnt = 0;
				}
			});
		}
	}));

	oVL.addContent(new Text("text4", {
		text: "\n Responsive Padding support (Fiori 3 themes only)"
	}));

	oVL.addContent(new Button("buttonResponsivePadding", {
		text: "Responsive Padding",
		width: "270px",
		press: function () {
			MessageBox.show(sLongText, {
				id: "messageBoxId",
				icon: MessageBox.Icon.SUCCESS,
				title: "MessageBox title",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
			});
		}
	}));

	oVL.addContent(new Text("text5", {
				text: "\n Deprecated syntax"
			})
	);

	// MessageBox.show(message, icon, title, [oActions], fnCallback, oDefaultAction, sDialogId)
	oVL.addContent(new Button({
		text: "Show",
		width: "270px",
		press: function () {
			MessageBox.show("MessageBox dialog is opened?",
					MessageBox.Icon.INFORMATION,
					"Info MessageBox",
					[MessageBox.Action.YES, MessageBox.Action.NO],
					function (bConfirmed) {
						Log.info("Dialog is " + (bConfirmed ? "" : "NOT ") + "confirmed");
					});
		}
	}));

	// MessageBox.show(message, icon, title, [oActions], fnCallback, oDefaultAction, sDialogId)
	oVL.addContent(new Button({
		text: "Alert",
		width: "270px",
		press: function () {
			// fnCallback, sTitle, sDialogId, sStyleClass
			MessageBox.alert("Alert dialog is opened?",
					function (bConfirmed) {
						Log.info("Dialog is " + (bConfirmed ? "" : "NOT ") + "confirmed");
					});
					"Info MessageBox";
					MessageBox.Icon.INFORMATION;
		}
	}));

	// MessageBox.show(message, icon, title, [oActions], fnCallback, oDefaultAction, sDialogId)
	oVL.addContent(new Button({
		text: "Confirm",
		width: "270px",
		press: function () {
			// fnCallback, sTitle, sDialogId, sStyleClass
			MessageBox.confirm("Confirmation dialog is opened?",
					function (bConfirmed) {
						Log.info("Dialog is " + (bConfirmed ? "" : "NOT ") + "confirmed");
					});
					"Info MessageBox";
					MessageBox.Icon.INFORMATION;
		}
	}));

	oVL.addContent(new Button({
		text: "Error",
		width: "270px",
		press: function () {
			MessageBox.error("This is an error message!");
	}}));

	oVL.addContent(new Button({
		text: "Information",
		width: "270px",
		press: function () {
			MessageBox.information("This is an info message!");
		}}));

	oVL.addContent(new Button({
		text: "Warning",
		width: "270px",
		press: function () {
			MessageBox.warning("This is a warning message!");
		}}));

	oVL.addContent(new Button({
		text: "Success",
		width: "270px",
		press: function () {
			MessageBox.success("This is a success message!");
		}}));

	oVL.addContent(new Text("heading", {
		text: "\n Below are examples for testing the right-to-left special cases such as numerals, phone numbers, etc. To switch the page direction to right-to-left, please paste the following parameter at the end of the URL -> &sap-ui-rtl=true"
	}));

	oVL.addContent(new Button({
		text: "Phone number (default)",
		width: "300px",
		textDirection: "LTR",
		press: function(){
			// MessageBox.confirm(message, callback, title, dialogId, class , initialFocus)
			MessageBox.show("(012) 345 678", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Phone number",
				actions: [MessageBox.Action.OK]
			});
		}
	}));

	oVL.addContent(new Button({
		text: "Phone number in LTR (corrected)",
		width: "300px",
		textDirection: "LTR",
		press: function(){
			// MessageBox.confirm(message, callback, title, dialogId, class , initialFocus)
			MessageBox.show("(012) 345 678", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Phone number in LTR",
				actions: [MessageBox.Action.OK],
				textDirection: "LTR"
			});
		}
	}));

	oVL.addContent(new Text("text6", {
		text: "\n Simply usage"
		})
	);

	oVL.addContent(new Button({
		text: "Simple show with title",
		width: "270px",
		press: function () {
			MessageBox.show("Hello curly { brace", {title: "Simple Title"});
		}
	}));

	app.addPage(page1).placeAt("content");
});