/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ElementDesignTimeMetadata.
sap.ui.define([
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/AggregationDesignTimeMetadata",
	"sap/ui/dt/ElementUtil"
],
function(
	DesignTimeMetadata,
	AggregationDesignTimeMetadata,
	ElementUtil
) {
	"use strict";

	/**
	 * Constructor for a new ElementDesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementDesignTimeMetadata is a wrapper for the ElementDesignTimeMetadata of the associated element
	 * @extends sap.ui.dt.DesignTimeMetadata
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ElementDesignTimeMetadata
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementDesignTimeMetadata = DesignTimeMetadata.extend("sap.ui.dt.ElementDesignTimeMetadata", /** @lends sap.ui.dt.ElementDesignTimeMetadata.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt"
		}
	});

	/**
	 * Returns the default DT metadata
	 * @return {Object} default data
	 * @override
	 */
	ElementDesignTimeMetadata.prototype.getDefaultData = function() {
		var oDefaultData = DesignTimeMetadata.prototype.getDefaultData.apply(this, arguments);

		oDefaultData.aggregations = {
			layout : {
				ignore : true
			},
			dependents : {
				ignore : true
			},
			customData : {
				ignore : true
			},
			layoutData : {
				ignore : true
			},
			tooltip: {
				ignore : true
			},
			dragDropConfig: {
				ignore: true
			}
		};

		return oDefaultData;
	};

	/**
	 * Returns if the DT metadata for an aggregation name exists
	 * @param {string} sAggregationName an aggregation name
	 * @return {boolean} returns if the field for an aggregation with a given name exists in DT metadata
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.hasAggregation = function(sAggregationName) {
		return !!this.getAggregations()[sAggregationName];
	};

	/**
	 * Returns the plain DT metadata for an aggregation name,
	 * including also aggregation-like associations
	 * @param {string} sAggregationName an aggregation name
	 * @return {object} returns the DT metadata for an aggregation with a given name
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getAggregation = function(sAggregationName) {
		return this.getAggregations()[sAggregationName];
	};

	/**
	 * Creates an aggregation DT metadata class for an aggregation,
	 * ensure to destroy it if it is no longer needed, otherwise you get memory leak.
	 * @param {object} mMetadata DesignTime data
	 * @return {sap.ui.dt.AggregationDesignTimeMetadata} returns the aggregation DT metadata for an aggregation with a given name
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.createAggregationDesignTimeMetadata = function(mMetadata) {
		return new AggregationDesignTimeMetadata({
			data: mMetadata
		});
	};

	/**
	 * Returns the DT metadata for all aggregations,
	 * including also aggregation-like associations
	 * @return {map} returns the DT metadata for all aggregations
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getAggregations = function() {
		var mAggregations = this.getData().aggregations || {};
		var mAssociations = this.getData().associations || {};
		Object.keys(mAssociations).forEach(function(sAssociation) {
			var mAssociation = mAssociations[sAssociation];
			if (mAssociation.aggregationLike) {
				mAggregations[sAssociation] = mAssociation;
			}
		});
		return mAggregations;
	};

	/**
	 * Returns all available aggregation names containing the given action.
	 * @param {string} sAction - action to search for the aggregations
	 * @return {array.<string>} Returns the names of aggregations which contains the given action.
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getAggregationNamesWithAction = function(sAction) {
		var mAggregations = this.getAggregations();
		return Object.keys(mAggregations).filter(function (sAggregation) {
			return mAggregations[sAggregation].actions && mAggregations[sAggregation].actions[sAction];
		});
	};

	ElementDesignTimeMetadata.prototype.getActionDataFromAggregations = function(sAction, oElement, aArgs, sSubAction) {
		var vAction;
		var mAggregations = this.getAggregations();
		var aActions = [];

		for (var sAggregation in mAggregations) {
			if (mAggregations[sAggregation].actions && mAggregations[sAggregation].actions[sAction]) {
				vAction = mAggregations[sAggregation].actions[sAction];
				if (sSubAction) {
					vAction = vAction[sSubAction];
				}
				if (typeof vAction === "function") {
					var aActionParameters = [oElement];
					if (aArgs) {
						aActionParameters = aActionParameters.concat(aArgs);
					}
					vAction = vAction.apply(null, aActionParameters);
				}
				if (typeof (vAction) === "string") {
					vAction = { changeType : vAction };
				}
				if (vAction) {
					vAction.aggregation = sAggregation;
					aActions.push(vAction);
				}
			}
		}
		return aActions;
	};

	ElementDesignTimeMetadata.prototype._getText = function(oElement, vName) {
		if (typeof vName === "function") {
			return vName();
		}
		return this.getLibraryText(oElement, vName);
	};

	ElementDesignTimeMetadata.prototype.getAggregationDescription = function(sAggregationName, oElement) {
		var vChildNames = this.getAggregation(sAggregationName).childNames;
		if (typeof vChildNames === "function") {
			vChildNames = vChildNames(oElement);
		}
		if (vChildNames) {
			return {
				singular : this._getText(oElement, vChildNames.singular),
				plural : this._getText(oElement, vChildNames.plural)
			};
		}
	};

	ElementDesignTimeMetadata.prototype.getName = function(oElement) {
		var vName = this.getData().name;
		if (typeof vName === "function") {
			vName = vName(oElement);
		}
		if (vName) {
			return {
				singular : this._getText(oElement, vName.singular),
				plural : this._getText(oElement, vName.plural)
			};
		}
	};

	ElementDesignTimeMetadata.prototype.getToolHooks = function() {
		return this.getData().tool || {
			start: function() {},
			stop: function() {}
		};
	};

	/**
	 * Returns property "ignore" of aggregation DT metadata
	 * @param {Object} oElement Element whose aggregation has to be checked
	 * @param {String} sAggregationName Name of the Aggregation
	 * @return {boolean} if ignored
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.isAggregationIgnored = function(oElement, sAggregationName) {
		var mAggregations = this.getAggregations();
		var oAggregationMetadata = mAggregations[sAggregationName];
		var vIgnore = (oAggregationMetadata) ? oAggregationMetadata.ignore : false;
		if (!vIgnore || (vIgnore && typeof vIgnore === "function" && !vIgnore(oElement))) {
			return false;
		}
		return true;
	};

	/**
	 * Returns the scroll containers or an empty array
	 *
	 * @return {array} scrollContainers or empty array
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getScrollContainers = function(oElement) {
		var aScrollContainers = this.getData().scrollContainers || [];

		aScrollContainers.forEach(function(oScrollContainer) {
			if (typeof oScrollContainer.aggregations === "function") {
				oScrollContainer.aggregations = oScrollContainer.aggregations.call(null, oElement);
			}
		});

		return aScrollContainers;
	};

	/**
	 * Returns "label" from element designtime metadata or present in a metadata property
	 * @param {sap.ui.core.Element} oElement element for which label has to retrieved
	 *
	 * @return {string|undefined} Returns the label as string or undefined
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getLabel = function(oElement) {
		return DesignTimeMetadata.prototype.getLabel.apply(this, arguments) || ElementUtil.getLabelForElement(oElement);
	};

	/**
	 * This function checks the designtime metadata for a getStableElements function
	 * returns the result of the DTMD function if it is an array or an empty array if it is anything else
	 * if no function is available in DTMD it will return an array with the element of the overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {sap.ui.base.ManagedObject[]|object[]} Returns an array of elements or selectors.
	 */
	ElementDesignTimeMetadata.prototype.getStableElements = function(oOverlay) {
		var oElement = oOverlay.getElement();
		var aStableElements;
		var fnGetStableElements = this.getData().getStableElements;
		if (fnGetStableElements) {
			aStableElements = fnGetStableElements(oElement);
		} else {
			aStableElements = [oElement];
		}

		// if the result is undefined or not an array we return an empty array
		if (!aStableElements || !Array.isArray(aStableElements)) {
			aStableElements = [];
		}
		return aStableElements;
	};

	return ElementDesignTimeMetadata;
});