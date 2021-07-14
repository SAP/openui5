/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/odata/v4/FieldBaseDelegate"
], function(GenericFilterBarDelegate, FilterBar, FilterField, FieldBaseDelegate) {
	'use strict';

	QUnit.module("GenericFilterBarDelegate unit test", {
		before: function() {
			this._o1 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"myID", dataType: "Edm.Int32", conditions: "{$filters>/conditions/ID}"});
			var o2 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions: "{$filters>/conditions/name}"});
			var o3 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Date of Birth", dataType: "Edm.Date", maxConditions:-1, conditions:"{$filters>/conditions/dateOfBirth}"});
			this._oFilterBar = new FilterBar({
				filterItems: [ this._o1, o2, o3],
				delegate : {'name' : 'sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate'}
			});

			return this._oFilterBar.initialized();

		},
		after: function() {
			this._oFilterBar.destroy();
			this._o1.destroy();
		},
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test('Check', function(assert) {
		var done = assert.async();

		this._oFilterBar.initControlDelegate().then(function(oDelegate) {
			assert.ok(oDelegate);
			done();
		});
	});

	QUnit.test('Check fetchProperties', function(assert) {
		var done = assert.async();

		GenericFilterBarDelegate.fetchProperties(this._oFilterBar).then(function(aProperties) {
			assert.ok(aProperties);
			assert.equal(aProperties.length, 3, "3 PropertyInfos should exist");

			this._oFilterBar.addFilterItem(new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"New Name", conditions: "{$filters>/conditions/name2}"}));
			assert.equal(aProperties.length, 4, "4 PropertyInfos should exist");

			this._oFilterBar.removeFilterItem(this._o1);
			assert.equal(aProperties.length, 3, "3 PropertyInfos should exist");

			this._oFilterBar.removeAllFilterItems();
			assert.equal(aProperties.length, 0, "PropertyInfos should be empty");
			done();
		}.bind(this));
	});


	QUnit.module("GenericFilterBarDelegate used with two Filterbars", {
		before: function() {
			this._o1_1 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"myID", dataType: "Edm.Int32", conditions: "{$filters>/conditions/ID}"});
			var o1_2 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Name", conditions: "{$filters>/conditions/name}"});
			var o1_3 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"Date of Birth", dataType: "Edm.Date", maxConditions:-1, conditions:"{$filters>/conditions/dateOfBirth}"});
			this._oFilterBar1 = new FilterBar({
				filterItems: [ this._o1_1, o1_2, o1_3],
				delegate : {'name' : 'sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate'}
			});


			this._o2_1 = new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"myID2", dataType: "Edm.Int32", conditions: "{$filters>/conditions/ID}"});
			this._oFilterBar2 = new FilterBar({
				filterItems: [ this._o2_1],
				delegate : {'name' : 'sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate'}
			});

			return Promise.all([this._oFilterBar1.initialized(), this._oFilterBar2.initialized()]);
		},
		after: function() {
			this._oFilterBar1.destroy();
			this._o1_1.destroy();

			this._oFilterBar2.destroy();
			this._o2_1.destroy();
		},
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	// QUnit.test('Check FB1', function(assert) {
	// 	var done = assert.async();

	// 	this._oFilterBar1.initControlDelegate().then(function(oDelegate) {
	// 		assert.ok(oDelegate);
	// 		done();
	// 	});
	// });

	QUnit.test('Check fetchProperties of both filterbars', function(assert) {
		var done = assert.async();

		GenericFilterBarDelegate.fetchProperties(this._oFilterBar1).then(function(aProperties1) {
			assert.ok(aProperties1);
			assert.equal(aProperties1.length, 3, "3 PropertyInfos should exist");

			this._oFilterBar1.addFilterItem(new FilterField({delegate: {name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate', payload: {}}, label:"New Name", conditions: "{$filters>/conditions/name2}"}));
			assert.equal(aProperties1.length, 4, "4 PropertyInfos should exist");

			this._oFilterBar1.removeFilterItem(this._o1_1);
			assert.equal(aProperties1.length, 3, "3 PropertyInfos should exist");

			this._oFilterBar1.removeAllFilterItems();
			assert.equal(aProperties1.length, 0, "PropertyInfos should be empty");

			GenericFilterBarDelegate.fetchProperties(this._oFilterBar2).then(function(aProperties2) {
				assert.ok(aProperties2);
				assert.equal(aProperties2.length, 1, "1 PropertyInfos should exist");

				done();

			});

		}.bind(this));
	});


});
