/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	ManagedObjectObserver,
	JsControlTreeModifier,
	FlUtils
) {
	"use strict";

	/**
	 * Object to register extension points to track their locations.
	 * @constructor
	 * @alias sap.ui.fl.write._internal.extensionPoint.Registry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var ExtensionPointRegistry = {};

	var mObservers = {};
	var mExtensionPointsByParent = {};
	var mExtensionPointsByViewId = {};

	function onParentDestroy(oEvent) {
		var sParentId = oEvent.object.getId();
		mExtensionPointsByParent[sParentId].forEach(function (oExtensionPoint) {
			mExtensionPointsByViewId[oExtensionPoint.view.getId()][oExtensionPoint.name].bParentIsDestroyed = true;
		});
	}

	function onAggregationChange(oEvent) {
		var sParentId = oEvent.object.getId();
		mExtensionPointsByParent[sParentId].forEach(function(oExtensionPoint) {
			var sAggregationName = oExtensionPoint.aggregationName;
			if (sAggregationName === oEvent.name) {
				var vControlIds = FlUtils.getAggregation(oEvent.object, sAggregationName);
				var aControlIds = [].concat(vControlIds || []).map(function(oControl) {
					return oControl.getId();
				});
				if (oEvent.mutation === "insert") {
					if (aControlIds.indexOf(oEvent.child.getId()) < oExtensionPoint.index) {
						oExtensionPoint.index++;
					}
				} else if (oExtensionPoint.aggregation.indexOf(oEvent.child.getId()) < oExtensionPoint.index) {
					oExtensionPoint.index--;
				}
				oExtensionPoint.aggregation = aControlIds;
			}
		});
	}

	function observeIndex(oEvent) {
		if (oEvent.type === "destroy") {
			onParentDestroy(oEvent);
		} else {
			onAggregationChange(oEvent);
		}
	}

	function startObserver(oParent, sAggregationName) {
		var sParentId = oParent.getId();
		if (!mObservers[sParentId]) {
			var oObserver = new ManagedObjectObserver(observeIndex.bind(this));
			oObserver.observe(oParent, {
				aggregations: [sAggregationName],
				destroy: true
			});
			mObservers[sParentId] = {
				observer: oObserver,
				aggregations: [sAggregationName]
			};
		} else {
			var bIsObserved = mObservers[sParentId].observer.isObserved(oParent, {aggregations: [sAggregationName]});
			if (!bIsObserved) {
				mObservers[sParentId].aggregations.push(sAggregationName);
				mObservers[sParentId].observer.observe(oParent, {
					aggregations: mObservers[sParentId].aggregations,
					destroy: true
				});
			}
		}
	}

	function addExtensionPoint(oParent, sAggregationName, mExtensionPointInfo) {
		var sViewId = mExtensionPointInfo.view.getId();
		var vAggregation = FlUtils.getAggregation(oParent, sAggregationName);
		var aControlIds = [].concat(vAggregation || []).map(function(oControl) {
			return oControl.getId();
		});

		var sParentId = oParent.getId();
		if (!mExtensionPointsByParent[sParentId]) {
			mExtensionPointsByParent[sParentId] = [];
		}
		if (!mExtensionPointsByViewId[sViewId]) {
			mExtensionPointsByViewId[sViewId] = {};
		}
		mExtensionPointInfo.aggregation = aControlIds;
		mExtensionPointsByParent[sParentId].push(mExtensionPointInfo);
		mExtensionPointsByViewId[sViewId][mExtensionPointInfo.name] = mExtensionPointInfo;
	}

	/**
	 * Registration of extension points for observing the aggregation to track the index.
	 *
	 * @param {Object} mExtensionPointInfo - Map of extension point information
	 * @param {Object} mExtensionPointInfo.view - View object
	 * @param {string} mExtensionPointInfo.name - Name of the extension point
	 * @param {Object} mExtensionPointInfo.targetControl - Parent control of the extension point
	 * @param {string} mExtensionPointInfo.aggregationName - Name of the aggregation where the extension point is located
	 * @param {number} mExtensionPointInfo.index - Index of the extension point
	 * @param {Array} mExtensionPointInfo.defaultContent - Array of control IDs, which belong to the default aggregation
	 */
	ExtensionPointRegistry.registerExtensionPoint = function(mExtensionPointInfo) {
		var oParent = mExtensionPointInfo.targetControl;
		var sAggregationName = mExtensionPointInfo.aggregationName;
		startObserver(oParent, sAggregationName);
		addExtensionPoint(oParent, sAggregationName, mExtensionPointInfo);
	};

	/**
	 * Returns the extension point information.
	 *
	 * @param {string} sExtensionPointName - Name of the extension point
	 * @param {Object} oView - View object
	 * @returns {Object} mExtensionPointInfo - Map of extension point information
	 */
	ExtensionPointRegistry.getExtensionPointInfo = function (sExtensionPointName, oView) {
		return mExtensionPointsByViewId[oView.getId()]
			&& mExtensionPointsByViewId[oView.getId()][sExtensionPointName];
	};

	/**
	 * Returns the extension point information by view ID.
	 * @param {string} oViewId - ID of the view
	 * @returns {object} Map of extension points
	 */
	ExtensionPointRegistry.getExtensionPointInfoByViewId = function (oViewId) {
		return mExtensionPointsByViewId[oViewId] || {};
	};

	/**
	 * Returns the extension point information by parent ID.
	 *
	 * @param {string} sParentId - ID of the extension point parent control
	 * @returns {Array} Array of extension point information
	 */
	ExtensionPointRegistry.getExtensionPointInfoByParentId = function (sParentId) {
		return mExtensionPointsByParent[sParentId] || [];
	};

	/**
	 * Destroys the registered observers and clears the registry.
	 */
	ExtensionPointRegistry.clear = function() {
		Object.keys(mObservers).forEach(function(sParentId) {
			mObservers[sParentId].observer.disconnect();
			mObservers[sParentId].observer.destroy();
		});
		mObservers = {};
		mExtensionPointsByParent = {};
		mExtensionPointsByViewId = {};
	};

	return ExtensionPointRegistry;
});