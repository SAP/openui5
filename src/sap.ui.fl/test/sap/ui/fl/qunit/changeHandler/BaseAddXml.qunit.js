/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/BaseAddXml",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/m/HBox",
	"sap/m/Button"
], function(
	jQuery,
	BaseAddXml,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	HBox,
	Button
) {
	"use strict";

	var mPreloadedModules = {};

	var sFragmentPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/Fragment";
	mPreloadedModules[sFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="button" text="Hello World"></Button></core:FragmentDefinition>';
	var sFragmentInvalidTypePath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentInvalidType";
	mPreloadedModules[sFragmentInvalidTypePath] = '<ManagedObject xmlns="sap.ui.base" id="managedObject"></ManagedObject>';
	var sFragmentMultiplePath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentMultiple";
	mPreloadedModules[sFragmentMultiplePath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
		'<Button xmlns="sap.m" id="button1" text="Hello World"></Button>' +
		'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
		'<Button xmlns="sap.m" id="button3" text="Hello World"></Button>' +
		'</core:FragmentDefinition>';
	var sFragmentMultipleInvalidTypesPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentMultipleInvalidTypes";
	mPreloadedModules[sFragmentMultipleInvalidTypesPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:base="sap.ui.base">' +
		'<Button xmlns="sap.m" id="button" text="Hello World"></Button>' +
		'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
		'<base:ManagedObject id="managedObject"></base:ManagedObject>' +
		'</core:FragmentDefinition>';
	var sFragmentInvalidPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/FragmentInvalid";
	mPreloadedModules[sFragmentInvalidPath] = 'invalidFragment';
	var sNonExistingPath = "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/NonExisting";

	sap.ui.require.preload(mPreloadedModules);

	var sTypeError = "The content of the xml fragment does not match the type of the targetAggregation: ";
	var sWrongAggregationError = "The given Aggregation is not available in the given control: hbox";

	// the completeChangeContent function ignores the fragment property, but in applyChange we still need the information.
	// that's why we need to patch it in there before a change is applied.
	// in the code this is done in the command.


	QUnit.module("Given a BaseAddXml Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = BaseAddXml;
			this.oHBox = new HBox("hbox", {
				items: [this.oButton]
			});

			var oChangeJson = {
				reference: "sap.ui.fl.qunit.changeHander.BaseAddXml",
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
			this.oChangeDefinition = this.oChange.getDefinition();
			this.oChangeDefinition.content = {};
		},
		afterEach : function() {
			this.oHBox.destroy();
		}
	}, function() {
		QUnit.test("When calling 'completeChangeContent' with complete information", function(assert) {
			var oExpectedChangeContent = {
				fragmentPath: "fragments/Fragment"
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChangeDefinition);
			var oChangeDefinition = this.oChange.getDefinition();
			var oSpecificContent = oChangeDefinition.content;
			assert.deepEqual(oSpecificContent, oExpectedChangeContent, "then the change specific content is in the change, but the fragment not");
			assert.equal(this.oChange.getModuleName(), "sap/ui/fl/qunit/changeHander/BaseAddXml/changes/fragments/Fragment", "and the module name is set correct");
		});

		QUnit.test("When calling 'completeChangeContent' without complete information", function(assert) {
			this.oChangeSpecificContent.fragmentPath = null;
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChangeDefinition);},
				Error("Attribute missing from the change specific content'fragmentPath'"),
				"without fragmentPath 'completeChangeContent' throws an error"
			);
		});
	});

	QUnit.module("Given a BaseAddXml Change Handler with JSTreeModifier", {
		beforeEach : function () {
			// general modifier beforeEach (can be extracted as soon as nested modules are supported)
			this.oChangeHandler = BaseAddXml;

			this.sHBoxId = "hbox";

			var oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: "sap.ui.fl.qunit.changeHander.BaseAddXml",
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
			this.mChangeInfo = {
				aggregation: this.oChangeSpecificContent.targetAggregation,
				index: this.oChangeSpecificContent.index
			};

			this.oChange = new Change(oChangeJson);
			this.oChangeDefinition = this.oChange.getDefinition();
			this.oChangeDefinition.content = {};
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChangeDefinition);

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
			var mRevertData = {
				id: "projectId.button",
				aggregationName: "items"
			};
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			assert.equal(this.oHBox.getItems().length, 2, "after the change there are 2 items in the hbox");
			assert.equal(this.oHBox.getItems()[1].getId(), "projectId.button", "the fragments control id is prefixed with project id");
			assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.mChangeInfo.aggregation = "invalidAggregation";
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sWrongAggregationError),
				"then apply change throws an error"
			);
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements and one invalid type inside", function(assert) {
			this.oChange.setModuleName(sFragmentMultipleInvalidTypesPath);

			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sTypeError + this.sAggregationType),
				"then apply change throws an error"
			);

			assert.equal(this.oHBox.getItems().length, 1, "after the change there is still only 1 item in the hbox");
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);
			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting the change on a js control tree with multiple root elements", function(assert) {
			this.oChange.setModuleName(sFragmentMultiplePath);
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);

			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting a change that failed on a js control tree with multiple root elements", function(assert) {
			this.oChange.setModuleName(sFragmentMultipleInvalidTypesPath);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sTypeError + this.sAggregationType),
				"then apply change throws an error"
			);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);

			assert.equal(this.oHBox.getItems().length, 1, "after reversal there is again only one child of the HBox");
		});
	});

	QUnit.module("Given a BaseAddXml Change Handler with XMLTreeModifier", {
		beforeEach : function() {
			// general modifier beforeEach (can be extracted as soon as nested modules are supported)
			this.oChangeHandler = BaseAddXml;

			this.sHBoxId = "hbox";

			var oChangeJson = {
				moduleName: sFragmentPath,
				selector: {
					id: this.sHBoxId,
					type: "sap.m.HBox"
				},
				reference: "sap.ui.fl.qunit.changeHander.BaseAddXml",
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
			this.mChangeInfo = {
				aggregation: this.oChangeSpecificContent.targetAggregation,
				index: this.oChangeSpecificContent.index
			};

			this.oChange = new Change(oChangeJson);
			this.oChangeDefinition = this.oChange.getDefinition();
			this.oChangeDefinition.content = {};
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent, this.oChangeDefinition);

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
			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			assert.equal(oHBoxItems.childNodes.length, 2, "after the BaseAddXml there are two children of the HBox");
			assert.deepEqual(this.oChange.getRevertData(), [mRevertData], "then the revert data is build properly");
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.mChangeInfo.aggregation = "invalidAggregation";
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sWrongAggregationError),
				"then apply change throws an error"
			);
		});

		QUnit.test("When applying the change on a xml control tree with an invalid type", function(assert) {
			this.oChange.setModuleName(sFragmentInvalidTypePath);

			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sTypeError + this.sAggregationType),
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			var oHBoxItems = this.oHBox.childNodes[1];

			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);

			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When applying the change on a xml control tree with multiple root elements", function(assert) {
			this.oChange.setModuleName(sFragmentMultiplePath);

			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);

			var oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 4, "after the change there are 4 items in the hbox");
			assert.equal(oHBoxItems.childNodes[1].getAttribute("id"), "projectId.button1", "then the first button in the fragment has the correct index and ID");
			assert.equal(oHBoxItems.childNodes[2].getAttribute("id"), "projectId.button2", "then the second button in the fragment has the correct index and ID");
			assert.equal(oHBoxItems.childNodes[3].getAttribute("id"), "projectId.button3", "then the third button in the fragment has the correct index and ID");
		});

		QUnit.test("When applying the change on a xml control tree with multiple root elements and one invalid type inside", function(assert) {
			this.oChange.setModuleName(sFragmentMultipleInvalidTypesPath);

			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sTypeError + this.sAggregationType),
				"then apply change throws an error"
			);

			var oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 1, "after the change there is still only 1 item in the hbox");
		});

		QUnit.test("When reverting the change on an xml control tree with multiple root elements", function(assert) {
			this.oChange.setModuleName(sFragmentMultiplePath);

			this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);

			var oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
			assert.equal(this.oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting a failed change on an xml control tree with multiple root elements", function(assert) {
			this.oChange.setModuleName(sFragmentMultipleInvalidTypesPath);

			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				Error(sTypeError + this.sAggregationType),
				"then apply change throws an error"
			);
			this.oChangeHandler.revertChange(this.oChange, this.oHBox, this.oPropertyBag);

			var oHBoxItems = this.oHBox.childNodes[1];
			assert.equal(oHBoxItems.childNodes.length, 1, "after reversal there is again only one child of the HBox");
		});

		QUnit.test("When applying the change with a not found module", function(assert) {
			this.oChange.setModuleName(sNonExistingPath);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oHBox, this.oPropertyBag, this.mChangeInfo);},
				function(err) {
					var sErrorMessage = "Error: resource sap/ui/fl/qunit/changeHander/BaseAddXml/" +
						"changes/fragments/NonExisting could not be loaded from";
					return err.toString().indexOf(sErrorMessage) === 0;
				},
				"then apply change throws an error"
			);
		});
	});


	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
