var sView = jQuery('#view').html();

sap.ui.require([
	"jquery.sap.global", "sap/ui/model/base/XMLNodeAttributesModel", "sap/ui/model/json/JSONModel", "sap/ui/base/ManagedObject"
], function(jQuery, XMLNodeAttributesModel, JSONModel, ManagedObject) {
	/* global QUnit, sinon */
	/* eslint no-warning-comments: 0 */
	"use strict";

	QUnit.module("XML Nodes Model Model", {
		beforeEach: function() {
			var oJSON = new JSONModel({
				team: "FCB",
				players: [
					{
						firstName: 'Thomas',
						lastName: 'Müller'
					}, {
						firstName: 'Manuel',
						lastName: 'Neuer'
					}
				]
			});

			this.xml = jQuery.parseXML(sView);

			this.oVisitorStub = {
				getSettings: function() {
					var oSettings = {
						models: {
							model: oJSON
						}
					};

					return oSettings;
				},
				getResult: function(vValue, oElement) {
					var oBindingInfo;
					if (typeof vValue === 'string') {
						oBindingInfo = ManagedObject.bindingParser(vValue);
					} else {
						oBindingInfo = vValue;
					}


					return oJSON.getProperty(oBindingInfo.path);
				}
			};
		},
		afterEach: function() {
		}
	});

// check default settings
	QUnit.test("Static properties of the node are evaluated correctly", function(assert) {
		var oButtonNode = this.xml.querySelector('#button');
		assert.ok(oButtonNode, "There is a button node");

		var oButtonModel = new XMLNodeAttributesModel(oButtonNode, this.oVisitorStub, "button");
		var oNode = oButtonModel.getObject();
		assert.ok(oNode,"Calling getObject() returns a node");
		assert.deepEqual(oNode, oButtonNode, "Calling getObject() returns the node itsself");
		assert.strictEqual(oButtonModel.getProperty("/text"), "Button", "The text is correct");
		assert.strictEqual(oButtonModel.getProperty("/text/@binding"), undefined, "The text is no binding");
		assert.strictEqual(oButtonModel.getProperty("/text/@bindingStr"), "", "The text is no binding");
	});

	QUnit.test("Bound properties Aggregations are evaluated correctly", function(assert) {
		var oTableNode = this.xml.querySelector('#table');
		assert.ok(oTableNode, "There is a table node");

		var oTableModel = new XMLNodeAttributesModel(oTableNode, this.oVisitorStub, "table");
		assert.strictEqual(oTableModel.getProperty("/headerText"), "FCB", "The title is evaluated correct from binding");
		assert.strictEqual(oTableModel.getProperty("/headerText/@bindingStr"), "{model>/team}", "The title is returned as binding string");

		var oBinding = {model: "model", path: "/team"};
		assert.deepEqual(oTableModel.getProperty("/headerText/@binding"), oBinding, "The title is returned as binding object");

		assert.strictEqual(oTableModel.getProperty("/items"), "{model>/players}", "The items are returned as binding string");
		assert.strictEqual(oTableModel.getProperty("/items/@bindingStr"), "{model>/players}", "The items are returned as binding string");

		oBinding.path = "/players";
		assert.deepEqual(oTableModel.getProperty("/items/@binding"), oBinding, "The items are returned as binding object");

		var oItems = oTableModel.getAggregation("/items/@data");
		assert.strictEqual(oItems.length, 2, "There are two players");
		var iLength = oTableModel.getAggregation("/items/@data/length");
		assert.strictEqual(iLength,2,"There are two players also by length");
		var oPlayer = oTableModel.getProperty("/items/@data/1");
		assert.strictEqual(oPlayer.lastName, "Neuer", "The second player is returned");

		assert.strictEqual(oTableModel.getProperty("/items/@data/0/firstName"), "Thomas", "The name of the first player is returned");
	});

	QUnit.test("Metadata contexts is evaluated correctly", function(assert) {
		var oPanelNode = this.xml.querySelector('#panel');
		assert.ok(oPanelNode, "There is a panel node");

		var oPanelModel = new XMLNodeAttributesModel(oPanelNode, this.oVisitorStub, "panel");
		assert.strictEqual(oPanelModel.getSpecialSetting("/metadataContexts"), "{model: 'model', path: '/players', adapter: 'dummy'}", "Accessing as /metadataContexts return the attribute value");
		var oItems = oPanelModel.getAggregation("/metadataContexts/data");
		assert.strictEqual(oItems.length, 2, "Accessing via /metadataContexts/data returns the data");
		var oPlayer = oPanelModel.getProperty("/metadataContexts/data/1");
		assert.strictEqual(oPlayer.lastName, "Neuer", "Also is divable to aggegations");

		assert.strictEqual(oPanelModel.getProperty("/metadataContexts/data/0/firstName"), "Thomas", "And evaluates properties");

		assert.strictEqual(oPanelModel.getProperty("/metadataContexts/model"), "model", "Accessing via /metadataContexts/model give the model which aids templating");
	});
});
