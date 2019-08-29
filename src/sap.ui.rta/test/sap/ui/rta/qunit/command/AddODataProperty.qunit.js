/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function(
	CommandFactory,
	ChangeRegistry,
	ElementDesignTimeMetadata,
	Utils,
	Button,
	sinon
) {
	"use strict";

	var oMockedAppComponent = {
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
	var oGetAppComponentForControlStub = sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	QUnit.module("Given an AddODataProperty change with a valid entry in the change registry,", {
		beforeEach : function () {
			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button" : {
					addODataProperty : {
						completeChangeContent: this.fnCompleteChangeContentSpy,
						applyChange: this.fnApplyChangeSpy,
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oButton = new Button("button");

				this.oDesignTimeMetadata = new ElementDesignTimeMetadata({
					data : {
						actions : {
							addODataProperty : {
								changeType: "addODataProperty",
								isEnabled : true
							}
						}
					}
				});
			}.bind(this));
		}
	});

	QUnit.test("when getting a AddODataProperty command for the change ...", function(assert) {
		return CommandFactory.getCommandFor(
			this.oButton,
			"addODataProperty",
			{
				changeType : "addODataProperty",
				index : 1,
				newControlId : "newControlId",
				bindingString : "{bindingPath}",
				oDataServiceUri: "serviceUri",
				propertyName: "propertyName"
			},
			this.oDesignTimeMetadata
		)

		.then(function(oCommand) {
			assert.ok(oCommand, "the addODataProperty command exists");
			return oCommand.execute();
		})

		.then(function() {
			assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
		}.bind(this))

		.catch(function (oError) {
			assert.ok(false, 'catch must never be called - Error: ' + oError);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
