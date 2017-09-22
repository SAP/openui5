/* global QUnit sinon */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.ui.rta.command.CommandFactory");
jQuery.sap.require("sap.ui.rta.command.Settings");

jQuery.sap.require("sap.ui.dt.DesignTimeMetadata");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");

(function() {
	"use strict";

	var CommandFactory = new sap.ui.rta.command.CommandFactory();
	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};
	sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oMockedAppComponent);
	sinon.stub(sap.ui.fl.changeHandler.PropertyChange, "completeChangeContent");

	QUnit.module("Given a settings change with a valid entry in the change registry,", {
		beforeEach : function(assert) {
			var oChangeRegistry = sap.ui.fl.registry.ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					"changeSettings" : "sap/ui/fl/changeHandler/PropertyChange"
				}
			});

			this.oSettingsChange = {
				selectorControl : {
					id : "button",
					controlType : "sap.m.Button",
					appComponent : oMockedAppComponent
				},
				changeSpecificData : {
					changeType : "changeSettings",
					content : "testchange"
				}
			};
		},
		afterEach : function(assert) {
		}
	});

	QUnit.test("when getting a settings command for the change ...", function(assert) {
		var oCommand = CommandFactory.getCommandFor(this.oSettingsChange.selectorControl, "settings", this.oSettingsChange.changeSpecificData);

		assert.ok(oCommand, "the settings command exists");
	});

})();
