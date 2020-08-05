/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/rta/command/CustomAdd",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/ui/thirdparty/sinon-4"
],
function(
	CommandFactory,
	OverlayRegistry,
	VerticalLayout,
	CustomAdd,
	ChangeRegistry,
	ElementDesignTimeMetadata,
	Utils,
	Button,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oMockedAppComponent = {
		getLocalId: function () {},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "mockName";
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

	function fnCheckCommand(assert, oCommand) {
		assert.ok(oCommand instanceof CustomAdd, "then CustomAdd command was created");
		assert.deepEqual(oCommand.getAddElementInfo(), this.mSettings.addElementInfo);
		assert.strictEqual(oCommand.getIndex(), this.mSettings.index);
		assert.strictEqual(oCommand.getAggregationName(), this.mSettings.aggregationName);
		assert.strictEqual(oCommand.getCustomItemId(), this.mSettings.customItemId);

		return oCommand.execute()
		.then(function() {
			assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent() was called once");
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange() was called once");
		}.bind(this))
		.catch(function (oError) {
			assert.ok(false, 'catch must never be called - Error: ' + oError);
		});
	}

	QUnit.module("Given a customAdd change with a valid entry in the change registry", {
		before: function () {
			this.oButton = new Button("button");
			this.oVericalLayout = new VerticalLayout("verticalLayout");

			this.oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					actions: {
						add: {
							custom: {
								getItems: function () {
									return [];
								}
							}
						}
					}
				}
			});
		},
		beforeEach: function () {
			var oChangeRegistry = ChangeRegistry.getInstance();

			this.fnApplyChangeSpy = sandbox.stub();
			this.fnCompleteChangeContentSpy = sandbox.stub();

			var oCustomAddChangeHandler = {
				customAdd: {
					completeChangeContent: this.fnCompleteChangeContentSpy,
					applyChange: this.fnApplyChangeSpy,
					revertChange: function() {}
				}
			};
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button": oCustomAddChangeHandler,
				"sap.ui.layout.VerticalLayout": oCustomAddChangeHandler
			});
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(OverlayRegistry, "getOverlay").returns({
				getRelevantContainer: function () {
					return this.oVericalLayout;
				}.bind(this)
			});

			this.mSettings = {
				changeOnRelevantContainer: false,
				aggregationName: "aggregationName",
				changeType: "customAdd",
				addElementInfo: {
					property1: "value1",
					property2: "value2"
				},
				index: 1,
				customItemId: "customItemId"
			};
		},
		afterEach: function () {
			sandbox.restore();
		},
		after: function () {
			this.oButton.destroy();
			this.oVericalLayout.destroy();
		}
	}, function() {
		QUnit.test("when getting a CustomAdd command for a control, with changeOnRelevantContainer set to false", function(assert) {
			return CommandFactory.getCommandFor(
				this.oButton,
				"customAdd",
				this.mSettings,
				this.oDesignTimeMetadata
			)
			.then(fnCheckCommand.bind(this, assert));
		});

		QUnit.test("when getting a CustomAdd command for a control, with changeOnRelevantContainer set to true", function(assert) {
			this.mSettings.changeOnRelevantContainer = true;
			return CommandFactory.getCommandFor(
				this.oButton,
				"customAdd",
				this.mSettings,
				this.oDesignTimeMetadata
			)
			.then(fnCheckCommand.bind(this, assert));
		});

		QUnit.test("when getting a CustomAdd command for a control, where custom add's getItems is not a function", function(assert) {
			this.mSettings.changeOnRelevantContainer = true;
			delete this.oDesignTimeMetadata.getData().actions.add.custom["getItems"];
			return CommandFactory.getCommandFor(
				this.oButton,
				"customAdd",
				this.mSettings,
				this.oDesignTimeMetadata
			)
			.then(function(oCommand) {
				assert.notOk(oCommand, "then no command was created");
			});
		});
	}
	);

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
