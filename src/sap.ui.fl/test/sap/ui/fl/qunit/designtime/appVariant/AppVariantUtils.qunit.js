/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/designtime/appVariant/AppVariantUtils",
	"sap/ui/fl/designtime/appVariant/ChangeModifier",
	"sap/ui/fl/designtime/appVariant/AppVariantModifier",
	"sap/ui/fl/designtime/appVariant/ModuleModifier"
], function (sinon, AppVariantUtils, ChangeModifier, AppVariantModifier, ModuleModifier) {
		"use strict";

		var sandbox = sinon.sandbox.create();

		QUnit.module("AppVariantUtils", {
			afterEach: function () {
				sandbox.restore();
			}
		}, function () {
			QUnit.test("does complain about missing files", function (assert) {
				assert.throws(AppVariantUtils.prepareContent());
			});
			QUnit.test("does complain about missing appDescriptorVariant object", function (assert) {
				assert.throws(AppVariantUtils.prepareContent([]));
			});
			QUnit.test("does complain about missing new reference", function (assert) {
				assert.throws(AppVariantUtils.prepareContent([], {}));
			});
			QUnit.test("does complain about empty new reference", function (assert) {
				assert.throws(AppVariantUtils.prepareContent([], {}, ""));
			});
			QUnit.test("does complain about missing new version", function (assert) {
				assert.throws(AppVariantUtils.prepareContent([], {}, "newReference"));
			});
			QUnit.test("does complain about empty new version", function (assert) {
				assert.throws(AppVariantUtils.prepareContent([], {}, "newReference", ""));
			});
		});

		QUnit.module("AppVariantUtils", {
			before: function () {
				this.oModifyModuleSpy = sandbox.spy(ModuleModifier, "modify");
				this.oModifyChangeSpy = sandbox.spy(ChangeModifier, "modify");
				this.oModifyAppVariantStub = sandbox.stub(AppVariantModifier, "modify");
			},
			afterEach: function () {
				sandbox.restore();
			}
		}, function () {
			QUnit.test("does pass arguments though the whole promise chain", function (assert) {
				var aFiles = [];
				var newVersion = "1.0.0";
				var newReference = "newReference";
				var oNewAppVariant = {};
				return AppVariantUtils.prepareContent(aFiles, oNewAppVariant, newReference, newVersion)
				.then(function () {
					assert.equal(this.oModifyModuleSpy.callCount, 1, "ModuleModifier was called once");
					assert.equal(this.oModifyModuleSpy.getCall(0).args[0], newReference, "newReference was passed correctly through the promise chain to ModuleModifier");
					assert.equal(this.oModifyModuleSpy.getCall(0).args[1], aFiles, "aFiles was passed correctly through the promise chain to ModuleModifier");

					assert.equal(this.oModifyChangeSpy.callCount, 1, "ChangeModifier was called once");
					assert.equal(this.oModifyChangeSpy.getCall(0).args[0], newReference, "newReference was passed correctly to the ChangeModifier");
					assert.equal(this.oModifyChangeSpy.getCall(0).args[1], newVersion, "the version was passed correctly to the ChangeModifier");
					assert.equal(this.oModifyChangeSpy.getCall(0).args[2], sap.ui.fl.Scenario.VersionedAppVariant, "the flag was passed correctly to the ChangeModifier");
					assert.equal(this.oModifyChangeSpy.getCall(0).args[3], aFiles, "aFiles was passed correctly through the promise chain to the ChangeModifier");

					assert.equal(this.oModifyAppVariantStub.callCount, 1, "AppVariantModifier was called once");
					assert.equal(this.oModifyAppVariantStub.getCall(0).args[0], oNewAppVariant, "oNewAppVariant was passed correctly through the promise chain to AppVariantModifier");
					assert.deepEqual(this.oModifyAppVariantStub.getCall(0).args[1], aFiles, "aFiles was passed correctly through the promise chain to AppVariantModifier");
				}.bind(this));
			});
		});
				QUnit.done(function () {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});