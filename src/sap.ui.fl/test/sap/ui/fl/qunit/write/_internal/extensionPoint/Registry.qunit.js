/* global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Component",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/extensionPoint/Processor",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/write/_internal/extensionPoint/Registry",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Label",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	Component,
	JsControlTreeModifier,
	Processor,
	Loader,
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
		var mExtensionPointInfo = _createExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex);
		ExtensionPointRegistry.registerExtensionPoint(mExtensionPointInfo);
		return mExtensionPointInfo;
	}

	QUnit.module("sap.ui.fl.write._internal.extensionPoint.Registry", {
		beforeEach: function() {
			sandbox.stub(Processor, "applyExtensionPoint");

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
			ExtensionPointRegistry.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling function 'clear'", function(assert) {
			var oObserverDisconnectSpy = sandbox.spy(ManagedObjectObserver.prototype, "disconnect");
			var oObserverDestroySpy = sandbox.spy(ManagedObjectObserver.prototype, "destroy");
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			var mExtensionPoint = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(this.oPanel.getId()).length, 1, "then after registration one item is registered by parent");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView), mExtensionPoint, "then after registration one item is registered by viewId");
			ExtensionPointRegistry.clear();
			assert.equal(oObserverDisconnectSpy.callCount, 1, "then after exit the disconnect function for the observer is called");
			assert.equal(oObserverDestroySpy.callCount, 1, "then after exit the destroy function for the observer is called");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(this.oPanel.getId()).length, 0, "then after exit the registration map for parentId is empty");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView), undefined, "then after exit the registration map for viewId is empty");
		});

		QUnit.test("given the extensionpoint is the single node in aggregation when calling 'registerExtensionPoint'", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			var oObserverObserveSpy = sandbox.spy(ManagedObjectObserver.prototype, "observe");
			var mExtensionPoint = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName5, this.oHBoxWithSingleEP, "items", 0);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(this.oHBoxWithSingleEP.getId()).length, 1, "then after registration one item is registered by parent");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName5, this.oXMLView), mExtensionPoint, "then after registration one item is registered by viewId");
			assert.equal(oObserverObserveSpy.callCount, 1, "then after registration one observer is registered");
		});

		QUnit.test("given the extensionpoint in an aggregation with cardinality '0..1'", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			var oObserverObserveSpy = sandbox.spy(ManagedObjectObserver.prototype, "observe");
			var oLabel1 = new Label("newLabel1");
			sandbox.stub(JsControlTreeModifier, "getAggregation").returns(oLabel1);
			var mExtensionPoint = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName5, this.oHBoxWithSingleEP, "items", 0);
			assert.equal(oObserverObserveSpy.callCount, 1, "then after registration one observer is registered");
			mExtensionPoint.targetControl.addItem(oLabel1);
			assert.propEqual(mExtensionPoint.aggregation, ["newLabel1"], "and after adding an object the observer uses an array for the aggregation");
			oLabel1.destroy();
		});

		QUnit.test("given a control containing two extension points in an aggregation", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			_createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var sParentId = mExtensionPointInfo2.targetControl.getId();
			var oLabel1 = new Label("newLabel1");
			var oLabel2 = new Label("newLabel2");

			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 0, "the index is '0' for the first extension point at the beginning");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index is '2' for the second extension point at the beginning");
			mExtensionPointInfo2.targetControl.addContent(oLabel1);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 0, "the index is the same as before when a control is added at a higher index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index is the same as before when a control is added at a higher index");
			mExtensionPointInfo2.targetControl.insertContent(oLabel2, 0);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 0, "the index is the same as before when a control is added at the same index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 2, "the index is increased when a control is added at a lower index");
			mExtensionPointInfo2.targetControl.removeContent(oLabel1);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 0, "the index is the same as before when a control is removed from a higher index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 2, "the index is the same as before when a control is removed from a higher index");
			mExtensionPointInfo2.targetControl.removeContent(oLabel2);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 0, "the index is the same as before when a control is removed from the same index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index is decreased when a control is removed from a lower index");

			oLabel1.destroy();
			oLabel2.destroy();
		});

		QUnit.test("given a control containing an two extension points in two aggregations", function(assert) {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			var mExtensionPointInfo1 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			var mExtensionPointInfo4 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName4, this.oHBox, "dependents", 1);
			var sParentId = mExtensionPointInfo1.targetControl.getId();
			var oLabel1 = new Label("newLabel3");
			var oLabel2 = new Label("newLabel4");
			var oLabel3 = new Label("newLabel5");
			var oLabel4 = new Label("newLabel6");

			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the index is '1' for the first extension point at the beginning");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index is '1' for the second extension point at the beginning");
			mExtensionPointInfo1.targetControl.addItem(oLabel1);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the index is the same as before when a control is added at a higher index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo1.targetControl.insertItem(oLabel2, 0);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 2, "the index is increased when a control is added at a lower index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo1.targetControl.removeItem(oLabel1);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 2, "the index is the same as before when a control is removed from a higher index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo1.targetControl.removeItem(oLabel2);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the index is decreased when a control is removed from a lower index");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index in the other aggregation stays the same");
			mExtensionPointInfo4.targetControl.addDependent(oLabel3);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the index in the other aggregation stays the same");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index stays the same as before when a control is added at the same index");
			mExtensionPointInfo4.targetControl.insertDependent(oLabel4, 0);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the index in the other aggregation stays the same");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 2, "the index is increased when a control is added at a lower index");
			mExtensionPointInfo4.targetControl.removeDependent(oLabel3);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the index in the other aggregation stays the same");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 2, "the index stays the same when a control is removed from the same index");
			mExtensionPointInfo4.targetControl.removeDependent(oLabel4);
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[0].index, 1, "the in the other aggregation index stays the same");
			assert.equal(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)[1].index, 1, "the index is decreased when a control is removed from a lower index");

			oLabel1.destroy();
			oLabel2.destroy();
			oLabel3.destroy();
			oLabel4.destroy();
		});

		QUnit.test("when calling 'getExtensionPointInfo' with a given ExtensionPointRegistry", function(assert) {
			var mExtensionPointInfo1 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			var mExtensionPointInfo3 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var mExtensionPointInfo4 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName4, this.oHBox, "dependents", 1);

			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName1, this.oXMLView), mExtensionPointInfo1, "the correct extension point info is returned");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView), mExtensionPointInfo2, "the correct extension point info is returned");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName3, this.oXMLView), mExtensionPointInfo3, "the correct extension point info is returned");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName4, this.oXMLView), mExtensionPointInfo4, "the correct extension point info is returned");
		});

		QUnit.test("when calling 'getExtensionPointInfo' with invalid parameters", function(assert) {
			_createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			_createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);

			assert.throws(function () {
				ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName1, {});
			}, "then an exception is thrown when there is no correct view object.");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo("not_registered_EP", this.oXMLView), undefined, "undefined is returned for an invalid extension point name");
			var oFakeView = {
				getId: function () {
					return "not_registered_view";
				}
			};
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, oFakeView), undefined, "undefined is returned for a not registered view name");
		});

		QUnit.test("when calling 'getExtensionPointInfoByParentId' with valid parameters", function(assert) {
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			var mExtensionPointInfo3 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var sParentId = mExtensionPointInfo2.targetControl.getId();
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId), [mExtensionPointInfo2, mExtensionPointInfo3],
				"the correct extension point info into an array is returned");
		});

		QUnit.test("when calling 'getExtensionPointInfoByParentId' with invalid parameters", function(assert) {
			_createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName1, this.oPanel, "content", 0);
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfoByParentId("invalidParentId"), [], "then an empty array is returned");
		});

		QUnit.test("when calling 'getExtensionPointInfoByViewId' with valid parameters", function(assert) {
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			var mExtensionPointInfo3 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName3, this.oPanel, "content", 1);
			var mExtensionPointsMap = ExtensionPointRegistry.getExtensionPointInfoByViewId(this.oXMLView.getId());
			assert.deepEqual(Object.keys(mExtensionPointsMap), [mExtensionPointInfo2.name, mExtensionPointInfo3.name],
				"the correct extension point info into an map is returned");
		});

		QUnit.test("when calling 'getExtensionPointInfoByViewId' with invalid parameters", function(assert) {
			_createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName1, this.oPanel, "content", 0);
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfoByViewId("invalidViewId"), {}, "then an empty map is returned");
		});

		QUnit.test("when destroying the parent control of an extension point", function(assert) {
			var mExtensionPointInfo1 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName1, this.oHBox, "items", 1);
			var mExtensionPointInfo2 = _createAndRegisterExtensionPoint(this.oXMLView, sExtensionPointName2, this.oPanel, "content", 0);
			var sParentId1 = mExtensionPointInfo1.targetControl.getId();
			var sParentId2 = mExtensionPointInfo2.targetControl.getId();
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId1), [mExtensionPointInfo1],
				"then before destroy the correct extension point info is returned for parent1");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId2), [mExtensionPointInfo2],
				"then before destroy the correct extension point info is returned for parent2");
			this.oPanel.destroy();
			var aReturnedExtensionPoints = ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId1);
			assert.deepEqual(aReturnedExtensionPoints, [mExtensionPointInfo1],
				"then after destroy parent2 control the extension point info for parent1 is still available");
			assert.notOk(aReturnedExtensionPoints[0].bParentIsDestroyed, "and is not marked as destroyed");
			aReturnedExtensionPoints = ExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId2);
			assert.deepEqual(aReturnedExtensionPoints, [mExtensionPointInfo2],
				"then after destroy parent2 control the extension point info is still available");
			assert.ok(aReturnedExtensionPoints[0].bParentIsDestroyed, "and is marked as destroyed");
			assert.deepEqual(ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView), mExtensionPointInfo2,
				"then after destroy parent2 control the extension point info is still available");
		});
	});

	QUnit.module("Given an extensionPoint.Registry instantiated by the fl extensionPoint.Processor", {
		beforeEach: function() {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			sandbox.stub(Loader, "loadFlexData").resolves({ changes: [] });

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

			return Component.create({
				name: "testComponent",
				id: "testComponent",
				componentData: {}
			})
				.then(function(_oComp) {
					this.oComponent = _oComp;
					return this.oComponent.runAsOwner(function() {
						return XMLView.create({
							id: "myView",
							definition: sXmlString,
							async: true
						})
						.then(function(oXMLView) {
							this.oXMLView = oXMLView;
							this.oHBox = this.oXMLView.getContent()[0];
							this.oPanel = this.oXMLView.getContent()[1];
						}.bind(this));
					}.bind(this));
				}.bind(this))
				.then(function() {
					sap.ui.getCore().applyChanges();
				});
		},
		afterEach: function() {
			this.oComponent.destroy();
			this.oXMLView.destroy();
			ExtensionPointRegistry.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling function 'getExtensionPointInfo' for an extension point without default content", function(assert) {
			var mExtensionPointInfo2 = ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName2, this.oXMLView);

			assert.equal(mExtensionPointInfo2.name, sExtensionPointName2, "then parameter 'name' is correct");
			assert.deepEqual(mExtensionPointInfo2.targetControl, this.oPanel, "then parameter 'targetControl' is correct");
			assert.equal(mExtensionPointInfo2.aggregationName, "content", "then parameter 'aggregationName' is correct");
			assert.equal(mExtensionPointInfo2.index, 0, "then parameter 'index' is correct");
			assert.deepEqual(mExtensionPointInfo2.defaultContent, [], "then parameter 'defaultAggregation' is correct");
		});

		QUnit.test("when calling function 'getExtensionPointInfo' for an extension point with default content", function(assert) {
			var mExtensionPointInfo3 = ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName3, this.oXMLView);

			assert.equal(mExtensionPointInfo3.name, sExtensionPointName3, "then parameter 'name' is correct");
			assert.deepEqual(mExtensionPointInfo3.targetControl, this.oPanel, "then parameter 'targetControl' is correct");
			assert.equal(mExtensionPointInfo3.aggregationName, "content", "then parameter 'aggregationName' is correct");
			assert.equal(mExtensionPointInfo3.index, 1, "then parameter 'index' is correct");
			var oDefaultContentLabel1 = this.oPanel.getContent()[1];
			var oDefaultContentLabel2 = this.oPanel.getContent()[2];
			assert.deepEqual(mExtensionPointInfo3.defaultContent, [oDefaultContentLabel1, oDefaultContentLabel2], "then parameter 'defaultAggregation' is correct");
		});

		QUnit.test("when calling function 'getExtensionPointInfo' for an extension point with default fragment", function(assert) {
			var mExtensionPointInfo1 = ExtensionPointRegistry.getExtensionPointInfo(sExtensionPointName1, this.oXMLView);

			assert.equal(mExtensionPointInfo1.name, sExtensionPointName1, "then parameter 'name' is correct");
			assert.deepEqual(mExtensionPointInfo1.targetControl, this.oHBox, "then parameter 'targetControl' is correct");
			assert.equal(mExtensionPointInfo1.aggregationName, "items", "then parameter 'aggregationName' is correct");
			assert.equal(mExtensionPointInfo1.index, 1, "then parameter 'index' is correct");
			assert.deepEqual(mExtensionPointInfo1.defaultContent, [sap.ui.getCore().byId("myView--defaultFragment--defaultButton")], "then parameter 'defaultAggregation' is correct");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
