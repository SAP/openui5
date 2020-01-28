/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/AddXML",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/m/HBox",
	"sap/m/Button"
], function(
	jQuery,
	AddXML,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	HBox,
	Button
) {
	"use strict";

	var mPreloadedModules = {};

	var sFragmentPath = "sap/ui/fl/qunit/changeHander/AddXML/changes/fragments/Fragment";
	mPreloadedModules[sFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="button" text="Hello World"></Button></core:FragmentDefinition>';

	sap.ui.require.preload(mPreloadedModules);

	var sWrongAggregationError = "The given Aggregation is not available in the given control: hbox";

	// the completeChangeContent function ignores the fragment property, but in applyChange we still need the information.
	// that's why we need to patch it in there before a change is applied.
	// in the code this is done in the command.


	QUnit.module("Given a AddXML Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = AddXML;
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});

			var oChangeJson = {
				reference: "sap.ui.fl.qunit.changeHander.AddXML",
				validAppVersions: {
					creation: "1.0.0"
				},
				selector: {
					id: this.oHBox.getId(),
					type: "sap.m.HBox"
				},
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment",
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
			var oExpectedChangeContent = {
				fragmentPath: "fragments/Fragment",
				targetAggregation: "items",
				index: 1
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			var oChangeDefinition = this.oChange.getDefinition();
			var oSpecificContent = oChangeDefinition.content;
			assert.deepEqual(oSpecificContent, oExpectedChangeContent, "then the change specific content is in the change, but the fragment not");
			assert.equal(this.oChange.getModuleName(), "sap/ui/fl/qunit/changeHander/AddXML/changes/fragments/Fragment", "and the module name is set correct");
		});

		QUnit.test("When calling 'completeChangeContent' without complete information", function(assert) {
			this.oChangeSpecificContent.targetAggregation = null;
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);},
				Error("Attribute missing from the change specific content'targetAggregation'"),
				"without targetAggregation 'completeChangeContent' throws an error"
			);

			this.oChangeSpecificContent.targetAggregation = "items";
			this.oChangeSpecificContent.fragmentPath = null;
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);},
				Error("Attribute missing from the change specific content'fragmentPath'"),
				"without fragmentPath 'completeChangeContent' throws an error"
			);

			this.oChangeSpecificContent.fragmentPath = "fragmentPath";
			this.oChangeSpecificContent.index = undefined;
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);},
				Error("Attribute missing from the change specific content'index'"),
				"without index 'completeChangeContent' throws an error"
			);
		});
	});

	QUnit.module("Given a AddXML Change Handler with JSTreeModifier", {
		beforeEach : function () {
			// general modifier beforeEach (can be extracted as soon as nested modules are supported)
			this.oChangeHandler = AddXML;

			this.sHBoxId = "hbox";

			var oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: "sap.ui.fl.qunit.changeHander.AddXML",
				validAppVersions: {
					creation: "1.0.0"
				},
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment",
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);

			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);

			// JSTreeModifier specific beforeEach
			this.oButton = new Button();
			this.oHBox = new HBox(this.sHBoxId, {
				items : [this.oButton]
			});
			this.sAggregationType = this.oHBox.getMetadata().getAggregation("items").type;
			this.oHBox.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oPropertyBag = {
				modifier : JsControlTreeModifier, view : {
					getController : function () {
					}, getId : function () {
					}
				}
			};
		},
		afterEach : function () {
			this.oHBox.destroy();
		}
	}, function () {
		QUnit.test("When applying the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag);
			assert.equal(this.oHBox.getItems().length, 2, "after the change there are 2 items in the hbox");
			assert.equal(this.oHBox.getItems()[1].getId(), "projectId.button", "the fragments control id is prefixed with project id");
			var mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.oChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag);},
				Error(sWrongAggregationError),
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);
			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});
	});

	QUnit.module("Given a AddXML Change Handler with XMLTreeModifier", {
		beforeEach : function() {
			// general modifier beforeEach (can be extracted as soon as nested modules are supported)
			this.oChangeHandler = AddXML;

			this.sHBoxId = "hbox";

			var oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: "sap.ui.fl.qunit.changeHander.AddXML",
				validAppVersions: {
					creation: "1.0.0"
				},
				changeType: "addXML",
				fileName: "addXMLChange",
				projectId: "projectId"
			};

			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment",
				targetAggregation: "items",
				index: 1
			};

			this.oChange = new Change(oChangeJson);

			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);

			// XMLTreeModifier specific beforeEach
			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				metadata: {
					manifest: "json"
				}
			});
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<HBox id="' + this.sHBoxId + '">' +
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
			this.sAggregationType = "sap.ui.core.Control";

			this.oPropertyBag = {
				modifier: XmlTreeModifier,
				view: this.oXmlView,
				appComponent: this.oComponent
			};
		},
		afterEach : function() {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree", function(assert) {
			var oHBoxItems = this.oHBox.childNodes[1];
			var mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag);
			assert.equal(oHBoxItems.childNodes.length, 2, "after the addXML there are two children of the HBox");
			assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.oChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag);},
				Error(sWrongAggregationError),
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			var oHBoxItems = this.oHBox.childNodes[1];

			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);

			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
