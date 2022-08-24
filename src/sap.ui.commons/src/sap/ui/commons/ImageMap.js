/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ImageMap.
sap.ui.define([
    'sap/ui/thirdparty/jquery',
    './library',
    'sap/ui/core/Control',
    'sap/ui/core/delegate/ItemNavigation',
    './ImageMapRenderer',
    './Area'
],
	function(jQuery, library, Control, ItemNavigation, ImageMapRenderer, Area) {
	"use strict";



	/**
	 * Constructor for a new ImageMap.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Combination of image areas where at runtime these areas are starting points for hyperlinks or actions
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38. There's not replacement because of the archaic design pattern.
	 * @alias sap.ui.commons.ImageMap
	 */
	var ImageMap = Control.extend("sap.ui.commons.ImageMap", /** @lends sap.ui.commons.ImageMap.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * Name for the image that serves as reference
			 */
			name : {type : "string", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * Area representing the reference to the target location
			 */
			areas : {type : "sap.ui.commons.Area", multiple : true, singularName : "area"}
		},
		events : {

			/**
			 * Event for the areas that can be clicked in an ImageMap
			 */
			press : {
				parameters : {

					/**
					 * Id of clicked Area.
					 */
					areaId : {type : "string"}
				}
			}
		}
	}});


	/**
	 * Adds areas to the Image Map.
	 *
	 * Each argument must be either a JSon object or a list of objects or the area element or elements.
	 *
	 * @param {any} content Area content to add
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	ImageMap.prototype.createArea = function() {
		var oArea = new Area();

		for ( var i = 0; i < arguments.length; i++) {
			var oContent = arguments[i];
			var oArea;
			if (oContent instanceof Area) {
				oArea = oContent;
			} else {
				oArea = new Area(oContent);
			}
			this.addArea(oArea);
		}
		return this;
	};

	/**
	 * Used for after-rendering initialization.
	 *
	 * @private
	 */
	ImageMap.prototype.onAfterRendering = function() {

		this.oDomRef = this.getDomRef();

		// Initialize the ItemNavigation if does not exist yet
		if (!this.oItemNavigation) {
			this.oItemNavigation = new ItemNavigation();
		}

		this.addDelegate(this.oItemNavigation);
		this.oItemNavigation.setRootDomRef(this.oDomRef);

		// Set navigations items = Areas inside of Image map
		var aItemDomRefs = [];
		var aAllAreas = this.getAreas();
		for ( var i = 0; i < aAllAreas.length; i++) {
			var oDomRef = aAllAreas[i].getFocusDomRef();
			if (oDomRef) { // separators return null here
				aItemDomRefs.push(oDomRef);
			}
		}

		this.oItemNavigation.setItemDomRefs(aItemDomRefs);
		this.oItemNavigation.setCycling(true);
		this.oItemNavigation.setSelectedIndex( -1);
		this.oItemNavigation.setFocusedIndex( -1);

	};

	/**
	 * Does all the cleanup when the Image Map is to be destroyed. Called from the
	 * element's destroy() method.
	 *
	 * @private
	 */
	ImageMap.prototype.exit = function() {
		// Remove the item navigation delegate
		if (this.oItemNavigation) {
			this.removeDelegate(this.oItemNavigation);
			this.oItemNavigation.destroy();
			delete this.oItemNavigation;
		}

		// No super.exit() to call
	};

	return ImageMap;

});
