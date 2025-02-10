/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/each",
	"sap/base/util/isPlainObject",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/write/_internal/condenser/classifications/LastOneWins",
	"sap/ui/fl/write/_internal/condenser/classifications/Reverse",
	"sap/ui/fl/write/_internal/condenser/classifications/Update",
	"sap/ui/fl/write/_internal/condenser/UIReconstruction",
	"sap/ui/fl/write/_internal/condenser/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/performance/Measurement"
], function(
	_isEqual,
	each,
	isPlainObject,
	ObjectPath,
	Log,
	JsControlTreeModifier,
	Element,
	ChangesUtils,
	FlexObject,
	States,
	UIChange,
	CondenserClassification,
	LastOneWins,
	Reverse,
	Update,
	UIReconstruction,
	CondenserUtils,
	FlUtils,
	Measurement
) {
	"use strict";

	/**
	 * Condenser that reduces a number of changes to a bare minimum.
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.condenser.Condenser
	 * @author SAP SE
	 * @version ${version}
	 */
	const Condenser = {};

	const UNCLASSIFIED = "unclassified";

	/**
	 * Classification of the non-index-related changes
	 *
	 * @type {{lastOneWins: addLastOneWinsChange, reverse: addReverseChange}}
	 */
	const NON_INDEX_RELEVANT = {
		lastOneWins: LastOneWins,
		reverse: Reverse,
		update: Update
	};

	const PROPERTIES_WITH_SELECTORS = ["affectedControl", "sourceContainer", "targetContainer", "updateControl"];

	/**
	 * Verify 'move' subtype has already been added to the data structure before 'create' subtype
	 * and they both belong to the same targetContainer
	 *
	 * @param {object} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterMoveSubtype(mSubtypes, oCondenserInfo) {
		const aMoveSubType = mSubtypes[CondenserClassification.Move];
		return oCondenserInfo.classification === CondenserClassification.Create
			&& aMoveSubType
			&& aMoveSubType[aMoveSubType.length - 1].targetContainer === oCondenserInfo.targetContainer;
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'move' subtype
	 *
	 * @param {object} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'destroy' subtype has been added to the data structure before 'move' subtype
	 */
	function isMoveAfterDestroySubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.classification === CondenserClassification.Move && mSubtypes[CondenserClassification.Destroy];
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'create' subtype
	 *
	 * @param {object} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterDestroySubtype(mClassifications, oCondenserInfo) {
		return oCondenserInfo.classification === CondenserClassification.Create && mClassifications[CondenserClassification.Destroy];
	}

	/**
	 * Adds an index-related change to the data structures.
	 *
	 * @param {object} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance that will be added to the array
	 * @returns {Promise} resolves when the change is added to the data structure
	 */
	async function addIndexRelatedChange(mClassifications, mUIReconstructions, oCondenserInfo, oChange) {
		if (
			!isMoveAfterDestroySubtype(mClassifications, oCondenserInfo)
			&& !isCreateAfterDestroySubtype(mClassifications, oCondenserInfo)
		) {
			const sClassification = oCondenserInfo.classification;
			if (!mClassifications[sClassification]) {
				oCondenserInfo.change = oChange;
				oChange.condenserState = "select";
				mClassifications[sClassification] = [oCondenserInfo];
			} else {
				oChange.condenserState = "delete";
			}
			mClassifications[sClassification][0].updateChange = oChange;
		} else {
			oChange.condenserState = "delete";
		}

		if (
			isCreateAfterMoveSubtype(mClassifications, oCondenserInfo)
			|| isCreateAfterDestroySubtype(mClassifications, oCondenserInfo)
		) {
			if (mClassifications[CondenserClassification.Move]) {
				mClassifications[CondenserClassification.Move].forEach((oCondenserInfo) => {
					oCondenserInfo.change.condenserState = "delete";
				});
				delete mClassifications[CondenserClassification.Move];
			}
			if (mClassifications[CondenserClassification.Destroy]) {
				mClassifications[CondenserClassification.Destroy].forEach((oCondenserInfo) => {
					oCondenserInfo.change.condenserState = "delete";
				});
				delete mClassifications[CondenserClassification.Destroy];
			}
		}
		await UIReconstruction.addChange(mUIReconstructions, oCondenserInfo);
	}

	/**
	 * Adds a non-index related change to the map.
	 * @param {object} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance that will be added to the array
	 */
	function addNonIndexRelatedChange(mClassifications, oCondenserInfo, oChange) {
		mClassifications[oCondenserInfo.classification] ||= {};
		const mProperties = mClassifications[oCondenserInfo.classification];
		NON_INDEX_RELEVANT[oCondenserInfo.classification].addToChangesMap(mProperties, oCondenserInfo, oChange);
	}

	/**
	 * Adds a classified change to the data structures.
	 *
	 * @param {object} mTypes - Map of classification types that holds key-value pairs. A key is a unique identifier. A value is a nested map which contains non-index-related and index-related reduced changes
	 * @param {object} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance that will be added to the array
	 * @returns {Promise} returns when change is added to the data structures
	 */
	async function addClassifiedChange(mTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange) {
		mTypes[oCondenserInfo.type] ||= {};
		const mClassifications = mTypes[oCondenserInfo.type];

		if (oCondenserInfo.type === CondenserUtils.NOT_INDEX_RELEVANT) {
			addNonIndexRelatedChange(mClassifications, oCondenserInfo, oChange);
		} else {
			aIndexRelatedChanges.push(oChange);
			// with custom aggregations multiple aggregations can have the same affectedControl
			mClassifications[oCondenserInfo.targetAggregation] ||= {};
			await addIndexRelatedChange(mClassifications[oCondenserInfo.targetAggregation], mUIReconstructions, oCondenserInfo, oChange);
		}
	}

	/**
	 * Adds an unclassified change to the data structure.
	 *
	 * @param {object} mTypes - Map of change types that holds key-value pairs. A key is a unique identifier. A value is an array object that contains all unclassified changes
	 * @param {string} sKey - Key of the "unclassified" map that reflects the fact that the delivered change is not classified
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 */
	function addUnclassifiedChange(mTypes, sKey, oChange) {
		mTypes[sKey] ||= [];
		mTypes[sKey].push(oChange);
		oChange.condenserState = "select";
	}

	/**
	 * Retrieves the condenser information from the change handler
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oFlexObject - Flex object instance
	 * @returns {Promise.<object>} - Resolves with the condenser information or undefined
	 */
	async function getCondenserInfoFromChangeHandler(oAppComponent, oFlexObject) {
		let oChangeHandler;
		let bTemplateAffected = false;
		let mPropertyBag = {};
		try {
			// UI changes require template handling
			if (oFlexObject instanceof UIChange) {
				const sControlId = JsControlTreeModifier.getControlIdBySelector(oFlexObject.getSelector(), oAppComponent);
				const oControl = Element.getElementById(sControlId);
				if (oControl) {
					mPropertyBag = {
						modifier: JsControlTreeModifier,
						appComponent: oAppComponent,
						view: FlUtils.getViewForControl(oControl)
					};
					const mControl = ChangesUtils.getControlIfTemplateAffected(oFlexObject, oControl, mPropertyBag);
					bTemplateAffected = mControl.bTemplateAffected;
					oChangeHandler = await ChangesUtils.getChangeHandler({
						flexObject: oFlexObject,
						control: mControl.control,
						controlType: mControl.controlType,
						modifier: mPropertyBag.modifier
					});
				}
			} else {
				oChangeHandler = await ChangesUtils.getChangeHandler({
					flexObject: oFlexObject
				});
			}
			if (typeof oChangeHandler.getCondenserInfo === "function") {
				const oCondenserInfo = await oChangeHandler.getCondenserInfo(oFlexObject, mPropertyBag);
				if (oCondenserInfo && bTemplateAffected) {
					replaceTemplateSelector(oCondenserInfo, oFlexObject);
				}
				return oCondenserInfo;
			}
		} catch (oError) {
			return undefined;
		}
		return undefined;
	}

	function replaceTemplateSelector(oCondenserInfo, oChange) {
		const oOriginalSelector = oChange.getOriginalSelector();
		const oTemplateSelector = oChange.getSelector();
		PROPERTIES_WITH_SELECTORS.forEach((sPropertyName) => {
			if (oCondenserInfo[sPropertyName] && oCondenserInfo[sPropertyName] === oTemplateSelector) {
				oCondenserInfo[sPropertyName] = oOriginalSelector;
			}
		});
	}

	/**
	 * Retrieves the classification types map.
	 *
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @param {object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oFlexObject - Flex object instance
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @returns {object} Classification types map
	 */
	function getTypesMap(mReducedChanges, oCondenserInfo, oFlexObject, oAppComponent) {
		const sIdForCondensing = oFlexObject.getIdForCondensing(oCondenserInfo, oAppComponent);
		mReducedChanges[sIdForCondensing] ||= {};
		// If an updateControl is present, it means that the update has a different selector from the other changes
		// (e.g. iFrame added as Section) and the changes must be brought to the same group (= same affected control)
		if (oCondenserInfo && oCondenserInfo.updateControl) {
			const sUpdateControlId = oCondenserInfo.updateControl;
			const aPath = [CondenserUtils.NOT_INDEX_RELEVANT, CondenserClassification.Update, oCondenserInfo.uniqueKey];
			const oUpdateCondenserInfo = ObjectPath.get(aPath, mReducedChanges[sUpdateControlId]);
			if (oUpdateCondenserInfo) {
				ObjectPath.set(aPath, oUpdateCondenserInfo, mReducedChanges[sIdForCondensing]);
				delete mReducedChanges[sUpdateControlId][CondenserUtils.NOT_INDEX_RELEVANT]
				[CondenserClassification.Update][oCondenserInfo.uniqueKey];
			}
		}
		return mReducedChanges[sIdForCondensing];
	}

	/**
	 * Defines the data structures that contain reduced changes and UI reconstructions for index-related changes.
	 *
	 * 		mReducedChanges: {
	 * 			"<selectorId>": {
	 * 				"<type>":
	 * 					"<classification>":
	 * 						"<uniqueKey>": [<sap.ui.fl.apply._internal.flexObjects.FlexObject>]
	 * 				...
	 * 				"nonIndexRelated": {
	 * 					"lastOneWins" : {
	 * 						"label": [oChange1]
	 * 					},
	 * 					"reverse": {
	 * 						"visible": [oChange2, oChange3],
	 * 						"stashed": [oChange4, oChange5]
	 * 					}
	 * 				}
	 * 				...
	 * 				"indexRelated": {
	 * 					"<targetAggregation>": {
	 * 						"move": [oCondenserInfo],
	 * 						"create": [oCondenserInfo],
	 * 						"destroy": [oCondenserInfo]
	 * 					}
	 * 				}
	 * 				...
	 * 				"unclassified" : [oChange6, oChange7, oChange8]
	 * 			}
	 * 		}
	 *
	 * 		mUIReconstructions: {
	 * 			"<selectorId>": {
	 * 				"<aggregationName>": {
	 * 					"<targetUI>": [<string>],
	 * 					"<initialUI>": [<string>]
	 * 				}
	 * 			}
	 * 		}
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @param {object} mUIReconstructions - Map of UI reconstructions
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - All Change instances
	 * @returns {Promise} Resolves when all changes were added to the maps
	 */
	async function defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, aChanges) {
		for (const oChange of aChanges) {
			await addChangeToMap(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, oChange);
		}
	}

	async function addChangeToMap(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, oChange) {
		const oCondenserInfo = await getCondenserInfoFromChangeHandler(oAppComponent, oChange);
		changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent);
		const mTypes = getTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent);
		if (oCondenserInfo !== undefined) {
			addType(oCondenserInfo);
			await addClassifiedChange(mTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange);
			if (oCondenserInfo.update) {
				condenseUpdateChange(mTypes, oCondenserInfo, oChange);
			}
		} else {
			addUnclassifiedChange(mTypes, UNCLASSIFIED, oChange);
			mReducedChanges[UNCLASSIFIED] = true;
		}
	}

	function addType(oCondenserInfo) {
		if (NON_INDEX_RELEVANT[oCondenserInfo.classification]) {
			oCondenserInfo.type = CondenserUtils.NOT_INDEX_RELEVANT;
		} else {
			oCondenserInfo.type = CondenserUtils.INDEX_RELEVANT;
		}
	}

	function changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent) {
		PROPERTIES_WITH_SELECTORS.forEach((sPropertyName) => {
			if (oCondenserInfo && oCondenserInfo[sPropertyName]) {
				oCondenserInfo[sPropertyName] = JsControlTreeModifier.getControlIdBySelector(oCondenserInfo[sPropertyName], oAppComponent);
			}
		});
	}

	/**
	 * Handles change with specific update function on CondenserInfo (e.g. addIFrame)
	 * The update change is marked for deletion, since the original change will be updated with its content
	 * If the original change is marked for deletion, the update can be skipped
	 * If the original change is already persisted, the new content is an update
	 *
	 * @param {object} mTypes - Map with the changes
	 * @param {object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - The change that is getting updated
	 */
	function condenseUpdateChange(mTypes, oCondenserInfo, oChange) {
		const aPath = [CondenserUtils.NOT_INDEX_RELEVANT, CondenserClassification.Update, oCondenserInfo.uniqueKey];
		const oUpdateCondenserInfo = ObjectPath.get(aPath, mTypes);
		if (oUpdateCondenserInfo) {
			oUpdateCondenserInfo.change.condenserState = "delete";
			if (oChange.condenserState === "delete") {
				return;
			}
			if (oChange.isPersisted()) {
				oChange.condenserState = "update";
			}
			oCondenserInfo.update(oChange, oUpdateCondenserInfo.updateContent);
			oChange.setState(States.LifecycleState.UPDATED);
			delete mTypes[CondenserUtils.NOT_INDEX_RELEVANT][CondenserClassification.Update][oCondenserInfo.uniqueKey];
		}
	}

	/**
	 * Retrieves an array of changes from the delivered data structure.
	 *
	 * @param {object} mObjects - Delivered data structure
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All necessary changes in the map of reduced changes
	 */
	 function getChanges(mObjects, aChanges) {
		each(mObjects, (sKey, vSubObjects) => {
			if (NON_INDEX_RELEVANT[sKey] && NON_INDEX_RELEVANT[sKey].getChangesFromMap) {
				NON_INDEX_RELEVANT[sKey].getChangesFromMap(mObjects, sKey).forEach((oChange) => {
					aChanges.push(oChange);
				});
			} else if (isPlainObject(vSubObjects)) {
				return getChanges(vSubObjects, aChanges);
			} else if (Array.isArray(vSubObjects)) {
				vSubObjects.forEach((oObject) => {
					if (oObject instanceof FlexObject) {
						aChanges.push(oObject);
					} else {
						aChanges.push(oObject.change);
					}
				});
			}
		});
		return aChanges;
	}

	/**
	 * Retrieves an array of changes from the reduced changes map.
	 *
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of the reduced changes
	 */
	function getAllReducedChanges(mReducedChanges) {
		return getChanges(mReducedChanges, []);
	}

	/**
	 * Retrieves an array of index-related changes from the array of reduced changes.
	 *
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @param {object[]} aCondenserInfos - Empty array object that will be filled with condenser info objects
	 * @returns {object[]} Array of objects that contain condenser-specific information and change instance
	 */
	function getCondenserInfos(mReducedChanges, aCondenserInfos) {
		Object.values(mReducedChanges).forEach((vSubObjects) => {
			if (isPlainObject(vSubObjects)) {
				getCondenserInfos(vSubObjects, aCondenserInfos);
			} else if (Array.isArray(vSubObjects)) {
				vSubObjects.forEach((oObject) => {
					if (!(oObject instanceof FlexObject)) {
						aCondenserInfos.push(oObject);
					}
				});
			}
		});
		return aCondenserInfos;
	}

	/**
	 * Sorts an array of reduced changes in the initial order.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aReducedChanges - Array of reduced changes
	 */
	function sortByInitialOrder(aChanges, aReducedChanges) {
		aReducedChanges.sort((a, b) => {
			return aChanges.indexOf(a) - aChanges.indexOf(b);
		});
	}

	function sortCondenserInfosByInitialOrder(aChanges, aCondenserInfos) {
		aCondenserInfos.sort((a, b) => {
			return aChanges.indexOf(a.change) - aChanges.indexOf(b.change);
		});
	}

	function addAllIndexRelatedChanges(aReducedChanges, aIndexRelatedChanges) {
		const aReducedChangeIds = aReducedChanges.map((oChange) => {
			return oChange.getId();
		});

		aIndexRelatedChanges.forEach((oChange) => {
			if (aReducedChangeIds.indexOf(oChange.getId()) === -1) {
				aReducedChanges.push(oChange);
			}
		});
	}

	function updateRevertData(mReducedChanges) {
		for (const sId in mReducedChanges) {
			for (const sClassification of ["lastOneWins", "update"]) {
				const oUniqueKeys = ObjectPath.get([sId, CondenserUtils.NOT_INDEX_RELEVANT, sClassification], mReducedChanges);
				if (oUniqueKeys) {
					for (const oCondenserInfo of Object.values(oUniqueKeys)) {
						if (oCondenserInfo.oldestChange?.getRevertData) {
							oCondenserInfo.change.setRevertData(oCondenserInfo.oldestChange.getRevertData());
						}
					}
				}
			}
		}
	}

	/**
	 * Adding a change of the same classification to the map will only add it as updateChange to the condenser info,
	 * which means that the condenser info holds the first (updateChange) and the last (change) change of the same classification.
	 * If there is an updateChange attached to the condenser info object and that change is already persisted,
	 * that change will be used over the newest change.
	 *
	 * @param {object[]} aCondenserInfos - Condenser info objects
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aReducedChanges - Array of reduced changes
	 * @param {object[]} aReducedIndexRelatedChangesPerContainer - Array with index related reduced changes per container
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Updated reduced changes
	 */
	function handleChangeUpdate(aCondenserInfos, aReducedChanges, aReducedIndexRelatedChangesPerContainer) {
		aCondenserInfos.forEach((oCondenserInfo) => {
			const oUpdateChange = oCondenserInfo.updateChange;
			if (
				oUpdateChange
				// "Update" only modifies the change content. If we support other
				// updates on a change, this code has to be adjusted.
				&& !_isEqual(oUpdateChange.getContent(), oCondenserInfo.change.getContent())
				&& oUpdateChange.getState() !== States.LifecycleState.NEW
			) {
				const oLastChange = oCondenserInfo.change;
				if (oUpdateChange.getId() !== oLastChange.getId()) {
					const oNewContent = oLastChange.getContent();
					oUpdateChange.setContent(oNewContent);
					oUpdateChange.setRevertData(oLastChange.getRevertData());
					oLastChange.condenserState = "delete";
					aReducedChanges = aReducedChanges.map((oChange) => {
						if (oChange.getId() === oLastChange.getId()) {
							return oUpdateChange;
						}
						return oChange;
					});
					const setUpdateChange = (oChange) => {
						if (oChange.getId() === oLastChange.getId()) {
							return oUpdateChange;
						}
						return oChange;
					};
					aReducedIndexRelatedChangesPerContainer.forEach((aReducedIndexRelatedChanges, iIndex) => {
						aReducedIndexRelatedChangesPerContainer[iIndex] = aReducedIndexRelatedChanges.map(setUpdateChange);
					});
				} else {
					oUpdateChange.setState(States.LifecycleState.UPDATED);
				}
				oUpdateChange.condenserState = "update";
			}
		});
		return aReducedChanges;
	}

	/**
	 * The condensing algorithm gets an array of changes that should be reduced to the bare minimum.
	 * The steps of the algorithm are:
	 * (1) Before starting the iteration process through the array of changes,
	 * the condenser reverses the array of changes to start the iteration backwards.
	 * By iterating through the array of changes, the condenser defines two data structures.
	 * The first one contains reduced changes that are stored according to the classification per control.
	 * The second one contains UI reconstructions of the corresponding UI parts.
	 * (2) Afterwards, the target and initial UI reconstructions will be compared.
	 * If they are equal, the corresponding index-related changes will be removed from the data structure, because they are redundant.
	 * (3) Then the target indices of the remaining index-related changes will be updated.
	 * (4) After that, all remaining changes will be collected and sorted by the order in which the condenser got the changes initially.
	 * (5) The index-related changes will be picked out from the previously sorted array of the reduced changes.
	 * After that they will be sorted until the look and feel of the UI fits the target UI reconstruction.
	 * (6) Finally, if it is required the index-related changes will be swapped in the array of the reduced changes.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes
	 * @returns {Promise} Promise resolved with the reduced array of changes
	 */
	Condenser.condense = async function(oAppComponent, aChanges) {
		Measurement.start("Condenser_overall", "Condenser overall - CondenserClass", ["sap.ui.fl", "Condenser"]);
		const mReducedChanges = {};
		const mUIReconstructions = {};
		const aAllIndexRelatedChanges = [];

		// filter out objects which are not applied (e.g. not part of the active variant) or of unsupported type (e.g. variants)
		// + mark deleted changes
		const aNotCondensableChanges = [];
		const aCondensableChanges = [];
		aChanges.slice(0).reverse().forEach((oChange) => {
			if (oChange.getState() === States.LifecycleState.DELETED) {
				oChange.condenserState = "delete";
			}
			if (oChange.canBeCondensed()) {
				aCondensableChanges.push(oChange);
			} else {
				aNotCondensableChanges.push(oChange);
			}
		});

		Measurement.start("Condenser_defineMaps", "defining of maps - CondenserClass", ["sap.ui.fl", "Condenser"]);
		await defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aAllIndexRelatedChanges, aCondensableChanges);
		Measurement.end("Condenser_defineMaps");

		// for Update and LastOneWins changes only the last change is kept, but the revert data of that change does not revert
		// to the initial state of the control. Thus we need to update the revert data with the oldest change per unique key
		updateRevertData(mReducedChanges);

		const bUnclassifiedChanges = mReducedChanges[UNCLASSIFIED];
		if (!bUnclassifiedChanges) {
			UIReconstruction.compareAndUpdate(mReducedChanges, mUIReconstructions);
		}
		let aReducedChanges = getAllReducedChanges(mReducedChanges);

		// with unclassified changes no index relevant changes can be reduced
		if (bUnclassifiedChanges) {
			aAllIndexRelatedChanges.forEach((oChange) => {
				// If the index-relevant change is only being updated, this does not cause side effects
				// If they are being removed (condenserState "delete"), they must be set to "select"
				if (oChange.condenserState !== "update") {
					oChange.condenserState = "select";
				}
			});
			addAllIndexRelatedChanges(aReducedChanges, aAllIndexRelatedChanges);
		}

		aReducedChanges = aReducedChanges.concat(aNotCondensableChanges);
		sortByInitialOrder(aChanges, aReducedChanges);

		if (!bUnclassifiedChanges) {
			Measurement.start(
				"Condenser_handleIndexRelatedChanges",
				"handle index related changes - CondenserClass",
				["sap.ui.fl", "Condenser"]
			);

			let bSuccess = true;
			let aCondenserInfos = getCondenserInfos(mReducedChanges, []);
			sortCondenserInfosByInitialOrder(aChanges, aCondenserInfos);
			let aReducedIndexRelatedChangesPerContainer;
			try {
				Measurement.start("Condenser_sort", "sort index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);
				aReducedIndexRelatedChangesPerContainer = UIReconstruction.sortIndexRelatedChanges(mUIReconstructions, aCondenserInfos);
			} catch (oError) {
				// an error here has to be treated similar to if there were some unclassified changes
				// TODO: could be improved to only add all the changes of that specific container
				Log.error(`Error during Condensing: ${oError.message}`, "No Condensing performed for index-relevant changes.");
				bSuccess = false;
			}
			Measurement.end("Condenser_sort");

			if (bSuccess) {
				// during the simulation more changes can become obsolete
				aReducedChanges = aReducedChanges.filter((oChange) => {
					return oChange.condenserState !== "delete";
				});
				aCondenserInfos = aCondenserInfos.filter((oCondenserInfo) => {
					return oCondenserInfo.change.condenserState !== "delete";
				});
				// until now aReducedChanges still has the newer changes.
				// after replacing them with the older change they have to be sorted again
				aReducedChanges = handleChangeUpdate(aCondenserInfos, aReducedChanges, aReducedIndexRelatedChangesPerContainer);
				sortByInitialOrder(aChanges, aReducedChanges);
				// sort the different containers independently
				aReducedIndexRelatedChangesPerContainer.forEach((aReducedIndexRelatedChanges) => {
					UIReconstruction.swapChanges(aReducedIndexRelatedChanges, aReducedChanges);
				});
			} else {
				aAllIndexRelatedChanges.forEach((oChange) => {
					oChange.condenserState = "select";
				});
				addAllIndexRelatedChanges(aReducedChanges, aAllIndexRelatedChanges);
				sortByInitialOrder(aChanges, aReducedChanges);
			}

			Measurement.end("Condenser_handleIndexRelatedChanges");
		}

		Measurement.end("Condenser_overall");
		return aReducedChanges;
	};

	return Condenser;
});