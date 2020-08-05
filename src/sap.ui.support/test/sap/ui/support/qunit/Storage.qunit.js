/*global QUnit*/
sap.ui.define(['sap/ui/support/supportRules/Storage'],
	function(Storage) {
		'use strict';

	var createValidRule = function (id) {
		return {
			id: id,
			check: function () { },
			title: 'title',
			description: 'desc',
			resolution: 'res',
			audiences: ['Control'],
			categories: ['Performance']
		};
	};

	QUnit.module('Storage API test', {
		beforeEach: function () {
			this.storage = Storage;
		},
		afterEach: function () {
			Storage.removeAllData();
		}
	});

	QUnit.test('Remove data from Storage', function(assert) {

		var tempRule = createValidRule('tempRule'),
			selectedRule = createValidRule('selectedRule');

		tempRule.libName = 'temporary';
		selectedRule.selected = true;

		this.storage.setRules([tempRule, selectedRule]);

		var rules = this.storage.getRules();
		assert.equal(rules[0].id, 'tempRule', 'Temporary rules have been stored successfully !');

		assert.equal(rules[1].id, 'selectedRule', 'Selected rules have been stored successfully !');

		this.storage.removeAllData();

		rules = this.storage.getRules();

		assert.equal(rules, null, 'All data has been removed successfully !');

	});

	QUnit.test('Get & Set temporary rules in Storage', function(assert) {
		this.storage.setRules([createValidRule('tempRule')]);

		var tempRules = this.storage.getRules();

		assert.equal(tempRules[0].id, 'tempRule', 'The temporary rules have been stored & retrieved successfully !');
	});

	QUnit.test('Get & Set selected rules in Storage', function(assert) {

		var selectedRules = this.storage.getSelectedRules();

		localStorage.removeItem('support-assistant-selected-rules');

		selectedRules = this.storage.getSelectedRules();

		assert.equal(selectedRules, null, 'Retrieved selected rules successfully from Storage !');

		this.storage.setSelectedRules([createValidRule('test')]);
		selectedRules = this.storage.getSelectedRules();

		assert.ok(selectedRules instanceof Array, 'Retrieved data is of type Array !');

		assert.ok(selectedRules[0] instanceof Object, 'Rule is of type Object!');

		assert.equal(selectedRules[0].id, 'test', 'Selected rule has been retrieved successfully !');
	});

	QUnit.test('Persistance cookie functionality', function(assert) {
		this.storage.deletePersistenceCookie('persistance-cookie-test');
		var cookie = this.storage.readPersistenceCookie('persistance-cookie-test');

		assert.equal(cookie, '', 'Persistance cookie has been removed successfully !');

		this.storage.createPersistenceCookie('persistance-cookie-test', true);

		cookie = this.storage.readPersistenceCookie('persistance-cookie-test');

		assert.ok(cookie, 'Persistance cookie has been created & read successfully !');

		this.storage.deletePersistenceCookie('persistance-cookie-test');
	});
});