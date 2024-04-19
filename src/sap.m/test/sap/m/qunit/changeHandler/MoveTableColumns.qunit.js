/*global QUnit */
sap.ui.define([
	"sap/m/changeHandler/MoveTableColumns",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/mvc/XMLView",
	"sap/base/util/deepExtend",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	MoveTableColumnsChangeHandler,
	JsControlTreeModifier,
	XmlTreeModifier,
	UIComponent,
	ComponentContainer,
	JSONModel,
	createAndAppendDiv,
	nextUIUpdate,
	XMLView,
	deepExtend,
	FlexTestAPI
) {
	'use strict';
	createAndAppendDiv("content");

	var oXmlString = [
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
			'<Table id="myTable">',
				'<columns>',
					'<Column id="column0"><Text text="column0" /></Column>',
					'<Column id="column1"><Text text="column1" /></Column>',
					'<Column id="column2"><Text text="column2" /></Column>',
				'</columns>',
				'<items>',
					'<ColumnListItem>',
						'<cells>',
							'<Text text="{column0}" id="text0" />',
							'<Text text="{column1}" id="text1" />',
							'<Text text="{column2}" id="text2" />',
						'</cells>',
					'</ColumnListItem>',
				'</items>',
			'</Table>',
		'</mvc:View>'
	].join('');

	function createChangeDefinition(mDefinition) {
		return deepExtend({}, {
			"changeType" : "moveTableColumns",
			"selector": {
				"id": "view--myTable",
				"idIsLocal": true
			},
			"movedElements": [
				{
					"id": "comp---view--column0",
					"sourceIndex": 0,
					"targetIndex": 1
				}
			],
			source: {
				aggregation: "columns",
				id: "comp---view--myTable"
			},
			target: {
				aggregation: "columns",
				id: "comp---view--myTable"
			}
		}, mDefinition);
	}

	QUnit.module("basic functionality with JsControlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = MoveTableColumnsChangeHandler;

			var Comp = UIComponent.extend("test", {
				metadata: {
					interfaces: [
						"sap.ui.core.IAsyncContentCreation"
					],
					manifest : {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent : function() {
					// store it in outer scope
					return XMLView.create({
						id: this.createId("view"),
						definition: oXmlString
					});
				}

			});

			this.oUiComponent = new Comp("comp");

			return this.oUiComponent.rootControlLoaded().then(async function() {
				// Place component in container and display
				this.oUiComponentContainer = new ComponentContainer({
					component : this.oUiComponent
				});
				this.oUiComponentContainer.placeAt("content");

				this.oView = this.oUiComponent.getRootControl();

				await nextUIUpdate();

				this.oTable = this.oView.byId('myTable');
				this.oColumn0 = this.oView.byId('column0');
				this.oColumn0Template = this.oTable.getItems()[0].getCells()[0];

				var oDOMParser = new DOMParser();
				var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
				this.oXmlView = oXmlDocument.documentElement;

				this.oXmlTable = this.oXmlView.childNodes[0];
				this.oXmlColumn0 = this.oXmlTable.childNodes[0].childNodes[0];
				this.oXmlColumn0InTemplate = this.oXmlTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0];

				return FlexTestAPI.createFlexObject({
					changeSpecificData: createChangeDefinition(),
					selector: this.oTable
				}).then(function(oChange) {
					this.oChange = oChange;
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oChange = null;
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('applyChange on a xml control tree', function(assert) {
		return this.oChangeHandler.applyChange(this.oChange, this.oXmlTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId.split("--")[1];
				}
			},
			view: this.oXmlView
		})
		.then(function() {
			assert.deepEqual(
				this.oXmlColumn0,
				this.oXmlTable.childNodes[0].childNodes[1],
				"column has been moved successfully"
			);
			assert.deepEqual(
				this.oXmlColumn0InTemplate,
				this.oXmlTable.childNodes[1].childNodes[0].childNodes[0].childNodes[1],
				"template has been modified successfully"
			);
		}.bind(this));
	});

	QUnit.test('revertChange on a xml control tree', function(assert) {
		return this.oChangeHandler.applyChange(this.oChange, this.oXmlTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId.split("--")[1];
				}
			},
			view: this.oXmlView
		})
		.then(function() {
			assert.deepEqual(this.oXmlColumn0, this.oXmlTable.childNodes[0].childNodes[1], "column has been moved successfully");
			assert.deepEqual(
				this.oXmlColumn0InTemplate,
				this.oXmlTable.childNodes[1].childNodes[0].childNodes[0].childNodes[1],
				"template has been modified successfully"
			);
			return this.oChangeHandler.revertChange(this.oChange, this.oXmlTable, {
				modifier: XmlTreeModifier,
				appComponent: {
					createId: function (sControlId) {
						return sControlId.split("--")[1];
					}
				},
				view: this.oXmlView
			});
		}.bind(this))
		.then(function() {
			assert.deepEqual(this.oXmlColumn0, this.oXmlTable.childNodes[0].childNodes[0], "column has been restored successfully");
			assert.deepEqual(
				this.oXmlColumn0InTemplate,
				this.oXmlTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0],
				"template has been restored successfully"
			);
		}.bind(this));
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		})
		.then(function() {
			assert.deepEqual(
				this.oColumn0.getId(),
				this.oTable.getAggregation('columns')[1].getId(),
				"column has been moved successfully"
			);
			assert.deepEqual(
				this.oColumn0Template.getId(),
				this.oTable.getItems()[0].getCells()[1].getId(),
				"template has been moved successfully"
			);
		}.bind(this));
	});

	QUnit.test('revertChange on a js control tree', function(assert) {
		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		})
		.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}))
		.then(function(){
			assert.deepEqual(
				this.oColumn0.getId(),
				this.oTable.getAggregation('columns')[0].getId(),
				"column has been restored successfully"
			);
			assert.deepEqual(
				this.oColumn0Template.getId(),
				this.oTable.getItems()[0].getCells()[0].getId(),
				"template has been restored successfully"
			);
		}.bind(this));
	});

	QUnit.module("bindingAggregation functionality with JsControlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = MoveTableColumnsChangeHandler;

			// Adds binding to XML
			var sAfterSubstring = 'id="myTable"';
			var iInsertPosition = oXmlString.indexOf(sAfterSubstring) + sAfterSubstring.length;
			var oXmlStringWithBinding = [
				oXmlString.slice(0, iInsertPosition),
				' items="{path: \'/records\'}"',
				oXmlString.slice(iInsertPosition)
			].join('');


			var Comp = UIComponent.extend("test", {
				metadata: {
					interfaces: [
						"sap.ui.core.IAsyncContentCreation"
					],
					manifest : {
						"sap.app": {
							"id": "test",
							"type": "application"
						}
					}
				},
				createContent : function() {
					return XMLView.create({
						id : this.createId("view"),
						definition : oXmlStringWithBinding
					});
				}

			});
			this.oUiComponent = new Comp("comp");

			return this.oUiComponent.rootControlLoaded().then(async function() {
				// Place component in container and display
				this.oUiComponentContainer = new ComponentContainer({
					component : this.oUiComponent
				});


				this.oUiComponentContainer.placeAt("content");

				this.oView = this.oUiComponent.getRootControl();

				this.oView.setModel(new JSONModel({
					"records": [{
						"column0": "test0_1",
						"column1": "test1_1",
						"column2": "test2_1"
					},{
						"column0": "test0_2",
						"column1": "test1_2",
						"column2": "test2_2"
					},{
						"column0": "test0_3",
						"column1": "test1_3",
						"column2": "test2_3"
					}]
				}));

				await nextUIUpdate();

				this.oTable = this.oView.byId('myTable');


				this.oColumn0 = this.oView.byId('column0');
				this.oColumn0Template = this.oTable.getBindingInfo('items').template.getCells()[0];
				this.oColumn0Items = this.oTable.getItems()[0].getCells()[0];

				var oDOMParser = new DOMParser();
				var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
				this.oXmlView = oXmlDocument.documentElement;

				this.oXmlTable = this.oXmlView.childNodes[0];
				this.oXmlColumn0 = this.oXmlTable.childNodes[0].childNodes[0];
				this.oXmlColumn0InTemplate = this.oXmlTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0];

				return FlexTestAPI.createFlexObject({
					changeSpecificData: createChangeDefinition(),
					selector: this.oTable
				}).then(function(oChange) {
					this.oChange = oChange;
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oChange = null;
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		})
		.then(function() {
			assert.deepEqual(
				this.oColumn0.getId(),
				this.oTable.getAggregation('columns')[1].getId(),
				"column has been moved successfully"
			);
			assert.deepEqual(
				this.oColumn0Template.getId(),
				this.oTable.getBindingInfo('items').template.getCells()[1].getId(),
				"column in template has been moved successfully"
			);
			assert.deepEqual(
				this.oColumn0Items.getId(),
				this.oTable.getItems()[0].getCells()[1].getId(),
				"column in items aggregation has been moved successfully"
			);
		}.bind(this));
	});

	QUnit.test('revertChange on a js control tree', function(assert) {
		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		})
		.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		}))
		.then(function() {
			assert.deepEqual(
				this.oColumn0.getId(),
				this.oTable.getAggregation('columns')[0].getId(),
				"column has been moved successfully"
			);
			assert.deepEqual(
				this.oColumn0Template.getId(),
				this.oTable.getBindingInfo('items').template.getCells()[0].getId(),
				"column in template has been moved successfully"
			);
			assert.deepEqual(
				this.oColumn0Items.getId(),
				this.oTable.getItems()[0].getCells()[0].getId(),
				"column in items aggregation has been moved successfully"
			);
		}.bind(this));
	});
});