/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/ControlObserver",
	"sap/ui/dt/ManagedObjectObserver",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/Util",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/base/util/restricted/_intersection",
	"sap/base/util/restricted/_max"
], function(
	BaseObject,
	Overlay,
	OverlayRegistry,
	OverlayUtil,
	ControlObserver,
	ManagedObjectObserver,
	ElementDesignTimeMetadata,
	ElementUtil,
	DOMUtil,
	Util,
	Control,
	jQuery,
	Log,
	isPlainObject,
	merge,
	_intersection,
	_max
) {
	"use strict";

	var S_SCROLLCONTAINER_CLASSNAME = "sapUiDtOverlayScrollContainer";

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
	 */
	var ElementOverlay = Overlay.extend("sap.ui.dt.ElementOverlay", {
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
			aggregations: {
				/**
				 * Stores all aggregation binding template related overlays if available
				 */
				aggregationBindingTemplateOverlays: {
					type: "sap.ui.dt.Overlay",
					multiple: true,
					defaultValue: []
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
				},
				/**
				 * Whether the next KeyUp event on the overlay should be ignored (e.g. for Rename)
				 */
				ignoreEnterKeyUpOnce: {
					type: "boolean",
					defaultValue: false
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
				elementDestroyed: {
					parameters: {
						targetId: "string"
					}
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			this._aMetadataEnhancers = [];
			Overlay.apply(this, aArgs);
		}
	});

	ElementOverlay.prototype.asyncInit = function() {
		return (
			this.getDesignTimeMetadata()
				? Promise.resolve()
				: this._loadDesignTimeMetadata()
		).then(function() {
			this.attachEvent("elementModified", function(oEvent) {
				var oParams = oEvent.getParameters();
				var sName = oParams.name;

				if (oParams.type === "propertyChanged") {
					if (sName === "visible") {
						this.setRelevantOverlays([]);
					}
				} else if (sName) {
					this.setRelevantOverlays([]);
				}
			}, this);

			this._initMutationObserver();
			this._initControlObserver();
		}.bind(this));
	};

	/**
	 * Scroll containers can be dynamic and contain different aggregations depending on the control.
	 * Whenever the definition of a scroll container changes the dom structure has to be updated:
	 * The aggregations have to be moved from the scroll container to the children dom ref of the parent
	 * or vice versa. This automatically triggers an apply styles to properly update the overlays
	 *
	 * @param {object} mProperties - Map of properties
	 * @param {object} mProperties.index - Index of the scrollcontainer
	 */
	ElementOverlay.prototype._updateScrollContainer = function(mProperties) {
		if (this.getShouldBeDestroyed() || this.bIsDestroyed) {
			return;
		}

		var iIndex = mProperties.index;
		var o$ScrollContainer = this.getScrollContainerById(iIndex);
		var oNewScrollContainer = this.getScrollContainers(true)[iIndex];
		var aAggregationsCopy = [].concat(oNewScrollContainer.aggregations);
		var aCurrentScrollContainerChildren = o$ScrollContainer.find(">:not(.sapUiDtDummyScrollContainer)").toArray();

		// first check if the current scroll container content is correct, and if not move it to the children div
		aCurrentScrollContainerChildren.forEach(function(oAggregationNode) {
			var sAggregationName = oAggregationNode.getAttribute("data-sap-ui-dt-aggregation");
			if (oNewScrollContainer.aggregations.includes(sAggregationName)) {
				aAggregationsCopy.splice(aAggregationsCopy.indexOf(sAggregationName), 1);
			} else {
				o$ScrollContainer.get(0).removeChild(oAggregationNode);
				DOMUtil.appendChild(this.getChildrenDomRef(), oAggregationNode);
			}
		}.bind(this));

		// then move the new aggregations to the scroll container
		aAggregationsCopy.forEach(function(sAggregationName) {
			var oAggregationNode = this.getAggregationOverlay(sAggregationName).getDomRef();
			this.getChildrenDomRef().removeChild(oAggregationNode);
			DOMUtil.appendChild(o$ScrollContainer.get(0), oAggregationNode);
		}.bind(this));
	};

	ElementOverlay.prototype._onRootChanged = function(oEvent) {
		var bRootChangedValue = oEvent.getParameter("value");
		this._subscribeToMutationObserver(bRootChangedValue);
	};

	ElementOverlay.prototype._initMutationObserver = function() {
		this._subscribeToMutationObserver(this.isRoot());
		this.attachEvent("isRootChanged", this._onRootChanged, this);
	};

	ElementOverlay.prototype._subscribeToMutationObserver = function(bIsRoot) {
		var oMutationObserver = Overlay.getMutationObserver();

		var $DomRef = this.getAssociatedDomRef();
		this._sObservableNodeId = $DomRef && $DomRef.get(0) && $DomRef.get(0).id;

		if (this._sObservableNodeId) {
			oMutationObserver.registerHandler(this._sObservableNodeId, this._domChangedCallback.bind(this), bIsRoot);
			// Controls like UI5 Web Components have shadow roots that need to be observed as well
			if ($DomRef.get(0).shadowRoot) {
				oMutationObserver.addNode($DomRef.get(0).shadowRoot);
			}
		} else if (bIsRoot) {
			// Needs to be a logged error, otherwise the LayoutEditor isn't working anymore.
			Log.error("sap.ui.dt.ElementOverlay#_subscribeToMutationObserver: please provide a root control with proper domRef and id to ensure that RTA is working properly");
		}
	};

	ElementOverlay.prototype._unsubscribeFromMutationObserver = function() {
		if (this._sObservableNodeId) {
			var oMutationObserver = Overlay.getMutationObserver();
			oMutationObserver.deregisterHandler(this._sObservableNodeId);
			delete this._sObservableNodeId;
		}
	};

	/**
	 * Starts monotoring element with ControlObserver
	 * @private
	 */
	ElementOverlay.prototype._initControlObserver = function() {
		if (this.getElement() instanceof Control) {
			this._oObserver = new ControlObserver({
				target: this.getElement(),
				aggregations: this.getAggregationNames()
			});
		} else {
			this._oObserver = new ManagedObjectObserver({
				target: this.getElement(),
				aggregations: this.getAggregationNames()
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

	ElementOverlay.prototype._getAttributes = function(...aArgs) {
		return merge(
			{},
			Overlay.prototype._getAttributes.apply(this, aArgs),
			{
				"data-sap-ui-dt-for": this.getElement().getId(),
				draggable: this.getMovable()
			}
		);
	};

	ElementOverlay.prototype.render = function(...aArgs) {
		this.addStyleClass("sapUiDtElementOverlay");
		return Overlay.prototype.render.apply(this, aArgs);
	};

	/**
	 * Called when the ElementOverlay is destroyed
	 * @protected
	 */
	ElementOverlay.prototype.exit = function(...aArgs) {
		this._unsubscribeFromMutationObserver();
		this._destroyControlObserver();

		if (this._iApplyStylesRequest) {
			window.cancelAnimationFrame(this._iApplyStylesRequest);
		}

		Overlay.prototype.exit.apply(this, aArgs);
	};

	ElementOverlay.prototype._loadDesignTimeMetadata = function() {
		return this.getElement().getMetadata().loadDesignTime(this.getElement(), this.getMetadataScope())
		.then(function(mDesignTimeMetadata) {
			var oElement = this.getElement();

			// if element is destroyed during designtime metadata loading
			if (!oElement || oElement.bIsDestroyed) {
				throw Util.createError(
					"ElementOverlay#loadDesignTimeMetadata",
					"Can't set metadata to overlay which element has been destroyed already"
				);
			}

			this.setDesignTimeMetadata(mDesignTimeMetadata);
		}.bind(this))
		.catch(function(vError) {
			throw Util.propagateError(
				vError,
				"ElementOverlay#loadDesignTimeMetadata",
				// Can't use this.getElement(), because the element might be destroyed already
				`Can't load designtime metadata data for overlay with id='${this.getId()}', element id='${this.getAssociation("element")}': ${Util.wrapError(vError).message}`
			);
		}.bind(this));
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype._setPosition = function(...aArgs) {
		const [, , , bForceScrollbarSync] = aArgs;
		// Apply Overlay position first, then extra logic based on this new position
		Overlay.prototype._setPosition.apply(this, aArgs);

		this.getScrollContainers().forEach(function(mScrollContainer, iIndex) {
			// TODO: write Unit test for the case when getAssociatedDomRef() returns undefined (domRef func returns undefined)
			var $ScrollContainerDomRef = this.getDesignTimeMetadata().getAssociatedDomRef(
				this.getElement(),
				mScrollContainer.domRef
			) || jQuery();
			var $ScrollContainerOverlayDomRef = this.getScrollContainerById(iIndex);

			if ($ScrollContainerDomRef.length) {
				var oScrollContainerDomRef = $ScrollContainerDomRef.get(0);
				var mScrollContainerGeometry = DOMUtil.getGeometry(oScrollContainerDomRef);
				this._ensureVisibility($ScrollContainerOverlayDomRef);
				this._setSize($ScrollContainerOverlayDomRef, mScrollContainerGeometry);
				Overlay.prototype._setPosition.call(this, $ScrollContainerOverlayDomRef, mScrollContainerGeometry, this.$());
				this._handleOverflowScroll(mScrollContainerGeometry, $ScrollContainerOverlayDomRef, this, bForceScrollbarSync);
				this._setZIndex(mScrollContainerGeometry, $ScrollContainerOverlayDomRef);
				this._setClipPath($ScrollContainerOverlayDomRef, $ScrollContainerDomRef);
			} else {
				$ScrollContainerOverlayDomRef.css("display", "none");
			}
		}, this);
	};

	ElementOverlay.prototype._applySizes = function(...aArgs) {
		return Overlay.prototype._applySizes.apply(this, aArgs)
		.then(function() {
			this._sortChildren(this.getChildrenDomRef());
			if (!this.bIsDestroyed) {
				this.getScrollContainers().forEach(function(mScrollContainer, iIndex) {
					var $ScrollContainerDomRef = this.getDesignTimeMetadata().getAssociatedDomRef(this.getElement(), mScrollContainer.domRef) || jQuery();
					var $ScrollContainerOverlayDomRef = this.getScrollContainerById(iIndex);

					if ($ScrollContainerDomRef.length) {
						this._sortChildren($ScrollContainerOverlayDomRef.get(0));
					}
				}, this);
			}
		}.bind(this));
	};

	/**
	 * Sorts children DOM Nodes in their visual order
	 * @param {object} oContainer - Container object whose children should be sorted
	 * @private
	 */
	ElementOverlay.prototype._sortChildren = function(oContainer) {
		// compares two DOM Nodes and returns 1, if first child should be bellow in dom order
		function compareChildren(oChild1, oChild2) {
			var oGeometry1 = DOMUtil.getGeometry(oChild1);
			var oGeometry2 = DOMUtil.getGeometry(oChild2);
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
					}

					return -1; // do not switch order
				} else if (oPosition1.top === oPosition2.top) {
					if (oPosition1.left === oPosition2.left) {
						// Give priority to smaller block by height or width
						if (
							oGeometry1.size.height < oGeometry2.size.height
							|| oGeometry1.size.width < oGeometry2.size.width
						) {
							return -1;
						} else if (
							oGeometry1.size.height > oGeometry2.size.height
							|| oGeometry1.size.width > oGeometry2.size.width
						) {
							return 1;
						}
						return 0;
					} else if (oPosition1.left < oPosition2.left) {
						return -1; // order is correct
					}
					return 1; // switch order
				} else if (iBottom1 <= iBottom2 && oPosition2.left > oPosition1.left) { // if (oPosition1.top > oPosition2.top)
					/* see picture above, but switch 1 and 2 - order is correct */
					return -1;
				}
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
			return 0;
		}

		// Exclude dummy scroll containers, because, e.g. in Safari, scrollbar synchronizations on ObjectPage sometimes
		// drops into in different event loops (JS execution cycles) which leads to invalid intermediate position
		// on the screen with following sorting. That said, sorting happens for intermediate state and then for real
		// state of the elements in viewport once again. Thus, excluding these elements allow us to avoid 2 extra sortings.
		var aChildren = jQuery(oContainer).find(">:not(.sapUiDtDummyScrollContainer)").toArray();
		var aSorted = aChildren.slice().sort(compareChildren);

		var bOrderChanged = aChildren.some(function(oChild, iIndex) {
			return oChild !== aSorted[iIndex];
		});

		if (bOrderChanged) {
			aSorted.forEach(function(oChild) {
				DOMUtil.appendChild(oContainer, oChild);
			});
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
					Log.error("sap.ui.dt.ElementOverlay: overlay is already rendered and can\'t be placed in overlay container. Isn\'t it already there?");
				}
			} else {
				Log.error("sap.ui.dt.ElementOverlay: it\'s not possible to place overlay inside overlay container while it\'s part of some hierarchy");
			}
		} else {
			Log.error('sap.ui.dt.ElementOverlay: overlay is not ready yet. Please wait until "init" event happens');
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

		if (typeof vDesignTimeMetadata === "function") {
			if (!oDesignTimeMetadata) {
				// add to stack
				this._aMetadataEnhancers = this._aMetadataEnhancers.concat(vDesignTimeMetadata);
			} else {
				oDesignTimeMetadata.setData(
					vDesignTimeMetadata(
						merge({}, oDesignTimeMetadata.getData())
					)
				);
				return;
			}
		} else if (vDesignTimeMetadata instanceof ElementDesignTimeMetadata) {
			oDesignTimeMetadata = vDesignTimeMetadata;
		} else if (isPlainObject(vDesignTimeMetadata)) {
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
	 * @param {boolean} bInvalidate - Indicates if the scroll container should be invalidated first
	 * @returns {object[]} Array with the scroll container's description
	 */
	ElementOverlay.prototype.getScrollContainers = function(bInvalidate) {
		return this.getDesignTimeMetadata().getScrollContainers(this.getElement(), bInvalidate, this._updateScrollContainer.bind(this));
	};

	/**
	 * Renders children of the current overlay
	 * @return {jQuery[]} - returns array of children DOM Nodes each wrapped into jQuery object.
	 * @private
	 */
	ElementOverlay.prototype._renderChildren = function(...aArgs) {
		var a$Children = Overlay.prototype._renderChildren.apply(this, aArgs);

		this.getScrollContainers().forEach(function(mScrollContainer, iIndex) {
			var $ScrollContainer = jQuery("<div></div>", {
				"class": S_SCROLLCONTAINER_CLASSNAME,
				"data-sap-ui-dt-scrollContainerIndex": iIndex
			});

			if (mScrollContainer.aggregations) {
				_intersection( // filters ignored aggregations
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
	 * Gets DOM Node of the scroll container by its ID
	 * @param {number} iIndex - index of the scroll container
	 * @return {jQuery} - returns DOM Node of scroll container by its index
	 */
	ElementOverlay.prototype.getScrollContainerById = function(iIndex) {
		return jQuery(this.getChildrenDomRef()).find(`>.${S_SCROLLCONTAINER_CLASSNAME}[data-sap-ui-dt-scrollcontainerindex="${iIndex}"]`);
	};

	/**
	 * Returns a jQuery Object reference for the associated Element or undefined, if it can't be found
	 * @return {jQuery} jQuery object or undefined
	 * @public
	 */
	ElementOverlay.prototype.getAssociatedDomRef = function() {
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var vDomRef = oDesignTimeMetadata.getDomRef();
		var oDomRef = oDesignTimeMetadata.getAssociatedDomRef(this.getElement(), vDomRef);
		oDomRef ||= ElementUtil.getDomRef(this.getElement());

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
			this.fireSelectableChange({selectable: bSelectable});
		}
		this.setFocusable(bSelectable);
		return this;
	};

	/**
	 * Sets whether the ElementOverlay is selected and toggles corresponding css class
	 * @param {boolean} bSelected if the ElementOverlay is selected
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setSelected = function(bSelected) {
		bSelected = !!bSelected;
		if (this.isSelectable() && bSelected !== this.isSelected()) {
			this.setProperty("selected", bSelected);
			this.toggleStyleClass("sapUiDtOverlaySelected", bSelected);

			var mAggregationBindingInfo = OverlayUtil.getClosestBoundControl(this);
			if (mAggregationBindingInfo.overlayId) {
				var oBoundOverlay = OverlayRegistry.getOverlay(mAggregationBindingInfo.overlayId);
				highlightTemplateCloneElements(mAggregationBindingInfo, oBoundOverlay);
			}

			this.fireSelectionChange({
				selected: bSelected
			});
		}

		return this;
	};

	function highlightTemplateCloneElements(mAggregationBindingInfo, oElementOverlay, iStackIndex) {
		iStackIndex = iStackIndex === undefined ? mAggregationBindingInfo.stack.length - 1 : iStackIndex;
		var mStackEntry = mAggregationBindingInfo.stack[iStackIndex];
		var bLastStackEntry = iStackIndex === 0;
		var bTemplateSelected = mAggregationBindingInfo.stack.length === 1;
		if (mStackEntry) {
			oElementOverlay.getChildren().forEach(function(oChildAggregationOverlay) {
				if (oChildAggregationOverlay.getAggregationName() === mStackEntry.aggregation) {
					oChildAggregationOverlay.getChildren().some(function(oChildElementOverlay, iIndex) {
						if (bLastStackEntry && bTemplateSelected) {
							oChildElementOverlay.toggleStyleClass("sapUiDtOverlayHighlighted");
						} else if (bLastStackEntry && iIndex === mStackEntry.index) {
							oChildElementOverlay.toggleStyleClass("sapUiDtOverlayHighlighted");
							return true;
						} else if (!bLastStackEntry) {
							highlightTemplateCloneElements(mAggregationBindingInfo, oChildElementOverlay, iStackIndex - 1);
						}
						return undefined;
					});
				}
			});
		}
	}

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
			this.fireMovableChange({movable: bMovable});

			this.$()[bMovable ? "attr" : "removeAttr"]("draggable", bMovable);
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
			this.fireEditableChange({
				editable: bEditable
			});
		}

		return this;
	};

	/**
	 * Gets "active" aggregations names
	 * @returns {string[]} - aggregation names
	 */
	ElementOverlay.prototype.getAggregationNames = function() {
		var oElement = this.getElement();
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var mAggregations = oElement.getMetadata().getAllAggregations();

		return []
		.concat(Object.keys(mAggregations), Object.keys(oDesignTimeMetadata.getAggregations()))
		.filter(function(sAggregationName, iIndex, aSource) {
			return (
				iIndex === aSource.indexOf(sAggregationName) // remove duplicates
					&& !oDesignTimeMetadata.isAggregationIgnored(oElement, sAggregationName)
			);
		});
	};

	/**
	 * Event handler for "childAdded" event on aggregation overlays
	 * @param {sap.ui.base.Event} oEvent - event object
	 */
	ElementOverlay.prototype._onChildAdded = function(oEvent) {
		var oAggregationOverlay = oEvent.getSource();
		if (this.isRendered() && !oAggregationOverlay.isRendered()) {
			var $Target = (
				Util.isInteger(oAggregationOverlay.getScrollContainerId())
					? this.getScrollContainerById(oAggregationOverlay.getScrollContainerId())
					: jQuery(this.getChildrenDomRef())
			);
			$Target.append(oAggregationOverlay.render());
		}
	};

	/**
	 * There are cases where the aggregation overlay is not yet rendered (because it had no children)
	 * and a new child is added to that aggregation. We then render the aggregation here.
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay - The aggregation overlay where the child is being added.
	 */
	ElementOverlay.prototype.addChild = function(...aArgs) {
		const [oAggregationOverlay] = aArgs;
		// Since we can't check whether the listener was attached before or not, we re-attach it to avoid multiple listeners
		oAggregationOverlay.detachChildAdded(this._onChildAdded, this);
		oAggregationOverlay.attachChildAdded(this._onChildAdded, this);

		Overlay.prototype.addChild.apply(this, aArgs);
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onElementModified = function(oEvent) {
		if (oEvent.getParameters().type === "afterRendering") {
			this._subscribeToMutationObserver(this.isRoot());
			this._oScrollbarSynchronizers.forEach(function(oScrollbarSynchronizer) {
				oScrollbarSynchronizer.refreshListeners();
			});
		}
		this.fireElementModified(oEvent.getParameters());
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._domChangedCallback = function(mParameters) {
		mParameters.targetOverlay = this;
		if (this.isReady()) {
			// FIXME: temporal solution for cancel not relevant mutation. Should be finally done in the TaskManager
			if (this._iApplyStylesRequest) {
				window.cancelAnimationFrame(this._iApplyStylesRequest);
			}
			this._iApplyStylesRequest = window.requestAnimationFrame(function() {
				// Cache the geometry values
				this.getGeometry(true);
				mParameters.bSkipForceCalculation = true;
				this.fireApplyStylesRequired(mParameters);
				delete this._iApplyStylesRequest;
			}.bind(this));
		}
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._onElementDestroyed = function(oEvent) {
		var sElementId = oEvent.getSource().getTarget();
		this.fireElementDestroyed({targetId: sElementId});
		if (this._bInit) {
			this.destroy();
		} else {
			this._bShouldBeDestroyed = true;
		}
	};

	/**
	 * Returns AggregationOverlay the public aggregations of the associated Element by aggregation name
	 * @param {string} sAggregationName - Name of the aggregation
	 * @param {string} sAggregationType - Type of the aggregation
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlay for the aggregation
	 * @public
	 */
	ElementOverlay.prototype.getAggregationOverlay = function(sAggregationName, sAggregationType) {
		var sGetterFunction = `get${sAggregationType || "Children"}`;
		return this[sGetterFunction]().filter(function(oAggregationOverlay) {
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
		return undefined;
	};

	/**
	 * Returns closest AggregationOverlay ancestor of this ElementOverlay or null, if no parent AggregationOverlay exists
	 * @return {sap.ui.dt.AggregationOverlay} AggregationOverlay parent, which contains this ElementOverlay
	 * @public
	 */
	ElementOverlay.prototype.getParentAggregationOverlay = function() {
		var oParentAggregationOverlay = this.getParent();
		return BaseObject.isA(oParentAggregationOverlay, "sap.ui.dt.AggregationOverlay") ? oParentAggregationOverlay : null;
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
		}
		return false;
	};

	/**
	 * Checks if the associated Element is visible or not. For controls it returns the result of .getVisible,
	 * otherwise it gets the domRef from DesigntimeMetadata and checks visibility in the DOM.
	 *
	 * @returns {boolean|undefined} Returns the visibility of the associated Element or undefined, if it is not a control and has no domRef
	 */
	ElementOverlay.prototype.getElementVisibility = function() {
		var oElement = this.getElement();
		if (oElement instanceof Control) {
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
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var oDTData = oDesignTimeMetadata.getData();

		if (oDesignTimeMetadata.isIgnored(oElement)) {
			bVisible = false;
		} else if (typeof oDTData.isVisible === "function") {
			bVisible = oDTData.isVisible(oElement);
		} else {
			var oGeometry = this.getGeometry();
			if (oGeometry) {
				bVisible = oGeometry.visible;
			} else if (oElement instanceof Control) {
				bVisible = !!oElement.getDomRef() && oElement.getVisible();
			}
		}

		return bVisible;
	};

	ElementOverlay.prototype.isVisible = function(...aArgs) {
		return (
			Overlay.prototype.isVisible.apply(this, aArgs)
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

	ElementOverlay.prototype._hasSameSize = function(mScrollContainerGeometry, sType) {
		var aScrollContainers = this.getScrollContainers();
		var iSize;

		if (aScrollContainers.length) {
			iSize = _max(
				aScrollContainers.map(function(mScrollContainer, iIndex) {
					var mGeometry = DOMUtil.getGeometry(this.getScrollContainerById(iIndex).get(0));
					return mGeometry.size[sType];
				}, this)
			);
		} else {
			iSize = this.getGeometry().size[sType];
		}

		return mScrollContainerGeometry.size[sType] === iSize;
	};

	return ElementOverlay;
});