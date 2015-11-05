/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ElementOverlay.
sap.ui.define([
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ControlObserver',
	'sap/ui/dt/ManagedObjectObserver',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/AggregationDesignTimeMetadata',
	'sap/ui/dt/AggregationOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/DOMUtil'
],
function(Overlay, ControlObserver, ManagedObjectObserver, ElementDesignTimeMetadata, AggregationDesignTimeMetadata, AggregationOverlay, OverlayRegistry, ElementUtil, OverlayUtil, DOMUtil) {
	"use strict";

	/**
	 * Constructor for an ElementOverlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementOverlay allows to create an absolute positioned DIV above the associated element.
	 * It also creates AggregationOverlays for every public aggregation of the associated element.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ElementOverlay
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementOverlay = Overlay.extend("sap.ui.dt.ElementOverlay", /** @lends sap.ui.dt.ElementOverlay.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				/**
				 * Whether the ElementOverlay is selected
				 */
				selected : {
					type : "boolean",
					defaultValue : false
				},
				/**
				 * Whether the ElementOverlay is selectable, per default this implicitly makes the overlay focusable (TODO discuss)
				 */
				selectable : {
					type : "boolean",
					defaultValue : false
				},
				/**
				 * Whether the ElementOverlay can get the browser focus (tabindex)
				 */
				focusable : {
					type : "boolean",
					defaultValue : false
				},
				/**
				 * Whether the ElementOverlay is movable
				 */
				movable : {
					type : "boolean",
					defaultValue : false
				},
				/**
				 * Whether the ElementOverlay is editable
				 */
				editable : {
					type : "boolean",
					defaultValue : false
				}
			},
			aggregations : {
				/**
				 * AggregationOverlays for the public aggregations of the associated Element
				 */
				aggregationOverlays : {
					type : "sap.ui.dt.AggregationOverlay",
					multiple : true
				},
				/**
				 * [designTimeMetadata description]
				 * @type {Object}
				 */
				designTimeMetadata : {
					type : "sap.ui.dt.ElementDesignTimeMetadata",
					multiple : false
				}
			},
			events : {
				/**
				 * Event fired when the property "Selection" is changed
				 */
				selectionChange : {
					parameters : {
						selected : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the property "Movable" is changed
				 */
				movableChange : {
					parameters : {
						movable : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the property "Selectable" is changed
				 */
				selectableChange : {
					parameters : {
						selectable : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the property "Focusable" is changed
				 */
				focusableChange : {
					parameters : {
						focusable : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the property "Editable" is changed
				 */
				editableChange : {
					parameters : {
						selected : {
							editable : "boolean"
						}
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
	 * Called when the ElementOverlay is initialized
	 * @protected
	 */
	ElementOverlay.prototype.init = function() {
		Overlay.prototype.init.apply(this, arguments);

		this._oDefaultDesignTimeMetadata = null;
		this.placeAt(Overlay.getOverlayContainer());

		// this is needed to prevent UI5 renderManager from removing overlay's node from DOM in a rendering phase
		// see RenderManager.js "this._fPutIntoDom" function
		var oUIArea = this.getUIArea();
		oUIArea._onChildRerenderedEmpty = function() {
			return true;
		};
	};

	/**
	 * Called when the ElementOverlay is destroyed
	 * @protected
	 */
	ElementOverlay.prototype.exit = function() {
		Overlay.prototype.exit.apply(this, arguments);

		this._destroyDefaultDesignTimeMetadata();

		var oElement = this.getElementInstance();
		if (oElement) {
			OverlayRegistry.deregister(oElement);
			this._unobserve(oElement);
		} else {
			// element can be destroyed before
			OverlayRegistry.deregister(this._sElementId);
		}

		if (!OverlayRegistry.hasOverlays()) {
			Overlay.removeOverlayContainer();
		}

		delete this._sElementId;
	};

	/**
	 * Sets an associated Element to create an overlay for
	 * @param {string|sap.ui.core.Element} vElement element or element's id
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setElement = function(vElement) {
		var oOldElement = this.getElementInstance();
		if (oOldElement instanceof sap.ui.core.Element) {
			OverlayRegistry.deregister(oOldElement);
			this._unobserve(oOldElement);
		}

		this.destroyAggregation("aggregationOverlays");
		this._destroyDefaultDesignTimeMetadata();

		this.setAssociation("element", vElement);
		this._createAggregationOverlays();

		var oElement = this.getElementInstance();
		this._sElementId = oElement.getId();
		OverlayRegistry.register(oElement, this);
		this._observe(oElement);

		var oParentElementOverlay = OverlayUtil.getClosestOverlayFor(oElement);
		if (oParentElementOverlay) {
			oParentElementOverlay.sync();
		}

		return this;
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
	 * Sets whether the ElementOverlay is selectable
	 * @param {boolean} bSelectable if the ElementOverlay is selectable
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setSelectable = function(bSelectable) {
		if (bSelectable !== this.isSelectable()) {

			if (!bSelectable) {
				this.setSelected(false);
			}

			this.toggleStyleClass("sapUiDtOverlaySelectable", bSelectable);
			this.setProperty("selectable", bSelectable);
			this.fireSelectableChange({selectable : bSelectable});
		}
		this.setFocusable(bSelectable);
		return this;
	};

	/**
	 * Sets whether the ElementOverlay is selected and toggles corresponding css class
	 * @param {boolean} bSelected if the ElementOverlay is selected
	 * @param {boolean} bSuppressEvent (internal use only) supress firing "selectionChange" event
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setSelected = function(bSelected, bSuppressEvent) {
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
	 * Sets whether the ElementOverlay can get the browser focus (tabindex)
	 * @param {boolean} bFocusable if the ElementOverlay is focusable
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setFocusable = function(bFocusable) {
		if (this.isFocusable() !== bFocusable) {
			this.setProperty("focusable", bFocusable);
			this.fireFocusableChange({focusable : bFocusable});
		}

		return this;
	};

	/**
	 * Sets whether the ElementOverlay is movable and toggles corresponding css class
	 * @param {boolean} bMovable if the ElementOverlay is movable
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setMovable = function(bMovable) {
		if (this.getMovable() !== bMovable) {
			this.toggleStyleClass("sapUiDtOverlayMovable", bMovable);

			this.setProperty("movable", bMovable);
			this.fireMovableChange({movable : bMovable});
		}

		return this;
	};

	/**
	 * Sets whether the ElementOverlay is editable and toggles corresponding css class
	 * @param {boolean} bEditable if the ElementOverlay is editable
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setEditable = function(bEditable) {
		if (this.getEditable() !== bEditable) {
			this.toggleStyleClass("sapUiDtOverlayEditable", bEditable);

			this.setProperty("editable", bEditable);
			this.fireEditableChange({editable : bEditable});
		}

		return this;
	};

	/**
	 * Returns the DesignTime metadata of this ElementOverlay, if no DT metadata exists, creates and returns the default DT metadata object
	 * @return {sap.ui.DesignTimeMetadata} DT metadata of the ElementOverlay
	 * @public
	 */
	ElementOverlay.prototype.getDesignTimeMetadata = function() {
		var oDesignTimeMetadata = this.getAggregation("designTimeMetadata");
		if (!oDesignTimeMetadata && !this._oDefaultDesignTimeMetadata) {
			this._oDefaultDesignTimeMetadata = new ElementDesignTimeMetadata({
				data : ElementUtil.getDesignTimeMetadata(this.getElementInstance())
			});
		}
		return oDesignTimeMetadata || this._oDefaultDesignTimeMetadata;
	};

	/**
	 * Syncs all AggregationOverlays children of this ElementOverlay
	 * To sync an AggregationOverlay means to find all ElementOverlays registered for public children of the associated aggregation
	 * and to add them inside of the AggregationOverlay
	 * @public
	 */
	ElementOverlay.prototype.sync = function() {
		var that = this;
		var aAggregationOverlays = this.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			that._syncAggregationOverlay(oAggregationOverlay);
		});
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._createAggregationOverlay = function(sAggregationName, bInHiddenTree) {
		var oData =  this.getDesignTimeMetadata().getAggregation(sAggregationName);

		var oAggregationDesignTimeMetadata = new AggregationDesignTimeMetadata({data : oData});

		var oAggregationOverlay = new AggregationOverlay({
			aggregationName : sAggregationName,
			element : this.getElementInstance(),
			designTimeMetadata : oAggregationDesignTimeMetadata,
			inHiddenTree : bInHiddenTree
		});

		this._syncAggregationOverlay(oAggregationOverlay);

		this.addAggregation("aggregationOverlays", oAggregationOverlay);
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._createAggregationOverlays = function() {
		var oElement = this.getElementInstance();
		var oDesignTimeMetadata = this.getDesignTimeMetadata();

		if (oElement) {
			var that = this;
			var mAggregationsWithOverlay = {};

			ElementUtil.iterateOverAllPublicAggregations(oElement, function(oAggregation, aAggregationElements) {
				var sAggregationName = oAggregation.name;
				mAggregationsWithOverlay[sAggregationName] = true;
				that._createAggregationOverlay(sAggregationName, that.isInHiddenTree());
			});

			// create aggregation overlays also for a hidden aggregations which are not ignored in the DT Metadata
			var mAggregationsMetadata = oDesignTimeMetadata.getAggregations();
			var aAggregationNames = Object.keys(mAggregationsMetadata);
			aAggregationNames.forEach(function (sAggregationName) {
				var oAggregationMetadata = mAggregationsMetadata[sAggregationName];
				if (oAggregationMetadata.ignore === false && !mAggregationsWithOverlay[sAggregationName]) {
					that._createAggregationOverlay(sAggregationName, true);
				}
			});
		}
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._destroyDefaultDesignTimeMetadata = function() {
		if (this._oDefaultDesignTimeMetadata) {
			this._oDefaultDesignTimeMetadata.destroy();
			this._oDefaultDesignTimeMetadata = null;
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement The element to observe
	 * @private
	 */
	ElementOverlay.prototype._observe = function(oElement) {
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
	ElementOverlay.prototype._unobserve = function(oElement) {
		this._oObserver.destroy();
	};

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay to sync
	 * @private
	 */
	ElementOverlay.prototype._syncAggregationOverlay = function(oAggregationOverlay) {
		var sAggregationName = oAggregationOverlay.getAggregationName();
		var aAggregationElements = ElementUtil.getAggregation(this.getElementInstance(), sAggregationName);

		aAggregationElements.forEach(function(oAggregationElement) {
			var oChildElementOverlay = OverlayRegistry.getOverlay(oAggregationElement);
			if (oChildElementOverlay) {
				oAggregationOverlay.addChild(oChildElementOverlay);
			}
		});
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onElementModified = function(oEvent) {
		this.sync();
		this.invalidate();
		this.fireElementModified(oEvent.getParameters());
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._onElementDomChanged = function() {
		this.invalidate();
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._onElementDestroyed = function() {
		this.destroy();
	};

	/**
	 * Returns AggregationOverlays created for the public aggregations of the associated Element
	 * @return {sap.ui.dt.AggregationOverlay[]} array of the AggregationOverlays
	 * @public
	 */
	ElementOverlay.prototype.getAggregationOverlays = function() {
		return this.getAggregation("aggregationOverlays") || [];
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype.getChildren = function() {
		return this.getAggregationOverlays();
	};

	/**
	 * Returns AggregationOverlay the public aggregations of the associated Element by aggregation name
	 * @param {string} sAggregationName name of the aggregation
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlays for the aggregation
	 * @public
	 */
	ElementOverlay.prototype.getAggregationOverlay = function(sAggregationName) {
		var aAggregationOverlaysWithName = this.getAggregationOverlays().filter(function(oAggregationOverlay) {
			return oAggregationOverlay.getAggregationName() === sAggregationName;
		});
		if (aAggregationOverlaysWithName.length) {
			return aAggregationOverlaysWithName[0];
		}
	};

	/**
	 * Returns closest ElementOverlay ancestor of this ElementOverlay or undefined, if no parent ElementOverlay exists
	 * @return {sap.ui.dt.ElementOverlay} ElementOverlay parent
	 * @public
	 */
	ElementOverlay.prototype.getParentElementOverlay = function() {
		var oParentAggregationOverlay = this.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			return oParentAggregationOverlay.getParent();
		}
	};

	/**
	 * Returns closest AggregationOverlay ancestor of this ElementOverlay or null, if no parent AggregationOverlay exists
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlay parent, which contains this ElementOverlay
	 * @public
	 */
	ElementOverlay.prototype.getParentAggregationOverlay = function() {
		var oParentAggregationOverlay = this.getParent();
		return oParentAggregationOverlay instanceof sap.ui.dt.AggregationOverlay ? oParentAggregationOverlay : null;
	};

	ElementOverlay.prototype.onAfterRendering = function() {
		Overlay.prototype.onAfterRendering.apply(this, arguments);
		var bFocusable = this.isFocusable();
		if (bFocusable) {
			this.$().attr("tabindex", 0);
		} else {
			this.$().attr("tabindex", null);
		}
	};
	/**
	 * Returns if the ElementOverlay is selected
	 * @public
	 * @return {boolean} if the ElementOverlay is selected
	 */
	ElementOverlay.prototype.isSelected = function() {
		return this.getSelected();
	};

	/**
	 * Returns if the ElementOverlay is selectable
	 * @public
	 * @return {boolean} if the ElementOverlay is selectable
	 */
	ElementOverlay.prototype.isSelectable = function() {
		return this.getSelectable();
	};

	/**
	 * Returns if the ElementOverlay is can get the focus
	 * @public
	 * @return {boolean} if the ElementOverlay is focusable
	 */
	ElementOverlay.prototype.isFocusable = function() {
		return this.getFocusable();
	};

	/**
	 * Returns if the ElementOverlay is movable
	 * @public
	 * @return {boolean} if the ElementOverlay is movable
	 */
	ElementOverlay.prototype.isMovable = function() {
		return this.getMovable();
	};

	/**
	 * Returns if the ElementOverlay is editable
	 * @public
	 * @return {boolean} if the ElementOverlay is editable
	 */
	ElementOverlay.prototype.isEditable = function() {
		return this.getEditable();
	};

	return ElementOverlay;
}, /* bExport= */ true);
