/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/sinon"
], function(
	jQuery,
	AddXMLAtExtensionPoint,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	ChangeRegistry,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var mPreloadedModules = {};
	var sFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/Fragment";
	mPreloadedModules[sFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="button" text="Hello World"></Button></core:FragmentDefinition>';
	var sSecondFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/SecondFragment";
	mPreloadedModules[sSecondFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="second_button" text="Second Button"></Button></core:FragmentDefinition>';
	var sThirdFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/ThirdFragment";
	mPreloadedModules[sThirdFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="third_button" text="Third Button"></Button></core:FragmentDefinition>';

	sap.ui.require.preload(mPreloadedModules);

	function _createXMLViewWithExtensionPoints() {
		var oXmlString =
			'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<HBox id="hbox">' +
					'<items>' +
						'<core:ExtensionPoint name="ExtensionPoint1" />' +
						'<Label id="label1" text="TestLabel" />' +
					'</items>' +
				'</HBox>' +
				'<Panel id="panel">' +
					'<content>' +
						'<core:ExtensionPoint name="ExtensionPoint2" />' +
						'<Label id="label2" text="Panel with stable id" />' +
						'<core:ExtensionPoint name="ExtensionPoint4">' +
							'<ListItem id="listItem1" text="Some Text" />' +
							'<ListItem id="listItem2" text="Some other Text" />' +
						'</core:ExtensionPoint>' +
					'</content>' +
				'</Panel>' +
				'<Panel>' +
					'<content>' +
						'<core:ExtensionPoint name="ExtensionPoint3" />' +
						'<Label id="label3" text="Panel without stable id" />' +
					'</content>' +
				'</Panel>' +
			'</mvc:View>';
		return jQuery.sap.parseXML(oXmlString, "application/xml").documentElement;
	}

	function _createAddXMLAtExtensionPointChange(sPath, sSelectorExtensionName, sProjectId) {
		var oChangeJson = {
			moduleName: sPath,
			reference: "sap.ui.fl.qunit.changeHander.AddXMLAtExtensionPoint",
			validAppVersions: {
				creation: "1.0.0"
			},
			selector: {
				name: sSelectorExtensionName || "extension",
				viewSelector: {
					id: "testComponent---myView",
					idIsLocal: false
				}
			},
			changeType: "addXMLAtExtensionPoint",
			fileName: "addXMLAtExtensionPointChange",
			projectId: sProjectId || "projectId"
		};
		var oChange = new Change(oChangeJson);
		return oChange;
	}

	QUnit.module("Given an AddXMLAtExtensionPoint Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = AddXMLAtExtensionPoint;
			this.sExtensionName = "extension";

			this.oChange = _createAddXMLAtExtensionPointChange(sFragmentPath, this.sExtensionName);
			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment"
			};
		},
		afterEach : function() {
			this.oChange.destroy();
		}
	}, function() {
		QUnit.test("when available", function (assert) {
			assert.ok(this.oChangeHandler.applyChange, "then applyChange function exists");
			assert.ok(this.oChangeHandler.revertChange, "then revertChange function exists");
			assert.ok(this.oChangeHandler.completeChangeContent, "then completeChangeContent function exists");
			var oChangeRegistryInstance = ChangeRegistry.getInstance();
			var sLayer = "VENDOR";
			oChangeRegistryInstance.initSettings();
			return oChangeRegistryInstance.getChangeHandler("addXMLAtExtensionPoint", "sap.ui.core.mvc.View", undefined, XmlTreeModifier, sLayer).then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, AddXMLAtExtensionPoint, "then changehandler is registered");
			});
		});

		QUnit.test("When calling 'completeChangeContent' with complete information", function(assert) {
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			var oChangeDefinition = this.oChange.getDefinition();
			var oSpecificContent = oChangeDefinition.content;
			assert.deepEqual(oSpecificContent, this.oChangeSpecificContent, "then the change specific content is in the change, but the fragment not");
			assert.equal(this.oChange.getModuleName(), "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/Fragment", "and the module name is set correct");
		});

		QUnit.test("When calling 'completeChangeContent' without fragmentPath", function(assert) {
			this.oChangeSpecificContent.fragmentPath = null;
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);},
				Error("Attribute missing from the change specific content'fragmentPath'"),
				"without fragmentPath 'completeChangeContent' throws an error"
			);
		});
	});

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with XmlTreeModifier", {
		beforeEach : function() {
			this.oChangeHandler = AddXMLAtExtensionPoint;
			this.oChange1 = _createAddXMLAtExtensionPointChange(sFragmentPath, "ExtensionPoint1");
			this.oChange2 = _createAddXMLAtExtensionPointChange(sSecondFragmentPath, "ExtensionPoint2");
			this.oChange3 = _createAddXMLAtExtensionPointChange(sThirdFragmentPath, "ExtensionPoint3");
			var oChangeSpecificContent1 = {
				fragmentPath: "fragments/Fragment"
			};
			var oChangeSpecificContent2 = {
				fragmentPath: "fragments/SecondFragment"
			};
			var oChangeSpecificContent3 = {
				fragmentPath: "fragments/ThirdFragment"
			};
			this.oChangeHandler.completeChangeContent(this.oChange1, oChangeSpecificContent1);
			this.oChangeHandler.completeChangeContent(this.oChange2, oChangeSpecificContent2);
			this.oChangeHandler.completeChangeContent(this.oChange3, oChangeSpecificContent3);

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				metadata: {
					manifest: "json"
				}
			});

			this.oXmlView = _createXMLViewWithExtensionPoints();
			this.oHBox = this.oXmlView.childNodes[0];
			this.oPanel = this.oXmlView.childNodes[1];
			this.oPanelWithoutStableId = this.oXmlView.childNodes[2];
			this.oPropertyBag = {
				modifier: XmlTreeModifier,
				view: this.oXmlView,
				appComponent: this.oComponent
			};
		},
		afterEach : function() {
			this.oChange1.destroy();
			this.oChange2.destroy();
			this.oComponent.destroy();
			delete this.oXmlView;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying changes on different extension points in xml control tree", function(assert) {
			var oChange3 = _createAddXMLAtExtensionPointChange(sSecondFragmentPath, "ExtensionPoint1");
			var oChangeSpecificContent3 = {
				fragmentPath: "fragments/ThirdFragment"
			};
			this.oChangeHandler.completeChangeContent(oChange3, oChangeSpecificContent3);
			var oHBoxItems = this.oHBox.childNodes[0];
			var oPanelContent = this.oPanel.childNodes[0];
			this.oChangeHandler.applyChange(this.oChange1, this.oHBox, this.oPropertyBag);
			this.oChangeHandler.applyChange(this.oChange2, this.oPanel, this.oPropertyBag);
			this.oChangeHandler.applyChange(oChange3, this.oHBox, this.oPropertyBag);
			assert.equal(oHBoxItems.childNodes.length, 4, "then there are four children of the HBox");
			assert.equal(oHBoxItems.childNodes[1].getAttribute('id'), "projectId.third_button", "then the control added last to the first extension point is on the first position behind the extension point.");
			assert.equal(oHBoxItems.childNodes[2].getAttribute('id'), "projectId.button", "then the control added first to the first extension point is on the last position behind the extension point.");
			assert.equal(oPanelContent.childNodes.length, 4, "then there are three children of the Panel");
			assert.equal(oPanelContent.childNodes[1].getAttribute('id'), "projectId.second_button", "then the control added to the second extension point is placed behind the second extension point.");
		});

		QUnit.test("When applying changes on extension point with default value in xml control tree", function(assert) {
			var oChange4 = _createAddXMLAtExtensionPointChange(sThirdFragmentPath, "ExtensionPoint4");
			var oChangeSpecificContent4 = {
				fragmentPath: "fragments/ThirdFragment"
			};
			this.oChangeHandler.completeChangeContent(oChange4, oChangeSpecificContent4);
			var oPanelContent = this.oPanel.childNodes[0];
			this.oChangeHandler.applyChange(oChange4, this.oPanel, this.oPropertyBag);
			assert.equal(oPanelContent.childNodes.length, 4, "then there are four children of the Panel");
			assert.equal(oPanelContent.childNodes[2].childNodes.length, 0, "then the fourth extension point should not have any default content anymore.");
			assert.equal(oPanelContent.childNodes[3].getAttribute('id'), "projectId.third_button", "then the control added to the fourth extension point is placed behind the fourth extension point.");
		});

		QUnit.test("When reverting one change on an xml control tree with stable Id on extension point parent", function(assert) {
			var oParent = this.oHBox;
			var oChange = this.oChange1;
			var oParentChildItems = oParent.childNodes[0];
			var mExpectedRevertData = [{
				id: "projectId.button",
				aggregationName: "items"
			}];

			this.oChangeHandler.applyChange(oChange, oParent, this.oPropertyBag);
			assert.equal(oParentChildItems.childNodes.length, 3, "after apply there are three children in the parent control");
			assert.equal(oParentChildItems.childNodes[1].getAttribute('id'), "projectId.button", "with the newly applied control on third position");
			assert.deepEqual(oChange.getRevertData(), mExpectedRevertData, "and the revert data is set");

			this.oChangeHandler.revertChange(oChange, oParent, this.oPropertyBag);
			assert.equal(oParentChildItems.childNodes.length, 2, "after reversal there are again just two children in the parent control");
			assert.equal(oParentChildItems.childNodes[1].getAttribute('id'), "label1", "with the label again on first position");
			assert.equal(oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When reverting one change on an xml control tree without stable Id on extension point parent", function(assert) {
			var oParent = this.oPanelWithoutStableId;
			var oChange = this.oChange3;
			var oParentChildItems = oParent.childNodes[0];
			var mExpectedRevertData = [{
				id: "projectId.third_button",
				aggregationName: "content"
			}];

			this.oChangeHandler.applyChange(oChange, oParent, this.oPropertyBag);
			assert.equal(oParentChildItems.childNodes.length, 3, "after apply there are three children in the parent control");
			assert.equal(oParentChildItems.childNodes[1].getAttribute('id'), "projectId.third_button", "with the newly applied control on third position");
			assert.deepEqual(oChange.getRevertData(), mExpectedRevertData, "and the revert data is set");

			this.oChangeHandler.revertChange(oChange, oParent, this.oPropertyBag);
			assert.equal(oParentChildItems.childNodes.length, 2, "after reversal there are again just two children in the parent control");
			assert.equal(oParentChildItems.childNodes[1].getAttribute('id'), "label3", "with the label again on first position");
			assert.equal(oChange.getRevertData(), undefined, "and the revert data got reset");
		});

		QUnit.test("When extensionpoint is not existing or multiple times available with the same name in the view", function(assert) {
			sandbox.stub(XmlTreeModifier, "getExtensionPointInfo").returns(undefined);
			assert.throws(
				function () { this.oChangeHandler.applyChange(this.oChange1, this.oHBox, this.oPropertyBag); },
				Error("AddXMLAtExtensionPoint-Error: Either no Extension-Point found by name 'ExtensionPoint1' "
				+ "or multiple Extension-Points available with the given name in the view (view.id='testComponent---myView'). "
				+ "Multiple Extension-points with the same name in one view are not supported!"),
				"then the changehandler throws an appropriate Error"
			);
		});
	});

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with JsControlTreeModifier", {
		beforeEach : function() {
			this.oChangeHandler = AddXMLAtExtensionPoint;
		},
		afterEach : function() {}
	}, function() {
		QUnit.test("When applying changes on different extension points with JsControlTreeModifier ", function(assert) {
			var oChange1 = _createAddXMLAtExtensionPointChange(sFragmentPath, "ExtensionPoint1");
			assert.throws(
				function() { this.oChangeHandler.applyChange(oChange1, undefined, { modifier: JsControlTreeModifier }); },
				Error("Changes with type " + oChange1.getChangeType() + " are not supported on js"),
				"then the ChangeHandler throws an error. AddXmlAtExtensionPoint changes are not possible with JsControlTreeModifier."
			);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});