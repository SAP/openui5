/*!
 * ${copyright}
 */

/*global Promise */

// Provides class sap.ui.core.ElementMetadata
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObjectMetadata'],
	function(jQuery, ManagedObjectMetadata) {
	"use strict";


	/**
	 * Creates a new metadata object for a UIElement subclass.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo static info to construct the metadata from
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 0.8.6
	 * @alias sap.ui.core.ElementMetadata
	 */
	var ElementMetadata = function(sClassName, oClassInfo) {
	
		// call super constructor
		ManagedObjectMetadata.apply(this, arguments);
	};
	
	//chain the prototypes
	ElementMetadata.prototype = jQuery.sap.newObject(ManagedObjectMetadata.prototype);
	
	/**
	 * Calculates a new id based on a prefix.
	 *
	 * @return {string} A (hopefully unique) control id
	 * @public
	 * @function
	 */
	ElementMetadata.uid = ManagedObjectMetadata.uid;
	
	/**
	 * By default, the element name is equal to the class name
	 * @return {string} the qualified name of the UIElement class
	 * @public
	 */
	ElementMetadata.prototype.getElementName = function() {
		return this._sClassName;
	};
	
	/**
	 * Determines the class name of the renderer for the described control class.
	 */
	ElementMetadata.prototype.getRendererName = function() {
		return this._sRendererName;
	};
	
	/**
	 * Retrieves the renderer for the described control class
	 */
	ElementMetadata.prototype.getRenderer = function() {
	
		// determine name via function for those legacy controls that override getRendererName()
		var sRendererName = this.getRendererName();
	
		if ( !sRendererName ) {
			return;
		}
	
		// check if renderer class exists already
		var fnRendererClass = jQuery.sap.getObject(sRendererName);
		if (fnRendererClass) {
			return fnRendererClass;
		}
	
		// if not, try to load a module with the same name
		jQuery.sap.require(sRendererName);
		return jQuery.sap.getObject(sRendererName);
	};
	
	ElementMetadata.prototype.applySettings = function(oClassInfo) {
	
		var oStaticInfo = oClassInfo.metadata;
	
		this._sVisibility = oStaticInfo["visibility"] || "public";
	
		// remove renderer stuff before calling super.
		var vRenderer = oClassInfo.hasOwnProperty("renderer") ? (oClassInfo.renderer || "") : undefined;
		delete oClassInfo.renderer;
	
		ManagedObjectMetadata.prototype.applySettings.call(this, oClassInfo);
	
		this._sRendererName = this.getName() + "Renderer";
	
		if ( typeof vRenderer !== "undefined" ) {
	
			if ( typeof vRenderer === "string" ) {
				this._sRendererName = vRenderer || undefined;
				return;
			}
			if ( typeof vRenderer === "function" ) {
				vRenderer = { render : vRenderer };
			}
	
			var oParent = this.getParent();
			var oBaseRenderer;
			if ( oParent && oParent instanceof ElementMetadata ) {
				oBaseRenderer = oParent.getRenderer();
			}
			if ( !oBaseRenderer ) {
				jQuery.sap.require("sap.ui.core.Renderer");
				oBaseRenderer = sap.ui.core.Renderer;
			}
			var oRenderer = jQuery.sap.newObject(oBaseRenderer);
			jQuery.extend(oRenderer, vRenderer);
			jQuery.sap.setObject(this.getRendererName(), oRenderer);
		}

		if (typeof oStaticInfo["designTime"] === "boolean") {
			this._bHasDesignTime = oStaticInfo["designTime"];
		} else if (oStaticInfo["designTime"]) {
			this._bHasDesignTime = true;
			this._oDesignTime = oStaticInfo["designTime"];
		}

	};
	
	ElementMetadata.prototype.afterApplySettings = function() {
		ManagedObjectMetadata.prototype.afterApplySettings.apply(this, arguments);
		this.register && this.register(this);
	};
	
	ElementMetadata.prototype.isHidden = function() {
		return this._sVisibility === "hidden";
	};
	
	ElementMetadata.prototype.loadDesignTime = function() {
		
		var that = this;
		return new Promise(function(fnResolve, fnReject) {
			
			if (!that._oDesignTime && that._bHasDesignTime) {
				var sModule = jQuery.sap.getResourceName(that.getElementName(), ".designtime");
				sap.ui.require([sModule], function(oDesignTime) {
					that._oDesignTime = oDesignTime;
					fnResolve(oDesignTime);
				});
			} else {
				fnResolve(that._oDesignTime);
			}
			
		});
		
	};

	return ElementMetadata;

}, /* bExport= */ true);
