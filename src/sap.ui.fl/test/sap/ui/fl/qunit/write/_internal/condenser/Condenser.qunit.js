/* global QUnit */

sap.ui.define([
	"delegates/TableDelegate",
	"rta/qunit/RtaQunitUtils",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	TableDelegate,
	RtaQunitUtils,
	XMLView,
	JsControlTreeModifier,
	Element,
	Applier,
	Reverter,
	FlexObjectFactory,
	States,
	MoveControls,
	ChangeHandlerStorage,
	Condenser,
	LocalResetAPI,
	Layer,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	let oAppComponent;
	let oComponentContainer;
	const sAffectedControlMgs = "Affected control under index";
	const sContainerElementsMsg = "Expected number of container elements: ";
	const sChangeTypeMsg = "Expected change type: ";
	const sPropertyMsg = "Expected property: ";
	const sValueMsg = "Expected value: ";

	const RENAME_FIELD_CHANGE_TYPE = "renameField";
	const HIDE_CHANGE_TYPE = "hideControl";
	const COMBINE_CHANGE_TYPE = "combineFields";
	const SPLIT_CHANGE_TYPE = "splitField";
	const PROPERTY_CHANGE_TYPE = "propertyChange";

	const sLocalSmartFormId = "idMain1--MainForm";
	const sCompanyCodeFieldId = "GeneralLedgerDocument.CompanyCode";
	const sVictimFieldId = "Victim";
	const sNameFieldId = "GeneralLedgerDocument.Name";
	const sComplexProperty01FieldId = "GeneralLedgerDocument_Header_AccountingDocumentKeyComplex_ComplexProperty01";
	const sComplexProperty02FieldId = "GeneralLedgerDocument_Header_AccountingDocumentKeyComplex_ComplexProperty02";
	const sComplexProperty03FieldId = "GeneralLedgerDocument_Header_AccountingDocumentKeyComplex_ComplexProperty03";

	function getControlSelectorId(sId) {
		return `Comp1---idMain1--${sId}`;
	}

	async function loadChangesFromPath(sPath, assert, iNumber) {
		const oResponse = await fetch(`test-resources/sap/ui/fl/qunit/testResources/condenser/${sPath}`);
		const aChangeDefinitions = await oResponse.json();
		const aChanges = [];
		aChangeDefinitions.forEach(function(oChangeDefinition) {
			oChangeDefinition.layer = Layer.VENDOR;
			aChanges.push(FlexObjectFactory.createFromFileContent(oChangeDefinition));
		});
		assert.equal(aChanges.length, iNumber, `Expected number of changes: ${iNumber}`);
		return aChanges;
	}

	function getMessage(sMessage, sControl, iIndex) {
		if (
			iIndex !== undefined
			&& sControl === undefined
		) {
			return `${sMessage}[${iIndex}] should be `;
		} else if (
			iIndex !== undefined
			&& sControl !== undefined
		) {
			return `${sMessage + sControl} should be ${iIndex}`;
		}
		return sMessage;
	}

	function applyChangeSequentially(aChanges) {
		const mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};

		return aChanges.reduce(function(oPreviousPromise, oChange) {
			return oPreviousPromise.then(function() {
				const oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
				if (oControl) {
					return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
				}
			});
		}, Promise.resolve());
	}

	function revertMultipleChanges(aChanges) {
		const mPropertyBag = {
			flexController: {
				_oChangePersistence: {
					_deleteChangeInMap() {
					}
				}
			},
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};
		return Reverter.revertMultipleChanges([].concat(aChanges).reverse(), mPropertyBag);
	}

	function setPersistedState(aChanges, aIndicesForChangeState) {
		aIndicesForChangeState.forEach(function(iIndex) {
			aChanges[iIndex].setState(States.LifecycleState.PERSISTED);
		});
	}

	async function loadApplyCondenseChanges(sPath, iNumberInitialChanges, iExpectedNumberAfterCondense, assert, aIndicesForChangeState) {
		const aChanges = await loadChangesFromPath(sPath, assert, iNumberInitialChanges);
		this.aChanges = this.aChanges.concat(aChanges);
		setPersistedState(aChanges, aIndicesForChangeState || []);

		await applyChangeSequentially(aChanges);
		const aRemainingChanges = await Condenser.condense(oAppComponent, aChanges);

		assert.strictEqual(aRemainingChanges.length, iExpectedNumberAfterCondense, `Expected number of remaining changes: ${iExpectedNumberAfterCondense}`);

		const aDeletedChanges = aChanges.filter(function(oChange) {
			return !aRemainingChanges.some(function(oRemainingChange) {
				return oChange.getId() === oRemainingChange.getId();
			});
		});
		let iChangesFlaggedDelete = 0;
		aDeletedChanges.forEach(function(oDeletedChange) {
			if (oDeletedChange.condenserState === "delete") {
				iChangesFlaggedDelete++;
			}
		});
		assert.strictEqual(aDeletedChanges.length, iChangesFlaggedDelete, "filtered out changes have state 'delete'");

		let iChangesFlaggedSelectOrUpdate = 0;
		aRemainingChanges.forEach(function(oRemainingChange) {
			if (oRemainingChange.condenserState === "select" || oRemainingChange.condenserState === "update") {
				iChangesFlaggedSelectOrUpdate++;
			}
		});
		assert.strictEqual(aRemainingChanges.length, iChangesFlaggedSelectOrUpdate, "remaining changes have state 'select' or 'update'");

		this.aChanges = aRemainingChanges;
		return aRemainingChanges;
	}

	async function revertAndApplyNew() {
		await revertMultipleChanges(this.aChanges);
		await applyChangeSequentially(this.aChanges);
	}

	function checkInitialStateAfterRevert(assert) {
		assert.ok(true, "after the test, the Initial UI is shown again");
		const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
		const aGroups = oSmartForm.getGroups();
		const aFirstGroupElements = aGroups[0].getGroupElements();
		assert.strictEqual(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
		assert.strictEqual(
			aFirstGroupElements[0].getId(),
			getControlSelectorId(sNameFieldId),
			getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId
		);
		assert.strictEqual(
			aFirstGroupElements[1].getId(),
			getControlSelectorId(sVictimFieldId),
			getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId
		);
		assert.strictEqual(
			aFirstGroupElements[2].getId(),
			getControlSelectorId(sCompanyCodeFieldId),
			getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId
		);
		const aSecondGroupElements = aGroups[1].getGroupElements();
		assert.strictEqual(aSecondGroupElements.length, 2, sContainerElementsMsg + 2);
		assert.strictEqual(aSecondGroupElements[0].getId(), getControlSelectorId("Dates.SpecificFlexibility"), `${getMessage(sAffectedControlMgs, undefined, 0)}SpecificFlexibility`);
		assert.strictEqual(aSecondGroupElements[1].getId(), getControlSelectorId("Dates.BoundButton35"), `${getMessage(sAffectedControlMgs, undefined, 1)}BoundButton35`);
	}

	QUnit.module("Given an app with a SmartForm", {
		async before() {
			oComponentContainer = await RtaQunitUtils.renderTestAppAtAsync("qunit-fixture");
			oAppComponent = oComponentContainer.getComponentInstance();
		},
		beforeEach() {
			this.aChanges = [];
			this.bSkipRevertOnEnd = false;
		},
		async afterEach(assert) {
			if (!this.bSkipRevertOnEnd) {
				await revertMultipleChanges(this.aChanges);
				checkInitialStateAfterRevert(assert);
			}
			sandbox.restore();
		},
		after() {
			oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("multiple rename changes on multiple controls", async function(assert) {
			const aRemainingChanges = await loadApplyCondenseChanges.call(this, "renameChanges.json", 9, 3, assert);
			assert.strictEqual(aRemainingChanges[0].getText("fieldLabel"), "Doc Number", "Expected renamed field label: Doc Number");
			assert.strictEqual(aRemainingChanges[1].getText("fieldLabel"), "Company-Code", "Expected renamed field label: Company-Code");
			assert.strictEqual(aRemainingChanges[2].getText("fieldLabel"), "Button", "Expected renamed field label: Button");
		});

		QUnit.test("when (rename) changes have failed during the apply process", async function(assert) {
			const aLoadedChanges = await loadChangesFromPath("renameChanges.json", assert, 9);
			this.aChanges = aLoadedChanges;
			await applyChangeSequentially(aLoadedChanges);
			// Get one of the changes that would normally be condensed
			const oFailedChange = this.aChanges.find(function(oChange) {
				return oChange.getId() === "id_1576490280160_42_renameField";
			});
			oFailedChange.markFailed();
			const aRemainingChanges = await Condenser.condense(oAppComponent, this.aChanges);
			assert.ok(aRemainingChanges.includes(oFailedChange), "then the failed change is not condensed");
			assert.strictEqual(aRemainingChanges.length, 4, "then there is one more remaining change");
			// for a proper revert the change has to be set to successfully applied again
			oFailedChange.markSuccessful();
		});

		QUnit.test("rename changes, then trigger condensing while another variant is active (= changes are reverted)", async function(assert) {
			const aLoadedChanges = await loadChangesFromPath("renameChanges.json", assert, 9);
			this.aChanges = this.aChanges.concat(aLoadedChanges);
			const aChanges = aLoadedChanges.splice(0);
			await applyChangeSequentially(aChanges);

			// Simulate changing the active variant - revert the applied changes
			this.bSkipRevertOnEnd = true;
			await revertMultipleChanges(this.aChanges);
			const aRemainingChanges = await Condenser.condense(oAppComponent, aChanges);
			assert.strictEqual(aRemainingChanges.length, 9, "Reverted changes are not condensed");
		});

		QUnit.test("multiple hide changes on the same control", async function(assert) {
			await loadApplyCondenseChanges.call(this, "hideChanges.json", 4, 1, assert);
		});

		QUnit.test("hide unhide on the same control and move on another control", async function(assert) {
			await loadApplyCondenseChanges.call(this, "hideUnhideMoveDifferentControls.json", 3, 1, assert);
		});

		QUnit.test("multiple reveal changes on the same control", async function(assert) {
			await loadApplyCondenseChanges.call(this, "unhideChanges.json", 4, 1, assert);
		});

		QUnit.test("multiple reveal and hide on the same control - 1", async function(assert) {
			await loadApplyCondenseChanges.call(this, "hideUnhideChanges_1.json", 4, 0, assert);
		});

		QUnit.test("multiple reveal and hide on the same control - 2", async function(assert) {
			await loadApplyCondenseChanges.call(this, "hideUnhideChanges_2.json", 4, 0, assert);
		});

		QUnit.test("multiple reveal and hide on the same control - 3", async function(assert) {
			const aRemainingChanges = await loadApplyCondenseChanges.call(this, "hideUnhideChanges_3.json", 11, 1, assert);
			assert.strictEqual(aRemainingChanges[0].getChangeType(), HIDE_CHANGE_TYPE, sChangeTypeMsg + HIDE_CHANGE_TYPE);
		});

		QUnit.test("multiple property changes on different controls and properties", async function(assert) {
			const aRemainingChanges = await loadApplyCondenseChanges.call(this, "propertyChanges.json", 10, 4, assert);
			assert.strictEqual(aRemainingChanges[0].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[0].getContent().property, "useHorizontalLayout", `${sPropertyMsg}useHorizontalLayout`);
			assert.strictEqual(aRemainingChanges[0].getContent().newValue, false, sValueMsg + false);

			assert.strictEqual(aRemainingChanges[1].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[1].getContent().property, "elementForLabel", `${sPropertyMsg}elementForLabel`);
			assert.strictEqual(aRemainingChanges[1].getContent().newValue, 2, sValueMsg + 2);

			assert.strictEqual(aRemainingChanges[2].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[2].getContent().property, "elementForLabel", `${sPropertyMsg}elementForLabel`);
			assert.strictEqual(aRemainingChanges[2].getContent().newValue, 1, sValueMsg + 1);

			assert.strictEqual(aRemainingChanges[3].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[3].getContent().property, "label", `${sPropertyMsg}label`);
			assert.strictEqual(aRemainingChanges[3].getContent().newValue, "80", `${sValueMsg}80`);
		});

		QUnit.test("rename / combine / split", async function(assert) {
			const aRemainingChanges = await loadApplyCondenseChanges.call(this, "renameSourceSelectorCombineRenameSplitChanges.json", 4, 3, assert);
			assert.strictEqual(aRemainingChanges[0].getChangeType(), COMBINE_CHANGE_TYPE, sChangeTypeMsg + COMBINE_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[1].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[2].getChangeType(), SPLIT_CHANGE_TYPE, sChangeTypeMsg + SPLIT_CHANGE_TYPE);
		});

		QUnit.test("add and move between two groups - field ends up in the first group", async function(assert) {
			await loadApplyCondenseChanges.call(this, "addMoveTwoGroups.json", 5, 1, assert);
			await revertAndApplyNew.call(this);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// Target UI [ Name, ComplexProperty01, Victim, Code ]
			assert.strictEqual(aFirstGroupElements.length, 4, sContainerElementsMsg + 3);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sComplexProperty01FieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sComplexProperty01FieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[3].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 3) + sCompanyCodeFieldId
			);

			// Initial UI [ Flexibility, Button35 ]
			// Target UI [ Flexibility, Button35 ]
			const aSecondGroupElements = aGroups[1].getGroupElements();
			assert.strictEqual(aSecondGroupElements.length, 2, sContainerElementsMsg + 2);
			assert.strictEqual(aSecondGroupElements[0].getId(), getControlSelectorId("Dates.SpecificFlexibility"), `${getMessage(sAffectedControlMgs, undefined, 0)}SpecificFlexibility`);
			assert.strictEqual(aSecondGroupElements[1].getId(), getControlSelectorId("Dates.BoundButton35"), `${getMessage(sAffectedControlMgs, undefined, 1)}BoundButton35`);
		});

		QUnit.test("add and move between two groups - field ends up in the second group", async function(assert) {
			await loadApplyCondenseChanges.call(this, "addMoveTwoGroups2.json", 6, 2, assert);
			await revertAndApplyNew.call(this);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// Target UI [ Name, Victim, Code ]
			assert.strictEqual(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId
			);

			// Initial UI [ Flexibility, Button35 ]
			// Target UI [ Flexibility, ComplexProperty01, Button35 ]
			const aSecondGroupElements = aGroups[1].getGroupElements();
			assert.strictEqual(aSecondGroupElements.length, 3, sContainerElementsMsg + 3);
			assert.strictEqual(
				aSecondGroupElements[0].getId(),
				getControlSelectorId("Dates.SpecificFlexibility"),
				`${getMessage(sAffectedControlMgs, undefined, 0)}SpecificFlexibility`
			);
			assert.strictEqual(
				aSecondGroupElements[1].getId(),
				getControlSelectorId(sComplexProperty01FieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sComplexProperty01FieldId
			);
			assert.strictEqual(
				aSecondGroupElements[2].getId(),
				getControlSelectorId("Dates.BoundButton35"),
				`${getMessage(sAffectedControlMgs, undefined, 2)}BoundButton35`
			);
		});

		QUnit.test("rename / combine / rename / split", async function(assert) {
			const aRemainingChanges = await loadApplyCondenseChanges.call(this, "renameCombineRenameSplitChanges.json", 4, 4, assert);
			assert.strictEqual(aRemainingChanges[0].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[1].getChangeType(), COMBINE_CHANGE_TYPE, sChangeTypeMsg + COMBINE_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[2].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
			assert.strictEqual(aRemainingChanges[3].getChangeType(), SPLIT_CHANGE_TYPE, sChangeTypeMsg + SPLIT_CHANGE_TYPE);
		});

		QUnit.test("move and add within one group", async function(assert) {
			await loadApplyCondenseChanges.call(this, "addMoveSameGroup.json", 3, 2, assert);
			await revertAndApplyNew.call(this);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// Target UI [ Victim, Code, Amount, Name ]
			assert.strictEqual(aFirstGroupElements.length, 4, sContainerElementsMsg + 4);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sCompanyCodeFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sComplexProperty01FieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sComplexProperty01FieldId
			);
			assert.strictEqual(
				aFirstGroupElements[3].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 3) + sNameFieldId
			);
		});

		QUnit.test("move and add within one group and the add change is already persisted", async function(assert) {
			await loadApplyCondenseChanges.call(this, "addMoveSameGroup.json", 3, 2, assert, [0]);
			await revertAndApplyNew.call(this);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// Target UI [ Victim, Code, Amount, Name ]
			assert.strictEqual(aFirstGroupElements.length, 4, sContainerElementsMsg + 4);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sCompanyCodeFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sComplexProperty01FieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sComplexProperty01FieldId
			);
			assert.strictEqual(
				aFirstGroupElements[3].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 3) + sNameFieldId
			);
		});

		QUnit.test("move and add within one group, then do a local reset (= delete all changes)", async function(assert) {
			await loadApplyCondenseChanges.call(this, "addMoveSameGroup.json", 3, 2, assert, [0, 1, 2]);

			this.bSkipRevertOnEnd = true;
			await LocalResetAPI.resetChanges(this.aChanges, oAppComponent);
			const aRemainingChanges = await Condenser.condense(oAppComponent, this.aChanges);

			assert.notOk(aRemainingChanges.length, "then the condenser does not return any changes after local reset");
			this.aChanges.forEach(function(oChange) {
				assert.strictEqual(oChange.condenserState, "delete", "then each change is marked for deletion by the condenser");
			});
			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI = Final UI [ Name, Victim, Code ]
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId
			);
			assert.notOk(aFirstGroupElements[3], "new field is not on UI");
		});

		QUnit.test("move within one group", async function(assert) {
			await loadApplyCondenseChanges.call(this, "moveFirstAndLastControlsWithinOneGroup.json", 8, 1, assert);
			await revertAndApplyNew.call(this);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// Target UI [ Victim, Code, Name ]
			assert.strictEqual(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sCompanyCodeFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId
			);
		});

		QUnit.test("move independently within one group (new move doesn't change the index of the persisted move)", async function(assert) {
			// Change (1): Move "Victim" from 1 to 0 -> persisted change
			// Change (2): Move "Code" from 2 to 1 -> new change
			// -> Result should not contain an "update" for Change (1), since its index doesn't change
			await loadApplyCondenseChanges.call(this, "moveIndependentlyWithinOneGroup.json", 2, 2, assert, [0]);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// UI after applying persisted change [ Victim, Name, Code ]
			// Target UI [ Victim, Code, Name ]
			assert.strictEqual(this.aChanges[0].getState(), States.LifecycleState.PERSISTED, "the persisted change is still persisted");
			assert.strictEqual(this.aChanges[0].condenserState, "select", "the persisted change is marked as 'selected' in the condenser");
			assert.strictEqual(this.aChanges[1].getState(), States.LifecycleState.NEW, "then the new move is a change in state NEW");
			assert.strictEqual(this.aChanges[1].condenserState, "select", "then the new change is marked as 'select' in the condenser");
			assert.strictEqual(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sCompanyCodeFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId
			);
		});

		QUnit.test("move within one group - one change throwing an error in getCondenserInfo", async function(assert) {
			const aLoadedChanges = await loadChangesFromPath("moveFirstAndLastControlsWithinOneGroup.json", assert, 8);
			this.aChanges = aLoadedChanges;
			await applyChangeSequentially(aLoadedChanges);

			sandbox.stub(MoveControls, "getCondenserInfo")
			.onSecondCall()
			.throws()
			.callThrough();

			const aRemainingChanges = await Condenser.condense(oAppComponent, this.aChanges);
			assert.strictEqual(aRemainingChanges.length, 8, "the broken changes cause all the move changes to be returned");
		});

		[[], [0, 1, 2]].forEach(function(aBackendChanges) {
			let sName = "move within two groups";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, async function(assert) {
				await loadApplyCondenseChanges.call(this, "moveWithinTwoGroupsWithoutUnknowns.json", 30, 3, assert, aBackendChanges);
				await revertAndApplyNew.call(this);

				let aExpectedChangeOrder;
				if (aBackendChanges.length) {
					const aChangeStates = [];
					const aCondenserStates = [];
					// eslint-disable-next-line max-nested-callbacks
					this.aChanges.forEach(function(oChange) {
						aChangeStates.push(oChange.getState());
						aCondenserStates.push(oChange.condenserState);
					});
					assert.propEqual(
						aChangeStates,
						[States.LifecycleState.DIRTY, States.LifecycleState.DIRTY, States.LifecycleState.NEW],
						"all remaining changes have the correct change state"
					);
					assert.propEqual(aCondenserStates, ["update", "update", "select"], "all remaining changes have the correct condenser state");
					aExpectedChangeOrder = [
						"id_1579608138773_42_moveControls",
						"id_1579608136945_41_moveControls",
						"id_1579608174158_69_moveControls"
					];
				} else {
					aExpectedChangeOrder = [
						"id_1579608171665_67_moveControls",
						"id_1579608169292_65_moveControls",
						"id_1579608174158_69_moveControls"
					];
				}

				// eslint-disable-next-line max-nested-callbacks
				const aActualChangeOrder = this.aChanges.map((oChange) => oChange.getId());
				// the changes on the groups are independent - the changes done first should also come first
				assert.deepEqual(aActualChangeOrder, aExpectedChangeOrder, "the order is correct");

				const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				const aGroups = oSmartForm.getGroups();
				const aFirstGroupElements = aGroups[0].getGroupElements();
				const aSecondGroupElements = aGroups[1].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ Code, Victim, Name ]
				assert.strictEqual(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
				assert.strictEqual(
					aFirstGroupElements[0].getId(),
					getControlSelectorId(sCompanyCodeFieldId),
					getMessage(sAffectedControlMgs, undefined, 0) + sCompanyCodeFieldId
				);
				assert.strictEqual(
					aFirstGroupElements[1].getId(),
					getControlSelectorId(sVictimFieldId),
					getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId
				);
				assert.strictEqual(
					aFirstGroupElements[2].getId(),
					getControlSelectorId(sNameFieldId),
					getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId
				);
				// Initial UI [ Flexibility, Button35 ]
				// Target UI [ Button35, Flexibility ]
				assert.strictEqual(aSecondGroupElements.length, 2, sContainerElementsMsg + 2);
				assert.strictEqual(aSecondGroupElements[0].getId(), getControlSelectorId("Dates.BoundButton35"), `${getMessage(sAffectedControlMgs, undefined, 0)}BoundButton35`);
				assert.strictEqual(aSecondGroupElements[1].getId(), getControlSelectorId("Dates.SpecificFlexibility"), `${getMessage(sAffectedControlMgs, undefined, 1)}SpecificFlexibility`);
			});
		});

		QUnit.test("move within two groups with a backend change and different dependent selectors", async function(assert) {
			// Initial UI [ Name, Victim, Code ]
			// After backend change -> [Victim, Name, Code]
			// Change (43) -> Name from 1 to 0 -> [Name, Victim, Code]
			// Change (46) -> Name from 1 to 2 -> [Victim, Code, Name]
			// Change (49) -> Name from 1 to 0 -> [Name, Victim, Code]
			// Change (62) -> Name from 1 to 0 -> [Name, Victim, Code]
			// Change (66) -> Name from 0 to 1 -> [Victim, Name, Code] => No update compared to UI after backend change
			await loadApplyCondenseChanges.call(this, "moveBetweenTwoGroupsWithDependentSelectors.json", 6, 1, assert, [0]);
			await revertAndApplyNew.call(this);

			const aChangeStates = [];
			const aCondenserStates = [];
			this.aChanges.forEach(function(oChange) {
				aChangeStates.push(oChange.getState());
				aCondenserStates.push(oChange.condenserState);
			});
			assert.propEqual(aChangeStates, [States.LifecycleState.NEW], "the remaining change has the correct change state");
			assert.propEqual(aCondenserStates, ["select"], "the remaining change has the correct condenser state");
		});

		QUnit.test("move within two groups without a backend change and different dependent selectors", async function(assert) {
			await loadApplyCondenseChanges.call(this, "moveBetweenTwoGroupsWithDependentSelectors.json", 6, 1, assert);
			await revertAndApplyNew.call(this);

			const aChangeStates = [];
			const aCondenserStates = [];
			this.aChanges.forEach(function(oChange) {
				aChangeStates.push(oChange.getState());
				aCondenserStates.push(oChange.condenserState);
			});
			assert.propEqual(aChangeStates, [States.LifecycleState.NEW], "the remaining change has the correct change state");
			assert.propEqual(aCondenserStates, ["select"], "the remaining change has the correct condenser state");
		});

		QUnit.test("move with no difference at the end within one group", async function(assert) {
			await loadApplyCondenseChanges.call(this, "moveToInitialUiReconstruction.json", 7, 0, assert);
		});

		QUnit.test("move with no difference at the end within two groups", async function(assert) {
			await loadApplyCondenseChanges.call(this, "moveBetweenTwoGroups.json", 19, 0, assert);
		});

		/* Failed changes should no longer be condensed because the missing revert data can break the condenser depending
		on the implementation of getCondenserInfo
		Once already applied changes are generally deleted by the condenser, this test can be reenabled

		QUnit.test("add changes", function(assert) {
			return loadApplyCondenseChanges.call(this, "addChanges.json", 6, 3, assert).then(function() {
				// a second addFields is 'not applicable' and can't be reverted
				this.aChanges.splice(5, 1);
				this.aChanges.splice(3, 1);
				this.aChanges.splice(1, 1);
				const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				const aGroups = oSmartForm.getGroups();
				const aFirstGroupElements = aGroups[0].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ Name, ComplexProperty01, Victim, ComplexProperty02, Code, ComplexProperty03 ]
				assert.strictEqual(aFirstGroupElements.length, 6, sContainerElementsMsg + 6);
				assert.strictEqual(aFirstGroupElements[0].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId);
				assert.strictEqual(aFirstGroupElements[1].getId(), getControlSelectorId(sComplexProperty01FieldId), getMessage(sAffectedControlMgs, undefined, 1) + sComplexProperty01FieldId);
				assert.strictEqual(aFirstGroupElements[2].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sVictimFieldId);
				assert.strictEqual(aFirstGroupElements[3].getId(), getControlSelectorId(sComplexProperty02FieldId), getMessage(sAffectedControlMgs, undefined, 3) + sComplexProperty02FieldId);
				assert.strictEqual(aFirstGroupElements[4].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 4) + sCompanyCodeFieldId);
				assert.strictEqual(aFirstGroupElements[5].getId(), getControlSelectorId(sComplexProperty03FieldId), getMessage(sAffectedControlMgs, undefined, 5) + sComplexProperty03FieldId);
			}.bind(this));
		}); */

		[[], [0, 1, 2]].forEach(function(aBackendChanges) {
			let sName = "add / move within one group";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, async function(assert) {
				await loadApplyCondenseChanges.call(this, "addMoveChanges.json", 29, 3, assert, aBackendChanges);
				await revertAndApplyNew.call(this);

				if (aBackendChanges.length) {
					const aChangeStates = [];
					const aCondenserStates = [];
					// eslint-disable-next-line max-nested-callbacks
					this.aChanges.forEach(function(oChange) {
						aChangeStates.push(oChange.getState());
						aCondenserStates.push(oChange.condenserState);
					});
					assert.propEqual(
						aChangeStates,
						[States.LifecycleState.PERSISTED, States.LifecycleState.PERSISTED, States.LifecycleState.PERSISTED],
						"all remaining changes have change state 'PERSISTED'"
					);
					assert.propEqual(
						aCondenserStates,
						["update", "update", "update"],
						"all remaining changes have condenser state 'update' - no position changed on the UI"
					);
				}

				const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				const aGroups = oSmartForm.getGroups();
				const aFirstGroupElements = aGroups[0].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ Name, Victim, Code, ComplexProperty03, ComplexProperty02, ComplexProperty01 ]
				assert.strictEqual(aFirstGroupElements.length, 6, sContainerElementsMsg + 6);
				assert.strictEqual(
					aFirstGroupElements[0].getId(),
					getControlSelectorId(sNameFieldId),
					getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId
				);
				assert.strictEqual(
					aFirstGroupElements[1].getId(),
					getControlSelectorId(sVictimFieldId),
					getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId
				);
				assert.strictEqual(
					aFirstGroupElements[2].getId(),
					getControlSelectorId(sCompanyCodeFieldId),
					getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId
				);
				assert.strictEqual(
					aFirstGroupElements[3].getId(),
					getControlSelectorId(sComplexProperty03FieldId),
					getMessage(sAffectedControlMgs, undefined, 3) + sComplexProperty03FieldId
				);
				assert.strictEqual(
					aFirstGroupElements[4].getId(),
					getControlSelectorId(sComplexProperty02FieldId),
					getMessage(sAffectedControlMgs, undefined, 4) + sComplexProperty02FieldId
				);
				assert.strictEqual(
					aFirstGroupElements[5].getId(),
					getControlSelectorId(sComplexProperty01FieldId),
					getMessage(sAffectedControlMgs, undefined, 5) + sComplexProperty01FieldId
				);
			});
		});

		[[], [0, 1, 2, 3, 5]].forEach(function(aBackendChanges) {
			let sName = "rename and move together";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, async function(assert) {
				await loadApplyCondenseChanges.call(this, "renameMoveChanges.json", 8, 3, assert, aBackendChanges);
				await revertAndApplyNew.call(this);

				const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				const aGroups = oSmartForm.getGroups();
				const aGroupElements = aGroups[0].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ Victim, Name, Code ]
				assert.strictEqual(aGroupElements.length, 3, sContainerElementsMsg + 3);
				assert.strictEqual(
					aGroupElements[0].getId(),
					getControlSelectorId(sVictimFieldId),
					getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId
				);
				assert.strictEqual(
					aGroupElements[1].getId(),
					getControlSelectorId(sNameFieldId),
					getMessage(sAffectedControlMgs, undefined, 1) + sNameFieldId
				);
				assert.strictEqual(
					aGroupElements[2].getId(),
					getControlSelectorId(sCompanyCodeFieldId),
					getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId
				);

				assert.strictEqual(aGroupElements[1].getLabel(), "Number", "Expected renamed field label: Number");
				assert.strictEqual(aGroupElements[2].getLabel(), "Code", "Expected renamed field label: Code");
			});
		});

		QUnit.test("various index and non-index related changes together", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mixOfIndexRelatedAndNonIndexRelatedChanges.json", 41, 10, assert, [0, 1]);
			await revertAndApplyNew.call(this);

			const oSmartForm = oAppComponent.byId(sLocalSmartFormId);
			const aGroups = oSmartForm.getGroups();
			const aFirstGroupElements = aGroups[0].getGroupElements();
			// Initial UI [ Name, Victim, Code ]
			// Target UI [ ComplexProperty03, Victim, Name, ComplexProperty02, ComplexProperty01, Code]
			assert.strictEqual(aFirstGroupElements.length, 6, sContainerElementsMsg + 6);
			assert.strictEqual(
				aFirstGroupElements[0].getId(),
				getControlSelectorId(sComplexProperty03FieldId),
				getMessage(sAffectedControlMgs, undefined, 0) + sComplexProperty03FieldId
			);
			assert.strictEqual(
				aFirstGroupElements[1].getId(),
				getControlSelectorId(sVictimFieldId),
				getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[2].getId(),
				getControlSelectorId(sNameFieldId),
				getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId
			);
			assert.strictEqual(
				aFirstGroupElements[3].getId(),
				getControlSelectorId(sComplexProperty02FieldId),
				getMessage(sAffectedControlMgs, undefined, 3) + sComplexProperty02FieldId
			);
			assert.strictEqual(
				aFirstGroupElements[4].getId(),
				getControlSelectorId(sComplexProperty01FieldId),
				getMessage(sAffectedControlMgs, undefined, 4) + sComplexProperty01FieldId
			);
			assert.strictEqual(
				aFirstGroupElements[5].getId(),
				getControlSelectorId(sCompanyCodeFieldId),
				getMessage(sAffectedControlMgs, undefined, 5) + sCompanyCodeFieldId
			);

			assert.strictEqual(this.aChanges[0].getId(), "id_1579612178492_42_moveControls", "the first move change is still first");
		});

		// only non-index relevant changes get condensed
		QUnit.test("various index and non-index related changes together with non-classified", async function(assert) {
			await ChangeHandlerStorage.registerChangeHandlersForControl("sap.ui.comp.smartform.GroupElement", {
				unclassified: {
					completeChangeContent: sandbox.stub(),
					applyChange: sandbox.stub(),
					revertChange: sandbox.stub()
				}
			});
			await loadApplyCondenseChanges.call(this, "mixIndexNonIndexUnclassified.json", 41, 27, assert, []);
		});

		QUnit.test("move between different aggregations", async function(assert) {
			await loadApplyCondenseChanges.call(this, "moveDifferentAggregations.json", 9, 2, assert);
			await revertAndApplyNew.call(this);

			const oBar = oAppComponent.byId("idMain1--bar");
			const aContentLeft = oBar.getContentLeft();
			const aContentMiddle = oBar.getContentMiddle();
			const aContentRight = oBar.getContentRight();
			// Initial UI: contentLeft: [lb1, lb2], contentMiddle: [mb1, mb2], contentRight: [rb1, rb2]
			// Target UI: contentLeft: [lb1, lb2], contentMiddle: [mb2, mb1, rb2], contentRight: [rb1]
			assert.strictEqual(aContentLeft.length, 2, sContainerElementsMsg + 2);
			assert.strictEqual(aContentLeft[0].getId(), oAppComponent.createId("idMain1--lb1"), `${getMessage(sAffectedControlMgs, undefined, 0)}lb1`);
			assert.strictEqual(aContentLeft[1].getId(), oAppComponent.createId("idMain1--lb2"), `${getMessage(sAffectedControlMgs, undefined, 1)}lb2`);
			assert.strictEqual(aContentMiddle.length, 3, sContainerElementsMsg + 3);
			assert.strictEqual(aContentMiddle[0].getId(), oAppComponent.createId("idMain1--mb2"), `${getMessage(sAffectedControlMgs, undefined, 0)}mb2`);
			assert.strictEqual(aContentMiddle[1].getId(), oAppComponent.createId("idMain1--mb1"), `${getMessage(sAffectedControlMgs, undefined, 1)}mb1`);
			assert.strictEqual(aContentMiddle[2].getId(), oAppComponent.createId("idMain1--rb2"), `${getMessage(sAffectedControlMgs, undefined, 2)}rb2`);
			assert.strictEqual(aContentRight.length, 1, sContainerElementsMsg + 1);
			assert.strictEqual(aContentRight[0].getId(), oAppComponent.createId("idMain1--rb1"), `${getMessage(sAffectedControlMgs, undefined, 0)}rb1`);
		});

		// only non-index relevant changes get condensed
		QUnit.test("mix of changes with changes without (currently) existing control", async function(assert) {
			const aLoadedChanges = await loadChangesFromPath("mixIndexNonIndexNonExisting.json", assert, 8);
			aLoadedChanges[2].markFinished();
			aLoadedChanges[6].markFinished();
			this.aChanges = aLoadedChanges;
			await applyChangeSequentially(aLoadedChanges);

			const aRemainingChanges = await Condenser.condense(oAppComponent, this.aChanges);
			assert.strictEqual(aRemainingChanges.length, 7, `Expected number of remaining changes: ${7}`);
		});

		QUnit.test("mix of changes with non-UI changes in between", async function(assert) {
			const aLoadedChanges = await loadChangesFromPath("mixOfIndexRelatedAndNonIndexRelatedChanges.json", assert, 41);
			this.aChanges = aLoadedChanges;
			await applyChangeSequentially(aLoadedChanges);

			// mix in some objects that are not of type sap.ui.fl.apply._internal.flexObjects.UIChange
			const aChanges = [].concat(this.aChanges);
			aChanges.splice(0, 0, "not a change");
			aChanges.splice(20, 0, {type: "variant"});
			aChanges.splice(30, 0, false);

			const aRemainingChanges = await Condenser.condense(oAppComponent, aChanges);
			assert.strictEqual(aRemainingChanges.length, 13, `Expected number of remaining changes: ${13}`);
			assert.strictEqual(aRemainingChanges[0], "not a change", "the non UI Change was sorted correctly");
			assert.deepEqual(aRemainingChanges[4], {type: "variant"}, "the non UI Change was sorted correctly");
			assert.strictEqual(aRemainingChanges[5], false, "the non UI Change was sorted correctly");
		});

		QUnit.test("mix of not applied changes in between", async function(assert) {
			const aLoadedChanges = await loadChangesFromPath("mixOfIndexRelatedAndNonIndexRelatedChanges.json", assert, 41);
			this.aChanges = aLoadedChanges;
			await applyChangeSequentially(aLoadedChanges);

			// mix in some objects that are not of type sap.ui.fl.apply._internal.flexObjects.UIChange
			const aChanges = [].concat(this.aChanges);
			aChanges.splice(0, 0, FlexObjectFactory.createFromFileContent(({
				fileName: "idRename0",
				layer: Layer.CUSTOMER,
				changeType: "renameField",
				reference: "sap.ui.rta.test",
				selector: {
					id: "idMain1--Victim",
					idIsLocal: true
				}
			})));
			aChanges.splice(20, 0, FlexObjectFactory.createFromFileContent(({
				fileName: "idRename1",
				layer: Layer.CUSTOMER,
				changeType: "renameField",
				reference: "sap.ui.rta.test",
				selector: {
					id: "idMain1--Victim",
					idIsLocal: true
				}
			})));

			const aRemainingChanges = await Condenser.condense(oAppComponent, aChanges);
			assert.strictEqual(aRemainingChanges.length, 12, `Expected number of remaining changes: ${12}`);
			assert.strictEqual(aRemainingChanges[0].getId(), "idRename0", "the not applied UI Change was sorted correctly");
			assert.deepEqual(aRemainingChanges[4].getId(), "idRename1", "the not applied UI Change was sorted correctly");
		});

		QUnit.test("calling Condenser twice in one session", async function(assert) {
			await loadApplyCondenseChanges.call(this, "moveToInitialUiReconstruction.json", 7, 0, assert);
			await loadApplyCondenseChanges.call(this, "moveWithinTwoGroupsWithoutUnknowns.json", 30, 3, assert);
		});
	});

	QUnit.module("Given an app with controls with templates", {
		async before() {
			oComponentContainer = await RtaQunitUtils.renderRuntimeAuthoringAppAt("qunit-fixture");
		},
		beforeEach() {
			this.aChanges = [];
		},
		async afterEach() {
			await revertMultipleChanges(this.aChanges);
			sandbox.restore();
		},
		after() {
			oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("rename, hide/unhide and move in a template", function(assert) {
			return loadApplyCondenseChanges.call(this, "templateChanges.json", 12, 4, assert).then(function(aRemainingChanges) {
				const sRenameChangeType = "rename";
				const sMoveChangeType = "moveControls";
				assert.strictEqual(aRemainingChanges[0].getChangeType(), sRenameChangeType, sChangeTypeMsg + sRenameChangeType);
				assert.strictEqual(aRemainingChanges[1].getChangeType(), sRenameChangeType, sChangeTypeMsg + sRenameChangeType);
				assert.strictEqual(aRemainingChanges[2].getChangeType(), HIDE_CHANGE_TYPE, sChangeTypeMsg + HIDE_CHANGE_TYPE);
				assert.strictEqual(aRemainingChanges[3].getChangeType(), sMoveChangeType, sChangeTypeMsg + sMoveChangeType);
			});
		});
	});

	QUnit.module("Given an ObjectPageLayout", {
		async before() {
			const oView = await XMLView.create({
				viewName: "sap.ui.fl.testResources.condenser.ObjectPageLayout",
				id: "myView"
			});
			oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "ObjectPageComponentId", undefined, oView);
		},
		beforeEach() {
			this.aChanges = [];
		},
		async afterEach() {
			await revertMultipleChanges(this.aChanges);
			sandbox.restore();
		},
		after() {
			oAppComponent._restoreGetAppComponentStub();
			oAppComponent.destroy();
		}
	}, function() {
		[true, false].forEach(function(bPersistedChanges) {
			const sName = `addIFrame and updateIFrame together${bPersistedChanges ? " with some persisted changes" : ""}`;
			QUnit.test(sName, async function(assert) {
				const aPersistedChanges = bPersistedChanges ? [0, 1, 2, 3] : [];
				const aRemainingChanges = await loadApplyCondenseChanges.call(this, "addIFrameUpdateIFrame.json", 7, 3, assert, aPersistedChanges);
				assert.strictEqual(
					aRemainingChanges[0].condenserState,
					bPersistedChanges ? "update" : "select",
					"the condenser state is set correctly"
				);
				assert.strictEqual(
					aRemainingChanges[0].getState(),
					bPersistedChanges ? States.LifecycleState.DIRTY : States.LifecycleState.NEW,
					"the lifecycle state is set correctly"
				);
				assert.strictEqual(aRemainingChanges[0].getContent().url, "https://www.example.com", "the url got updated");
				assert.strictEqual(aRemainingChanges[0].getContent().height, "100px", "the height got updated");
				assert.strictEqual(aRemainingChanges[0].getContent().width, "10rem", "the width got updated");

				assert.strictEqual(
					aRemainingChanges[1].condenserState,
					bPersistedChanges ? "update" : "select",
					"the condenser state is set correctly"
				);
				assert.strictEqual(
					aRemainingChanges[1].getState(),
					bPersistedChanges ? States.LifecycleState.DIRTY : States.LifecycleState.NEW,
					"the lifecycle state is set correctly"
				);
				assert.strictEqual(aRemainingChanges[1].getContent().url, "https://www.example.com", "the url got updated");
				assert.strictEqual(aRemainingChanges[1].getContent().height, "200px", "the height got updated");
				assert.strictEqual(aRemainingChanges[1].getContent().width, "16rem", "the width got updated");
			});
		});

		QUnit.test("only updateIFrame without addIFrame", async function(assert) {
			// Simulate having the addIFrame not part of the Condenser, e.g. because it's in an already active version
			const aLoadedChanges = await loadChangesFromPath("updateIFrame.json", assert, 4);
			this.aChanges = this.aChanges.concat(aLoadedChanges);
			await applyChangeSequentially(this.aChanges);
			const aChanges = this.aChanges.slice(1);

			const aRemainingChanges = await Condenser.condense(oAppComponent, aChanges);
			assert.strictEqual(aRemainingChanges.length, 1, "the updates are condensed to 1 change");
			const oContent = aRemainingChanges[0].getContent();
			assert.strictEqual(oContent.height, "100px", "the height is correct");
			assert.strictEqual(oContent.url, "https://www.example.com", "the url is correct");
			assert.strictEqual(oContent.width, "10rem", "the width is correct");
		});

		[true, false].forEach(function(bPersistedChanges) {
			const sName = `addIFrame and updateIFrame together + unclassified changes${bPersistedChanges ? " with some persisted changes" : ""}`;
			QUnit.test(sName, async function(assert) {
				const aPersistedChanges = bPersistedChanges ? [0, 1, 2, 3] : [];
				await ChangeHandlerStorage.registerChangeHandlersForControl("sap.uxap.ObjectPageSection", {
					unclassified: {
						completeChangeContent: sandbox.stub(),
						applyChange: sandbox.stub(),
						revertChange: sandbox.stub()
					}
				});
				const aRemainingChanges = await loadApplyCondenseChanges.call(this, "addIFrameUpdateIFrameUnclassified.json", 9, 5, assert, aPersistedChanges);

				assert.strictEqual(
					aRemainingChanges[0].condenserState,
					bPersistedChanges ? "update" : "select",
					"the condenser state is set correctly"
				);
				assert.strictEqual(aRemainingChanges[0].getContent().url, "https://www.example.com", "the url got updated");
				assert.strictEqual(aRemainingChanges[0].getContent().height, "100px", "the height got updated");
				assert.strictEqual(aRemainingChanges[0].getContent().width, "10rem", "the width got updated");

				assert.strictEqual(
					aRemainingChanges[1].condenserState,
					bPersistedChanges ? "update" : "select",
					"the condenser state is set correctly"
				);
				assert.strictEqual(aRemainingChanges[1].getContent().url, "https://www.example.com", "the url got updated");
				assert.strictEqual(aRemainingChanges[1].getContent().height, "200px", "the height got updated");
				assert.strictEqual(aRemainingChanges[1].getContent().width, "16rem", "the width got updated");
			});
		});
	});

	QUnit.module("Given a mdc Table", {
		async before() {
			// to avoid a timing issue this has to be stubbed before the Table is loaded
			sandbox.stub(TableDelegate, "fetchProperties").resolves([
				{
					name: "column0",
					label: "Column 0",
					dataType: "String"
				}, {
					name: "column1",
					label: "Column 1",
					dataType: "String"
				}, {
					name: "column2",
					label: "Column 2",
					dataType: "String"
				}, {
					name: "column3",
					label: "Column 3",
					dataType: "String"
				}, {
					name: "column4",
					label: "Column 4",
					dataType: "String"
				}
			]);
			sandbox.stub(TableDelegate, "updateBindingInfo");
			const oView = await XMLView.create({
				viewName: "sap.ui.fl.testResources.condenser.MdcTable",
				id: "view"
			});
			oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "mdcComponentId", undefined, oView);
		},
		beforeEach() {
			this.aChanges = [];
		},
		async afterEach(assert) {
			await revertMultipleChanges(this.aChanges);

			assert.ok(true, "after the test, the Initial UI is shown again");
			const oTable = Element.getElementById("view--mdcTable");
			const aColumns = oTable.getColumns();
			assert.strictEqual(aColumns.length, 3, `Expected number of MDC columns: ${3}`);
			assert.strictEqual(aColumns[0].getId(), "view--mdcTable--column0", `${sValueMsg}column0`);
			assert.strictEqual(aColumns[1].getId(), "view--mdcTable--column1", `${sValueMsg}column1`);
			assert.strictEqual(aColumns[2].getId(), "view--mdcTable--column2", `${sValueMsg}column2`);
		},
		after() {
			oAppComponent._restoreGetAppComponentStub();
			oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		// MDC Table move
		QUnit.test("move columns with no difference at the end", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mdcMoveChanges_1.json", 8, 0, assert);
		});

		QUnit.test("move columns within one container", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mdcMoveChanges_2.json", 5, 1, assert);
		});

		// MDC Table only remove => 2 remove changes stay
		QUnit.test("remove columns on multiple controls", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mdcRemoveChanges.json", 2, 2, assert);
		});

		// MDC Table: combination of move and remove => only remove change stays
		QUnit.test("move / remove columns", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mdcMoveRemoveChanges.json", 6, 1, assert);
			await revertAndApplyNew.call(this);

			const oTable = Element.getElementById("view--mdcTable");
			const aColumns = oTable.getColumns();
			assert.strictEqual(aColumns.length, 2, `Expected number of MDC columns: ${2}`);
			assert.strictEqual(aColumns[0].getId(), "view--mdcTable--column0", `${sValueMsg}column0`);
			assert.strictEqual(aColumns[1].getId(), "view--mdcTable--column2", `${sValueMsg}column2`);
		});

		// MDC Table: combination of add, move and remove => no change stays at the end
		QUnit.test("add / move / remove columns with no difference at the end", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mdcAddMoveRemoveChanges.json", 7, 0, assert);
		});

		// MDC Table: combination of remove and add
		QUnit.test("remove / add columns", async function(assert) {
			await loadApplyCondenseChanges.call(this, "mdcRemoveAddChanges.json", 4, 4, assert);
			await revertAndApplyNew.call(this);

			const oTable = Element.getElementById("view--mdcTable");
			const aColumns = oTable.getColumns();
			assert.strictEqual(aColumns.length, 3, `Expected number of MDC columns: ${3}`);
			assert.strictEqual(aColumns[0].getId(), "view--mdcTable--column3", `${sValueMsg}column3`);
			assert.strictEqual(aColumns[1].getId(), "view--mdcTable--column2", `${sValueMsg}column2`);
			assert.strictEqual(aColumns[2].getId(), "view--mdcTable--column4", `${sValueMsg}column4`);
		});

		[[], [0, 2, 3, 4]].forEach(function(aBackendChanges) {
			let sName = "addSort/moveSort/removeSort/addGroup (custom aggregations)";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, async function(assert) {
				const aChanges = await loadApplyCondenseChanges.call(this, "mdcSortingGrouping.json", 10, 3, assert);

				assert.strictEqual(aChanges[0].getChangeType(), "addGroup", "the remaining changes are of type addSort and addGroup");
				assert.strictEqual(aChanges[1].getChangeType(), "addSort", "the remaining changes are of type addSort and addGroup");
				assert.strictEqual(aChanges[2].getChangeType(), "addSort", "the remaining changes are of type addSort and addGroup");
				const aSorters = Element.getElementById("view--mdcTable").getSortConditions().sorters;
				assert.deepEqual(aSorters[0], {
					key: "sorter2",
					name: "sorter2",
					descending: false
				}, "the content of the first sorter is correct");
				assert.deepEqual(aSorters[1], {
					key: "sorter1",
					name: "sorter1",
					descending: true
				}, "the content of the second sorter is correct");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
