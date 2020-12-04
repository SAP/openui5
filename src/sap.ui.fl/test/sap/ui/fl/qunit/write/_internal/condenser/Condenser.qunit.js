/* global QUnit*/

sap.ui.define([
	"rta/qunit/RtaQunitUtils",
	// "sap/ui/core/ComponentContainer",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	// "sap/ui/core/UIComponent",
	// "sap/ui/mdc/TableDelegate",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	// ComponentContainer,
	JsControlTreeModifier,
	// UIComponent,
	// TableDelegate,
	Applier,
	Reverter,
	ChangeRegistry,
	Condenser,
	Change,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oAppComponent;
	var sAffectedControlMgs = "Affected control under index";
	var sContainerElementsMsg = "Expected number of container elements: ";
	var sChangeTypeMsg = "Expected change type: ";
	var sPropertyMsg = "Expected property: ";
	var sValueMsg = "Expected value: ";

	var RENAME_FIELD_CHANGE_TYPE = "renameField";
	var HIDE_CHANGE_TYPE = "hideControl";
	var COMBINE_CHANGE_TYPE = "combineFields";
	var SPLIT_CHANGE_TYPE = "splitField";
	var PROPERTY_CHANGE_TYPE = "propertyChange";

	var sLocalSmartFormId = "idMain1--MainForm";
	var sCompanyCodeFieldId = "GeneralLedgerDocument.CompanyCode";
	var sVictimFieldId = "Victim";
	var sNameFieldId = "GeneralLedgerDocument.Name";
	var sComplexProperty01FieldId = "GeneralLedgerDocument_Header_AccountingDocumentKeyComplex_ComplexProperty01";
	var sComplexProperty02FieldId = "GeneralLedgerDocument_Header_AccountingDocumentKeyComplex_ComplexProperty02";
	var sComplexProperty03FieldId = "GeneralLedgerDocument_Header_AccountingDocumentKeyComplex_ComplexProperty03";

	function getControlSelectorId(sId) {
		return "Comp1---idMain1--" + sId;
	}

	function loadChangesFromPath(sPath, assert, iNumber) {
		return new Promise(function(resolve, reject) {
			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/condenser/" + sPath).done(function(aChangeDefinitions) {
				var aChanges = [];
				aChangeDefinitions.forEach(function(oChangeDefinition) {
					aChanges.push(new Change(Change.createInitialFileContent(oChangeDefinition)));
				});
				assert.equal(aChanges.length, iNumber, "Expected number of changes: " + iNumber);
				resolve(aChanges);
			}).fail(reject);
		});
	}

	function getMessage(sMessage, sControl, iIndex) {
		if (
			iIndex !== undefined
			&& sControl === undefined
		) {
			return sMessage + "[" + iIndex + "] should be ";
		} else if (
			iIndex !== undefined
			&& sControl !== undefined
		) {
			return sMessage + sControl + " should be " + iIndex;
		}
		return sMessage;
	}

	function applyChangeSequentially(aChanges) {
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};

		return aChanges.reduce(function(oPreviousPromise, oChange) {
			return oPreviousPromise.then(function() {
				var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
				if (oControl) {
					return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
				}
			});
		}, Promise.resolve());
	}

	function revertMultipleChanges(aChanges) {
		var mPropertyBag = {
			flexController: {
				_oChangePersistence: {
					_deleteChangeInMap: function() {
					}
				}
			},
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};
		return Reverter.revertMultipleChanges(aChanges.reverse(), mPropertyBag);
	}

	function setChangeState(aChanges, aIndicesForChangeState) {
		aIndicesForChangeState.forEach(function(iIndex) {
			aChanges[iIndex].setState(Change.states.PERSISTED);
		});
	}

	function loadApplyCondenseChanges(sPath, iNumberInitialChanges, iExpectedNumberAfterCondense, assert, aIndicesForChangeState) {
		var aChanges;
		return loadChangesFromPath(sPath, assert, iNumberInitialChanges).then(function(aLoadedChanges) {
			this.aChanges = this.aChanges.concat(aLoadedChanges);
			aChanges = aLoadedChanges;
			setChangeState(aChanges, aIndicesForChangeState || []);
			return applyChangeSequentially(aChanges);
		}.bind(this)).then(function() {
			return Condenser.condense(oAppComponent, aChanges);
		}).then(function(aRemainingChanges) {
			assert.equal(aRemainingChanges.length, iExpectedNumberAfterCondense, "Expected number of remaining changes: " + iExpectedNumberAfterCondense);

			var aDeletedChanges = aChanges.filter(function(oChange) {
				return !aRemainingChanges.some(function(oRemainingChange) {
					return oChange.getId() === oRemainingChange.getId();
				});
			});
			var iChangesFlaggedDelete = 0;
			aDeletedChanges.forEach(function(oDeletedChange) {
				if (oDeletedChange.condenserState === "delete") {
					iChangesFlaggedDelete++;
				}
			});
			assert.equal(aDeletedChanges.length, iChangesFlaggedDelete, "filtered out changes have state 'delete'");

			var iChangesFlaggedSelectOrUpdate = 0;
			aRemainingChanges.forEach(function(oRemainingChange) {
				if (oRemainingChange.condenserState === "select" || oRemainingChange.condenserState === "update") {
					iChangesFlaggedSelectOrUpdate++;
				}
			});
			assert.equal(aRemainingChanges.length, iChangesFlaggedSelectOrUpdate, "remaining changes have state 'select' or 'update'");

			return aRemainingChanges;
		});
	}

	function revertAndApplyNew(aApplyChanges) {
		return revertMultipleChanges(this.aChanges)
		.then(function() {
			this.aChanges = aApplyChanges;
			return applyChangeSequentially(aApplyChanges);
		}.bind(this));
	}

	QUnit.module("Condenser with default and smartform changes", {
		before: function() {
			return RtaQunitUtils.renderTestAppAtAsync("qunit-fixture").then(function(oComp) {
				oAppComponent = oComp.getComponentInstance();
			});
		},
		beforeEach: function() {
			this.aChanges = [];
		},
		afterEach: function() {
			return revertMultipleChanges(this.aChanges).then(function() {
				sandbox.restore();
			});
		},
		after: function() {
			oAppComponent.destroy();
		}
	}, function() {
		QUnit.test("multiple rename changes on multiple controls", function(assert) {
			return loadApplyCondenseChanges.call(this, "renameChanges.json", 9, 3, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getText("fieldLabel"), "Doc Number", "Expected renamed field label: Doc Number");
				assert.equal(aRemainingChanges[1].getText("fieldLabel"), "Company-Code", "Expected renamed field label: Company-Code");
				assert.equal(aRemainingChanges[2].getText("fieldLabel"), "Button", "Expected renamed field label: Button");
			});
		});

		QUnit.test("multiple hide changes on the same control", function(assert) {
			return loadApplyCondenseChanges.call(this, "hideChanges.json", 4, 1, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), HIDE_CHANGE_TYPE, sChangeTypeMsg + HIDE_CHANGE_TYPE);
			});
		});

		QUnit.test("hide unhide on the same control and move on another control", function(assert) {
			return loadApplyCondenseChanges.call(this, "hideUnhideMoveDifferentControls.json", 3, 1, assert);
		});

		QUnit.test("multiple reveal changes on the same control", function(assert) {
			return loadApplyCondenseChanges.call(this, "unhideChanges.json", 4, 1, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), "unhideControl", sChangeTypeMsg + "unhideControl");
			});
		});

		QUnit.test("multiple reveal and hide on the same control - 1", function(assert) {
			return loadApplyCondenseChanges.call(this, "hideUnhideChanges_1.json", 4, 0, assert);
		});

		QUnit.test("multiple reveal and hide on the same control - 2", function(assert) {
			return loadApplyCondenseChanges.call(this, "hideUnhideChanges_2.json", 4, 0, assert);
		});

		QUnit.test("multiple reveal and hide on the same control - 3", function(assert) {
			return loadApplyCondenseChanges.call(this, "hideUnhideChanges_3.json", 11, 1, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), HIDE_CHANGE_TYPE, sChangeTypeMsg + HIDE_CHANGE_TYPE);
			});
		});

		QUnit.test("multiple property changes on different controls and properties", function(assert) {
			return loadApplyCondenseChanges.call(this, "propertyChanges.json", 10, 4, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
				assert.equal(aRemainingChanges[0].getContent().property, "useHorizontalLayout", sPropertyMsg + "useHorizontalLayout");
				assert.equal(aRemainingChanges[0].getContent().newValue, false, sValueMsg + false);

				assert.equal(aRemainingChanges[1].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
				assert.equal(aRemainingChanges[1].getContent().property, "elementForLabel", sPropertyMsg + "elementForLabel");
				assert.equal(aRemainingChanges[1].getContent().newValue, 2, sValueMsg + 2);

				assert.equal(aRemainingChanges[2].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
				assert.equal(aRemainingChanges[2].getContent().property, "elementForLabel", sPropertyMsg + "elementForLabel");
				assert.equal(aRemainingChanges[2].getContent().newValue, 1, sValueMsg + 1);

				assert.equal(aRemainingChanges[3].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
				assert.equal(aRemainingChanges[3].getContent().property, "label", sPropertyMsg + "label");
				assert.equal(aRemainingChanges[3].getContent().newValue, "80", sValueMsg + "80");
			});
		});

		QUnit.test("rename / combine / split", function(assert) {
			return loadApplyCondenseChanges.call(this, "renameSourceSelectorCombineRenameSplitChanges.json", 4, 3, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), COMBINE_CHANGE_TYPE, sChangeTypeMsg + COMBINE_CHANGE_TYPE);
				assert.equal(aRemainingChanges[1].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
				assert.equal(aRemainingChanges[2].getChangeType(), SPLIT_CHANGE_TYPE, sChangeTypeMsg + SPLIT_CHANGE_TYPE);
			});
		});

		QUnit.test("rename / combine / rename / split", function(assert) {
			return loadApplyCondenseChanges.call(this, "renameCombineRenameSplitChanges.json", 4, 4, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
				assert.equal(aRemainingChanges[1].getChangeType(), COMBINE_CHANGE_TYPE, sChangeTypeMsg + COMBINE_CHANGE_TYPE);
				assert.equal(aRemainingChanges[2].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
				assert.equal(aRemainingChanges[3].getChangeType(), SPLIT_CHANGE_TYPE, sChangeTypeMsg + SPLIT_CHANGE_TYPE);
			});
		});

		QUnit.test("move within one group", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveFirstAndLastControlsWithinOneGroup.json", 8, 2, assert)
			.then(revertAndApplyNew.bind(this))
			.then(function() {
				var oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				var aGroups = oSmartForm.getGroups();
				var aFirstGroupElements = aGroups[0].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ Victim, Code, Name ]
				assert.equal(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
				assert.equal(aFirstGroupElements[0].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId);
				assert.equal(aFirstGroupElements[1].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 1) + sCompanyCodeFieldId);
				assert.equal(aFirstGroupElements[2].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId);
			});
		});

		[[], [0, 1, 2]].forEach(function(aBackendChanges) {
			var sName = "move within two groups";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, function(assert) {
				return loadApplyCondenseChanges.call(this, "moveWithinTwoGroupsWithoutUnknowns.json", 30, 5, assert, aBackendChanges)
				.then(revertAndApplyNew.bind(this))
				.then(function() {
					if (aBackendChanges.length) {
						var aChangeStates = [];
						var aCondenserStates = [];
						this.aChanges.forEach(function(oChange) {
							aChangeStates.push(oChange.getState());
							aCondenserStates.push(oChange.condenserState);
						});
						assert.propEqual(aChangeStates, [Change.states.NEW, Change.states.NEW, Change.states.DIRTY, Change.states.DIRTY, Change.states.DIRTY], "all remaining changes have the correct change state");
						assert.propEqual(aCondenserStates, ["select", "select", "update", "update", "update"], "all remaining changes have the correct condenser state");
					}

					var oSmartForm = oAppComponent.byId(sLocalSmartFormId);
					var aGroups = oSmartForm.getGroups();
					var aFirstGroupElements = aGroups[0].getGroupElements();
					var aSecondGroupElements = aGroups[1].getGroupElements();
					// Initial UI [ Name, Victim, Code ]
					// Target UI [ Code, Victim, Name ]
					assert.equal(aFirstGroupElements.length, 3, sContainerElementsMsg + 3);
					assert.equal(aFirstGroupElements[0].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 0) + sCompanyCodeFieldId);
					assert.equal(aFirstGroupElements[1].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId);
					assert.equal(aFirstGroupElements[2].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId);
					// Initial UI [ Flexibility, Button35 ]
					// Target UI [ Button35, Flexibility ]
					assert.equal(aSecondGroupElements.length, 2, sContainerElementsMsg + 2);
					assert.equal(aSecondGroupElements[0].getId(), getControlSelectorId("Dates.BoundButton35"), getMessage(sAffectedControlMgs, undefined, 0) + "BoundButton35");
					assert.equal(aSecondGroupElements[1].getId(), getControlSelectorId("Dates.SpecificFlexibility"), getMessage(sAffectedControlMgs, undefined, 1) + "SpecificFlexibility");
				}.bind(this));
			});
		});

		QUnit.test("move within two groups with a backend change and different dependent selectors", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveBetweenTwoGroupsWithDependentSelectors.json", 6, 1, assert, [0])
			.then(revertAndApplyNew.bind(this))
			.then(function() {
				var aChangeStates = [];
				var aCondenserStates = [];
				this.aChanges.forEach(function(oChange) {
					aChangeStates.push(oChange.getState());
					aCondenserStates.push(oChange.condenserState);
				});
				assert.propEqual(aChangeStates, [Change.states.DIRTY], "the remaining change has the correct change state");
				assert.propEqual(aCondenserStates, ["update"], "the remaining change has the correct condenser state");
			}.bind(this));
		});

		QUnit.test("move within two groups without a backend change and different dependent selectors", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveBetweenTwoGroupsWithDependentSelectors.json", 6, 1, assert)
			.then(revertAndApplyNew.bind(this))
			.then(function() {
				var aChangeStates = [];
				var aCondenserStates = [];
				this.aChanges.forEach(function(oChange) {
					aChangeStates.push(oChange.getState());
					aCondenserStates.push(oChange.condenserState);
				});
				assert.propEqual(aChangeStates, [Change.states.NEW], "the remaining change has the correct change state");
				assert.propEqual(aCondenserStates, ["select"], "the remaining change has the correct condenser state");
			}.bind(this));
		});

		QUnit.test("move with no difference at the end within one group", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveToInitialUiReconstruction.json", 7, 0, assert);
		});

		QUnit.test("move with no difference at the end within two groups", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveBetweenTwoGroups.json", 19, 0, assert);
		});

		QUnit.test("add changes", function(assert) {
			return loadApplyCondenseChanges.call(this, "addChanges.json", 6, 3, assert).then(function() {
				// a second addFields is 'not applicable' and can't be reverted
				this.aChanges.splice(5, 1);
				this.aChanges.splice(3, 1);
				this.aChanges.splice(1, 1);
				var oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				var aGroups = oSmartForm.getGroups();
				var aFirstGroupElements = aGroups[0].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ Name, ComplexProperty01, Victim, ComplexProperty02, Code, ComplexProperty03 ]
				assert.equal(aFirstGroupElements.length, 6, sContainerElementsMsg + 6);
				assert.equal(aFirstGroupElements[0].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId);
				assert.equal(aFirstGroupElements[1].getId(), getControlSelectorId(sComplexProperty01FieldId), getMessage(sAffectedControlMgs, undefined, 1) + sComplexProperty01FieldId);
				assert.equal(aFirstGroupElements[2].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sVictimFieldId);
				assert.equal(aFirstGroupElements[3].getId(), getControlSelectorId(sComplexProperty02FieldId), getMessage(sAffectedControlMgs, undefined, 3) + sComplexProperty02FieldId);
				assert.equal(aFirstGroupElements[4].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 4) + sCompanyCodeFieldId);
				assert.equal(aFirstGroupElements[5].getId(), getControlSelectorId(sComplexProperty03FieldId), getMessage(sAffectedControlMgs, undefined, 5) + sComplexProperty03FieldId);
			}.bind(this));
		});

		[[], [0, 1, 2]].forEach(function(aBackendChanges) {
			var sName = "add / move within one group";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, function(assert) {
				return loadApplyCondenseChanges.call(this, "addMoveChanges.json", 29, 3, assert, aBackendChanges)
				.then(revertAndApplyNew.bind(this))
				.then(function() {
					if (aBackendChanges.length) {
						var aChangeStates = [];
						var aCondenserStates = [];
						this.aChanges.forEach(function(oChange) {
							aChangeStates.push(oChange.getState());
							aCondenserStates.push(oChange.condenserState);
						});
						assert.propEqual(aChangeStates, [Change.states.DIRTY, Change.states.DIRTY, Change.states.DIRTY], "all remaining changes have change state 'UPDATE'");
						assert.propEqual(aCondenserStates, ["update", "update", "update"], "all remaining changes have condenser state 'update'");
					}

					var oSmartForm = oAppComponent.byId(sLocalSmartFormId);
					var aGroups = oSmartForm.getGroups();
					var aFirstGroupElements = aGroups[0].getGroupElements();
					// Initial UI [ Name, Victim, Code ]
					// Target UI [ Name, Victim, Code, ComplexProperty03, ComplexProperty02, ComplexProperty01 ]
					assert.equal(aFirstGroupElements.length, 6, sContainerElementsMsg + 6);
					assert.equal(aFirstGroupElements[0].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 0) + sNameFieldId);
					assert.equal(aFirstGroupElements[1].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId);
					assert.equal(aFirstGroupElements[2].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId);
					assert.equal(aFirstGroupElements[3].getId(), getControlSelectorId(sComplexProperty03FieldId), getMessage(sAffectedControlMgs, undefined, 3) + sComplexProperty03FieldId);
					assert.equal(aFirstGroupElements[4].getId(), getControlSelectorId(sComplexProperty02FieldId), getMessage(sAffectedControlMgs, undefined, 4) + sComplexProperty02FieldId);
					assert.equal(aFirstGroupElements[5].getId(), getControlSelectorId(sComplexProperty01FieldId), getMessage(sAffectedControlMgs, undefined, 5) + sComplexProperty01FieldId);
				}.bind(this));
			});
		});

		[[], [0, 1, 2, 3, 5]].forEach(function(aBackendChanges) {
			var sName = "rename and move together";
			if (aBackendChanges.length) {
				sName += " with some backend changes";
			}
			QUnit.test(sName, function(assert) {
				return loadApplyCondenseChanges.call(this, "renameMoveChanges.json", 8, 3, assert, aBackendChanges)
				.then(revertAndApplyNew.bind(this))
				.then(function() {
					var oSmartForm = oAppComponent.byId(sLocalSmartFormId);
					var aGroups = oSmartForm.getGroups();
					var aGroupElements = aGroups[0].getGroupElements();
					// Initial UI [ Name, Victim, Code ]
					// Target UI [ Victim, Name, Code ]
					assert.equal(aGroupElements.length, 3, sContainerElementsMsg + 3);
					assert.equal(aGroupElements[0].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 0) + sVictimFieldId);
					assert.equal(aGroupElements[1].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 1) + sNameFieldId);
					assert.equal(aGroupElements[2].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sCompanyCodeFieldId);

					assert.equal(aGroupElements[1].getLabel(), "Number", "Expected renamed field label: Number");
					assert.equal(aGroupElements[2].getLabel(), "Code", "Expected renamed field label: Code");
				});
			});
		});

		QUnit.test("various index and non-index related changes together", function(assert) {
			return loadApplyCondenseChanges.call(this, "mixOfIndexRelatedAndNonIndexRelatedChanges.json", 39, 9, assert)
			.then(revertAndApplyNew.bind(this))
			.then(function() {
				var oSmartForm = oAppComponent.byId(sLocalSmartFormId);
				var aGroups = oSmartForm.getGroups();
				var aFirstGroupElements = aGroups[0].getGroupElements();
				// Initial UI [ Name, Victim, Code ]
				// Target UI [ ComplexProperty03, Victim, Name, ComplexProperty02, ComplexProperty01, Code]
				assert.equal(aFirstGroupElements.length, 6, sContainerElementsMsg + 6);
				assert.equal(aFirstGroupElements[0].getId(), getControlSelectorId(sComplexProperty03FieldId), getMessage(sAffectedControlMgs, undefined, 0) + sComplexProperty03FieldId);
				assert.equal(aFirstGroupElements[1].getId(), getControlSelectorId(sVictimFieldId), getMessage(sAffectedControlMgs, undefined, 1) + sVictimFieldId);
				assert.equal(aFirstGroupElements[2].getId(), getControlSelectorId(sNameFieldId), getMessage(sAffectedControlMgs, undefined, 2) + sNameFieldId);
				assert.equal(aFirstGroupElements[3].getId(), getControlSelectorId(sComplexProperty02FieldId), getMessage(sAffectedControlMgs, undefined, 3) + sComplexProperty02FieldId);
				assert.equal(aFirstGroupElements[4].getId(), getControlSelectorId(sComplexProperty01FieldId), getMessage(sAffectedControlMgs, undefined, 4) + sComplexProperty01FieldId);
				assert.equal(aFirstGroupElements[5].getId(), getControlSelectorId(sCompanyCodeFieldId), getMessage(sAffectedControlMgs, undefined, 5) + sCompanyCodeFieldId);
			});
		});

		// only non-index relevant changes get condensed
		QUnit.test("various index and non-index related changes together with non-classified", function(assert) {
			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.comp.smartform.GroupElement": {
					unclassified: {
						completeChangeContent: sandbox.stub(),
						applyChange: sandbox.stub(),
						revertChange: sandbox.stub()
					}
				}
			})
			.then(loadApplyCondenseChanges.bind(this, "mixIndexNonIndexUnclassified.json", 41, 27, assert, []));
		});

		QUnit.test("move between different aggregations", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveDifferentAggregations.json", 9, 3, assert)
			.then(revertAndApplyNew.bind(this))
			.then(function() {
				var oBar = oAppComponent.byId("idMain1--bar");
				var aContentLeft = oBar.getContentLeft();
				var aContentMiddle = oBar.getContentMiddle();
				var aContentRight = oBar.getContentRight();
				// Initial UI: contentLeft: [lb1, lb2], contentMiddle: [mb1, mb2], contentRight: [rb1, rb2]
				// Target UI: contentLeft: [lb1, lb2], contentMiddle: [mb2, mb1, rb2], contentRight: [rb1]
				assert.equal(aContentLeft.length, 2, sContainerElementsMsg + 2);
				assert.equal(aContentLeft[0].getId(), oAppComponent.createId("idMain1--lb1"), getMessage(sAffectedControlMgs, undefined, 0) + "lb1");
				assert.equal(aContentLeft[1].getId(), oAppComponent.createId("idMain1--lb2"), getMessage(sAffectedControlMgs, undefined, 1) + "lb2");
				assert.equal(aContentMiddle.length, 3, sContainerElementsMsg + 3);
				assert.equal(aContentMiddle[0].getId(), oAppComponent.createId("idMain1--mb2"), getMessage(sAffectedControlMgs, undefined, 0) + "mb2");
				assert.equal(aContentMiddle[1].getId(), oAppComponent.createId("idMain1--mb1"), getMessage(sAffectedControlMgs, undefined, 1) + "mb1");
				assert.equal(aContentMiddle[2].getId(), oAppComponent.createId("idMain1--rb2"), getMessage(sAffectedControlMgs, undefined, 2) + "rb2");
				assert.equal(aContentRight.length, 1, sContainerElementsMsg + 1);
				assert.equal(aContentRight[0].getId(), oAppComponent.createId("idMain1--rb1"), getMessage(sAffectedControlMgs, undefined, 0) + "rb1");
			});
		});

		// only non-index relevant changes get condensed
		QUnit.test("mix of changes with changes without (currently) existing control", function(assert) {
			return loadChangesFromPath("mixIndexNonIndexNonExisting.json", assert, 8).then(function(aLoadedChanges) {
				aLoadedChanges[2].markFinished();
				aLoadedChanges[6].markFinished();
				this.aChanges = aLoadedChanges;
				return applyChangeSequentially(aLoadedChanges);
			}.bind(this)).then(function() {
				return Condenser.condense(oAppComponent, this.aChanges);
			}.bind(this)).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges.length, 7, "Expected number of remaining changes: " + 7);
			});
		});

		QUnit.test("mix of changes with non-UI changes in between", function(assert) {
			return loadChangesFromPath("mixOfIndexRelatedAndNonIndexRelatedChanges.json", assert, 39).then(function(aLoadedChanges) {
				this.aChanges = aLoadedChanges;
				return applyChangeSequentially(aLoadedChanges);
			}.bind(this)).then(function() {
				// mix in some objects that are not of type sap.ui.fl.Change
				var aChanges = [].concat(this.aChanges);
				aChanges.splice(0, 0, "not a change");
				aChanges.splice(20, 0, {type: "variant"});
				aChanges.splice(30, 0, false);
				return Condenser.condense(oAppComponent, aChanges);
			}.bind(this)).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges.length, 12, "Expected number of remaining changes: " + 12);
				assert.equal(aRemainingChanges[0], "not a change", "the non UI Change was sorted correctly");
				assert.deepEqual(aRemainingChanges[4], {type: "variant"}, "the non UI Change was sorted correctly");
				assert.equal(aRemainingChanges[5], false, "the non UI Change was sorted correctly");
			});
		});

		QUnit.test("mix of not applied changes in between", function(assert) {
			return loadChangesFromPath("mixOfIndexRelatedAndNonIndexRelatedChanges.json", assert, 39).then(function(aLoadedChanges) {
				this.aChanges = aLoadedChanges;
				return applyChangeSequentially(aLoadedChanges);
			}.bind(this)).then(function() {
				// mix in some objects that are not of type sap.ui.fl.Change
				var aChanges = [].concat(this.aChanges);
				aChanges.splice(0, 0, new Change(Change.createInitialFileContent({
					id: "idrename0",
					changeType: "renameField",
					reference: "sap.ui.rta.test.Component",
					selector: {
						id: "idMain1--Victim",
						idIsLocal: true
					}
				})));
				aChanges.splice(20, 0, new Change(Change.createInitialFileContent({
					id: "idrename1",
					changeType: "renameField",
					reference: "sap.ui.rta.test.Component",
					selector: {
						id: "idMain1--Victim",
						idIsLocal: true
					}
				})));
				return Condenser.condense(oAppComponent, aChanges);
			}.bind(this)).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges.length, 11, "Expected number of remaining changes: " + 11);
				assert.equal(aRemainingChanges[0].getId(), "idrename0", "the not applied UI Change was sorted correctly");
				assert.deepEqual(aRemainingChanges[4].getId(), "idrename1", "the not applied UI Change was sorted correctly");
			});
		});

		QUnit.test("calling Condenser twice in one session", function(assert) {
			return loadApplyCondenseChanges.call(this, "moveToInitialUiReconstruction.json", 7, 0, assert)
			.then(loadApplyCondenseChanges.bind(this, "moveWithinTwoGroupsWithoutUnknowns.json", 30, 5, assert));
		});
	});

	/*
	//the tests work only with enablemend of mdc change handlers
	QUnit.module("Condenserwith MDC changes", {
		before: function() {
			var UIComp = UIComponent.extend("mdcComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "",
							type: "application"
						}
					}
				},
				createContent: function() {
					// store it in outer scope
					var oView = sap.ui.view({
						async: false,
						type: "XML",
						id: this.createId("view"),
						viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:table="sap.ui.mdc.table"><Table id="mdcTable"><columns><table:Column id="mdcTable--column0" header="column 0" dataProperties="column0"><m:Text text="{column0}" id="mdcTable--text0" /></table:Column><table:Column id="mdcTable--column1" header="column 1" dataProperties="column1"><m:Text text="{column1}" id="mdcTable--text1" /></table:Column><table:Column id="mdcTable--column2" header="column 2" dataProperties="column2"><m:Text text="{column2}" id="mdcTable--text2" /></table:Column></columns></Table></mvc:View>'
					});
					return oView;
				}
			});
			oAppComponent = new UIComp("comp");
			this.oUiComponentContainer = new ComponentContainer({
				component: oAppComponent,
				async: false
			});
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oView = oAppComponent.getRootControl();
			this.oTable = this.oView.byId("mdcTable");
		},
		beforeEach: function() {
			this.aChanges = [];
			sandbox.stub(TableDelegate, "fetchProperties").resolves([
				{
					name: "column0"
				}, {
					name: "column1"
				}, {
					name: "column2"
				}, {
					name: "column3"
				}
			]);
		},
		afterEach: function() {
			return revertMultipleChanges(this.aChanges).then(function() {
				sandbox.restore();
			});
		},
		after: function() {
			this.oUiComponentContainer.destroy();
		}
	}, function() {
		// MDC Table move
		QUnit.test("move with no difference at the end", function(assert) {
			return loadApplyCondenseChanges.call(this, "mdcMoveChanges_1.json", 8, 0, assert);
		});

		QUnit.test("move within one container", function(assert) {
			return loadApplyCondenseChanges.call(this, "mdcMoveChanges_2.json", 5, 1, assert);
		});

		// MDC Table only remove => 2 remove changes stay
		QUnit.test("remove on multiple controls", function(assert) {
			return loadApplyCondenseChanges.call(this, "mdcRemoveChanges.json", 2, 2, assert);
		});

		// MDC Table: combination of move and remove => only remove change stays
		QUnit.test("move / remove", function(assert) {
			return loadApplyCondenseChanges.call(this, "mdcMoveRemoveChanges.json", 6, 1, assert)
			.then(revertAndApplyNew.bind(this))
			.then(function() {
				var oTable = oAppComponent.byId("view--mdcTable");
				var aColumns = oTable.getColumns();
				assert.equal(aColumns.length, 2, "Expected number of MDC columns: " + 2);
				assert.equal(aColumns[0].getId(), "comp---view--mdcTable--column0", sValueMsg + "column0");
				assert.equal(aColumns[1].getId(), "comp---view--mdcTable--column2", sValueMsg + "column2");
			});
		});

		// MDC Table: combination of add, move and remove => no change stays at the end
		QUnit.test("add / move / remove with no difference at the end", function(assert) {
			return loadApplyCondenseChanges.call(this, "mdcAddMoveRemoveChanges.json", 7, 0, assert);
		});

		// MDC Table: combination of remove and add => both changes stay (ideally both changes be converted to move change)
		QUnit.test("remove / add", function(assert) {
			return loadApplyCondenseChanges.call(this, "mdcRemoveAddChanges.json", 2, 2, assert).then(function(aRemainingChanges) {
				assert.equal(aRemainingChanges[0].getChangeType(), "removeColumn", "the changes are in the right order");
				assert.equal(aRemainingChanges[1].getChangeType(), "addColumn", "the changes are in the right order");
			});
		});
	});
	*/

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
