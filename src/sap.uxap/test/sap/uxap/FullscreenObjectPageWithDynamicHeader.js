// Note: the HTML page 'FullscreenObjectPageWithDynamicHeader.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/thirdparty/jquery"
], async function(App, Page, XMLView, JSONModel, Table, Column, Label, Text, jQuery) {
	"use strict";
	var oApp = new App(),
		myView = await XMLView.create({definition:jQuery('#view1').html()}),
		oToggleHeaderOnTitleClickBtn = myView.byId("toggleHeaderOnTitleClick"),
		oToggleUseIconTabBarBtn = myView.byId("toggleUseIconTabBar"),
		oToggleFooterBtn = myView.byId("toggleFooter"),
		oObjectPage = myView.byId("ObjectPageLayout"),
		aData = [],
		o,
		oModel;

	oToggleHeaderOnTitleClickBtn.setPressed(oObjectPage.getToggleHeaderOnTitleClick());
	oToggleHeaderOnTitleClickBtn.attachPress(function(oEvent) {
		oObjectPage.setToggleHeaderOnTitleClick(oEvent.getParameter("pressed"));
	});

	oToggleUseIconTabBarBtn.setPressed(oObjectPage.getUseIconTabBar());
	oToggleUseIconTabBarBtn.attachPress(function(oEvent) {
		oObjectPage.setUseIconTabBar(oEvent.getParameter("pressed"));
	});

	oToggleFooterBtn.setPressed(oObjectPage.getShowFooter());
	oToggleFooterBtn.attachPress(function(oEvent) {
		oObjectPage.setShowFooter(oEvent.getParameter("pressed"));
	});

	for (var i = 1; i < 20; i++) {
		o = {};
		for (var b = 1; b < 6; b++) {
			o["text" + b] = "test" + i;
		}
		aData.push(o);
	}
	oModel = new JSONModel();
	oModel.setProperty("/rows", aData);

	var oTable1 = new Table("testUITable",{
		rows:"{model>/rows}",
		visibleRowCountMode: "Auto",
		minAutoRowCount: 2,

	});
	oTable1.setModel(oModel,"model");

	oTable1.addColumn(new Column({
		label: new Label({
			text: "col01"
		}),
		autoResizable: true,
		template: new Text({
			text:"{model>text1}"
		})
	}));

	oTable1.addColumn(new Column({
		label: new Label({
			text: "col02"
		}),
		autoResizable: true,
		template: new Text({
			text:"{model>text2}"
		})
	}));
	oTable1.addColumn(new Column({
		label: new Label({
			text: "col03"
		}),
		autoResizable: true,
		template: new Text({
			text:"{model>text3}"
		})
	}));

	myView.byId("goalsSubSection").addBlock(oTable1);


	oApp.addPage(new Page({
		title: "ObjectPage",
		content: [myView]
	})).placeAt("content");
});