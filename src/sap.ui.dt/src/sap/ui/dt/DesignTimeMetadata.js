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
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTimeMetadata
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DesignTimeMetadata = ManagedObject.extend("sap.ui.dt.DesignTimeMetadata", /** @lends sap.ui.dt.DesignTimeMetadata.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				/**
				 * Data to be used as DT metadata
				 */
				data : {
					type : "object"
				}
			}
		}
	});

	/**
	 * Sets the data as DT metadata, uses default settings, if some fields are not defined in oData
	 * @param {object} oData to set
	 * @return {sap.ui.dt.DesignTimeMetadata} returns this
	 * @protected
	 */
	DesignTimeMetadata.prototype.setData = function(oData) {

		var oMergedData = jQuery.extend(true, this.getDefaultData(), oData || {});

		this.setProperty("data", oMergedData);
		return this;
	};

	/**
	 * Returns data, if no data is set, creates a default data
	 * @return {object} returns data
	 * @public
	 */
	DesignTimeMetadata.prototype.getData = function() {
		var oData = this.getProperty("data");
		if (!oData) {
			this.setData({});
			oData = this.getProperty("data");
		}

		return oData;
	};

	/**
	 * Returns the default DT metadata
	 * @return {Object} default data
	 * @protected
	 */
	DesignTimeMetadata.prototype.getDefaultData = function() {
		return {
			ignore : false,
			domRef : undefined,
			cloneDomRef : false
		};
	};

	/**
	 * Returns property "ignore" of the DT metadata
	 * @return {boolean} if ignored
	 * @public
	 */
	DesignTimeMetadata.prototype.isIgnored = function() {
		return this.getData().ignore;
	};

	/**
	 * Returns property "copyDom" of the DT metadata
	 * @return {boolean} if overlay should copy the DOM of its associated element
	 * @public
	 */
	DesignTimeMetadata.prototype.getCloneDomRef = function() {
		return this.getData().cloneDomRef;
	};

	/**
	 * Returns property "domRef" of the DT metadata
	 * @return {string|Element} assosicated domRef
	 * @public
	 */
	DesignTimeMetadata.prototype.getDomRef = function() {
		return this.getData().domRef;
	};

	return DesignTimeMetadata;
}, /* bExport= */ true);