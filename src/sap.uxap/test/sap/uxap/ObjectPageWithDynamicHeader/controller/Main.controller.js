sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (
	Controller,
	JSONModel
) {
	"use strict";

	return Controller.extend("sap.uxap.ObjectPageWithDynamicHeader.controller.Main", {
		onInit: function () {
            this._initControls();
            this._bindToggleButtonHandlers();
            this._generateTableData();
            this._createTables();
        },

        _initControls: function () {
            this.myView = this.getView();
            this.oToggleHeaderOnTitleClickBtn = this.myView.byId("toggleHeaderOnTitleClick");
            this.oToggleUseIconTabBarBtn = this.myView.byId("toggleUseIconTabBar");
            this.oToggleFooterBtn = this.myView.byId("toggleFooter");
            this.oObjectPage = this.myView.byId("ObjectPageLayout");
        },

        _bindToggleButtonHandlers: function () {
            this.oToggleHeaderOnTitleClickBtn.setPressed(this.oObjectPage.getToggleHeaderOnTitleClick());
            this.oToggleHeaderOnTitleClickBtn.attachPress(this._handleToggleHeaderPress.bind(this));

            this.oToggleUseIconTabBarBtn.setPressed(this.oObjectPage.getUseIconTabBar());
            this.oToggleUseIconTabBarBtn.attachPress(this._handleToggleIconTabBarPress.bind(this));

            this.oToggleFooterBtn.setPressed(this.oObjectPage.getShowFooter());
            this.oToggleFooterBtn.attachPress(this._handleToggleFooterPress.bind(this));
        },

        _handleToggleHeaderPress: function (oEvent) {
            this.oObjectPage.setToggleHeaderOnTitleClick(oEvent.getParameter("pressed"));
        },

        _handleToggleIconTabBarPress: function (oEvent) {
            this.oObjectPage.setUseIconTabBar(oEvent.getParameter("pressed"));
        },

        _handleToggleFooterPress: function (oEvent) {
            this.oObjectPage.setShowFooter(oEvent.getParameter("pressed"));
        },

        _generateTableData: function () {
            this.aData = [];
            var o;
            for (var i = 1; i < 20; i++) {
                o = {};
                for (var b = 1; b < 6; b++) {
                    o["text" + b] = "test" + i;
                }
                this.aData.push(o);
            }
            this.oModel = new JSONModel();
            this.oModel.setProperty("/rows", this.aData);
        },

        _createTables: function () {
            this._createTable("testUITable", "goalsSubSection");
            this._createTable("testUITable2", "section3subSection");
        },

        _createTable: function (sId, sBlockId) {
            var oTable = new sap.ui.table.Table(sId, {
                rows: "{model>/rows}",
                visibleRowCountMode: "Auto",
                minAutoRowCount: 2
            });
            oTable.setModel(this.oModel, "model");

            oTable.addColumn(new sap.ui.table.Column({
                label: "col01",
                autoResizable: true,
                template: new sap.m.Text({
                    text: "{model>text1}"
                })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: "col02",
                autoResizable: true,
                template: new sap.m.Text({
                    text: "{model>text2}"
                })
            }));

            oTable.addColumn(new sap.ui.table.Column({
                label: "col03",
                autoResizable: true,
                template: new sap.m.Text({
                    text: "{model>text3}"
                })
            }));

            this.myView.byId(sBlockId).addBlock(oTable);
        }
    });
});
