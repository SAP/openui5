// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"sap/ui/mdc/field/FieldValueHelpMdcTableWrapper",
	"sap/ui/mdc/field/FieldValueHelpDelegate",
	"sap/ui/mdc/field/InParameter",
	"sap/ui/mdc/field/OutParameter",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/FilterBar",
	"sap/ui/core/Core",
	"sap/ui/mdc/p13n/Engine"
], function (
		FieldValueHelpMdcTableWrapper,
		FieldValueHelpDelegate,
		InParameter,
		OutParameter,
		FilterField,
		Table,
		Column,
		GridTableType,
		ResponsiveTableType,
		Text,
		JSONModel,
		FilterBar,
		oCore,
		Engine
	) {
	"use strict";


	var oModel;


	var oWrapper;
	var oTable;
	var oFilterBar;
	var iSelect = 0; // eslint-disable-line no-unused-vars
	var iNavigate = 0; // eslint-disable-line no-unused-vars
	var iDataUpdate = 0; // eslint-disable-line no-unused-vars

	var _mySelectionChangeHandler = function(oEvent) {
		iSelect++;
	};

	var _myNavigateHandler = function(oEvent) {
		iNavigate++;
	};

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
	};

	/* use dummy VieldValueHelp just to test API */
//	var bSingleSelection = true;
	var sKeyPath = "key";
	var sDescriptionPath = "text";
	var iMaxConditions = -1;
	var bUseInParameters = false;
	var oInParameter = new InParameter({helpPath: "additionalText"});
	var bUseOutParameters = false;
	var oOutParameter = new OutParameter({helpPath: "additionalText"});
	var oValueHelp = {
//			_getSingleSelection: function() {
//				return bSingleSelection;
//			},
			_getKeyPath: function() {
				return sKeyPath;
			},
			getDescriptionPath: function() {
				return sDescriptionPath;
			},
			getMaxConditions: function() {
				return iMaxConditions;
			},
			isA: function(sName) {
				return sName === "sap.ui.mdc.field.FieldValueHelp" ? true : false;
			},
			getModel: function(sName) {
				return oModel;
			},
			invalidate: function(oOrigin) {},
			getInParameters: function() {
				if (bUseInParameters) {
					return [oInParameter];
				} else {
					return [];
				}
			},
			getOutParameters: function() {
				if (bUseOutParameters) {
					return [oOutParameter];
				} else {
					return [];
				}
			},
			getDelegate: function() {
				return {name: "sap/ui/mdc/field/FieldValueHelpDelegate", payload: {}};
			},
			getControlDelegate: function () {
				return FieldValueHelpDelegate;
			},
			getPayload: function() {
				return {};
			},
			_getFilterBar: function () {
				return oValueHelp.getFilterBar();
			},
			getFilterBar: function () {
				oFilterBar = oFilterBar || new FilterBar({
					liveMode: false,
					delegate: {name: 'delegates/GenericVhFilterBarDelegate', payload: {collectionName: ''}},
					filterConditions: { myfilter: [{ operator: "EQ", values: ["a"] }] },
					filterItems: [
						new FilterField({
							delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
							conditions: "{$filters>/conditions/myfilter}"
						})
					],
					basicSearchField: new FilterField({
						delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
						dataType: "Edm.String",
						conditions: "{$filters>/conditions/$search}",
						width: "50%",
						maxConditions: 1,
						placeholder: "Search"
					})
				});

				return oFilterBar;
			}
	};

	var oClock;

	var _initTable = function (bFVH, oTableType) {
		oTable = new Table("T1", {
			header: "",
			showRowCount: true,
			width: "26rem",
			type: oTableType,
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: "/items"
				}
			},
			columns: [
				new Column({dataProperty:"key", template: new Text({text: "{key}"})}),
				new Column({dataProperty:"text", template: new Text({text: "{text}"})}),
				new Column({dataProperty:"additionalText", template: new Text({text: "{additionalText}"})})
			]
		});

		if (!bFVH) {
			oTable.setModel(oModel); // as ValueHelp is faked
		}

		oWrapper = new FieldValueHelpMdcTableWrapper("W1", {
					selectedItems: [{key: "I2", description: "Item 2"}],
					selectionChange: _mySelectionChangeHandler,
					navigate: _myNavigateHandler,
					dataUpdate: _myDataUpdateHandler
				});
		if (!bFVH) {
			oWrapper.getParent = function() {
				return oValueHelp;
			};
		}
		oWrapper.setTable(oTable);
	};

	var _initWrapper = function(bFVH) {
		oModel = new JSONModel({
			items:[{text: "Item 1", key: "I1", additionalText: "Text 1"},
				   {text: "Item 2", key: "I2", additionalText: "Text 2"},
				   {text: "X-Item 3", key: "I3", additionalText: "Text 3"}]
			});
		oCore.setModel(oModel);
	};

	var _teardown = function() {
		if (oClock) {
			oClock.restore();
			oClock = undefined;
		}
		oTable.destroy();
		oTable = undefined;
		oWrapper.destroy();
		oWrapper = undefined;
		iSelect = 0; // eslint-disable-line
		iNavigate = 0; // eslint-disable-line
		iDataUpdate = 0; // eslint-disable-line
		sKeyPath = "key";
		sDescriptionPath = "text";
		iMaxConditions = -1;
		bUseInParameters = false;
		bUseOutParameters = false;
		oModel.destroy();
		oModel = undefined;

		if (oFilterBar) {
			oFilterBar.destroy();
			oFilterBar = null;
		}
	};

	QUnit.module("Basics", {
		beforeEach: function() {
			_initWrapper(false);
			},
		afterEach: _teardown
	});

	QUnit.test("Instantly cloning wrapper", function(assert) {
		_initTable(false, new GridTableType({rowCountMode: "Fixed"}));
		var oClone = oWrapper.clone();
		assert.notOk(oWrapper.OInnerWrapperClass, "OInnerWrapperClass not yet available.");
		assert.ok(oClone, "oWrapper was cloned successfully");
		oClone.destroy();
	});

	QUnit.test("initialize grid table", function(assert) {
		var fnDone = assert.async();

		_initTable(false, new GridTableType({rowCountMode: "Fixed"}));

		oWrapper.initialize();

		var oContent = oWrapper.getTable();
		assert.equal(oContent, oTable, "oWrapper content");

		oWrapper._oInnerWrapperClassPromise.then(function () {
			assert.ok(oWrapper.OInnerWrapperClass.getMetadata().getName() === "sap.ui.mdc.field.FieldValueHelpUITableWrapper", "oWrapper inner class");
			fnDone();
		});
	});

	QUnit.test("initialize responsive table", function(assert) {
		var fnDone = assert.async();

		_initTable(false, new ResponsiveTableType());

		oWrapper.initialize();

		var oContent = oWrapper.getTable();
		assert.equal(oContent, oTable, "oWrapper content");

		oWrapper._oInnerWrapperClassPromise.then(function () {
			assert.ok(oWrapper.OInnerWrapperClass.getMetadata().getName() === "sap.ui.mdc.field.FieldValueHelpMTableWrapper", "oWrapper inner class");
			fnDone();
		});
	});

	QUnit.test("_handleSelectionChange", function(assert) {
		var fnDone = assert.async();

		_initTable(false, new GridTableType({rowCountMode: "Fixed"}));
		oWrapper.initialize();
		sinon.stub(oWrapper,"_isTableReady").returns(true);
		sinon.spy(oWrapper, "_fireSelectionChange");
		oTable._fullyInitialized().then(function () {
			oWrapper._iRunningTableSelectionUpdates = 1;

			oTable._oTable.fireRowSelectionChange();
			assert.notOk(oWrapper._fireSelectionChange.called, "_fireSelectionChange is not triggered when wrapper is modifying selections.");

			oWrapper._iRunningTableSelectionUpdates = 0;

			oTable._oTable.fireRowSelectionChange();
			assert.ok(oWrapper._fireSelectionChange.calledOnce, "_fireSelectionChange is triggered.");

			oWrapper._bBusy = true;
			oTable._oTable.fireRowSelectionChange();
			assert.ok(oWrapper._fireSelectionChange.calledOnce, "_fireSelectionChange is not triggered while table is busy.");
			fnDone();
		});
	});

	QUnit.test("close triggers Engine.reset for given FilterBar", function(assert) {
		var fnDone = assert.async();

		_initTable(false, new GridTableType({rowCountMode: "Fixed"}));
		oWrapper.initialize();
		sinon.stub(oWrapper,"_isTableReady").returns(true);
		sinon.spy(oWrapper, "_fireSelectionChange");
		oTable._fullyInitialized().then(function () {
			var oEngine = Engine.getInstance();
			sinon.spy(oEngine, "reset");
			oWrapper.fieldHelpClose();
			assert.ok(oEngine.reset.calledWith(oValueHelp.getFilterBar()), "Engine reset called for FilterBar.");
			oEngine.reset.restore();
			fnDone();
		});
	});
});




