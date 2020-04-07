/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/apply/_internal/extensionPoint/Processor",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Label",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	Processor,
	ExtensionPointRegistry,
	ManagedObjectObserver,
	XMLView,
	Label,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var sExtensionPointName1 = "ExtensionPoint1";
	var sExtensionPointName2 = "ExtensionPoint2";
	var sExtensionPointName3 = "ExtensionPoint3";
	var sExtensionPointName4 = "ExtensionPoint4";
	var sExtensionPointName5 = "ExtensionPoint5";

	function _createExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex) {
		return {
			view: oView,
			name: sExtensionPointName,
			targetControl: oParent,
			aggregationName: sAggregationName,
			index: iIndex
		};
	}

	function _createAndRegisterExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex) {
		this.oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
		var mExtensionPointInfo = _createExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex);
		this.oExtensionPointRegistry.registerExtensionPoints(mExtensionPointInfo);
		return mExtensionPointInfo;
	}

	QUnit.module("sap.ui.fl.registry.ExtensionPointRegistry", {
		beforeEach: function() {
			sandbox.stub(Processor, "applyExtensionPoint");
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);

			var sXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<HBox id="hbox">' +
						'<items>' +
							'<Label id="label1" />' +
							'<core:ExtensionPoint name="ExtensionPoint1" />' +
							'<Label id="label2" />' +
						'</items>' +
						'<dependents>' +
							'<Label id="label3" />' +
							'<core:ExtensionPoint name="ExtensionPoint4" />' +
						'</dependents>' +
					'</HBox>' +
					'<Panel id="panel">' +
						'<content>' +
							'<core:ExtensionPoint name="ExtensionPoint2" />' +
							'<Label id="label4" />' +
							'<core:ExtensionPoint name="ExtensionPoint3" />' +
						'</content>' +
					'</Panel>' +
					'<HBox id="hbox1">' +
						'<items>' +
							'<core:ExtensionPoint name="' + sExtensionPointName5 + '" />' +
						'</items>' +
					'</HBox>' +
				'</mvc:View>';
			return sap.ui.core.mvc.XMLView.create({id: "testComponent---myView", definition: sXmlString})
			.then(function(oXMLView) {
				this.oXMLView = oXMLView;
				this.oHBox = this.oXMLView.getContent()[0];
				this.oPanel = this.oXMLView.getContent()[1];
				this.oHBoxWithSingleEP = this.oXMLView.getContent()[2];
			}.bind(this));
		},
		afterEach: function() {
			this.oXMLView.destroy();
			ExtensionPointRegistry.getInstance().exit();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling function 'getInstance'", function(assert) {
			var oExtensionPointRegistry1 = ExtensionPointRegistry.getInstance();
			assert.ok(ExtensionPointRegistry._instance, "after the call there is an instance available");
			var oExtensionPointRegistry2 = ExtensionPointRegistry.getInstance();
			assert.strictEqual(oExtensionPointRegistry1, oExtensionPointRegistry2, "a second call returns the same instance");
		});

		QUnit.test("when calling function 'exit'", function(assert) {
			var oObserverDisconnectSpy = sandbox.spy(ManagedObjectObserver.prototype, "disconnect");
			var oObserverDestroySpy = sandbox.spy(ManagedObjectObserver.prototype, "destroy");
			_createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			assert.equal(Object.keys(this.oExtensionPointRegistry._aExtensionPointsByParent).length, 1, "then after registration one item is registered by parent");
			assert.equal(Object.keys(this.oExtensionPointRegistry._mExtensionPointsByViewId).length, 1, "then after registration one item is registered by viewId");
			assert.equal(Object.keys(this.oExtensionPointRegistry._mObservers).length, 1, "then after registration one observer is registered");
			this.oExtensionPointRegistry.exit();
			assert.equal(oObserverDisconnectSpy.callCount, 1, "then after exit the disconnect function for the observer is called");
			assert.equal(oObserverDestroySpy.callCount, 1, "then after exit the destroy function for the observer is called");
			assert.equal(Object.keys(this.oExtensionPointRegistry._aExtensionPointsByParent).length, 0, "then after exit the registration map for parentId is empty");
			assert.equal(Object.keys(this.oExtensionPointRegistry._mExtensionPointsByViewId).length, 0, "then after exit the registration map for viewId is empty");
			assert.equal(Object.keys(this.oExtensionPointRegistry._mObservers).length, 0, "then after exit the observer map is empty");
		});

		QUnit.test("given the extensionpoint is the single node in aggregation when calling 'registerExtensionPoints'", function(assert) {
			_createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName5, this.oHBoxWithSingleEP, "items", 0);
			assert.equal(Object.keys(this.oExtensionPointRegistry._aExtensionPointsByParent).length, 1, "then after registration one item is registered by parent");
			assert.equal(Object.keys(this.oExtensionPointRegistry._mExtensionPointsByViewId).length, 1, "then after registration one item is registered by viewId");
			assert.equal(Object.keys(this.oExtensionPointRegistry._mObservers).length, 1, "then after registration one observer is registered");
		});

		QUnit.test("given a control containing two extension points in an aggregation", function(assert) {
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			_createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var sParentId = mExtensionPointInfo2.targetControl.getId();
			var oLabel1 = new Label("newLabel1");
			var oLabel2 = new Label("newLabel2");

			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 0, "the index is '0' for the first extension point at the beginning");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index is '2' for the second extension point at the beginning");
			mExtensionPointInfo2.targetControl.addContent(oLabel1);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 0, "the index is the same as before when a control is added at a higher index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index is the same as before when a control is added at a higher index");
			mExtensionPointInfo2.targetControl.insertContent(oLabel2, 0);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 0, "the index is the same as before when a control is added at the same index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 2, "the index is increased when a control is added at a lower index");
			mExtensionPointInfo2.targetControl.removeContent(oLabel1);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 0, "the index is the same as before when a control is removed from a higher index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 2, "the index is the same as before when a control is removed from a higher index");
			mExtensionPointInfo2.targetControl.removeContent(oLabel2);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 0, "the index is the same as before when a control is removed from the same index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index is decreased when a control is removed from a lower index");

			oLabel1.destroy();
			oLabel2.destroy();
		});

		QUnit.test("given a control containing an two extension points in two aggregations", function(assert) {
			var mExtensionPointInfo1 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			var mExtensionPointInfo4 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName4, this.oHBox, "dependents", 1);
			var sParentId = mExtensionPointInfo1.targetControl.getId();
			var oLabel1 = new Label("newLabel3");
			var oLabel2 = new Label("newLabel4");
			var oLabel3 = new Label("newLabel5");
			var oLabel4 = new Label("newLabel6");

			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the index is '1' for the first extension point at the beginning");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index is '1' for the second extension point at the beginning");
			mExtensionPointInfo1.targetControl.addItem(oLabel1);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the index is the same as before when a control is added at a higher index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo1.targetControl.insertItem(oLabel2, 0);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 2, "the index is increased when a control is added at a lower index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo1.targetControl.removeItem(oLabel1);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 2, "the index is the same as before when a control is removed from a higher index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo1.targetControl.removeItem(oLabel2);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the index is decreased when a control is removed from a lower index");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo4.targetControl.addDependent(oLabel3);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the index in the other aggregation stays the same");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index stays the same as before when a control is added at the same index");
			mExtensionPointInfo4.targetControl.insertDependent(oLabel4, 0);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the index in the other aggregation stays the same");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 2, "the index is increased when a control is added at a lower index");
			mExtensionPointInfo4.targetControl.removeDependent(oLabel3);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the index in the other aggregation stays the same");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 2, "the index stays the same when a control is removed from the same index");
			mExtensionPointInfo4.targetControl.removeDependent(oLabel4);
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][0].index, 1, "the in the other aggregation index stays the same");
			assert.equal(this.oExtensionPointRegistry._aExtensionPointsByParent[sParentId][1].index, 1, "the index is decreased when a control is removed from a lower index");

			oLabel1.destroy();
			oLabel2.destroy();
			oLabel3.destroy();
			oLabel4.destroy();
		});

		QUnit.test("when calling 'getExtensionPointInfo' with a given ExtensionPointRegistry", function(assert) {
			var mExtensionPointInfo1 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			var mExtensionPointInfo3 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var mExtensionPointInfo4 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName4, this.oHBox, "dependents", 1);

			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName1, this.oXMLView), mExtensionPointInfo1, "the correct extension point info is returned");
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView), mExtensionPointInfo2, "the correct extension point info is returned");
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName3, this.oXMLView), mExtensionPointInfo3, "the correct extension point info is returned");
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName4, this.oXMLView), mExtensionPointInfo4, "the correct extension point info is returned");
		});

		QUnit.test("when calling 'getExtensionPointInfo' with invalid parameters", function(assert) {
			_createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			_createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);

			assert.throws(function () {
				this.oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName1, {});
			}.bind(this), "then an exception is thrown when there is no correct view object.");
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfo("not_registered_EP", this.oXMLView), undefined, "undefined is returned for an invalid extension point name");
			var oFakeView = {
				getId: function () {
					return "not_registered_view";
				}
			};
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, oFakeView), undefined, "undefined is returned for a not registered view name");
		});

		QUnit.test("when calling 'getExtensionPointInfoByParentId' with valid parameters", function(assert) {
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			var mExtensionPointInfo3 = _createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var sParentId = mExtensionPointInfo2.targetControl.getId();
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId), [mExtensionPointInfo2, mExtensionPointInfo3], "the correct extension point info into an array is returned");
		});

		QUnit.test("when calling 'getExtensionPointInfoByParentId' with invalid parameters", function(assert) {
			_createAndRegisterExtensionPoint.call(this, this.oXMLView, sExtensionPointName1, this.oPanel, "content", 0);
			assert.deepEqual(this.oExtensionPointRegistry.getExtensionPointInfoByParentId("invalidParentId"), [], "then an empty array is returned");
		});
	});

	QUnit.module("Given an ExtensionPointRegistry created by the fl extension point processor", {
		beforeEach: function() {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);

			var sXmlString =
				'<mvc:View id="myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<HBox id="hbox">' +
						'<items>' +
							'<Label id="label1" />' +
							'<core:ExtensionPoint name="ExtensionPoint1">' +
								'<core:Fragment id="defaultFragment" fragmentName="sap.ui.fl.qunit.extensionPoint.testApp.fragments.Default" type="XML" />' +
							'</core:ExtensionPoint>' +
							'<Label id="label2" />' +
						'</items>' +
					'</HBox>' +
					'<Panel id="panel">' +
						'<content>' +
							'<core:ExtensionPoint name="ExtensionPoint2" />' +
							'<Label id="label3" />' +
							'<core:ExtensionPoint name="ExtensionPoint3">' +
								'<Label id="ep3-label1" text="Extension point label1 - default content" />' +
								'<Label id="ep3-label2" text="Extension point label2 - default content" />' +
						'</core:ExtensionPoint>' +
						'</content>' +
					'</Panel>' +
				'</mvc:View>';
			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				metadata: {
					manifest: "json"
				}
			});
			return this.oComponent.runAsOwner(function() {
				return XMLView.create({
					id: "myView",
					definition: sXmlString,
					async: true
				});
			})
				.then(function(oXMLView) {
					this.oXMLView = oXMLView;
					this.oHBox = this.oXMLView.getContent()[0];
					this.oPanel = this.oXMLView.getContent()[1];
				}.bind(this));
		},
		afterEach: function() {
			this.oComponent.destroy();
			this.oXMLView.destroy();
			ExtensionPointRegistry.getInstance().exit();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling function 'getExtensionPointInfo' for an extension point without default content", function(assert) {
			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			var mExtensionPointInfo2 = oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView);

			assert.equal(mExtensionPointInfo2.name, sExtensionPointName2, "then parameter 'name' is correct");
			assert.deepEqual(mExtensionPointInfo2.targetControl, this.oPanel, "then parameter 'targetControl' is correct");
			assert.equal(mExtensionPointInfo2.aggregationName, "content", "then parameter 'aggregationName' is correct");
			assert.equal(mExtensionPointInfo2.index, 0, "then parameter 'index' is correct");
			assert.deepEqual(mExtensionPointInfo2.defaultContent, [], "then parameter 'defaultAggregation' is correct");
		});

		QUnit.test("when calling function 'getExtensionPointInfo' for an extension point with default content", function(assert) {
			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			var mExtensionPointInfo3 = oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName3, this.oXMLView);

			assert.equal(mExtensionPointInfo3.name, sExtensionPointName3, "then parameter 'name' is correct");
			assert.deepEqual(mExtensionPointInfo3.targetControl, this.oPanel, "then parameter 'targetControl' is correct");
			assert.equal(mExtensionPointInfo3.aggregationName, "content", "then parameter 'aggregationName' is correct");
			assert.equal(mExtensionPointInfo3.index, 1, "then parameter 'index' is correct");
			var sDefaultContentLabel1 = this.oPanel.getContent()[1].getId();
			var sDefaultContentLabel2 = this.oPanel.getContent()[2].getId();
			assert.deepEqual(mExtensionPointInfo3.defaultContent, [sDefaultContentLabel1, sDefaultContentLabel2], "then parameter 'defaultAggregation' is correct");
		});

		QUnit.test("when calling function 'getExtensionPointInfo' for an extension point with default fragment", function(assert) {
			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			var mExtensionPointInfo1 = oExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName1, this.oXMLView);

			assert.equal(mExtensionPointInfo1.name, sExtensionPointName1, "then parameter 'name' is correct");
			assert.deepEqual(mExtensionPointInfo1.targetControl, this.oHBox, "then parameter 'targetControl' is correct");
			assert.equal(mExtensionPointInfo1.aggregationName, "items", "then parameter 'aggregationName' is correct");
			assert.equal(mExtensionPointInfo1.index, 1, "then parameter 'index' is correct");
			assert.deepEqual(mExtensionPointInfo1.defaultContent, ["myView--defaultFragment--defaultButton"], "then parameter 'defaultAggregation' is correct");
		});

		QUnit.test("when calling function 'exit'", function(assert) {
			var oObserverDisconnectSpy = sandbox.spy(ManagedObjectObserver.prototype, "disconnect");
			var oObserverDestroySpy = sandbox.spy(ManagedObjectObserver.prototype, "destroy");
			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			assert.equal(Object.keys(oExtensionPointRegistry._aExtensionPointsByParent).length, 2, "then after registration three items are registered by parentId");
			assert.equal(Object.keys(oExtensionPointRegistry._mExtensionPointsByViewId).length, 1, "then after registration one item is registered by viewId");
			assert.equal(Object.keys(oExtensionPointRegistry._mObservers).length, 2, "then after registration three observers are registered");
			oExtensionPointRegistry.exit();
			assert.equal(oObserverDisconnectSpy.callCount, 2, "then after exit the disconnect function for the observer is called for the three observers");
			assert.equal(oObserverDestroySpy.callCount, 2, "then after exit the destroy function for the observer is called for the three observers");
			assert.equal(Object.keys(oExtensionPointRegistry._aExtensionPointsByParent).length, 0, "then after exit the registration map for parentId is empty");
			assert.equal(Object.keys(oExtensionPointRegistry._mExtensionPointsByViewId).length, 0, "then after exit the registration map for viewId is empty");
			assert.equal(Object.keys(oExtensionPointRegistry._mObservers).length, 0, "then after exit the observer map is empty");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
