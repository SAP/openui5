/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/util/changeVisualization/ChangeIndicator",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/includes"
],
function(
	sinon,
	QUnitUtils,
	ChangeIndicator,
	JSONModel,
	includes
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function createMockChange (sId, sCommandName) {
		return {
			id: sId,
			commandName: sCommandName,
			change: {
				getCreation: function () {
					return new Date();
				}
			},
			dependent: false
		};
	}

	function waitForMethodCall (oObject, sMethodName) {
		return new Promise(function (resolve) {
			sandbox.stub(oObject, sMethodName)
				.onFirstCall().callsFake(function () {
					resolve(oObject[sMethodName].wrappedMethod.apply(this, arguments));
				})
				.callThrough();
		});
	}

	QUnit.module("Basic tests", {
		beforeEach: function () {
			this.oChangeIndicator = new ChangeIndicator({
				changes: "{changes}",
				overlayId: "qunit-fixture"
			});
			this.oChangeIndicator.setModel(new JSONModel({
				changes: []
			}));
			this.oChangeIndicator.bindElement("/");
			this.oChangeIndicator.placeAt("qunit-fixture");

			// Mock designtime metadata
			sandbox.stub(sap.ui.getCore(), "byId")
				.callsFake(function (sId) {
					return sId === "qunit-fixture"
						? {
							getDesignTimeMetadata: function () {
								return {
									getLabel: function () { return "Test Label"; }
								};
							}
						}
						: sap.ui.getCore().byId.wrappedMethod.apply(this, arguments);
				});
		},
		afterEach: function () {
			this.oChangeIndicator.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a change indicator with a single change is created", function (assert) {
			var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

			this.oChangeIndicator.getModel().setData({
				changes: [createMockChange("someChangeId", "rename")]
			});
			sap.ui.getCore().applyChanges();
			assert.notOk(
				this.oChangeIndicator.getAggregation("_text").getVisible(),
				"then the number of changes is not displayed"
			);
			assert.notOk(
				this.oChangeIndicator.getAggregation("_icon").getVisible(),
				"then the details icon is not visible"
			);
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function () {
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover"),
						"then the popover is opened on click"
					);
					assert.notOk(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
						"then the changes table is hidden"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getContent()[1].getVisible(),
						"then the single change layout is visible"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getFooter().getVisible(),
						"then the footer is visible"
					);
					assert.strictEqual(
						this.oChangeIndicator.getAggregation("_popover").getContent()[1].getContent()[0].getText(),
						oRtaResourceBundle.getText(
							"TXT_CHANGEVISUALIZATION_CHANGE_RENAME",
							"'Test Label'"
						),
						"then a description for the change is displayed"
					);
				}.bind(this));
		});

		QUnit.test("when a change indicator with multiple changes is created", function (assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", "move"),
					createMockChange("someOtherChangeId", "rename")
				]
			});
			sap.ui.getCore().applyChanges();
			assert.ok(
				this.oChangeIndicator.getAggregation("_text").getVisible(),
				"then the number of changes is displayed 1/2"
			);
			assert.strictEqual(
				this.oChangeIndicator.getAggregation("_text").getText(),
				"2",
				"then the number of changes is displayed 2/2"
			);
			assert.notOk(
				this.oChangeIndicator.getAggregation("_icon").getVisible(),
				"then the details icon is not visible"
			);

			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function () {
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover"),
						"then the popover is opened on click"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
						"then the changes table is visible"
					);
					assert.notOk(
						this.oChangeIndicator.getAggregation("_popover").getContent()[1].getVisible(),
						"then the single change layout is hidden"
					);
					assert.notOk(
						this.oChangeIndicator.getAggregation("_popover").getFooter().getVisible(),
						"then the footer is hidden"
					);
					var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
					assert.strictEqual(
						aItems.length,
						2,
						"then both changes are displayed"
					);
					assert.ok(
						aItems[0].getCells()[3].getVisible(),
						"then the show details button is visible when dependent selectors exist"
					);
					assert.notOk(
						aItems[1].getCells()[3].getVisible(),
						"then the show details button is not visible when dependent selectors don't exist"
					);
				}.bind(this));
		});

		QUnit.test("when a dependent change indicator is created", function (assert) {
			sap.ui.getCore().applyChanges();
			assert.notOk(
				includes(this.oChangeIndicator.getDomRef().className.split(" "), "sapUiRtaChangeIndicatorDependent"),
				"then by default the dependent style class is not added"
			);
			this.oChangeIndicator.setMode("dependent");
			sap.ui.getCore().applyChanges();
			assert.ok(
				includes(this.oChangeIndicator.getDomRef().className.split(" "), "sapUiRtaChangeIndicatorDependent"),
				"then the appropriate style class is added"
			);
		});

		QUnit.test("when a dependent change indicator is created", function (assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", "move")
				]
			});
			this.oChangeIndicator.getModel().setData({
				selectedChange: "someChangeId"
			});
			sap.ui.getCore().applyChanges();
			assert.ok(
				this.oChangeIndicator.getAggregation("_icon").getVisible(),
				"then the indicator icon is visible"
			);
		});

		QUnit.test("when a change indicator is focused before it is rendered", function (assert) {
			this.oChangeIndicator.focus();
			sap.ui.getCore().applyChanges();
			assert.strictEqual(
				document.activeElement,
				this.oChangeIndicator.getDomRef(),
				"then the indicator receives focus as soon as it is rendered"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});