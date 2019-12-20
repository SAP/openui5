/*!
 * ${copyright}
 */

/* global Map */
sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/changes/Utils"
], function (
	JsControlTreeModifier,
	FlUtils,
	Utils
) {
	"use strict";

	/**
	 * Condenser that reduces a number of changes to a bare minimum.
	 *
	 * @namespace
	 * @alias sap.ui.fl.Condenser
	 * @author SAP SE
	 * @version ${version}
	 */
	var Condenser = {};

	var UNCLASSIFIED = "unclassified";

	/**
	 * Classification of the changes
	 *
	 * @type {{lastOneWins: _addNonIndexRelatedChange, reverse: _addReverseChange}}
	 */
	var CLASSIFIED = {
		lastOneWins: _addNonIndexRelatedChange,
		reverse: _addReverseChange
	};

	/**
	 * Adds a non-index-related change to the data structure.
	 *
	 * @param {Map} mDataStructure - Data structure object that holds key-value pairs. A key is a unique identifier. A value is an array object that contains reduced changes
	 * @param {string} sKey - Unique identifier of the change, for instance the change type of the change
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 * @private
	 */
	function _addNonIndexRelatedChange(mDataStructure, sKey, oChange) {
		if (!mDataStructure.has(sKey)) {
			mDataStructure.set(sKey, []);
		}
		var aChanges = mDataStructure.get(sKey);
		aChanges.pop();
		aChanges.push(oChange);
	}

	/**
	 * Adds a reverse change to the data structure.
	 *
	 * @param {Map} mProperties - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains reverse changes
	 * @param {string} sUniqueKey - Unique key of the condenser specific information
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 * @private
	 */
	function _addReverseChange(mProperties, sUniqueKey, oChange) {
		if (!mProperties.has(sUniqueKey)) {
			mProperties.set(sUniqueKey, new Map());
		}
		var mUniqueKeys = mProperties.get(sUniqueKey);
		var aUniqueKeys = Array.from(mUniqueKeys.keys());
		if (
			aUniqueKeys.length !== 0
			&& aUniqueKeys.indexOf(oChange.getChangeType()) === -1
		) {
			mUniqueKeys.delete(aUniqueKeys[0]);
		} else {
			_addNonIndexRelatedChange(mUniqueKeys, oChange.getChangeType(), oChange);
		}
	}

	/**
	 * Adds a classified change to the data structure.
	 *
	 * @param {Map} mClassificationTypes - Map of classification types that holds key-value pairs. A key is a unique identifier. A value is an array object that contains classified reduced changes
	 * @param {Object} oCondenserInfo - Condenser-specific information
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @private
	 */
	function _addClassifiedChange(mClassificationTypes, oCondenserInfo, oChange) {
		if (!mClassificationTypes.has(oCondenserInfo.classificationType)) {
			mClassificationTypes.set(oCondenserInfo.classificationType, new Map());
		}
		var mProperties = mClassificationTypes.get(oCondenserInfo.classificationType);
		CLASSIFIED[oCondenserInfo.classificationType](mProperties, oCondenserInfo.uniqueKey, oChange);
	}

	/**
	 * Adds an unclassified change to the data structure.
	 *
	 * @param {Map} mChangeTypes - Map of change types that holds key-value pairs. A key is a unique identifier. A value is an array object that contains all unclassified changes
	 * @param {string} sKey - Key of the "unclassified" map that reflects the fact that the delivered change is not classified
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @private
	 */
	function _addUnclassifiedChange(mChangeTypes, sKey, oChange) {
		if (!mChangeTypes.has(sKey)) {
			mChangeTypes.set(sKey, []);
		}
		var aChanges = mChangeTypes.get(sKey);
		aChanges.push(oChange);
	}

	/**
	 * Retrieves the change handler for a certain change type and control.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @returns {Promise.<object>|sap.ui.fl.Utils.FakePromise.<object>} - Change handler object wrapped in a promise or FakePromise
	 * @private
	 */
	function _getChangeHandler(oAppComponent, oChange) {
		var sControlId = JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		var oControl = sap.ui.getCore().byId(sControlId);
		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: FlUtils.getViewForControl(oControl)
		};
		var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
		return Utils.getChangeHandler(oChange, mControl, mPropertyBag);
	}

	/**
	 * Adds a change to the data structure.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {Map} mClassificationTypes - Map of classification types
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @private
	 */
	function _addChange(oAppComponent, mClassificationTypes, oChange) {
		return _getChangeHandler(oAppComponent, oChange).then(function (oHandler) {
			var oCondenserInfo = oHandler !== undefined && typeof oHandler.getCondenserInfo === "function" ? oHandler.getCondenserInfo(oChange) : undefined;
			if (oCondenserInfo !== undefined) {
				_addClassifiedChange(mClassificationTypes, oCondenserInfo, oChange);
			} else {
				_addUnclassifiedChange(mClassificationTypes, UNCLASSIFIED, oChange);
			}
		});
	}

	/**
	 * Defines the data structure that contains reduced changes.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @private
	 */
	function _defineReducedChangesMap(oAppComponent, mReducedChanges, oChange) {
		/**
		mReducedChanges: {
			"<selectorId>": {
				"<classificationType>":
					"<uniqueKey>": [<sap.ui.fl.Change>]
				...
				"lastOneWins" :
					"label": [oChange1],
				"reverse": {
					"visible":
						"hideControl": [oChange2],
						"unhideControl" : [oChange3]
					"stashed":
						"stashControl": [oChange4],
						"unstashControl" : [oChange5]
				},
				"unclassified" : [oChange6, oChange7, oChange8]
				}
		}
		 */
		var sChangedControlKey = oChange.getSelector().id;

		if (!mReducedChanges.has(sChangedControlKey)) {
			mReducedChanges.set(sChangedControlKey, new Map());
		}
		var mClassificationTypes = mReducedChanges.get(sChangedControlKey);
		return _addChange(oAppComponent, mClassificationTypes, oChange).then(function () {
			var aKeys = Array.from(mClassificationTypes.keys());
			if (aKeys.length === 0) {
				mReducedChanges.delete(sChangedControlKey);
			}
		});
	}

	/**
	 * Retrieves an array of changes from the delivered data structure.
	 *
	 * @param {Map} mObjects - Delivered data structure
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @private
	 */
	function _getChanges(mObjects, aChanges) {
		var aKeys = Array.from(mObjects.keys());
		aKeys.forEach(function (sKey) {
			var mSubObjects = mObjects.get(sKey);
			if (mSubObjects instanceof Map) {
				_getChanges(mSubObjects, aChanges);
			} else {
				mSubObjects.forEach(function (oChange) {
					aChanges.push(oChange);
				});
			}
		});
	}

	/**
	 * Retrieves an array of changes from the reduced changes map.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @private
	 */
	function _getAllReducedChanges(mReducedChanges) {
		var aReducedChanges = [];
		_getChanges(mReducedChanges, aReducedChanges);
		return aReducedChanges;
	}

	/**
	 * Sorts an array of reduced changes in the initial order.
	 *
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @param {sap.ui.fl.Change[]} aReducedChanges - Array of reduced changes
	 * @private
	 */
	function _sortByInitialOrder(aChanges, aReducedChanges) {
		aReducedChanges.sort(function (a, b) {
			return aChanges.indexOf(a) - aChanges.indexOf(b);
		});
	}

	/**
	 * The condensing algorithm gets an array of changes that should be reduced to the bare minimum.
	 * The steps of the algorithm are:
	 * (1) By iterating through the array of changes, the condenser defines the data structure
	 * where the reduced changes will be stored according to the classification per control,
	 * (2) The reduced changes will be sorted by the order in which the condenser got the changes initially.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @returns {Promise} Promise resolved with the reduced array of changes
	 * @public
	 */
	Condenser.condense = function (oAppComponent, aChanges) {
		var mReducedChanges = new Map();
		return aChanges.reduce(function (oPromise, oChange) {
			return oPromise.then(_defineReducedChangesMap.bind(this, oAppComponent, mReducedChanges, oChange));
		}.bind(this), Promise.resolve()).then(function () {
			var aReducedChanges = _getAllReducedChanges(mReducedChanges);
			_sortByInitialOrder(aChanges, aReducedChanges);
			return aReducedChanges;
		});
	};

	return Condenser;
});
