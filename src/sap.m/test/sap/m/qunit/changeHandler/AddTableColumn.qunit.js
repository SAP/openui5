/*global QUnit */
sap.ui.define([
	"sap/m/changeHandler/AddTableColumn",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	AddTableColumnChangeHandler,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	UIComponent,
	ComponentContainer,
	JSONModel,
	createAndAppendDiv
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
				'<items>\n',
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
			"changeType": "addTableColumn",
			"oDataInformation": {
				"entityType": "EntityTypeNav"
			},
			"content": {
				"bindingPath": "EntityTypeNav_Property04",
				"newFieldSelector": {
					"id": "view--table_EntityTypeNav_EntityTypeNav_Property04",
					"idIsLocal": true
				},
				"oDataServiceVersion": "2.0",
				"newFieldIndex": 1
			},
			"selector": {
				"id": "view--table",
				"idIsLocal": true
			}
		}, mDefinition);
	}


	QUnit.module("bindingAggregation functionality with XmlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = AddTableColumnChangeHandler;
			this.oChange = new Change(createChangeDefinition());

			var oDOMParser = new DOMParser();
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			this.oTable = this.oXmlView.childNodes[0];
		},
		afterEach: function() {
			this.oChange = null;
		}
	});

	function getEntityType(oChange){
		return oChange.getDefinition().oDataInformation.entityType;
	}

	QUnit.test('applyChange on a xml control tree', function(assert) {
		var mContent = this.oChange.getContent();

		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: XmlTreeModifier,
			appComponent: {
				createId: function (sControlId) {
					return sControlId;
				}
			},
			view: this.oXmlView
		})
		.then(function() {
			var sNewFieldId = mContent.newFieldSelector.id;
			assert.strictEqual(
				this.oTable.childNodes[0].childNodes[1].getAttribute('id'),
				sNewFieldId,
				"column has been created successfully"
			);
			var oLabel = this.oTable.childNodes[0].childNodes[1].childNodes[0];
			assert.strictEqual(
				oLabel.getAttribute('text'),
				"{/#" + getEntityType(this.oChange) + "/" + mContent.bindingPath + "/@sap:label}",
				"column has correct binding"
			);
			var oCell = this.oTable.childNodes[1].childNodes[1].childNodes[0].childNodes[1];
			assert.ok(
				oCell.getAttribute('id')
				.indexOf(sNewFieldId) !== -1,
				"template has been modified successfully"
			);
		}.bind(this));
	});

	QUnit.module("bindingAggregation functionality with JsControlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = AddTableColumnChangeHandler;

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
					"column2": "test2_1",
					"column3": "test3_1"
				},{
					"column0": "test0_2",
					"column1": "test1_2",
					"column2": "test2_2",
					"column3": "test3_2"
				},{
					"column0": "test0_3",
					"column1": "test1_3",
					"column2": "test2_3",
					"column3": "test3_3"
				}]
			}));

			sap.ui.getCore().applyChanges();

			this.oTable = this.oView.byId('myTable');
			this.oChange = new Change(createChangeDefinition());
		},
		afterEach: function() {
			this.oChange = null;
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		var mContent = this.oChange.getContent();

		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent
		})
		.then(function() {
			assert.ok(
				this.oTable.getColumns()[1].getId().indexOf(this.oChange.getContent().newFieldSelector.id) === (this.oUiComponent.getId() + '---').length,
				"column has been created successfully"
			);
			assert.strictEqual(
				"{" + this.oTable.getColumns()[1].getHeader().getBindingInfo('text').binding.getPath() + "}",
				"{/#" + getEntityType(this.oChange) + "/" + mContent.bindingPath + "/@sap:label}",
				"column has been created successfully"
			);
			assert.ok(
				this.oTable.getBindingInfo('items').template.getCells()[1].getId().indexOf(this.oChange.getContent().newFieldSelector.id) !== -1,
				"template has been modified successfully"
			);
		}.bind(this));
	});

	QUnit.test('revertChange on a js control tree', function(assert) {
		var sColumn1Id = this.oTable.getColumns()[1].getId();
		var sTemplateForColumn1Id = this.oTable.getBindingInfo('items').template.getCells()[1].getId();

		return this.oChangeHandler.applyChange(this.oChange, this.oTable, {
			modifier: JsControlTreeModifier,
			appComponent: this.oUiComponent
		})
		.then(function() {
			return this.oChangeHandler.revertChange(this.oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent
			});
		}.bind(this))
		.then(function() {
			assert.strictEqual(
				this.oTable.getColumns()[1].getId(),
				sColumn1Id,
				"column has been restored successfully"
			);
			assert.strictEqual(
				this.oTable.getBindingInfo('items').template.getCells()[1].getId(),
				sTemplateForColumn1Id,
				"template has been restored successfully"
			);
		}.bind(this));
	});
});
