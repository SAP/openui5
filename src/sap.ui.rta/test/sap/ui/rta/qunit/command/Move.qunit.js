/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta]");
}

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Move",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/ObjectHeader",
	"sap/m/ObjectAttribute",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/rta/ControlTreeModifier"
], function (
	CommandFactory,
	Move,
	FlexCommand,
	ElementDesignTimeMetadata,
	Utils,
	VerticalLayout,
	Button,
	ObjectHeader,
	ObjectAttribute,
	ChangeRegistry,
	FlexControllerFactory,
	ControlTreeModifier
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

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

	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
	sandbox.stub(Utils, "getCurrentLayer").returns("VENDOR");

	QUnit.module("Given a Button and its designtime metadata with undo functionality are created...", {
		beforeEach : function(assert) {
			this.oButton = new Button("myButton");
			this.oSourceLayout = new VerticalLayout("sourceLayout");
			this.oTargetLayout = new VerticalLayout("targetLayout");
			this.fnApplyChangeSpy = sinon.spy();
			this.fnCompleteChangeContentSpy = sinon.spy();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.Button": {
					"moveStuff" : {
						applyChange: this.fnApplyChangeSpy,
						// This gets called twice: once for straightforward, once for undo preparation
						completeChangeContent: this.fnCompleteChangeContentSpy
					}
				}
			});

			this.oButtonDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : {
					actions : {
						move : {
							changeType : "moveStuff"
						}
					}
				}
			});

		},
		afterEach : function(assert) {
			this.oButton.destroy();
			this.oSourceLayout.destroy();
			this.oTargetLayout.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when getting a move command for a Button...", function(assert) {
		var done = assert.async();
		var oCommand = CommandFactory.getCommandFor(this.oButton, "move", {
			movedElements : [this.oButton],
			source : this.oSourceLayout,
			target : this.oTargetLayout
		}, this.oButtonDesignTimeMetadata);

		var sChangeType = this.oButtonDesignTimeMetadata.getAction("move", this.oButton).changeType;

		assert.ok(oCommand, "move command for Button exists");
		assert.equal(oCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");

		oCommand.execute().then( function() {
			assert.equal(this.fnCompleteChangeContentSpy.callCount, 2, "then completeChangeContent is called twice (1x SF, 1x undo preparation)");
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
			done();
		}.bind(this));
	});

	QUnit.test("when getting a move command with _createChange returning an error", function(assert) {
		sandbox.stub(FlexCommand.prototype, "_createChange").throws("MyError");
		var oErrorLogSpy = sandbox.spy(jQuery.sap.log, "error");

		var oCommand = CommandFactory.getCommandFor(this.oButton, "move", {
			movedElements : [this.oButton],
			source : this.oSourceLayout,
			target : this.oTargetLayout
		}, this.oButtonDesignTimeMetadata);
		assert.notOk(oCommand, "then no command is created");
		assert.equal(oErrorLogSpy.callCount, 1, "and one error is thrown");
	});


	QUnit.module("Given a regular move command ", {
		beforeEach : function(assert) {
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

			this.oMoveCommand = CommandFactory.getCommandFor(this.oLayout, "Move", {
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
			}));

		},

		afterEach : function(assert) {
			sandbox.restore();
			this.oLayout.destroy();
			this.oMoveCommand.destroy();
		}
	});

	QUnit.test("After executing the command", function(assert) {
		var done = assert.async();
		this.oMoveCommand.execute().then( function() {
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

		.then(function() {
			var oChange = this.oMoveCommand.getPreparedChange();
			if (this.oMoveCommand.getAppComponent) {
				var oAppComponent = this.oMoveCommand.getAppComponent();
				var oControl = ControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
				var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
				return oFlexController.removeFromAppliedChangesOnControl(oChange, oAppComponent, oControl);
			}
		}.bind(this))

		.then(this.oMoveCommand.execute.bind(this.oMoveCommand))

		.then(assertObjectAttributeMoved.bind(this, assert));
	});

	function assertObjectAttributeMoved(assert) {
		assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(),
				"object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
		assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(),
				"object attribute is inserted at the 3. position");
	}

	function assertObjectAttributeNotMoved(assert) {
		assert.equal(this.oObjectHeader.getAttributes().length, 1, "object header has still one attribute");
		assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute.getId(),
				"object attribute is still at the 1. position");
		assert.equal(this.oLayout.getContent().length, 2, "layout content has still 2 controls");
		assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(),
				"object header is still at 1. position");
		assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
	}
});
