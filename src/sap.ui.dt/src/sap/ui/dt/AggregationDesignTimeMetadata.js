/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationDesignTimeMetadata.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/DesignTimeMetadata'
],
function (jQuery, DesignTimeMetadata) {
	"use strict";


	/**
	 * Constructor for a new AggregationDesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The AggregationDesignTimeMetadata is a wrapper for the AggregationDesignTimeMetadata of the associated element
	 * @extends sap.ui.dt.DesignTimeMetadata
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.AggregationDesignTimeMetadata
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AggregationDesignTimeMetadata = DesignTimeMetadata.extend("sap.ui.dt.AggregationDesignTimeMetadata", /** @lends sap.ui.dt.AggregationDesignTimeMetadata.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt"
		}
	});

	AggregationDesignTimeMetadata.prototype.getPropagation = function(oElement, callback) {
		var mData = this.getData();
		if (!mData.propagationInfos) {
			return false;
		}
		mData.propagationInfos.some(function(oPropagatedInfo){
			return callback(oPropagatedInfo);
		});
	};

	AggregationDesignTimeMetadata.prototype.getRelevantContainerForPropagation = function(oElement) {
		var mData = this.getData();
		var vRelevantContainerElement = false;
		if (!mData.propagationInfos) {
			return false;
		}

		this.getPropagation(oElement, function(oPropagatedInfo){
			if (oPropagatedInfo.relevantContainerFunction &&
				oPropagatedInfo.relevantContainerFunction(oElement)) {
				vRelevantContainerElement = oPropagatedInfo.relevantContainerElement;
				return true;
			}
		});

		return vRelevantContainerElement ? vRelevantContainerElement : false;
	};

	AggregationDesignTimeMetadata.prototype.getMetadataForPropagation = function(oElement) {
		var vReturnMetadata = false;

		this.getPropagation(oElement, function(oPropagatedInfo) {
			if (oPropagatedInfo.metadataFunction) {
				vReturnMetadata = oPropagatedInfo.metadataFunction(oElement, oPropagatedInfo.relevantContainerElement);
				return vReturnMetadata ? true : false;
			}
		});
		return vReturnMetadata ? vReturnMetadata : false;
	};

	return AggregationDesignTimeMetadata;
}, /* bExport= */ true);
