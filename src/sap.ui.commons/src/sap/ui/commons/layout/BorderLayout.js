/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.layout.BorderLayout.
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/commons/library',
    'sap/ui/core/Control',
    "./BorderLayoutRenderer"
],
	function(jQuery, library, Control, BorderLayoutRenderer) {
	"use strict";



	/**
	 * Constructor for a new layout/BorderLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Based upon the border layout as it comes with the Java standard. Using this layout, you are able to divide your available UI space into five areas whose sizes can be defined. These areas are: Top: Header; Bottom: Footer; Begin: Left/right-hand side panel; Center: Content area
	 * in the middle; End: Right/left-hand side panel.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38, replaced by {@link sap.m.Page}
	 * @alias sap.ui.commons.layout.BorderLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BorderLayout = Control.extend("sap.ui.commons.layout.BorderLayout", /** @lends sap.ui.commons.layout.BorderLayout.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * The RTL setting swaps the areas Begin and End.
			 * @deprecated as of version 1.5.2, replaced by the global configuration for the page
			 */
			rtl : {type : "boolean", group : "Appearance", defaultValue : false, deprecated: true},

			/**
			 * Defines the overall width of the layout
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},

			/**
			 * Defines the overall height of the layout
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'}
		},
		aggregations : {

			/**
			 * Represents the Top area
			 */
			top : {type : "sap.ui.commons.layout.BorderLayoutArea", multiple : false},

			/**
			 * Represents the Begin area
			 */
			begin : {type : "sap.ui.commons.layout.BorderLayoutArea", multiple : false},

			/**
			 * Represents the Center area
			 */
			center : {type : "sap.ui.commons.layout.BorderLayoutArea", multiple : false},

			/**
			 * Represents the End area
			 */
			end : {type : "sap.ui.commons.layout.BorderLayoutArea", multiple : false},

			/**
			 * Represents the Bottom area
			 */
			bottom : {type : "sap.ui.commons.layout.BorderLayoutArea", multiple : false}
		}
	}});


	BorderLayout.prototype._getOrCreateArea = function(sAreaId, aContent) {

		var Types = sap.ui.commons.layout.BorderLayoutAreaTypes,
			that = this,
			oArea;

		function create(sMutator) {
			var oCreateArea;

			if ( aContent ) {
				oCreateArea = new sap.ui.commons.layout.BorderLayoutArea({
					id : that.getId() + "--" + sAreaId,
					areaId : sAreaId,
					content : aContent
				});
				that[sMutator](oCreateArea);
			}

			return oCreateArea;
		}

		// check for a valid area id
		if ( !Types.hasOwnProperty(sAreaId) ) {
			throw new Error("Invalid Area Id '" + sAreaId + "'");
		}

		// get or create
		switch (sAreaId) {
			case Types.top:
				oArea = this.getTop() || create("setTop");
				break;
			case Types.begin:
				oArea = this.getBegin() || create("setBegin");
				break;
			case Types.center:
				oArea = this.getCenter() || create("setCenter");
				break;
			case Types.end:
				oArea = this.getEnd() || create("setEnd");
				break;
			case Types.bottom:
				oArea = this.getBottom() || create("setBottom");
				break;
			default:
				jQuery.sap.assert(false, "default case must not be reached");
				break;
		}

		return oArea;
	};


	/**
	 * Returns the area of the given type. If the area does not exist, it will be created when create is set to true.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId The aria ID
	 * @param {boolean} bCreate Whether the aria must be created
	 * @returns {sap.ui.commons.layout.BorderLayoutArea} The aria
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.getArea = function(sAreaId, bCreate) {
		return this._getOrCreateArea(sAreaId, bCreate ? [] : null);
	};


	/**
	 * Creates the specified area and adds the given controls to it. Returns the created area.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies which area will be created. If the area is already available, the method call is ignored.
	 * @param {sap.ui.core.Control} oContent
	 *         Any number of controls can be submitted to be added to the newly created area; where each control is submitted as one argument.
	 * @returns {sap.ui.commons.layout.BorderLayoutArea} The created aria
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.createArea = function(sAreaId, oContent /* ... */) {
		return this._getOrCreateArea(sAreaId, Array.prototype.slice.call(arguments, 1));
	};


	/**
	 * Returns the object of the specified area. If the area does not exist, the area will be created and returned.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area whose object will be returned.
	 * @returns {sap.ui.commons.layout.BorderLayoutArea} The aria
	 * @type {sap.ui.commons.layout.BorderLayoutArea}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.getAreaById = function(sAreaId) {
		return this._getOrCreateArea(sAreaId, []);
	};


	/**
	 * Returns a JSON-like object that contains all property values of the requested area.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area whose data will be returned
	 * @returns {object} The aria data
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.getAreaData = function(sAreaId) {
		var oArea = this.getAreaById(sAreaId);
		return oArea ?
			{
				size         : oArea.getSize(),
				visible      : oArea.getVisible(),
				overflowX    : oArea.getOverflowX(),
				overflowY    : oArea.getOverflowY(),
				contentAlign : oArea.getContentAlign()
			} : {};
	};


	/**
	 * Sets the properties of the specified area with the given values.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area whose properties will be set
	 * @param {object} oData
	 *         JSON-like object that contains the values to be set
	 * @returns {sap.ui.commons.layout.BorderLayout} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.setAreaData = function(sAreaId, oData) {
		this.getArea(sAreaId, true).applySettings(oData);
		return this;
	};


	/**
	 * Adds controls to the specified area.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area where controls will be added
	 * @returns {sap.ui.commons.layout.BorderLayout} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.addContent = function(sAreaId) {
		var oArea = this.getArea(sAreaId, true),
			i;

		for (var i = 1; i < arguments.length; i++) {
			oArea.addContent(arguments[i]);
		}
		return this;
	};


	/**
	 * Inserts controls to an area at a given index.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area where the controls shall be inserted.
	 * @param {int} iIndex
	 *         Specifies the index where the controls shall be added. For a negative value of iIndex, the content is inserted at
	 *         position '0'; for a value greater than the current size of the aggregation, the content is inserted at the last position.
	 * @returns {sap.ui.commons.layout.BorderLayout} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.insertContent = function(sAreaId, iIndex) { //obsolete
		var oArea = this.getArea(sAreaId, true),
			i;

		for (i = 2; i < arguments.length; i++) {
			oArea.insertContent(arguments[i], iIndex++);
		}
		return this;
	};


	/**
	 * Removes the content with the given index from an area.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} oAreaId
	 *         Specifies the area whose content shall be removed
	 * @param {*} vElement The content to be removed
	 *         Specifies the control that shall be removed
	 * @returns {sap.ui.commons.layout.BorderLayout} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.removeContent = function(oAreaId, vElement) {
		var oArea = this.getAreaById(oAreaId);
		if ( oArea ) {
			oArea.removeContent(vElement);
		}
		return this;
	};


	/**
	 * Removes all content from an area.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area whose content shall be removed
	 * @returns {sap.ui.commons.layout.BorderLayout} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.removeAllContent = function(sAreaId) {
		var oArea = this.getAreaById(sAreaId);
		if ( oArea ) {
		  oArea.removeAllContent();
		}
		return this;
	};


	/**
	 * Returns all controls inside the specified area inside an array.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area whose content controls shall be returned.
	 * @returns {sap.ui.core.Control[]} The array with the content
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.getContent = function(sAreaId) {
		var oArea = this.getAreaById(sAreaId);
		return oArea ? oArea.getContent() : [];
	};


	/**
	 * Determines the index of a given content control.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId Specifies the area that will be searched
	 * @param {sap.ui.core.Control} oContent Specifies the control whose index will be searched
	 * @returns {int} The index of the content
	 *
	 * @public
	 */
	BorderLayout.prototype.indexOfContent = function(sAreaId, oContent) {
		var oArea = this.getAreaById(sAreaId);
		return oArea ? oArea.indexOfContent(oContent) : -1;
	};


	/**
	 * Destroys the content of the specified area.
	 *
	 * @param {sap.ui.commons.layout.BorderLayoutAreaTypes} sAreaId
	 *         Specifies the area whose content will be destroyed
	 * @returns {sap.ui.commons.layout.BorderLayout} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BorderLayout.prototype.destroyContent = function(sAreaId) {
		this.getAreaById(sAreaId, true).destroyContent();
		return this;
	};


	/*
	 TODOS

	 - rename BorderLayoutAreaTypes to BorderLayoutAreaPosition
	 - Borderlayout.createArea, getAreaById, setAreaData -> getArea(pos), setArea(pos, settings);
	 - BorderlayoutArea.areaId: deprecate, redundant
	 - BorderLayout.overflow: defaults?
	 - RTL support in general: really swap classes or trust in our mirroring?
	 */


	return BorderLayout;

}, /* bExport= */ true);
