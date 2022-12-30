/*global QUnit */
sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/mvc/Controller'
], function(Component, XMLView, Controller) {
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
});