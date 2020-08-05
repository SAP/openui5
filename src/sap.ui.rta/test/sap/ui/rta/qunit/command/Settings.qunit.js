/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
],
function(
	CommandFactory,
	BaseCommand,
	ChangeRegistry,
	PropertyChange,
	FlUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a settings change with a valid entry in the change registry,", {
		before: function () {
			this.oCommandFactory = new CommandFactory();
			this.oMockedAppComponent = {
				getLocalId: function () {},
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
			this.oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(this.oMockedAppComponent);
		},
		after: function () {
			this.oGetAppComponentForControlStub.restore();
			this.oCommandFactory.destroy();
		},
		beforeEach: function () {
			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					changeSettings : "sap/ui/fl/changeHandler/PropertyChange"
				}
			})
			.then(function() {
				sandbox.stub(PropertyChange, "completeChangeContent");

				this.oSettingsChange = {
					selectorElement : {
						id : "button",
						controlType : "sap.m.Button",
						appComponent : this.oMockedAppComponent
					},
					changeSpecificData : {
						changeType : "changeSettings",
						content : "testchange"
					}
				};
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting a settings command for the change ...", function(assert) {
			return this.oCommandFactory.getCommandFor(this.oSettingsChange.selectorElement, "settings", this.oSettingsChange.changeSpecificData)
			.then(function(oCommand) {
				assert.ok(oCommand instanceof BaseCommand, "the settings command exists");
			})
			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
