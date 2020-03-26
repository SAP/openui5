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

	QUnit.module("Given a custom object using escapeParameter with a validator function", {
		before: function () {
			this.CustomObject = ManagedObject.extend("CustomObject", {
				metadata : {
					properties: {
						prop1: {
							type: "object"
						},
						prop2: {
							type: "object"
						}
					}
				},
				constructor: function() {
					ManagedObject.prototype.constructor.apply(
						this,
						escapeParameter(arguments, function (oValue, sPropertyName) {
							return sPropertyName === "prop1";
						})
					);
				}
			});
		},
		beforeEach: function () {
			this.mSettings = {
				prop1: {
					path: "testpath",
					name: "myTest"
				},
				prop2: {
					path: "testpath",
					name: "myTest"
				}
			};
			this.sProp1Exptected = JSON.stringify(this.mSettings.prop1);
			this.sProp2Exptected = undefined;
		},
		afterEach: function () {
			this.oCustomObject.destroy();
		}
	}, function () {
		QUnit.test("When ManagedObject is created with custom ID and settings object", function (assert) {
			this.oCustomObject = new this.CustomObject("test", this.mSettings);
			var vProp1 = JSON.stringify(this.oCustomObject.getProp1());
			var vProp2 = JSON.stringify(this.oCustomObject.getProp2());
			assert.strictEqual(vProp1, this.sProp1Exptected, "the prop1 is escaped correctly");
			assert.strictEqual(vProp2, this.sProp2Exptected, "the prop2 is not escaped and therefore treated as UI5 binding object");
			assert.ok(this.oCustomObject.getBindingInfo("prop2"), "the UI5 binding object is created for prop2");
		});

		QUnit.test("When ManagedObject is created settings object", function (assert) {
			this.oCustomObject = new this.CustomObject(this.mSettings);
			var vProp1 = JSON.stringify(this.oCustomObject.getProp1());
			var vProp2 = JSON.stringify(this.oCustomObject.getProp2());
			assert.strictEqual(vProp1, this.sProp1Exptected, "the prop1 is escaped correctly");
			assert.strictEqual(vProp2, this.sProp2Exptected, "the prop2 is not escaped and therefore treated as UI5 binding object");
			assert.ok(this.oCustomObject.getBindingInfo("prop2"), "the UI5 binding object is created for prop2");
		});
	});

	QUnit.module("Given a custom object using escapeParameter without a validator", {
		before: function () {
			this.CustomObject = ManagedObject.extend("CustomObject", {
				metadata : {
					properties: {
						prop1: {
							type: "object"
						},
						prop2: {
							type: "object"
						}
					}
				},
				constructor: function() {
					ManagedObject.prototype.constructor.apply(this, escapeParameter(arguments));
				}
			});
		},
		beforeEach: function () {
			this.mSettings = {
				prop1: {
					path: "testpath",
					name: "myTest"
				},
				prop2: {
					path: "testpath",
					name: "myTest"
				}
			};
			this.sProp1Exptected = JSON.stringify(this.mSettings.prop1);
			this.sProp2Exptected = JSON.stringify(this.mSettings.prop1);
		},
		afterEach: function () {
			this.oCustomObject.destroy();
		}
	}, function () {
		QUnit.test("When ManagedObject is created with settings object", function (assert) {
			this.oCustomObject = new this.CustomObject(this.mSettings);
			var vProp1 = JSON.stringify(this.oCustomObject.getProp1());
			var vProp2 = JSON.stringify(this.oCustomObject.getProp2());
			assert.strictEqual(vProp1, this.sProp1Exptected, "the prop1 is escaped correctly");
			assert.strictEqual(vProp2, this.sProp2Exptected, "the prop2 is escaped correctly");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
