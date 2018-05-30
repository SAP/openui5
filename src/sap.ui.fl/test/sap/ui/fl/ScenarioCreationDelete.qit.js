/*global QUnit,sinon,Promise*/

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

	QUnit.module("sap.ui.fl Creation & Deletion", {
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
		afterEach: function(assert) {
			var done = assert.async();
			stop();

			var stubs = this.stubs;
			var deletionPersistence = createPersistence();
			deletionPersistence.getChanges().then(function(changes) {
				$.each(changes, function(changeId, change) {
					change.markForDeletion();
				});

				return deletionPersistence.saveAll();
			}).then(finalSteps)['catch'](function(err) {
				assert.ok(false, err);
				done();
			});

			function finalSteps() {
				stubs.forEach(function(stub) {
					stub.restore();
				});
				Cache.setActive(true);
				Cache._entries = {};
				done();
			}
		}
	});

	QUnit.test('Create a user dependant variant in the user layer and delete it afterwards', function(assert) {
		var done = assert.async();

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var creationPersistence = createPersistence();
		var deletionPersistnce = createPersistence();

		var newChangeId = creationPersistence.addChange(oChangeDefinition);

		creationPersistence.saveAll().then(checkSaveAndGetSavedChanges).then(checkSavedChangesAndMarkForDeletion).then(checkDeletion)['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

		/*********************************************************************************************************/

		function checkSaveAndGetSavedChanges(results) {
			assert.strictEqual($.isArray(results), true, 'Save result is array');
			assert.strictEqual(results.length, 1, 'Save result contains one entry');
			assert.strictEqual(results[0].status, 'success', 'Change successfully saved in backend');
			return deletionPersistnce.getChanges();
		}

		function checkSavedChangesAndMarkForDeletion(changes) {
			var containsChangeId = false;

			$.each(changes, function(changeId, change) {
				change.markForDeletion();
				if (changeId === newChangeId) {
					containsChangeId = true;
				}
			});
			assert.strictEqual(containsChangeId, true, 'Change successfully received from backend');

			return deletionPersistnce.saveAll();
		}

		function checkDeletion(results) {
			assert.strictEqual($.isArray(results), true, 'Save result is array');
			assert.strictEqual(results.length > 0, true, 'Change successfully deleted from backend');
			done();
		}
	});

	QUnit.test('Create a non-user dependant variant, it should be created in the current layer setting (VENDOR); delete it afterwards', function(assert) {
		var expectedLayer = 'VENDOR';
		execlayerTestCase.call(this, assert, expectedLayer);
	});

	QUnit.test('Create a non-user dependant variant, it should be created in the current layer setting (CUSTOMER); delete it afterwards', function(assert) {
		var expectedLayer = 'CUSTOMER';
		execlayerTestCase.call(this, assert, expectedLayer);
	});

	function execlayerTestCase(assert, expectedLayer) {
		var done = assert.async();
		var getLayerStub = sinon.stub(utils, 'getCurrentLayer').returns(expectedLayer);
		this.stubs.push(getLayerStub);

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var creationPersistence = createPersistence();
		var deletionPersistnce = createPersistence();

		oChangeDefinition.isUserDependend = false;
		var newChangeId = creationPersistence.addChange(oChangeDefinition);

		creationPersistence.saveAll().then(checkSavedAndGetSavedChanges).then(checkTheLayerMarkForDeletionAndSave).then(checkDeletion)['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

		/*********************************************************************************************************/

		function checkSavedAndGetSavedChanges(results) {
			assert.strictEqual($.isArray(results), true, 'Save result is array');
			assert.strictEqual(results.length, 1, 'Save result contains one entry');
			assert.strictEqual(results[0].status, 'success', 'Change successfully saved in backend');
			return deletionPersistnce.getChanges();
		}

		function checkTheLayerMarkForDeletionAndSave(changes) {
			var containsChangeId = false;
			var actualLayer = '';

			$.each(changes, function(changeId, change) {
				change.markForDeletion();
				if (changeId === newChangeId) {
					containsChangeId = true;
					actualLayer = change.getLayer();
				}
			});
			assert.strictEqual(actualLayer, expectedLayer, 'Layer has been set according to specified Layer');
			assert.strictEqual(containsChangeId, true, 'Change successfully received from backend');
			return deletionPersistnce.saveAll();
		}

		function checkDeletion(results) {
			assert.strictEqual($.isArray(results), true, 'Save result is array');
			assert.strictEqual(results.length > 0, true, 'Change successfully deleted from backend');
			done();
		}
	}

	QUnit.test('Create a non-user dependant variant, then update the texts, save it and delete it afterwards', function(assert) {
		var done = assert.async();
		var expectedNewVariantName = 'theNewVariantName';

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var creationPersistence = createPersistence();
		var deletionPersistnce = createPersistence();
		var updatePersistnce = createPersistence();

		oChangeDefinition.isUserDependend = false;
		var newChangeId = creationPersistence.addChange(oChangeDefinition);

		creationPersistence.saveAll().then(checkSaveAndGetSavedChanges).then(updateVariantNameAndSave).then(getSavedChanges).then(checkUpdatedVariantNameAndMarkForDeletionAndSave).then(checkDeletion)['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

		/*********************************************************************************************************/

		function checkSaveAndGetSavedChanges(results) {
			assert.strictEqual($.isArray(results), true, 'Save result is array');
			assert.strictEqual(results.length, 1, 'Save result contains one entry');
			assert.strictEqual(results[0].status, 'success', 'Change successfully saved in backend');
			return updatePersistnce.getChanges();
		}

		function updateVariantNameAndSave(changes) {
			$.each(changes, function(changeId, change) {
				if (changeId === newChangeId) {
					change.setText('variantName', expectedNewVariantName);
				}
			});

			return updatePersistnce.saveAll();
		}

		function getSavedChanges() {
			return deletionPersistnce.getChanges();
		}

		function checkUpdatedVariantNameAndMarkForDeletionAndSave(changes) {
			var actualVariantName = '';
			$.each(changes, function(changeId, change) {
				change.markForDeletion();
				if (changeId === newChangeId) {

					actualVariantName = change.getText('variantName');
				}
			});
			assert.strictEqual(actualVariantName, expectedNewVariantName, 'Variant name has been updated in backend');
			return deletionPersistnce.saveAll();
		}

		function checkDeletion(results) {
			assert.strictEqual($.isArray(results), true, 'Save result is array');
			assert.strictEqual(results.length > 0, true, 'Change successfully deleted from backend');
			done();
		}
	});

	QUnit.test('With cache: create a change, retrieve changes from backend twice: only once call should happen, the changes schould be the same', function(assert) {
		var done = assert.async();
		Cache.setActive(true);

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var creationPersistence = createPersistence();
		var firstRetrievalPersistence = createPersistence();
		var secondRetrievalPersistence = createPersistence();
		var firstChangesRetrieved;

		creationPersistence.addChange(oChangeDefinition);

		creationPersistence.saveAll().then(retrieveChangesFisrtTime).then(retrieveChangesSecondTime).then(checkChangesAndBackendCalls)['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

		/*********************************************************************************************************/

		function retrieveChangesFisrtTime() {
			return firstRetrievalPersistence.getChanges();
		}

		function retrieveChangesSecondTime(firstChanges) {
			firstChangesRetrieved = firstChanges;
			return secondRetrievalPersistence.getChanges();
		}

		function checkChangesAndBackendCalls(secondChanges) {
			//assert.deepEqual(firstChangesRetrieved, secondChanges, 'List of changes is the same'); //deepEqual seems to have problems comparing the two maps
			var aKeysFirst = Object.keys(firstChangesRetrieved);
			var aKeysSecond = Object.keys(secondChanges);
			assert.equal(aKeysSecond.length, 1);
			assert.equal(aKeysFirst.length, aKeysSecond.length);
			assert.equal(aKeysFirst[0], aKeysSecond[0]);
			assert.equal(firstChangesRetrieved[aKeysFirst[0]].getDefinition(), secondChanges[aKeysSecond[0]].getDefinition());
			sinon.assert.calledOnce(LrepConnector.prototype.loadChanges);
			done();
		}
	});

	QUnit.test('With cache: create a change, retrieve changes from backend twice: only once call should happen, the changes schould be the same', function(assert) {
		var done = assert.async();
		Cache.setActive(true);

		// Create different persistence to avoid caching, before every getChanges a new persistence is required
		var retrievalPersistence = createPersistence();
		var creationPersistence = createPersistence();
		var anotherRetrievcalPersistence = createPersistence();

		retrievalPersistence.getChanges().then(createAChange).then(retrieveChangesWithAnotherPersistence).then(checkChangesAndBackendCalls)['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

		/*********************************************************************************************************/

		function createAChange() {
			creationPersistence.addChange(oChangeDefinition);
			return creationPersistence.saveAll();
		}

		function retrieveChangesWithAnotherPersistence() {
			return anotherRetrievcalPersistence.getChanges();
		}

		function checkChangesAndBackendCalls(changes) {
			var creation = changes[Object.keys(changes)[0]].getDefinition().creation;
			assert.ok(creation, 'Creation string is filled');
			assert.strictEqual(isNaN(new Date(creation)), false, 'Creation string is a valid date');
			sinon.assert.calledOnce(LrepConnector.prototype.loadChanges);
			done();
		}
	});

	function createPersistence() {
		return new Persistence(new TestingControl({
			persistencyKey: 'testingPersistencyKey'
		}), 'persistencyKey');
	}
}(sap.ui.fl.Utils, sap.ui.fl.Persistence, sap.ui.core.Control, sap.ui.fl.DefaultVariant, sap.ui.fl.Change, sap.ui.fl.LrepConnector, jQuery, sap.ui.fl.Cache));
