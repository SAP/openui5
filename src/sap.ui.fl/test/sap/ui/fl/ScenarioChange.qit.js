/*global QUnit,sinon,Promise*/

jQuery.sap.require("sap.ui.fl.FlexController");
jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require('sap.ui.fl.LrepConnector');
jQuery.sap.require('sap.ui.core.Control');
jQuery.sap.require('sap.ui.fl.Cache');
jQuery.sap.require('sap.ui.fl.registry.SimpleChanges');
jQuery.sap.require('sap.ui.fl.registry.ChangeRegistry');

(function(utils, Persistence, FlexController, LrepConnector, $, Control, Cache, SimpleChanges, ChangeRegistry) {
	"use strict";

	var TestingControl = Control.extend("sap.ui.fl.TestingControl", {
		metadata: {
			publicMethods: [
			// methods
			],
			library: "sap.ui.fl",
			properties: {
				label: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	TestingControl.prototype.init = function() {
		var oChangeRegistry = ChangeRegistry.getInstance();
		var sElementName = this.getMetadata().getElementName();
		oChangeRegistry.registerControlForSimpleChange(sElementName, SimpleChanges.renameField);
	};

	sinon.config.useFakeTimers = false;

	QUnit.module("flex change handling", {

		beforeEach: function() {
			Cache.setActive(false);
			Cache._entries = {};

			this.stubs = [];

			// Has to be stubbed, as it is complex to setup a running component in the test.
			// Component must begin with a capital C, otherwise changes cannot be retrieved
			// because the generated URL would be integrationTestingFl/component-changes.json which does not work
			this.stubs.push(sinon.stub(utils, 'getComponentClassName').returns('integrationTestingFl.Component'));

			// Stubs the tenant
			this.stubs.push(sinon.stub(utils, 'getClient').returns('000'));

			// This has to be stubbed, as loadResource from UI5 always resolves URL relative to the resources folder
			// As we are in test-resources, this does not work
			this.stubs.push(sinon.stub(LrepConnector.prototype, 'loadChanges', function(sComponentClassName) {
				var resourceName = jQuery.sap.getResourceName(sComponentClassName, "-changes.json");
				return new Promise(function(resolve, reject) {
					jQuery.ajax({
						url: '/sap/bc/ui5_ui5/sap/' + resourceName,
						headers: {
							"X-UI5-Component": sComponentClassName
						}
					}).done(function(result) {
						var oResult = {
							changes: result
						};
						resolve(oResult);
					}).fail(function(error) {
						reject(error);
					});
				});
			}));

			this.oControl = new TestingControl("testingID1");
		},
		afterEach: function(assert) {
			var done = assert.async();
			QUnit.stop();

			var stubs = this.stubs;
			var deletionPersistence = createPersistence(this.oControl);
			deletionPersistence.getChanges().then(function(changes) {
				$.each(changes, function(changeId, change) {
					change.markForDeletion();
				});

				return deletionPersistence.saveAll();
			}, function() {
				return 0;
			}).then(finalSteps)['catch'](function(err) {
				assert.ok(false, err);
				done();
			});
			var that = this;
			function finalSteps() {
				stubs.forEach(function(stub) {
					stub.restore();
				});
				Cache.setActive(true);
				Cache._entries = {};
				that.oControl.destroy();
				that.oControl = undefined;
				QUnit.start();
			}
		}
	});

	QUnit.test('add end user change and save', function(assert) {
		var done = assert.async();
		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var oChangeParameters = {
			changeType: "renameField",
			fieldLabel: "testFieldLabel",
			isUserDependent: false
		};
		var oFlexController = createFlexController();
		return oFlexController.addChange(oChangeParameters, this.oControl)
			.then(function(oChange) {
				assert.ok(oChange);
				return oFlexController.saveAll(this.oControl);
			}.bind(this))
			.then(function() {
				QUnit.start();
			})
			.catch(function(err) {
				assert.ok(false, err);
				done();
			});
	});

	// FIXME processView has currently the issue, that it will automatically be called when the view is instantiated, this should be fixed, as soon as the real hook is inplace
	//QUnit.test('process view', function(assert) {
	//	var done = assert.async();
	//
	//	// Create different persistence to avoid caching, before every getChanges a new persistence is required
	//	var oChangeParameters = {
	//		changeType: "renameField",
	//		fieldLabel: "testFieldLabel",
	//		isUserDependent: false
	//	};
	//	var oFlexController = createFlexController();
	//	this.stubs.push(sinon.stub(oFlexController, '_hasSmartControls').returns(true));
	//
	//	oFlexController.addChange(oChangeParameters, this.oControl);
	//	var that = this;
	//	oFlexController.saveAll(this.oControl).then(function() {
	//		return oFlexController.processView(that.oControl, "integrationTestingFl.Component");
	//	}).then(function(sStatus) {
	//		assert.strictEqual(that.oControl.getLabel(), "testFieldLabel");
	//		done();
	//	})['catch'](function(oError) {
	//		assert.ok(false, oError.stack);
	//		done();
	//	});
	//
	//});

	function createPersistence(oControl) {
		return new Persistence(oControl, 'id');
	}

	function createFlexController() {
		var oFlexController = new FlexController("integrationTestingFl.Component"); //do not use FlexControllerFactory.create to avoid caching across tests
		return oFlexController;
	}
}(sap.ui.fl.Utils, sap.ui.fl.Persistence, sap.ui.fl.FlexController, sap.ui.fl.FlexControllerFactory, sap.ui.fl.LrepConnector, jQuery, sap.ui.core.Control, sap.ui.fl.Cache, sap.ui.fl.registry.SimpleChanges, sap.ui.fl.registry.ChangeRegistry, sap.ui.core.mvc.View));
