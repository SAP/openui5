/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ElementDesignTimeMetadata.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/dt/AggregationDesignTimeMetadata'
],
function(jQuery, DesignTimeMetadata, AggregationDesignTimeMetadata) {
	"use strict";


	/**
	 * Constructor for a new ElementDesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementDesignTimeMetadata is a wrapper for the ElementDesignTimeMetadata of the associated element
	 * @extends sap.ui.core.DesignTimeMetadata
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
	ElementDesignTimeMetadata.prototype.getDefaultData = function(oData) {
		var oDefaultData = DesignTimeMetadata.prototype.getDefaultData.apply(this, arguments);

		oDefaultData.aggregations  = {
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
	 * Returns the plain DT metadata for an aggregation name
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
	 * @param {string} sAggregationName an aggregation name
	 * @return {sap.ui.dt.AggregationDesignTimeMetadata} returns the aggregation DT metadata for an aggregation with a given name
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.createAggregationDesignTimeMetadata  = function(sAggregationName) {
		var oData =  this.getAggregation(sAggregationName);
		return new AggregationDesignTimeMetadata({
			libraryName : this.getLibraryName(),
			data : oData
		});
	};

	/**
	 * Returns the DT metadata for all aggregations
	 * @return {map} returns the DT metadata for all aggregations
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getAggregations = function() {
		return this.getData().aggregations;
	};

	/**
	 * Returns the relevant container of an element
	 * This is usually the getParent or the value from a function in DTMetadata
	 * @param {object} oElement the element for which the relevant container has to be evaluated
	 * @return {object} returns the relevant container
	 * @public
	 */
	//TODO: Remove this method as soon as DTMetadata propagation is finalized
	ElementDesignTimeMetadata.prototype.getRelevantContainer = function(oElement) {
		var fnGetRelevantContainer = this.getData().getRelevantContainer;
		if (!fnGetRelevantContainer || typeof fnGetRelevantContainer !== "function") {
			return oElement.getParent();
		}
		return fnGetRelevantContainer(oElement);
	};

	ElementDesignTimeMetadata.prototype.getAggregationAction = function(sAction, oElement, aArgs) {
		var vAction;
		var oAggregations = this.getAggregations();
		var aActions = [];

		for (var sAggregation in oAggregations) {
			if (oAggregations[sAggregation].actions && oAggregations[sAggregation].actions[sAction]) {
				vAction = oAggregations[sAggregation].actions[sAction];
				if (typeof vAction === "function") {
					var aActionParameters = [oElement];
					if (aArgs){
						aActionParameters = aActionParameters.concat(aArgs);
					}
					vAction = vAction.apply(null, aActionParameters);
				} else if (typeof (vAction) === "string" ) {
					vAction = { changeType : vAction };
				}
				if (vAction) {
					vAction.aggregation = sAggregation;
				}
				aActions.push(vAction);
			}
		}
		return aActions;
	};

	ElementDesignTimeMetadata.prototype._getText = function(vName){
		if (typeof vName === "function") {
			return vName();
		} else {
			return this.getLibraryText(vName);
		}
	};

	ElementDesignTimeMetadata.prototype.getAggregationDescription = function(sAggregationName, oElement){
		var vChildNames = this.getAggregation(sAggregationName).childNames;
		if (typeof vChildNames === "function") {
			vChildNames = vChildNames.call(null, oElement);
		}
		if (vChildNames){
			return {
				singular : this._getText(vChildNames.singular),
				plural : this._getText(vChildNames.plural)
			};
		}
	};

	ElementDesignTimeMetadata.prototype.getName = function(oElement){
		var vName = this.getData().name;
		if (typeof vName === "function") {
			vName = vName.call(null, oElement);
		}
		if (vName){
			return {
				singular : this._getText(vName.singular),
				plural : this._getText(vName.plural)
			};
		}
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
		} else {
			return true;
		}
	};


	return ElementDesignTimeMetadata;
}, /* bExport= */ true);
