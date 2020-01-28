/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/api/UI2PersonalizationWriteAPI",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	UIComponent,
	UI2PersonalizationState,
	ChangesController,
	UI2PersonalizationWriteAPI,
	jQuery,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();
	var sandbox = sinon.sandbox.create();

	QUnit.module("setPersonalization", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("testComponent");
			this.oSetPersonalizationStub = sandbox.stub(UI2PersonalizationState, "setPersonalization");
			this.oDeletePersonalizationStub = sandbox.stub(UI2PersonalizationState, "deletePersonalization");
		},
		afterEach: function () {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("create is called and complains about too few parameters (no properties except selector property)", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: {
					appId: "testComponent",
					appVersion: "1.2.3"
				}
			})
				.catch(function() {
					assert.ok(true, "a rejection took place");
					assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
				}.bind(this));
		});

		QUnit.test("create is called and complains about missing component name", function(assert) {
			var fnMockedFlexController = {
				getComponentName: function() {
					return;
				}
			};

			sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance").returns(fnMockedFlexController);

			return UI2PersonalizationWriteAPI.create({
				selector: {
					appId: "testComponent",
					appVersion: "1.2.3"
				},
				containerKey: "someContainerKey",
				itemName: "someItemName",
				content: {}
			})
				.catch(function () {
					assert.ok(true, "a rejection took place");
					assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
				}.bind(this));
		});

		QUnit.test("create is called and complains about too few parameters (no containerKey)", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: {
					appId: "testComponent",
					appVersion: "1.2.3"
				},
				itemName: "someItemName",
				content: {}
			})
				.catch(function() {
					assert.ok(true, "a rejection took place");
					assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
				}.bind(this));
		});

		QUnit.test("create is called and complains about too few parameters (no ItemName)", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: {
					appId: "testComponent",
					appVersion: "1.2.3"
				},
				containerKey: "someContainerKey",
				content: {}
			})
				.catch(function() {
					assert.ok(true, "a rejection took place");
					assert.ok(this.oSetPersonalizationStub.notCalled, "then UI2PersonalizationState.setPersonalization is not called");
				}.bind(this));
		});

		QUnit.test("create is called and successful", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: {
					appId: "testComponent",
					appVersion: "1.2.3"
				},
				containerKey: "someContainerKey",
				itemName: "someItemName",
				content: {}
			})
				.then(function() {
					assert.ok(this.oSetPersonalizationStub.calledWithExactly({
						reference: "testComponent",
						containerKey: "someContainerKey",
						itemName: "someItemName",
						content: {}
					}), "then UI2PersonalizationState.setPersonalization is called with correct parameters");
				}.bind(this));
		});

		QUnit.test("deletePersonalization is called and successful", function(assert) {
			return UI2PersonalizationWriteAPI.deletePersonalization({
				selector: {
					appId: "testComponent"
				},
				containerKey: "someContainerKey",
				itemName: "someItemName"
			})
				.then(function () {
					assert.ok(this.oDeletePersonalizationStub.calledWithExactly("testComponent", "someContainerKey", "someItemName"), "then UI2PersonalizationState.deletePersonalization is called with correct parameters");
				}.bind(this));
		});

		QUnit.test("deletePersonalization is called and complains about missing component name", function(assert) {
			var fnMockedFlexController = {
				getComponentName: function() {
					return;
				}
			};

			sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance").returns(fnMockedFlexController);

			return UI2PersonalizationWriteAPI.deletePersonalization({
				selector: {
					appId: "testComponent"
				},
				containerKey: "someContainerKey",
				itemName: "someItemName"
			})
				.catch(function () {
					assert.ok(true, "a rejection took place");
					assert.ok(this.oDeletePersonalizationStub.notCalled, "then UI2PersonalizationState.deletePersonalization is not called");
				}.bind(this));
		});

		QUnit.test("deletePersonalization gets called and complains about too few parameters (no properties except selector property)", function(assert) {
			return UI2PersonalizationWriteAPI.deletePersonalization({
				selector: {
					appId: "testComponent"
				}
			})
				.catch(function() {
					assert.ok(true, "a rejection took place");
					assert.ok(this.oDeletePersonalizationStub.notCalled, "then UI2PersonalizationState.deletePersonalization is not called");
				}.bind(this));
		});
	});
});