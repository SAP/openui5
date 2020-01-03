/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/DesignTimeMetadata"
],
function (
	DesignTimeMetadata
) {
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
		metadata: {
			library: "sap.ui.dt"
		}
	});

	/**
	 * Returns "label" from aggregation designtime metadata
	 * @param {sap.ui.core.Element} oElement element for which label should be retrieved
	 * @param {string} [sAggregationName] aggregation name responsible for the aggregation designtime metadata
	 *
	 * @return {string|undefined} Returns the label as string or undefined
	 * @public
	 */
	AggregationDesignTimeMetadata.prototype.getLabel = function(oElement, sAggregationName) {
		return DesignTimeMetadata.prototype.getLabel.apply(this, arguments) || sAggregationName;
	};

	return AggregationDesignTimeMetadata;
});
