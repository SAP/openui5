/* global QUnit sinon*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/changeHandler/ChangeHandlerMediator',
	'jquery.sap.global'
],
function(
	ChangeHandlerMediator,
	jQuery
) {
	'use strict';
	QUnit.start();

	QUnit.module('Given some Change Handler settings...', {
		beforeEach: function(assert) {

			this.sAddFieldScenario = "testAddField";
			this.sAddColumnScenario = "testAddColumn";
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

	QUnit.test('when getting settings for a scenario with missing library...', function(assert) {

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

		var sSpyArg = "Required library not available: " + "dummy" + " - "
						+ this.sDummyLibraryScenario + " could not be initialized";

		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sDummyLibraryScenario }, this.mDummyLibrarySettings);

		var spyLog = sinon.spy(jQuery.sap.log, "warning");

		assert.notOk(ChangeHandlerMediator.getChangeHandlerSettings({ "scenario" : this.sDummyLibraryScenario }), "then no settings are returned");

		assert.equal(spyLog.withArgs(sSpyArg).callCount, 1, "then there is a warning in the log saying the library is not available");

		spyLog.restore();
	});

	QUnit.module('Given the AddODataField scenario is registered with a create function...', {

		beforeEach : function(assert){

			this.sAddFieldScenario = "testAddField";

			this.mAddFieldSettings = {
				"requiredLibraries" : {
					"sap.ui.layout": {
						"minVersion": "1.48",
						"lazy": false
					}
				},
				"appContext" : "AddFieldContext",
				"createFunction" : function() {
					return {
						"label" : {},
						"control" : {}
					};
				}
			};

			ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddFieldScenario, "oDataServiceVersion" : "2.0" }, this.mAddFieldSettings);
		}
	});

	QUnit.test('when getting settings for testAddField in an ODataV2 control...', function(assert) {

		var oMockControl = {
			getModel : function() {
				return {
					getMetaModel : function() {
						return {
							getProperty : function(sProperty){
								if (sProperty === "/dataServices/dataServiceVersion"){
									return "2.0";
								}
							}
						};
					}
				};
			}
		};

		var sGetterName = 'get' + jQuery.sap.charToUpperCase(this.sAddFieldScenario) + 'Settings';

		assert.equal(
			ChangeHandlerMediator[sGetterName](oMockControl).content.requiredLibraries["sap.ui.layout"].minVersion,
			"1.48", "then the settings for data service version 2.0 are found");
	});

	QUnit.test('when getting settings for AddODataField for a control that did not register a createFunction...', function(assert) {

		var oMockControl = {
			getModel : function() {
				return {
					getMetaModel : function() {
						return {
							getProperty : function(sProperty){
								if (sProperty === "/dataServices/dataServiceVersion"){
									return "123.0";
								}
							}
						};
					}
				};
			}
		};

		this.mDummySettings = {
			"requiredLibraries" : {
				"sap.ui.layout": {
					"minVersion": "1.48",
					"lazy": false
				}
			}
		};

		ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : "addODataField" , "oDataServiceVersion" : "123.0" }, this.mDummySettings);

		assert.notOk(ChangeHandlerMediator.getAddODataFieldSettings(oMockControl),
			"then no settings are returned");
	});

	QUnit.test('when getting settings for AddODataField in a control with inexistent data service version...', function(assert) {

		var oMockControl = {
			getModel : function() {
				return {
					getMetaModel : function() {
						return {
							getProperty : function(sProperty){
								if (sProperty === "/dataServices/dataServiceVersion"){
									return "666.0";
								}
							}
						};
					}
				};
			}
		};

		assert.notOk(ChangeHandlerMediator.getAddODataFieldSettings(oMockControl),
			"then no settings for the inexistent data service version are found");

	});

	QUnit.test('when getting settings for AddODataField in a control where the data service version cannot be retrieved...', function(assert) {

		var oMockControl = { };

		var spyLog = sinon.spy(jQuery.sap.log, "warning");

		assert.notOk(ChangeHandlerMediator.getAddODataFieldSettings(oMockControl),
			"then no settings are found");

		assert.equal(spyLog.callCount, 1, "then there is a warning in the log saying the version could not be retrieved");

		spyLog.restore();

	});
});