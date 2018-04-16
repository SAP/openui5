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
	 * @extends sap.ui.dt.Overlay
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
			associations : {
				/**
				 * Array of plugins that set editable to true
				 */
				editableByPlugins : {
					type : "any[]",
					multiple : true,
					singularName: "editableByPlugin"
				}
			},
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
				},
				/**
				 * All overlays inside the relevant container within the same aggregations
				 */
				relevantOverlays: {
					type: "any[]",
					defaultValue: []
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
					altTypes : ["object"],
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
				 * Event fired when the property "Editable" is changed
				 */
				editableChange : {
					parameters : {
						editable : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the associated Element is modified
				 */
				elementModified : {
					parameters : {
						type : "string",
						name : "string",
						value : "any",
						oldValue : "any",
						target : "sap.ui.core.Element"
					}
				},
				/**
				 * TODO
				 */
				requestElementOverlaysForAggregation : {
					parameters : {
						name : { type : "string" }
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

		this._oMutationObserver = Overlay.getMutationObserver();
		this._oMutationObserver.attachDomChanged(this._onDomChanged, this);
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype.onAfterRendering = function() {
		var bOldDomInvisible = !this._oDomRef;
		Overlay.prototype.onAfterRendering.apply(this, arguments);

		// fire ElementModified, when the overlay had no domRef before, but has one now
		if (bOldDomInvisible && this._oDomRef) {
			var oParams = {
				id: this.getId(),
				type: "overlayRendered"
			};
			this.fireElementModified(oParams);
		}
	};

	/**
	 * Called when the ElementOverlay is destroyed
	 * @protected
	 */
	ElementOverlay.prototype.exit = function() {
		if (this._oMutationObserver) {
			this._oMutationObserver.detachDomChanged(this._onDomChanged, this);
			delete this._oMutationObserver;
		}

		Overlay.prototype.exit.apply(this, arguments);

		this._unobserve();
		OverlayRegistry.deregister(this._sElementId);

		if (!OverlayRegistry.hasOverlays()) {
			Overlay.destroyMutationObserver();
			Overlay.removeOverlayContainer();
		}

		delete this._sElementId;
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype.applyStyles = function() {
		var oGeometry = this.getGeometry();
		if (oGeometry && oGeometry.visible) {
			this._sortAggregationOverlaysInDomOrder();
		}

		Overlay.prototype.applyStyles.apply(this, arguments);
	};

	/**
	 * Sorts aggregation overlays in there UI order
	 * @private
	 */
	ElementOverlay.prototype._sortAggregationOverlaysInDomOrder = function() {
		// compares two aggregations domRefs and returns 1, if first aggregation should be bellow in dom order
		var fnCompareAggregations = function(oAggregationOverlay1, oAggregationOverlay2) {
			var oGeometry1 = oAggregationOverlay1.getGeometry();
			var oGeometry2 = oAggregationOverlay2.getGeometry();
			var oPosition1 = oGeometry1 && oGeometry1.position;
			var oPosition2 = oGeometry2 && oGeometry2.position;

			if (oPosition1 && oPosition2) {
				var iBottom1 = oPosition1.top + oGeometry1.size.height;
				var iBottom2 = oPosition2.top + oGeometry2.size.height;

				if (oPosition1.top < oPosition2.top) {
					if (iBottom1 >= iBottom2 && oPosition2.left < oPosition1.left) {
						/*  Example:
							            +--------------+
							+------+    |              |
							|  2   |    |       1      |
							+------+    |              |
							            +--------------+
							Despites 1st overlay's top is above 2nd element,
							the order should be switched, since 2nd element
							is shorter and is more to the left
						 */
						return 1;
					} else {
						return -1; // do not switch order
					}
				} else

				if (oPosition1.top === oPosition2.top) {
					if (oPosition1.left === oPosition2.left) {
						return 0;
					} else if (oPosition1.left < oPosition2.left) {
						return -1; // order is correct
					} else {
						return 1; // switch order
					}
				} else

				// if (oPosition1.top > oPosition2.top)
				 if (iBottom1 <= iBottom2 && oPosition2.left > oPosition1.left) {
					/* see picture above, but switch 1 and 2 - order is correct */
					return -1;
				} else {
					/*  Example:
						            +--------------+
						+------+    |       2      |
						|  1   |    +--------------+
						|      |
						+------+

						Since 1st overlay's both top and bottom coordinates are
						bellow in dom, then top and bottom of 2nd, they should be switched
					 */
					return 1;
				}
			}
		};

		var aSortedAggregationOverlays = this.getAggregationOverlays().sort(fnCompareAggregations);

		var bOrderSwitched = this.getAggregationOverlays().some(function(oOverlay, index) {
			if (oOverlay.getId() !== aSortedAggregationOverlays[index].getId()) {
				return true;
			}
		});

		if (bOrderSwitched) {
			// insert in sorted order & suppress invalidate to prevent rerendering
			this.removeAllAggregation("aggregationOverlays", true);
			aSortedAggregationOverlays.forEach(function(oAggregationOverlay) {
				// suppress invalidate to prevent rerendering
				this.addAggregation("aggregationOverlays", oAggregationOverlay, true);
			}.bind(this));
		}
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype.setLazyRendering = function(bLazyRendering) {
		Overlay.prototype.setLazyRendering.apply(this, arguments);

		if (!bLazyRendering) {
			this.placeInOverlayContainer();
		}
	};

	/**
	 * Places this ElementOverlay in an overlay container, which causes a rendering only if overlay wasn't rendered before
	 * Overlay won't be visible without a call of this method
	 * @public
	 */
	ElementOverlay.prototype.placeInOverlayContainer = function() {
		if (!this.getParent()) {
			this.placeAt(Overlay.getOverlayContainer());
			// this is needed to prevent UI5 renderManager from removing overlay's node from DOM in a rendering phase
			// see RenderManager.js "this._fPutIntoDom" function
			var oUIArea = this.getUIArea();
			oUIArea._onChildRerenderedEmpty = function() {
				return true;
			};
		}
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
			this._unobserve();
		}

		this.setAssociation("element", vElement);
		var oElement = this.getElementInstance();

		this._sElementId = oElement.getId();
		OverlayRegistry.register(oElement, this);
		this._observe(oElement);

		if (this.getDesignTimeMetadata()) {
			this._renderAndCreateAggregation();
		}

		return this;
	};

	ElementOverlay.prototype._addPropagationInfos = function(oDesignTimeMetadata) {
		var oParentOverlay = this.getParentAggregationOverlay(),
			oParentElementOverlay;

		var oElement = this.getElementInstance();

		if (!oParentOverlay && oElement) {
			oParentElementOverlay = OverlayRegistry.getOverlay(oElement.getParent());
			if (oParentElementOverlay && oElement.sParentAggregationName) {
				oParentOverlay = oParentElementOverlay.getAggregationOverlay(oElement.sParentAggregationName);
			}
		}
		if (!oParentOverlay){
			return false;
		}

		var oParentDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		var vRelevantContainerElement = oParentDesignTimeMetadata.getRelevantContainerForPropagation(oElement);
		var vReturnMetadata = oParentDesignTimeMetadata.getMetadataForPropagation(oElement);
		if (!vRelevantContainerElement && !vReturnMetadata) {
			return false;
		}

		if (vRelevantContainerElement) {
			oDesignTimeMetadata.getData().relevantContainer = vRelevantContainerElement;
		}

		if (vReturnMetadata){
			var oData = oDesignTimeMetadata.getData();
			if (vReturnMetadata.actions === null) {
				var mAggregations = oElement.getMetadata().getAllAggregations();
				var aAggregationNames = Object.keys(mAggregations);
				aAggregationNames = aAggregationNames.concat(
					Object.keys(oData.aggregations).filter(function (sAggregationName) {
				    return aAggregationNames.indexOf(sAggregationName) < 0;
				}));

				aAggregationNames.forEach(function(sAggregationName) {
					if (oData.aggregations[sAggregationName] && oData.aggregations[sAggregationName].actions) {
						oData.aggregations[sAggregationName].actions = null;
					}
				});
			}
			jQuery.extend(true, oData, vReturnMetadata);
		}

		return true;
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype.setDesignTimeMetadata = function(vDesignTimeMetadata) {
		var oDesignTimeMetadata;
		if (vDesignTimeMetadata instanceof ElementDesignTimeMetadata) {
			oDesignTimeMetadata = vDesignTimeMetadata;
		} else {
			oDesignTimeMetadata = new ElementDesignTimeMetadata({
				libraryName : this.getElementInstance().getMetadata().getLibraryName(),
				data : vDesignTimeMetadata
			});
		}
		if (!this._oOriginalDesignTimeMetadata){
			this._oOriginalDesignTimeMetadata = oDesignTimeMetadata;
		}
		this._addPropagationInfos(oDesignTimeMetadata);
		var oReturn = this.setAggregation("designTimeMetadata", oDesignTimeMetadata);

		if (this.getElementInstance()) {
			this._aScrollContainers = this.getDesignTimeMetadata().getScrollContainers();
			this._renderAndCreateAggregation();
		}

		return oReturn;
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._renderAndCreateAggregation = function() {
		// detach all children, so then they won't be destroyed
		this.getAggregationOverlays().forEach(function(oAggregationOverlay) {
			oAggregationOverlay.getChildren().forEach(function(oElementOverlay) {
				oElementOverlay.setParent(null);
			});
		});
		this.destroyAggregationOverlays();

		this._createAggregationOverlays();

		var oParentElementOverlay = OverlayUtil.getClosestOverlayFor(this.getElementInstance().getParent());
		if (oParentElementOverlay) {
			oParentElementOverlay.sync();
		}
	};

	/**
	 * Returns a jQuery Object reference for the associated Element or undefined, if it can't be found
	 * @return {jQuery} jQuery object or undefined
	 * @public
	 */
	ElementOverlay.prototype.getAssociatedDomRef = function() {
		var oDomRef = ElementUtil.getDomRef(this.getElementInstance());
		if (!oDomRef) {
			var oDesignTimeMetadata = this.getDesignTimeMetadata();
			if (!oDesignTimeMetadata) {
				return undefined;
			}
			var fnGetDomRef = oDesignTimeMetadata.getDomRef();
			if (typeof fnGetDomRef === "function") {
				oDomRef = fnGetDomRef(this.getElementInstance());
			}
		}

		if (oDomRef) {
			return jQuery(oDomRef);
		}
		return undefined;
	};

	/**
	 * Sets whether the ElementOverlay is selectable
	 * @param {boolean} bSelectable if the ElementOverlay is selectable
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setSelectable = function(bSelectable) {
		bSelectable = !!bSelectable;
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
	 * @param {boolean} bSuppressEvent (internal use only) suppress firing "selectionChange" event
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setSelected = function(bSelected, bSuppressEvent) {
		bSelected = !!bSelected;
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
	 * Sets whether the ElementOverlay is movable and toggles corresponding css class
	 * @param {boolean} bMovable if the ElementOverlay is movable
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setMovable = function(bMovable) {
		bMovable = !!bMovable;
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
		bEditable = !!bEditable;
		if (this.getEditable() !== bEditable) {
			this.toggleStyleClass("sapUiDtOverlayEditable", bEditable);

			this.setProperty("editable", bEditable);
			this.fireEditableChange({editable : bEditable});
		}

		return this;
	};

	/**
	 * @public
	 */
	ElementOverlay.prototype.sync = function() {
		var aAggregationOverlays = this.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			this._syncAggregationOverlay(oAggregationOverlay);
		}, this);
	};

	ElementOverlay.prototype._getParentRelevantContainerPropagation = function() {
		var oParentAggregationOverlay = this.getParent();
		var oCopyOfParentPropagation = [];

		if (oParentAggregationOverlay &&
			oParentAggregationOverlay.getAggregation("designTimeMetadata")) {
			jQuery.extend(oCopyOfParentPropagation, oParentAggregationOverlay.getDesignTimeMetadata().getData()["propagationInfos"]);
			return oCopyOfParentPropagation;
		}
		return false;
	};

	ElementOverlay.prototype._getCurrentRelevantContainerPropagation = function(oElementDtMetadataForAggregation, oNewPropagationInfo) {
		if (!oElementDtMetadataForAggregation.propagateRelevantContainer) {
			return false;
		} else if (typeof oElementDtMetadataForAggregation.propagateRelevantContainer === "function") {
			oNewPropagationInfo.relevantContainerFunction = oElementDtMetadataForAggregation.propagateRelevantContainer;
			oNewPropagationInfo.relevantContainerElement = this.getElementInstance();
		} else if (typeof oElementDtMetadataForAggregation.propagateRelevantContainer === "boolean" &&
			oElementDtMetadataForAggregation.propagateRelevantContainer) {
			oNewPropagationInfo.relevantContainerFunction = function() { return true; };
			oNewPropagationInfo.relevantContainerElement = this.getElementInstance();
		} else {
			throw new Error("wrong type: it should be either a function or a boolean value and it is:" +
				typeof oElementDtMetadataForAggregation.propagateRelevantContainer);
		}
		return true;
	};

	ElementOverlay.prototype._getCurrentDesigntimePropagation = function(oElementDtMetadataForAggregation, oNewPropagationInfo) {
		if (!oElementDtMetadataForAggregation.propagateMetadata) {
			return false;
		} else if (typeof oElementDtMetadataForAggregation.propagateMetadata === "function") {
			oNewPropagationInfo.relevantContainerElement = this.getElementInstance();
			oNewPropagationInfo.metadataFunction = oElementDtMetadataForAggregation.propagateMetadata;
		} else {
			throw new Error("wrong type: it should be a function and it is:",
				typeof oElementDtMetadataForAggregation.propagateMetadata);
		}
		return true;
	};

	ElementOverlay.prototype._propagateDesigntimeObj = function(oAggregationDtMetadata, oNewRelevantContainerPropagation, aPropagatedRelevantContainersFromParent) {
		var oAggregationData;

		if (!aPropagatedRelevantContainersFromParent &&
			!oNewRelevantContainerPropagation) {
			return false;
		}

		if (oNewRelevantContainerPropagation) {
			aPropagatedRelevantContainersFromParent = aPropagatedRelevantContainersFromParent ? aPropagatedRelevantContainersFromParent : [];
			aPropagatedRelevantContainersFromParent.push(oNewRelevantContainerPropagation);
		}

		// get designtime metadata data-object from current aggregation
		oAggregationData = oAggregationDtMetadata.getData();

		// add propagation array to current aggregation designtime-metadata
		oAggregationData.propagationInfos = aPropagatedRelevantContainersFromParent;

		// propagate relevant container
		oAggregationDtMetadata.setData(oAggregationData);

		return true;
	};

	ElementOverlay.prototype._handleDesigntimePropagation = function(oAggregationDtMetadata) {
		var oNewPropagationInfo = {
			relevantContainerFunction : null,
			relevantContainerElement : null,
			metadataFunction: null
		};
		var bNewContentAdded = false;

		var aPropagatedRelevantContainersFromParent = this._getParentRelevantContainerPropagation();

		var oDtMetadataForAggregation = oAggregationDtMetadata.getData();
		if (oDtMetadataForAggregation &&
			oDtMetadataForAggregation !== {}) {
			bNewContentAdded = (this._getCurrentRelevantContainerPropagation(oDtMetadataForAggregation, oNewPropagationInfo)
				|| bNewContentAdded);
			bNewContentAdded = (this._getCurrentDesigntimePropagation(oDtMetadataForAggregation, oNewPropagationInfo)
				|| bNewContentAdded);
		}

		if (bNewContentAdded === false) {
			oNewPropagationInfo = null;
		}

		if (aPropagatedRelevantContainersFromParent || oNewPropagationInfo) {
			return this._propagateDesigntimeObj(oAggregationDtMetadata, oNewPropagationInfo, aPropagatedRelevantContainersFromParent);
		} else {
			return false;
		}
	};

	/**
	 * @param {string} sAggregationName name of aggregation to be created
	 * @returns {object} aggregation overlay
	 * @private
	 */
	ElementOverlay.prototype._createAggregationOverlay = function(sAggregationName) {
		var oAggregationDesignTimeMetadata = this.getDesignTimeMetadata().createAggregationDesignTimeMetadata(sAggregationName);

		this._handleDesigntimePropagation(oAggregationDesignTimeMetadata);

		var oAggregationOverlay = new AggregationOverlay({
			aggregationName : sAggregationName,
			element : this.getElementInstance(),
			designTimeMetadata : oAggregationDesignTimeMetadata
		});
		this._mAggregationOverlays[sAggregationName] = oAggregationOverlay;
		this.addAggregation("aggregationOverlays", oAggregationOverlay);

		this._syncAggregationOverlay(oAggregationOverlay);

		oAggregationOverlay.attachVisibleChanged(this._onAggregationVisibleChanged, this);

		return oAggregationOverlay;
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._createAggregationOverlays = function() {
		this._mAggregationOverlays = {};

		var oElement = this.getElementInstance();
		var oDesignTimeMetadata = this.getDesignTimeMetadata();

		var mAggregationsWithOverlay = {};

		var mElementAggregations = oElement.getMetadata().getAllAggregations();
		var aElementAggregationNames = Object.keys(mElementAggregations);

		var bIgnored;
		aElementAggregationNames.forEach(function(sAggregationName) {
			bIgnored = oDesignTimeMetadata.isAggregationIgnored(oElement, sAggregationName);
			mAggregationsWithOverlay[sAggregationName] = !bIgnored;
			// create aggregation overlays which are not ignored in the DT Metadata
			if (!bIgnored) {
				this._createAggregationOverlay(sAggregationName);
			}
		}.bind(this));

		// create aggregation overlays also for a hidden aggregations and aggregation-like associations which are not ignored in the DT Metadata
		var mAggregationsMetadata = oDesignTimeMetadata.getAggregations();
		if (mAggregationsMetadata) {
			var aAggregationNames = Object.keys(mAggregationsMetadata);
			aAggregationNames.forEach(function (sAggregationName) {
				if (mAggregationsWithOverlay[sAggregationName] === undefined) {
					bIgnored = oDesignTimeMetadata.isAggregationIgnored(oElement, sAggregationName);
					if (!bIgnored) {
						this._createAggregationOverlay(sAggregationName);
					}
				}
			}, this);
		}

		this.sync();
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
			this._oObserver.attachAfterRendering(this._onElementAfterRendering, this);
		} else {
			this._oObserver = new ManagedObjectObserver({
				target : oElement
			});
		}
		this._oObserver.attachModified(this._onElementModified, this);
		this._oObserver.attachDestroyed(this._onElementDestroyed, this);
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._unobserve = function() {
		if (this._oObserver) {
			this._oObserver.destroy();
		}
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onAggregationVisibleChanged = function(oEvent) {
		var oAggregationOverlay = oEvent.getSource();
		this._syncAggregationOverlay(oAggregationOverlay);
	};

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay to sync
	 * @private
	 */
	ElementOverlay.prototype._syncAggregationOverlay = function(oAggregationOverlay) {
		if (oAggregationOverlay.isVisible()) {
			var sAggregationName = oAggregationOverlay.getAggregationName();

			var bIsControl = this.getElementInstance() instanceof sap.ui.core.Control;
			// always create aggregations for Elements, because we can't check if they are visible correctly...
			if (!bIsControl || this._getElementInstanceVisible()) {
				if (!oAggregationOverlay.getChildren().length) {
					this.fireRequestElementOverlaysForAggregation({
						name : sAggregationName
					});
				}
			}

			OverlayUtil.iterateOverAggregationLikeChildren(this, sAggregationName, function(oAggregationElement) {
				var oChildElementOverlay = OverlayRegistry.getOverlay(oAggregationElement);
				if (oChildElementOverlay  && oChildElementOverlay.getParent() !== this) {
					oAggregationOverlay.addChild(oChildElementOverlay);
				}
			}.bind(this));
		}
	};


	/**
	 * @param {string} sAggregationName name of the aggregation
	 * @param {boolean} bSuppressInvalidate suppress invalidate
	 * @protected
	 */
	ElementOverlay.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		Overlay.prototype.destroyAggregation.apply(this, arguments);

		if (sAggregationName === "aggregationOverlays") {
			delete this._mAggregationOverlays;
		}
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onElementModified = function(oEvent) {
		var oParams = oEvent.getParameters();
		var sName = oParams.name;

		if (oParams.type === "propertyChanged" && sName === "visible") {
			this.setRelevantOverlays([]);
			this.fireElementModified(oParams);
		} else if (sName) {
			var oAggregationOverlay = this.getAggregationOverlay(sName);
			if (oAggregationOverlay) {
				this.setRelevantOverlays([]);
				this.fireElementModified(oParams);
			}
		} else if (oEvent.getParameters().type === "setParent") {
			this.fireElementModified(oParams);
		}

		this.invalidate();
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onDomChanged = function(oEvent) {
		var aIds = oEvent.getParameters().elementIds || [];
		var oElement = this.getElementInstance();
		if (oElement && aIds.indexOf(oElement.getId()) !== -1) {
			// if element's DOM turns visible (via DOM mutations, classes and so on)
			if (this._mGeometry && !this._mGeometry.visible) {
				delete this._mGeometry;
				this.invalidate();
			} else if (!this._mGeometry) {
				this.sync();
			}
		}

		// update styles (starting from root and update all overlay children)
		if (this.isRoot()) {
			this.applyStyles();
		}
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._onElementAfterRendering = function() {
		// initial rendering of a UI5 element is not catched with a mutation observer
		if (!this.getDomRef()) {
			this.invalidate();
		}
		// we should sync aggregations onAfterRendering, because elements (or aggregations) might be created invisible
		this.sync();
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
		if (this._mAggregationOverlays) {
			return this._mAggregationOverlays[sAggregationName];
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

	/**
	 * Returns if the overlay's elementInstance is visible in DOM (or is invisible, but consumes screen space, like opacity 0 or visibility hidden)
	 * @private
	 * @return {boolean} if the overlay's elementInstance is editable
	 */
	ElementOverlay.prototype._getElementInstanceVisible = function() {
		var oElement = this.getElementInstance();
		if (oElement) {
			var oGeometry = this.getGeometry();
			return oGeometry && oGeometry.visible;
		} else {
			return false;
		}

	};

	/**
	 * Checks if the associated Element is visible or not. For controls it returns the result of .getVisible,
	 * otherwise it gets the domRef from DesigntimeMetadata and checks $().is(":visible").
	 *
	 * @returns {boolean|undefined} Returns the visibility of the associated Element or undefined, if it is not a control and has no domRef
	 */
	ElementOverlay.prototype.getElementVisibility = function() {
		var oElement = this.getElementInstance();
		if (oElement instanceof sap.ui.core.Control) {
			return oElement.getVisible();
		}
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var fnisVisible = oDesignTimeMetadata && oDesignTimeMetadata.getData().isVisible;
		if (!fnisVisible) {
			return undefined;
		}
		return fnisVisible(this.getElementInstance());
	};

	/**
	 * Returns the relevant container element for this overlay. As default the overlay parent element is returned
	 * @param {boolean} bForParent if true, the relevant container overlay is the overlay itself, if no relevant container is propagated in the designtime
	 * @return {sap.ui.core.Element} Relevant container element
	 * @public
	 */
	ElementOverlay.prototype.getRelevantContainer = function(bForParent) {
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		if (oDesignTimeMetadata &&
			oDesignTimeMetadata.getData().relevantContainer) {
			return oDesignTimeMetadata.getData().relevantContainer;
		} else if (bForParent) {
			return this.getElementInstance();
		}
		// setting the default value to direct parent
		var oParentOverlay = this.getParentElementOverlay();
		return oParentOverlay ? oParentOverlay.getElementInstance() : undefined;
	};

	return ElementOverlay;
}, /* bExport= */ true);
