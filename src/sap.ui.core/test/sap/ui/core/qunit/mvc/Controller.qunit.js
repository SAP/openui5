/*global QUnit */
sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/mvc/Controller',
	'sap/base/Log'
], function(Component, Controller, Log) {
	"use strict";

	QUnit.module("getComponent");

	QUnit.test("Should not overwrite getOwnerComponent function", function(assert) {
		// System under Test
		sap.ui.controller("getComponentController", {
			getOwnerComponent : function () {
				return "foo";
			}
		});

		var oController = sap.ui.controller("getComponentController");

		// Act
		var oResult = oController.getOwnerComponent();

		// Assert
		assert.strictEqual(oResult, "foo", "");
	});

	QUnit.test("Should return undefined as component of a controller without view", function(assert) {
		// System under Test
		sap.ui.controller("someController", {});
		var oController = sap.ui.controller("someController");

		// Act
		var oResult = oController.getOwnerComponent();

		// Assert
		assert.strictEqual(oResult, undefined);
	});

	QUnit.test("Should get undefined as component of a controller with a view without component", function(assert) {
		//Arrange
		sap.ui.jsview("myView", {
			createContent : function() {
				return null;
			},
			getController : function() {
				return sap.ui.controller("someController");
			}
		});
		var oView = sap.ui.jsview("foo", "myView");

		// System under Test
		sap.ui.controller("someController", {});
		var oController = oView.getController();
		oController.connectToView(oView);

		// Act
		var oResult = oController.getOwnerComponent();

		// Assert
		assert.strictEqual(oResult, undefined);

		//Cleanup
		oView.destroy();
	});

	QUnit.test("Should get the component of a controller", function(assert) {
		//Arrange
		var oComponent = new Component("foo");

		var oView = oComponent.runAsOwner(function() {
					sap.ui.jsview("myView", {
						createContent : function() {
							return null;
						},
						getController : function() {
							return sap.ui.controller("someController");
						}
					});

					return sap.ui.jsview("bar", "myView");
		});

		// System under Test
		sap.ui.controller("someController", {});

		// Act
		var oController = oView.getController();
		oController.connectToView(oView);
		var oResult = oController.getOwnerComponent();

		// Assert
		assert.strictEqual(oResult, oComponent);

		//Cleanup
		oView.destroy();
	});

	QUnit.module("Controller.create API");

	/**
	 * See @evo-todo in Controller.js
	 */
	QUnit.test("Controller Loading", function (assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/core/mvc/Controller"], function (Controller) {
			Controller.create({
				name: "testdata.mvc.ControllerCreateTest"
			})
			.then(function (oController) {
				assert.equal(oController.double(8), 16, "Controller implementation was correctly returned");
				done();
			});
		});
	});

	QUnit.module("ControllerExtensionTests");

	QUnit.test("Extend Controller with ExtensionDefinition", function(assert) {
		var done = assert.async();

		sap.ui.loader.config({
			paths: {
				"mvc": "test-resources/sap/ui/core/qunit/mvc"
			}
		});

		sap.ui.require(["sap/ui/core/Component"], function(Component) {
			Component.create({
				name: "mvc.testdata.ControllerExtensionTest.Test1"
			})
			.then(function(oComponent) {
				return oComponent.getRootControl().loaded();
			})
			.then(function(oView) {
				var oController = oView.getController();

				assert.ok(oController.triple, "Controller should be extended with 'triple' function");
				assert.equal(oController.double(3), 6, "Controller implementation works correctly");
				assert.equal(oController.triple(3), 9, "Controller implementation works correctly");
				done();
			});
		});
	});
});