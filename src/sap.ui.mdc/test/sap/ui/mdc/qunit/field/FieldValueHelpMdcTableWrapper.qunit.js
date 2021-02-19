// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit */
/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"sap/ui/mdc/field/FieldValueHelpMdcTableWrapper",
	"sap/ui/mdc/field/FieldValueHelpUITableWrapper",
	"sap/ui/mdc/field/FieldValueHelpMTableWrapper",
	"sap/ui/mdc/field/FieldValueHelpDelegate",
	"sap/ui/mdc/field/InParameter",
	"sap/ui/mdc/field/OutParameter",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel"
], function (
		FieldValueHelpMdcTableWrapper,
		FieldValueHelpUITableWrapper,
		FieldValueHelpMTableWrapper,
		FieldValueHelpDelegate,
		InParameter,
		OutParameter,
		Table,
		Column,
		Text,
		JSONModel
	) {
	"use strict";


	var oModel;


	var oWrapper;
	var oTable;
	var oFilterBar;
	var iSelect = 0;
	var iNavigate = 0;
	var iDataUpdate = 0;

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
			getFilterBar: function () {
				oFilterBar = oFilterBar || new sap.ui.mdc.filterbar.vh.FilterBar({
					liveMode: false,
					delegate: {name: 'sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate', payload: {collectionName: ''}},
					filterItems: [
						new sap.ui.mdc.FilterField({
							delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}},
							conditions: "{$filters>/conditions/text}"
						})
					],
					basicSearchField: new sap.ui.mdc.FilterField({
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
		sap.ui.getCore().setModel(oModel);
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
		iSelect = 0;
		iNavigate = 0;
		iDataUpdate = 0;
		sKeyPath = "key";
		sDescriptionPath = "text";
		iMaxConditions = -1;
		bUseInParameters = false;
		bUseOutParameters = false;
		//FieldValueHelpMdcTableWrapper._init();
		oModel.destroy();
		oModel = undefined;

		if (oFilterBar) {
			oFilterBar.destroy();
			oFilterBar = null;
		}
	};

	QUnit.module("API", {
		beforeEach: function() {
			_initWrapper(false);
			},
		afterEach: _teardown
	});


	QUnit.test("initialize grid table", function(assert) {
		var fnDone = assert.async();

		_initTable(false, new sap.ui.mdc.table.GridTableType({rowCountMode: "Fixed"}));

		oWrapper.initialize();

		var oContent = oWrapper.getTable();
		assert.equal(oContent, oTable, "oWrapper content");

		oWrapper._oInnerWrapperClassPromise.then(function () {
			assert.ok(oWrapper.OInnerWrapperClass === FieldValueHelpUITableWrapper, "oWrapper inner class");
			fnDone();
		});
	});

	QUnit.test("initialize responsive table", function(assert) {
		var fnDone = assert.async();

		_initTable(false, new sap.ui.mdc.table.ResponsiveTableType());

		oWrapper.initialize();

		var oContent = oWrapper.getTable();
		assert.equal(oContent, oTable, "oWrapper content");

		oWrapper._oInnerWrapperClassPromise.then(function () {
			assert.ok(oWrapper.OInnerWrapperClass === FieldValueHelpMTableWrapper, "oWrapper inner class");
			fnDone();
		});
	});
});




