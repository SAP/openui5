sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.table.testApps.TableTiming", {

		onInit: function() {
			jQuery.sap.measure.setActive(false);
			this._table = null;
			this._bStorageAvailable = this._storageAvailable('localStorage');

			var oFormData;
			if (this._bStorageAvailable) {
				oFormData = localStorage.getItem("testPageSettings");
			}

			if (oFormData) {
				try {
					oFormData = JSON.parse(oFormData);
				} catch(e) {
					oFormData = false;
				}
			}

			if (!oFormData) {
				oFormData = {
					tableId: "testTable",
					visibleRowCount: 10,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					jsonModel: true,
					sequence: ["remove", "prepare", "create", "bind", "render"],
					exposeForDebug: true,
					logMarkers: true,
					rows: 200,
					columns: 10,
					tableBound: false,
					run: false
				};
			}
			var oModel = new JSONModel(oFormData);
			this.getView().setModel(oModel, "settings");

			if (!console.profile) {
				console.profile = function () {};
				console.profileEnd = function () {};
			}
		},

		_storageAvailable: function(type) {
			try {
				var storage = window[type],
					x = '__storage_test__';
				storage.setItem(x, x);
				storage.removeItem(x);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		onAfterRendering: function() {
			// just create, render and remove a table to make sure all sources were loaded
			this._createTable();
			this._bindTable();
			window.setTimeout(this._placeTable.bind(this), 0);
			window.setTimeout(this._removeTable.bind(this, true), 0);
			this._bTestPrepared = false;
			if (this.getView().getModel("settings").getProperty("/run")) {
				window.setTimeout(this._playTestSequence.bind(this), 100);
			}
		},

		onBindTable: function() {
			this._bindTable();
		},

		onCreateTable: function() {
			this._createTable();
		},

		onRenderTable: function() {
			this._placeTable();
		},

		onCleanup: function() {
			this._removeTable();
			this.getView().setModel();
		},

		onRun: function() {
			this._playTestSequence();
		},

		onSettings: function(oEvent) {
			// create popover
			if (!this._oSettingsPopover) {
				this._oSettingsPopover = sap.ui.xmlfragment("sap.ui.table.testApps.TableTimingSettings", this);
				this.getView().addDependent(this._oSettingsPopover);
				this._oSettingsPopover.bindElement("settings>/");
			}

			// delay because addDependent will do a async rerendering and the popover will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oSettingsPopover.openBy(oButton);
			});
		},

		onPrepare: function() {
			var oSettings = this.getView().getModel("settings");
			if (oSettings.getProperty("/exposeForDebug")) {
				window.fnCreateTable = function() {this._createTable();}.bind(this);
				window.fnBindTable = function() {this._bindTable();}.bind(this);
				window.fnPlaceTable = function() {this._placeTable();}.bind(this);
				window.fnRemoveTable = function() {this._removeTable();}.bind(this);
				window.fnPlay = function() {this._playTestSequence();}.bind(this);
				window.oTable = this._table;
			}

			this._bLogMarkers = oSettings.getProperty("/logMarkers");

			this._prepareTest();
		},

		_playTestSequence: function() {
			console.profile("performance");
			var aSequence = this.getView().getModel("settings").getProperty("/sequence");
			for (var i = 0; i < aSequence.length; i++) {
				switch (aSequence[i]) {
					case "remove":
						this._removeTable();
						break;
					case "create":
						this._createTable();
						break;
					case "bind":
						this._bindTable();
						break;
					case "render":
						this._placeTable();
						break;
					case "prepare":
						this.onPrepare();
						break;
				}
			}
		},

		_onRowsUpdated: function() {
			window.setTimeout(function() {console.profileEnd("performance");},2000);
		},

		_prepareTest: function() {
			var oView = this.getView();
			var oSettings = oView.getModel("settings");
			var oModel;
			if (oSettings.getProperty("/jsonModel")) {
				oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(this._getTestData(oSettings.getProperty("/rows"), oSettings.getProperty("/columns")));
			} else {
				// start mockserver
			}

			oView.setModel(oModel);
			this._bTestPrepared = true;
		},

		_createTable: function() {
			this._removeTable(true);

			if (!this._bTestPrepared) {
				this._prepareTest();
			}

			var oSettings = this.getView().getModel("settings").getData();

			var aColumns = this._getColumns(oSettings.columns);
			this._logTimeStamp("createTable");
			this._table = new sap.ui.table.Table({
				id: oSettings.tableId,
				visibleRowCount: oSettings.visibleRowCount,
				visibleRowCountMode: oSettings.visibleRowCountMode,
				columns: aColumns
			});

			this._table.attachEvent("_rowsUpdated", this._onRowsUpdated.bind(this));

			this._logTimeStamp("createTable", true);

			if (oSettings.exposeForDebug) {
				window.oTable = this._table;
			}
		},

		_getColumns: function(iColumns) {
			var aColumns = [];
			for (var i = 0; i < iColumns; i++) {
				var oControl = new sap.m.Text({text: "{c" + i + "}"});
				var oColumn = new sap.ui.table.Column({
					label: new sap.m.Label({text: "m.Text"}),
					template: oControl
				});
				aColumns.push(oColumn);
			}

			return aColumns;
		},

		_bindTable: function() {
			var oSettings = this.getView().getModel("settings");
			this._logTimeStamp("bindTable");
			var bIsBound = false;
			if (this._table && !this._table.getBinding("rows") && !this._table.isBound()) {
				this._table.bindRows("/root");
				bIsBound = true;
			} else {
				this._table.unbindRows();
				bIsBound = false;
			}
			this._logTimeStamp("bindTable", true);
			oSettings.setProperty("/tableBound", bIsBound);
		},

		_placeTable: function() {
			var oView = this.getView();
			var oPage = oView.byId("testPage");
			oPage.removeAllContent();

			this._logTimeStamp("renderTable");
			oPage.addContent(this._table);
			this._logTimeStamp("renderTable", true);

			oView.getModel("settings").setProperty("/run", true);
			if (this._bStorageAvailable) {
				localStorage.setItem("testPageSettings", JSON.stringify((this.getView().getModel("settings").getData())));
			}
		},

		_removeTable: function(bSuppressInvalidatePrepare) {
			this._logTimeStamp("removeTable");
			if (this._table) {
				this._table.destroy();
				this._table = null;
			}
			this._logTimeStamp("removeTable", true);
			if (!bSuppressInvalidatePrepare) {
				this._bTestPrepared = false;
				this.getView().getModel("settings").setProperty("/run", false);
				if (this._bStorageAvailable) {
					localStorage.setItem("testPageSettings", JSON.stringify((this.getView().getModel("settings").getData())));
				}
			}

			var oSettings = this.getView().getModel("settings");
			oSettings.setProperty("/tableBound", false);
		},

		_applySettings: function() {
			this._bTestPrepared = false;
			if (this._bStorageAvailable) {
				localStorage.setItem("testPageSettings", JSON.stringify((this.getView().getModel("settings").getData())));
			}
		},

		_logTimeStamp: function(sLabel, bEnd) {
			if (!this._bLogMarkers) {
				return;
			}

			if (console) {
				if (console.timeStamp) {
					console.timeStamp(sLabel + " " + (bEnd ? "End" : "Start"));
				}

				if (console.time && console.timeEnd) {
					if (bEnd) {
						console.timeEnd("tbl-" + sLabel);
					} else {
						console.time("tbl-" + sLabel);
					}
				}
			}
		},

		_getTestData: function(iRows, iColumns) {
			var oDataColumns = {};
			var aDataRows = [];
			var i;
			var j;

			// generate data for the model
			for (i = 0; i < iRows; i++) {
				oDataColumns = {};
				for (j = 0; j < iColumns; j++) {
					oDataColumns["c" + j] = i + "-" + j;
				}
				aDataRows[i] = oDataColumns;
			}
			return {root: aDataRows};
		}
	});
});