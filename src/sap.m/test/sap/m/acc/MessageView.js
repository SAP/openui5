sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageItem",
	"sap/m/MessageView",
	"sap/ui/core/InvisibleText",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Popover",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/App",
	"sap/ui/core/Core"
], function(
	Log,
	JSONModel,
	MessageItem,
	MessageView,
	InvisibleText,
	Dialog,
	Button,
	Popover,
	mobileLibrary,
	IconPool,
	CheckBox,
	Page,
	Toolbar,
	ToolbarSpacer,
	App,
	oCore
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	var mockMarkupDescription = "<h2>Heading h2</h2><script>alert('this JS will be sanitized')<\/script>" +
			"<p>Paragraph. At vero eos et accusamus et iusto odio dignissimos ducimus qui ...</p>" +
			"<ul>" +
			"	<li>Unordered list item 1 <a href=\"http://sap.com/some/url\">Absolute URL</a></li>" +
			"	<li>Unordered list item 2</li>" +
			"</ul>" +
			"<ol>" +
			"	<li>Ordered list item 1 <a href=\"/testsuite/test-resources/sap/m/MessageView.html?this_should_be_opened_in_new_page\">Relative URL</a></li>" +
			"	<li>Ordered list item 2</li>" +
			"</ol>";

	var aMockMessages = {
		count: 5,
		messages: [{
			type: "Error",
			title: "Error message",
			description: "First Error message description"
		}, {
			type: "Warning",
			title: "Warning without description",
			description: ""
		}, {
			type: "Success",
			title: "Success message",
			description: "First Success message description"
		}, {
			type: "Error",
			title: "Second Error message",
			description: "Second Error message description"
		}, {
			type: "Information",
			title: "Information message (Long)",
			description: mockMarkupDescription,
			markupDescription: true
		}, {
			type: "Information",
			title: " Second Information message (Long)",
			description: "Second Information message description",
			longtextUrl: "../SampleHTML.html"
		}]
	};

	var oModel = new JSONModel();
	oModel.setData(aMockMessages);

	var oMessageTemplate = new MessageItem({
			type: "{type}",
			title: "{title}",
			description: "{description}",
			longtextUrl: "{longtextUrl}",
			markupDescription: "{markupDescription}"
		}),

		oMessageViewDialog = new MessageView("mMView1", {
			items: {
				path: "/messages",
				template: oMessageTemplate
			},
			asyncURLHandler: function (config) {
				// put async validation here
				setTimeout(function () {
					Log.info('validate this url', config.url);

					// simulated answer from URL validator service: relative URLs are fine
					var allowed = config.url.lastIndexOf("http", 0) < 0;

					config.promise.resolve({
						allowed: allowed,
						id: config.id
					});

				}, 1000 + 4000 * Math.random());
			}
		}),

		oMessageView = new MessageView("mMView2", {
			items: {
				path: "/messages",
				template: oMessageTemplate
			},
			asyncURLHandler: function (config) {
				// put async validation here
				setTimeout(function () {
					Log.info('validate this url', config.url);

					// simulated answer from URL validator service: relative URLs are fine
					var allowed = config.url.lastIndexOf("http", 0) < 0;

					config.promise.resolve({
						allowed: allowed,
						id: config.id
					});

				}, 1000 + 4000 * Math.random());
			}
		}),

		oMessageViewPopover = new MessageView("mMView3", {
			items: {
				path: "/messages",
				template: oMessageTemplate
			},
			asyncURLHandler: function (config) {
				// put async validation here
				setTimeout(function () {
					Log.info('validate this url', config.url);

					// simulated answer from URL validator service: relative URLs are fine
					var allowed = config.url.lastIndexOf("http", 0) < 0;

					config.promise.resolve({
						allowed: allowed,
						id: config.id
					});

				}, 1000 + 4000 * Math.random());
			}
		}),

		oInvisibleText = new InvisibleText({
			text: "Dialog without header"
		}),

		oDialog1 = new Dialog({
			content: oMessageViewDialog,
			showHeader: false,
			beginButton: new Button("dialogCloseButton", {
				press: function () {
					oDialog1.close();
				},
				text: "Close"
			}),
			ariaLabelledBy: oInvisibleText,
			contentHeight: "440px",
			contentWidth: "640px",
			verticalScrolling: false
		}),

		oPopover = new Popover("pop1", {
			placement: PlacementType.Top,
			title: "Popover with MessageView",
			showHeader: true,
			contentWidth: "440px",
			contentHeight: "440px",
			verticalScrolling: false,
			content: [
				oMessageViewPopover
			]
		}),

		oMessageViewPopoverButton = new Button("mViewButton", {
			icon: IconPool.getIconURI("message-popup"),
			text: "MessageView in standard Popover",
			type: ButtonType.Emphasized,
			press: function () {
				oPopover.openBy(this);
			}
		}),
		oMessageViewDialogButton = new Button('mView-in-dialog-btn', {
			text: "MessageView in Dialog",
			type: "Emphasized",
			press: function () {
				oDialog1.open();
			}
		}),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		oPage = new Page("myPage", {
			title: "MessageView Accessibility Test Page",
			content: [
				oMessageView
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oInvisibleText,
					oMessageViewDialogButton,
					oMessageViewPopoverButton,
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	var oApp = new App("myApp", {
		initialPage: "myPage"
	});

	oCore.setModel(oModel);

	oApp.addPage(oPage);
	oApp.placeAt("content");
});
