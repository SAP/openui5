/* global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/write/_internal/extensionPoint/Registry",
	"sap/ui/fl/write/api/ExtensionPointRegistryAPI",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	ExtensionPointRegistry,
	ExtensionPointRegistryAPI,
	Panel,
	HBox,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function createFakeControl(sId) {
		return { getId: function () { return sId; }};
	}

	function createAndRegisterExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex) {
		var mExtensionPointInfo = {
			view: oView,
			name: sExtensionPointName,
			targetControl: oParent,
			aggregationName: sAggregationName,
			index: iIndex
		};
		ExtensionPointRegistry.registerExtensionPoint(mExtensionPointInfo);
		return mExtensionPointInfo;
	}

	QUnit.module("Given ExtensionPointRegistryAPI.getExtensionPointInfo is called", {
		before: function () {
			this.oView1 = createFakeControl("FakeViewId1");
			this.oView2 = createFakeControl("FakeViewId2");
			this.oTargetControl1 = new Panel("FakeTargetControlId1");
			this.oTargetControl2 = new HBox("FakeTargetControlId2");
			this.sExtensionPointName1 = "ExtensionPoint1";
			this.sExtensionPointName2 = "ExtensionPoint2";
			this.sExtensionPointName3 = "ExtensionPoint3";
			this.sExtensionPointName4 = "ExtensionPoint4";
			this.mExtensionPointInfo1 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName1, this.oTargetControl1, "items", 1);
			this.mExtensionPointInfo2 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName2, this.oTargetControl2, "content", 0);
			this.mExtensionPointInfo3 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName3, this.oTargetControl2, "content", 1);
			this.mExtensionPointInfo4 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName4, this.oTargetControl1, "dependents", 1);
		},
		after: function () {
			this.oTargetControl1.destroy();
			this.oTargetControl2.destroy();
			ExtensionPointRegistry.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with valid parameters", function(assert) {
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfo({name: this.sExtensionPointName1, view: this.oView1}), this.mExtensionPointInfo1, "the correct extension point info is returned");
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfo({name: this.sExtensionPointName2, view: this.oView1}), this.mExtensionPointInfo2, "the correct extension point info is returned");
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfo({name: this.sExtensionPointName3, view: this.oView1}), this.mExtensionPointInfo3, "the correct extension point info is returned");
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfo({name: this.sExtensionPointName4, view: this.oView1}), this.mExtensionPointInfo4, "the correct extension point info is returned");
		});

		QUnit.test("without valid view provided as parameter", function(assert) {
			assert.throws(function () {
				ExtensionPointRegistryAPI.getExtensionPointInfo({name: this.sExtensionPointName1, view: {}});
			}, "then an exception is thrown when there is no correct view object.");
		});

		QUnit.test("with not registered extension point name as parameter", function(assert) {
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfo({name: "not_registered_EP", view: this.oView1}), undefined, "undefined is returned for an invalid extension point name");
		});

		QUnit.test("with an unregistered view as parameter", function(assert) {
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfo({name: this.sExtensionPointName2, view: this.oView2}), undefined, "undefined is returned for a not registered view name");
		});
	});

	QUnit.module("Given ExtensionPointRegistryAPI.getExtensionPointInfoByParentId is called", {
		before: function () {
			this.oView1 = createFakeControl("FakeViewId1");
			this.oTargetControl2 = new HBox("FakeTargetControlId2");
			this.sExtensionPointName2 = "ExtensionPoint2";
			this.sExtensionPointName3 = "ExtensionPoint3";
			this.mExtensionPointInfo2 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName2, this.oTargetControl2, "content", 0);
			this.mExtensionPointInfo3 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName3, this.oTargetControl2, "content", 1);
		},
		after: function afterTestModule() {
			this.oTargetControl2.destroy();
			ExtensionPointRegistry.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with valid parameters", function(assert) {
			var sParentId = this.mExtensionPointInfo2.targetControl.getId();
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfoByParentId({parentId: sParentId}), [this.mExtensionPointInfo2, this.mExtensionPointInfo3], "the correct extension point info into an array is returned");
		});

		QUnit.test("with invalid parent id as parameter", function(assert) {
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfoByParentId({parentId: "invalidParentId"}), [], "then an empty array is returned");
		});
	});

	QUnit.module("Given ExtensionPointRegistryAPI.getExtensionPointInfoByViewId is called", {
		before: function () {
			this.oView1 = createFakeControl("FakeViewId1");
			this.oTargetControl2 = new HBox("FakeTargetControlId2");
			this.sExtensionPointName2 = "ExtensionPoint2";
			this.sExtensionPointName3 = "ExtensionPoint3";
			this.mExtensionPointInfo2 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName2, this.oTargetControl2, "content", 0);
			this.mExtensionPointInfo3 = createAndRegisterExtensionPoint(this.oView1, this.sExtensionPointName3, this.oTargetControl2, "content", 1);
		},
		after: function afterTestModule() {
			this.oTargetControl2.destroy();
			ExtensionPointRegistry.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with valid parameters", function(assert) {
			var mExtensionPointInfoMap = ExtensionPointRegistryAPI.getExtensionPointInfoByViewId({viewId: this.oView1.getId()});
			assert.deepEqual(Object.keys(mExtensionPointInfoMap), [this.sExtensionPointName2, this.sExtensionPointName3],
				"the correct extension point info into an map is returned");
		});

		QUnit.test("with invalid view id as parameter", function(assert) {
			assert.deepEqual(ExtensionPointRegistryAPI.getExtensionPointInfoByViewId({viewId: "invalidViewId"}),
				{}, "then an empty map is returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
		sandbox.restore();
	});
});