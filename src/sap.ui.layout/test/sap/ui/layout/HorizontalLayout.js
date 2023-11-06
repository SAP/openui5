sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Label",
	"sap/ui/core/HTML",
	"sap/ui/core/library",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/Splitter"
], function(App, Button, Input, Page, Panel, Label, HTML, coreLibrary, HorizontalLayout, Splitter) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

		// create a HorizontalLayout with some initial content
	var oDefaultLayout = new HorizontalLayout("myLayout", {
		allowWrapping: true,
		content:[
			new Button({text:"Hello World 1"}),
			new Button({text:"Hello World 2"}),
			new Panel({width:"200px", headerText:"A Panel", content:[
				new Button({text:"Hello World a"}),
				new Button({text:"Hello World b"}),
				new HTML({
					content: "<div>as df rg eth et het h erj rzj rjz</div>",
					afterRendering: function() {
						this.getDomRef().style.width = "40px";
					}
				})
			]})
	]});

	var btn3 = new Button({text:"Hello World 3"});
	oDefaultLayout.addContent(btn3);


	var oSplitter = new Splitter("splitter", {
		contentAreas: new Page({
			title: "HorizontalLayout in Splitter",
			content: new HorizontalLayout({
				allowWrapping: true,
				content: [
					new Label({ labelFor: "input1", text: "First input"}),
					new Input("input1", { width: "12rem" }),
					new Label({ labelFor: "input2", text: "Second input"}),
					new Input("input2", { width: "12rem" }),
					new Label({ labelFor: "input3", text: "Third input"}),
					new Input("input3", { width: "12rem" }),
					new Label({ labelFor: "input4", text: "Fourth input"}),
					new Input("input4", { width: "12rem" }),
					new Label({ labelFor: "input5", text: "Fifth input"}),
					new Input("input5", { width: "12rem" })
				]
			})
		})
	});

	new App({
		id: "myApp",
		pages: [
			new Page({
				id: "area-default",
				title: "HorizontalLayout",
				titleLevel: TitleLevel.H1,
				content: [oDefaultLayout, oSplitter]
			})
		],
		initialPage:"area-default"
	}).placeAt("content");
});
