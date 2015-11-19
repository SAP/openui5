/*!
 * ${copyright}
 */

// Provides class sap.uxap.BlockBaseMetadata
sap.ui.define(["jquery.sap.global", "sap/ui/core/ElementMetadata"], function (jQuery, ElementMetadata) {
	"use strict";


	/**
	 * Creates a new metadata object for a BlockBase subclass.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oClassInfo static info to construct the metadata from
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.26
	 * @alias sap.uxap.BlockBaseMetadata
	 */
	var BlockBaseMetadata = function (sClassName, oClassInfo) {

		// call super constructor
		ElementMetadata.apply(this, arguments);
		this._mViews = oClassInfo.metadata.views || {};

	};

	//chain the prototypes
	BlockBaseMetadata.prototype = jQuery.sap.newObject(ElementMetadata.prototype);

	BlockBaseMetadata.prototype.applySettings = function (oClassInfo) {
		var vRenderer = oClassInfo.hasOwnProperty("renderer") ? (oClassInfo.renderer || "") : undefined;
		ElementMetadata.prototype.applySettings.call(this, oClassInfo);
		if (vRenderer == null) {
			// If a renderer has been defined on the block then use it, otherwise use the BlockBaseRenderer
			this._sRendererName = null;
		}
	};

	/**
	 * Determines the class name of the renderer for the described control class.
	 * @returns {string} renderer name
	 */
	BlockBaseMetadata.prototype.getRendererName = function () {

		//if we have not resolved the renderer yet
		if (!this._sBlockRenderer) {
			this._sBlockRenderer = this._resolveRendererName();
			jQuery.sap.log.debug("BlockBaseMetadata :: " + this.getName() + " is renderer with " + this._sBlockRenderer);
		}

		return this._sBlockRenderer;
	};

	BlockBaseMetadata.prototype._resolveRendererName = function () {
		var sCandidateRenderer = ElementMetadata.prototype.getRendererName.call(this);

		//we test if a specific render has been provided, in this case we keep it
		if (sCandidateRenderer == null) {
			var oParent = this.getParent();
			if (oParent) {
				sCandidateRenderer = BlockBaseMetadata.prototype._resolveRendererName.apply(oParent);
			} else {
				throw new Error("BlockBaseMetadata :: no renderer found for " + this.getName());
			}
		}
		return sCandidateRenderer;
	};


	/**
	 * return a view from its name
	 * @param {*} sViewName
	 * @returns {*} view
	 */
	BlockBaseMetadata.prototype.getView = function (sViewName) {
		return this._mViews[sViewName];
	};

	/**
	 * return the view definition object
	 * @returns {*} view
	 */
	BlockBaseMetadata.prototype.getViews = function () {
		return this._mViews;
	};

	/**
	 * setter for the view
	 * @param {*} sViewName the name of the view
	 * @param {*} oViewParameters view parameters
	 * @returns {*} this
	 */
	BlockBaseMetadata.prototype.setView = function (sViewName, oViewParameters) {
		this._mViews[sViewName] = oViewParameters;
		return this;
	};

	/**
	 * checks whether some view are defined
	 * @returns {*} has views
	 */
	BlockBaseMetadata.prototype.hasViews = function () {
		return !jQuery.isEmptyObject(this._mViews);
	};

	return BlockBaseMetadata;

}, /* bExport= */ true);
