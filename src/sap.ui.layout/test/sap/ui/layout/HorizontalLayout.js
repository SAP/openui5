sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/core/HTML",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/Splitter"
], function(App, Button, Input, Page, Panel, HTML, HorizontalLayout, Splitter) {
	"use strict";

		// create a HorizontalLayout with some initial content
	var oDefaultLayout = new HorizontalLayout("myLayout", {content:[
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
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" }),
					new Input({ width: "12rem" })
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
				content: [oDefaultLayout, oSplitter]
			})
		],
		initialPage:"area-default"
	}).placeAt("content");
});
