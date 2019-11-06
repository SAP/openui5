/* global QUnit */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/integration/designtime/baseEditor/util/escapeParameter"
],
function (
	ManagedObject,
	escapeParameter
) {
	"use strict";

	var CustomObject = ManagedObject.extend("CustomObject", {
		metadata : {
			properties: {
				config: {
					type: "object"
				}
			}
		},
		constructor: function() {
			ManagedObject.prototype.constructor.apply(this, escapeParameter(arguments, "config"));
		}
	});

	QUnit.module("Given a custom object using function escapeParameter in the constructor", {
		beforeEach: function () {
			this.oInputParameter = {
				config: {
					path: "testpath",
					name: "myTest"
				}
			};
			this.sExpectedConfig = JSON.stringify(this.oInputParameter.config);
		},
		afterEach: function () {
			this.oInputParameter = undefined;
			this.sExpectedConfig = undefined;
		}
	}, function () {
		QUnit.test("When created with config parameters and an additional parameter", function (assert) {
			var oCustomObject = new CustomObject("test", this.oInputParameter);
			var sConfig = JSON.stringify(oCustomObject.getConfig());
			assert.strictEqual(sConfig, this.sExpectedConfig, "the config is escaped correctly");
		});

		QUnit.test("WWhen created with config parameters only", function (assert) {
			var oCustomObject = new CustomObject(this.oInputParameter);
			var sConfig = JSON.stringify(oCustomObject.getConfig());
			assert.strictEqual(sConfig, this.sExpectedConfig, "the config is escaped correctly");
		});
	});
});
