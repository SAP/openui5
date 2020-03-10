/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	XMLView,
	AddXMLAtExtensionPoint,
	Change,
	Layer,
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
	var sFourthFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/FourthFragment";
	mPreloadedModules[sFourthFragmentPath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Button xmlns="sap.m" id="fourth_button" text="Fourth Button"></Button></core:FragmentDefinition>';

	sap.ui.require.preload(mPreloadedModules);

	var sXmlString =
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
						'<Label id="ep4-label1" text="Extension point label1 - default content" />' +
						'<Label id="ep4-label2" text="Extension point label2 - default content" />' +
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

	function _createXMLViewWithExtensionPoints() {
		return jQuery.sap.parseXML(sXmlString, "application/xml").documentElement;
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

	function _createAndCompleteAddXmlAtExtensionPointChange(sPath, sFragmentPath, sSelectorExtensionName, sProjectId) {
		var oChange = _createAddXMLAtExtensionPointChange(sPath, sSelectorExtensionName, sProjectId);
		var oChangeSpecificContent1 = {
			fragmentPath: sFragmentPath
		};
		this.oChangeHandler.completeChangeContent(oChange, oChangeSpecificContent1);
		return oChange;
	}

	function _createComponent() {
		return sap.ui.getCore().createComponent({
			name: "testComponent",
			id: "testComponent",
			metadata: {
				manifest: "json"
			}
		});
	}

	function _createAsyncView(sViewName) {
		return XMLView.create({
			id: sViewName,
			definition: sXmlString,
			async: true
		});
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
			var sLayer = Layer.VENDOR;
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
			this.oChange1 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			this.oChange2 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sSecondFragmentPath, "fragments/SecondFragment", "ExtensionPoint2");
			this.oChange3 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sThirdFragmentPath, "fragments/ThirdFragment", "ExtensionPoint3");

			this.oComponent = _createComponent();
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
			this.oChange3.destroy();
			this.oComponent.destroy();
			delete this.oXmlView;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying changes on different extension points in xml control tree - apply scenario", function(assert) {
			var oChange3 = _createAddXMLAtExtensionPointChange(sThirdFragmentPath, "ExtensionPoint1");
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
			assert.notOk(oChange.hasRevertData(), "and the revert data got reset");
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

		QUnit.test("When extension point is not existing or multiple times available with the same name in the view", function(assert) {
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

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with JsControlTreeModifier - create scenario", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oChangeHandler = AddXMLAtExtensionPoint;
			this.oComponent = _createComponent();
			_createAsyncView("myView").then(function (oXmlView) {
				this.oXmlView = oXmlView;
				this.oPropertyBag = {
					modifier: JsControlTreeModifier,
					view: oXmlView,
					appComponent: this.oComponent
				};
				this.oHBox = oXmlView.getContent()[0];
				this.oPanel = oXmlView.getContent()[1];
				this.oPanelWithoutStableId = oXmlView.getContent()[2];
				oXmlView.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When applying changes on different extension points", function(assert) {
			var oChange1 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			var oChange2 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sSecondFragmentPath, "fragments/SecondFragment", "ExtensionPoint2");
			// var oChange3 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFourthFragmentPath, "fragments/FourthFragment", "ExtensionPoint4");
			var oChange4 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sThirdFragmentPath, "fragments/ThirdFragment", "ExtensionPoint1");
			this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag);
			this.oChangeHandler.applyChange(oChange2, this.oPanel, this.oPropertyBag);
			// this.oChangeHandler.applyChange(oChange3, this.oPanel, this.oPropertyBag);
			this.oChangeHandler.applyChange(oChange4, this.oHBox, this.oPropertyBag);
			var aHBoxItems = this.oHBox.getItems();
			var aPanelContent = this.oPanel.getContent();
			assert.equal(aHBoxItems.length, 3, "then there are three children of the HBox");
			assert.equal(aHBoxItems[0].getId(), "myView--projectId.third_button", "then the control added last to the first extension point is on the first position behind the extension point.");
			assert.equal(aHBoxItems[1].getId(), "myView--projectId.button", "then the control added first to the first extension point is on the last position behind the extension point.");
			assert.equal(aPanelContent.length, 4, "then there are four children of the Panel");
			assert.equal(aPanelContent[0].getId(), "myView--projectId.second_button", "then the control added to the second extension point is placed behind the second extension point.");
			assert.equal(aPanelContent[1].getId(), "myView--label2", "then the control label is now on the second position.");
			// assert.equal(aPanelContent[2].getId(), "myView--projectId.fourth_button", "then the control added to the fourth extension point is placed behind the fourth extension poin.");
		});

		QUnit.test("When applying changes on extension point with default value", function(assert) {
			var oChange3 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFourthFragmentPath, "fragments/FourthFragment", "ExtensionPoint4");
			this.oChangeHandler.applyChange(oChange3, this.oPanel, this.oPropertyBag);
			var aPanelContent = this.oPanel.getContent();
			assert.equal(aPanelContent.length, 2, "then there are two children of the Panel");
			assert.equal(aPanelContent[0].getId(), "myView--label2", "then the label is still on the first position.");
			assert.equal(aPanelContent[1].getId(), "myView--projectId.fourth_button", "then the control added to the second extension point is placed behind the fourth extension point.");
		});

		QUnit.test("When reverting one change with stable Id on extension point parent", function(assert) {
			var mExpectedRevertData = [{
				id: "myView--projectId.button",
				aggregationName: "items"
			}];
			var oChange1 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag);
			var aHBoxItems = this.oHBox.getItems();
			assert.equal(aHBoxItems.length, 2, "then there are two children of the HBox");
			assert.equal(aHBoxItems[0].getId(), "myView--projectId.button", "then the button is added to the first extension point");
			assert.deepEqual(oChange1.getRevertData(), mExpectedRevertData, "and the revert data is available");

			this.oChangeHandler.revertChange(oChange1, this.oHBox, this.oPropertyBag);
			aHBoxItems = this.oHBox.getItems();
			assert.equal(aHBoxItems.length, 1, "after reversal there are again just one child in the parent control");
			assert.equal(aHBoxItems[0].getId(), "myView--label1", "with the label again on first position");
			assert.notOk(oChange1.hasRevertData(), "and the revert data got reset");
		});

		QUnit.test("When reverting one change without stable Id on extension point parent", function(assert) {
			var mExpectedRevertData = [{
				id: "myView--projectId.button",
				aggregationName: "content"
			}];
			var oChange1 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint3");
			this.oChangeHandler.applyChange(oChange1, this.oPanelWithoutStableId, this.oPropertyBag);
			var aPanelContent = this.oPanelWithoutStableId.getContent();
			assert.equal(aPanelContent.length, 2, "then there are two children in the panel");
			assert.equal(aPanelContent[0].getId(), "myView--projectId.button", "then the button is added to the first extension point");
			assert.deepEqual(oChange1.getRevertData(), mExpectedRevertData, "and the revert data is available");

			this.oChangeHandler.revertChange(oChange1, this.oPanelWithoutStableId, this.oPropertyBag);
			aPanelContent = this.oPanelWithoutStableId.getContent();
			assert.equal(aPanelContent.length, 1, "after reversal there are again just one child in the parent control");
			assert.equal(aPanelContent[0].getId(), "myView--label3", "with the label again on first position");
			assert.notOk(oChange1.hasRevertData(), "and the revert data got reset");
		});

		QUnit.test("When extensionpoint is not existing or multiple times available with the same name in the view", function(assert) {
			var oChange1 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			sandbox.stub(JsControlTreeModifier, "getExtensionPointInfo").returns(undefined);
			assert.throws(
				function () { this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag); },
				Error("AddXMLAtExtensionPoint-Error: Either no Extension-Point found by name 'ExtensionPoint1' "
				+ "or multiple Extension-Points available with the given name in the view (view.id='" + this.oXmlView.getId() + "'). "
				+ "Multiple Extension-points with the same name in one view are not supported!"),
				"then the changehandler throws an appropriate Error"
			);
		});
	});

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with JsControlTreeModifier - apply scenario", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oChangeHandler = AddXMLAtExtensionPoint;
			this.oComponent = _createComponent();
			_createAsyncView("myView").then(function (oXmlView) {
				this.oXmlView = oXmlView;
				this.oPropertyBag = {
					modifier: JsControlTreeModifier,
					view: oXmlView,
					appComponent: this.oComponent
				};
				this.oHBox = oXmlView.getContent()[0];
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When create and apply change with extension point information", function(assert) {
			var oChange1 = _createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			var oReadyStub = sandbox.stub();
			var oCreateDefaultStub = sandbox.stub();
			var oGetExtensionPointInfoSpy = sandbox.spy(JsControlTreeModifier, "getExtensionPointInfo");
			oChange1.getExtensionPointInfo = function () {
				return {
					view: this.oXmlView,
					name: "ExtensionPoint1",
					targetControl: this.oHBox,
					aggregationName: "items",
					index: 0,
					ready: oReadyStub,
					createDefault: oCreateDefaultStub
				};
			}.bind(this);
			this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag);
			var aHBoxItems = this.oHBox.getItems();
			assert.equal(aHBoxItems.length, 2, "then there are two children of the HBox");
			assert.equal(aHBoxItems[0].getId(), "myView--projectId.button", "then the control added to the first extension point is on the first position.");
			assert.equal(aHBoxItems[1].getId(), "myView--label1", "then the control label positioned second.");
			assert.notOk(oGetExtensionPointInfoSpy.called, "then the modifier.getExtensionPointInfo function is not called");
			assert.ok(oReadyStub.called, "then the ready function of extension point is called.");
			assert.equal(oReadyStub.firstCall.args[0][0].getId(), aHBoxItems[0].getId(), "then the added button is passed to the ready function.");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});