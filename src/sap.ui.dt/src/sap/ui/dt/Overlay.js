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
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/DOMUtil'
],
function(jQuery, Control, ControlObserver, ManagedObjectObserver, DesignTimeMetadata, AggregationOverlay, OverlayRegistry, ElementUtil, OverlayUtil, DOMUtil) {
	"use strict";

	var sOverlayContainerId = "overlay-container";
	var oOverlayContainer;

	/**
	 * Constructor for an Overlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Overlay allows to create an absolute positioned DIV above the associated element.
	 * It also creates AggregationOverlays for every public aggregation of the associated element.
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
				/** 
				 * Whether the overlay and it's descendants should be visible on a screen
				 * We are overriding Control's property to prevent RenderManager from rendering of an invisible placeholder
				 */	
				visible : {
					type : "boolean",
					defaultValue : true
				},
				/** 
				 * Whether the Overlay is selected
				 */					
				selected : {
					type : "boolean",
					defaultValue : false
				},
				/** 
				 * Whether the Overlay is selectable
				 */
				selectable : {
					type : "boolean",
					defaultValue : true
				},
				/** 
				 * Whether the Overlay is draggable
				 */
				draggable : {
					type : "boolean",
					defaultValue : false
				}
			},
			associations : {
				/** 
				 * An Element to create the Overlay for
				 */
				element : {
					type : "sap.ui.core.Element"
				}
			},
			aggregations : {
				/**
				 * AggregationOverlays for the public aggregations of the associated Element
				 */
				_aggregationOverlays : {
					type : "sap.ui.dt.AggregationOverlay",
					multiple : true,
					visibility : "hidden"
				},
				/**
				 * DesignTime metadata for the associated Element
				 */
				designTimeMetadata : {
					type : "sap.ui.dt.DesignTimeMetadata",
					multiple : false
				}
			},
			events : {
				/**
				 * Event fired when the Overlay is destroyed
				 */
				destroyed : {
					parameters : {}
				},
				/**
				 * Event fired when the property "Selection" is changed
				 */
				selectionChange : {
					parameters : {
						selected : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the property "Draggable" is changed
				 */
				draggableChange : {
					parameters : {
						draggable : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the associated Element is modified
				 */
				elementModified : {
					parameters : {
						type : { type : "string" },
						value : { type : "any" },
						oldValue : { type : "any" },
						target : { type : "sap.ui.core.Element" }
					}
				}
			}
		}
	});

	/** 
	 * Creates and/or returns an overlay container element, where all Overlays should be rendered (initially)
	 * @return {Element} overlay container
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
	 * Removes an overlay container element from DOM
	 * @static
	 */
	Overlay.removeOverlayContainer = function() {
		if (oOverlayContainer) {
			oOverlayContainer.remove();
		}

		oOverlayContainer = null;
	};

	/** 
	 * Called when the Overlay is initialized		
	 * @protected
	 */
	Overlay.prototype.init = function() {
		this._oDefaultDesignTimeMetadata = null;
		this._addToOverlayContainer();	
		this._bVisible = null;
	};

	/** 
	 * Called when the AggregationOverlay is destroyed	
	 * @protected
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

		delete this._oDomRef;
		delete this._bVisible;
		delete this._elementId;
		this.fireDestroyed();
	};

	/** 
	 * Called after Overlay rendering phase
	 * @protected
	 */
	Overlay.prototype.onAfterRendering = function() {
		this._oDomRef = this.getDomRef();

		if (this._oDomRef) {
			this._updateDom();
		}

	};

	/** 
	 * @return {Element} The Element's DOM Element sub DOM Element or null	
	 * @override
	 */
	Overlay.prototype.getDomRef = function() {
		return this._oDomRef || Control.prototype.getDomRef.apply(this, arguments);
	};

	/** 
	 * Sets an associated Element to create an overlay for
	 * @param {string|sap.ui.core.Element} vElement element or element's id
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
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
		// TODO: designTimeMetadata aggregation is NOT ready in this moment... how we can make it consistent?
		this._createAggregationOverlays();

		var oElement = this.getElementInstance();

		this._elementId = oElement.getId();
		OverlayRegistry.register(oElement, this);
		this._observe(oElement);

		var oParentOverlay = OverlayUtil.getClosestOverlayFor(oElement);
		if (oParentOverlay) {
			oParentOverlay.sync();
		}

		return this;
	};		

	/**
	 * Returns wether the Overlay is visible
	 * @return {boolean} if the Overlay is visible
	 * @public
	 */
	Overlay.prototype.getVisible = function() {
		if (this._bVisible === null) {
			return this.getDesignTimeMetadata().isVisible();
		} else {
			return this.getProperty("visible");
		}
	};

	/**
	 * Sets wether the Overlay is visible
	 * @param {boolean} bVisible if the Overlay is visible
	 * @returns {sap.ui.dt.Overlay} returns this	 
	 * @public
	 */
	Overlay.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible);
		this._bVisible = bVisible;

		return this;
	};	

	/**
	 * Sets wether the Overlay is selectable
	 * @param {boolean} bSelectable if the Overlay is selectable
	 * @returns {sap.ui.dt.Overlay} returns this	 
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
	 * Sets wether the Overlay is selected and toggles corresponding css class
	 * @param {boolean} bSelected if the Overlay is selected
	 * @param {boolean} bSuppressEvent (internal use only) supress firing "selectionChange" event
	 * @returns {sap.ui.dt.Overlay} returns this	 	 
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
	 * Sets wether the Overlay is draggable and toggles corresponding css class
	 * @param {boolean} bDraggable if the Overlay is draggable
	 * @returns {sap.ui.dt.Overlay} returns this	 	 
	 * @public
	 */
	Overlay.prototype.setDraggable = function(bDraggable) {
		if (this.getDraggable() !== bDraggable) {
			this.toggleStyleClass("sapUiDtOverlayDraggable", bDraggable);
			
			this.setProperty("draggable", bDraggable);
			this.fireDraggableChange({draggable : bDraggable});
		}

		return this;
	};	

	/**
	 * Returns the DesignTime metadata of this Overlay, if no DT metadata exists, creates and returns the default DT metadata object
	 * @return {sap.ui.DesignTimeMetadata} DT metadata of the Overlay
	 * @public
	 */
	Overlay.prototype.getDesignTimeMetadata = function() {
		var oDesignTimeMetadata = this.getAggregation("designTimeMetadata");
		if (!oDesignTimeMetadata && !this._oDefaultDesignTimeMetadata) {
			this._oDefaultDesignTimeMetadata = new DesignTimeMetadata({
				data : ElementUtil.getDesignTimeMetadata(this.getElementInstance())
			});
		}
		return oDesignTimeMetadata || this._oDefaultDesignTimeMetadata;
	};

	/**
	 * Syncs all AggregationOverlays children of this Overlay
	 * To sync an AggregationOverlay means to find all Overlays registered for public children of the associated aggregation
	 * and to add them inside of the AggregationOverlay
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
	 * Calculate and update CSS styles for the Overlay's DOM
	 * The calculation is based on original associated DOM state and parent overlays
	 * This method also calls "applyStyles" method for every child AggregationOverlay of this Overlay (cascade)
	 * @public
	 */
	Overlay.prototype.applyStyles = function() {
		var oElementGeometry = this.getGeometry();

		if (oElementGeometry) {
			var oOverlayParent = OverlayUtil.getClosestScrollable(this) || this.getParent();
			var mParentOffset = (oOverlayParent && oOverlayParent instanceof AggregationOverlay) ? oOverlayParent.$().offset() : null;
			var iScrollOffsetLeft = (oOverlayParent && oOverlayParent instanceof AggregationOverlay) ? oOverlayParent.$().scrollLeft() : null;
			var iScrollOffsetTop = (oOverlayParent && oOverlayParent instanceof AggregationOverlay) ? oOverlayParent.$().scrollTop() : null;
			var mPosition = DOMUtil.getOffsetFromParent(oElementGeometry.position, mParentOffset, iScrollOffsetTop, iScrollOffsetLeft);

			var iZIndex = DOMUtil.getZIndex(oElementGeometry.domRef);

			var $overlay = this.$();
			var mSize = oElementGeometry.size;

			$overlay.css("width", mSize.width + "px");
			$overlay.css("height", mSize.height + "px");
			$overlay.css("top", mPosition.top + "px");
			$overlay.css("left", mPosition.left + "px");
			if (iZIndex) {
				$overlay.css("z-index", iZIndex);
			}

			this.getAggregationOverlays().forEach(function(oAggregationOverlay) {
				oAggregationOverlay.applyStyles();
			});
		}
	};

	/** 
	 * Returns an object, which describes the DOM geometry of the element associated with this overlay or null if it can't be found
	 * The geometry is calculated based on the associated element's DOM reference, if it exists or based on it's public children
	 * Object may contain following fields: position - absolute position of Element in DOM; size - absolute size of Element in DOM
	 * Object may contain domRef field, when the associated Element's DOM can be found
	 * @return {object} geometry object describing the DOM of the Element associated with this Overlay 
	 * @public
	 */
	Overlay.prototype.getGeometry = function() {

		var oDomRef = this.getAssociatedDomRef();
		var mGeometry = DOMUtil.getGeometry(oDomRef);

		if (!mGeometry) {
			var aChildrenGeometry = [];
			this.getAggregationOverlays().forEach(function(oAggregationOverlay) {
				aChildrenGeometry.push(oAggregationOverlay.getGeometry());
			});
			mGeometry = OverlayUtil.getGeometry(aChildrenGeometry);
		}

		return mGeometry;
	};	

	/** 
	 * @private
	 */
	Overlay.prototype._updateDom = function() {
		var oElementGeometry = this.getGeometry();

		var oParent = this.getParent();
		if (oParent) {
			if (oParent.getDomRef) {
				this.$().appendTo(oParent.getDomRef());
			} else {
				// this.$().appendTo(oParent.getRootNode());
				// instead of adding the created DOM into the UIArea's DOM, we are adding it to overlay-container to avoid clearing of the DOM
				this.$().appendTo(Overlay.getOverlayContainer());
				this.applyStyles();
			}
		}
		if (oElementGeometry && this.isVisible()) {
			this.$().show();
		} else {
			// we should always be in DOM to make sure, that drop events (dragend) will be fired even if the overlay isn't visible anymore
			this.$().hide();
		}
		
	};

	/** 
	 * @private
	 */
	Overlay.prototype._createAggregationOverlays = function() {
		var oElement = this.getElementInstance();
		var oDesignTimeMetadata = this.getDesignTimeMetadata();

		if (oElement) {
			var that = this;
			ElementUtil.iterateOverAllPublicAggregations(oElement, function(oAggregation, aAggregationElements) {
				var sAggregationName = oAggregation.name;
				var oAggregationOverlay = new AggregationOverlay({
					aggregationName : sAggregationName,
					visible : oDesignTimeMetadata.isAggregationVisible(sAggregationName)
				});

				that._syncAggregationOverlay(oAggregationOverlay);

				that.addAggregation("_aggregationOverlays", oAggregationOverlay);
			});
		}
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
	 * @param {sap.ui.core.Element} oElement The element to observe
	 * @private
	 */
	Overlay.prototype._observe = function(oElement) {
		if (oElement instanceof sap.ui.core.Control) {
			this._oObserver = new ControlObserver({
				target : oElement
			});
			this._oObserver.attachDomChanged(this._onElementDomChanged, this);
		} else {
			this._oObserver = new ManagedObjectObserver({
				target : oElement
			});
		}
		this._oObserver.attachModified(this._onElementModified, this);
		this._oObserver.attachDestroyed(this._onElementDestroyed, this);
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
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay to sync
	 * @private
	 */
	Overlay.prototype._syncAggregationOverlay = function(oAggregationOverlay) {
		var sAggregationName = oAggregationOverlay.getAggregationName();
		var aAggregationElements = ElementUtil.getAggregation(this.getElementInstance(), sAggregationName);

		aAggregationElements.forEach(function(oAggregationElement) {
			var oChildOverlay = OverlayRegistry.getOverlay(oAggregationElement);
			if (oChildOverlay) {
				oAggregationOverlay.addChild(oChildOverlay);
			}
		});
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object	
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
	Overlay.prototype._onElementDomChanged = function() {
		this.invalidate();
	};

	/**
	 * @private
	 */
	Overlay.prototype._onElementDestroyed = function() {
		this.destroy();
	};

	/**
	 * Returns an instance of the Element, which is associated with this Overlay
	 * @return {sap.ui.Element} associated Element
	 * @public
	 */
	Overlay.prototype.getElementInstance = function() {
		return sap.ui.getCore().byId(this.getElement());
	};

	/** 
	 * Returns a DOM reference for the associated Element or null, if it can't be found
	 * @return {Element} DOM element or null
	 * @public
	 */
	Overlay.prototype.getAssociatedDomRef = function() {
		return ElementUtil.getDomRef(this.getElementInstance());
	};

	/**
	 * Returns AggregationOverlays created for the public aggregations of the associated Element
	 * @return {sap.ui.dt.AggregationOverlay[]} array of the AggregationOverlays
	 * @public
	 */
	Overlay.prototype.getAggregationOverlays = function() {
		return this.getAggregation("_aggregationOverlays") || [];
	};

	/**
	 * Returns AggregationOverlay the public aggregations of the associated Element by aggregation name
	 * @param {string} sAggregationName name of the aggregation
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlays for the aggregation
	 * @public
	 */
	Overlay.prototype.getAggregationOverlay = function(sAggregationName) {
		var aAggregationOverlaysWithName = this.getAggregation("_aggregationOverlays").filter(function(oAggregationOverlay) {
			return oAggregationOverlay.getAggregationName() === sAggregationName;
		});
		if (aAggregationOverlaysWithName.length) {
			return aAggregationOverlaysWithName[0];
		}
	};

	/**
	 * Returns closest Overlay ancestor of this Overlay or undefined, if no parent Overlay exists
	 * @return {sap.ui.dt.Overlay} Overlay parent
	 * @public
	 */
	Overlay.prototype.getParentOverlay = function() {
		var oParentAggregationOverlay = this.getParentAggregationOverlay();
		if (oParentAggregationOverlay) { 
			return oParentAggregationOverlay.getParent();
		}
	};

	/**
	 * Returns closest AggregationOverlay ancestor of this Overlay or null, if no parent AggregationOverlay exists
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlay parent, which contains this Overlay
	 * @public
	 */
	Overlay.prototype.getParentAggregationOverlay = function() {
		var oParentAggregationOverlay = this.getParent();
		return oParentAggregationOverlay instanceof sap.ui.dt.AggregationOverlay ? oParentAggregationOverlay : null;
	};

	/** 
	 * Returns if the Overlay is selected
	 * @public
	 * @return {boolean} if the Overlay is selected
	 */
	Overlay.prototype.isSelected = function() {
		return this.getSelected();
	};

	/** 
	 * Returns if the Overlay is selectable
	 * @public
	 * @return {boolean} if the Overlay is selectable
	 */
	Overlay.prototype.isSelectable = function() {
		return this.getSelectable();
	};

	/** 
	 * Returns if the Overlay is draggable
	 * @public
	 * @return {boolean} if the Overlay is draggable
	 */
	Overlay.prototype.isDraggable = function() {
		return this.getDraggable();
	};

	/** 
	 * Returns if the Overlay is visible
	 * @public
	 * @return {boolean} if the Overlay is visible
	 */
	Overlay.prototype.isVisible = function() {
		return this.getVisible();
	};

	return Overlay;
}, /* bExport= */ true);
