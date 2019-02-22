/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
		"sap/ui/thirdparty/sinon-4",
		"sap/ui/fl/designtime/appVariant/AppVariantUtils",
		"sap/ui/fl/designtime/appVariant/ChangeModifier"
	],
	function (sinon, AppVariantUtils, ChangeModifier) {
		"use strict";

		QUnit.module("validates input", {
			beforeEach: function () {
				this.sandbox = sinon.sandbox.create();
			},
			afterEach: function () {
				this.sandbox.restore();
			}
		}, function() {
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
				assert.throws(AppVariantUtils.prepareContent([], {}, "newReference" , ""));
			});
		});

		function prepareMocks() {
			this.sandbox = sinon.sandbox.create();

			// hand crafted mock to check even on functions called after a .bind
			this.originalChangeModifierModifyFunction = ChangeModifier.modify;
			this.callCount = 0;
			this.callArguments = [];
			ChangeModifier.modify = function () {
				this.callCount++;
				this.callArguments.push(arguments);
			}.bind(this);
		}

		QUnit.module("sets the versioned app variant flag correctly", {
			beforeEach: function () {
				prepareMocks.call(this);
			},
			afterEach: function () {
				this.sandbox.restore();
				ChangeModifier.modify = this.originalChangeModifierModifyFunction;
			}
		}, function() {
			QUnit.test("the default was set and passed correctly", function (assert) {
				return AppVariantUtils.prepareContent([], {}, "newReference", "1.0.0", undefined)
					.then(function () {
						assert.equal(this.callArguments[0][2], sap.ui.fl.Scenario.VersionedAppVariant, "the flag was passed correctly to a modifier");
					}.bind(this));
			});
		});

		QUnit.module("calls modifiers", {
			beforeEach: function () {
				prepareMocks.call(this);
			},
			afterEach: function () {
				this.sandbox.restore();
				ChangeModifier.modify = this.originalChangeModifierModifyFunction;
			}
		}, function() {
			QUnit.test("calls the ChangeModifier", function (assert) {
				return AppVariantUtils.prepareContent([], {}, "newReference", "1.0.0")
					.then(function () {
						assert.equal(this.callCount, 1, "the ChangeModifier was called once");
					}.bind(this));
			});
		});

		QUnit.done(function() {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});