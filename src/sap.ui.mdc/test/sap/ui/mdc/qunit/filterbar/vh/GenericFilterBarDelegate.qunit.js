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

	// QUnit.test('Check addItem', function(assert) {
	// 	var done = assert.async();

	// 	GenericFilterBarDelegate.addItem("String", this._oFilterBar, { modifier: JsControlTreeModifier, appComponent: this._oFilterBar} ).then(function(oFilterField) {
	// 		assert.ok(oFilterField);
	// 		done();
	// 	});
	// });

	// QUnit.test('Check removeItem', function(assert) {
	// 	var done = assert.async();

	// 	GenericFilterBarDelegate.removeItem().then(function(bValue) {
	// 		assert.ok(bValue);
	// 		done();
	// 	});
	// });

});
