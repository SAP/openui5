sap.ui.define([
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Title",
	"sap/m/table/Title",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/TitleProvider",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/test/utils/nextUIUpdate"
], function(Column, ColumnListItem, Label, Text, Table, Title, TableTitle, PluginBase, TitleProvider, Filter, JSONModel, GridColumn, GridTable, MultiSelectionPlugin, nextUIUpdate) {

	"use strict";
	/*global sinon, QUnit */

	const aData = [];
	for (let i = 0; i < 25; i++) {
		aData.push({
			name: "name" + i
		});
	}

	const oJSONModel = new JSONModel(aData);

	async function createResponsiveTable(mSettings) {
		const oTable = new Table({
			growing: true,
			growingThreshold: 10,
			mode: "MultiSelect",
			rememberSelections: false,
			columns: new Column({
				header: new Label({ text: "name" })
			}),
			items: {
				path: "/",
				template: new ColumnListItem({
					cells: new Text({ text: "{name}" })
				})
			},
			models: oJSONModel,
			...mSettings
		});

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oTable;
	}

	async function createGridTable(mSettings) {
		const oTable = new GridTable({
			threshold: 10,
			columns: new GridColumn({
				label: new Label({ text: "name" }),
				template: new Text({ text: "{name}", wrapping: false })
			}),
			dependents: new MultiSelectionPlugin({
				limit: 0
			}),
			rows: { path: "/" },
			models: oJSONModel,
			...mSettings
		});

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oTable;
	}

	async function timeout(iDuration = 0) {
		await new Promise(function(resolve) {
			setTimeout(resolve, iDuration);
		});
	}

	async function nextUIUpdateAndTimeout(iDuration = 0) {
		await nextUIUpdate();
		await timeout(iDuration);
	}

	function createTableModule(fnTableFactory, mTableSettings) {
		return {
			before: function(assert) {
				this.getBindingName = function() {
					return this.oTable.isA("sap.m.ListBase") ? "items" : "rows";
				};
				this.getBinding = function() {
					return this.oTable.getBinding(this.getBindingName());
				};
				this.getBindingInfo = function() {
					return this.oTable.getBindingInfo(this.getBindingName());
				};
				this.rebind = async function() {
					this.oTable.bindAggregation(this.getBindingName(), this.getBindingInfo());
					await nextUIUpdateAndTimeout();
				};
				this.getSelectionOwner = function() {
					return PluginBase.getPlugin(this.oTable, "sap.ui.table.plugins.SelectionPlugin") || this.oTable;
				};
				this.selectRow = async function(iIndex) {
					const oSelectionOwner = this.getSelectionOwner();
					if (oSelectionOwner.isA("sap.m.ListBase")) {
						oSelectionOwner.setSelectedItem(oSelectionOwner.getItems()[iIndex], true, true);
					} else {
						await oSelectionOwner.addSelectionInterval(iIndex, iIndex);
					}
					await timeout();
				};
				this.deselectRow = async function(iIndex) {
					const oSelectionOwner = this.getSelectionOwner();
					if (oSelectionOwner.isA("sap.m.ListBase")) {
						oSelectionOwner.setSelectedItem(oSelectionOwner.getItems()[iIndex], false, true);
					} else {
						await oSelectionOwner.removeSelectionInterval(iIndex, iIndex);
					}
					await timeout();
				};
				this.removeSelections = async function(bAll) {
					const oSelectionOwner = this.getSelectionOwner();
					await oSelectionOwner[oSelectionOwner.isA("sap.m.ListBase") ? "removeSelections" : "clearSelection"](bAll);
					await nextUIUpdateAndTimeout();
				};
				this.selectAll = async function() {
					const oSelectionOwner = this.getSelectionOwner();
					await oSelectionOwner.selectAll();
					await nextUIUpdateAndTimeout();
				};
				this.filterByName = function(sName, sOperation = "EQ") {
					const oBinding = this.getBinding();
					return new Promise((fnResolve) => {
						oBinding.attachEventOnce("change", async () => {
							await nextUIUpdateAndTimeout();
							fnResolve();
						});
						oBinding.filter(sName ? new Filter("name", sOperation, sName) : []);
					});
				};
			},
			beforeEach: async function() {
				this.oTitle = new TableTitle({
					title: new Title({ text: "Test Title" })
				});
				this.oTable = await fnTableFactory(mTableSettings);
				this.oTitleProvider = new TitleProvider({ title: this.oTitle });
				this.oTable.addDependent(this.oTitleProvider);
				await timeout();
			},
			afterEach: async function() {
				this.oTable.destroy();
				this.oTitle.destroy();
				await timeout();
			}
		};
	}

	async function testBasics(assert) {
		assert.ok(TitleProvider.findOn(this.oTable) === this.oTitleProvider, "Plugin found via TitleProvider.findOn");

		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is correct initially");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is correct initially");

		await this.selectRow(1);
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is correct after selecting one row");

		this.oTitleProvider.setManageSelectedCount(false);
		await timeout(0);
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is set to 0 after manageSelectedCount is set to false");
		this.oTitleProvider.setEnabled(false);
		await timeout(0);
		assert.equal(this.oTitle.getTotalCount(), 0, "Total count is set to 0 after plugin is disabled");
		this.oTitleProvider.setEnabled(true);
		await timeout(0);
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is set to 25 after plugin is enabled");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is still 0 after plugin is enabled since manageSelectedCount is false");
		this.oTitleProvider.setManageSelectedCount(true);
		await timeout(0);
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is set to 1 after manageSelectedCount is set to true");

		this.oTitleProvider.setManageSelectedCount(false);
		this.oTitleProvider.setEnabled(false);
		assert.equal(this.oTitle.getTotalCount(), 0, "Total count is set to 0 after plugin is disabled and manageSelectedCount=false");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is still 0 after plugin is disabled and manageSelectedCount=false");
		this.oTitleProvider._updateTitle();
		assert.equal(this.oTitle.getTotalCount(), 0, "Total count is still 0 after sync _updateTitle is called");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is still 0 after sync _updateTitle is called");
		this.oTitleProvider.setEnabled(true).setManageSelectedCount(true);
		await timeout(0);
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is set to 1 after manageSelectedCount and enabled is set to true");
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is set to 25 after manageSelectedCount and enabled is set to true");
		this.oTitleProvider.setEnabled(false).setManageSelectedCount(true);
		await timeout(0);
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is set to 0 after plugin is disabled and manageSelectedCount is true");
		this.oTitleProvider.setEnabled(true);
		await timeout(0);
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is set to 1 after plugin is enabled and manageSelectedCount is true");

		await this.selectRow(3);
		assert.equal(this.oTitle.getSelectedCount(), 2, "Selected count is correct after selecting two rows");
		await this.selectRow(5);
		assert.equal(this.oTitle.getSelectedCount(), 3, "Selected count is correct after selecting three rows");

		await this.deselectRow(1);
		assert.equal(this.oTitle.getSelectedCount(), 2, "Selected count is correct after deselecting one row");

		await this.filterByName("ThereIsNoSuchName");
		assert.equal(this.oTitle.getTotalCount(), 0, "Total count is correct after filtering to no data");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is correct after filtering to no data");

		const oBindingGetCountStub = sinon.stub(this.getBinding(), "getCount");
		oBindingGetCountStub.onFirstCall().returns(1);
		oBindingGetCountStub.onSecondCall().returns(2);
		oBindingGetCountStub.onThirdCall().returns(undefined);

		this.getBinding().fireEvent("createActivate");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 1, "Total count is correct after createActivate event is fired");

		this.getBinding().fireEvent("createCompleted");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 2, "Total count is correct after createCompleted event is fired");

		this.oTitleProvider.setEnabled(false);
		assert.equal(this.oTitle.getTotalCount(), 0, "Total count is correct after plugin is disabled");
		this.oTitleProvider.setEnabled(true);
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), -1, "Total count is correct after plugin is enabled");

		oBindingGetCountStub.restore();
		this.oTable.invalidate();
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 0, "Total count is correct after getCount stub is restored");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is correct after re-rendering");

		this.oTitleProvider.setEnabled(false);
		await this.filterByName();
		assert.equal(this.oTitle.getSelectedCount(), 0, "Total count is not updated while plugin is disabled");
		await this.selectRow(5);
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is not updated while plugin is disabled");
		this.oTitleProvider.setEnabled(true);
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is correct after plugin is enabled");
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is correct after plugin is enabled");

		this.getBinding().getModel().setData(aData.slice(0, 5));
		await this.rebind();
		assert.equal(this.oTitle.getTotalCount(), 5, "Total count is correct after rebinding");
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is updated after rebinding");

		this.getBinding().getModel().setData(aData);
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is correct after model data is reset");

		this.oTitleProvider.setTitle("ThereIsNoSuchTitle");
		await this.filterByName("name5", "Contains");
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is not updated since title is not found");

		this.oTitleProvider.setTitle(this.oTitle);
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 1, "Total count is updated after title is set back");

		this.oTable.unbindAggregation(this.getBindingName());
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getTotalCount(), 0, "No total count after unbind");
		assert.equal(this.oTitle.getSelectedCount(), 0, "No selected count after unbind");

		this.oTitle.setTotalCount(3);
		this.oTitle.setSelectedCount(3);
		this.oTitleProvider.setEnabled(false).setEnabled(true);
		assert.equal(this.oTitle.getTotalCount(), 0, "No total count after plugin is disabled and re-enabled");
		assert.equal(this.oTitle.getSelectedCount(), 0, "No selection count after plugin is disabled and re-enabled");

		this.oTitle.destroy();
		this.oTitleProvider.destroy();
	}


	QUnit.module("ResponsiveTable", createTableModule(createResponsiveTable));

	QUnit.test("Basics", testBasics);

	QUnit.test("Remember Selections", async function(assert) {
		this.oTitleProvider.setEnabled(false);
		this.oTable.setRememberSelections(true);
		this.oTitleProvider.setEnabled(true);

		await this.selectAll();
		assert.equal(this.oTitle.getSelectedCount(), 10, "All rows are selected");
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is correct initially");

		await this.filterByName("ThereIsNoSuchName");
		assert.equal(this.oTitle.getSelectedCount(), 10, "Selected count remains the same");
		assert.equal(this.oTitle.getTotalCount(), 0, "There is no data after filtering");

		await this.filterByName("name2", "Contains");
		assert.equal(this.oTitle.getSelectedCount(), 10, "Selected count remains the same");
		assert.equal(this.oTitle.getTotalCount(), 6, "Total count is correct: name2, name20-24 are found");

		await this.removeSelections();
		assert.equal(this.oTitle.getSelectedCount(), 9, "name2 delected from rememebered selections");
		assert.equal(this.oTable.getSelectedItems().length, 0, "no rows selected on the table");

		await this.filterByName("name22");
		assert.equal(this.oTitle.getTotalCount(), 1, "Total count is correct: name22 is found");
		assert.equal(this.oTitle.getSelectedCount(), 9, "no change in selected count after filtering");
		assert.equal(this.oTable.getSelectedItems().length, 0, "no rows selected on the table");

		this.oTable.getItems()[0].setSelected(true);
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 10, "name22 selected");

		await this.removeSelections(true);
		assert.equal(this.oTitle.getSelectedCount(), 0, "All selections removed");
		assert.equal(this.oTable.getSelectedItems().length, 0, "no rows selected on the table");
	});

	QUnit.test("Mode", async function(assert) {
		await this.selectRow(3);
		await this.selectRow(5);
		assert.equal(this.oTitle.getSelectedCount(), 2, "Selected count is correct after selecting two rows");

		this.oTable.setMode("SingleSelectLeft");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected is cleared after switching from multi to single selection mode");

		await this.selectRow(5);
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is not updated for the single selection mode");

		this.oTable.setMode("MultiSelect");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is updated since the mode is switched to multi selection");

		this.oTable.setMode("Delete");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selection is cleared after switching to delete mode");

		this.oTable.setMode("MultiSelect");
		this.oTable.removeDependent(this.oTitleProvider);
		assert.equal(this.oTitle.getTotalCount(), 0, "No total count after plugin is removed from dependents");
		await this.selectAll();
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selection count is not updated when TitleProvider is removed from dependents");

		this.oTable.addDependent(this.oTitleProvider);
		await timeout();
		assert.equal(this.oTitle.getSelectedCount(), 10, "Selection count is updated when TitleProvider is added to dependents");
	});


	QUnit.module("GridTable", createTableModule(createGridTable));

	QUnit.test("Basics", testBasics);

	QUnit.test("Mode", async function(assert) {
		await this.selectAll();
		assert.equal(this.oTitle.getSelectedCount(), 25, "Selected count is correct after selecting all rows");

		this.getSelectionOwner().setSelectionMode("Single");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected is cleared after switching from multi to single selection mode");

		await this.selectRow(5);
		assert.equal(this.oTitle.getSelectedCount(), 1, "Selected count is not set for the single selection mode");

		this.getSelectionOwner().setSelectionMode("None");
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selection is cleared after switching to none selection mode");

		this.getSelectionOwner().setSelectionMode("MultiToggle");
		await nextUIUpdateAndTimeout();
		this.oTable.removeDependent(this.oTitleProvider);
		assert.equal(this.oTitle.getTotalCount(), 0, "No total count after plugin is removed from dependents");
		await nextUIUpdateAndTimeout();
		await this.selectRow(3);
		await this.selectRow(5);
		assert.equal(this.oTitle.getSelectedCount(), 0, "Selected count is not updated when TitleProvider is removed from dependents");
		this.oTable.addDependent(this.oTitleProvider);
		await nextUIUpdateAndTimeout();
		assert.equal(this.oTitle.getSelectedCount(), 2, "Selected count is updated when TitleProvider is added to dependents");
	});

	QUnit.test("Suspended binding", function(assert) {
		const oBinding = this.getBinding();
		this.oTitle.setTotalCount(25);

		// Simulate a binding whose root binding is suspended (e.g. sap.ui.model.odata.v4.ODataListBinding),
		// for which #getCount throws instead of returning a value.
		const fnOriginalGetRootBinding = oBinding.getRootBinding;
		oBinding.getRootBinding = () => ({
			isSuspended: () => true
		});
		const oGetCountStub = sinon.stub(oBinding, "getCount").throws(
			new Error("Must not call method when the binding's root binding is suspended")
		);

		this.oTitleProvider._updateTitle();

		assert.ok(oGetCountStub.notCalled, "Binding#getCount is not called while the binding is suspended");
		assert.equal(this.oTitle.getTotalCount(), 25, "Total count is kept unchanged while the binding is suspended");

		oGetCountStub.restore();
		oBinding.getRootBinding = fnOriginalGetRootBinding;
	});
});