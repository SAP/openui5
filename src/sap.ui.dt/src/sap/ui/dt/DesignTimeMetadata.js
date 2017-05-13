/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTimeMetadata.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/DOMUtil'
],
function(jQuery, ManagedObject, ElementUtil, DOMUtil) {
	"use strict";


	/**
	 * Constructor for a new DesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTimeMetadata is a wrapper for the DesignTimeMetadata of the associated element
	 * @extends sap.ui.base.ManagedObject
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
					type : "any"
				},
				/**
				* Name of the library the control belongs to
				*/
				libraryName : "string"
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
	 * @param {Object} oElement Element instance
	 * @return {boolean} if ignored
	 * @public
	 */
	DesignTimeMetadata.prototype.isIgnored = function(oElement) {
		var vIgnore = this.getData().ignore;
		if (!vIgnore || (vIgnore && typeof vIgnore === "function" && !vIgnore(oElement))) {
			return false;
		} else {
			return true;
		}
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
	 * @return {string|Element} Returns reference to the relevant DOM element or its selector
	 * @public
	 */
	DesignTimeMetadata.prototype.getDomRef = function() {
		return this.getData().domRef;
	};


	/**
	 * Returns a DOM representation for an Element or aggregation, if it can be found or undefined
	 * @param {Object} oElement Element we need DomRef for
	 * @param {String|Function} vDomRef Selector or Function for fetchting DomRef
	 * @param {String} sAggregationName Aggregation Name
	 * @return {jQuery} Returns associated DOM references wrapped by jQuery object
	 * @public
	 */
	DesignTimeMetadata.prototype.getAssociatedDomRef = function(oElement, vDomRef, sAggregationName) {
		var oElementDomRef = ElementUtil.getDomRef(oElement);
		var aArguments = [];
		aArguments.push(oElement);
		if (sAggregationName) {
			aArguments.push(sAggregationName);
		}

		if (typeof (vDomRef) === "function") {
			var vRes = vDomRef.apply(null, aArguments);

			return vRes ? jQuery(vRes) : vRes;
		} else if (oElementDomRef && typeof (vDomRef) === "string") {
			return DOMUtil.getDomRefForCSSSelector(oElementDomRef, vDomRef);
		}
	};

	/**
	 * Returns action sAction part of designTime metadata (object or changeType string)
	 * @param  {string} sAction action name
	 * @param  {object} oElement element instance
	 * @return {map} part of designTimeMetada, which describes sAction in a map format
	 * @public
	 */
	DesignTimeMetadata.prototype.getAction = function(sAction, oElement) {
		var mData = this.getData();
		if (mData.actions && mData.actions[sAction]) {
			var vAction = mData.actions[sAction];
			if (typeof (vAction) === "function" ) {
				vAction = vAction.call(null, oElement);
			}

			if (typeof (vAction) === "string" ) {
				return { changeType : vAction };
			} else {
				return vAction;
			}
		}
	};

	/**
	 * Returns a locale-specific string value for the given key sKey.
	 *
	 * The text is searched in this resource bundle according to the fallback chain described in
	 * {@link jQuery.sap.util.ResourceBundle}. If no text could be found, the key itself is used as text.
	 *
	 * If text parameters are given, then any occurrences of the pattern "{<i>n</i>}" with <i>n</i> being an integer
	 * are replaced by the parameter value with index <i>n</i>.  Note: This replacement is also applied if no text had been found (key).
	 * For more details on this replacement mechanism refer also:
	 * @see jQuery.sap.formatMessage
	 *
	 * @param {string} sKey Key
	 * @param {string[]} [aArgs] List of parameters which should replace the place holders "{n}" (n is the index) in the found locale-specific string value.
	 * @return {string} The value belonging to the key, if found; otherwise the key itself.
	 *
	 * @function
	 * @public
	 */
	DesignTimeMetadata.prototype.getLibraryText = function(sKey, aArgs) {
		var oLibResourceBundle = sap.ui.getCore().getLibraryResourceBundle(this.getLibraryName());
		return oLibResourceBundle.getText(sKey, aArgs);
	};

	/**
	 * Returns all available triggers from designtime metadata
	 * @return {Array.<Object>} array of available triggers
	 * @public
	 */
	DesignTimeMetadata.prototype.getTriggers = function() {
		var mData = this.getData();
		var aTriggers = [];

		if (mData && Array.isArray(mData.triggers)) {
			aTriggers = mData.triggers;
		}

		return aTriggers;
	};

	return DesignTimeMetadata;
}, /* bExport= */ true);
