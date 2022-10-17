sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/library",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/FlexItemData",
	"sap/m/Text",
	"sap/ui/core/HTML",
	"sap/base/Log"
], function(App, Page, Button, HBox, mobileLibrary, Label, Input, FlexItemData, MText, HTML, Log) {
	"use strict";

	// shortcut for sap.m.FlexAlignItems
	var FlexAlignItems = mobileLibrary.FlexAlignItems;

	var app = new App("myApp", {
		initialPage:"page1",
		navigate:function(evt) { // log navigation event info
			var info = "Navigating from " + evt.getParameter("fromId") + " to " + evt.getParameter("toId");
			if (evt.getParameter("firstTime")) {
				info += " (" + evt.getParameter("toId") + " is visited for the first time!)";
			}
			Log.info(info);
		}
	});

	var page1 = new Page("page1", {
		title: "Page 1",
		titleLevel: "H1",
		content : [ new Button({
			text : "[default] to Page 2",
			press : function() {
				app.to("page2");
			}
		}),
			new Button({
				text : "SLIDE to Page 2",
				press : function() {
					app.to("page2", "slide");
				}
			}),
			new Button({
				text : "FADE to Page 2",
				press : function() {
					app.to("page2", "fade");
				}
			}),
			new Button({
				text : "FLIP to Page 2",
				press : function() {
					app.to("page2", "flip");
				}
			}),
			new Button({
				text : "DOOR to Page 2",
				press : function() {
					app.to("page2", "door");
				}
			}),
			new Button({
				text : "SHOW to Page 2",
				press : function() {
					app.to("page2", "show");
				}
			}),
			new Button({
				text : "Slide to Page 2 AND transfer the value of the following Input field",
				press : function() {
					var value = sap.ui.getCore().byId("p1input").getValue();
					app.to("page2", {payloadInfo:value});
				}
			}),
			new HBox({
				alignItems: FlexAlignItems.Center,
				items: [
					new Label({
						text: "Label for input",
						labelFor: "p1input"
					}),
					new Input("p1input", {
						layoutData: new FlexItemData({
							growFactor: 1
						})
					})
				]
			})
		]
	}).addEventDelegate({
		onBeforeShow: function(evt) {
			Log.info("page 1 is going to be shown (dir: " + evt.direction + ")");
		},
		onAfterHide: function(evt) {
			Log.info("page 1 has been hidden (dir: " + evt.direction + ")");
		}
	});


	var page2 = new Page("page2", {
		title:"Page 2",
		titleLevel: "H1",
		showNavButton: true,
		navButtonText: "Page 1",
		navButtonPress: function(){ app.back(); },
		icon: "images/SAPUI5.jpg",
		enableScrolling: false,
		content : [ new Button({
			text : "SLIDE to Page 3",
			press : function() {
				app.to("page3", "slide");
			}
		}),
			new Button({
				text : "FADE to Page 3",
				press : function() {
					app.to("page3", "fade");
				}
			}),
			new Button({
				text : "SHOW to Page 3",
				press : function() {
					app.to("page3", "show");
				}
			}),
			new HBox({
				alignItems: FlexAlignItems.Center,
				width: "100%",
				items: [
					new Label({
						text : "Data passed from page 1:",
						labelFor: "p2input"
					}),
					new Input("p2input", {
						value : null,
						width: "100%",
						layoutData: new FlexItemData({
							growFactor: 1
						})
					})
				]
			}),
			new MText({
				text: "This is the second page!"
			}),
			new HTML({content:"<div>This page does not scroll.</div>"})
		]
	}).addEventDelegate({
		onBeforeShow: function(evt) {
			Log.info("page 2 is going to be shown (dir: " + evt.direction + ")");
			var textToDisplay = "From page 1: " + evt.data.payloadInfo;
			if (evt.isBack) {
				textToDisplay += ", from page 3: " + evt.backData.myBackPayload;
			}
			sap.ui.getCore().byId("p2input").setValue(textToDisplay);
		},
		onAfterHide: function(evt) {
			Log.info("page 2 has been hidden (dir: " + evt.direction + ")");
		}
	});

	var page3 = new Page("page3", {
		title:"Page 3",
		titleLevel: "H1",
		showNavButton: true,
		navButtonText: "Home",
		navButtonPress: function(){ app.backToTop(); },
		icon: "images/SAPUI5.jpg",
		content : [
			new Button({text : "Back to Page 2", press:function(){
				app.back({myBackPayload:sap.ui.getCore().byId("p3input").getValue()});
			}}),
			new HBox({
				alignItems: FlexAlignItems.Center,
				items: [
					new Label({
						text: "Label for input",
						labelFor: "p3input"
					}),
					new Input("p3input", {
						value : null,
						layoutData: new FlexItemData({
							growFactor: 1
						})
					})
				]
			}),
			new MText({
				text: "Last page... finally"
			}),
			new HTML({content:"<div>The 'Back' button directly navigates back to the initial page!</div>"})
		]
	}).addEventDelegate({
		onBeforeShow: function(evt) {
			Log.info("page 3 is going to be shown (dir: " + evt.direction + ")");
		},
		onAfterHide: function(evt) {
			Log.info("page 3 has been hidden (dir: " + evt.direction + ")");
		}
	});

	app.addPage(page1).addPage(page2).addPage(page3);

	app.placeAt("body");
});
