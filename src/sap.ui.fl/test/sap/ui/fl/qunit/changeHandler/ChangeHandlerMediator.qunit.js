/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/changeHandler/ChangeHandlerMediator'
],
function(
	ChangeHandlerMediator
) {
	'use strict';
	QUnit.start();

	QUnit.module('Given some Change Handler settings...', {
		beforeEach: function(assert) {

			this.sAddFieldChangeHandlerSettings = "addODataField";
			this.sAddColumnChangeHandlerSettings = "addODataColumn";
			this.sModel = "ODataV2";

			this.mAddFieldSettings = {
				"requiredLibraries" : {
					"sap.ui.comp": {
						"minVersion": "1.48",
						"lazy": "false"
					}
				},
				"appContext" : "AddFieldContext",
				"create" : function() {
					return {
						"label" : {},
						"control" : {}
					};
				}
			};

			this.sDummyKey = "dummyKey";

			this.mSecondAddFieldSettings = {
				"requiredLibraries" : {
					"sap.ui.comp": {
						"minVersion": "1.48",
						"lazy": "false"
					}
				},
				"appContext" : "SecondAddFieldContext",
				"create" : function() {
					return {
						"label" : {},
						"control" : {}
					};
				}
			};

			this.mAddColumnSettings = {
				"requiredLibraries" : {},
				"create" : function() {
					return {
						"label" : "testLabel",
						"control" : {}
					};
				}
			};
		},

		afterEach: function() {
		}
	});

	QUnit.test('when adding change handler settings to the mediator...', function(assert) {

		assert.throws(function(){
			ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddFieldChangeHandlerSettings, "model" : this.sModel});
		}, /requires/, "then an incomplete change handler entry cannot be added");
		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddFieldChangeHandlerSettings, "model" : this.sModel }, this.mAddFieldSettings);
		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddColumnChangeHandlerSettings, "model" : this.sModel }, this.mAddColumnSettings);

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings({ "scenario" : this.sAddFieldChangeHandlerSettings, "model" : this.sModel})
			.content.requiredLibraries["sap.ui.comp"].minVersion, "1.48", "then the required library for addField is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings({ "scenario" : this.sAddColumnChangeHandlerSettings, "model" : this.sModel}).content.create().label,
			"testLabel", "then the 'create' method in addColumn is retrieved and can be executed");

		ChangeHandlerMediator.addChangeHandlerSettings(
			{ "scenario" : this.sAddFieldChangeHandlerSettings, "model" : this.sModel, "dummyKey" : this.sDummyKey},
			this.mSecondAddFieldSettings);

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddFieldChangeHandlerSettings, "model" : this.sModel, "dummyKey" : this.sDummyKey}).content.appContext,
			"SecondAddFieldContext", "then for duplicate entries the change handler with all matching keys is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddFieldChangeHandlerSettings, "model" : this.sModel}).content.appContext,
			"AddFieldContext", "then for duplicate entries the change handler with the most matching keys is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{"scenario" : "hugo"}),
			undefined, "then non-existing entries return undefined");

	});

});