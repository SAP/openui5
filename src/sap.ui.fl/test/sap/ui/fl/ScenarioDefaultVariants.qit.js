/*global strictEqual, module, asyncTest, stop, start, sinon, Promise, ok*/

jQuery.sap.require("sap.ui.fl.Persistence");
jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require('sap.ui.fl.DefaultVariant');
jQuery.sap.require('sap.ui.fl.LrepConnector');
jQuery.sap.require('sap.ui.core.Control');
jQuery.sap.require('sap.ui.fl.Cache');

(function(utils, Persistence, Control, defaultVariant, Change, LrepConnector, $, Cache) {
	"use strict";

	var TestingControl = Control.extend("sap.ui.fl.TestingControl", {
		metadata: {
			publicMethods: [
			// methods
			],
			library: "sap.ui.fl",
			properties: {
				"persistencyKey": {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			}
		}
	});

	sinon.config.useFakeTimers = false;

	var oChangeDefinition;

	module('sap.ui.fl DefaultVariants', {
		setup: function() {
			Cache.setActive(false);

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
						resolve({
							changes: result
						});

					}).fail(function(error) {
						reject(error);
					});
				});
			}));

			oChangeDefinition = {
				type: "testingType",
				ODataService: "testingODataService",
				texts: {
					variantName: "testVariantName"
				},
				content: {
					filterBarVariant: {},
					filterbar: [
						{
							group: "CUSTOM_GROUP",
							name: "MyOwnFilterField",
							partOfVariant: true,
							visibleInFilterBar: true
						}
					]
				},
				isVariant: true,
				abapPackage: "",
				isUserDependend: true
			};
		},
		teardown: function() {
			stop();

			var stubs = this.stubs;
			var deletionPersistence = createPersistence();
			deletionPersistence.getChanges().then(function(changes) {
				$.each(changes, function(changeId, change) {
					change.markForDeletion();
				});

				return deletionPersistence.saveAll();
			}).then(finalSteps)['catch'](function(err) {
				ok(false, err);
				start();
			});

			function finalSteps() {
				stubs.forEach(function(stub) {
					stub.restore();
				});
				Cache.setActive(true);
				start();
			}

		}
	});

	asyncTest('Create two variants, set one default', function() {

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var creationPersistence = createPersistence();
		var setDefaultVariantPersistence = createPersistence();
		var verificationPersistence = createPersistence();

		var oSecondChangeDefinition = JSON.parse(JSON.stringify(oChangeDefinition));
		oSecondChangeDefinition.texts.variantName = 'secondChangeVariant';

		creationPersistence.addChange(oChangeDefinition);
		var secondChangeId = creationPersistence.addChange(oSecondChangeDefinition);

		creationPersistence.saveAll().then(checkCreationAndSetDefaultVariantId).then(saveDefaultVariantChange).then(checkSaveAndGetDefaultVariantId).then(checkDefaultVariantId)['catch'](function(err) {
			ok(false, err);
			start();
		});

		/*********************************************************************************************************/

		function checkCreationAndSetDefaultVariantId(results) {
			strictEqual($.isArray(results), true, 'Save result is array');
			strictEqual(results.length, 2, 'Save result contains two entries');
			strictEqual(results[0].status, 'success', 'Change successfully saved in backend');
			return setDefaultVariantPersistence.setDefaultVariantId(secondChangeId);
		}

		function saveDefaultVariantChange() {
			return setDefaultVariantPersistence.saveAll();
		}

		function checkSaveAndGetDefaultVariantId(results) {
			strictEqual($.isArray(results), true, 'Save result is array');
			strictEqual(results.length > 0, true, 'One change saved');
			strictEqual(results[0].response.changeType, 'defaultVariant', 'Default variant change successfully saved');
			return verificationPersistence.getDefaultVariantId();
		}

		function checkDefaultVariantId(defaultVariantId) {
			strictEqual(defaultVariantId, secondChangeId, 'DefaultVariantId successfully set');
			start();
		}
	});

	asyncTest('Create two variants, create two default variant changes. The newest should be used and the older one deleted automatically', function() {

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var creationPersistence = createPersistence();
		var setDefaultVariantPersistence = createPersistence();
		var setDefaultVariantPersistence2 = createPersistence();
		var verificationPersistence = createPersistence();
		var verificationPersistence2 = createPersistence();

		var oSecondChangeDefinition = JSON.parse(JSON.stringify(oChangeDefinition));
		oSecondChangeDefinition.texts.variantName = 'secondChangeVariant';

		var firstChangeId = creationPersistence.addChange(oChangeDefinition);
		var secondChangeId = creationPersistence.addChange(oSecondChangeDefinition);

		creationPersistence.saveAll().then(checkCreationAndSetDefaultVariantId).then(saveDefaultVariantChange).then(checkSaveThenCreateAndSaveSecondDefaultVariantChange).then(checkSaveAndGetChanges).then(checkDefaultVariantChangesAndSave).then(checkDeletionAndGetChangesAgain).then(checkNumberOfDefaultVariantChanges)['catch'](function(err) {
			ok(false, err);
			start();
		});

		/*********************************************************************************************************/

		function checkCreationAndSetDefaultVariantId(results) {
			strictEqual($.isArray(results), true, 'Save result is array');
			strictEqual(results.length, 2, 'Save result contains two entries');
			strictEqual(results[0].status, 'success', 'Change successfully saved in backend');
			return setDefaultVariantPersistence.setDefaultVariantId(secondChangeId);
		}

		function saveDefaultVariantChange() {
			return setDefaultVariantPersistence.saveAll();
		}

		function checkSaveThenCreateAndSaveSecondDefaultVariantChange(results) {
			strictEqual($.isArray(results), true, 'Save result is array');
			strictEqual(results.length > 0, true, 'One change saved');
			strictEqual(results[0].response.changeType, 'defaultVariant', 'Default variant change successfully saved');

			// use sync version without getting the changes to trick the API in creating a second default variant change
			setDefaultVariantPersistence2.setDefaultVariantIdSync(firstChangeId);
			return setDefaultVariantPersistence2.saveAll();
		}

		function checkSaveAndGetChanges(results) {
			strictEqual($.isArray(results), true, 'Save result is array');
			strictEqual(results.length > 0, true, 'One change saved');
			strictEqual(results[0].response.changeType, 'defaultVariant', 'Second default variant change successfully saved');
			return verificationPersistence.getChanges();
		}

		function checkDefaultVariantChangesAndSave(changes) {
			var defaultVarChanges = defaultVariant.getDefaultVariantChanges(changes);
			strictEqual(defaultVarChanges.length, 2, 'Two default variant changes found');
			var newestChangeId = verificationPersistence.getDefaultVariantIdSync();
			strictEqual(newestChangeId, firstChangeId, 'The default variant change added last is the current default');

			// getDefaultVariantIdSync has marked the older change for deletion, setDefaultVariantId(Sync) would have done the same
			return verificationPersistence.saveAll();
		}

		function checkDeletionAndGetChangesAgain(results) {
			strictEqual($.isArray(results), true, 'Save result is array');
			strictEqual(results.length, 1, 'One change deleted');
			return verificationPersistence2.getChanges();
		}

		function checkNumberOfDefaultVariantChanges(changes) {
			var defaultVarChanges = defaultVariant.getDefaultVariantChanges(changes);
			strictEqual(defaultVarChanges.length, 1, 'One default variant changes found');
			start();
		}
	});

	function createPersistence() {
		return new Persistence(new TestingControl({
			persistencyKey: 'testingPersistencyKey'
		}), 'persistencyKey');
	}

}(sap.ui.fl.Utils, sap.ui.fl.Persistence, sap.ui.core.Control, sap.ui.fl.DefaultVariant, sap.ui.fl.Change, sap.ui.fl.LrepConnector, jQuery, sap.ui.fl.Cache));
