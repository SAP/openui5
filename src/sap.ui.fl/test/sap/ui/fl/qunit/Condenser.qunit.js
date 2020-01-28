/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/changeHandler/BaseRename",
	"sap/ui/fl/Change",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/write/_internal/Condenser",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"rta/qunit/RtaQunitUtils",
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/fl/changeHandler/UnstashControl"],
function(
	Applier,
	BaseRename,
	Change,
	ChangeRegistry,
	Condenser,
	HideControl,
	JsControlTreeModifier,
	MoveControls,
	PropertyChange,
	Reverter,
	RtaQunitUtils,
	StashControl,
	sinon,
	UnhideControl,
	UnstashControl
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oAppComponent;
	var sGeneralMgs = "Expected number of changes should be ";
	var sAffectedControlMgs = "Affected control under index";
	var sReducedChangesMgs = "Expected number of reduced changes should be ";
	var sRenameMsg = "Expected renamed field label: ";
	var sChangeTypeMsg = "Expected change type: ";
	var sPropertyMsg = "Expected property: ";
	var sValueMsg = "Expected value: ";
	var sChangeIdMsg = "Expected change id: ";

	var RENAME_FIELD_CHANGE_TYPE = "renameField";
	var MOVE_CHANGE_TYPE = "moveControls";
	var HIDE_CHANGE_TYPE = "hideControl";
	var STASH_CONTROL = "stashControl";
	var UNSTASH_CONTROL = "unstashControl";
	var UNHIDE_CHANGE_TYPE = "unhideControl";
	var COMBINE_CHANGE_TYPE = "combineFields";
	var SPLIT_CHANGE_TYPE = "splitField";
	var PROPERTY_CHANGE_TYPE = "propertyChange";

	function loadChangesFromPath(sPath) {
		return new Promise(function(resolve, reject) {
			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/condenser/" + sPath).done(function(aChangeDefinitions) {
				var aChanges = [];
				aChangeDefinitions.forEach(function(oChangeDefinition) {
					aChanges.push(new Change(oChangeDefinition));
				});
				resolve(aChanges);
			}).fail(reject);
		});
	}

	function getControlSelectorId(applicationSelector, group, control) {
		return applicationSelector + group + control;
	}

	function getMessage(message, control, index) {
		if (
			index !== undefined
			&& control === undefined
		) {
			return message + "[" + index + "] should be ";
		} else if (
			index !== undefined
			&& control !== undefined
		) {
			return message + control + " should be " + index;
		}
		return message;
	}

	function applyChangeSequentially(aChanges) {
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};

		return aChanges.reduce(function(oPreviousPromise, oChange) {
			return oPreviousPromise.then(function() {
				var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
				return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
			});
		}, Promise.resolve());
	}

	function getChangeHandler(sChangeType) {
		if (HIDE_CHANGE_TYPE === sChangeType) {
			return HideControl;
		} else if (UNHIDE_CHANGE_TYPE === sChangeType) {
			return UnhideControl;
		} else if (PROPERTY_CHANGE_TYPE === sChangeType) {
			return PropertyChange;
		} else if (RENAME_FIELD_CHANGE_TYPE === sChangeType) {
			return BaseRename.createRenameChangeHandler({
				propertyName: "label",
				translationTextType: "XFLD"
			});
		} else if (MOVE_CHANGE_TYPE === sChangeType) {
			return MoveControls;
		} else if (STASH_CONTROL === sChangeType) {
			return StashControl;
		} else if (UNSTASH_CONTROL === sChangeType) {
			return UnstashControl;
		} else if (COMBINE_CHANGE_TYPE === sChangeType) {
			return {};
		}
	}

	function mockChangeHandler() {
		sandbox.stub(ChangeRegistry, "getInstance").returns({
			getChangeHandler: function(sChangeType) {
				var oChangeHandler = getChangeHandler(sChangeType);
				return Promise.resolve(oChangeHandler);
			},
			initSettings: function() {
			}
		});
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
		return Reverter.revertMultipleChanges(aChanges, mPropertyBag);
	}

	QUnit.module("Verify whether the condenser works properly for non index-related changes", {
		before: function() {
			jQuery("<div/>", {
				id: "getContent()"
			}).css({
				width: "600px",
				height: "600px",
				position: "fixed",
				right: "0",
				bottom: "0",
				top: "auto"
			}).appendTo(jQuery("body"));

			return RtaQunitUtils.renderTestAppAtAsync("getContent()").then(function(oComp) {
				oAppComponent = oComp.getComponentInstance();
			});
		},
		beforeEach: function() {
			mockChangeHandler();
		},
		afterEach: function() {
			sandbox.restore();
		},
		after: function() {
			oAppComponent.destroy();
		}
	}, function() {
		QUnit.test("Condenser has to return a list of 3 changes which were renamed several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("renameChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 9, sGeneralMgs + 9);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 3, sReducedChangesMgs + 3);
					assert.equal(aReducedChanges[0].getText("fieldLabel"), "Doc Number", sRenameMsg + "Doc Number");
					assert.equal(aReducedChanges[1].getText("fieldLabel"), "Company-Code", sRenameMsg + "Company-Code");
					assert.equal(aReducedChanges[2].getText("fieldLabel"), "Button", sRenameMsg + "Button");
				});
			});
		});

		QUnit.test("Condenser has to return a list with only one change which were hide several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("hideChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 1, sReducedChangesMgs + 1);
					assert.equal(aReducedChanges[0].getChangeType(), HIDE_CHANGE_TYPE, sChangeTypeMsg + HIDE_CHANGE_TYPE);
					assert.equal(aReducedChanges[0].getId(), "id_4_hideControl", sChangeIdMsg + "id_4_hideControl");
				});
			});
		});

		QUnit.test("Condenser has to return a list with only one change which were unhide several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("unhideChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 1, sReducedChangesMgs + 1);
					assert.equal(aReducedChanges[0].getChangeType(), UNHIDE_CHANGE_TYPE, sChangeTypeMsg + UNHIDE_CHANGE_TYPE);
					assert.equal(aReducedChanges[0].getId(), "id_4_unhideControl", sChangeIdMsg + "id_4_unhideControl");
				});
			});
		});

		QUnit.test("Condenser has to return an empty list of changes which were hide and unhide several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("hideUnhideChanges_1.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 0, sReducedChangesMgs + 0);
				});
			});
		});

		QUnit.test("Condenser has to return an empty list of changes which were unhide and hide several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("hideUnhideChanges_2.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 0, sReducedChangesMgs + 0);
				});
			});
		});

		QUnit.test("Condenser has to return a list of 5 changes which were hide and unhide several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("hideUnhideChanges_3.json").then(function(aChanges) {
				assert.equal(aChanges.length, 16, sGeneralMgs + 16);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 6, sReducedChangesMgs + 6);
					assert.equal(aReducedChanges[0].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[1].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[2].getChangeType(), HIDE_CHANGE_TYPE, sChangeTypeMsg + HIDE_CHANGE_TYPE);
					assert.equal(aReducedChanges[3].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[4].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[5].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
				});
			});
		});

		QUnit.test("Condenser has to return a list with only one change which were stash several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("stashChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 1, sReducedChangesMgs + 1);
					assert.equal(aReducedChanges[0].getChangeType(), STASH_CONTROL, sChangeTypeMsg + STASH_CONTROL);
					assert.equal(aReducedChanges[0].getId(), "id_4_stashControl", sChangeIdMsg + "id_4_stashControl");
				});
			});
		});

		QUnit.test("Condenser has to return a list with only one change which were unstash several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("unstashChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 1, sReducedChangesMgs + 1);
					assert.equal(aReducedChanges[0].getChangeType(), UNSTASH_CONTROL, sChangeTypeMsg + UNSTASH_CONTROL);
					assert.equal(aReducedChanges[0].getId(), "id_4_unstashControl", sChangeIdMsg + "id_4_unstashControl");
				});
			});
		});

		QUnit.test("Condenser has to return an empty list of changes which were stash and unstash several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("stashUnstashChanges_1.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 0, sReducedChangesMgs + 0);
				});
			});
		});

		QUnit.test("Condenser has to return an empty list of changes which were unstash and stash several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("stashUnstashChanges_2.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 0, sReducedChangesMgs + 0);
				});
			});
		});

		QUnit.test("Condenser has to return a list of only one change which were stash and unstash several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("stashUnstashChanges_3.json").then(function(aChanges) {
				assert.equal(aChanges.length, 6, sGeneralMgs + 6);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 1, sReducedChangesMgs + 1);
					assert.equal(aReducedChanges[0].getChangeType(), STASH_CONTROL, sChangeTypeMsg + STASH_CONTROL);
					assert.equal(aReducedChanges[0].getId(), "id_6_stashControl", sChangeIdMsg + "id_6_stashControl");
				});
			});
		});

		QUnit.test("Condenser has to return a list of 9 changes which were rename, hide and unhide several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("mixOfNonIndexRelatedChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 32, sGeneralMgs + 32);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 9, sReducedChangesMgs + 9);
					assert.equal(aReducedChanges[0].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[1].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[2].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[3].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[4].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[5].getChangeType(), MOVE_CHANGE_TYPE, sChangeTypeMsg + MOVE_CHANGE_TYPE);
					assert.equal(aReducedChanges[6].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
					assert.equal(aReducedChanges[6].getText("fieldLabel"), "Company-Code", sRenameMsg + "Company-Code");
					assert.equal(aReducedChanges[7].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
					assert.equal(aReducedChanges[7].getText("fieldLabel"), "Don't rely on me", sRenameMsg + "Don't rely on me");
					assert.equal(aReducedChanges[8].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
					assert.equal(aReducedChanges[8].getText("fieldLabel"), "Document-Number", sRenameMsg + "Document-Number");

					// UI [Company Code, Document Number, Don't rely on me]
					// equals
					// UI Reconstruction [Company Code, Document Number, Don't rely on me]
					return applyChangeSequentially(aReducedChanges).then(function() {
						var oSmartForm = oAppComponent.byId("idMain1--MainForm");
						var aGroups = oSmartForm.getGroups();
						var aFirstGroupElements = aGroups[0].getGroupElements();
						assert.equal(aFirstGroupElements.length, 3, sReducedChangesMgs + 3);
						var component = "Comp1---";
						var main = "idMain1--";
						var generalLedgerGroup = "GeneralLedgerDocument.";
						var companyCode = "CompanyCode";
						var name = "Name";
						var victim = "Victim";
						assert.equal(aFirstGroupElements[0].getId(), getControlSelectorId(component + main, generalLedgerGroup, companyCode), getMessage(sAffectedControlMgs, undefined, 0) + companyCode);
						assert.equal(aFirstGroupElements[1].getId(), getControlSelectorId(component + main, generalLedgerGroup, name), getMessage(sAffectedControlMgs, undefined, 1) + name);
						assert.equal(aFirstGroupElements[2].getId(), getControlSelectorId(component, main, victim), getMessage(sAffectedControlMgs, undefined, 2) + victim);

						revertMultipleChanges(aReducedChanges);
					});
				});
			});
		});

		QUnit.test("Condenser has to return a list of 5 changes where the properties were changed several times during the adaptation mode", function(assert) {
			return loadChangesFromPath("propertyChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 10, sGeneralMgs + 10);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 4, sReducedChangesMgs + 4);

					assert.equal(aReducedChanges[0].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
					assert.equal(aReducedChanges[0].getContent().property, "useHorizontalLayout", sPropertyMsg + "useHorizontalLayout");
					assert.equal(aReducedChanges[0].getContent().newValue, false, sValueMsg + false);

					assert.equal(aReducedChanges[1].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
					assert.equal(aReducedChanges[1].getContent().property, "elementForLabel", sPropertyMsg + "elementForLabel");
					assert.equal(aReducedChanges[1].getContent().newValue, 2, sValueMsg + 2);

					assert.equal(aReducedChanges[2].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
					assert.equal(aReducedChanges[2].getContent().property, "elementForLabel", sPropertyMsg + "elementForLabel");
					assert.equal(aReducedChanges[2].getContent().newValue, 1, sValueMsg + 1);

					assert.equal(aReducedChanges[3].getChangeType(), PROPERTY_CHANGE_TYPE, sChangeTypeMsg + PROPERTY_CHANGE_TYPE);
					assert.equal(aReducedChanges[3].getContent().property, "horizontalLayoutGroupElementMinWidth", sPropertyMsg + "horizontalLayoutGroupElementMinWidth");
					assert.equal(aReducedChanges[3].getContent().newValue, "80%", sValueMsg + "80%");
				});
			});
		});

		QUnit.test("Condenser has to return a list of 3 changes where the source selector was renamed and combine, rename and split changes were conducted during the adaptation mode", function(assert) {
			return loadChangesFromPath("renameSourceSelectorCombineRenameSplitChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 3, sReducedChangesMgs + 3);
					assert.equal(aReducedChanges[0].getChangeType(), COMBINE_CHANGE_TYPE, sChangeTypeMsg + COMBINE_CHANGE_TYPE);
					assert.equal(aReducedChanges[1].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
					assert.equal(aReducedChanges[2].getChangeType(), SPLIT_CHANGE_TYPE, sChangeTypeMsg + SPLIT_CHANGE_TYPE);
				});
			});
		});

		QUnit.test("Condenser has to return a list of 4 changes where the non-source selector was renamed, and combine, rename and split changes were conducted during the adaptation mode", function(assert) {
			return loadChangesFromPath("renameCombineRenameSplitChanges.json").then(function(aChanges) {
				assert.equal(aChanges.length, 4, sGeneralMgs + 4);
				return Condenser.condense(oAppComponent, aChanges).then(function(aReducedChanges) {
					assert.equal(aReducedChanges.length, 4, sReducedChangesMgs + 4);
					assert.equal(aReducedChanges[0].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
					assert.equal(aReducedChanges[1].getChangeType(), COMBINE_CHANGE_TYPE, sChangeTypeMsg + COMBINE_CHANGE_TYPE);
					assert.equal(aReducedChanges[2].getChangeType(), RENAME_FIELD_CHANGE_TYPE, sChangeTypeMsg + RENAME_FIELD_CHANGE_TYPE);
					assert.equal(aReducedChanges[3].getChangeType(), SPLIT_CHANGE_TYPE, sChangeTypeMsg + SPLIT_CHANGE_TYPE);
				});
			});
		});
	});
});
