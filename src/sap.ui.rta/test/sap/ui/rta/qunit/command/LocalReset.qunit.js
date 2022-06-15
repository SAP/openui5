/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Change,
	Layer,
	LocalResetAPI,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	Control,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a SimpleForm with designtime metadata for localReset ...", {
		beforeEach: function () {
			this.oSimpleForm = new Control();
			var oOverlay = new ElementOverlay({element: this.oSimpleForm});
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			this.oLogStub = sandbox.stub(Log, "error");
		},
		afterEach: function () {
			this.oSimpleForm.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for localReset ...", function(assert) {
			var oChange1 = new Change({
				fileName: "change1",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id1"}
			});
			var oChange2 = new Change({
				fileName: "change2",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id2"}
			});
			var oChange3 = new Change({
				fileName: "change3",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id3"}
			});
			var oChange4 = new Change({
				fileName: "change4",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id4"}
			});
			var aChanges = [oChange1, oChange2, oChange3, oChange4];
			sandbox.stub(LocalResetAPI, "getNestedUIChangesForControl").returns(aChanges);
			var oResetChangesStub = sandbox.stub(LocalResetAPI, "resetChanges");
			var oRestoreChangesStub = sandbox.stub(LocalResetAPI, "restoreChanges");

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					actions: {
						localReset: {
							changeType: "localReset",
							isEnabled: true
						}
					}
				}
			});

			var oLocalResetCommand;
			return CommandFactory.getCommandFor(this.oSimpleForm, "localReset", {
				currentVariant: ""
			}, oDesignTimeMetadata)
				.then(function(oCommand) {
					oLocalResetCommand = oCommand;
					assert.ok(oLocalResetCommand, "localReset command exists for element");
					assert.strictEqual(this.oLogStub.callCount, 0, "no error was logged");
					return oLocalResetCommand.execute();
				}.bind(this))
				.then(function() {
					assert.strictEqual(oResetChangesStub.callCount, 1, "then on execute resetChanges is called once");
					assert.strictEqual(oResetChangesStub.args[0][0], aChanges, "...with the correct array of changes");
					return oLocalResetCommand.undo();
				})
				.then(function() {
					assert.strictEqual(oRestoreChangesStub.callCount, 1, "then on undo restoreChanges is called once");
					assert.strictEqual(oRestoreChangesStub.args[0][0], aChanges, "...with the correct array of changes");
				})
				.catch(function (oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});

		QUnit.test("when calling the command factory for localReset with CAUTION_variantIndependent", function(assert) {
			var oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: {
					actions: {
						localReset: {
							changeType: "localReset",
							isEnabled: true,
							CAUTION_variantIndependent: true
						}
					}
				}
			});
			sandbox.stub(LocalResetAPI, "getNestedUIChangesForControl").returns([]);

			return CommandFactory.getCommandFor(this.oSimpleForm, "localReset", {
				currentVariant: ""
			}, oDesignTimeMetadata).then(function(oCommand) {
				assert.ok(oCommand, "localReset command exists for element");
				assert.strictEqual(this.oLogStub.callCount, 1, "one error was logged");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
