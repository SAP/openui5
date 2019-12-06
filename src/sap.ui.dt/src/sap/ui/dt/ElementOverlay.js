/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/Overlay",
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
],
function (
	Overlay,
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
			this.attachEvent("elementModified", function (oEvent) {
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

	ElementOverlay.prototype._onRootChanged = function (oEvent) {
		var bRootChangedValue = oEvent.getParameter('value');
		this._subscribeToMutationObserver(bRootChangedValue);
	};

	ElementOverlay.prototype._initMutationObserver = function () {
		this._subscribeToMutationObserver(this.isRoot());
		this.attachEvent('isRootChanged', this._onRootChanged, this);
	};

	ElementOverlay.prototype._subscribeToMutationObserver = function (bIsRoot) {
		var oMutationObserver = Overlay.getMutationObserver();
		var $DomRef = this.getAssociatedDomRef();
		this._sObservableNodeId = $DomRef && $DomRef.get(0) && $DomRef.get(0).id;

		if (this._sObservableNodeId) {
			oMutationObserver.registerHandler(this._sObservableNodeId, this._domChangedCallback.bind(this), bIsRoot);
		} else if (bIsRoot) {
			throw Util.createError(
				'ElementOverlay#_subscribeToMutationObserver',
				'Please provide a root control with proper domRef and id to ensure that DesignTime is working properly'
			);
		}
	};

	ElementOverlay.prototype._unsubscribeFromMutationObserver = function () {
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

	ElementOverlay.prototype._getAttributes = function () {
		return merge(
			{},
			Overlay.prototype._getAttributes.apply(this, arguments),
			{
				"data-sap-ui-dt-for": this.getElement().getId(),
				draggable: this.getMovable()
			}
		);
	};

	ElementOverlay.prototype.render = function () {
		this.addStyleClass('sapUiDtElementOverlay');
		return Overlay.prototype.render.apply(this, arguments);
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
					throw Util.createError(
						"ElementOverlay#loadDesignTimeMetadata",
						"Can't set metadata to overlay which element has been destroyed already"
					);
				}

				this.setDesignTimeMetadata(mDesignTimeMetadata);
			}.bind(this))
			.catch(function (vError) {
				throw Util.propagateError(
					vError,
					"ElementOverlay#loadDesignTimeMetadata",
					Util.printf(
						"Can't load designtime metadata data for overlay with id='{1}', element id='{2}': {3}",
						this.getId(),
						this.getAssociation('element'), // Can't use this.getElement(), because the element might be destroyed already
						Util.wrapError(vError).message
					)
				);
			}.bind(this));
	};

	/**
	 * @override
	 */
	ElementOverlay.prototype._setPosition = function($Target, oGeometry, $Parent, bForceScrollbarSync) {
		// Apply Overlay position first, then extra logic based on this new position
		Overlay.prototype._setPosition.apply(this, arguments);

		this.getScrollContainers().forEach(function(mScrollContainer, iIndex) {
			// TODO: write Unit test for the case when getAssociatedDomRef() returns undefined (domRef func returns undefined)
			var $ScrollContainerDomRef = this.getDesignTimeMetadata().getAssociatedDomRef(this.getElement(), mScrollContainer.domRef) || jQuery();
			var $ScrollContainerOverlayDomRef = this.getScrollContainerById(iIndex);

			if ($ScrollContainerDomRef.length) {
				var oScrollContainerDomRef = $ScrollContainerDomRef.get(0);
				var mScrollContainerGeometry = DOMUtil.getGeometry(oScrollContainerDomRef);
				this._setSize($ScrollContainerOverlayDomRef, mScrollContainerGeometry);
				Overlay.prototype._setPosition.call(this, $ScrollContainerOverlayDomRef, mScrollContainerGeometry, this.$());
				this._handleOverflowScroll(mScrollContainerGeometry, $ScrollContainerOverlayDomRef, this, bForceScrollbarSync);
				this._setZIndex(mScrollContainerGeometry, $ScrollContainerOverlayDomRef);
			} else {
				$ScrollContainerOverlayDomRef.css("display", "none");
			}
		}, this);
	};

	ElementOverlay.prototype._applySizes = function () {
		// We need to know when all our children have correct positions
		var aPromises = this.getChildren()
			.filter(function (oChild) {
				return oChild.isRendered();
			})
			.map(function(oChild) {
				return new Promise(function (fnResolve) {
					oChild.attachEventOnce('geometryChanged', fnResolve);
				});
			});

		Overlay.prototype._applySizes.apply(this, arguments);

		Promise.all(aPromises).then(function () {
			this._sortChildren(this.getChildrenDomRef());

			// TODO: re-think async flow of applyStyles as part of Managing Updates BLI
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
	 * @private
	 */
	ElementOverlay.prototype._sortChildren = function(oContainer) {
		// compares two DOM Nodes and returns 1, if first child should be bellow in dom order
		var fnCompareChildren = function(oChild1, oChild2) {
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
		};

		// Exclude dummy scroll containers, because, e.g. in Safari, scrollbar synchronizations on ObjectPage sometimes
		// drops into in different event loops (JS execution cycles) which leads to invalid intermediate position
		// on the screen with following sorting. That said, sorting happens for intermediate state and then for real
		// state of the elements in viewport once again. Thus, excluding these elements allow us to avoid 2 extra sortings.
		var aChildren = jQuery(oContainer).find('>:not(.sapUiDtDummyScrollContainer)').toArray();
		var aSorted = aChildren.slice().sort(fnCompareChildren);

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
					Log.error('sap.ui.dt.ElementOverlay: overlay is already rendered and can\'t be placed in overlay container. Isn\'t it already there?');
				}
			} else {
				Log.error('sap.ui.dt.ElementOverlay: it\'s not possible to place overlay inside overlay container while it\'s part of some hierarchy');
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

		if (jQuery.isFunction(vDesignTimeMetadata)) {
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
	 * @returns {object[]} - returns an array with scroll containers description
	 */
	ElementOverlay.prototype.getScrollContainers = function () {
		return this.getDesignTimeMetadata().getScrollContainers(this.getElement());
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
	ElementOverlay.prototype.getScrollContainerById = function (iIndex) {
		return jQuery(this.getChildrenDomRef()).find('>.' + S_SCROLLCONTAINER_CLASSNAME + '[data-sap-ui-dt-scrollcontainerindex="' + iIndex + '"]');
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
		if (!oDomRef) {
			oDomRef = ElementUtil.getDomRef(this.getElement());
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
	 * @returns {sap.ui.dt.ElementOverlay} returns this
	 * @public
	 */
	ElementOverlay.prototype.setSelected = function (bSelected) {
		bSelected = !!bSelected;
		if (this.isSelectable() && bSelected !== this.isSelected()) {
			this.setProperty("selected", bSelected);
			this.toggleStyleClass("sapUiDtOverlaySelected", bSelected);

			this.fireSelectionChange({
				selected : bSelected
			});
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
			this.fireEditableChange({
				editable : bEditable
			});
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
	 * Event handler for "childAdded" event on aggregation overlays
	 * @param {sap.ui.base.Event} oEvent - event object
	 */
	ElementOverlay.prototype._onChildAdded = function (oEvent) {
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
	ElementOverlay.prototype.addChild = function (oAggregationOverlay) {
		// Since we can't check whether the listener was attached before or not, we re-attach it to avoid multiple listeners
		oAggregationOverlay.detachChildAdded(this._onChildAdded, this);
		oAggregationOverlay.attachChildAdded(this._onChildAdded, this);

		Overlay.prototype.addChild.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	ElementOverlay.prototype._onElementModified = function (oEvent) {
		if (oEvent.getParameters().type === "afterRendering") {
			this._subscribeToMutationObserver(this.isRoot());
		}
		this.fireElementModified(oEvent.getParameters());
	};

	/**
	 * @private
	 */
	ElementOverlay.prototype._domChangedCallback = function (mParameters) {
		mParameters.targetOverlay = this;
		if (this.isReady()) {
			this.fireApplyStylesRequired(mParameters);
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
		var oDesignTimeMetadata = this.getDesignTimeMetadata();
		var oDTData = oDesignTimeMetadata.getData();

		if (oDesignTimeMetadata.isIgnored(oElement)) {
			bVisible = false;
		} else if (typeof oDTData.isVisible === "function") {
			bVisible = oDTData.isVisible(oElement);
		} else {
			var oGeometry = this.getGeometry(true);
			if (oGeometry) {
				bVisible = oGeometry.visible;
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

	ElementOverlay.prototype._hasSameSize = function (mScrollContainerGeometry, sType) {
		var aScrollContainers = this.getScrollContainers();
		var iSize;

		if (aScrollContainers.length) {
			iSize = _max(
				aScrollContainers.map(function (mScrollContainer, iIndex) {
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