/* global QUnit sinon*/

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

			this.sAddFieldScenario = "addField";
			this.sAddColumnScenario = "addColumn";
			this.sModel = "ODataV2";

			this.mAddFieldSettings = {
				"requiredLibraries" : {
					"sap.ui.layout": {
						"minVersion": "1.48",
						"lazy": false
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
					"sap.ui.layout": {
						"minVersion": "1.48",
						"lazy": false
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
			ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddFieldScenario, "model" : this.sModel});
		}, /requires/, "then an incomplete change handler entry cannot be added");
		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddFieldScenario, "model" : this.sModel }, this.mAddFieldSettings);
		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddColumnScenario, "model" : this.sModel }, this.mAddColumnSettings);

		var mAddFieldSettings = ChangeHandlerMediator.getChangeHandlerSettings({"scenario" : this.sAddFieldScenario, "model" : this.sModel});

		assert.equal(mAddFieldSettings.content.requiredLibraries["sap.ui.layout"].minVersion,
			"1.48", "then the required library for addField is retrieved");
		assert.equal(mAddFieldSettings.scenarioInitialized, true, "then the scenario was successfully initialized");

		var mAddColumnSettings = ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddColumnScenario, "model" : this.sModel}, true);

		assert.equal(mAddColumnSettings.content.create().label,
			"testLabel", "then the 'create' method in addColumn is retrieved and can be executed");

		assert.equal(mAddColumnSettings.scenarioInitialized,
			false, "then getting the settings with 'skipInitialization = true' does not initialize the scenario");

		ChangeHandlerMediator.addChangeHandlerSettings(
			{ "scenario" : this.sAddFieldScenario, "model" : this.sModel, "dummyKey" : this.sDummyKey},
			this.mSecondAddFieldSettings);

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddFieldScenario, "model" : this.sModel, "dummyKey" : this.sDummyKey}).content.appContext,
			"SecondAddFieldContext", "then for entries with similar keys the entry with all matching keys is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddFieldScenario, "model" : this.sModel, "wrongKey" : "nonexistent"}),
			undefined, "then keys with partially existing entries are not found");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddColumnScenario }),
			undefined, "then incomplete keys do not return entries");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings({}),
			undefined, "then for an empty key no entries are found");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddFieldScenario, "model" : this.sModel}).content.appContext,
			"AddFieldContext", "then for entries with similar keys the entry with all matching keys is retrieved");

		assert.equal(ChangeHandlerMediator.getChangeHandlerSettings(
			{"scenario" : "hugo"}),
			undefined, "then non-existing entries return undefined");

	});

	QUnit.test('when adding settings for an already existing entry...', function(assert) {
		var mSettingsBeforeUpdate = ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddColumnScenario, "model" : this.sModel });

		assert.equal(mSettingsBeforeUpdate.scenarioInitialized,
			true, "before the update, the scenario is initialized");

		ChangeHandlerMediator.addChangeHandlerSettings(
			{ "scenario" : this.sAddColumnScenario, "model" : this.sModel }, { "newSetting" : "hugo" });

		var mSettingsAfterUpdate = ChangeHandlerMediator.getChangeHandlerSettings(
			{ "scenario" : this.sAddColumnScenario, "model" : this.sModel }, true);

		assert.equal(mSettingsAfterUpdate.content.newSetting,
			"hugo", "then an existing entry can be extended with new content");

		assert.ok(mSettingsAfterUpdate.content.create().label,
			"then the existing entry also still has the old content");

		assert.equal(mSettingsAfterUpdate.scenarioInitialized,
			false, "then updating an entry resets the scenario initialization to false");
	});

	QUnit.test('when getting settings for a scenario which cannot be initialized...', function(assert) {

		this.sDummyLibraryScenario = "dummyLibraryScenario";

			this.mDummyLibrarySettings = {
				"requiredLibraries" : {
					"dummy" : {}
				},
				"create" : function() {
					return {
						"label" : "testLabel",
						"control" : {}
					};
				}
			};

		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sDummyLibraryScenario }, this.mDummyLibrarySettings);

		var spyLog = sinon.spy(jQuery.sap.log, "info");

		ChangeHandlerMediator.getChangeHandlerSettings({ "scenario" : this.sDummyLibraryScenario });

		assert.equal(spyLog.callCount, 1, "then there is an info in the log saying the scenario could not be initialized");

		spyLog.restore();
	});

});