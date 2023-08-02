sap.ui.define([
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/CopyProvider",
	"sap/m/plugins/CellSelector",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/base/util/Deferred",
	"sap/ui/core/CustomData",
	"sap/ui/core/Core",
	"test-resources/sap/ui/mdc/qunit/QUnitUtils",
	"test-resources/sap/ui/mdc/qunit/table/QUnitUtils"
], function(Text, Table, Column, ColumnListItem, GridTable, GridColumn, MDCTable, MDCColumn, PluginBase, CopyProvider, CellSelector, JSONModel, ManagedObjectObserver, Deferred, CustomData, Core, MDCQUnitUtils, MDCTableQUnitUtils) {

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

	function triggerCopy(oDomRef) {
		oDomRef = oDomRef || document.querySelector(".sapMLIBFocusable") || document.querySelector(".sapUiTableCell");
		oDomRef.focus();
		oDomRef.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyC", ctrlKey: true, bubbles: true, cancelable: true }));
	}

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
		return oTable;
	}

	QUnit.module("isApplicable");
	QUnit.test("Standalone usage, extractData is mandatory", function(assert) {
		assert.throws(function() {
			new Table({dependents: new CopyProvider()});
		}, "extractData property is missing in the constructor");

		var oClipboardStub = sinon.stub(window, "navigator").value({clipboard: undefined});
		assert.throws(function() {
			new Table({dependents: new CopyProvider({
				extractData: function() {}
			})});
		}, "not in a secure context");
		oClipboardStub.restore();
	});

	QUnit.test("extractData is managed by the CopyProvider, this method must be empty", function(assert) {
		var oCopyProvider = new CopyProvider({
			extractData: Function.prototype
		});

		var oTable = createMDCTable();
		return oTable.initialized().then(function() {
			assert.throws(function() {
				oTable.setCopyProvider(oCopyProvider);
			}, "extractData property must be managed by the CopyProvider");
			oTable.destroy();
		});
	});

	QUnit.test("extractData is managed by the CopyProvider, getColumnClipboardSettings method must be implemented", function(assert) {
		var oCopyProvider = new CopyProvider();
		var oTable = createMDCTable();
		oTable.getColumnClipboardSettings = undefined;
		return oTable.initialized().then(function() {
			assert.throws(function() {
				oTable.setCopyProvider(oCopyProvider);
			}, "getColumnClipboardSettings method must be implemented by the parent of CopyProvider");
			oTable.destroy();
		});
	});

	var TableModule = function(fnTableFactory, mSettings) {
		return {
			before: function(assert) {
				var sClipboardText;
				this._oClipboardStub = sinon.stub(window, "navigator").value({
					clipboard: {
						writeText: function(sText) {
							sClipboardText = sText;
							return Promise.resolve();
						}
					}
				});
				this.getClipboardText = function() {
					return sClipboardText;
				};
				this.setClipboardText = function(sText) {
					sClipboardText = sText || "";
				};
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
				this._oClipboardStub.restore();
			}
		};
	};

	var apiTest = function (assert) {
		this.selectRow(1);
		this.selectRow(3);

		this.setClipboardText("DummyClipboardText");
		this.oCopyProvider.attachEventOnce("copy", function(e) {
			e.preventDefault();
		});
		triggerCopy();
		assert.equal(this.getClipboardText(), "DummyClipboardText", "Preventing default on copy event did not allow copy to clipboard");

		this.oCopyProvider.attachEventOnce("copy", function(e) {
			assert.deepEqual(e.getParameter("data"), e.getSource().getSelectionData(), "data parameter is same as the #getSelectionData API");
			assert.deepEqual(e.getParameter("data"), [].concat([Object.values(aData[1])], [Object.values(aData[3])]), "data parameter is valid");
		});
		triggerCopy();
		assert.equal(this.getClipboardText(), "1\tname1\tcolor1\n3\tname3\tcolor3", "Selection is copied via keyboard event to the clipboard");

		this.setClipboardText("DummyClipboardText");
		this.oCopyProvider.attachCopy(this.IwillNeverBeCalled);
		this.oCopyProvider.copySelectionData();
		this.oCopyProvider.detachCopy(this.IwillNeverBeCalled);
		assert.equal(this.getClipboardText(), "1\tname1\tcolor1\n3\tname3\tcolor3", "Selection is copied via copySelectionData to the clipboard");

		this.oCopyProvider.attachEventOnce("copy", function(e) {
			e.getParameter("data")[1] = ["x", "name\tx", "color\nx"];
		});
		this.oCopyProvider.copySelectionData(true);
		assert.equal(this.getClipboardText(), '1\tname1\tcolor1\nx\t"name\tx"\t"color\nx"', "Data parameter of the copy event is mutable");

		this.oCopyProvider.setCopySparse(true);
		triggerCopy();
		assert.equal(this.getClipboardText(), "1\tname1\tcolor1\n\t\t\n3\tname3\tcolor3", "copySparse=true includes empty rows between selected rows");

		this.oCopyProvider.setExcludeContext(function(oContext) {
			return oContext.getProperty("id") == 1;
		});
		triggerCopy();
		assert.equal(this.getClipboardText(), "3\tname3\tcolor3", "excludeContext callback disallows first context to be copied to the clipboard");

		this.oCopyProvider.setExtractData(function(oContext, oColumn) {
			var sProperty = oColumn.data("property");
			return sProperty == "name" ? null : oContext.getProperty(sProperty);
		});
		triggerCopy();
		assert.equal(this.getClipboardText(), "3\tcolor3", "Returning 'null' from the extractData callback disallows column to be copied");

		this.oCopyProvider.setExtractData(function(oContext, oColumn) {
			var sProperty = oColumn.data("property");
			var vValue = oContext.getProperty(sProperty);
			return sProperty == "name" ? [vValue, "surname" + oContext.getProperty("id")] : vValue;
		});
		triggerCopy();
		assert.equal(this.getClipboardText(), "3\tname3\tsurname3\tcolor3", "Returning array from the extractData callback splits them into cells");

		this.removeSelections();
		this.oCopyProvider.attachCopy(this.IwillNeverBeCalled);
		triggerCopy();
		assert.equal(this.getClipboardText(), "3\tname3\tsurname3\tcolor3", "Clipboard is not changed since there is no selection to copy");

		this.selectRow(5);
		var fnExtractData = this.oCopyProvider.getExtractData();
		this.oCopyProvider.setExtractData();
		triggerCopy();
		assert.equal(this.getClipboardText(), "3\tname3\tsurname3\tcolor3", "Clipboard is not changed since there is no extractData property");

		this.oCopyProvider.setExtractData(fnExtractData);
		this.oTable.removeAllColumns();
		triggerCopy();
		assert.equal(this.getClipboardText(), "3\tname3\tsurname3\tcolor3", "Clipboard is not changed since there is no columns to copy");
		this.oCopyProvider.detachCopy(this.IwillNeverBeCalled);

		assert.ok(this.oCopyProviderInvalidateSpy.notCalled, "CopyProvider was never invalidated");
	};


	QUnit.module("ResponsiveTable", TableModule(createResponsiveTable));

	QUnit.test("API", apiTest);

	QUnit.test("Select all", function(assert) {
		this.oTable.selectAll();
		triggerCopy();
		assert.equal(this.getClipboardText().split("\n").length, this.oTable.getGrowingThreshold(), "Not all contexts, only growing contexts are copied");
	});

	QUnit.test("No binding", function(assert) {
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
		triggerCopy(aClonedItems[3].getModeControl().getDomRef());
		assert.equal(this.getClipboardText(), "1\tname1\tcolor1\n3\tname3\tcolor3", "Data is extracted from the row since there is no binding");
	});


	QUnit.module("GridTable", TableModule(createGridTable));

	QUnit.test("API", apiTest);

	QUnit.test("Select all", function(assert) {
		this.oTable.selectAll();
		triggerCopy();
		assert.equal(this.getClipboardText().split("\n").length, aData.length, "All contexts are copied");
	});

	QUnit.test("CellSelector", function(assert) {
		this.removeSelections();
		var oCellSelector = new CellSelector({ rangeLimit: 15 });
		this.oTable.addDependent(oCellSelector);

		oCellSelector._bSelecting = true;
		oCellSelector._selectCells({rowIndex: 2, colIndex: 0}, {rowIndex: 3, colIndex: 2});
		triggerCopy();
		assert.equal(this.getClipboardText(), "2\tname2\tcolor2\n3\tname3\tcolor3", "Cell selection is copied to clipboard");

		this.selectRow(5);
		oCellSelector._bSelecting = true;
		oCellSelector._selectCells({rowIndex: 2, colIndex: 0}, {rowIndex: 3, colIndex: 2});
		triggerCopy();
		assert.equal(this.getClipboardText(), "2\tname2\tcolor2\n3\tname3\tcolor3\n5\tname5\tcolor5", "Cell and row selection are copied to clipboard");

		this.oCopyProvider.setCopySparse(true);
		triggerCopy();
		assert.equal(this.getClipboardText(), "2\tname2\tcolor2\n3\tname3\tcolor3\n\t\t\n5\tname5\tcolor5", "Cell and row selection are copied sparse");

		oCellSelector._selectCells({rowIndex: 4, colIndex: 1}, {rowIndex: 6, colIndex: 1});
		var fnExtractData = this.oCopyProvider.getExtractData();
		var fnExtractDataSpy = sinon.spy(fnExtractData);
		this.oCopyProvider.setExtractData(fnExtractDataSpy);
		triggerCopy();
		assert.equal(this.getClipboardText(), "\tname4\t\n5\tname5\tcolor5\n\tname6\t", "Cell and row selection are merged and copied");
		assert.equal(fnExtractDataSpy.callCount, 5, "Extractor function is called 5 times, only once for every neccessary cell");
		this.oCopyProvider.setExtractData(fnExtractData);

		oCellSelector._selectCells({rowIndex: -Infinity, colIndex: -Infinity}, {rowIndex: Infinity, colIndex: Infinity});
		triggerCopy();
		assert.equal(this.getClipboardText().split("\n").length, oCellSelector.getRangeLimit(), "Copied only up to rangeLimit value");
		assert.equal(this.getClipboardText().split("\n")[10].split("\t").length, this.oTable.getColumns().length, "All columns are in the clipboard");
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
		}]);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		return oTable;
	}

	QUnit.module("MDCTableWithCopyProvider", TableModule(createMDCTableWithCopyProvider));

	QUnit.test("API", function(assert) {
		return this.oTable._fullyInitialized().then(function() {
			return MDCTableQUnitUtils.waitForBinding(this.oTable);
		}.bind(this)).then(function() {
			var oCopyButton = this.oCopyProvider.getCopyButton();
			assert.ok(oCopyButton, "Copy button is created successfully");

			this.selectRow(1);
			this.selectRow(3);

			var fnCopyHandlerSpy = sinon.spy();
			this.oCopyProvider.attachEventOnce("copy", fnCopyHandlerSpy);
			oCopyButton.firePress();
			assert.ok(fnCopyHandlerSpy.calledOnce, "Copy event is fired from the plugin when the copy button is pressed");
			assert.equal(this.getClipboardText(), "name1 (1)\t1 name1 color1\nname3 (3)\t3 name3 color3", "Selection is copied via copy button");

			this.oCopyProvider.setEnabled(false);
			assert.notOk(oCopyButton.getEnabled(), "Disabling the plugin disables the copy button");

			this.oCopyProvider.setEnabled(true);
			assert.ok(oCopyButton.getEnabled(), "Enabling the plugin enables the copy button");
			this.oCopyProvider.setVisible(false);
			assert.notOk(oCopyButton.getVisible(), "The copy button is invisible after plugins visible property is set");

			this.oCopyProvider.setVisible(true);
			this.oTable.setCopyProvider();
			assert.ok(oCopyButton.isDestroyed(), "Removing the plugin destroy the copy button");

			var oNewCopyProvider = new CopyProvider();
			this.oTable.setCopyProvider(oNewCopyProvider);
			var oNewCopyButton = oNewCopyProvider.getCopyButton();
			assert.notEqual(oNewCopyButton, oCopyButton, "New plugin creates a new copy button");

			this.setClipboardText("DummyClipboardText");
			oNewCopyButton.firePress();
			assert.equal(this.getClipboardText(), "name1 (1)\t1 name1 color1\nname3 (3)\t3 name3 color3", "Selection is copied via new copy button");

			oNewCopyProvider.destroy();
			assert.ok(oNewCopyProvider.isDestroyed(), "Destroying the plugin destroys the copy button");
		}.bind(this));
	});

});