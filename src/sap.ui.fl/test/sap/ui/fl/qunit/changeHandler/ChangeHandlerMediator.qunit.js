/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/changeHandler/ChangeHandlerMediator",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/includes",
	"sap/ui/thirdparty/sinon-4"
],
function(
	ChangeHandlerMediator,
	Log,
	jQuery,
	fnBaseIncludes,
	sinon
) {
	"use strict";

	QUnit.module('Given some Change Handler settings...', {
		beforeEach: function() {
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
	}, function() {
		QUnit.test('when adding change handler settings to the mediator...', function(assert) {
			return Promise.resolve()
			.then(function() {
				return ChangeHandlerMediator.addChangeHandlerSettings(
					{ "scenario" : this.sAddFieldScenario, "model" : this.sModel});
			}.bind(this))

			.catch(function(oReturn) {
				assert.ok(fnBaseIncludes(oReturn.message, "New entry in ChangeHandlerMediator requires a key and settings"),
				"then an incomplete change handler entry cannot be added");
			})

			.then(function() {
				return ChangeHandlerMediator.addChangeHandlerSettings(
					{ "scenario" : this.sAddFieldScenario, "model" : this.sModel }, this.mAddFieldSettings);
			}.bind(this))

			.then(function() {
				return ChangeHandlerMediator.addChangeHandlerSettings(
					{ "scenario" : this.sAddColumnScenario, "model" : this.sModel }, this.mAddColumnSettings);
			}.bind(this))

			.then(function() {
				return ChangeHandlerMediator.getChangeHandlerSettings({ "scenario" : this.sAddFieldScenario, "model" : this.sModel });
			}.bind(this))

			.then(function(mAddFieldSettings) {
				assert.equal(mAddFieldSettings.content.requiredLibraries["sap.ui.layout"].minVersion,
					"1.48", "then the required library for addField is retrieved");
				assert.equal(mAddFieldSettings.scenarioInitialized, true, "then the scenario was successfully initialized");

				return ChangeHandlerMediator.getChangeHandlerSettings(
					{ "scenario" : this.sAddColumnScenario, "model" : this.sModel}, true);
			}.bind(this))

			.then(function(mAddColumnSettings) {
				assert.equal(mAddColumnSettings.content.create().label,
					"testLabel", "then the 'create' method in addColumn is retrieved and can be executed");
				assert.equal(mAddColumnSettings.scenarioInitialized,
					false, "then getting the settings with 'skipInitialization = true' does not initialize the scenario");

				return ChangeHandlerMediator.addChangeHandlerSettings(
					{ "scenario" : this.sAddFieldScenario, "model" : this.sModel, "dummyKey" : this.sDummyKey},
					this.mSecondAddFieldSettings);
			}.bind(this))

			.then(function() {
				return ChangeHandlerMediator.getChangeHandlerSettings(
					{ "scenario" : this.sAddFieldScenario, "model" : this.sModel, "dummyKey" : this.sDummyKey});
			}.bind(this))

			.then(function(mAddFieldSettings) {
				assert.equal(mAddFieldSettings.content.appContext, "SecondAddFieldContext",
					"then for entries with similar keys the entry with all matching keys is retrieved");

				return ChangeHandlerMediator.getChangeHandlerSettings(
					{ "scenario" : this.sAddFieldScenario, "model" : this.sModel, "wrongKey" : "nonexistent"});
			}.bind(this))

			.then(function(mAddFieldSettings) {
				assert.equal(mAddFieldSettings,
					undefined, "then keys with partially existing entries are not found");

				return ChangeHandlerMediator.getChangeHandlerSettings(
					{ "scenario" : this.sAddColumnScenario });
			}.bind(this))

			.then(function(mAddColumnSettings) {
				assert.equal(mAddColumnSettings, undefined,
					"then incomplete keys do not return entries");

				return ChangeHandlerMediator.getChangeHandlerSettings({});
			})

			.then(function(mChangeHandlerSettings) {
				assert.equal(mChangeHandlerSettings,
					undefined, "then for an empty key no entries are found");

				return ChangeHandlerMediator.getChangeHandlerSettings(
					{ "scenario" : this.sAddFieldScenario, "model" : this.sModel});
			}.bind(this))

			.then(function(mAddFieldSettings) {
				assert.equal(mAddFieldSettings.content.appContext,
					"AddFieldContext", "then for entries with similar keys the entry with all matching keys is retrieved");

				return ChangeHandlerMediator.getChangeHandlerSettings({"scenario" : "hugo"});
			})

			.then(function(mChangeHandlerSettings) {
				assert.equal(mChangeHandlerSettings, undefined,
					"then non-existing entries return undefined");
			});
		});

		QUnit.test('when adding settings for an already existing entry...', function(assert) {
			return ChangeHandlerMediator.getChangeHandlerSettings(
				{ "scenario" : this.sAddColumnScenario, "model" : this.sModel })

			.then(function(mSettingsBeforeUpdate) {
				assert.equal(mSettingsBeforeUpdate.scenarioInitialized,
					true, "before the update, the scenario is initialized");

				return ChangeHandlerMediator.addChangeHandlerSettings(
					{ "scenario" : this.sAddColumnScenario, "model" : this.sModel }, { "newSetting" : "hugo" });
			}.bind(this))

			.then(function() {
				return ChangeHandlerMediator.getChangeHandlerSettings(
					{ "scenario" : this.sAddColumnScenario, "model" : this.sModel }, true);
			}.bind(this))

			.then(function(mSettingsAfterUpdate) {
				assert.equal(mSettingsAfterUpdate.content.newSetting,
					"hugo", "then an existing entry can be extended with new content");
				assert.ok(mSettingsAfterUpdate.content.create().label,
					"then the existing entry also still has the old content");
				assert.equal(mSettingsAfterUpdate.scenarioInitialized,
					false, "then updating an entry resets the scenario initialization to false");
			});
		});

		QUnit.test('when getting settings for a scenario with missing library...', function(assert) {
			var spyLog;
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

			return ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sDummyLibraryScenario }, this.mDummyLibrarySettings)
			.then(function() {
				spyLog = sinon.spy(Log, "warning");
				return ChangeHandlerMediator.getChangeHandlerSettings({ "scenario" : this.sDummyLibraryScenario });
			}.bind(this))

			.then(function(mChangeHandlerSettings) {
				assert.notOk(mChangeHandlerSettings, "then no settings are returned");
				assert.equal(spyLog.withArgs(sSpyArg).callCount, 1, "then there is a warning in the log saying the library is not available");
				spyLog.restore();
			});
		});
	});

	QUnit.module('Given the AddODataField scenario is registered with a create function...', {
		beforeEach : function(){
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

			return ChangeHandlerMediator.addChangeHandlerSettings({ "scenario" : this.sAddFieldScenario, "oDataServiceVersion" : "2.0" }, this.mAddFieldSettings);
		}
	}, function() {
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

			return ChangeHandlerMediator[sGetterName](oMockControl)
			.then(function(mChangeHandlerSettings) {
				assert.equal(
					mChangeHandlerSettings.content.requiredLibraries["sap.ui.layout"].minVersion,
					"1.48", "then the settings for data service version 2.0 are found");
			});
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

			return ChangeHandlerMediator.addChangeHandlerSettings(
				{"scenario" : "addODataField", "oDataServiceVersion" : "123.0"}, this.mDummySettings)

			.then(function() {
				return ChangeHandlerMediator.getAddODataFieldSettings(oMockControl);
			})

			.then(function(mAddODataFieldSettings) {
				assert.notOk(mAddODataFieldSettings, "then no settings are returned");
			});
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

			return ChangeHandlerMediator.getAddODataFieldSettings(oMockControl)
			.then(function(mChangeHandlerSettings) {
				assert.notOk(mChangeHandlerSettings, "then no settings for the inexistent data service version are found");
			});
		});

		QUnit.test('when getting settings for AddODataField in a control where the data service version cannot be retrieved...', function(assert) {
			var oMockControl = { };
			var spyLog = sinon.spy(Log, "warning");

			return ChangeHandlerMediator.getAddODataFieldSettings(oMockControl)
			.then(function(mChangeHandlerSettings) {
				assert.notOk(mChangeHandlerSettings, "then no settings are found");
				assert.equal(spyLog.callCount, 1, "then there is a warning in the log saying the version could not be retrieved");
				spyLog.restore();
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});