/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/Base"
],
function(
	jQuery,
	Base
) {
	"use strict";

	var oControl;

	QUnit.module("sap.ui.fl.changeHandler.Base", {
		beforeEach: function () {
			this.stubs = [];
			this.oBaseHandler = Base;
		},
		afterEach: function () {
			this.stubs.forEach(function (stub) {
				stub.restore();
			});

			if (oControl) {
				oControl.destroy();
			}
		}
	}, function () {
		QUnit.test('setTextInChange', function (assert) {
			var oChange = {
				"selector": {
					"id": "QUnit.testkey"
				}
			};
			this.oBaseHandler.setTextInChange(oChange, "fieldLabel", "new field label", "XFLD");
			assert.ok(oChange.texts.fieldLabel);
			assert.equal(oChange.texts.fieldLabel.value, "new field label");
			assert.equal(oChange.texts.fieldLabel.type, "XFLD");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});