/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/util/changeVisualization/ChangeIndicator",
	"sap/ui/rta/util/changeVisualization/commands/RenameVisualization",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	DateFormat,
	Lib,
	DesignTime,
	OverlayRegistry,
	JSONModel,
	QUnitUtils,
	nextUIUpdate,
	ChangeIndicator,
	RenameVisualization,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	function createMockChange(sId, sAffectedElementId, sCommandName, sChangeCategory, mPayload, oCreationDateMock) {
		var oCreationDate = oCreationDateMock || new Date();
		return {
			id: sId,
			commandName: sCommandName,
			changeCategory: sChangeCategory,
			change: {
				getCreation() {
					return oCreationDate;
				}
			},
			descriptionPayload: mPayload,
			affectedElementId: sAffectedElementId
		};
	}

	function waitForMethodCall(oObject, sMethodName) {
		return new Promise(function(resolve) {
			sandbox.stub(oObject, sMethodName)
			.onFirstCall().callsFake(function(...aArgs) {
				resolve(oObject[sMethodName].wrappedMethod.apply(this, aArgs));
			})
			.callThrough();
		});
	}

	QUnit.module("Basic tests", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton = new Button("TestButton");
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay.setSelectable(true);

				this.oChangeIndicator = new ChangeIndicator({
					changes: "{changes}",
					overlayId: this.oButtonOverlay.getId()
				});
				this.oChangeIndicator.setModel(new JSONModel({
					changes: []
				}));
				this.oChangeIndicator.bindElement("/");
				this.oChangeIndicator.placeAt("qunit-fixture");

				nextUIUpdate().then(fnDone);
			}.bind(this));

			this.oDesignTime.addRootElement(this.oButton);
		},

		afterEach() {
			this.oButton.destroy();
			this.oChangeIndicator.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a change indicator with a single change is created", async function(assert) {
			sandbox.stub(DateFormat, "getDateTimeInstance")
			.callThrough()
			.withArgs({ relative: "true" })
			.returns({
				format() { return "myTime"; }
			});
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "AfterValue"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)]
			});
			await nextUIUpdate();
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorLight"),
				"then the correct indicator color is used"
			);
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered"
			);
			assert.strictEqual(
				this.oChangeIndicator.getDomRef().title,
				"1 change",
				"then the correct title (tooltip) is set"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
			.then(function() {
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover"),
					"then the popover is opened on click"
				);
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
					"then the changes table is visible"
				);
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
					"then the single change layout is visible"
				);
				var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
				assert.strictEqual(
					aItems.length,
					1,
					"then the change is displayed"
				);
				assert.notOk(
					aItems[0].getCells()[1].getItems()[1].getVisible(),
					"then the show details button is not visible in the description column when no dependent selectors exist"
				);
				assert.strictEqual(
					aItems[0].getCells()[1].getItems()[0].getText(),
					oRtaResourceBundle.getText(
						"TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO",
						["AfterValue", "BeforeValue"]
					),
					"then a description for the change is displayed"
				);
				assert.strictEqual(
					aItems[0].getCells()[0].getTooltip(),
					oRtaResourceBundle.getText(
						"TXT_CHANGEVISUALIZATION_OVERVIEW_RENAME"
					),
					"then the proper icon tooltip is displayed"
				);
				assert.notOk(
					aItems[0].getCells()[1].getItems()[0].getTooltip(),
					"then the description tooltip is not set because the description was not shorted"
				);
				var sDate = aItems[0].getCells()[2].getText();
				assert.strictEqual(sDate, "myTime", "then a relative date string is displayed correctly");

				this.oChangeIndicator.exit();
				assert.notOk(this.oChangeIndicator.getAggregation("_popover"), "then the popover was destroyed");
			}.bind(this));
		});

		QUnit.test("when a change indicator with a single change is created and the Text or ID of the element is too long", async function(assert) {
			sandbox.stub(DateFormat, "getDateTimeInstance")
			.callThrough()
			.withArgs({ relative: "true" })
			.returns({
				format() { return "myTime"; }
			});
			var mPayload = {
				originalLabel:
					"BeforeValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues",
				newLabel:
					"AfterValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)]
			});
			await nextUIUpdate();
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorLight"),
				"then the correct indicator color is used"
			);
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
			.then(function() {
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover"),
					"then the popover is opened on click"
				);
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
					"then the changes table is visible"
				);
				var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
				assert.strictEqual(
					aItems.length,
					1,
					"then the change is displayed"
				);
				assert.notOk(
					aItems[0].getCells()[1].getItems()[1].getVisible(),
					"then the show details button is not visible in the description column when no dependent selectors exist"
				);
				assert.strictEqual(
					aItems[0].getCells()[1].getItems()[0].getText(),
					oRtaResourceBundle.getText(
						"TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO",
						[
							"AfterValueOfAFieldWithAnExt(...)ctlyDisplayWithoutAnyIssues",
							"BeforeValueOfAFieldWithAnEx(...)ctlyDisplayWithoutAnyIssues"
						]
					),
					"then a description for the change is displayed"
				);
				assert.strictEqual(
					aItems[0].getCells()[1].getItems()[0].getTooltip(),
					oRtaResourceBundle.getText(
						"TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO",
						[
							"AfterValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues",
							"BeforeValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues"
						]
					),
					"then the description tooltip shows the not shorted text"
				);
				var sDate = aItems[0].getCells()[2].getText();
				assert.strictEqual(sDate, "myTime", "then a relative date string is displayed correctly");
			}.bind(this));
		});

		QUnit.test("when a change was created within the session", async function(assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [{
					...createMockChange("someChangeId", this.oButton.getId(), "remove", "remove"),
					change: {
						getCreation() { }
					}
				}]
			});
			await nextUIUpdate();
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorLight"),
				"then the correct indicator color is used"
			);
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
			.then(function() {
				assert.strictEqual(
					this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems()[0].getCells()[2].getText(),
					oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE"),
					"then a fallback label for the date is displayed"
				);
			}.bind(this));
		});

		QUnit.test("when a move change indicator is created", async function(assert) {
			var oPayloadInsideGroup = {
				sourceContainer: { id: "Group1" },
				targetContainer: { id: "Group1" }
			};
			var oPayloadOutsideGroup = {
				sourceContainer: { id: "Group1" },
				targetContainer: { id: "Group2" }
			};
			var oPayloadWithoutSourceParentId = {
				sourceContainer: { id: null },
				targetContainer: { id: "Group2" }
			};

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("changeId1", this.oButton.getId(), "move", "move", oPayloadInsideGroup),
					createMockChange("changeId2", this.oButton.getId(), "move", "move", oPayloadOutsideGroup),
					createMockChange("changeId3", this.oButton.getId(), "move", "move", oPayloadWithoutSourceParentId)
				]
			});
			await nextUIUpdate();

			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
			.then(function() {
				var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
				assert.notOk(
					aItems[0].getCells()[1].getItems()[1].getVisible(),
					"then the show details button is not visible if the element was moved in the same group"
				);
				assert.ok(
					aItems[1].getCells()[1].getItems()[1].getVisible(),
					"then the show details button is visible if the element was moved outside its group"
				);
				assert.notOk(
					aItems[2].getCells()[1].getItems()[1].getVisible(),
					"then the show details button is not visible if the element has no source parent id"
				);
			}.bind(this));
		});

		QUnit.test("when a change indicator is created for a settings command change", function(assert) {
			var oPayload1 = {
				description: "RemoveDescription",
				descriptionTooltip: "RemoveDescriptionTooltip"
			};
			var oPayload2 = {
				description: "SettingsAddDescription"
			};
			var oPayload3 = {
				description: "SettingsOtherDescription",
				descriptionTooltip: "SettingsOtherChangeTooltip"
			};
			var oPayloadOutsideGroup = {
				description: "moveDescription",
				descriptionTooltip: "moveDescriptionVeryLongTooltip",
				sourceContainer: { id: "Group1" },
				targetContainer: { id: "Group2" }
			};
			var aChanges = [
				createMockChange("id0", this.oButton.getId(), "move", "move", oPayloadOutsideGroup),
				createMockChange("id1", this.oButton.getId(), "settings", "move", oPayloadOutsideGroup),
				createMockChange("id2", this.oButton.getId(), "settings", "remove", oPayload1),
				createMockChange("id3", this.oButton.getId(), "settings", "add", oPayload2),
				createMockChange("id4", this.oButton.getId(), "settings", "other", oPayload3)
			];
			this.oChangeIndicator.setChanges(aChanges);

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[0].description,
				"SettingsOtherDescription", "the description is correct"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[0].descriptionTooltip,
				"SettingsOtherChangeTooltip", "the tooltip is correct"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[0].detailButtonText,
				undefined,
				"there is no button text"
			);

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[1].description,
				"SettingsAddDescription", "the description is correct"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[1].descriptionTooltip,
				null,
				"there is no tooltip"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[1].detailButtonText,
				undefined,
				"the button text is correct"
			);

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[2].description,
				"RemoveDescription", "the description is correct"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[2].descriptionTooltip,
				"RemoveDescriptionTooltip", "the tooltip is correct"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[2].detailButtonText,
				undefined,
				"there is no button"
			);

			assert.strictEqual(this.oChangeIndicator._oDetailModel.getData()[3].description,
				"moveDescription",
				"the description from the change handler is not considered"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[3].descriptionTooltip,
				"moveDescriptionVeryLongTooltip", "the tooltip from the change handler is not considered"
			);
			assert.strictEqual(this.oChangeIndicator._oDetailModel.getData()[3].detailButtonText,
				oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE"),
				"the button text is correct"
			);

			assert.notStrictEqual(
				this.oChangeIndicator._oDetailModel.getData()[4].description,
				"moveDescription",
				"the description from the change handler is not considered"
			);
			assert.notStrictEqual(
				this.oChangeIndicator._oDetailModel.getData()[4].descriptionTooltip,
				"moveDescriptionVeryLongTooltip", "the tooltip from the change handler is not considered"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[4].detailButtonText,
				oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE"),
				"the button text is correct"
			);
		});

		QUnit.test("when a change indicator with two changes is created", async function(assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "move", "move"),
					createMockChange("someOtherChangeId", this.oButton.getId(), "addDelegateProperty", "add")
				]
			});
			await nextUIUpdate();

			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorMedium"),
				"then the correct indicator color is used"
			);
			assert.strictEqual(
				this.oChangeIndicator.getDomRef().title,
				"2 changes",
				"then the correct title (tooltip) is set"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
			.then(function() {
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover"),
					"then the popover is opened on click"
				);
				assert.ok(
					this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
					"then the changes table is visible"
				);
				var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
				assert.strictEqual(
					aItems.length,
					2,
					"then both changes are displayed"
				);
				assert.notOk(
					aItems[0].getCells()[1].getItems()[1].getVisible(),
					"then the show details button is not visible when dependent selectors don't exist"
				);
				assert.strictEqual(
					aItems[0].getCells()[0].getTooltip(),
					oRtaResourceBundle.getText(
						"TXT_CHANGEVISUALIZATION_OVERVIEW_ADD"
					),
					"then the proper icon tooltip is displayed for add"
				);
				assert.strictEqual(
					aItems[1].getCells()[0].getTooltip(),
					oRtaResourceBundle.getText(
						"TXT_CHANGEVISUALIZATION_OVERVIEW_MOVE"
					),
					"then the proper icon tooltip is displayed for move"
				);
			}.bind(this));
		});

		QUnit.test("when a change indicator with six changes is created", async function(assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "move", "move", undefined, new Date(2023)),
					createMockChange("someOtherChangeId", this.oButton.getId(), "rename", "rename", undefined, new Date(2022)),
					createMockChange("someOtherChangeIdTwo", this.oButton.getId(), "rename", "rename", undefined, new Date(2010)),
					createMockChange("changeWithNoCreationDate", this.oButton.getId(), "move", "move"),
					createMockChange("someOtherChangeIdThree", this.oButton.getId(), "rename", "rename", undefined, new Date(2019)),
					createMockChange("someOtherChangeIdFour", this.oButton.getId(), "rename", "rename", undefined, new Date(2020))
				]
			});
			await nextUIUpdate();
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorDark"),
				"then the correct indicator color is used"
			);
			assert.strictEqual(
				this.oChangeIndicator.getDomRef().title,
				"6 changes",
				"then the correct title (tooltip) is set"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[0].id,
				"changeWithNoCreationDate",
				"then the indicator is correctly sorted"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[1].id,
				"someChangeId",
				"then the indicator is correctly sorted"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[2].id,
				"someOtherChangeId",
				"then the indicator is correctly sorted"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[3].id,
				"someOtherChangeIdFour",
				"then the indicator is correctly sorted"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[4].id,
				"someOtherChangeIdThree",
				"then the indicator is correctly sorted"
			);
			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.getData()[5].id,
				"someOtherChangeIdTwo",
				"then the indicator is correctly sorted"
			);
		});

		QUnit.test("when a change indicator is focused before it is rendered", async function(assert) {
			this.oChangeIndicator.focus();
			await nextUIUpdate();
			assert.strictEqual(
				document.activeElement,
				this.oChangeIndicator.getDomRef(),
				"then the indicator receives focus as soon as it is rendered"
			);
		});

		QUnit.test("when a change indicator is created with a change payload that has two simple strings", async function(assert) {
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "Aftervalue"
			};

			sandbox.stub(RenameVisualization, "getDescription").callsFake(function(mPayloadParameter, sElementLabel) {
				assert.deepEqual(mPayload, mPayloadParameter, "getDescription is called with the right payload");
				assert.strictEqual(sElementLabel, "TestButton", "getDescription is called with the right element label");
				return { descriptionText: "Test Description", descriptionTooltip: "tooltip"};
			});

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)
				]
			});

			await nextUIUpdate();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				"Test Description",
				"then the description returned from the Visualization Util is displayed"
			);
		});

		QUnit.test("when a change indicator is created with a change payload that has a binding and a string", async function(assert) {
			var mPayload = {
				originalLabel: "{/bindingInfo}",
				newLabel: "AfterValue"
			};

			var oJSONModel = new JSONModel({
				bindingInfo: "BeforeValue"
			});

			this.oButton.setModel(oJSONModel);

			sandbox.stub(RenameVisualization, "getDescription").callsFake(function(mPayloadParameter, sElementLabel) {
				assert.strictEqual(
					mPayloadParameter.originalLabel,
					"BeforeValue",
					"getDescription is called with the right original label"
				);
				assert.strictEqual(
					mPayloadParameter.newLabel,
					"AfterValue",
					"getDescription is called with the right new label"
				);
				assert.strictEqual(
					sElementLabel,
					"TestButton",
					"getDescription is called with the right element label"
				);
				return { descriptionText: "Test Description", descriptionTooltip: "tooltip" };
			});

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)
				]
			});

			await nextUIUpdate();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				"Test Description",
				"then the description returned from the Visualization Util is displayed"
			);
		});

		QUnit.test("when a change indicator is created with a change payload that has two bindings", async function(assert) {
			var mPayload = {
				originalLabel: "{/bindingInfo}",
				newLabel: "{/bindingInfo2}"
			};

			var oJSONModel = new JSONModel({
				bindingInfo: "BeforeValue",
				bindingInfo2: "AfterValue"
			});

			this.oButton.setModel(oJSONModel);

			sandbox.stub(RenameVisualization, "getDescription").callsFake(function(mPayloadParameter, sElementLabel) {
				assert.strictEqual(
					mPayloadParameter.originalLabel,
					"BeforeValue",
					"getDescription is called with the right original label"
				);
				assert.strictEqual(
					mPayloadParameter.newLabel,
					"AfterValue",
					"getDescription is called with the right new label"
				);
				assert.strictEqual(
					sElementLabel,
					"TestButton",
					"getDescription is called with the right element label"
				);
				return { descriptionText: "Test Description", descriptionTooltip: "tooltip" };
			});

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)
				]
			});

			await nextUIUpdate();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				"Test Description",
				"then the description returned from the Visualization Util is displayed"
			);
		});

		QUnit.test("when a change indicator is created with a change payload but there is no specific visualization for that change type yet", async function(assert) {
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "Aftervalue"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "remove", "remove", mPayload)
				]
			});

			await nextUIUpdate();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				oRtaResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_REMOVE",
					["TestButton"]
				),
				"then the description is the previously used generic text"
			);
		});

		QUnit.test("When a ChangeIndicator is created on an initially narrow overlay that later increases in height", async function(assert) {
			const fnDone = assert.async();
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "AfterValue"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "remove", "remove", mPayload)
				]
			});
			await nextUIUpdate();

			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered before the element has changed its height"
			);

			// we need to wait until the overlay styles has been applied
			this.oDesignTime.attachEventOnce("synced", async () => {
				this.oChangeIndicator.invalidate();
				await nextUIUpdate();
				assert.notOk(
					this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
					"then the styleClass was deleted after the element changed its height"
				);
				fnDone();
			});

			this.oButton.getDomRef().style.height = "100px";
		});

		QUnit.test("when a change indicator is hidden", async function(assert) {
			sandbox.stub(DateFormat, "getDateTimeInstance")
			.callThrough()
			.withArgs({ relative: "true" })
			.returns({
				format() { return "myTime"; }
			});
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "AfterValue"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)]
			});

			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");

			await nextUIUpdate();
			assert.ok(this.oChangeIndicator.getVisible(), "then the indicator is visible");
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
			.then(function() {
				const oPreviousRenderPromise = this.oChangeIndicator.waitForRendering();
				this.oChangeIndicator.setVisible(false);
				assert.notOk(this.oChangeIndicator.getVisible(), "then the indicator is not visible");
				assert.notStrictEqual(
					oPreviousRenderPromise,
					this.oChangeIndicator.waitForRendering(),
					"and the render promise was reset"
				);
				this.oChangeIndicator.setVisible(true);
				return this.oChangeIndicator.waitForRendering()
				.then(() => {
					assert.ok(this.oChangeIndicator.getVisible(), "then the indicator finished rendering and is visible");
				});
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});