/* eslint-disable quote-props */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Cache",
	"sap/ui/fl/write/api/UI2PersonalizationWriteAPI",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/core/Manifest",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Cache,
	UI2PersonalizationWriteAPI,
	ChangesController,
	Manifest,
	FlexUtils,
	jQuery,
	sinon
) {
	"use strict";

	jQuery('#qunit-fixture').hide();
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

	QUnit.module("setPersonalization", {
		beforeEach: function() {
			this.oAppComponent = createAppComponent();
			this.fnCacheSetPersonalization = sandbox.stub(Cache, "setPersonalization").resolves();
			this.fnCacheDeletePersonalization = sandbox.stub(Cache, "deletePersonalization").resolves();
			sandbox.stub(FlexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("create is called and complains about too few parameters (no properties except selector property)", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: this.oAppComponent
			})
				.then(function() {
					assert.notOk("Should never succeed!");
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

			sandbox.stub(ChangesController, "getFlexControllerInstance").returns(fnMockedFlexController);

			return UI2PersonalizationWriteAPI.create({
				selector: this.oAppComponent,
				containerKey: "someContainerKey",
				itemName: "someItemName",
				content: {}
			})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function () {
					assert.ok(true, "a rejection took place");
					assert.ok(this.fnCacheSetPersonalization.notCalled, "then Cache.setPersonalization is not called");
				}.bind(this));
		});

		QUnit.test("create is called and complains about too few parameters (no containerKey)", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: this.oAppComponent,
				itemName: "someItemName",
				content: {}
			})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function() {
					assert.ok(true, "a rejection took place");
					assert.ok(this.fnCacheSetPersonalization.notCalled, "then Cache.setPersonalization is not called");
				}.bind(this));
		});

		QUnit.test("create is called and complains about too few parameters (no ItemName)", function(assert) {
			return UI2PersonalizationWriteAPI.create({
				selector: this.oAppComponent,
				containerKey: "someContainerKey",
				content: {}
			})
				.then(function() {
					assert.notOk("Should never succeed!");
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
				content: {},
				category: "someCategory",
				containerCategory: "someContainerCategory"
			})
				.then(function() {
					assert.ok(this.fnCacheSetPersonalization.calledWithExactly({
						reference: "testComponent",
						containerKey: "someContainerKey",
						itemName: "someItemName",
						content: {},
						category: "someCategory",
						containerCategory: "someContainerCategory"
					}), "then Cache.setPersonalization is called with correct parameters");
				}.bind(this));
		});

		QUnit.test("deletePersonalization is called and successful", function(assert) {
			return UI2PersonalizationWriteAPI.deletePersonalization({
				selector: this.oAppComponent,
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

			sandbox.stub(ChangesController, "getFlexControllerInstance").returns(fnMockedFlexController);

			return UI2PersonalizationWriteAPI.deletePersonalization({
				selector: this.oAppComponent,
				containerKey: "someContainerKey",
				itemName: "someItemName"
			})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function () {
					assert.ok(true, "a rejection took place");
					assert.ok(this.fnCacheDeletePersonalization.notCalled, "then Cache.deletePersonalization is not called");
				}.bind(this));
		});

		QUnit.test("deletePersonalization gets called and complains about too few parameters (no properties except selector property)", function(assert) {
			return UI2PersonalizationWriteAPI.deletePersonalization({
				selector: this.oAppComponent
			})
				.then(function() {
					assert.notOk("Should never succeed!");
				})
				.catch(function() {
					assert.ok(true, "a rejection took place");
					assert.ok(this.fnCacheDeletePersonalization.notCalled, "then Cache.deletePersonalization is not called");
				}.bind(this));
		});
	});
});