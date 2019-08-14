/* eslint-disable quote-props */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Cache",
	"sap/ui/fl/write/api/UI2PersonalizationWriteAPI",
	"sap/ui/fl/apply/internal/ChangesController",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Cache,
	UI2PersonalizationWriteAPI,
	ChangesController,
	jQuery,
	sinon
) {
	"use strict";

	jQuery('#qunit-fixture').hide();
	var sandbox = sinon.sandbox.create();

	QUnit.module("setPersonalization", {
		beforeEach: function() {
			this.fnCacheSetPersonalization = sandbox.stub(Cache, "setPersonalization").resolves();
			this.fnCacheDeletePersonalization = sandbox.stub(Cache, "deletePersonalization").resolves();
		},
		afterEach: function () {
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
					assert.ok(this.fnCacheSetPersonalization.notCalled, "then Cache.setPersonalization is not called");
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
					assert.ok(this.fnCacheSetPersonalization.notCalled, "then Cache.setPersonalization is not called");
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
					assert.ok(this.fnCacheSetPersonalization.notCalled, "then Cache.setPersonalization is not called");
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
					assert.ok(this.fnCacheSetPersonalization.notCalled, "then Cache.setPersonalization is not called");
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
					assert.ok(this.fnCacheSetPersonalization.calledWithExactly({
						reference: "testComponent",
						containerKey: "someContainerKey",
						itemName: "someItemName",
						content: {}
					}), "then Cache.setPersonalization is called with correct parameters");
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
					assert.ok(this.fnCacheDeletePersonalization.calledWithExactly("testComponent", "someContainerKey", "someItemName"), "then Cache.deletePersonalization is called with correct parameters");
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
					assert.ok(this.fnCacheDeletePersonalization.notCalled, "then Cache.deletePersonalization is not called");
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
					assert.ok(this.fnCacheDeletePersonalization.notCalled, "then Cache.deletePersonalization is not called");
				}.bind(this));
		});
	});
});