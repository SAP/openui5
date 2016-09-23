/*globals QUnit */

jQuery.sap.require("sap.ui.fl.changeHandler.Base");
jQuery.sap.require('sap.ui.core.Control');
jQuery.sap.require("sap.ui.core.LayoutData");

(function (Base, Control, LayoutData) {
	var oControl;

	QUnit.module("sap.ui.fl.changeHandler.Base", {
		setup: function () {
			this.stubs = [];
			this.oBaseHandler = Base;
		},
		teardown: function () {
			this.stubs.forEach(function (stub) {
				stub.restore();
			});

			if (oControl) {
				oControl.destroy();
			}
		}
	});


	QUnit.test('setTextInChange', function () {
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

}(sap.ui.fl.changeHandler.Base, sap.ui.core.Control, sap.ui.core.LayoutData));
