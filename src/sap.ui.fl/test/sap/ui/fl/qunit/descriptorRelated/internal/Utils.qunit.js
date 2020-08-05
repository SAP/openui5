/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	Utils,
	Settings,
	sinon
) {
	"use strict";

	var oSandbox = sinon.sandbox.create();
	QUnit.module("Utils", {
		beforeEach : function() {
			oSandbox = sinon.sandbox.create();

			oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach : function() {
			oSandbox.restore();
		}
	}, function() {
		QUnit.test("getNameAndNameSpace", function(assert) {
			assert.deepEqual(Utils.getNameAndNameSpace("id", "reference"), {
				fileName: "manifest",
				namespace: "apps/reference/appVariants/id/"
			});
		});

		QUnit.test("checkEntityPropertyChange", function(assert) {
			assert.equal(Utils.checkEntityPropertyChange({
				entityPropertyChange: {
					propertyPath: "signature/parameters/id/required",
					operation: "INSERT",
					propertyValue: false
				}
			}), undefined);
			assert.equal(Utils.checkEntityPropertyChange({
				entityPropertyChange: {
					propertyPath: "signature/parameters/id/required",
					operation: "UPDATE",
					propertyValue: false
				}
			}), undefined);
			assert.equal(Utils.checkEntityPropertyChange({
				entityPropertyChange: {
					propertyPath: "signature/parameters/id/required",
					operation: "UPSERT",
					propertyValue: false
				}
			}), undefined);
			assert.equal(Utils.checkEntityPropertyChange({
				entityPropertyChange: {
					propertyPath: "signature/parameters/id/required",
					operation: "DELETE"
				}
			}), undefined);
		});

		QUnit.test("checkEntityPropertyChange failure", function (assert) {
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
					}
				});
			});
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
						propertyPath: "signature/parameters/id/required"
					}
				});
			});
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
						propertyPath: "signature/parameters/id/required",
						operation: "UPSERT"
					}
				});
			});
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
						propertyPath: "signature/parameters/id/required",
						propertyValue: false
					}
				});
			});
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
						operation: "UPSERT",
						propertyValue: false
					}
				});
			});
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
						propertyPath: 1,
						operation: "UPSERT",
						propertyValue: false
					}
				});
			});
			assert.throws(function() {
				Utils.checkEntityPropertyChange({
					entityPropertyChange: {
						propertyPath: "signature/parameters/id/required",
						operation: "HUGO",
						propertyValue: false
					}
				});
			});
		});

		QUnit.test("checkTexts", function(assert) {
			assert.equal(Utils.checkTexts(), undefined);
			assert.equal(Utils.checkTexts({
				category: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Category example default text",
						en: "Category example text in en",
						de: "Kategorie Beispieltext in de",
						en_US: "Category example text in en_US"
					}
				}
			}), undefined);
		});

		QUnit.test("checkTexts failure", function(assert) {
			assert.throws(function() {
				Utils.checkTexts("wrong type");
			});
		});

		QUnit.test("checkPackage", function(assert) {
			assert.equal(Utils.checkPackage("MYPACKAGE"), undefined);
			assert.equal(Utils.checkPackage("/UI5/MYPACKAGE"), undefined);
		});

		QUnit.test("checkPackage failure", function(assert) {
			assert.throws(function() {
				Utils.checkPackage("wrong type");
			});
			assert.throws(function() {
				Utils.checkPackage("wrongtype");
			});
		});

		QUnit.test("checkTransportRequest", function(assert) {
			assert.equal(Utils.checkTransportRequest("ATO_NOTIFICATION"), undefined);
			assert.equal(Utils.checkTransportRequest("ABCK035075"), undefined);
		});

		QUnit.test("checkTransportRequest failure", function(assert) {
			assert.throws(function() {
				Utils.checkTransportRequest("wrong type");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
