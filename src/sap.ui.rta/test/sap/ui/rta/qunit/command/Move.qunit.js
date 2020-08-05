/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/ObjectHeader",
	"sap/m/ObjectAttribute",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function (
	CommandFactory,
	FlexCommand,
	ElementDesignTimeMetadata,
	FlUtils,
	VerticalLayout,
	Button,
	ObjectHeader,
	ObjectAttribute,
	ChangeRegistry,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function assertObjectAttributeMoved(assert) {
		assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position");
	}

	function assertObjectAttributeNotMoved(assert) {
		assert.equal(this.oObjectHeader.getAttributes().length, 1, "object header has still one attribute");
		assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute.getId(), "object attribute is still at the 1. position");
		assert.equal(this.oLayout.getContent().length, 2, "layout content has still 2 controls");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
	}

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

	var oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	QUnit.module("Given a Button and its designtime metadata with undo functionality are created...", {
		beforeEach: function () {
			this.oButton = new Button("myButton");
			this.oSourceLayout = new VerticalLayout("sourceLayout");
			this.oTargetLayout = new VerticalLayout("targetLayout");
			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Button": {
					moveStuff : {
						applyChange: this.fnApplyChangeSpy,
						completeChangeContent: this.fnCompleteChangeContentSpy,
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oButtonDesignTimeMetadata = new ElementDesignTimeMetadata({
					data : {
						actions : {
							move : {
								changeType : "moveStuff"
							}
						}
					}
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oSourceLayout.destroy();
			this.oTargetLayout.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting a move command for a Button...", function(assert) {
			return CommandFactory.getCommandFor(this.oButton, "move", {
				movedElements : [this.oButton],
				source : this.oSourceLayout,
				target : this.oTargetLayout
			}, this.oButtonDesignTimeMetadata)

			.then(function(oMoveCommand) {
				var sChangeType = this.oButtonDesignTimeMetadata.getAction("move", this.oButton).changeType;
				assert.ok(oMoveCommand, "move command for Button exists");
				assert.equal(oMoveCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");
				return oMoveCommand.execute();
			}.bind(this))

			.then(function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});

		QUnit.test("when getting a move command with _createChange returning an error", function(assert) {
			sandbox.stub(FlexCommand.prototype, "_createChange").rejects("MyError");
			var oErrorLogSpy = sandbox.spy(Log, "error");

			return CommandFactory.getCommandFor(this.oButton, "move", {
				movedElements : [this.oButton],
				source : this.oSourceLayout,
				target : this.oTargetLayout
			}, this.oButtonDesignTimeMetadata)

				.then(function(oMoveCommand) {
					assert.notOk(oMoveCommand, "then no command is created");
					assert.equal(oErrorLogSpy.callCount, 1, "and one error is thrown");
				})

				.catch(function (oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});
	});

	QUnit.module("Given a regular move command ", {
		beforeEach: function () {
			// Test Setup:
			// VerticalLayout
			// -- content
			// -- -- ObjectHeader
			// -- -- -- attributes
			// -- -- -- -- ObjectAttribute
			// -- -- Button

			this.oButton = new Button("button");
			this.oObjectAttribute = new ObjectAttribute("attribute");
			this.oObjectHeader = new ObjectHeader("header", {
				attributes : [this.oObjectAttribute]
			});
			this.oLayout = new VerticalLayout("someLayoutId", {
				content : [this.oObjectHeader, this.oButton]
			});

			return CommandFactory.getCommandFor(this.oLayout, "Move", {
				source : {
					parent : this.oObjectHeader,
					aggregation : "attributes",
					publicAggregation : "attributes"
				},
				movedElements : [{
					element : this.oObjectAttribute,
					sourceIndex : 0,
					targetIndex : 2
				}],
				target : {
					parent : this.oLayout,
					aggregation : "content",
					publicAggregation : "content"
				}
			}, new ElementDesignTimeMetadata({
				data : {
					actions : {
						move : "moveControls"
					}
				}
			}))

			.then(function(oMoveCommand) {
				this.oMoveCommand = oMoveCommand;
			}.bind(this));
		},

		afterEach: function () {
			sandbox.restore();
			this.oLayout.destroy();
			this.oMoveCommand.destroy();
		}
	}, function () {
		QUnit.test("After executing the command", function(assert) {
			var done = assert.async();
			this.oMoveCommand.execute().then(function() {
				assertObjectAttributeMoved.call(this, assert);
				done();
			}.bind(this));
		});

		QUnit.test("After executing and undoing the command", function(assert) {
			this.oMoveCommand.execute();
			this.oMoveCommand.undo();
			assertObjectAttributeNotMoved.call(this, assert);
		});

		QUnit.test("After executing, undoing and redoing the command", function(assert) {
			return Promise.resolve()

			.then(this.oMoveCommand.execute.bind(this.oMoveCommand))

			.then(this.oMoveCommand.undo.bind(this.oMoveCommand))

			.then(this.oMoveCommand.execute.bind(this.oMoveCommand))

			.then(assertObjectAttributeMoved.bind(this, assert))

			.catch(function (oError) {
				assert.ok(false, "catch must never be called - Error: " + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
