// Note: the HTML page 'ObjectPageWithTable.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/m/Text"
],
	async function(jQuery, App, Page, XMLView, JSONModel, Table, Column, Text) {
		"use strict";

		var oApp = new App(),
			myView = await XMLView.create({definition:jQuery('#view1').html()}),
			btnToggleFooter = myView.byId("btnToggleFooter"),
			btnToggleUseIconTabBar = myView.byId("btnToggleUseIconTabBar"),
			oObjectPage = myView.byId("ObjectPageLayout"),
			aData = [],
			o,
			oModel;

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
			label: "col01",
			autoResizable: true,
			template: new Text({
				text:"{model>text1}"
			})
		}));

		oTable1.addColumn(new Column({
			label: "col02",
			autoResizable: true,
			template: new Text({
				text:"{model>text2}"
			})
		}));
		oTable1.addColumn(new Column({
			label: "col03",
			autoResizable: true,
			template: new Text({
				text:"{model>text3}"
			})
		}));

		myView.byId("section1_SS1").addBlock(oTable1);


		btnToggleFooter.setEnabled(oObjectPage.getUseIconTabBar());
		btnToggleFooter.attachPress(function() {
			oObjectPage.setShowFooter(!oObjectPage.getShowFooter());
		});


		btnToggleUseIconTabBar.attachPress(function() {
			oObjectPage.setUseIconTabBar(!oObjectPage.getUseIconTabBar());
		});

		oApp.addPage(new Page({
			title: "ObjectPage",
			content: [myView]
		})).placeAt("content");
});