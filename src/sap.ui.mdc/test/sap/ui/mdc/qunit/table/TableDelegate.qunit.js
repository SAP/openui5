/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table",
	"../QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/mdc/table/Column",
	"sap/ui/model/Sorter"
], function(
	Table,
	MDCQUnitUtils,
	Core,
	coreLibrary,
	Filter,
	TableDelegate,
	ODataModel,
	Column,
	Sorter
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
				path: "Name",
				label: "Name",
				sortable: true
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
				type: "ResponsiveTable",
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
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			MDCQUnitUtils.restorePropertyInfos(Table.prototype);
		}
	});

	QUnit.test("Filter Restriction", function(assert) {
		var oTable = this.oTable;

		return oTable._fullyInitialized().then(function() {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oState, oValidationState;
			oState = {};
			oValidationState = oTable.validateState(oState, "Group");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.None, "No message");
			assert.equal(oValidationState.message, undefined, "Message text is not defined");

			oTable._oMessageFilter = new Filter("Key1", "EQ", "11");
			oValidationState = oTable.validateState(oState, "Filter");
			assert.equal(oValidationState.validation, coreLibrary.MessageType.Information,
				"Information message, Filters are ignored");
				assert.equal(oValidationState.message, oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP"),
				"Message text is correct");
		});
	});

	QUnit.test("UpdateBindingInfo", function(assert) {
		var done = assert.async();
		var oTable = this.oTable;
		return oTable._fullyInitialized().then(function() {
			return waitForBindingInfo(oTable);
		}).then(function() {
			var aSorter = [new Sorter("Name",false)];
			var oBindingInfo = {};
			oTable.setSortConditions({ sorters: [{name: "Name", descending: false}] }).rebind();

			oTable._fullyInitialized().then(function() {
				assert.deepEqual(oTable._oTable.getBindingInfo("items").sorter, aSorter, "Correct sorter assigned");
				TableDelegate.updateBindingInfo(oTable, oBindingInfo);
				assert.deepEqual(oBindingInfo, {parameters: {}, sorter: aSorter, filters: [], path: "/foo"});
				done();
			});
		});
	});

});
