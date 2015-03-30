/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Overlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/ControlObserver',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/dt/Utils'
],
function(jQuery, Control, ControlObserver, Utils) {
	"use strict";


	/**
	 * Constructor for a new Overlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Overlay allows to create an absolute positioned DIV above the associated
	 * control / element.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.Overlay
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Overlay = Control.extend("sap.ui.dt.Overlay", /** @lends sap.ui.dt.Overlay.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				selected : {
					type : "boolean",
					defaultValue : false
				},
				selectable : {
					type : "boolean",
					defaultValue : true
				}
			},
			associations : {
				element : {
					type : "sap.ui.core.Element"
				}
			},
			aggregations : {
				children : {
					type : "sap.ui.dt.Overlay",
					multiple : true
				},
				designTimeMetadata : {
					type : "sap.ui.dt.DesignTimeMetadata",
					multiple : false
				}
			},
			events : {
				selectionChange : {
					parameters : {
						selected : {
							type : "boolean"
						}
					}
				}
			}
		}
	});

	Overlay._mOverlays = {};


	Overlay.byId = function(vElementOrId) {
		// TODO rename to getByControlId
		var sId = (vElementOrId instanceof sap.ui.core.Element) ? vElementOrId.getId() : vElementOrId;
		return Overlay._mOverlays[sId];
	};

	Overlay.prototype.init = function() {
		this._oDefaultDesignTimeMetadata = null;
		this._addToStaticUIArea();	
	};

	Overlay.prototype.exit = function() {
		this._removeFromStaticUIArea();

		this._destroyDefaultDesignTimeMetadata();

		var oElement = this.getElementInstance();
		if (oElement) {
			delete Overlay._mOverlays[oElement.getId()];
			if (oElement instanceof sap.ui.core.Control) {
				this._unobserveControl(oElement);
			}
		}
		
	};

	Overlay.prototype.setElement = function(vElement) {

		var oOldElement = this.getElementInstance();
		if (oOldElement instanceof sap.ui.core.Control) {
			delete Overlay._mOverlays[oOldElement.getId()];
			this._unobserveControl(oOldElement);
		}

		this._destroyDefaultDesignTimeMetadata();
		
		this.setAssociation("element", vElement);

		var oElement = this.getElementInstance();
		if (oElement instanceof sap.ui.core.Control) {
			Overlay._mOverlays[oElement.getId()] = this;
			this._observeControl(oElement);

			if (oElement.getDomRef()) {
				this.rerender();
			}

		} /*else { // Element

		}*/

		return this;
	};

	Overlay.prototype.onclick = function(oEvent) {
		oEvent.stopPropagation();
		oEvent.preventDefault();
		this.setSelected(!this.getSelected());
	};

	Overlay.prototype.setSelected = function(bSelected) {
		if (this.isSelectable() && bSelected !== this.isSelected()) {
			this.setProperty("selected", bSelected);
			this.toggleStyleClass("sapUiDtOverlaySelected", bSelected);
			this.fireSelectionChange({
				selected : bSelected
			});	
		}

		return this;
	};

	Overlay.prototype.isSelected = function() {
		return this.getSelected();
	};


	Overlay.prototype.isSelectable = function() {
		return this.getSelectable();
	};

	Overlay.prototype.getDesignTimeMetadata = function() {
		var oDesignTimeMetdata = this.getAggregation("designTimeMetadata");
		if (!oDesignTimeMetdata && !this._oDefaultDesignTimeMetadata) {
			this._oDefaultDesignTimeMetadata = new sap.ui.dt.DesignTimeMetadata({
				data : this._getElementDesignTimeMetadata()
			});
		}
		return oDesignTimeMetdata || this._oDefaultDesignTimeMetadata;
	};


	Overlay.prototype._destroyDefaultDesignTimeMetadata = function() {
		if (this._oDefaultDesignTimeMetadata) {
			this._oDefaultDesignTimeMetadata.destroy();
			this._oDefaultDesignTimeMetadata = null;
		}
	};

	/**
	 * @return {map} returns the design time metadata of the associated element
	 * @private
	 */
	Overlay.prototype._getElementDesignTimeMetadata = function() {
		var oElement = this.getElementInstance();
		return oElement ? oElement.getMetadata().getDesignTime() : {};
	};

	/**
	 * @param {sap.ui.core.Control} oControl The control to observe
	 * @private
	 */
	Overlay.prototype._observeControl = function(oControl) {
		this._oControlObserver = new ControlObserver({
			target : oControl
		});
		this._oControlObserver.attachChanged(this._onElementChanged, this);
		this._oControlObserver.attachDestroyed(this._onElementDestroyed, this);
	};

	/**
	 * @param {sap.ui.core.Control} oControl The control to unobserve
	 * @private
	 */
	Overlay.prototype._unobserveControl = function(oControl) {
		this._oControlObserver.destroy();
	};

	/**
	 * @private
	 */
	Overlay.prototype._addToStaticUIArea = function() {
		var oStaticArea = this._getStaticUIArea();
		oStaticArea.addContent(this);
	};

	/**
	 * @private
	 */
	Overlay.prototype._removeFromStaticUIArea = function() {
		var oStaticArea = this._getStaticUIArea();
		oStaticArea.removeContent(this);
	};

	/**
	 * @private
	 */
	Overlay.prototype._getStaticUIArea = function() {
		var oStaticAreaRef = sap.ui.getCore().getStaticAreaRef();
		return sap.ui.getCore().getUIArea(oStaticAreaRef);
	};

	/**
	 * @private
	 */
	Overlay.prototype._onElementChanged = function() {
		this.invalidate();
	};

	/**
	 * @private
	 */
	Overlay.prototype._onElementDestroyed = function() {
		this.destroy();
	};

	/**
	 * @public
	 */
	Overlay.prototype.getElementInstance = function() {
		return sap.ui.getCore().byId(this.getElement());
	};

	return Overlay;
}, /* bExport= */ true);