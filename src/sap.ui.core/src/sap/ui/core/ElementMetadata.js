/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ElementMetadata
sap.ui.define([
	'sap/ui/base/ManagedObjectMetadata',
	'sap/ui/core/Lib',
	'sap/ui/core/Renderer'
], function(ManagedObjectMetadata, Library, Renderer) {
"use strict";

/**
 * Control Renderer
 *
 * @typedef {object} sap.ui.core.ControlRenderer
 * @public
 *
 * @property {function(sap.ui.core.RenderManager, sap.ui.core.Element):void} render
 *  The function that renders the control
 * @property {1|2|4} [apiVersion] The API version of the RenderManager that are used in this renderer. See {@link
 *  sap.ui.core.RenderManager RenderManager} API documentation for detailed information
 */

/**
 * Creates a new metadata object for a UIElement subclass.
 *
 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
 * @param {object} oClassInfo static info to construct the metadata from
 * @param {sap.ui.core.Element.MetadataOptions} [oClassInfo.metadata]
 *  The metadata object describing the class
 *
 * @class
 * @author SAP SE
 * @version ${version}
 * @since 0.8.6
 * @alias sap.ui.core.ElementMetadata
 * @extends sap.ui.base.ManagedObjectMetadata
 * @public
 */
var ElementMetadata = function(sClassName, oClassInfo) {

	// call super constructor
	ManagedObjectMetadata.apply(this, arguments);
};

//chain the prototypes
ElementMetadata.prototype = Object.create(ManagedObjectMetadata.prototype);
ElementMetadata.prototype.constructor = ElementMetadata;

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
 *
 * @returns {string} The renderer name
 */
ElementMetadata.prototype.getRendererName = function() {
	return this._sRendererName;
};

/**
 * Retrieves the renderer for the described control class
 *
 * If no renderer exists <code>undefined</code> is returned
 * @returns {sap.ui.core.ControlRenderer|undefined} The renderer
 */
ElementMetadata.prototype.getRenderer = function() {
	if ( this._oRenderer ) {
		return this._oRenderer;
	}

	// determine name via function for those legacy controls that override getRendererName()
	var sRendererName = this.getRendererName();

	if ( !sRendererName ) {
		return undefined;
	}

	// check if renderer class exists already, in case it was passed inplace,
	// and written to the global namespace during applySettings().
	this._oRenderer = sap.ui.require(sRendererName.replace(/\./g, "/"));

	return this._oRenderer;
};

ElementMetadata.prototype.applySettings = function(oClassInfo) {

	var oStaticInfo = oClassInfo.metadata;

	this._sVisibility = oStaticInfo.visibility || "public";

	// remove renderer stuff before calling super.
	var vRenderer = Object.hasOwn(oClassInfo, "renderer") ? (oClassInfo.renderer || "") : undefined;
	delete oClassInfo.renderer;

	ManagedObjectMetadata.prototype.applySettings.call(this, oClassInfo);

	var oParent = this.getParent();
	this._sRendererName = this.getName() + "Renderer";
	this.dnd = Object.assign({
		draggable: false,
		droppable: false
	}, oParent.dnd, (typeof oStaticInfo.dnd == "boolean") ? {
		draggable: oStaticInfo.dnd,
		droppable: oStaticInfo.dnd
	} : oStaticInfo.dnd);

	if ( typeof vRenderer !== "undefined" ) {

		if ( typeof vRenderer === "string" ) {
			this._sRendererName = vRenderer || undefined;
			return;
		}

		// try to identify fully built renderers
		if ( (typeof vRenderer === "object" || typeof vRenderer === "function") && typeof vRenderer.render === "function" ) {
			var oRenderer = sap.ui.require(this.getRendererName().replace(/\./g, "/"));
			if ( oRenderer === vRenderer ) {
				// the given renderer has been exported globally already, it can be used without further action
				this._oRenderer = vRenderer;
				return;
			}
			if ( oRenderer === undefined && typeof vRenderer.extend === "function" ) {
				// the given renderer has an 'extend' method, so it most likely has been created by one of the
				// extend methods and it is usable already; it just has to be exported globally
				/* -------------------------------------- */
				this._oRenderer = vRenderer;
				return;
			}
		}

		if ( typeof vRenderer === "function" ) {
			vRenderer = { render : vRenderer };
		}

		var oBaseRenderer;
		if ( oParent instanceof ElementMetadata ) {
			oBaseRenderer = oParent.getRenderer();
		}
		this._oRenderer = Renderer.extend.call(oBaseRenderer || Renderer, this.getRendererName(), vRenderer);
	}
};

ElementMetadata.prototype.afterApplySettings = function() {
	ManagedObjectMetadata.prototype.afterApplySettings.apply(this, arguments);
	Library._registerElement(this);
};

ElementMetadata.prototype.isHidden = function() {
	return this._sVisibility === "hidden";
};


// ---- Aggregation -----------------------------------------------------------------------

var fnMetaFactoryAggregation = ElementMetadata.prototype.metaFactoryAggregation;

function Aggregation(oClass, name, info) {
	fnMetaFactoryAggregation.apply(this, arguments);
	this.dnd = Object.assign({
		draggable: false,
		droppable: false,
		layout: "Vertical"
	}, (typeof info.dnd == "boolean") ? {
		draggable: info.dnd,
		droppable: info.dnd
	} : info.dnd);
}

Aggregation.prototype = Object.create(fnMetaFactoryAggregation.prototype);
Aggregation.prototype.constructor = Aggregation;
ElementMetadata.prototype.metaFactoryAggregation = Aggregation;

/**
 * Returns an info object describing the drag-and-drop behavior.
 *
 * @param {string} [sAggregationName] name of the aggregation or empty.
 * @returns {sap.ui.core.Element.MetadataOptions.DnD} An info object about the drag-and-drop behavior.
 * @public
 * @since 1.56
 */
ElementMetadata.prototype.getDragDropInfo = function(sAggregationName) {
	if (!sAggregationName) {
		return this.dnd;
	}

	var oAggregation = this._mAllAggregations[sAggregationName] || this._mAllPrivateAggregations[sAggregationName];
	if (!oAggregation) {
		return {};
	}

	return oAggregation.dnd;
};

return ElementMetadata;

});