/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentMetadata
sap.ui.define(['jquery.sap.global', './ComponentMetadata'],
	function(jQuery, ComponentMetadata) {
	"use strict";


	/**
	 * Creates a new metadata object for a UIComponent subclass.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo static info to construct the metadata from
	 *
	 * @experimental Since 1.15.1. The Component concept is still under construction, so some implementation details can be changed in future.
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.15.1
	 * @alias sap.ui.core.UIComponentMetadata
	 */
	var UIComponentMetadata = function(sClassName, oClassInfo) {

		// call super constructor
		ComponentMetadata.apply(this, arguments);

	};

	//chain the prototypes
	UIComponentMetadata.prototype = jQuery.sap.newObject(ComponentMetadata.prototype);

	UIComponentMetadata.preprocessClassInfo = function(oClassInfo) {
		// if the component is a string we convert this into a "_src" metadata entry
		// the specific metadata object can decide to support this or gracefully ignore it
		// basically the ComponentMetadata makes use of this feature
		if (oClassInfo && typeof oClassInfo.metadata === "string") {
			oClassInfo.metadata = {
				_src: oClassInfo.metadata
			};
		}
		return oClassInfo;
	};

	UIComponentMetadata.prototype.applySettings = function(oClassInfo) {

		ComponentMetadata.prototype.applySettings.call(this, oClassInfo);

		// if the root view is a string we convert it into a view
		// configuration object and assume that it is a XML view
		var oUI5Manifest = this._oStaticInfo.manifest["sap.ui5"];
		if (oUI5Manifest && typeof oUI5Manifest.rootView === "string") {
			oUI5Manifest.rootView = {
					viewName: oUI5Manifest.rootView,
					type: sap.ui.core.mvc.ViewType.XML
			};
		}

	};


	/**
	 * Returns the root view of the component.
	 * @param {boolean} [bDoNotMerge] true, to return only the local root view config
	 * @return {object} root view as configuration object or null ({@link sap.ui.view})
	 * @protected
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	UIComponentMetadata.prototype.getRootView = function(bDoNotMerge) {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getRootView is deprecated!");
		var oParent,
		    oUI5Manifest = this.getManifestEntry("sap.ui5"),
		    mRootView = jQuery.extend(true, {}, oUI5Manifest && oUI5Manifest.rootView);
	
		if (!bDoNotMerge && (oParent = this.getParent()) instanceof UIComponentMetadata) {
			// merge the root view object if defined via parameter
			mRootView = jQuery.extend(true, {}, oParent.getRootView(bDoNotMerge), mRootView);
		}
		
		// in case of no root view is defined the object is empty
		return jQuery.isEmptyObject(mRootView) ? null : mRootView;
	};

	/**
	 * Returns the routing configuration.
	 * @return {object} routing configuration
	 * @private
	 * @since 1.16.1
	 * @experimental Since 1.16.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	UIComponentMetadata.prototype.getRoutingConfig = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getRoutingConfig is deprecated!");
		var oUI5Manifest = this.getManifestEntry("sap.ui5");
		return oUI5Manifest && oUI5Manifest.routing && oUI5Manifest.routing.config;
	};

	/**
	 * Returns the array of routes. If not defined the array is undefined.
	 * @return {array} routes
	 * @private
	 * @since 1.16.1
	 * @experimental Since 1.16.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	UIComponentMetadata.prototype.getRoutes = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getRoutes is deprecated!");
		var oUI5Manifest = this.getManifestEntry("sap.ui5");
		return oUI5Manifest && oUI5Manifest.routing && oUI5Manifest.routing.routes;
	};

	/**
	 * Converts the legacy metadata into the new manifest format
	 * 
	 * @private
	 */
	UIComponentMetadata.prototype._convertLegacyMetadata = function(oStaticInfo, oManifest) {
		ComponentMetadata.prototype._convertLegacyMetadata.call(this, oStaticInfo, oManifest);
		
		// add the old information on component metadata to the manifest info
		// if no manifest entry exists otherwise the metadata entry will be 
		// ignored by the converter
		var oUI5Manifest = oManifest["sap.ui5"];
		oUI5Manifest["rootView"] = oUI5Manifest["rootView"] || oStaticInfo["rootView"];
		oUI5Manifest["routing"] = oUI5Manifest["routing"] || oStaticInfo["routing"];
		
	};

	return UIComponentMetadata;

}, /* bExport= */ true);
