/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/m/changeHandler/MoveTableColumns",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/model/json/JSONModel"
], function(
	MoveTableColumnsChangeHandler,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
    UIComponent,
    ComponentContainer,
    JSONModel
) {
	'use strict';
	QUnit.start();

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
		return jQuery.extend(true, {}, {
				"changeType" : "moveTableColumns",
				"selector": {
					"id": "key"
				},
				"content": {
					"movedElements": [
						{
							"selector": {
								"id": "column0",
								"idIsLocal": true
							},
							"sourceIndex": 0,
							"targetIndex": 1
						}
					]
				},
				"dependentSelector": {
					"target": {
						"id": "myTable",
						"idIsLocal": true
					},
					"source": {
						"id": "myTable",
						"idIsLocal": true
					}
				}
		}, mDefinition);
	}


	QUnit.module("basic functionality with XmlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = MoveTableColumnsChangeHandler;
			this.oChange = new Change(createChangeDefinition());

			var oDOMParser = new DOMParser();
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;

			this.oTable = this.oXmlView.childNodes[0];
			this.oColumn0 = this.oTable.childNodes[0].childNodes[0];
			this.oColumn0InTemplate = this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0];
		},
		afterEach: function() {
			this.oChange = null;
		}
	});

	QUnit.test('applyChange on a xml control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		});

		assert.deepEqual(
			this.oColumn0,
			this.oTable.childNodes[0].childNodes[1],
			"column has been moved successfully"
		);
		assert.deepEqual(
			this.oColumn0InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[1],
			"template has been modified successfully"
		);
	});

	QUnit.test('revertChange on a xml control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		});
		assert.deepEqual(this.oColumn0, this.oTable.childNodes[0].childNodes[1], "column has been moved successfully");
		assert.deepEqual(
			this.oColumn0InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[1],
			"template has been modified successfully"
		);
		this.oChangeHandler.revertChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		});
		assert.deepEqual(this.oColumn0, this.oTable.childNodes[0].childNodes[0], "column has been restored successfully");
		assert.deepEqual(
			this.oColumn0InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0],
			"template has been restored successfully"
		);
	});


	QUnit.module("multiple moveElements at once with XmlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = MoveTableColumnsChangeHandler;
			this.oChange = new Change(createChangeDefinition({
					"content": {
						"movedElements": [
							{
								"selector": {
									"id": "column0",
									"idIsLocal": true
								},
								"sourceIndex": 0,
								"targetIndex": 1
							},
							{
								"selector": {
									"id": "column2",
									"idIsLocal": true
								},
								"sourceIndex": 2,
								"targetIndex": 0
							}
						]
					}
			}));

			var oDOMParser = new DOMParser();
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;

			this.oTable = this.oXmlView.childNodes[0];
			this.oColumn0 = this.oTable.childNodes[0].childNodes[0];
			this.oColumn2 = this.oTable.childNodes[0].childNodes[2];
			this.oColumn0InTemplate = this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0];
			this.oColumn2InTemplate = this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[2];
		},
		afterEach: function() {
			this.oChange = null;
		}
	});

	QUnit.test('applyChange on a xml control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		});

		assert.deepEqual(
			this.oColumn0,
			this.oTable.childNodes[0].childNodes[2],
			"column0 has been moved successfully"
		);
		assert.deepEqual(
			this.oColumn0InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[2],
			"template for column0 has been modified successfully"
		);
		assert.deepEqual(
			this.oColumn2,
			this.oTable.childNodes[0].childNodes[0],
			"column2 has been moved successfully"
		);
		assert.deepEqual(
			this.oColumn2InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0],
			"template for column2 has been modified successfully"
		);
	});

	QUnit.test('revertChange on a xml control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		});
		this.oChangeHandler.revertChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		});
		assert.deepEqual(this.oColumn0,
			this.oTable.childNodes[0].childNodes[2],
			"column0 has been restored successfully"
		);
		assert.deepEqual(
			this.oColumn0InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[2],
			"template for column0 has been restored successfully"
		);
		assert.deepEqual(this.oColumn2,
			this.oTable.childNodes[0].childNodes[0],
			"column2 has been restored successfully"
		);
		assert.deepEqual(
			this.oColumn2InTemplate,
			this.oTable.childNodes[1].childNodes[0].childNodes[0].childNodes[0],
			"template for column2 has been restored successfully"
		);
	});


	QUnit.module("basic functionality with JsControlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = MoveTableColumnsChangeHandler;

			var Comp = UIComponent.extend("test", {
				metadata: {
					manifest : {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent : function() {
					// store it in outer scope
					var oView = sap.ui.xmlview({
						id: this.createId("view"),
						viewContent: oXmlString
					 });
					 return oView;
				}

			});
			this.oUiComponent = new Comp("comp");

			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component : this.oUiComponent
			});
			this.oUiComponentContainer.placeAt("content");

			this.oView = this.oUiComponent.getRootControl();

			sap.ui.getCore().applyChanges();

			this.oTable = this.oView.byId('myTable');
			this.oColumn0 = this.oView.byId('column0');
			this.oColumn0Template = this.oTable.getItems()[0].getCells()[0];

			this.oChange = new Change(createChangeDefinition({
					"content": {
						"movedElements": [
							{
								"selector": {
									"id": "view--column0",
									"idIsLocal": true
								},
								"sourceIndex": 0,
								"targetIndex": 1
							}
						]
					},
					"dependentSelector": {
						"target": {
							"id": "view--myTable",
							"idIsLocal": true
						},
						"source": {
							"id": "view--myTable",
							"idIsLocal": true
						}
					}
			}));
		},
		afterEach: function() {
			this.oChange = null;
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});

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
	});

	QUnit.test('revertChange on a js control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
		this.oChangeHandler.revertChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
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
					manifest : {
						"sap.app": {
							"id": "test",
							"type": "application"
						}
					}
				},
				createContent : function() {
					// store it in outer scope
					var oView = sap.ui.xmlview({
						 id : this.createId("view"),
						 viewContent : oXmlStringWithBinding
					 });
					 return oView;
				}

			});
			this.oUiComponent = new Comp("comp");

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

			sap.ui.getCore().applyChanges();

			this.oTable = this.oView.byId('myTable');


			this.oColumn0 = this.oView.byId('column0');
			this.oColumn0Template = this.oTable.getBindingInfo('items').template.getCells()[0];
			this.oColumn0Items = this.oTable.getItems()[0].getCells()[0];

			this.oChange = new Change(createChangeDefinition({
					"content": {
						"movedElements": [
							{
								"selector": {
									"id": "view--column0",
									"idIsLocal": true
								},
								"sourceIndex": 0,
								"targetIndex": 1
							}
						]
					},
					"dependentSelector": {
						"target": {
							"id": "view--myTable",
							"idIsLocal": true
						},
						"source": {
							"id": "view--myTable",
							"idIsLocal": true
						}
					}
			}));
		},
		afterEach: function() {
			this.oChange = null;
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});

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
	});

	QUnit.test('revertChange on a js control tree', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
		this.oChangeHandler.revertChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent,
			view: this.oView
		});
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
	});
});