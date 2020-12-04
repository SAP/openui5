/*!
 * ${copyright}
 */

/* global Map */
sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/write/_internal/condenser/classifications/LastOneWins",
	"sap/ui/fl/write/_internal/condenser/classifications/Reverse",
	"sap/ui/fl/write/_internal/condenser/UIReconstruction",
	"sap/ui/fl/write/_internal/condenser/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/performance/Measurement"
], function(
	each,
	isPlainObject,
	isEmptyObject,
	JsControlTreeModifier,
	Core,
	ChangesUtils,
	LastOneWins,
	Reverse,
	UIReconstruction,
	CondenserUtils,
	Change,
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
	var Condenser = {};

	var UNCLASSIFIED = "unclassified";

	/**
	 * Classification of the non-index-related changes
	 *
	 * @type {{lastOneWins: addLastOneWinsChange, reverse: addReverseChange}}
	 */
	var NON_INDEX_RELEVANT = {
		lastOneWins: LastOneWins,
		reverse: Reverse
	};

	/**
	 * Verify 'move' subtype has already been added to the data structure before 'create' subtype
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterMoveSubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.classification === sap.ui.fl.condenser.Classification.Create && mSubtypes[sap.ui.fl.condenser.Classification.Move];
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'move' subtype
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'destroy' subtype has been added to the data structure before 'move' subtype
	 */
	function isMoveAfterDestroySubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.classification === sap.ui.fl.condenser.Classification.Move && mSubtypes[sap.ui.fl.condenser.Classification.Destroy];
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'create' subtype
	 *
	 * @param {Map} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterDestroySubtype(mClassifications, oCondenserInfo) {
		return oCondenserInfo.classification === sap.ui.fl.condenser.Classification.Create && mClassifications[sap.ui.fl.condenser.Classification.Destroy];
	}

	/**
	 * Adds an index-related change to the data structures.
	 *
	 * @param {Map} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addIndexRelatedChange(mClassifications, mUIReconstructions, oCondenserInfo, oChange) {
		if (
			!isMoveAfterDestroySubtype(mClassifications, oCondenserInfo)
			&& !isCreateAfterDestroySubtype(mClassifications, oCondenserInfo)
		) {
			var sClassification = oCondenserInfo.classification;
			if (!mClassifications[sClassification]) {
				oCondenserInfo.change = oChange;
				oChange.condenserState = "select";
				mClassifications[sClassification] = [oCondenserInfo];
			} else {
				oChange.condenserState = "delete";
			}
			mClassifications[sClassification][0].updateChange = oChange;
		}

		if (
			isCreateAfterMoveSubtype(mClassifications, oCondenserInfo)
			|| isCreateAfterDestroySubtype(mClassifications, oCondenserInfo)
		) {
			if (mClassifications[sap.ui.fl.condenser.Classification.Move]) {
				mClassifications[sap.ui.fl.condenser.Classification.Move].forEach(function(oCondenserInfo) {
					oCondenserInfo.change.condenserState = "delete";
				});
				delete mClassifications[sap.ui.fl.condenser.Classification.Move];
			}
			if (mClassifications[sap.ui.fl.condenser.Classification.Destroy]) {
				mClassifications[sap.ui.fl.condenser.Classification.Destroy].forEach(function(oCondenserInfo) {
					oCondenserInfo.change.condenserState = "delete";
				});
				delete mClassifications[sap.ui.fl.condenser.Classification.Destroy];
			}
		}

		UIReconstruction.addChange(mUIReconstructions, oCondenserInfo);
	}

	/**
	 * Adds a classified change to the data structures.
	 *
	 * @param {Map} mTypes - Map of classification types that holds key-value pairs. A key is a unique identifier. A value is a nested map which contains non-index-related and index-related reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {sap.ui.fl.Change[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {Object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addClassifiedChange(mTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange) {
		if (!mTypes[oCondenserInfo.type]) {
			mTypes[oCondenserInfo.type] = {};
		}
		var mClassifications = mTypes[oCondenserInfo.type];

		if (oCondenserInfo.type === CondenserUtils.NOT_INDEX_RELEVANT) {
			if (!mClassifications[oCondenserInfo.classification]) {
				mClassifications[oCondenserInfo.classification] = {};
			}
			var mProperties = mClassifications[oCondenserInfo.classification];
			NON_INDEX_RELEVANT[oCondenserInfo.classification].addToChangesMap(mProperties, oCondenserInfo.uniqueKey, oChange);
		} else {
			aIndexRelatedChanges.push(oChange);
			addIndexRelatedChange(mClassifications, mUIReconstructions, oCondenserInfo, oChange);
		}
	}

	/**
	 * Adds an unclassified change to the data structure.
	 *
	 * @param {Map} mTypes - Map of change types that holds key-value pairs. A key is a unique identifier. A value is an array object that contains all unclassified changes
	 * @param {string} sKey - Key of the "unclassified" map that reflects the fact that the delivered change is not classified
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 */
	function addUnclassifiedChange(mTypes, sKey, oChange) {
		if (!mTypes[sKey]) {
			mTypes[sKey] = [];
		}
		mTypes[sKey].push(oChange);
		oChange.condenserState = "select";
	}

	/**
	 * Retrieves the condenser information from the change handler
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @returns {Promise.<object>} - Resolves with the condenser information or undefined
	 */
	function getCondenserInfoFromChangeHandler(oAppComponent, oChange) {
		var sControlId = JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		var oControl = Core.byId(sControlId);
		if (oControl) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};
			var mControl = ChangesUtils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			return Promise.resolve(ChangesUtils.getChangeHandler(oChange, mControl, mPropertyBag))
			.then(function(oChangeHandler) {
				if (oChangeHandler && typeof oChangeHandler.getCondenserInfo === "function") {
					return oChangeHandler.getCondenserInfo(oChange, mPropertyBag);
				}
			});
		}

		return Promise.resolve();
	}

	/**
	 * Retrieves the classification types map.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {object} oCondenserInfo - Source index of the element
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @returns {Map} Classification types map
	 */
	function getTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent) {
		var sAffectedControlId = oCondenserInfo !== undefined ? oCondenserInfo.affectedControl : JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		if (!mReducedChanges[sAffectedControlId]) {
			mReducedChanges[sAffectedControlId] = {};
		}
		return mReducedChanges[sAffectedControlId];
	}

	/**
	 * Defines the data structures that contain reduced changes and UI reconstructions for index-related changes.
	 *
	 * 		mReducedChanges: {
	 * 			"<selectorId>": {
	 * 				"<type>":
	 * 					"<classification>":
	 * 						"<uniqueKey>": [<sap.ui.fl.Change>]
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
	 * 					"move": [oCondenserInfo],
	 * 					"create": [oCondenserInfo],
	 * 					"destroy": [oCondenserInfo]
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
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 * @param {sap.ui.fl.Change[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {sap.ui.fl.Change[]} aChanges - All Change instances
	 * @returns {Promise} Resolves when all changes were added to the maps
	 */
	function defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, aChanges) {
		return aChanges.reduce(function(oPromise, oChange) {
			return oPromise.then(addChangeToMap.bind(this, oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, oChange));
		}.bind(this), Promise.resolve());
	}

	function addChangeToMap(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, oChange) {
		return getCondenserInfoFromChangeHandler(oAppComponent, oChange).then(function(oCondenserInfo) {
			changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent);
			var mTypes = getTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent);
			if (oCondenserInfo !== undefined) {
				addType(oCondenserInfo);
				addClassifiedChange(mTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange);
			} else {
				addUnclassifiedChange(mTypes, UNCLASSIFIED, oChange);
				mReducedChanges[UNCLASSIFIED] = true;
			}
		});
	}

	function addType(oCondenserInfo) {
		if (NON_INDEX_RELEVANT[oCondenserInfo.classification]) {
			oCondenserInfo.type = CondenserUtils.NOT_INDEX_RELEVANT;
		} else {
			oCondenserInfo.type = CondenserUtils.INDEX_RELEVANT;
		}
	}

	function changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent) {
		["affectedControl", "sourceContainer", "targetContainer"].forEach(function(sPropertyName) {
			if (oCondenserInfo && oCondenserInfo[sPropertyName]) {
				oCondenserInfo[sPropertyName] = JsControlTreeModifier.getControlIdBySelector(oCondenserInfo[sPropertyName], oAppComponent);
			}
		});
	}

	/**
	 * Retrieves an array of changes from the delivered data structure.
	 *
	 * @param {Map} mObjects - Delivered data structure
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @returns {sap.ui.fl.Change[]} All necessary changes in the map of reduced changes
	 */
	 function getChanges(mObjects, aChanges) {
		each(mObjects, function(sKey, vSubObjects) {
			if (NON_INDEX_RELEVANT[sKey] && NON_INDEX_RELEVANT[sKey].getChangesFromMap) {
				NON_INDEX_RELEVANT[sKey].getChangesFromMap(mObjects, sKey).forEach(function(oChange) {
					aChanges.push(oChange);
				});
			} else if (isPlainObject(vSubObjects)) {
				return getChanges(vSubObjects, aChanges);
			} else if (Array.isArray(vSubObjects)) {
				vSubObjects.forEach(function(oObject) {
					if (oObject instanceof Change) {
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
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @returns {sap.ui.fl.Change[]} Array of the reduced changes
	 */
	function getAllReducedChanges(mReducedChanges) {
		return getChanges(mReducedChanges, []);
	}

	/**
	 * Retrieves an array of index-related changes from the array of reduced changes.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {object[]} aCondenserInfos - Empty array object that will be filled with condenser info objects
	 * @returns {object[]} Array of objects that contain condenser-specific information and change instance
	 */
	function getCondenserInfos(mReducedChanges, aCondenserInfos) {
		each(mReducedChanges, function(sKey, vSubObjects) {
			if (isPlainObject(vSubObjects)) {
				getCondenserInfos(vSubObjects, aCondenserInfos);
			} else if (Array.isArray(vSubObjects)) {
				vSubObjects.forEach(function(oObject) {
					if (!(oObject instanceof Change)) {
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
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @param {sap.ui.fl.Change[]} aReducedChanges - Array of reduced changes
	 */
	function sortByInitialOrder(aChanges, aReducedChanges) {
		aReducedChanges.sort(function(a, b) {
			return aChanges.indexOf(a) - aChanges.indexOf(b);
		});
	}

	function addAllIndexRelatedChanges(aReducedChanges, aIndexRelatedChanges) {
		var aReducedChangeIds = aReducedChanges.map(function(oChange) {
			return oChange.getId();
		});

		aIndexRelatedChanges.forEach(function(oChange) {
			if (aReducedChangeIds.indexOf(oChange.getId()) === -1) {
				aReducedChanges.push(oChange);
			}
		});
	}

	function handleChangeUpdate(aCondenserInfos, aReducedChanges) {
		aCondenserInfos.forEach(function(oCondenserInfo) {
			var oUpdateChange = oCondenserInfo.updateChange;
			if (oUpdateChange && oUpdateChange.getState() !== Change.states.NEW) {
				var oCondensedChange = oCondenserInfo.change;
				if (oUpdateChange.getFileName() !== oCondensedChange.getFileName()) {
					var oNewContent = oCondensedChange.getContent();
					oUpdateChange.setContent(oNewContent);
					oCondensedChange.condenserState = "delete";
					aReducedChanges = aReducedChanges.map(function(oChange) {
						if (oChange.getFileName() === oCondensedChange.getFileName()) {
							return oUpdateChange;
						}
						return oChange;
					});
				} else {
					oUpdateChange.setState(Change.states.DIRTY);
				}
				oUpdateChange.condenserState = "update";
			}
		});
		return aReducedChanges;
	}

	/**
	 * The condensing algorithm gets an array of changes that should be reduced to the bare minimum.
	 * The steps of the algorithm are:
	 * (1) Before starting the iteration process through the array of changes, the condenser reverses the array of changes to start the iteration backwards.
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
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @returns {Promise} Promise resolved with the reduced array of changes
	 */
	Condenser.condense = function(oAppComponent, aChanges) {
		Measurement.start("Condenser_overall", "Condenser overall - CondenserClass", ["sap.ui.fl", "Condenser"]);
		var mReducedChanges = {};
		var mUIReconstructions = {};
		var aAllIndexRelatedChanges = [];

		// filter out objects which are not of type change, e.g. Variants, AppVariants, AppVariantInlineChange
		var aNotCondensableChanges = [];
		var aCondensableChanges = [];
		aChanges.slice(0).reverse().forEach(function(oChange) {
			if (oChange instanceof Change && oChange.isApplyProcessFinished()) {
				aCondensableChanges.push(oChange);
			} else {
				aNotCondensableChanges.push(oChange);
			}
		});

		Measurement.start("Condenser_defineMaps", "defining of maps - CondenserClass", ["sap.ui.fl", "Condenser"]);

		return defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aAllIndexRelatedChanges, aCondensableChanges)

		.then(function() {
			Measurement.end("Condenser_defineMaps");
			var bUnclassifiedChanges = mReducedChanges[UNCLASSIFIED];
			if (!bUnclassifiedChanges) {
				UIReconstruction.compareAndUpdate(mReducedChanges, mUIReconstructions);
			}
			var aReducedChanges = getAllReducedChanges(mReducedChanges);

			// with unclassified changes no index relevant changes can be reduced
			if (bUnclassifiedChanges) {
				aAllIndexRelatedChanges.forEach(function(oChange) {
					oChange.condenserState = "select";
				});
				addAllIndexRelatedChanges(aReducedChanges, aAllIndexRelatedChanges);
			}

			aReducedChanges = aReducedChanges.concat(aNotCondensableChanges);
			sortByInitialOrder(aChanges, aReducedChanges);

			if (!bUnclassifiedChanges) {
				Measurement.start("Condenser_handleIndexRelatedChanges", "handle index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);

				var aCondenserInfos = getCondenserInfos(mReducedChanges, []);

				Measurement.start("Condenser_sort", "sort index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);
				var aReducedIndexRelatedChanges = UIReconstruction.sortIndexRelatedChanges(mUIReconstructions, aCondenserInfos);
				Measurement.end("Condenser_sort");

				UIReconstruction.swapChanges(aReducedIndexRelatedChanges, aReducedChanges);
				aReducedChanges = handleChangeUpdate(aCondenserInfos, aReducedChanges);

				Measurement.end("Condenser_handleIndexRelatedChanges");
			}

			Measurement.end("Condenser_overall");
			return aReducedChanges;
		});
	};

	return Condenser;
});