/* eslint-disable quote-props */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Cache",
	"sap/ui/fl/apply/api/UI2PersonalizationApplyAPI",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Cache,
	UI2PersonalizationApplyAPI,
	ChangesController,
	jQuery,
	sinon
) {
	"use strict";

	jQuery('#qunit-fixture').hide();
	var sandbox = sinon.sandbox.create();

	QUnit.module("load personalization", {
		beforeEach: function() {
			this.fnStubCacheGetPersonalization = sandbox.stub(Cache, "getPersonalization").resolves();
		},

		afterEach: function () {
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
				assert.ok(this.fnStubCacheGetPersonalization.notCalled, "then Cache.getPersonalization is not called");
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
				assert.ok(this.fnStubCacheGetPersonalization.notCalled, "then Cache.getPersonalization is not called");
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
				assert.ok(this.fnStubCacheGetPersonalization.calledWithExactly("testComponent", "someContainerKey", undefined), "then Cache.getPersonalization is called with correct parameters and default appVersion is taken");
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
				assert.ok(this.fnStubCacheGetPersonalization.calledWithExactly("testComponent", "someContainerKey", undefined), "then Cache.getPersonalization is called with correct parameters");
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
				assert.ok(this.fnStubCacheGetPersonalization.calledWithExactly("testComponent", "someContainerKey", "someItemName"), "then Cache.getPersonalization is called with correct parameters");
			}.bind(this));
		});
	});
});