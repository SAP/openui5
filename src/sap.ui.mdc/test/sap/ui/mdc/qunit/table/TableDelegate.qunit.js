/* global QUnit, sinon */
sap.ui.define([
	"sap/m/Text",
	"sap/ui/mdc/Table",
	"../QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/mdc/table/Column",
	"sap/ui/model/Sorter",
	"sap/ui/model/Context"
], function(
	Text,
	Table,
	MDCQUnitUtils,
	Core,
	coreLibrary,
	Filter,
	TableDelegate,
	ODataModel,
	Column,
	Sorter,
	Context
) {
	"use strict";

	var sDelegatePath = "sap/ui/mdc/TableDelegate";

	var fnOriginalUpdateBindingInfo = TableDelegate.updateBindingInfo;
	TableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		fnOriginalUpdateBindingInfo.apply(this, arguments);
		oBindingInfo.path = "/foo";
	};

	function poll(fnCheck, iTimeout) {
		return new Promise(function(resolve, reject) {
			if (fnCheck()) {
				resolve();
				return;
			}

			var iRejectionTimeout = setTimeout(function() {
				clearInterval(iCheckInterval);
				reject("Polling timeout");
			}, iTimeout == null ? 100 : iTimeout);

			var iCheckInterval = setInterval(function() {
				if (fnCheck()) {
					clearTimeout(iRejectionTimeout);
					clearInterval(iCheckInterval);
					resolve();
				}
			}, 10);
		});
	}

	function waitForBindingInfo(oTable, iTimeout) {
		return poll(function() {
			var oInnerTable = oTable._oTable;
			return oInnerTable && oInnerTable.getBindingInfo(oTable._getStringType() === "Table" ? "rows" : "items");
		}, iTimeout);
	}

	QUnit.module("TableDelegate#Methods", {
		before: function() {
			MDCQUnitUtils.stubPropertyInfos(Table.prototype, [{
				name: "Name",
				path: "Name_Path",
				label: "Name_Label",
				sortable: true
			}, {
				name: "FirstName",
				path: "FirstName_Path",
				label: "FirstName_Label",
				sortable: true
			}, {
				name: "ID",
				path: "ID_Path",
				label: "ID_Label",
				sortable: true,
				text: "FirstName"
			}]);
		},
		beforeEach: function(assert) {
			this.oModel = sinon.createStubInstance(ODataModel);
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/foo"
					}
				},
				p13nMode: ["Sort"],
				columns: [
					new Column({
						header: new Text({
							text: "Column A",
							dataProperty: "Name"
						}),
						hAlign: "Begin",
						importance: "High",
						template: new Text({
							text: "Column A"
						})
					})
				]
			});
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
			Core.applyChanges();

			return this.oTable._fullyInitialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("Filter Restriction", function(assert) {
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var oState = {};
		var oValidationState = this.oTable.validateState(oState, "Group");

		assert.equal(oValidationState.validation, coreLibrary.MessageType.None, "No message");
		assert.equal(oValidationState.message, undefined, "Message text is not defined");

		this.oTable._oMessageFilter = new Filter("Key1", "EQ", "11");
		oValidationState = this.oTable.validateState(oState, "Filter");
		assert.equal(oValidationState.validation, coreLibrary.MessageType.Information, "Information message, Filters are ignored");
		assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP"), "Message text");
	});

	QUnit.test("updateBindingInfo", function(assert) {
		var oTable = this.oTable;

		return waitForBindingInfo(oTable).then(function() {
			oTable.setSortConditions({sorters: [{name: "Name", descending: true}]});
			oTable.setGroupConditions({groupLevels: [{name: "Name"}]});
			oTable.rebind();
			return oTable._fullyInitialized();
		}).then(function() {
			var aSorter = [new Sorter("Name_Path", true)];
			var oBindingInfo = {};

			assert.deepEqual(oTable._oTable.getBindingInfo("rows").sorter, aSorter, "Correct sorter assigned");
			TableDelegate.updateBindingInfo(oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aSorter, filters: [], path: "/foo"});

			oTable.setType("ResponsiveTable");
			return oTable._fullyInitialized();
		}).then(function() {
			var oSorter = oTable._oTable.getBindingInfo("items").sorter[0];

			assert.ok(oTable._oTable.getBindingInfo("items").sorter.length, 1, "One sorter assigned");
			assert.ok(oSorter.sPath === "Name_Path" && oSorter.bDescending === true && oSorter.vGroup != null, "Sorter properties");

			oTable.setGroupConditions({groupLevels: [{name: "FirstName"}]});
			oTable.rebind();
			return oTable._fullyInitialized();
		}).then(function() {
			var aSorters = oTable._oTable.getBindingInfo("items").sorter;

			assert.ok(aSorters, 2, "Two sorters assigned");
			assert.ok(aSorters[0].sPath === "FirstName_Path" && aSorters[0].bDescending === false && aSorters[0].vGroup != null,
				"First sorter properties");
			assert.ok(aSorters[1].sPath === "Name_Path" && aSorters[1].bDescending === true && aSorters[1].vGroup == null,
				"Second sorter properties");

			oTable.setGroupConditions();
			oTable.rebind();
			return oTable._fullyInitialized();
		}).then(function() {
			var aSorter = [new Sorter("Name_Path", true)];
			var oBindingInfo = {};

			assert.deepEqual(oTable._oTable.getBindingInfo("items").sorter, aSorter, "Correct sorter assigned");
			TableDelegate.updateBindingInfo(oTable, oBindingInfo);
			assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aSorter, filters: [], path: "/foo"});
		});
	});

	QUnit.test("formatGroupHeader", function(assert) {
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var oContext = new Context();

		sinon.stub(oContext, "getProperty").callsFake(function(sPath) {
			switch (sPath) {
				case "FirstName_Path":
					return "Johnson";
				case "ID_Path":
					return "123";
				default:
					throw new Error("Unexpected path");
			}
		});

		assert.strictEqual(
			TableDelegate.formatGroupHeader(this.oTable, oContext, "FirstName"),
			oResourceBundle.getText("table.ROW_GROUP_TITLE", ["FirstName_Label", "Johnson"]),
			"Format property without text"
		);

		assert.strictEqual(
			TableDelegate.formatGroupHeader(this.oTable, oContext, "ID"),
			oResourceBundle.getText("table.ROW_GROUP_TITLE_FULL", ["ID_Label", "123", "Johnson"]),
			"Format property with text"
		);
	});

	QUnit.test("Export Capabilities", function(assert) {
		return TableDelegate.fetchExportCapabilities(this.oTable).then(function(oExportCapabilities) {
			assert.ok(typeof oExportCapabilities === 'object', 'Function fetchExportCapabilities returns an object');
			assert.ok(oExportCapabilities.hasOwnProperty('XLSX'), 'Default export type XLSX is provided');
			assert.notOk(oExportCapabilities.hasOwnProperty('PDF'), 'Export type PDF is not provided');
		});
	});
});