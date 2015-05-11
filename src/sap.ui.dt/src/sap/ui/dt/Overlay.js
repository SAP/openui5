/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Overlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/ControlObserver',
	'sap/ui/dt/ManagedObjectObserver',
	'sap/ui/dt/DesignTimeMetadata',
	'sap/ui/dt/AggregationOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Utils',
	'sap/ui/dt/DOMUtil'
],
function(jQuery, Control, ControlObserver, ManagedObjectObserver, DesignTimeMetadata, AggregationOverlay, OverlayRegistry, Utils, DOMUtil) {
	"use strict";

	var sOverlayContainerId = "overlay-container";
	var oOverlayContainer;

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
	 * @private
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
				},
				draggable : {
					type : "boolean"
				},
				offset : {
					type : "object"
				}
			},
			associations : {
				element : {
					type : "sap.ui.core.Element"
				}
			},
			aggregations : {
				_aggregationOverlays : {
					type : "sap.ui.dt.AggregationOverlay",
					multiple : true,
					visibility : "hidden"
				},
				designTimeMetadata : {
					type : "sap.ui.dt.DesignTimeMetadata",
					multiple : false
				}
			},
			events : {
				destroyed : {
					parameters : {}
				},
				selectionChange : {
					parameters : {
						selected : {
							type : "boolean"
						}
					}
				},
				draggableChange : {
					parameters : {
						selected : {
							draggable : "boolean"
						}
					}
				},
				elementModified : {
					parameters : {
						type : "string",
						value : "any",
						oldValue : "any",
						target : "sap.ui.core.Element"
					}
				}
			}
		}
	});

	/** 
	 * @static
	*/
	Overlay.getOverlayContainer = function() {
		if (!oOverlayContainer) {
			oOverlayContainer = jQuery("#" + sOverlayContainerId);
			if (!oOverlayContainer.length) {
				oOverlayContainer = jQuery("<div id='" + sOverlayContainerId + "'></div>").appendTo("body");
			}
		}

		return oOverlayContainer.get(0);
	};

	/** 
	 * @static
	 */
	Overlay.removeOverlayContainer = function() {
		if (oOverlayContainer) {
			oOverlayContainer.remove();
		}

		oOverlayContainer = null;
	};

	/** 
	 * @private
	 */
	Overlay.prototype.init = function() {
		this._oDefaultDesignTimeMetadata = null;
		this._addToOverlayContainer();	
	};

	/** 
	 * @private
	 */
	Overlay.prototype.exit = function() {
		this._destroyDefaultDesignTimeMetadata();

		var oElement = this.getElementInstance();
		if (oElement) {
			OverlayRegistry.deregister(oElement);
			this._unobserve(oElement);
		} else {
			// element can be destroyed before
			OverlayRegistry.deregister(this._elementId);
		}

		if (!OverlayRegistry.hasOverlays()) {
			Overlay.removeOverlayContainer();
		}

		delete this._elementId;
		this.fireDestroyed();
	};

	/** 
	 * @public
	 * @param {String|sap.ui.core.Element} element or element's id
	 * @returns {sap.ui.dt.Overlay} returns itself
	 */
	Overlay.prototype.setElement = function(vElement) {
		var oOldElement = this.getElementInstance();
		if (oOldElement instanceof sap.ui.core.Element) {
			OverlayRegistry.deregister(oOldElement);
			this._unobserve(oOldElement);
		}

		this.destroyAggregation("_aggregationOverlays");
		this._destroyDefaultDesignTimeMetadata();
		delete this._elementId;
		
		this.setAssociation("element", vElement);
		this._createAggregationOverlays();

		var oElement = this.getElementInstance();

		this._elementId = oElement.getId();
		OverlayRegistry.register(oElement, this);
		this._observe(oElement);

		var oParent = oElement.getParent();
		var oParentOverlay = OverlayRegistry.getOverlay(oParent);
		if (oParentOverlay) {
			oParentOverlay.sync();
		}

		if (DOMUtil.getElementGeometry(oElement)) {
			this.rerender();
		}

		return this;
	};


	/** 
	 * @private
	 */
	Overlay.prototype._createAggregationOverlays = function() {
		var oElement = this.getElementInstance();

		if (oElement) {
			var that = this;
			Utils.iterateOverAllPublicAggregations(oElement, function(oAggregation, aAggregationElements) {
				var sAggregationName = oAggregation.name;
				
				var oAggregationOverlay = new AggregationOverlay({
					aggregationName : sAggregationName
				});

				that._syncAggregationOverlay(oAggregationOverlay);

				that.addAggregation("_aggregationOverlays", oAggregationOverlay);

			}, null, Utils.getAggregationFilter());
		}
	};

	/**
	 * @public
	 */
	Overlay.prototype.setSelectable = function(bSelectable) {
		if (!bSelectable) {
			this.setSelected(false);
		}

		this.setProperty("selectable", bSelectable);

		return this;
	};
	
	/**
	 * @param {boolean} bSelected
	 * @param {boolean} bSuppressEvent internal use only, supress firing selectionChange event
	 * @public
	 */
	Overlay.prototype.setSelected = function(bSelected, bSuppressEvent) {
		if (this.isSelectable() && bSelected !== this.isSelected()) {
			this.setProperty("selected", bSelected);
			this.toggleStyleClass("sapUiDtOverlaySelected", bSelected);

			if (!bSuppressEvent) {
				this.fireSelectionChange({
					selected : bSelected
				});	
			}
		}

		return this;
	};

	/**
	 * @public
	 */
	Overlay.prototype.getDesignTimeMetadata = function() {
		var oDesignTimeMetdata = this.getAggregation("designTimeMetadata");
		if (!oDesignTimeMetdata && !this._oDefaultDesignTimeMetadata) {
			this._oDefaultDesignTimeMetadata = new DesignTimeMetadata({
				data : this._getElementDesignTimeMetadata()
			});
		}
		return oDesignTimeMetdata || this._oDefaultDesignTimeMetadata;
	};


	/**
	 * @private
	 */
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
	 * @param {sap.ui.core.Element} oElement The element to observe
	 * @private
	 */
	Overlay.prototype._observe = function(oElement) {
		if (oElement instanceof sap.ui.core.Control) {
			this._oObserver = new ControlObserver({
				target : oElement
			});
			this._oObserver.attachAfterRendering(this._onElementRendered, this);
			this._oObserver.attachDestroyed(this._onElementDestroyed, this);
		} else {
			this._oObserver = new ManagedObjectObserver({
				target : oElement
			});
		}
		this._oObserver.attachModified(this._onElementModified, this);
	};

	/**
	 * @param {sap.ui.core.Element} oElement The element to unobserve
	 * @private
	 */
	Overlay.prototype._unobserve = function(oElement) {
		this._oObserver.destroy();
	};

	/**
	 * @private
	 */
	Overlay.prototype._addToOverlayContainer = function() {
		this.placeAt(Overlay.getOverlayContainer());
	};

	/**
	 * @private
	 */
	Overlay.prototype._syncAggregationOverlay = function(oAggregationOverlay) {
		var sAggregationName = oAggregationOverlay.getAggregationName();
		var aAggregationElements = Utils.getAggregationValue(sAggregationName, this.getElementInstance());

		aAggregationElements.forEach(function(oAggregationElement) {
			var oChildOverlay = OverlayRegistry.getOverlay(oAggregationElement);
			if (oChildOverlay) {
				oAggregationOverlay.addChild(oChildOverlay);
			}
		});
	};

	/**
	 * @public
	 */
	Overlay.prototype.sync = function() {
		var that = this;
		var aAggregationOverlays = this.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			that._syncAggregationOverlay(oAggregationOverlay);
		});
	};

	/**
	 * @private
	 */
	Overlay.prototype._onElementModified = function(oEvent) {
		this.sync();
		this.invalidate();
		this.fireElementModified(oEvent.getParameters());
	};

	/**
	 * @private
	 */
	Overlay.prototype._onElementRendered = function() {
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

	/**
	 * @public
	 */
	Overlay.prototype.getAggregationOverlays = function() {
		return this.getAggregation("_aggregationOverlays") || [];
	};

	/**
	 * @public
	 */
	Overlay.prototype.isSelected = function() {
		return this.getSelected();
	};

	/**
	 * @public
	 */
	Overlay.prototype.isSelectable = function() {
		return this.getSelectable();
	};

	/** 
	 * @public
	 */
	Overlay.prototype.setDraggable = function(bDraggable) {
		if (this.getDraggable() !== bDraggable) {
			this.fireDraggableChange({draggable : bDraggable});
			this.toggleStyleClass("sapUiDtOverlayDraggable", bDraggable);
			
			// TODO: canceleable
			this.setProperty("draggable", bDraggable);
		}
	};	

	/**
	 * @public
	 */
	Overlay.prototype.isDraggable = function() {
		return this.getDraggable();
	};

	/**
	 * @public
	 */
	Overlay.prototype.getPublicParentAggregationName = function() {
		var oParentAggregationOverlay = this.getParent();
		if (oParentAggregationOverlay) { 
			return oParentAggregationOverlay.getAggregationName();
		}
	};

	/**
	 * @public
	 */
	Overlay.prototype.getPublicParent = function() {
		var oParentAggregationOverlay = this.getParent();
		if (oParentAggregationOverlay) { 
			var oPublicParentOverlay = oParentAggregationOverlay.getParent();
			if (oPublicParentOverlay) {
				return oPublicParentOverlay.getElementInstance();
			}
		}
	};

	return Overlay;
}, /* bExport= */ true);