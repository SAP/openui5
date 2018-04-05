/*!
 * ${copyright}
 */

/*global Promise */

// Provides class sap.ui.core.ElementMetadata
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObjectMetadata', 'sap/ui/core/Renderer'],
	function(jQuery, ManagedObjectMetadata, Renderer) {
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

		this._sVisibility = oStaticInfo.visibility || "public";
		this.dnd = jQuery.extend({}, {draggable: true, droppable: true}, oStaticInfo.dnd);

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
			if ( oParent instanceof ElementMetadata ) {
				oBaseRenderer = oParent.getRenderer();
			}
			if (!oBaseRenderer) {
				oBaseRenderer = Renderer;
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


	// ---- Aggregation -----------------------------------------------------------------------

	var fnMetaFactoryAggregation = ElementMetadata.prototype.metaFactoryAggregation;

	function Aggregation(oClass, name, info) {
		fnMetaFactoryAggregation.apply(this, arguments);
		this.dnd = jQuery.extend({
			draggable: !this.multiple,
			droppable: !this.multiple,
			layout: "Vertical"
		}, (typeof info.dnd == "boolean") ? {
			draggable: info.dnd,
			droppable: info.dnd
		} : info.dnd);
	}

	Aggregation.prototype = Object.create(fnMetaFactoryAggregation.prototype);
	ElementMetadata.prototype.metaFactoryAggregation = Aggregation;

	/**
	 * Returns an info object describing the drag-and-drop behavior.
	 *
	 * @param {string} [sAggregationName] name of the aggregation or empty.
	 * @returns {Object} An info object about the drag-and-drop behavior.
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

}, /* bExport= */ true);
