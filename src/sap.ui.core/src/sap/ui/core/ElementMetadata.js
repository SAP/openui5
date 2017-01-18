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
	ElementMetadata.prototype = Object.create(ManagedObjectMetadata.prototype);

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

		if (typeof oStaticInfo["designTime"] === "boolean") {
			this._bHasDesignTime = oStaticInfo["designTime"];
		} else if (oStaticInfo["designTime"]) {
			this._bHasDesignTime = true;
			this._oDesignTime = oStaticInfo["designTime"];
		}

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
			if ( oParent instanceof ElementMetadata ) {
				oBaseRenderer = oParent.getRenderer();
			}
			if ( !oBaseRenderer ) {
				oBaseRenderer = sap.ui.requireSync('sap/ui/core/Renderer');
			}
			var oRenderer = Object.create(oBaseRenderer);
			jQuery.extend(oRenderer, vRenderer);
			jQuery.sap.setObject(this.getRendererName(), oRenderer);
		}
	};

	ElementMetadata.prototype.afterApplySettings = function() {
		ManagedObjectMetadata.prototype.afterApplySettings.apply(this, arguments);
		this.register && this.register(this);
	};

	ElementMetadata.prototype.isHidden = function() {
		return this._sVisibility === "hidden";
	};

	/**
	 * Returns a promise that resolves with the own, unmerged designtime data.
	 * If the class is marked as having no designtime data, the promise will resolve with null.
	 */
	function loadOwnDesignTime(oElementMetadata) {
		if (oElementMetadata._oDesignTime || !oElementMetadata._bHasDesignTime) {
			return Promise.resolve(oElementMetadata._oDesignTime || null);
		}
		return new Promise(function(fnResolve) {
			var sModule = jQuery.sap.getResourceName(oElementMetadata.getElementName(), ".designtime");
			sap.ui.require([sModule], function(oDesignTime) {
				oElementMetadata._oDesignTime = oDesignTime;
				fnResolve(oDesignTime);
			});
		});
	}

	/**
	 * Load and returns the design time metadata asynchronously. The design time metadata contains all relevant information to support the control
	 * in the UI5 design time.
	 *
	 * @return {Promise} A promise which will return the loaded design time metadata
	 * @since 1.28.0
	 */
	ElementMetadata.prototype.loadDesignTime = function() {
		if (!this._oDesignTimePromise) {

			// Note: parent takes care of merging its ancestors
			var oWhenParentLoaded;
			var oParent = this.getParent();
			if (oParent instanceof ElementMetadata) {
				oWhenParentLoaded = oParent.loadDesignTime();
			} else {
				oWhenParentLoaded = Promise.resolve(null);
			}

			// Note that the ancestor designtimes and the own designtime will be loaded 'in parallel',
			// only the merge is done in sequence by chaining promises
			this._oDesignTimePromise = loadOwnDesignTime(this).then(function(oOwnDesignTime) {
				return oWhenParentLoaded.then(function(oParentDesignTime) {
					// we use jQuery.sap.extend to be able to also overwrite properties with null or undefined
					return jQuery.sap.extend({}, oParentDesignTime, oOwnDesignTime);
				});
			});
		}

		return this._oDesignTimePromise;
	};

	return ElementMetadata;

}, /* bExport= */ true);
