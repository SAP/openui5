/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/iframe/SettingsDialog",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function (
	SettingsDialog,
	Log,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();

	var sandbox = sinon.sandbox.create();
	var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	function createDialog() {
		var oSettingsDialog = new SettingsDialog();
		return oSettingsDialog;
	}

	QUnit.module("Given that a SettingsDialog is available...", {
		beforeEach: function () {},
		afterEach: function () {
			this.oSettingsDialog.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When SettingsDialog gets initialized and open is called,", function (assert) {
			var done = assert.async();
			this.oSettingsDialog = createDialog();
			this.oSettingsDialog.attachOpened(function () {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this._oDialog.getTitle(), oTextResources.getText("IFRAME_SETTINGS_DIALOG_TITLE"), "then the title is set");
				assert.equal(this._oDialog.getContent().length, 3, "then 3 SimpleForms are added ");
				assert.equal(this._oDialog.getButtons().length, 2, "then 2 buttons are added");
				done();
			});
			this.oSettingsDialog.open();
		});
	});
});