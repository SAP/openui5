/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentMetadata
sap.ui.define(['./ComponentMetadata', './library'],
	function(ComponentMetadata, library) {
	"use strict";

	// shortcut for enum(s)
	var ViewType = library.mvc.ViewType;


	/**
	 * Creates a new metadata object for a UIComponent subclass.
	 *
	 * @param {string} sClassName Fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo Static info to construct the metadata from
	 *
	 * @experimental Since 1.15.1. The Component concept is still under construction, so some implementation details can be changed in future.
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.15.1
	 * @alias sap.ui.core.UIComponentMetadata
	 * @extends sap.ui.core.ComponentMetadata
	 * @private
	 */
	var UIComponentMetadata = function(sClassName, oClassInfo) {

		// call super constructor
		ComponentMetadata.apply(this, arguments);

	};

	//chain the prototypes
	UIComponentMetadata.prototype = Object.create(ComponentMetadata.prototype);

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

	/**
	 * Returns the root view of the component.
	 *
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @param {boolean} [bDoNotMerge] Returns the local root view configuration if set to <code>true</code>.
	 * @return {object} root view as configuration object or null ({@link sap.ui.view})
	 * @protected
	 * @since 1.15.1
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/rootView")
	 */
	UIComponentMetadata.prototype.getRootView = function(bDoNotMerge) {
		return this.getManifestEntry("/sap.ui5/rootView", !bDoNotMerge);
	};

	/**
	 * Returns the routing configuration.
	 *
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {object} routing configuration
	 * @private
	 * @since 1.16.1
	 * @experimental Since 1.16.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/routing/config")
	 */
	UIComponentMetadata.prototype.getRoutingConfig = function(bDoNotMerge) {
		return this.getManifestEntry("/sap.ui5/routing/config", !bDoNotMerge);
	};

	/**
	 * Returns the array of routes. If not defined the array is undefined.
	 *
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {array} routes
	 * @private
	 * @since 1.16.1
	 * @experimental Since 1.16.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/routing/routes")
	 */
	UIComponentMetadata.prototype.getRoutes = function(bDoNotMerge) {
		return this.getManifestEntry("/sap.ui5/routing/routes", !bDoNotMerge);
	};


	/**
	 * Converts the legacy metadata into the new manifest format
	 * @private
	 */
	UIComponentMetadata.prototype._convertLegacyMetadata = function(oStaticInfo, oManifest) {
		ComponentMetadata.prototype._convertLegacyMetadata.call(this, oStaticInfo, oManifest);

		// add the old information on component metadata to the manifest info
		// if no manifest entry exists otherwise the metadata entry will be
		// ignored by the converter
		var oUI5Manifest = oManifest["sap.ui5"];
		var oRootView = oUI5Manifest["rootView"] || oStaticInfo["rootView"];
		if (oRootView) {
			oUI5Manifest["rootView"] = oRootView;
		}
		var oRouting = oUI5Manifest["routing"] || oStaticInfo["routing"];
		if (oRouting) {
			oUI5Manifest["routing"] = oRouting;
		}

		// if the root view is a string we convert it into a view
		// configuration object and assume that it is an XML view
		// !This should be kept in sync with the UIComponent#createContent functionality!
		if (oUI5Manifest["rootView"] && typeof oUI5Manifest["rootView"] === "string") {
			oUI5Manifest["rootView"] = {
				viewName: oUI5Manifest["rootView"],
				type: ViewType.XML
			};
		}

	};

	return UIComponentMetadata;

}, /* bExport= */ true);
