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
	
		var oStaticInfo = oClassInfo.metadata;
	
		// if the root view is a string we convert it into a view 
		// configuration object and assume that it is a XML view
		this._mRootView = oStaticInfo.rootView;
		if (typeof this._mRootView === "string") {
			this._mRootView = {
					viewName: this._mRootView,
					type: sap.ui.core.mvc.ViewType.XML
			};
		}
		this._mRouting = oStaticInfo.routing;
	
		// some metadata needs to be merged with the metadata for the parent component
		var oParent = this.getParent();
		if (oParent instanceof UIComponentMetadata) {
			if (oParent._mRootView) {
				this._mRootView = jQuery.extend(true, {}, oParent._mRootView, this._mRootView);
			}
			this._mRouting = jQuery.extend(true, {}, oParent._mRouting, this._mRouting);
		}
		
	};
	
	
	/**
	 * Returns the root view of the component.
	 * @return {string|object} root view as string or as configuration object ({@link sap.ui.view})
	 * @protected
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change. 
	 */
	UIComponentMetadata.prototype.getRootView = function() {
		return this._mRootView;
	};
	
	/**
	 * Returns the routing configuration. 
	 * @return {object} routing configuration
	 * @private
	 * @since 1.16.1 
	 * @experimental Since 1.16.1. Implementation might change. 
	 */
	UIComponentMetadata.prototype.getRoutingConfig = function() {
		return this._mRouting && this._mRouting.config;
	};
	
	/**
	 * Returns the array of routes. If not defined the array is undefined. 
	 * @return {array} routes
	 * @private
	 * @since 1.16.1 
	 * @experimental Since 1.16.1. Implementation might change. 
	 */
	UIComponentMetadata.prototype.getRoutes = function() {
		return this._mRouting && this._mRouting.routes;
	};
	

	return UIComponentMetadata;

}, /* bExport= */ true);
