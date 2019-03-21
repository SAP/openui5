/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/designtime/appVariant/ModifierUtils",
	"sap/ui/fl/designtime/appVariant/ModuleModifier",
	"sap/ui/fl/designtime/appVariant/ChangeModifier",
	"sap/ui/fl/designtime/appVariant/AppVariantModifier"
], function (sinon, ModifierUtils, ModuleModifier, ChangeModifier, AppVariantModifier) {
		"use strict";

		var sandbox = sinon.sandbox.create();

		QUnit.module("ModuleModifier", {
			before: function () {
				this.fileNameChange = "/changes/id_1550588173383_10_changeLabel.change";
				this.fileNameCodeExt = "/changes/coding/x11.js";
				this.fileNameFragment = "/changes/fragments/test.xml";
				this.fileNameDescriptorChange = "/descriptorChanges/test.change";

				this.fileNameChangeInSubfolder = "/changes/subfolder/id_1550588173383_10_changeLabel.change";
				this.fileNameCodeExtInSubfolder = "/changes/coding/subfolder/x11.js";
				this.fileNameFragmentInSubfolder = "/changes/fragments/subfolder/test.xml";
				this.fileNameDescriptorChangeInSubfolder = "/descriptorChanges/subfolder/test.change";

			},
			beforeEach: function() {
				this.fileNameMatchesPatternSpy = sandbox.spy(ModifierUtils, "fileNameMatchesPattern");
			},
			afterEach: function () {
				sandbox.restore();
			}
		}, function () {
			QUnit.test("does return true if the given fileName matches the given pattern", function (assert) {

				assert.ok(ModifierUtils.fileNameMatchesPattern(this.fileNameChange, ChangeModifier.CHANGE_PATTERN), "fileName matches the given pattern");
				assert.ok(ModifierUtils.fileNameMatchesPattern(this.fileNameCodeExt, ModuleModifier.CODE_EXT_PATTERN), "fileName matches the given pattern");
				assert.ok(ModifierUtils.fileNameMatchesPattern(this.fileNameFragment, ModuleModifier.FRAGMENT_PATTERN), "fileName matches the given pattern");
				assert.ok(ModifierUtils.fileNameMatchesPattern(this.fileNameDescriptorChange, AppVariantModifier.DESCRIPTOR_CHANGE_PATTERN), "fileName matches the given pattern");

				assert.equal(this.fileNameMatchesPatternSpy.callCount, 4, "fileNameMatchesPattern was called 4 times");
			});
			QUnit.test("does return false if the given fileName does not match the given pattern", function (assert) {

				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameChange, ModuleModifier.CODE_EXT_PATTERN), "fileName does not match the given pattern");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameChange, ModuleModifier.FRAGMENT_PATTERN), "fileName does not match the given pattern");

				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameCodeExt, ChangeModifier.CHANGE_PATTERN), "fileName does not match the given pattern");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameCodeExt, ModuleModifier.FRAGMENT_PATTERN), "fileName does not match the given pattern");

				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameFragment, ChangeModifier.CHANGE_PATTERN), "fileName does not match the given pattern");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameFragment, ModuleModifier.CODE_EXT_PATTERN), "fileName does not match the given pattern");

				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameDescriptorChange, ChangeModifier.CHANGE_PATTERN), "fileName does not match the given pattern");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameDescriptorChange, ModuleModifier.CODE_EXT_PATTERN), "fileName does not match the given pattern");

				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameChangeInSubfolder, ChangeModifier.CHANGE_PATTERN), "sub folders are disregarded");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameCodeExtInSubfolder, ModuleModifier.CODE_EXT_PATTERN), "sub folders are disregarded");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameFragmentInSubfolder, ModuleModifier.FRAGMENT_PATTERN), "sub folders are disregarded");
				assert.notOk(ModifierUtils.fileNameMatchesPattern(this.fileNameDescriptorChangeInSubfolder, AppVariantModifier.DESCRIPTOR_CHANGE_PATTERN), "sub folders are disregarded");

				assert.equal(this.fileNameMatchesPatternSpy.callCount, 12, "fileNameMatchesPattern was called 12 times");
			});
		});
		QUnit.done(function () {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});