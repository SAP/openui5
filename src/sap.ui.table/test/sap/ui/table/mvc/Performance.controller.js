/*eslint-disable no-console*/

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/library",
	"sap/m/Text",
	"sap/m/Label",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/base/Log"
], function(Table, Column, library, Text, Label, Controller, JSONModel, Measurement, Log) {
	"use strict";

	var VisibleRowCountMode = library.VisibleRowCountMode;

	Measurement.setActive(false);
	Log.setLevel(Log.Level.ERROR);

	return Controller.extend("sap.ui.table.mvc.Performance", {
		onInit: function() {
			var oSettings = localStorage.getItem("settings");
			var oView = this.getView();

			try {
				oSettings = JSON.parse(oSettings);
			} catch (e) {
			if (oSettings) {
					oSettings = null;
				}
			}

			if (!oSettings) {
				oSettings = {
					visibleRowCount: 10,
					visibleRowCountMode: VisibleRowCountMode.Auto,
					jsonModel: true,
					testSequence: ["bindTable", "renderTable"],
					dataLength: 200,
					columnCount: 10,
					autoRun: false
				};
			}

			oView.setModel(new JSONModel(oSettings), "settings");
			oView.addStyleClass("flexView");
			this.oTable = null;
			this.prepareTest();
		},

		onAfterRendering: function() {
			// Create and render the table to make sure all sources are loaded before the actual test starts.
			this.createTable();
			this.bindTable();
			this.renderTable();

			this.oTable.attachEventOnce("rowsUpdated", function() {
				this.destroyTable();
				this.clearTestResult();

				if (this.getView().getModel("settings").getProperty("/autoRun")) {
					window.setTimeout(this.runTest.bind(this), 100);
				}
			}.bind(this));
		},

		onSettingsPress: function(oEvent) {
			if (!this.oSettingsPopover) {
				this.oSettingsPopover = sap.ui.xmlfragment("sap.ui.table.mvc.PerformanceSettings", this);
				this.getView().addDependent(this.oSettingsPopover);
			}

			this.oSettingsPopover.openBy(oEvent.getSource());
		},

		onSettingsPopoverClose: function() {
			this.destroyTable();
			this.prepareTest();
			localStorage.setItem("settings", JSON.stringify((this.getView().getModel("settings").getData())));
		},

		onCreateTablePress: function() {
			this.destroyTable();
			this.clearTestResult();
			this.createMark("TestStart");
			this.createTable();
		},

		onBindTablePress: function() {
			if (!this.oTable) {
				return;
			}

			this.clearTestResult();
			this.createMark("TestStart");
			this.bindTable();
		},

		onUnbindTablePress: function() {
			if (!this.oTable) {
				return;
			}

			this.clearTestResult();
			this.createMark("TestStart");
			this.unbindTable();
		},

		onRenderTablePress: function() {
			if (!this.oTable) {
				return;
			}

			this.clearTestResult();
			this.createMark("TestStart");
			this.renderTable();
		},

		onDestroyTablePress: function() {
			if (!this.oTable) {
				return;
			}

			this.clearTestResult();
			this.createMark("TestStart");
			this.destroyTable();
		},

		onRunPress: function() {
			this.runTest();
		},

		runTest: function() {
			var aSequence = this.getView().getModel("settings").getProperty("/testSequence");

			this.destroyTable();
			this.clearTestResult();

			this.createMark("TestStart");
			this.createTable(); // Any test sequence has to start with the creation of the table.

			for (var i = 0; i < aSequence.length; i++) {
				this[aSequence[i]]();
			}
		},

		prepareTest: function() {
			var oView = this.getView();
			var oSettingsModel = oView.getModel("settings");
			var oModel;

			if (oSettingsModel.getProperty("/jsonModel")) {
				oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(this.getTestData(oSettingsModel.getProperty("/dataLength"), oSettingsModel.getProperty("/columnCount")));
			} else {
				// start mockserver
			}

			oView.setModel(oModel);
		},

		createTable: function() {
			var oSettingsModel = this.getView().getModel("settings");
			var oSettings = oSettingsModel.getData();

			this.createMark("CreateTableStart");
			this.oTable = new Table({
				visibleRowCount: oSettings.visibleRowCount,
				visibleRowCountMode: oSettings.visibleRowCountMode,
				columns: this.createColumns(oSettings.columnCount)
			});
			this.createMeasure( "Table creation", "CreateTableStart");

			this.measureFunction(this.oTable, "onRowsUpdated");
			this.measureFunction(this.oTable, "onRowsContentUpdated");
			this.measureFunction(this.oTable, "_updateTableSizes");
			this.measureFunction(this.oTable, "refreshRows");
			this.measureFunction(this.oTable, "updateRows");

			this.oTable.addDelegate({
				onBeforeRendering: function() {
					this.createMark("RenderingStart");
					this.createMark("BeforeRenderingStart");
				},
				onAfterRendering: function() {
					this.createMark("AfterRenderingStart");
				}
			}, true, this);

			this.oTable.addDelegate({
				onBeforeRendering: function() {
					this.createMeasure("onBeforeRendering", "BeforeRenderingStart");
				},
				onAfterRendering: function() {
					this.createMeasure("onAfterRendering", "AfterRenderingStart");
					detectRenderingFinished(this);
				}
			}, false, this);

			this.getView().addDependent(this.oTable);
			this.oTable.setModel(this.getView().getModel());
			window.oTable = this.oTable;
		},

		bindTable: function() {
			var sMeasureName = "Table#bindRows";

			if (this.oTable.isBound("rows")) {
				sMeasureName += " (rebind)";
			}

			this.createMark("BindTableStart");
			this.oTable.bindRows("/");
			this.createMeasure(sMeasureName, "BindTableStart");
		},

		unbindTable: function() {
			this.createMark("UnbindTableStart");
			this.oTable.unbindRows();
			this.createMark("Table#unbindRows", "UnbindTableStart");
		},

		renderTable: function() {
			if (this.oTable.getDomRef()) {
				this.oTable.invalidate();
			} else {
				this.oTable.placeAt("tableContainer");
			}

			sap.ui.getCore().applyChanges();
		},

		destroyTable: function() {
			if (!this.oTable) {
				return;
			}

			this.oTable.destroy();
			this.oTable = null;
			delete window.oTable;
		},

		createTestResult: function() {
			var aPerformanceEntries = window.performance.getEntriesByType("measure");
			var oResultContainer = document.getElementById("results");

			aPerformanceEntries.forEach(function(oPerformanceEntry) {
				oResultContainer.innerHTML += "<p>" + oPerformanceEntry.name + " - " + oPerformanceEntry.duration + "</p>";
			});
		},

		clearTestResult: function() {
			window.performance.clearMarks();
			window.performance.clearMeasures();
			document.getElementById("results").innerHTML = "";
		},

		createMark: function(sName) {
			if (window.performance.getEntriesByName(sName, "mark").length === 0) {
				window.performance.mark(sName);
			}
		},

		createMeasure: function(sMeasureName, sStartMark, bKeepMark) {
			window.performance.measure(sMeasureName, sStartMark);
			if (bKeepMark !== true) {
				window.performance.clearMarks(sStartMark);
			}
		},

		measureFunction: function(oObject, sFunctionName) {
			wrap(oObject, sFunctionName, function() {
				this.createMark(sFunctionName + "Start");
			}.bind(this), function() {
				var sObjectName = oObject.getMetadata().getName().substring(oObject.getMetadata().getName().lastIndexOf(".") + 1);
				this.createMeasure(sObjectName + "#" + sFunctionName, sFunctionName + "Start");
			}.bind(this));
		},

		createColumns: function(iColumns) {
			var aColumns = [];

			this.createMark("CreateColumnsStart");

			for (var i = 0; i < iColumns; i++) {
				var oColumn = new Column({
					label: new Label({text: "m.Text"}),
					template: new Text({text: "{c" + i + "}"})
				});
				aColumns.push(oColumn);
			}

			this.createMeasure("Column creation", "CreateColumnsStart");

			return aColumns;
		},

		getTestData: function(iRows, iColumns) {
			var oDataColumns = {};
			var aDataRows = [];
			var i;
			var j;

			for (i = 0; i < iRows; i++) {
				oDataColumns = {};
				for (j = 0; j < iColumns; j++) {
					oDataColumns["c" + j] = i + "-" + j;
				}
				aDataRows[i] = oDataColumns;
			}

			return aDataRows;
		}
	});

	/**
	 * Wraps a method.
	 *
	 * @param {Object} oObject The object whose method is to be wrapped.
	 * @param {string} sFunctionName The name of the function to wrap.
	 * @param {Function} [fnBefore] This function is called before the wrapped function is executed.
	 * @param {Function} [fnAfter] This function is called after the wrapped function is executed.
	 */
	function wrap(oObject, sFunctionName, fnBefore, fnAfter) {
		var fnOriginalFunction = oObject[sFunctionName];

		oObject[sFunctionName] = function() {
			if (fnBefore) {
				fnBefore.apply(oObject, arguments);
			}

			fnOriginalFunction.apply(oObject, arguments);

			if (fnAfter) {
				fnAfter.apply(oObject, arguments);
			}
		};
	}

	function detectRenderingFinished(oController) {
		if (oController.fnRowsUpdated) {
			oController.oTable.detachRowsUpdated(oController.fnRowsUpdated);
			delete oController.fnRowsUpdated;
		}

		oController.fnRowsUpdated = function() {
			oController.createMeasure("Rendering", "RenderingStart");
			oController.createMeasure("Overall", "TestStart");
			oController.createTestResult();
		};

		if (oController.oTable.getBinding()) {
			oController.oTable.attachEventOnce("rowsUpdated", oController.fnRowsUpdated);
		} else {
			oController.fnRowsUpdated();
		}
	}
});