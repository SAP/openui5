sap.ui.define([
	"./ClipboardUtils",
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/CopyProvider",
	"sap/m/plugins/CellSelector",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData",
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"test-resources/sap/ui/mdc/qunit/QUnitUtils",
	"test-resources/sap/ui/mdc/qunit/table/QUnitUtils"
], function(ClipboardUtils, Text, Table, Column, ColumnListItem, GridTable, GridColumn, MultiSelectionPlugin, MDCTable, MDCColumn, PluginBase, CopyProvider, CellSelector, JSONModel, CustomData, Core, coreLib, MessageToast, MessageBox, MDCQUnitUtils, MDCTableQUnitUtils) {

	"use strict";
	/*global sinon, QUnit */

	var aData = [];
	for (var i = 0; i < 25; i++) {
		aData.push({
			id: i,
			name: "name" + i,
			color: "color" + (i % 10)
		});
	}

	var oJSONModel = new JSONModel(aData);

	function createResponsiveTable(mSettings) {
		mSettings = Object.assign({
			growing: true,
			growingThreshold: 10,
			mode: "MultiSelect",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new Column({
					header: new Text({ text: sKey }),
					customData: new CustomData({ key: "property", value: sKey })
				});
			}),
			items: {
				path: "/",
				template: new ColumnListItem({
					cells: Object.keys(aData[0]).map(function(sKey) {
						return new Text({
							text: "{" + sKey + "}"
						});
					})
				})
			},
			models: oJSONModel
		}, mSettings);

		var oTable = new Table(mSettings);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		oTable.focus();
		return oTable;
	}

	function createGridTable(mSettings) {
		mSettings = Object.assign({
			threshold: 10,
			selectionMode: "MultiToggle",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new GridColumn({
					label: new Text({ text: sKey }),
					template: new Text({ text: "{" + sKey + "}", wrapping: false }),
					customData: new CustomData({ key: "property", value: sKey })
				});
			}),
			rows: { path: "/" },
			models: oJSONModel
		}, mSettings);

		var oTable = new GridTable(mSettings);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		oTable.focus();
		return oTable;
	}

	function createMDCTable(mSettings) {
		mSettings = Object.assign({
			type: "ResponsiveTable",
			delegate: {
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {
					collectionPath: "/"
				}
			},
			selectionMode: "Multi",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new MDCColumn({
					header: sKey,
					propertyKey: sKey,
					template: new Text({ text: "{" + sKey + "}" }),
					customData: new CustomData({ key: "property", value: sKey })
				});
			}),
			models: oJSONModel
		}, mSettings);

		var oTable = new MDCTable(mSettings);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		oTable.focus();
		return oTable;
	}

	QUnit.module("isApplicable");
	QUnit.test("Standalone usage, extractData is mandatory", function(assert) {
		assert.throws(function() {
			new Table({dependents: new CopyProvider()});
		}, "extractData property is missing in the constructor");

		var oSecureContextStub = sinon.stub(window, "isSecureContext").value(false);
		var oCopyProvider = new CopyProvider({
			extractData: function() {}
		});
		var oTable = new Table({
			dependents: oCopyProvider
		});
		assert.ok(oCopyProvider.isApplicable(), "isApplicable returns true despite insecure context");
		oTable.destroy();
		oSecureContextStub.restore();
	});

	QUnit.test("extractData is managed by the CopyProvider, this method must be empty", function(assert) {
		ClipboardUtils.stub();
		var oCopyProvider = new CopyProvider({
			extractData: Function.prototype
		});
		var oTable = createMDCTable();

		return oTable.initialized().then(function() {
			assert.throws(function() {
				oTable.setCopyProvider(oCopyProvider);
			}, "extractData property must be managed by the CopyProvider");
			ClipboardUtils.restore();
			oTable.destroy();
		});
	});

	QUnit.test("extractData is managed by the CopyProvider, getColumnClipboardSettings method must be implemented", function(assert) {
		ClipboardUtils.stub();
		var oCopyProvider = new CopyProvider();
		var oTable = createMDCTable();

		oTable.getColumnClipboardSettings = undefined;
		return oTable.initialized().then(function() {
			assert.throws(function() {
				oTable.setCopyProvider(oCopyProvider);
			}, "getColumnClipboardSettings method must be implemented by the parent of CopyProvider");
			ClipboardUtils.restore();
			oTable.destroy();
		});
	});

	var TableModule = function(fnTableFactory, mSettings) {
		return {
			before: function(assert) {
				ClipboardUtils.stub();
				this.selectRow = function(iIndex) {
					var oTable = this.oTable;
					if (oTable.isA("sap.ui.mdc.Table")) {
						oTable = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.SelectionPlugin") || oTable._oTable;
					}
					if (oTable.isA("sap.m.Table")) {
						oTable.getItems()[iIndex].setSelected(true);
					} else {
						oTable.addSelectionInterval(iIndex, iIndex);
					}
				};
				this.removeSelections = function() {
					this.oTable[this.oTable.isA("sap.m.Table") ? "removeSelections" : "clearSelection"]();
				};
				this.IwillNeverBeCalled = function() {
					assert.ok(false, "I should never have been called");
				};
			},
			beforeEach: function() {
				this.oTable = fnTableFactory(mSettings);
				var oCopyProvider = this.oTable.getAggregation("copyProvider");
				if (oCopyProvider) {
					this.oCopyProvider = oCopyProvider;
				} else {
					this.oCopyProvider = new CopyProvider({
						extractData: function(oContext, oColumn) {
							return oContext.getProperty(oColumn.data("property"));
						}
					});
					this.oTable.addDependent(this.oCopyProvider);
				}
				this.oCopyProviderInvalidateSpy = sinon.spy(this.oCopyProvider, "invalidate");
			},
			afterEach: function() {
				this.oTable.destroy(true);
				this.oCopyProviderInvalidateSpy.restore();
			},
			after: function() {
				ClipboardUtils.restore();
			}
		};
	};

	var apiTest = async function (assert) {
		this.selectRow(1);
		this.selectRow(3);

		this.oTable.focus();
		await navigator.clipboard.writeText("DummyClipboardText");
		this.oCopyProvider.attachEventOnce("copy", function(e) {
			e.preventDefault();
		});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "DummyClipboardText", "Preventing default on copy event did not allow copy to clipboard");

		this.oCopyProvider.attachEventOnce("copy", function(e) {
			assert.deepEqual(e.getParameter("data"), e.getSource().getSelectionData(), "data parameter is same as the #getSelectionData API");
			assert.deepEqual(e.getParameter("data"), [].concat([Object.values(aData[1])], [Object.values(aData[3])]), "data parameter is valid");
		});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "1\tname1\tcolor1\n3\tname3\tcolor3", "Selection is copied via keyboard event to the clipboard");

		await navigator.clipboard.writeText("DummyClipboardText");
		this.oCopyProvider.attachCopy(this.IwillNeverBeCalled);
		this.oCopyProvider.copySelectionData();
		this.oCopyProvider.detachCopy(this.IwillNeverBeCalled);
		assert.equal(await navigator.clipboard.readText(), "1\tname1\tcolor1\n3\tname3\tcolor3", "Selection is copied via copySelectionData to the clipboard");

		this.oCopyProvider.attachEventOnce("copy", function(e) {
			e.getParameter("data")[1] = ["x", "name\tx", "color\nx"];
		});
		this.oCopyProvider.copySelectionData(true);
		assert.equal(await navigator.clipboard.readText(), '1\tname1\tcolor1\nx\t"name\tx"\t"color\nx"', "Data parameter of the copy event is mutable");

		this.oCopyProvider.setCopySparse(true);
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "1\tname1\tcolor1\n\t\t\n3\tname3\tcolor3", "copySparse=true includes empty rows between selected rows");

		this.oCopyProvider.setExcludeContext(function(oContext) {
			return oContext.getProperty("id") == 1;
		});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "3\tname3\tcolor3", "excludeContext callback disallows first context to be copied to the clipboard");

		this.oCopyProvider.setExtractData(function(oContext, oColumn) {
			var sProperty = oColumn.data("property");
			return sProperty == "name" ? null : oContext.getProperty(sProperty);
		});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "3\tcolor3", "Returning 'null' from the extractData callback disallows column to be copied");

		this.oCopyProvider.setExtractData(function(oContext, oColumn) {
			var sProperty = oColumn.data("property");
			var vValue = oContext.getProperty(sProperty);
			return sProperty == "name" ? [vValue, "surname" + oContext.getProperty("id")] : vValue;
		});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "3\tname3\tsurname3\tcolor3", "Returning array from the extractData callback splits them into cells");

		this.removeSelections();
		this.oCopyProvider.attachCopy(this.IwillNeverBeCalled);
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "3\tname3\tsurname3\tcolor3", "Clipboard is not changed since there is no selection to copy");

		this.selectRow(5);
		var fnExtractData = this.oCopyProvider.getExtractData();
		this.oCopyProvider.setExtractData();
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "3\tname3\tsurname3\tcolor3", "Clipboard is not changed since there is no extractData property");

		this.oCopyProvider.setExtractData(fnExtractData);
		this.oTable.removeAllColumns();
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "3\tname3\tsurname3\tcolor3", "Clipboard is not changed since there is no columns to copy");
		this.oCopyProvider.detachCopy(this.IwillNeverBeCalled);

		assert.ok(this.oCopyProviderInvalidateSpy.notCalled, "CopyProvider was never invalidated");

		// context is not secure
		var oClipboardStub = sinon.stub(window, "navigator").value({clipboard: undefined});
		var oSecureContextStub = sinon.stub(window, "isSecureContext").value(false);

		assert.ok(function() {
			this.oCopyProvider.copySelectionData(false);
		}.bind(this), "executed in unsecure context, does not throw an error when selection data is empty");

		var oSelectionDataStub = sinon.stub(this.oCopyProvider, "getSelectionData").returns(["A", "B"]);
		assert.throws(function() {
			this.oCopyProvider.copySelectionData(false);
		}.bind(this), "throws an error when not in a secure context");

		this.oCopyProvider.attachEventOnce("copy", function(oEvent) {
			oEvent.preventDefault();
		});
		assert.ok(function() {
			this.oCopyProvider.copySelectionData(true);
		}.bind(this), "executed in unsecure context, does not throw an error when default is prevented");

		oClipboardStub.restore();
		oSecureContextStub.restore();
		oSelectionDataStub.restore();
	};


	QUnit.module("ResponsiveTable", TableModule(createResponsiveTable));

	QUnit.test("API", apiTest);

	QUnit.test("Select all", async function(assert) {
		this.oTable.selectAll();
		ClipboardUtils.triggerCopy();
		assert.equal((await navigator.clipboard.readText()).split("\n").length, this.oTable.getGrowingThreshold(), "Not all contexts, only growing contexts are copied");
	});

	QUnit.test("No binding", async function(assert) {
		var aClonedItems = this.oTable.getItems().map(function(oItem) {
			return oItem.clone();
		});
		this.oTable.unbindItems();
		aClonedItems[1].setSelected(true);
		aClonedItems[3].setSelected(true);
		aClonedItems.forEach(this.oTable.addItem.bind(this.oTable));
		Core.applyChanges();

		this.oCopyProvider.setExtractData(function(oRow, oColumn) {
			var iColumnIndex = oColumn.getParent().indexOfColumn(oColumn);
			return oRow.getCells()[iColumnIndex].getText();
		});
		ClipboardUtils.triggerCopy(aClonedItems[3].getModeControl().getDomRef());
		assert.equal(await navigator.clipboard.readText(), "1\tname1\tcolor1\n3\tname3\tcolor3", "Data is extracted from the row since there is no binding");
	});

	QUnit.test("Copy button visibility", async function(assert) {
		const oCopyButton = this.oCopyProvider.getCopyButton();
		assert.ok(oCopyButton.getVisible(), "The copy button is visible at the beginning");

		this.oTable.setMode("None");
		Core.applyChanges();
		assert.notOk(oCopyButton.getVisible(), "The copy button is not invisible since selection is not possible");

		await navigator.clipboard.writeText("DummyClipboardText");
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "DummyClipboardText", "Copy action is not taken into account since there is no selection");

		this.oTable.setMode("SingleSelectMaster");
		Core.applyChanges();
		assert.ok(oCopyButton.getVisible(), "The copy button is visible again with single selection");

		this.oTable.setMode("Delete");
		Core.applyChanges();
		assert.notOk(oCopyButton.getVisible(), "The copy button is not invisible since selection is not possible");
	});


	QUnit.module("GridTable", TableModule(createGridTable));

	QUnit.test("API", apiTest);

	QUnit.test("Select all", async function(assert) {
		this.oTable.selectAll();
		ClipboardUtils.triggerCopy();
		assert.equal((await navigator.clipboard.readText()).split("\n").length, aData.length, "All contexts are copied");
	});

	QUnit.test("CellSelector", async function(assert) {
		var oNotifyUserStub = sinon.stub(this.oCopyProvider, "_notifyUser");

		this.oCopyProvider.setCopyPreference("Full");
		this.removeSelections();
		var oCellSelector = new CellSelector({ rangeLimit: 15 });
		this.oTable.addDependent(oCellSelector);

		oCellSelector._bSelecting = true;
		oCellSelector._selectCells({rowIndex: 2, colIndex: 0}, {rowIndex: 3, colIndex: 2});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "2\tname2\tcolor2\n3\tname3\tcolor3", "Cell selection is copied to clipboard");
		assert.ok(oNotifyUserStub.calledWith(0, 6), "User notified about copy.");

		this.selectRow(5);
		oCellSelector._bSelecting = true;
		oCellSelector._selectCells({rowIndex: 2, colIndex: 0}, {rowIndex: 3, colIndex: 2});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "2\tname2\tcolor2\n3\tname3\tcolor3\n5\tname5\tcolor5", "Cell and row selection are copied to clipboard");
		assert.ok(oNotifyUserStub.calledWith(1, 6), "User notified about copy.");

		this.oCopyProvider.setCopySparse(true);
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "2\tname2\tcolor2\n3\tname3\tcolor3\n\t\t\n5\tname5\tcolor5", "Cell and row selection are copied sparse");
		assert.ok(oNotifyUserStub.calledWith(1, 6), "User notified about copy.");

		oCellSelector._selectCells({rowIndex: 4, colIndex: 1}, {rowIndex: 6, colIndex: 1});
		var fnExtractData = this.oCopyProvider.getExtractData();
		var fnExtractDataSpy = sinon.spy(fnExtractData);
		this.oCopyProvider.setExtractData(fnExtractDataSpy);
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "\tname4\t\n5\tname5\tcolor5\n\tname6\t", "Cell and row selection are merged and copied");
		assert.ok(oNotifyUserStub.calledWith(1, 3), "User notified about copy.");
		assert.equal(fnExtractDataSpy.callCount, 5, "Extractor function is called 5 times, only once for every neccessary cell");
		this.oCopyProvider.setExtractData(fnExtractData);

		oCellSelector._selectCells({rowIndex: -Infinity, colIndex: -Infinity}, {rowIndex: Infinity, colIndex: Infinity});
		ClipboardUtils.triggerCopy();
		assert.equal((await navigator.clipboard.readText()).split("\n").length, oCellSelector.getRangeLimit(), "Copied only up to rangeLimit value");
		assert.equal((await navigator.clipboard.readText()).split("\n")[10].split("\t").length, this.oTable.getColumns().length, "All columns are in the clipboard");

		this.oCopyProvider.setCopyPreference("Cells");
		this.removeSelections();

		this.selectRow(5);
		oCellSelector._bSelecting = true;
		oCellSelector._selectCells({rowIndex: 2, colIndex: 0}, {rowIndex: 3, colIndex: 2});
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "2\tname2\tcolor2\n3\tname3\tcolor3", "Only cell selection is copied");
		assert.ok(oNotifyUserStub.calledWith(1, 6), "User notified about copy.");

		oCellSelector.removeSelection();
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "5\tname5\tcolor5", "Cell and row selection are copied to clipboard");
		assert.ok(oNotifyUserStub.calledWith(1, 0), "User notified about copy.");

		this.removeSelections();
		this.oCopyProvider._bActivatedByButton = true;
		ClipboardUtils.triggerCopy();
		assert.ok(oNotifyUserStub.calledWith(0, 0), "User notified to select data first.");
		this.oCopyProvider._bActivatedByButton = false;
		oNotifyUserStub.resetHistory();
		ClipboardUtils.triggerCopy();
		assert.ok(oNotifyUserStub.notCalled, "User not notified.");

		oNotifyUserStub.restore();
	});

	QUnit.test("Copy button visibility", async function(assert) {
		const oCopyButton = this.oCopyProvider.getCopyButton();
		assert.ok(oCopyButton.getVisible(), "The copy button is visible at the beginning");

		this.oTable.setSelectionMode("None");
		Core.applyChanges();
		assert.notOk(oCopyButton.getVisible(), "The copy button is not invisible since selection is not possible");

		await navigator.clipboard.writeText("DummyClipboardText");
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "DummyClipboardText", "Copy action is not taken into account since there is no selection");

		this.oTable.setSelectionMode("Single");
		Core.applyChanges();
		assert.ok(oCopyButton.getVisible(), "The copy button is visible again with single selection");

		this.oTable.setSelectionMode("None");
		Core.applyChanges();
		assert.notOk(oCopyButton.getVisible(), "The copy button is not invisible since row selection is not possible");

		const oCellSelector = new CellSelector();
		this.oTable.addDependent(oCellSelector);
		assert.ok(oCopyButton.getVisible(), "The copy button is visible since there is a cell selection");

		oCellSelector.setEnabled(false);
		assert.notOk(oCopyButton.getVisible(), "The copy button is not visible since the cell selection is disabled");

		await navigator.clipboard.writeText("DummyClipboardText");
		ClipboardUtils.triggerCopy();
		assert.equal(await navigator.clipboard.readText(), "DummyClipboardText", "Copy action is not taken into account since there is no cell selection");

		oCellSelector.setEnabled(true);
		assert.ok(oCopyButton.getVisible(), "The copy button is visible since cell selection is active again");

		this.oTable.attachCellClick(Function.prototype);
		assert.notOk(oCopyButton.getVisible(), "The copy button is not visible since cellClick event blocks the cell selection");

		this.oTable.detachCellClick(Function.prototype);
		assert.ok(oCopyButton.getVisible(), "The copy button is visible since cellClick event is removed and the cell selection is supported");

		this.oTable.setSelectionBehavior("RowOnly");
		assert.notOk(oCopyButton.getVisible(), "The copy button is not visible since selectionBehavior=RowOnly blocks the cell selection");

		this.oTable.setSelectionBehavior("RowSelector");
		assert.ok(oCopyButton.getVisible(), "The copy button is visible since the cell selection is supported with selectionBehavior=RowSelector");

		this.oTable.removeDependent(oCellSelector);
		assert.notOk(oCopyButton.getVisible(), "The copy button is not visible since the CellSelector is removed");

		const oMultiSelectionPlugin = new MultiSelectionPlugin({selectionMode: "MultiToggle"});
		this.oTable.addDependent(oMultiSelectionPlugin);
		Core.applyChanges();
		assert.ok(oCopyButton.getVisible(), "The copy button is visible since multi selection is enabled with MultiSelectionPlugin");

		oMultiSelectionPlugin.setEnabled(false);
		Core.applyChanges();
		assert.notOk(oCopyButton.getVisible(), "The copy button is not visible since the MultiSelectionPlugin is disabled");

		oMultiSelectionPlugin.setEnabled(true);
		Core.applyChanges();
		assert.ok(oCopyButton.getVisible(), "The copy button is visible again since the MultiSelectionPlugin is enabled again");

		oMultiSelectionPlugin.setSelectionMode("None");
		Core.applyChanges();
		assert.notOk(oCopyButton.getVisible(), "The copy button is not invisible since the setSelectionMode is set to None");

		this.oCopyProvider.setVisible(false).setVisible(true);
		assert.notOk(oCopyButton.getVisible(), "The copy button is still invisible although visible property is changed");

		this.oTable.removeDependent(this.oCopyProvider);
		assert.ok(oCopyButton.isDestroyed(), "The copy button is destroyed since CopyProvider is removed");

		const oNewCellSelector = new CellSelector();
		this.oTable.addDependent(oNewCellSelector);

		this.oCopyProvider = new CopyProvider({extractData: Function.prototype});
		this.oTable.addDependent(this.oCopyProvider);
		const oNewCopyButton = this.oCopyProvider.getCopyButton();
		assert.ok(oNewCopyButton.getVisible(), "The copy button is visible although the CopyProvider is added after the CellSelector");
	});

	QUnit.module("MDCTable", TableModule(createMDCTable));

	QUnit.test("API", function(assert) {
		var that = this;
		this.oCopyProvider.setExtractData(function(oContext, oColumn) {
			assert.ok(oColumn.isA("sap.ui.mdc.table.Column"));
			return oContext.getProperty(oColumn.getPropertyKey());
		});
		return this.oTable._fullyInitialized().then(function() {
			return MDCTableQUnitUtils.waitForBinding(that.oTable);
		}).then(function() {
			Core.applyChanges();
			apiTest.call(that, assert);
		});
	});

	function createMDCTableWithCopyProvider(mSettings) {
		mSettings = Object.assign({
			type: "ResponsiveTable",
			delegate: {
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {
					collectionPath: "/"
				}
			},
			selectionMode: "Multi",
			copyProvider: new CopyProvider(),
			columns: [
				new MDCColumn({
					header: "Name-ID",
					propertyKey: "name-id",
					template: new Text({ text: "{name} ({id})" })
				}),
				new MDCColumn({
					header: "NoCopy",
					propertyKey: "nocopy",
					template: new Text({ text: "You cannot copy this cell" })
				}),
				new MDCColumn({
					header: "ID-Name-Color",
					propertyKey: "id-name-color",
					template: new Text({ text: "{id} {name} {color}" })
				}),
				new MDCColumn({
					header: "ID-In-Parentheses",
					propertyKey: "id-in-parentheses",
					template: new Text({ text: "({id})" })
				})
			],
			models: oJSONModel
		}, mSettings);

		var oTable = new MDCTable(mSettings);
		MDCQUnitUtils.stubPropertyInfos(oTable, [{
				name: "id",
				path: "id",
				label: "ID",
				dataType: "Integer"
			}, {
				name: "name",
				path: "name",
				label: "Name",
				dataType: "String"
			}, {
				name: "color",
				path: "color",
				label: "Color",
				dataType: "String"
			}, {
				name: "nocopy",
				path: "id",
				label: "NoCopy",
				dataType: "String",
				clipboardSettings: null
			}, {
				name: "name-id",
				label: "Name-ID",
				propertyInfos: ["id", "name"],
				clipboardSettings: {
					template: "{1} ({0})"
				}
			}, {
				name: "id-name-color",
				label: "ID-Name-Color",
				propertyInfos: ["id", "name", "color"]
			}, {
				name: "id-in-parentheses",
				label: "ID-In-Parentheses",
				path: "id",
				dataType: "String",
				clipboardSettings: {
					template: "({0})"
				}
		}]);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		oTable.focus();
		return oTable;
	}

	QUnit.module("MDCTableWithCopyProvider", TableModule(createMDCTableWithCopyProvider));

	QUnit.test("API", function(assert) {
		return this.oTable._fullyInitialized().then(function() {
			return MDCTableQUnitUtils.waitForBinding(this.oTable);
		}.bind(this)).then(async function() {
			var oCopyButton = this.oCopyProvider.getCopyButton();
			assert.ok(oCopyButton, "Copy button is created successfully");

			this.selectRow(1);
			this.selectRow(3);

			var fnCopyHandlerSpy = sinon.spy();
			this.oCopyProvider.attachEventOnce("copy", fnCopyHandlerSpy);
			oCopyButton.firePress();
			assert.ok(fnCopyHandlerSpy.calledOnce, "Copy event is fired from the plugin when the copy button is pressed");
			assert.equal(await (await (await navigator.clipboard.read())[0].getType("text/plain")).text(),
			"1\tname1\t1\tname1\tcolor1\t1\n3\tname3\t3\tname3\tcolor3\t3",
			"Selection is copied via copy button");

			assert.equal(await (await (await navigator.clipboard.read())[0].getType("text/html")).text(),
			"<table><tr><td>name1&nbsp;&#x28;1&#x29;</td><td>1&nbsp;name1&nbsp;color1</td><td>1</td></tr>" +
			"<tr><td>name3&nbsp;&#x28;3&#x29;</td><td>3&nbsp;name3&nbsp;color3</td><td>3</td></tr></table>",
			"Selection is copied via copy button");

			this.oCopyProvider.setEnabled(false);
			assert.notOk(oCopyButton.getEnabled(), "Disabling the plugin disables the copy button");

			this.oCopyProvider.setEnabled(true);
			assert.ok(oCopyButton.getEnabled(), "Enabling the plugin enables the copy button");
			this.oCopyProvider.setVisible(false);
			assert.notOk(oCopyButton.getVisible(), "The copy button is invisible after plugins visible property is set");

			this.oCopyProvider.setVisible(true);
			this.oTable.setCopyProvider();
			assert.ok(oCopyButton.isDestroyed(), "Removing the plugin destroys the copy button");

			var oNewCopyProvider = new CopyProvider();
			this.oTable.setCopyProvider(oNewCopyProvider);
			var oNewCopyButton = oNewCopyProvider.getCopyButton();
			assert.notEqual(oNewCopyButton, oCopyButton, "New plugin creates a new copy button");

			await navigator.clipboard.writeText("DummyClipboardText");
			oNewCopyButton.firePress();
			assert.ok(await (await (await navigator.clipboard.read())[0].getType("text/plain")).text(), "Selection is copied via new copy button");
			assert.ok(await (await (await navigator.clipboard.read())[0].getType("text/html")).text(), "Selection is copied via new copy button");

			ClipboardUtils.restore();
			ClipboardUtils.stub(true);

			oNewCopyButton.firePress();
			assert.equal(await navigator.clipboard.readText(), "1\tname1\t1\tname1\tcolor1\t1\n3\tname3\t3\tname3\tcolor3\t3", "Only text is in clipboard");

			this.oTable.setSelectionMode("None");
			Core.applyChanges();
			assert.notOk(oNewCopyButton.getVisible(), "The copy button is invisible since there is no selection possible");

			oNewCopyProvider.destroy();
			assert.ok(oNewCopyProvider.isDestroyed(), "Destroying the plugin destroys the copy button");
		}.bind(this));
	});

	QUnit.module("Notify User", {
		beforeEach: function() {
			this._sLastMessage = null;
			this._sLastState = null;
			this._oMessageToastStub = sinon.stub(MessageToast, "show").callsFake((sMessage) => {
				this._sLastMessage = sMessage;
				this._sLastState = null;
			});
			this._oMessageBoxStub_Error = sinon.stub(MessageBox, "error").callsFake((sMessage) => {
				this._sLastMessage = sMessage;
				this._sLastState = "error";
			});
			this._oMessageBoxStub_Info = sinon.stub(MessageBox, "information").callsFake((sMessage) => {
				this._sLastMessage = sMessage;
				this._sLastState = "info";
			});
			this._oMessageBoxStub_Alert = sinon.stub(MessageBox, "alert").callsFake((sMessage) => {
				this._sLastMessage = sMessage;
				this._sLastState = "alert";
			});
			this._oBundle = coreLib.getResourceBundleFor("sap.m");

			this._oCopyProvider = new CopyProvider({
				extractData: function() {}
			});
		},
		afterEach: function() {
			this._oMessageToastStub.restore();
			this._oMessageBoxStub_Error.restore();
			this._oMessageBoxStub_Info.restore();
			this._oMessageBoxStub_Alert.restore();
			this._oCopyProvider.destroy();
		}
	});

	QUnit.test("_notifyUser", function(assert) {
		const done = assert.async();

		this._oCopyProvider._notifyUser(1, 0).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_SELECT_ROW_SINGLE_MSG"), "Selection: Rows 1 - Cell 0");
			return this._oCopyProvider._notifyUser(5, 0);
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_SELECT_ROW_MULTI_MSG"), "Selection: Rows 5 - Cell 0");
			return this._oCopyProvider._notifyUser(5, 1);
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_SELECT_CELL_SINGLE_MSG"), "Selection: Rows 5 - Cell 1");
			return this._oCopyProvider._notifyUser(5, 5);
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_SELECT_CELL_MULTI_MSG"), "Selection: Rows 5 - Cell 5");
			this._oCopyProvider.setCopyPreference("Full");
			return this._oCopyProvider._notifyUser(5, 1);
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_SELECT_ROW_AND_CELL_MSG"), "Selection: Rows 5 - Cell 1, CopyPreference=Full");
			return this._oCopyProvider._notifyUser(5, 5);
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_SELECT_ROW_AND_CELL_MSG"), "Selection: Rows 5 - Cell 5, CopyPreference=Full");
			return this._oCopyProvider._notifyUser(0, 0);
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_NOSELECTION_MSG"), "No Selection");
			assert.equal(this._sLastState, "info", "Info MessageBox shown");
			return this._oCopyProvider._notifyUser(5, 5, "Problem 1");
		}).then(() => {
			assert.equal(this._sLastMessage, "Problem 1", "Message - Default State");
			assert.equal(this._sLastState, "error", "Error MessageBox shown");
			return this._oCopyProvider._notifyUser(5, 5, "Problem 2", "Alert");
		}).then(() => {
			assert.equal(this._sLastMessage, "Problem 2", "Message - Custom State");
			assert.equal(this._sLastState, "alert", "Alert MessageBox shown");
			return this._oCopyProvider._notifyUser(5, 5, "");
		}).then(() => {
			assert.equal(this._sLastMessage, this._oBundle.getText("COPYPROVIDER_DEFAULT_ERROR_MSG"), "Default Message");
			assert.equal(this._sLastState, "error", "Error MessageBox shown");
			done();
		});
	});

	QUnit.module("MimeTypes", {
		beforeEach: function() {
			this.oCopyProvider = new CopyProvider({extractData: Function.prototype});
			this.oTable = new Table({
				mode: "SingleSelectMaster",
				items: new ColumnListItem({
					selected: true,
					cells: new Text({ text: "DummyCell"})
				}),
				columns: new Column({
					header: new Text({ text: "DummyHeader"})
				}),
				dependents: this.oCopyProvider
			}).placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
			ClipboardUtils.restore();
		}
	});

	QUnit.test("Html and Text Mime Types", async function(assert) {
		const aTestData = [{
				extractData() { return {text: "SAP", html: "SAP"}; },
				expectedText: "SAP",
				expectedHtml: "SAP",
				expectedEventData: [["SAP"]]
			}, {
				extractData() { return {text: ["<", "SAP", ">"], html: "<SAP>"}; },
				expectedText: "<\tSAP\t>",
				expectedHtml: "&lt;SAP&gt;",
				expectedEventData: [["<", "SAP", ">"]]
			}, {
				extractData() { return {text: "\t\r\n \"\n\r", html: "\t\r\n \"\n\r" }; },
				expectedText: '"\t\r\n ""\n\r"',
				expectedHtml: "&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&quot;<br>&#xd;",
				expectedEventData: [["\t\r\n \"\n\r"]]
			}
		];

		ClipboardUtils.stub();
		for (const [index, {extractData, expectedText, expectedHtml, expectedEventData}] of aTestData.entries()) {
			this.oCopyProvider.setExtractData(extractData);
			this.oCopyProvider.attachEventOnce("copy", (oEvent) => {
				assert.deepEqual(oEvent.getParameter("data"), expectedEventData, `Test ${index} has expected event parameter.`);
			});
			this.oCopyProvider.copySelectionData(true);

			assert.equal(
				await (await (await navigator.clipboard.read())[0].getType("text/plain")).text(),
				expectedText,
				`Test ${index} has expected text/plain output.`
			);
			assert.equal(
				await (await (await navigator.clipboard.read())[0].getType("text/html")).text(),
				`<table><tr><td>${expectedHtml}</td></tr></table>`,
				`Test ${index} has expected text/html output.`
			);
		}
	});

	QUnit.test("Text Mime Type Only", async function(assert) {
		const aTestData = [{
				extractData() { return "SAP"; },
				expectedText: "SAP"
			}, {
				extractData() { return ["<", "SAP", ">"]; },
				expectedText: "<\tSAP\t>"
			}, {
				extractData() { return "\t\r\n \"\n\r"; },
				expectedText: '"\t\r\n ""\n\r"'
			}
		];

		ClipboardUtils.stub(true /* Clipboard Text API only, No Html Mime Type support*/);
		for (const [index, {extractData, expectedText}] of aTestData.entries()) {
			this.oCopyProvider.setExtractData(extractData);
			this.oCopyProvider.copySelectionData();
			assert.equal(await navigator.clipboard.readText(), expectedText, `Test ${index} has expected text only output.`);
		}
	});

});