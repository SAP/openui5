/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/changeHandler/AddXML',
	'sap/ui/fl/Change',
	'sap/ui/fl/changeHandler/JsControlTreeModifier',
	'sap/ui/fl/changeHandler/XmlTreeModifier',
	'sap/m/HBox',
	'sap/m/Button'
], function(
	AddXML,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	HBox,
	Button
) {
	'use strict';
	QUnit.start();

	QUnit.module("Given a AddXML Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = AddXML;
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});

			this.oFragmentPath = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragment";

			var oChangeJson = {
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML"
			};

			this.oChangeSpecificContent = {
				fragment: this.oFragmentPath,
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach : function() {
			this.oHBox.destroy();
		}
	});

	QUnit.test("When calling 'completeChangeContent'", function(assert) {
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		var oSpecificContent = this.oChange.getDefinition().content;
		assert.deepEqual(oSpecificContent, this.oChangeSpecificContent, "then the change specific content is in the change");
	});

	QUnit.test("When calling 'completeChangeContent' without complete information", function(assert) {
		this.oChangeSpecificContent.targetAggregation = null;
		assert.throws(function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);}, "without targetAggregation 'completeChangeContent' throws an error");

		this.oChangeSpecificContent.targetAggregation = "items";
		this.oChangeSpecificContent.fragment = null;
		assert.throws(function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);}, "without fragment 'completeChangeContent' throws an error");

		this.oChangeSpecificContent.fragment = this.oFragmentPath;
		this.oChangeSpecificContent.index = undefined;
		assert.throws(function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);}, "without index 'completeChangeContent' throws an error");
	});


	QUnit.module("Given a AddXML Change Handler with JSTreeModifier", {
		beforeEach : function() {
			this.oChangeHandler = AddXML;
			this.oButton = new Button();
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});
			this.oHBox.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oFragmentPath = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragment";

			var oChangeJson = {
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML"
			};

			this.oChangeSpecificContent = {
				fragment: this.oFragmentPath,
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach : function() {
			this.oHBox.destroy();
		}
	});

	QUnit.test("When applying the change on a js control tree", function(assert) {
		assert.equal(this.oHBox.getItems().length, 1, "initially there is only 1 item in the hbox");

		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});
		assert.equal(this.oHBox.getItems().length, 2, "after the change there are 2 items in the hbox");
	});

	QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
		this.oChangeSpecificContent.targetAggregation = "invalidAggregation";
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});}, "then apply change throws an error");
	});

	QUnit.test("When applying the change on a js control tree with an invalid fragment", function(assert) {
		this.oChangeSpecificContent.fragment = "invalidFragmentPath";
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});}, "then apply change throws an error");
	});

	QUnit.test("When applying the change on a js control tree with an invalid type", function(assert) {
		this.oChangeSpecificContent.fragment = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragmentInvalid";
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});}, "then apply change throws an error");
	});

	QUnit.test("When reverting the change on a js control tree", function(assert) {
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});
		assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
	});


	QUnit.module("Given a AddXML Change Handler with XMLTreeModifier", {
		beforeEach : function() {
			this.oChangeHandler = AddXML;

			jQuery.sap.registerModulePath("testComponent", "../testComponent");
			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<HBox id="hbox">' +
						'<tooltip>' +	//0..1 aggregation
							'<TooltipBase xmlns="sap.ui.core"></TooltipBase>' + //inline namespace as sap.ui.core is use case for not existing namespace
						'</tooltip>' +
						'<items>' +
							'<Button id="button123"></Button>' + //content in default aggregation
						'</items>' +
					'</HBox>' +
				'</mvc:View>';
			this.oXmlView = jQuery.sap.parseXML(this.oXmlString, "application/xml").documentElement;
			this.oFragmentPath = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragment";

			var oChangeJson = {
				selector: {
					id: "hbox",
					type: "sap.m.HBox"
				},
				changeType: "addXML"
			};

			this.oChangeSpecificContent = {
				fragment: this.oFragmentPath,
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach : function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("When applying the change on a xml control tree", function(assert) {
		var oHBox = this.oXmlView.childNodes[0];
		var oHBoxItems = this.oXmlView.childNodes[0].childNodes[1];
		assert.equal(oHBoxItems.childNodes.length, 1, "initially there is only one child of the HBox");
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		this.oChangeHandler.applyChange(this.oChange, oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});
		assert.equal(oHBoxItems.childNodes.length, 2, "after the addXML there are two children of the HBox");
	});

	QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
		var oHBox = this.oXmlView.childNodes[0];
		this.oChangeSpecificContent.targetAggregation = "invalidAggregation";
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
	});

	QUnit.test("When applying the change on a xml control tree with an invalid fragment", function(assert) {
		var oHBox = this.oXmlView.childNodes[0];
		this.oChangeSpecificContent.fragment = "invalidFragment";
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
	});

	QUnit.test("When applying the change on a xml control tree with an invalid type", function(assert) {
		var oHBox = this.oXmlView.childNodes[0];
		this.oChangeSpecificContent.fragment = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragmentInvalid";
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
	});

	QUnit.test("When reverting the change on an xml control tree", function(assert) {
		var oHBoxItems = this.oXmlView.childNodes[0].childNodes[1];
		this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
		this.oChangeHandler.applyChange(this.oChange, this.oXmlView.childNodes[0], {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});
		this.oChangeHandler.revertChange(this.oChange, this.oXmlView.childNodes[0], {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});

		assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
	});
});