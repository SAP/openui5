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

	var oFragmentPath = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragment";
	var oFragmentPathInvalid = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragmentInvalid";
	var oFragmentPathMultiple = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragmentMultiple";
	var oFragmentPathMultipleInvalid = "sap.ui.fl.test.qunit.changeHandler.AddXMLFragmentMultipleInvalid";

	QUnit.module("Given a AddXML Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = AddXML;
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});

			var oChangeJson = {
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML",
				fileName: "addXMLChange"
			};

			this.oChangeSpecificContent = {
				fragment: oFragmentPath,
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach : function() {
			this.oHBox.destroy();
		}
	}, function() {
		QUnit.test("When calling 'completeChangeContent' with complete information", function(assert) {
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

			this.oChangeSpecificContent.fragment = oFragmentPath;
			this.oChangeSpecificContent.index = undefined;
			assert.throws(function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);}, "without index 'completeChangeContent' throws an error");
		});
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

			var oChangeJson = {
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML",
				fileName: "addXMLChange"
			};

			this.oChangeSpecificContent = {
				fragment: oFragmentPath,
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach : function() {
			this.oHBox.destroy();
		}
	}, function() {
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
			this.oChangeSpecificContent.fragment = oFragmentPathInvalid;
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});}, "then apply change throws an error");
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements", function(assert) {
			assert.equal(this.oHBox.getItems().length, 1, "initially there is only 1 item in the hbox");

			this.oChangeSpecificContent.fragment = oFragmentPathMultiple;
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});

			var oItems = this.oHBox.getItems();
			assert.equal(oItems.length, 4, "after the change there are 4 items in the hbox");
			assert.equal(oItems[1].getId(), "addXMLChange--button", "then the first button in the fragment has the correct index and ID");
			assert.equal(oItems[2].getId(), "addXMLChange--button2", "then the second button in the fragment has the correct index and ID");
			assert.equal(oItems[3].getId(), "addXMLChange--button3", "then the third button in the fragment has the correct index and ID");
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements and one invalid type inside", function(assert) {
			assert.equal(this.oHBox.getItems().length, 1, "initially there is only 1 item in the hbox");

			this.oChangeSpecificContent.fragment = oFragmentPathMultipleInvalid;
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});}, "then apply change throws an error");

			assert.equal(this.oHBox.getItems().length, 1, "after the change there is still only 1 item in the hbox");
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});
			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting the change on a js control tree with multiple root elements", function(assert) {
			assert.equal(this.oHBox.getItems().length, 1, "before the change there is only one child of the HBox");

			this.oChangeSpecificContent.fragment = oFragmentPathMultiple;
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});

			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting a change that failed on a js control tree with multiple root elements", function(assert) {
			assert.equal(this.oHBox.getItems().length, 1, "before the change there is only one child of the HBox");

			this.oChangeSpecificContent.fragment = oFragmentPathMultipleInvalid;
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});}, "then apply change throws an error");
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: JsControlTreeModifier});

			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
		});
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
			this.oHBox = this.oXmlView.childNodes[0];

			var oChangeJson = {
				selector: {
					id: "hbox",
					type: "sap.m.HBox"
				},
				changeType: "addXML",
				fileName: "addXMLChange"
			};

			this.oChangeSpecificContent = {
				fragment: oFragmentPath,
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach : function() {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree", function(assert) {
			var oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 1, "initially there is only one child of the HBox");
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});
			assert.equal(oHBoxItems.childNodes.length, 2, "after the addXML there are two children of the HBox");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.oChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid fragment", function(assert) {
			this.oChangeSpecificContent.fragment = "invalidFragment";
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid type", function(assert) {
			this.oChangeSpecificContent.fragment = oFragmentPathInvalid;
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			var oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 1, "before the change there is only one child of the HBox");

			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});

			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		// during processing of multiple root elements fragments in XML, we use HTMLNode.children,
		// which is not supported by phantomJS. Therefore we skip these tests in phantomJS.
		if (!sap.ui.Device.browser.phantomJS) {
			QUnit.test("When applying the change on a xml control tree with multiple root elements and one invalid type inside", function(assert) {
				var oHBoxItems = this.oHBox.childNodes[1];
				this.oChangeSpecificContent.fragment = oFragmentPathMultipleInvalid;
				this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
				assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
				assert.equal(oHBoxItems.childNodes.length, 1, "after the change there is still only 1 item in the hbox");
			});

			QUnit.test("When applying the change on a xml control tree with multiple root elements", function(assert) {
				var oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "initially there is only one child of the HBox");

				this.oChangeSpecificContent.fragment = oFragmentPathMultiple;
				this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
				this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});

				assert.equal(oHBoxItems.childNodes.length, 4, "after the change there are 4 items in the hbox");
				assert.equal(oHBoxItems.childNodes[1].id, "addXMLChange--button", "then the first button in the fragment has the correct index and ID");
				assert.equal(oHBoxItems.childNodes[2].id, "addXMLChange--button2", "then the second button in the fragment has the correct index and ID");
				assert.equal(oHBoxItems.childNodes[3].id, "addXMLChange--button3", "then the third button in the fragment has the correct index and ID");
			});

			QUnit.test("When reverting the change on an xml control tree with multiple root elements", function(assert) {
				var oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "before the change there is only one child of the HBox");

				this.oChangeSpecificContent.fragment = oFragmentPathMultiple;
				this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
				this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});
				this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});

				assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
				assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
			});

			QUnit.test("When reverting a failed change on an xml control tree with multiple root elements", function(assert) {
				var oHBoxItems = this.oHBox.childNodes[1];
				assert.equal(oHBoxItems.childNodes.length, 1, "before the change there is only one child of the HBox");

				this.oChangeSpecificContent.fragment = oFragmentPathMultipleInvalid;
				this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
				assert.throws(function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});}, "then apply change throws an error");
				this.oChangeHandler.revertChange(this.oChange, this.oHBox, {modifier: XmlTreeModifier, view: this.oXmlView, appComponent: this.oComponent});

				assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			});
		}
	});
});