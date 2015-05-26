/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTimeMetadata.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject'
],
function(jQuery, ManagedObject) {
	"use strict";


	/**
	 * Constructor for a new DesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTimeMetadata is a wrapper for the DesignTimeMetadata of the associated element
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.Overlay
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DesignTimeMetadata = ManagedObject.extend("sap.ui.dt.DesignTimeMetadata", /** @lends sap.ui.dt.DesignTimeMetadata.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				data : {
					type : "object"
				}
			}
		}
	});

	DesignTimeMetadata.prototype._ensureProperties = function(oData) {
		return jQuery.extend(true, {
			defaultSettings : {},
			aggregations : {
				layout : {
					visible : false
				}
			},
			properties : {},
			associations : {},
			events : {},
			behavior : {
				constructor : null,
				resize : {
					stop : null,
					grid : null,
					start : null,
					minWidth : null,
					minHeight : null,
					maxWidth : null,
					maxHeight : null
				}
			},
			renderer : null,
			css : null,
			name : null,
			description : "",
			keywords : [],
			draggable : true,
			selectable : true,
			removable : true,
			resizable : true,
			visible : true,
			needDelegateFromParent : false
		}, oData);
	};

	DesignTimeMetadata.prototype.setData = function(oData) {
		this.setProperty("data", this._ensureProperties(oData));
		return this;
	};

	DesignTimeMetadata.prototype.getName = function() {
		return this.getData().name;
	};

	DesignTimeMetadata.prototype.hasAggregation = function(sAggregation) {
		return !!this.getAggregations()[sAggregation];
	};

	DesignTimeMetadata.prototype.getAggregation = function(sAggregation) {
		return this.getAggregations()[sAggregation] || {};
	};

	DesignTimeMetadata.prototype.getAggregations = function() {
		return this.getData().aggregations;
	};

	DesignTimeMetadata.prototype.isVisible = function() {
		return this.getData().visible !== false;
	};

	DesignTimeMetadata.prototype.isAggregationVisible = function(sAggregationName) {
		return this.getAggregation(sAggregationName).visible !== false;
	};

	DesignTimeMetadata.prototype.getAggregationDomRef = function(sAggregationName) {
		return this.getAggregation(sAggregationName).domRef;
	};	

	return DesignTimeMetadata;
}, /* bExport= */ true);