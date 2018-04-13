/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ElementOverlay.
sap.ui.define([
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ControlObserver',
	'sap/ui/dt/ManagedObjectObserver',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/DOMUtil',
	'sap/ui/dt/Util',
	'sap/ui/core/Control'
],
function(
	Overlay,
	ControlObserver,
	ManagedObjectObserver,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementUtil,
	OverlayUtil,
	DOMUtil,
	Util,
	Control
) {
	"use strict";

	var S_SCROLLCONTAINER_CLASSNAME = 'sapUiDtOverlayScrollContainer';

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
		metadata: {
			library: "sap.ui.dt",
			associations: {
				/**
				 * Array of plugins that set editable to true
				 */
				editableByPlugins: {
					type: "any[]",
					multiple: true,
					singularName: "editableByPlugin"
				}
			},
			properties: {
				/**
				 * Whether the ElementOverlay is selected
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Whether the ElementOverlay is selectable, per default this implicitly makes the overlay focusable (TODO discuss)
				 */
				selectable: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Whether the ElementOverlay is movable
				 */
				movable: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Whether the ElementOverlay is editable
				 */
				editable: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * All overlays inside the relevant container within the same aggregations
				 */
				relevantOverlays: {
					type: "any[]",
					defaultValue: []
				},

				metadataScope: {
					type: "string"
				}
			},
			events: {
				/**
				 * Event fired when the property "Selection" is changed
				 */
				selectionChange: {
					parameters: {
						selected: { type: "boolean" }
					}
				},
				/**
				 * Event fired when the property "Movable" is changed
				 */
				movableChange: {
					parameters: {
						movable: { type: "boolean" }
					}
				},
				/**
				 * Event fired when the property "Selectable" is changed
				 */
				selectableChange: {
					parameters: {
						selectable: { type: "boolean" }
					}
				},
				/**
				 * Event fired when the property "Editable" is changed
				 */
				editableChange: {
					parameters: {
						editable: { type: "boolean" }
					}
				},
				/**
				 * Event fired when the associated Element is modified
				 */
				elementModified: {
					parameters: {
						type: "string",
						name: "string",
						value: "any",
						oldValue: "any",
						target: "sap.ui.core.Element"
					}
				},
				/**
				 * Event fired when the associated Element is destroyed
				 */
				elementDestroyed : {
					parameters: {
						targetId: "string"
					}
				}
			}
		},
		constructor: function () {
			this._aMetadataEnhancers = [];
			Overlay.apply(this, arguments);
		}
	});

	ElementOverlay.prototype.asyncInit = function () {
		return (
			this.getDesignTimeMetadata()
			? Promise.resolve()
			: this._loadDesignTimeMetadata()
		).then(function () {
			this._initMutationObserver();
			this._initControlObserver();
		}.bind(this));

	};

	ElementOverlay.prototype._initMutationObserver = function () {
		if (this.isRoot()) {
			this._subscribeToMutationObserver();
		}

		this.attachEvent('isRootChanged', function (oEvent) {
			if (oEvent.getParameter('value')) {
				this._subscribeToMutationObserver();
			} else {
				this._unsubscribeFromMutationObserver();
			}
		}, this);
	};

	ElementOverlay.prototype._subscribeToMutationObserver = function () {
		var oMutationObserver = Overlay.getMutationObserver();
		oMutationObserver.addToWhiteList(this.getElement().getId());
		oMutationObserver.attachDomChanged(this._onDomChanged, this);
	};

	ElementOverlay.prototype._unsubscribeFromMutationObserver = function () {
		var oMutationObserver = Overlay.getMutationObserver();
		oMutationObserver.removeFromWhiteList(this.getAssociation('element'));
		oMutationObserver.detachDomChanged(this._onDomChanged, this);
	};

	/**
	 * Starts monotoring element with ControlObserser
	 * @private
	 */
	ElementOverlay.prototype._initControlObserver = function() {
		if (this.getElement() instanceof Control) {
			this._oObserver = new ControlObserver({
				target: this.getElement()
			});
		} else {
			this._oObserver = new ManagedObjectObserver({
				target: this.getElement()
			});
		}
		this._oObserver.attachModified(this._onElementModified, this);
		this._oObserver.attachDestroyed(this._onElementDestroyed, this);
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._destroyControlObserver = function() {
		if (this._oObserver) {
			this._oObserver.destroy();
		}
	};

	ElementOverlay.prototype._getAttributes = function () {
		return jQuery.extend(
			true,
			{},
			Overlay.prototype._getAttributes.apply(this, arguments),
			{
				"data-sap-ui-dt-for": this.getElement().getId(),
				"draggable": this.getMovable()
			}
		);
	};

	ElementOverlay.prototype.render = function () {
		this.addStyleClass('sapUiDtElementOverlay');
		return Overlay.prototype.render.apply(this, arguments);
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
	ElementOverlay.prototype.exit = function () {
		this._unsubscribeFromMutationObserver();
		this._destroyControlObserver();

		if (this._iApplyStylesRequest) {
			window.cancelAnimationFrame(this._iApplyStylesRequest);
		}

		Overlay.prototype.exit.apply(this, arguments);
	};

	ElementOverlay.prototype._loadDesignTimeMetadata = function () {
		return this.getElement().getMetadata().loadDesignTime(this.getElement(), this.getMetadataScope())
			.then(function(mDesignTimeMetadata) {
				var oElement = this.getElement();

				// if element is destroyed during designtime metadata loading
				if (!oElement || oElement.bIsDestroyed) {
					new Error("sap.ui.dt.ElementOverlay#loadDesignTimeMetadata / Can't set metadata to overlay which element has been destroyed already");
				}

				this.setDesignTimeMetadata(mDesignTimeMetadata);
			}.bind(this))
			.catch(function (vError) {
				var oError = Util.wrapError(vError);

				// adding payload for external errors
				if (Util.isForeignError(oError)) {
					var sLocation = 'sap.ui.dt.ElementOverlay#loadDesignTimeMetadata';
					oError.name = 'Error in ' + sLocation;
					oError.message = Util.printf(
						"{0} / Can't load designtime metadata data for overlay with id='{1}', element id='{2}' ({3}): {4}",
						sLocation,
						this.getId(),
						this.getElement().getId(),
						this.getElement().getMetadata().getName(),
						oError.message
					);
				}

				throw oError;
			}.bind(this));
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype._setPosition = function() {
		// Apply Overlay position first, then extra logic based on this new position
		Overlay.prototype._setPosition.apply(this, arguments);

		this._sortAggregationOverlaysInDomOrder();

		this.getScrollContainers().forEach(function(mScrollContainer, iIndex) {
			// TODO: write Unit test for the case when getAssociatedDomRef() returns undefined (domRef func returns undefined)
			var $ScrollContainerDomRef = this.getDesignTimeMetadata().getAssociatedDomRef(this.getElement(), mScrollContainer.domRef) || jQuery();
			var $ScrollContainerOverlayDomRef = this.getScrollContainerByIndex(iIndex);

			if ($ScrollContainerDomRef.length) {
				var oScrollContainerDomRef = $ScrollContainerDomRef.get(0);
				this._setSize($ScrollContainerOverlayDomRef, DOMUtil.getGeometry(oScrollContainerDomRef));
				Overlay.prototype._setPosition.call(this, $ScrollContainerOverlayDomRef, DOMUtil.getGeometry(oScrollContainerDomRef), this.$());
				this._handleOverflowScroll(DOMUtil.getGeometry(oScrollContainerDomRef), $ScrollContainerOverlayDomRef, this);
			} else {
				this._deleteDummyContainer($ScrollContainerOverlayDomRef);
				$ScrollContainerOverlayDomRef.css("display", "none");
			}
		}, this);
	};

	/**
	 * Sorts aggregation overlays in their visual order
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
				} else if (oPosition1.top === oPosition2.top) {
					if (oPosition1.left === oPosition2.left) {
						return 0;
					} else if (oPosition1.left < oPosition2.left) {
						return -1; // order is correct
					} else {
						return 1; // switch order
					}
				} else if (iBottom1 <= iBottom2 && oPosition2.left > oPosition1.left) { // if (oPosition1.top > oPosition2.top)
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
			return 0;
		};

		// filter our un-rendered children, e.g. aggregations without children themselves (see AggregationOverlay@render method)
		var aChildrenRendered = [];
		var aChildrenRest = [];

		this.getChildren().forEach(function (oChild) {
			if (oChild.isReady()) {
				aChildrenRendered.push(oChild);
			} else {
				aChildrenRest.push(oChild);
			}
		});

		if (aChildrenRendered.length) {
			var aSortedAggregationOverlays = aChildrenRendered.slice().sort(fnCompareAggregations);

			var bOrderSwitched = aChildrenRendered.some(function(oOverlay, iIndex) {
				return oOverlay.getId() !== aSortedAggregationOverlays[iIndex].getId();
			});

			if (bOrderSwitched) {
				this.removeAllAggregation("children");
				aSortedAggregationOverlays
					.concat(aChildrenRest)
					.forEach(function(oAggregationOverlay) {
						this.addChild(oAggregationOverlay);
					}.bind(this));
			}
		}

	};

	/**
	 * Places this ElementOverlay in an overlay container, which causes a rendering only if overlay wasn't rendered before
	 * Overlay won't be visible without a call of this method
	 * @public
	 */
	ElementOverlay.prototype.placeInOverlayContainer = function() {
		if (this._bInit) {
			if (this.isRoot()) {
				if (!this.isRendered()) {
					Overlay.getOverlayContainer().append(this.render());
					this.applyStyles();
				} else {
					jQuery.sap.log.error('sap.ui.dt.ElementOverlay: overlay is already rendered and can\'t be placed in overlay container. Isn\'t it already there?');
				}
			} else {
				jQuery.sap.log.error('sap.ui.dt.ElementOverlay: it\'s not possible to place overlay inside overlay container while it\'s part of some hierarchy');
			}
		} else {
			jQuery.sap.log.error('sap.ui.dt.ElementOverlay: overlay is not ready yet. Please wait until "init" event happens');
		}
	};

	/**
	 * Setter accepts enhancer functions which is called on current metadata object and if it's not available yet, this
	 * call will be delayed until it's available.
	 * @override
	 */
	ElementOverlay.prototype.setDesignTimeMetadata = function(vDesignTimeMetadata) {
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var mDesignTimeMetadata;

		if (jQuery.isFunction(vDesignTimeMetadata)) {
			if (!oDesignTimeMetadata) {
				// add to stack
				this._aMetadataEnhancers = this._aMetadataEnhancers.concat(vDesignTimeMetadata);
			} else {
				oDesignTimeMetadata.setData(
					vDesignTimeMetadata(
						jQuery.sap.extend(true, {}, oDesignTimeMetadata.getData())
					)
				);
				return;
			}
		} else if (vDesignTimeMetadata instanceof ElementDesignTimeMetadata) {
			oDesignTimeMetadata = vDesignTimeMetadata;
		} else if (jQuery.isPlainObject(vDesignTimeMetadata)) {
			mDesignTimeMetadata = vDesignTimeMetadata;

			// enhance metadata by custom functions
			var fnEnhancer;
			while (fnEnhancer = this._aMetadataEnhancers.shift()) { // eslint-disable-line no-cond-assign
				mDesignTimeMetadata = fnEnhancer.call(this, mDesignTimeMetadata);
			}

			oDesignTimeMetadata = new ElementDesignTimeMetadata({
				data: mDesignTimeMetadata
			});
		}

		if (oDesignTimeMetadata) {
			Overlay.prototype.setDesignTimeMetadata.call(this, oDesignTimeMetadata);
		}
	};

	/**
	 * Gets information about scroll containers from DesignTime metadata
	 * @returns {object[]} - returns an array with scroll containers description
	 */
	ElementOverlay.prototype.getScrollContainers = function () {
		return this.getDesignTimeMetadata().getScrollContainers();
	};

	/**
	 * Renders children of the current overlay
	 * @return {jQuery[]} - returns array of children DOM Nodes each wrapped into jQuery object.
	 * @private
	 */
	ElementOverlay.prototype._renderChildren = function () {
		var a$Children = Overlay.prototype._renderChildren.apply(this, arguments);

		this.getScrollContainers().forEach(function (mScrollContainer, iIndex) {
			var $ScrollContainer = jQuery("<div/>", {
				"class": S_SCROLLCONTAINER_CLASSNAME,
				"data-sap-ui-dt-scrollContainerIndex": iIndex
			});

			if (mScrollContainer.aggregations) {
				Util.intersection( // filters ignored aggregations
					mScrollContainer.aggregations,
					this.getAggregationNames()
				).forEach(function(sAggregationName) {
					var oAggregationOverlay = this.getAggregationOverlay(sAggregationName);
					var iAggregationOverlayIndex = a$Children.indexOf(oAggregationOverlay.$());
					oAggregationOverlay.setScrollContainerId(iIndex);
					$ScrollContainer.append(a$Children[iAggregationOverlayIndex]);
					a$Children.splice(iAggregationOverlayIndex, 1);
				}, this);
			}

			a$Children.push($ScrollContainer);
		}, this);

		return a$Children;
	};

	/**
	 * Gets DOM Node of the scroll container by its index
	 * @param {number} iIndex - index of the scroll container
	 * @return {jQuery} - returns DOM Node of scroll container by its index
	 */
	ElementOverlay.prototype.getScrollContainerByIndex = function (iIndex) {
		return this._$children.find('>.' + S_SCROLLCONTAINER_CLASSNAME).eq(iIndex);
	};

	/**
	 * Returns a jQuery Object reference for the associated Element or undefined, if it can't be found
	 * @return {jQuery} jQuery object or undefined
	 * @public
	 */
	ElementOverlay.prototype.getAssociatedDomRef = function() {
		var oDomRef = ElementUtil.getDomRef(this.getElement());
		if (!oDomRef) {
			var oDesignTimeMetadata = this.getDesignTimeMetadata();
			if (!oDesignTimeMetadata) {
				return undefined;
			}
			var fnGetDomRef = oDesignTimeMetadata.getDomRef();
			if (typeof fnGetDomRef === "function") {
				oDomRef = fnGetDomRef(this.getElement());
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

			this.$()[bMovable ? 'attr' : 'removeAttr']('draggable', bMovable);
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
	 * Gets "active" aggregations names
	 * @returns {string[]} - aggregation names
	 */
	ElementOverlay.prototype.getAggregationNames = function () {
		var oElement = this.getElement();
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var mAggregations = oElement.getMetadata().getAllAggregations();

		return []
			.concat(Object.keys(mAggregations), Object.keys(oDesignTimeMetadata.getAggregations()))
			.filter(function (sAggregationName, iIndex, aSource) {
				return (
					iIndex === aSource.indexOf(sAggregationName) // remove duplicates
					&& !oDesignTimeMetadata.isAggregationIgnored(oElement, sAggregationName)
				);
			});
	};

	/**
	 * There are cases where the aggregation overlay is not yet rendered (because it had no children)
	 * and a new child is added to that aggregation. We then render the aggregation here.
	 * @param {sap.ui.dt.AggregationOverlay} oTargetAggregationOverlay The aggregation overlay where the child is being added.
	 */
	ElementOverlay.prototype.addChild = function (oTargetAggregationOverlay) {
		oTargetAggregationOverlay.attachChildAdded(function (oEvent) {
			var oAggregationOverlay = oEvent.getSource();
			if (this._bRendered && !oAggregationOverlay._bRendered) {
				this.$().find('>.sapUiDtOverlayChildren').append(oAggregationOverlay.render());
			}
		}, this);

		Overlay.prototype.addChild.apply(this, arguments);
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

		// FIXME: applyStyles() ?
		this.invalidate();
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onDomChanged = function(oEvent) {
		// FIXME: instead of checking isReady subscribe on DOM changes when overlay is ready
		if (this.isReady() && this.isRoot()) {
			if (this._iApplyStylesRequest) {
				window.cancelAnimationFrame(this._iApplyStylesRequest);
			}
			this._iApplyStylesRequest = window.requestAnimationFrame(function () {
				this.applyStyles();
				delete this._iApplyStylesRequest;
			}.bind(this));
		}
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._onElementDestroyed = function(oEvent) {
		var sElementId = oEvent.getSource().getTarget();
		this.fireElementDestroyed({targetId : sElementId});
		if (this._bInit) {
			this.destroy();
		} else {
			this._bShouldBeDestroyed = true;
		}
	};

	/**
	 * TODO: remove method after all usage
	 * Returns AggregationOverlays created for the public aggregations of the associated Element
	 * @return {sap.ui.dt.AggregationOverlay[]} array of the AggregationOverlays
	 * @deprecated
	 */
	ElementOverlay.prototype.getAggregationOverlays = function() {
		return this.getAggregation("children") || [];
	};

	/**
	 * Returns AggregationOverlay the public aggregations of the associated Element by aggregation name
	 * @param {string} sAggregationName name of the aggregation
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlays for the aggregation
	 * @public
	 */
	ElementOverlay.prototype.getAggregationOverlay = function(sAggregationName) {
		return this.getChildren().filter(function (oAggregationOverlay) {
			return oAggregationOverlay.getAggregationName() === sAggregationName;
		}).pop();
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
		var oElement = this.getElement();
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
		var oElement = this.getElement();
		if (oElement instanceof sap.ui.core.Control) {
			return oElement.getVisible();
		}
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var fnisVisible = oDesignTimeMetadata && oDesignTimeMetadata.getData().isVisible;
		if (!fnisVisible) {
			return undefined;
		}
		return fnisVisible(this.getElement());
	};

	ElementOverlay.prototype.isElementVisible = function() {
		var oElement = this.getElement();
		var bVisible = false;

		if (this.getDesignTimeMetadata().isIgnored(oElement)) {
			bVisible = false;
		} else {
			var oGeometry = this.getGeometry(true);
			if (oGeometry) {
				bVisible = oGeometry.visible;
			} else if (jQuery.isFunction(this.getDesignTimeMetadata().getData().isVisible)) {
				bVisible = this.getDesignTimeMetadata().getData().isVisible(oElement);
			} else if (oElement instanceof Control) {
				bVisible = !!oElement.getDomRef() && oElement.getVisible();
			}
		}

		return bVisible;
	};

	ElementOverlay.prototype.isVisible = function () {
		return (
			Overlay.prototype.isVisible.apply(this, arguments)
			&& this.isElementVisible()
		);
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
			return this.getElement();
		}
		// setting the default value to direct parent
		var oParentOverlay = this.getParentElementOverlay();
		return oParentOverlay ? oParentOverlay.getElement() : undefined;
	};

	return ElementOverlay;
}, /* bExport= */ true);
