/*!
 * ${copyright}
 */

// Provides control sap.m.Tile.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/Control',
	'sap/ui/Device',
	'./TileRenderer'
],
	function(jQuery, library, InvisibleText, Control, Device, TileRenderer) {
	"use strict";



	/**
	 * Constructor for a new Tile.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A tile to be displayed in the tile container. Use this
	 * tile as the base class for specialized tile implementations.
	 * Use the renderer _addOuterClass methods to add a style class to the main
	 * surface of the Tile. In this class set the background color, gradients
	 * or background images.
	 * Instead of implementing the default render method in the renderer, implement
	 * your content HTML in the _renderContent method of the specialized tile.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @deprecated as of version 1.50, replaced by {@link sap.m.GenericTile}
	 * @alias sap.m.Tile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Tile = Control.extend("sap.m.Tile", /** @lends sap.m.Tile.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Determines whether the tile is movable within the surrounding tile container. The remove event is fired by the tile container.
			 */
			removable : {type : "boolean", group : "Misc", defaultValue : true}
		},
		events : {

			/**
			 * Tap event is raised if the user taps or clicks the control.
			 */
			press : {}
		}
	}});

	/**
	 * Initializes the control.
	 * @private
	 */
	Tile.prototype.init = function() {
		//keyboard support for desktop environments
		if (Device.system.desktop) {
			var fnOnSpaceOrEnter = jQuery.proxy(function(oEvent) {
				if (oEvent.srcControl === this && !oEvent.isMarked()) {
					this.ontap();
					//event should not trigger any further actions
					oEvent.stopPropagation();
				}
			}, this);

			this.onsapspace = fnOnSpaceOrEnter;
			this.onsapenter = fnOnSpaceOrEnter;
		}
	};

	/**
	 * Handles the internal event onAfterRendering.
	 * @private
	 */
	Tile.prototype.onAfterRendering = function(){
		if (this._rendered && !this._bIsDragged && this.getParent() instanceof sap.m.TileContainer) {
			this.setPos(this._posX,this._posY);
		}
		this._rendered = true;
	};


	/**
	 * Sets the position of the tile to the given coordinates.
	 * @param {int} iX Left position
	 * @param {int} iY Top position
	 * @private
	 */
	Tile.prototype.setPos = function(iX,iY){
		// store in member
		this._posX = iX = Math.floor(iX);
		this._posY = iY = Math.floor(iY);
		if (!this._rendered) {
			return;
		}
		var o = this.getDomRef();
		if ("webkitTransform" in o.style) {
			this.$().css('-webkit-transform','translate3d(' + iX + 'px,' + iY + 'px,0)');
		} else if ("transform" in o.style) {
			this.$().css('transform','translate3d(' + iX + 'px,' + iY + 'px,0)');
		} else if ("msTransform" in o.style) {
			this.$().css('msTransform','translate(' + iX + 'px,' + iY + 'px)');
		} else if ("MozTransform" in o.style) {
			this.$().css('-moz-transform','translate3d(' + iX + 'px,' + iY + 'px,0)');
		}
		if (this._invisible) {
			this.$().css("visibility","");
			delete this._invisible;
		}

	};

	/**
	 * Sets the px size of the Tile.
	 * @param {int} iWidth left position
	 * @param {int} iHeight top position
	 * @private
	 */
	Tile.prototype.setSize = function(iWidth,iHeight){
		//jQuery.sap.log.debug("Set tile size, id:" + this.getId() + ", x:" + iWidth + ", y:" + iHeight);
		this._width = iWidth;
		this._height = iHeight;
	};


	/**
	 * Returns and optionally sets whether the Tile is editable.
	 * @param {boolean} bIsEditable The editable state of the tile
	 * @returns {boolean} Whether the tile is editable
	 * @see sap.m.TileContainer
	 * @private
	 */
	Tile.prototype.isEditable = function(bIsEditable) {
		var bOldValue = this._bIsEditable;
		if (bIsEditable === true || bIsEditable === false) {
			this._bIsEditable = bIsEditable;
		}
		if (bOldValue != bIsEditable && this.$()) {
			//update the ARIA hint for DEL
			this.$().attr("aria-describedBy", bIsEditable ? InvisibleText.getStaticId("sap.m", "TILE_REMOVE_BY_DEL_KEY") : null);
		}

		return this._bIsEditable;
	};

	/**
	 * Returns and optionally sets whether the Tile is dragged and applies or removes the drag styles.
	 * @param {boolean} bIsDragged The editable state of the Tile
	 * @returns {boolean} whether the Tile is dragged
	 * @see sap.m.TileContainer
	 * @private
	 */
	Tile.prototype.isDragged = function(bIsDragged) {
		if (!this._bIsEditable) {
			return;
		}
		if (bIsDragged === true || bIsDragged === false) {
			var o = this.$();
			 o.toggleClass("sapMTileDrag",bIsDragged);
			this._bIsDragged = bIsDragged;
		}
		return this._bIsDragged;
	};

	/**
	 * Sets active state.
	 * @param {Object} oEvent The fired event
	 * @private
	 */
	Tile.prototype.ontouchstart = function(oEvent) {
		if (!this.isEditable() && !this._parentPreventsTapEvent) {
			this.$().toggleClass("sapMTileActive sapMTileActive-CTX",true);
			this._clientX = oEvent.clientX;
			this._clientY = oEvent.clientY;
		}
	};

	/**
	 * Unsets active state.
	 * @private
	 */
	Tile.prototype.ontouchend = function() {
		if (!this.isEditable()) {
			this.$().toggleClass("sapMTileActive sapMTileActive-CTX",false);
		}
	};

	/**
	 * Checks if a parent Tile wants to prevent the Tap events for its children - read-only.
	 * @private
	 */
	Object.defineProperty(Tile.prototype,"_parentPreventsTapEvent",{
		get : function () {
			var oParent = this.getParent();
			while (oParent) {
				if (oParent._bAvoidChildTapEvent || (oParent instanceof Tile && oParent.isEditable())) {
					return true;
				}
				oParent = oParent.getParent();
			}

			return false;
		}
	});

	/**
	 * Unsets active state on touch move.
	 * @param {Object} oEvent The fired event
	 * @private
	 */
	Tile.prototype.ontouchmove = function(oEvent) {
		if (!this.isEditable() && !this._parentPreventsTapEvent) {
			if (Math.abs(oEvent.clientX - this._clientX) > 30 || Math.abs(oEvent.clientY - this._clientY) > 10) {
				this.$().toggleClass("sapMTileActive sapMTileActive-CTX",false);
			}
		}
	};

	Tile.prototype.ontap = function() {
		if (!this.isEditable() && !this._parentPreventsTapEvent) {
			this.firePress({});
		}
	};

	Tile.prototype.setVisible = function(bVisible){
		this.setProperty("visible", bVisible);
		if (!bVisible) {
			this._rendered = false;
		}
		if (this.getParent() && this.getParent() instanceof sap.m.TileContainer) {
			this.getParent().invalidate(); // Force rerendering of TileContainer, so the tiles can be rearanged
		}
		return this;
	};

	/**
	 * Sets initial visibility of the Tile.
	 * @param {boolean} bVisible visibility
	 * @returns {sap.m.Tile} <code>this</code> to allow method chaining
	 * @private
	 */
	Tile.prototype._setVisible = function(bVisible){
		this._invisible = !bVisible;
		return this;
	};

	return Tile;

});
