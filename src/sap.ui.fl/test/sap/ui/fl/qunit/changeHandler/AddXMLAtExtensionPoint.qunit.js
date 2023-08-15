/* global QUnit */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/changeHandler/AddXMLAtExtensionPoint",
	"sap/ui/fl/write/api/ExtensionPointRegistryAPI",
	"sap/ui/util/XMLHelper",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	Core,
	XMLView,
	JsControlTreeModifier,
	XmlTreeModifier,
	FlexObjectFactory,
	AddXMLAtExtensionPoint,
	ExtensionPointRegistryAPI,
	XMLHelper,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var mPreloadedModules = {};
	var sFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/Fragment";
	mPreloadedModules[sFragmentPath] =
		"<core:FragmentDefinition xmlns='sap.m' xmlns:core='sap.ui.core'>" +
			"<Button xmlns='sap.m' id='button' text='Hello World'/>" +
			"<Button xmlns='sap.m' id='button2' text='Second Button of the first fragment'/>" +
		"</core:FragmentDefinition>";
	var sSecondFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/SecondFragment";
	mPreloadedModules[sSecondFragmentPath] =
		"<core:FragmentDefinition xmlns='sap.m' xmlns:core='sap.ui.core'>" +
			"<Button xmlns='sap.m' id='second_button' text='Second Button' />" +
		"</core:FragmentDefinition>";
	var sThirdFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/ThirdFragment";
	mPreloadedModules[sThirdFragmentPath] =
		"<core:FragmentDefinition xmlns='sap.m' xmlns:core='sap.ui.core'>" +
			"<Button xmlns='sap.m' id='third_button' text='Third Button'/>" +
		"</core:FragmentDefinition>";
	var sFourthFragmentPath = "sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/FourthFragment";
	mPreloadedModules[sFourthFragmentPath] =
		"<core:FragmentDefinition xmlns='sap.m' xmlns:core='sap.ui.core'>" +
			"<Button xmlns='sap.m' id='fourth_button' text='Fourth Button'/>" +
		"</core:FragmentDefinition>";

	sap.ui.require.preload(mPreloadedModules);

	var sXmlString =
		'<mvc:View id="testComponentAsync---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
			'<HBox id="hbox">' +
				"<items>" +
					'<core:ExtensionPoint name="ExtensionPoint1" />' +
					'<Label id="label1" text="TestLabel" />' +
				"</items>" +
			"</HBox>" +
			'<Panel id="panel">' +
				"<content>" +
					'<core:ExtensionPoint name="ExtensionPoint2" />' +
					'<Label id="label2" text="Panel with stable id" />' +
					'<core:ExtensionPoint name="ExtensionPoint4">' +
						'<Label id="ep4-label1" text="Extension point label1 - default content" />' +
						'<Label id="ep4-label2" text="Extension point label2 - default content" />' +
					"</core:ExtensionPoint>" +
				"</content>" +
			"</Panel>" +
			"<Panel>" +
				"<content>" +
					'<core:ExtensionPoint name="ExtensionPoint3" />' +
					'<Label id="label3" text="Panel without stable id" />' +
				"</content>" +
			"</Panel>" +
		"</mvc:View>";

	function createXMLViewWithExtensionPoints() {
		return XMLHelper.parse(sXmlString, "application/xml").documentElement;
	}

	function createAddXMLAtExtensionPointChange(sPath, sSelectorExtensionName, sProjectId) {
		var oChangeJson = {
			moduleName: sPath,
			reference: "sap.ui.fl.qunit.changeHander.AddXMLAtExtensionPoint",
			selector: {
				name: sSelectorExtensionName || "extension",
				viewSelector: {
					id: "testComponentAsync---myView",
					idIsLocal: false
				}
			},
			changeType: "addXMLAtExtensionPoint",
			fileName: "addXMLAtExtensionPointChange",
			projectId: sProjectId || "projectId"
		};
		var oChange = FlexObjectFactory.createFromFileContent(oChangeJson);
		return oChange;
	}

	function createAndCompleteAddXmlAtExtensionPointChange(sPath, sFragmentPath, sSelectorExtensionName, sProjectId) {
		var oChange = createAddXMLAtExtensionPointChange(sPath, sSelectorExtensionName, sProjectId);
		var oChangeSpecificContent1 = {
			fragmentPath: sFragmentPath
		};
		this.oChangeHandler.completeChangeContent(oChange, oChangeSpecificContent1);
		return oChange;
	}

	function createComponent() {
		return Component.create({
			name: "testComponentAsync",
			id: "testComponentAsync"
		});
	}

	function createAsyncView(sViewName, oComponent) {
		return oComponent.runAsOwner(function() {
			return XMLView.create({
				id: sViewName,
				definition: sXmlString,
				async: true
			});
		});
	}

	QUnit.module("Given an AddXMLAtExtensionPoint Change Handler", {
		beforeEach: function() {
			this.oChangeHandler = AddXMLAtExtensionPoint;
			this.sExtensionName = "extension";

			this.oChange = createAddXMLAtExtensionPointChange(sFragmentPath, this.sExtensionName);
			this.oChangeSpecificContent = {
				fragmentPath: "fragments/Fragment"
			};
		},
		afterEach: function() {
			this.oChange.destroy();
		}
	}, function() {
		QUnit.test("when available", function(assert) {
			assert.ok(this.oChangeHandler.applyChange, "then applyChange function exists");
			assert.ok(this.oChangeHandler.revertChange, "then revertChange function exists");
			assert.ok(this.oChangeHandler.completeChangeContent, "then completeChangeContent function exists");
		});

		QUnit.test("When calling 'completeChangeContent' with complete information", function(assert) {
			this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);
			assert.deepEqual(
				this.oChange.getContent(),
				this.oChangeSpecificContent,
				"then the change specific content is in the change, but the fragment not"
			);
			assert.equal(
				this.oChange.getFlexObjectMetadata().moduleName,
				"sap/ui/fl/qunit/changeHander/AddXMLAtExtensionPoint/changes/fragments/Fragment",
				"and the module name is set correct"
			);
		});

		QUnit.test("When calling 'completeChangeContent' without fragmentPath", function(assert) {
			this.oChangeSpecificContent.fragmentPath = null;
			assert.throws(
				function() {this.oChangeHandler.completeChangeContent(this.oChange, this.oChangeSpecificContent);},
				Error("Attribute missing from the change specific content 'fragmentPath'"),
				"without fragmentPath 'completeChangeContent' throws an error"
			);
		});
	});

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with XmlTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = AddXMLAtExtensionPoint;
			this.oChange1 = createAndCompleteAddXmlAtExtensionPointChange.call(
				this,
				sFragmentPath,
				"fragments/Fragment",
				"ExtensionPoint1"
			);
			this.oChange2 = createAndCompleteAddXmlAtExtensionPointChange.call(
				this,
				sSecondFragmentPath,
				"fragments/SecondFragment",
				"ExtensionPoint2"
			);
			this.oChange3 = createAndCompleteAddXmlAtExtensionPointChange.call(
				this,
				sThirdFragmentPath,
				"fragments/ThirdFragment",
				"ExtensionPoint3"
			);

			return createComponent().then(function(oComponent) {
				this.oComponent = oComponent;
				this.oXmlView = createXMLViewWithExtensionPoints();
				this.oHBox = this.oXmlView.childNodes[0];
				this.oPanel = this.oXmlView.childNodes[1];
				this.oPanelWithoutStableId = this.oXmlView.childNodes[2];
				this.oPropertyBag = {
					modifier: XmlTreeModifier,
					view: this.oXmlView,
					appComponent: this.oComponent
				};
			}.bind(this));
		},
		afterEach: function() {
			this.oChange1.destroy();
			this.oChange2.destroy();
			this.oChange3.destroy();
			this.oComponent.destroy();
			delete this.oXmlView;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying changes on different extension points in xml control tree - apply scenario", function(assert) {
			var oInsertAggregationSpy = sandbox.spy(XmlTreeModifier, "insertAggregation");
			var oAddCreatedControlsToExtensionPointInfoSpy = sandbox.spy(
				ExtensionPointRegistryAPI,
				"addCreatedControlsToExtensionPointInfo"
			);
			var oChange3 = createAddXMLAtExtensionPointChange(sThirdFragmentPath, "ExtensionPoint1");
			var oChangeSpecificContent3 = {
				fragmentPath: "fragments/ThirdFragment"
			};
			this.oChangeHandler.completeChangeContent(oChange3, oChangeSpecificContent3);
			var oHBoxItems = this.oHBox.childNodes[0];
			var oPanelContent = this.oPanel.childNodes[0];
			return this.oChangeHandler.applyChange(this.oChange1, this.oHBox, this.oPropertyBag)
			.then(this.oChangeHandler.applyChange.bind(this.oChangeHandler, this.oChange2, this.oPanel, this.oPropertyBag))
			.then(this.oChangeHandler.applyChange.bind(this.oChangeHandler, oChange3, this.oHBox, this.oPropertyBag))
			.then(function() {
				assert.ok(oInsertAggregationSpy.args[0][5], "insertAggregation is called with bSkipAdjustIndex equal true");
				assert.ok(oInsertAggregationSpy.args[1][5], "insertAggregation is called with bSkipAdjustIndex equal true");
				assert.ok(oInsertAggregationSpy.args[2][5], "insertAggregation is called with bSkipAdjustIndex equal true");
				assert.equal(oHBoxItems.childNodes.length, 5, "then there are five children of the HBox");
				assert.equal(
					oHBoxItems.childNodes[1].getAttribute("id"),
					"projectId.third_button",
					"then the control added last to the first extension point is on the first position behind the extension point."
				);
				assert.equal(
					oHBoxItems.childNodes[2].getAttribute("id"),
					"projectId.button",
					"then the control added first to the first extension point is on the last position behind the extension point."
				);
				assert.equal(oPanelContent.childNodes.length, 4, "then there are four children of the Panel");
				assert.equal(
					oPanelContent.childNodes[1].getAttribute("id"),
					"projectId.second_button",
					"then the control added to the second extension point is placed behind the second extension point."
				);
				assert.ok(
					oAddCreatedControlsToExtensionPointInfoSpy.calledWith({
						name: "ExtensionPoint1",
						viewId: "testComponentAsync---myView",
						createdControlsIds: ["projectId.button", "projectId.button2"]
					}),
					"then the created controls from the first change are added to the Extension Point Info on the registry"
				);
				assert.ok(
					oAddCreatedControlsToExtensionPointInfoSpy.calledWith({
						name: "ExtensionPoint2",
						viewId: "testComponentAsync---myView",
						createdControlsIds: ["projectId.second_button"]
					}),
					"then the created controls from the second change are added to the Extension Point Info on the registry"
				);
				assert.ok(
					oAddCreatedControlsToExtensionPointInfoSpy.calledWith({
						name: "ExtensionPoint1",
						viewId: "testComponentAsync---myView",
						createdControlsIds: ["projectId.third_button"]
					}),
					"then the created controls from the third change are added to the Extension Point Info on the registry"
				);
			});
		});

		QUnit.test("When applying changes on extension point with default value in xml control tree", function(assert) {
			var oChange4 = createAddXMLAtExtensionPointChange(sThirdFragmentPath, "ExtensionPoint4");
			var oChangeSpecificContent4 = {
				fragmentPath: "fragments/ThirdFragment"
			};
			this.oChangeHandler.completeChangeContent(oChange4, oChangeSpecificContent4);
			var oPanelContent = this.oPanel.childNodes[0];
			return this.oChangeHandler.applyChange(oChange4, this.oPanel, this.oPropertyBag)
			.then(function() {
				assert.equal(oPanelContent.childNodes.length, 4, "then there are four children of the Panel");
				assert.equal(
					oPanelContent.childNodes[2].childNodes.length,
					0,
					"then the fourth extension point should not have any default content anymore."
				);
				assert.equal(
					oPanelContent.childNodes[3].getAttribute("id"),
					"projectId.third_button",
					"then the control added to the fourth extension point is placed behind the fourth extension point."
				);
			});
		});

		QUnit.test("When reverting one change on an xml control tree with stable Id on extension point parent", function(assert) {
			var oParent = this.oHBox;
			var oChange = this.oChange1;
			var oParentChildItems = oParent.childNodes[0];
			var mExpectedRevertData = [{
				id: "projectId.button",
				aggregationName: "items"
			}, {
				id: "projectId.button2",
				aggregationName: "items"
			}];

			return this.oChangeHandler.applyChange(oChange, oParent, this.oPropertyBag)
			.then(function() {
				assert.equal(oParentChildItems.childNodes.length, 4, "after apply there are four children in the parent control");
				assert.equal(
					oParentChildItems.childNodes[1].getAttribute("id"),
					"projectId.button",
					"with the newly applied control on third position"
				);
				assert.deepEqual(oChange.getRevertData(), mExpectedRevertData, "and the revert data is set");
				return this.oChangeHandler.revertChange(oChange, oParent, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				assert.equal(
					oParentChildItems.childNodes.length,
					2,
					"after reversal there are again just two children in the parent control"
				);
				assert.equal(oParentChildItems.childNodes[1].getAttribute("id"), "label1", "with the label again on first position");
				assert.notOk(oChange.hasRevertData(), "and the revert data got reset");
			});
		});

		QUnit.test("When reverting one change on an xml control tree without stable Id on extension point parent", function(assert) {
			var oParent = this.oPanelWithoutStableId;
			var oChange = this.oChange3;
			var oParentChildItems = oParent.childNodes[0];
			var mExpectedRevertData = [{
				id: "projectId.third_button",
				aggregationName: "content"
			}];

			return this.oChangeHandler.applyChange(oChange, oParent, this.oPropertyBag)
			.then(function() {
				assert.equal(oParentChildItems.childNodes.length, 3, "after apply there are three children in the parent control");
				assert.equal(
					oParentChildItems.childNodes[1].getAttribute("id"),
					"projectId.third_button",
					"with the newly applied control on third position"
				);
				assert.deepEqual(oChange.getRevertData(), mExpectedRevertData, "and the revert data is set");
				return this.oChangeHandler.revertChange(oChange, oParent, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				assert.equal(
					oParentChildItems.childNodes.length,
					2,
					"after reversal there are again just two children in the parent control"
				);
				assert.equal(oParentChildItems.childNodes[1].getAttribute("id"), "label3", "with the label again on first position");
				assert.equal(oChange.getRevertData(), undefined, "and the revert data got reset");
			});
		});

		QUnit.test("When extension point is not existing or multiple times available with the same name in the view", function(assert) {
			sandbox.stub(XmlTreeModifier, "getExtensionPointInfo").returns(undefined);

			return this.oChangeHandler.applyChange(this.oChange1, this.oHBox, this.oPropertyBag)
			.catch(function(oError) {
				var sError = "AddXMLAtExtensionPoint-Error: Either no Extension-Point found by name 'ExtensionPoint1' "
						+ "or multiple Extension-Points available with the given name in the view (view.id='testComponentAsync---myView'). "
						+ "Multiple Extension-points with the same name in one view are not supported!";
				assert.equal(oError.message, sError, "then the changehandler throws an appropriate Error");
			});
		});
	});

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with JsControlTreeModifier - create scenario", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.oChangeHandler = AddXMLAtExtensionPoint;
			return createComponent()
			.then(function(oComponent) {
				this.oComponent = oComponent;
				return oComponent;
			}.bind(this))
			.then(createAsyncView.bind(undefined, "myView2"))
			.then(function(oXmlView) {
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
				Core.applyChanges();
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			this.oXmlView.destroy();
			sandbox.restore();
			return this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When applying changes on different extension points", function(assert) {
			var oChange1 = createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			var oChange2 = createAndCompleteAddXmlAtExtensionPointChange.call(
				this,
				sSecondFragmentPath,
				"fragments/SecondFragment",
				"ExtensionPoint2"
			);
			var oChange4 = createAndCompleteAddXmlAtExtensionPointChange.call(
				this,
				sThirdFragmentPath,
				"fragments/ThirdFragment",
				"ExtensionPoint1"
			);

			var oAddCreatedControlsToExtensionPointInfoSpy = sandbox.spy(
				ExtensionPointRegistryAPI,
				"addCreatedControlsToExtensionPointInfo"
			);

			return this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag)
			.then(this.oChangeHandler.applyChange.bind(this.oChangeHandler, oChange2, this.oPanel, this.oPropertyBag))
			.then(this.oChangeHandler.applyChange.bind(this.oChangeHandler, oChange4, this.oHBox, this.oPropertyBag))
			.then(function() {
				var aHBoxItems = this.oHBox.getItems();
				var aPanelContent = this.oPanel.getContent();
				assert.equal(aHBoxItems.length, 4, "then there are four children of the HBox");
				assert.equal(
					aHBoxItems[0].getId(),
					"myView2--projectId.third_button",
					 "then the control added last to the first extension point is on the first position behind the extension point."
				);
				assert.equal(
					aHBoxItems[1].getId(),
					"myView2--projectId.button",
					"then the control added first to the first extension point is on the last position behind the extension point."
				);
				assert.equal(aPanelContent.length, 4, "then there are four children of the Panel");
				assert.equal(
					aPanelContent[0].getId(),
					"myView2--projectId.second_button",
					"then the control added to the second extension point is placed behind the second extension point."
				);
				assert.equal(aPanelContent[1].getId(), "myView2--label2", "then the control label is now on the second position.");
				assert.ok(
					oAddCreatedControlsToExtensionPointInfoSpy.calledWith({
						name: "ExtensionPoint1",
						viewId: "myView2",
						createdControlsIds: ["myView2--projectId.button", "myView2--projectId.button2"]
					}),
					"then the created controls from the first change are added to the Extension Point Info on the registry"
				);
				assert.ok(
					oAddCreatedControlsToExtensionPointInfoSpy.calledWith({
						name: "ExtensionPoint2",
						viewId: "myView2",
						createdControlsIds: ["myView2--projectId.second_button"]
					}),
					"then the created controls from the second change are added to the Extension Point Info on the registry"
				);
				assert.ok(
					oAddCreatedControlsToExtensionPointInfoSpy.calledWith({
						name: "ExtensionPoint1",
						viewId: "myView2",
						createdControlsIds: ["myView2--projectId.third_button"]
					}),
					"then the created controls from the third change are added to the Extension Point Info on the registry"
				);
			}.bind(this));
		});

		QUnit.test("When applying changes on extension point with default value", function(assert) {
			var oChange3 = createAndCompleteAddXmlAtExtensionPointChange.call(
				this, sFourthFragmentPath,
				"fragments/FourthFragment",
				"ExtensionPoint4"
			);
			return this.oChangeHandler.applyChange(oChange3, this.oPanel, this.oPropertyBag)
			.then(function() {
				var aPanelContent = this.oPanel.getContent();
				assert.equal(aPanelContent.length, 2, "then there are two children of the Panel");
				assert.equal(aPanelContent[0].getId(), "myView2--label2", "then the label is still on the first position.");
				assert.equal(
					aPanelContent[1].getId(),
					"myView2--projectId.fourth_button",
					"then the control added to the second extension point is placed behind the fourth extension point."
				);
			}.bind(this));
		});

		QUnit.test("When reverting one change with stable Id on extension point parent", function(assert) {
			var mExpectedRevertData = [{
				id: "myView2--projectId.button",
				aggregationName: "items"
			}, {
				id: "myView2--projectId.button2",
				aggregationName: "items"
			}];
			var oChange1 = createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			return this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag)
			.then(function() {
				var aHBoxItems = this.oHBox.getItems();
				assert.equal(aHBoxItems.length, 3, "then there are three children of the HBox");
				assert.equal(aHBoxItems[0].getId(), "myView2--projectId.button", "then the button is added to the first extension point");
				assert.deepEqual(oChange1.getRevertData(), mExpectedRevertData, "and the revert data is available");
				return this.oChangeHandler.revertChange(oChange1, this.oHBox, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				var aHBoxItems = this.oHBox.getItems();
				assert.equal(aHBoxItems.length, 1, "after reversal there are again just one child in the parent control");
				assert.equal(aHBoxItems[0].getId(), "myView2--label1", "with the label again on first position");
				assert.notOk(oChange1.hasRevertData(), "and the revert data got reset");
			}.bind(this));
		});

		QUnit.test("When reverting one change without stable Id on extension point parent", function(assert) {
			var mExpectedRevertData = [{
				id: "myView2--projectId.button",
				aggregationName: "content"
			}, {
				id: "myView2--projectId.button2",
				aggregationName: "content"
			}];
			var oChange1 = createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint3");
			return this.oChangeHandler.applyChange(oChange1, this.oPanelWithoutStableId, this.oPropertyBag)
			.then(function() {
				var aPanelContent = this.oPanelWithoutStableId.getContent();
				assert.equal(aPanelContent.length, 3, "then there are three children in the panel");
				assert.equal(
					aPanelContent[0].getId(),
					"myView2--projectId.button",
					"then the button is added to the first extension point"
				);
				assert.deepEqual(oChange1.getRevertData(), mExpectedRevertData, "and the revert data is available");
				return this.oChangeHandler.revertChange(oChange1, this.oPanelWithoutStableId, this.oPropertyBag);
			}.bind(this))
			.then(function() {
				var aPanelContent = this.oPanelWithoutStableId.getContent();
				assert.equal(aPanelContent.length, 1, "after reversal there are again just one child in the parent control");
				assert.equal(aPanelContent[0].getId(), "myView2--label3", "with the label again on first position");
				assert.notOk(oChange1.hasRevertData(), "and the revert data got reset");
			}.bind(this));
		});

		QUnit.test("When extensionpoint is not existing or multiple times available with the same name in the view", function(assert) {
			var oChange1 = createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint1");
			sandbox.stub(JsControlTreeModifier, "getExtensionPointInfo").returns(undefined);
			return this.oChangeHandler.applyChange(oChange1, this.oHBox, this.oPropertyBag)
			.catch(function(oError) {
				var sErrorText = `AddXMLAtExtensionPoint-Error: Either no Extension-Point found by name 'ExtensionPoint1' `
						+ `or multiple Extension-Points available with the given name in the view (view.id='${this.oXmlView.getId()}'). `
						+ `Multiple Extension-points with the same name in one view are not supported!`;
				assert.equal(oError.message, sErrorText, "then the changehandler throws an appropriate Error");
			}.bind(this));
		});
	});

	QUnit.module("Given a AddXMLAtExtensionPoint Change Handler with JsControlTreeModifier - apply scenario", {
		beforeEach: function() {
			this.oChangeHandler = AddXMLAtExtensionPoint;
			return createComponent()
			.then(function(oComponent) {
				this.oComponent = oComponent;
				return oComponent;
			}.bind(this))
			.then(createAsyncView.bind(undefined, "myView2"))
			.then(function(oXmlView) {
				this.oXmlView = oXmlView;
				this.oPropertyBag = {
					modifier: JsControlTreeModifier,
					view: oXmlView,
					appComponent: this.oComponent
				};
				this.oPanel = oXmlView.getContent()[1];
			}.bind(this));
		},
		afterEach: function() {
			this.oXmlView.destroy();
			sandbox.restore();
			return this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("When create and apply change with extension point information", function(assert) {
			var oChange1 = createAndCompleteAddXmlAtExtensionPointChange.call(this, sFragmentPath, "fragments/Fragment", "ExtensionPoint4");
			var oReadyStub = sandbox.stub();
			var oGetExtensionPointInfoSpy = sandbox.spy(JsControlTreeModifier, "getExtensionPointInfo");
			oChange1.getExtensionPointInfo = function() {
				return {
					view: this.oXmlView,
					name: "ExtensionPoint4",
					targetControl: this.oPanel,
					aggregationName: "content",
					index: 1,
					ready: oReadyStub,
					defaultContent: [this.oPanel.getContent()[1], this.oPanel.getContent()[2]]
				};
			}.bind(this);
			return this.oChangeHandler.applyChange(oChange1, this.oPanel, this.oPropertyBag)
			.then(function() {
				var aPanelContent = this.oPanel.getContent();
				assert.equal(
					aPanelContent.length,
					3,
					"then there are now three instead of four children in the Panel content. Default content must be destroyed."
				);
				assert.equal(aPanelContent[0].getId(), "myView2--label2", "then the control label positioned first.");
				assert.equal(
					aPanelContent[1].getId(),
					"myView2--projectId.button",
					"then the control added to the fourth extension point is on the second position."
				);
				assert.notOk(oGetExtensionPointInfoSpy.called, "then the modifier.getExtensionPointInfo function is not called");
				assert.ok(oReadyStub.called, "then the ready function of extension point is called.");
				assert.equal(
					oReadyStub.firstCall.args[0][0].getId(),
					aPanelContent[1].getId(),
					"then the added button is passed to the ready function."
				);
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});