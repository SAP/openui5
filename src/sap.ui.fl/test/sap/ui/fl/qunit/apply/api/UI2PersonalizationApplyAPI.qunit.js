/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/api/UI2PersonalizationApplyAPI",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/core/Manifest",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	UI2PersonalizationState,
	UI2PersonalizationApplyAPI,
	ChangesController,
	Manifest,
	FlexUtils,
	FlexState,
	jQuery,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();
	var sandbox = sinon.sandbox.create();

	function createAppComponent() {
		var oDescriptor = {
			"sap.app" : {
				id : "reference.app",
				applicationVersion: {
					version: "1.2.3"
				}
			}
		};

		var oManifest = new Manifest(oDescriptor);
		return {
			name: "testComponent",
			getManifest : function() {
				return oManifest;
			},
			getId: function() {
				return "Control---demo--test";
			},
			getLocalId: function() {}
		};
	}

	QUnit.module("load personalization", {
		beforeEach: function() {
			this.oAppComponent = createAppComponent();
			this.oGetPersonalizationStub = sandbox.stub(UI2PersonalizationState, "getPersonalization");

			sandbox.stub(FlexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(FlexState, "initialize").resolves();
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("load is called and complains about too few parameters (missing container key)", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: this.oAppComponent
			}).then(function() {
				assert.notOk("Should never succeed!");
			}).catch(function () {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oGetPersonalizationStub.notCalled, "then UI2PersonalizationState.getPersonalization is not called");
			}.bind(this));
		});

		QUnit.test("load is called and complains about missing component name", function(assert) {
			var fnMockedFlexController = {
				getComponentName: function() {
					return;
				},
				getAppVersion: function() {
					return "1.2.3";
				}
			};

			sandbox.stub(ChangesController, "getFlexControllerInstance").returns(fnMockedFlexController);

			return UI2PersonalizationApplyAPI.load({
				selector: this.oAppComponent,
				containerKey: "someContainerKey"
			}).then(function() {
				assert.notOk("Should never succeed!");
			}).catch(function () {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oGetPersonalizationStub.notCalled, "then UI2PersonalizationState.getPersonalization is not called");
			}.bind(this));
		});

		QUnit.test("load is called and selector contains only appId", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: this.oAppComponent,
				containerKey: "someContainerKey"
			}).then(function () {
				assert.ok(this.oGetPersonalizationStub.calledWithExactly("testComponent", "someContainerKey", undefined), "then UI2PersonalizationState.getPersonalization is called with correct parameters and default appVersion is taken");
			}.bind(this));
		});

		QUnit.test("load is called and successful", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: this.oAppComponent,
				containerKey: "someContainerKey"
			}).then(function() {
				assert.ok(this.oGetPersonalizationStub.calledWithExactly("testComponent", "someContainerKey", undefined), "then UI2PersonalizationState.getPersonalization is called with correct parameters");
			}.bind(this));
		});

		QUnit.test("load is called and property bag contains itemName too", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: this.oAppComponent,
				containerKey: "someContainerKey",
				itemName: "someItemName"
			}).then(function() {
				assert.ok(this.oGetPersonalizationStub.calledWithExactly("testComponent", "someContainerKey", "someItemName"), "then UI2PersonalizationState.getPersonalization is called with correct parameters");
			}.bind(this));
		});
	});
});