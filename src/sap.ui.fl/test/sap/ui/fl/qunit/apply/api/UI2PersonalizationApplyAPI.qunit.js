/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/api/UI2PersonalizationApplyAPI",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	UI2PersonalizationState,
	UI2PersonalizationApplyAPI,
	ChangesController,
	jQuery,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();
	var sandbox = sinon.sandbox.create();

	QUnit.module("load personalization", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("testComponent");
			this.oGetPersonalizationStub = sandbox.stub(UI2PersonalizationState, "getPersonalization");
		},
		afterEach: function () {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("load is called and complains about too few parameters (missing container key)", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: {
					appId: "testComponent"
				}
			})
			.catch(function () {
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

			sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance").returns(fnMockedFlexController);

			return UI2PersonalizationApplyAPI.load({
				selector: {
					appId: "testComponent"
				},
				containerKey: "someContainerKey"
			})
			.catch(function () {
				assert.ok(true, "a rejection took place");
				assert.ok(this.oGetPersonalizationStub.notCalled, "then UI2PersonalizationState.getPersonalization is not called");
			}.bind(this));
		});

		QUnit.test("load is called and selector contains only appId (but no appVersion)", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: {
					appId: "testComponent"
				},
				containerKey: "someContainerKey"
			})
			.then(function () {
				assert.ok(this.oGetPersonalizationStub.calledWithExactly("testComponent", "someContainerKey", undefined), "then UI2PersonalizationState.getPersonalization is called with correct parameters and default appVersion is taken");
			}.bind(this));
		});

		QUnit.test("load is called and successful", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: {
					appId: "testComponent"
				},
				containerKey: "someContainerKey"
			})
			.then(function() {
				assert.ok(this.oGetPersonalizationStub.calledWithExactly("testComponent", "someContainerKey", undefined), "then UI2PersonalizationState.getPersonalization is called with correct parameters");
			}.bind(this));
		});

		QUnit.test("load is called and property bag contains itemName too", function(assert) {
			return UI2PersonalizationApplyAPI.load({
				selector: {
					appId: "testComponent"
				},
				containerKey: "someContainerKey",
				itemName: "someItemName"
			})
			.then(function() {
				assert.ok(this.oGetPersonalizationStub.calledWithExactly("testComponent", "someContainerKey", "someItemName"), "then UI2PersonalizationState.getPersonalization is called with correct parameters");
			}.bind(this));
		});
	});
});