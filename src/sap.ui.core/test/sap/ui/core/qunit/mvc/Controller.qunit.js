/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/mvc/Controller',
	'sap/base/Log'
], function(Component, Fragment, XMLView, Controller, Log) {
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

	QUnit.module("Fragment Destroy / Asynchronous", {
		before: function() {
			this.oLogErrorSpy = sinon.spy(Log, "error");
		},
		beforeEach: function() {
			this.oLogErrorSpy.reset();
		},
		after: function() {
			this.oLogErrorSpy.restore();
		}
	});

	QUnit.test("Multiple asynchronous Fragment.create - duplicate ID issue expected", function(assert){
		assert.expect(2);
		var aFragmentPromises = [];
		var assertCatch = function(oErr) {
			// Catch should be only executed once for the failing Fragment.load (independent which fragment is first).
			assert.ok(true, "Promise is rejected correctly because of duplicate ID error");
			assert.strictEqual(oErr.message, "Error: adding element with duplicate id 'xmlViewInsideFragment'", "Error message is correct");
		};

		Controller.extend("my.controller", {

			onInit: function(){
				this._pFragment = Fragment.load({
					name: "testdata.fragments.XMLView",
					type: "XML"
				});
			}
		});

		var pView1 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			aFragmentPromises.push(oView.getController()._pFragment.catch(assertCatch));
			return oView;
		});

		var pView2 = XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
						"</mvc:View>"
		}).then(function(oView){
			aFragmentPromises.push(oView.getController()._pFragment.catch(assertCatch));
			return oView;
		});

		return Promise.all([pView1, pView2]).then(function (oArguments) {
			return Promise.allSettled(aFragmentPromises).then(function(){
				// Clean-Up
				oArguments[0].destroy();
				oArguments[1].destroy();
				sap.ui.getCore().byId("xmlViewInsideFragment").destroy();
			});
		});
	});

	QUnit.test("Multiple asynchronous Controller.loadFragment - no duplicate ID issue expectecd", function(assert){
		assert.expect(0);

		Controller.extend("my.controller", {

			onInit: function(){
				this._pFragment = this.loadFragment({
					name: "testdata.fragments.XMLView",
					type: "XML"
				});
			}
		});
		XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			oView.destroy();
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
						"</mvc:View>"
		}).then(function(oView){
			return oView.getController()._pFragment.then(function() {
				oView.destroy();
			});

		}).catch(function(oErr) {
			assert.ok(false, "should not reject with duplicate ID error");
		});
	});

	QUnit.test("Fragment.create - add to dependents after destruction of view", function(assert){
		assert.expect(3);

		Controller.extend("my.controller", {

			onInit: function(){
				this._pFragment = Fragment.load({
					name: "testdata.fragments.XMLView",
					type: "XML"
				}).then(function(oControl) {
					this.getView().addDependent(oControl);
				}.bind(this));
			}
		});
		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			var pFragmentPromise = oView.getController()._pFragment;
			oView.destroy();
			return pFragmentPromise.then(function() {
				assert.ok(oView.isDestroyed(), "View destroyed");
				assert.ok(oView.getDependents().length === 1, "View has 1 dependent");
				// Nested view is not destroyed. That's the reason why we have introduced Controller.prototype.loadFragment
				assert.notOk(oView.getDependents()[0].isDestroyed(), "Nested view is not destroyed");
				oView.getDependents()[0].destroy();
			});
		});
	});

	QUnit.test("Controller.loadFragment - dependents cleaned up correctly", function(assert){
		assert.expect(3);

		Controller.extend("my.controller", {

			onInit: function(){
				this._pFragment = this.loadFragment({
					name: "testdata.fragments.XMLView",
					type: "XML"
				});
			}
		});
		XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			oView.destroy();
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
						"</mvc:View>"
		}).then(function(oView){
			return oView.getController()._pFragment.then(function() {
				assert.ok(oView.byId("xmlViewInsideFragment"), "Nested view added to dependents");
				assert.ok(oView.getDependents().length === 1, "View has 1 dependent");
				assert.equal(oView.getDependents()[0], oView.byId("xmlViewInsideFragment"), "View correctly added to dependents");
				oView.destroy();
			});

		}).catch(function() {
			assert.ok(false, "should not reject with duplicate ID error");
		});
	});

	QUnit.test("Controller.loadFragment - owner component set correctly", function(assert){
		assert.expect(1);

		var oComponent = new Component({id: "myComponent"});
		var pFragmentReady;

		Controller.extend("my.controller", {
			onInit: function(){
				pFragmentReady = new Promise(function(res, rej) {
					this.loadFragment({
						name: "testdata.fragments.XMLView",
						type: "XML",
						id: "horst"
					}).then(function() {
						res([]);
					});
				}.bind(this));
			}
		});

		return oComponent.runAsOwner(function() {
			return XMLView.create({
				definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
				"</mvc:View>"
			}).then(function(oView){
				return pFragmentReady.then(function() {
					assert.equal(oComponent, Component.getOwnerComponentFor(oView.getDependents()[0]), "Owner component set cortrectly for fragment");
					oComponent.destroy();
				});
			});
		});
	});

	QUnit.test("Controller.loadFragment - add not to dependents", function(assert){
		assert.expect(1);

		var pFragmentReady;

		Controller.extend("my.controller", {
			onInit: function(){
				pFragmentReady = new Promise(function(res, rej) {
					this.loadFragment({
						name: "testdata.fragments.XMLView",
						type: "XML",
						addToDependents: false
					}).then(function() {
						res([]);
					});
				}.bind(this));
			}
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			return pFragmentReady.then(function() {
				assert.equal(oView.getDependents().length, 0, "Fragment is not added to the dependents aggregation of the view");
				oView.destroy();
			});
		});
	});

	QUnit.test("Controller.loadFragment - no fragment ID and no autoPrefixId", function(assert){
		assert.expect(2);

		var pFragmentReady;

		Controller.extend("my.controller", {
			onInit: function(){
				pFragmentReady = new Promise(function(res, rej) {
					this.loadFragment({
						name: "testdata.fragments.XMLView",
						type: "XML",
						autoPrefixId: false
					}).then(function() {
						res([]);
					});
				}.bind(this));
			}
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			return pFragmentReady.then(function() {
				assert.ok(sap.ui.getCore().byId("xmlViewInsideFragment"), "Fragment content is not prefixed by any ID.");
				assert.notOk(oView.byId("xmlViewInsideFragment"), "Fragment content is not prefixed by the view ID.");
				oView.destroy();
			});
		});
	});

	QUnit.test("Controller.loadFragment - fragment ID but no autoPrefixId", function(assert){
		assert.expect(2);

		var pFragmentReady;

		Controller.extend("my.controller", {
			onInit: function(){
				pFragmentReady = new Promise(function(res, rej) {
					this.loadFragment({
						name: "testdata.fragments.XMLView",
						type: "XML",
						id: "myFragment",
						autoPrefixId: false
					}).then(function() {
						res([]);
					});
				}.bind(this));
			}
		});

		return XMLView.create({
			definition: "<mvc:View xmlns:mvc='sap.ui.core.mvc' controllerName='my.controller'>" +
			"</mvc:View>"
		}).then(function(oView){
			return pFragmentReady.then(function() {
				assert.ok(sap.ui.getCore().byId("myFragment--xmlViewInsideFragment"), "Fragment content is prefixed by the given ID.");
				assert.notOk(oView.byId("myFragment--xmlViewInsideFragment"), "Fragment content is not prefixed by the view ID.");
				oView.destroy();
			});
		});
	});
});