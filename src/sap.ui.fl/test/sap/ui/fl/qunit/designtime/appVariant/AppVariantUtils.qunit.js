/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/designtime/appVariant/AppVariantUtils",
	"sap/ui/fl/designtime/appVariant/ChangeModifier",
	"sap/ui/fl/designtime/appVariant/AppVariantModifier"
],
	function (sinon, AppVariantUtils, ChangeModifier, AppVariantModifier) {
		"use strict";

		QUnit.module("validates input", {
			beforeEach: function () {
				this.sandbox = sinon.sandbox.create();
			},
			afterEach: function () {
				this.sandbox.restore();
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

		function prepareMocks(oModifier, iReturnArgument) {
			this.sandbox = sinon.sandbox.create();

			// hand crafted mock to check even on functions called after a .bind
			this.originalModifyFunction = oModifier.modify;
			this.callCount = 0;
			this.callArguments = [];
			oModifier.modify = function () {
				this.callCount++;
				this.callArguments.push(arguments);
				return arguments[iReturnArgument];
			}.bind(this);

		}

		QUnit.module("calls ChangeModifier", {
			beforeEach: function () {
				prepareMocks.call(this, ChangeModifier, 3);
			},
			afterEach: function () {
				this.sandbox.restore();
				ChangeModifier.modify = this.originalModifyFunction;
			}
		}, function () {
			QUnit.test("the default was set and passed correctly", function (assert) {
				return AppVariantUtils.prepareContent([], {}, "newReference", "1.0.0", undefined)
					.then(function () {
						assert.equal(this.callArguments[0][2], sap.ui.fl.Scenario.VersionedAppVariant, "the flag was passed correctly to a modifier");
					}.bind(this));
			});

			QUnit.test("calls the ChangeModifier once", function (assert) {
				return AppVariantUtils.prepareContent([], {}, "newReference", "1.0.0")
					.then(function () {
						assert.equal(this.callCount, 1, "the ChangeModifier was called once");
					}.bind(this));
			});
		});

		QUnit.module("calls AppVariantModifier", {
			beforeEach: function () {
				prepareMocks.call(this, AppVariantModifier, 1);
			},
			afterEach: function () {
				this.sandbox.restore();
				AppVariantModifier.modify = this.originalModifyFunction;
			}
		}, function () {
			QUnit.test("the default was set and passed correctly", function (assert) {
				var aFiles = [];
				var oNewAppVariant = {};
				return AppVariantUtils.prepareContent(aFiles, oNewAppVariant, "newReference", "1.0.0")
					.then(function () {
						assert.equal(this.callArguments[0][0], oNewAppVariant, "oNewAppVariant was passed correctly through the promise chain to AppVariantModifier");
						assert.deepEqual(this.callArguments[0][1], aFiles, "aFiles was passed correctly through the promise chain to AppVariantModifier");
					}.bind(this));
			});

			QUnit.test("calls the AppVariantModifier once", function (assert) {
				return AppVariantUtils.prepareContent([], {}, "newReference", "1.0.0")
					.then(function () {
						assert.equal(this.callCount, 1, "the AppVariantModifier was called once");
					}.bind(this));
			});
		});

		QUnit.done(function () {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});