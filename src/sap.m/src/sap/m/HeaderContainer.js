/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/Device', 'sap/ui/core/delegate/ScrollEnablement', 'sap/ui/core/delegate/ItemNavigation'],
	function(jQuery, library, Control, Device, ScrollEnablement, ItemNavigation) {
	"use strict";

	/**
	 * Constructor for the new HeaderContainer control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The container that provides a horizontal layout. It provides a horizontal scrolling on the mobile devices.
	 * On the desktop, it provides scroll left and scroll right buttons. This control supports keyboard navigation.
	 * You can use left and right arrow keys to navigate through the inner content. The Home key puts focus on the first control and the End key puts focus on the last control.
	 * Use Enter or Space key to choose the control.
	 * @extends sap.ui.core.Control
	 * @implements sap.m.ObjectHeaderContainer
	 * @experimental Since 1.42.0 This is currently under development. The API could be changed at any point in time.
	 * @since 1.42.0
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.m.HeaderContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HeaderContainer = Control.extend("sap.m.HeaderContainer", /** @lends sap.m.HeaderContainer.prototype */ {
		metadata : {
			interfaces : [ "sap.m.ObjectHeaderContainer" ],
			library : "sap.m",
			properties : {
				/**
				 * Number of pixels to scroll when the user chooses Next or Previous buttons. Relevant only for desktop.
				 */
				scrollStep : {
					type : "int",
					defaultValue : 300,
					group : "Behavior"
				},
				/**
				 * Scroll animation time in milliseconds.
				 */
				scrollTime : {
					type : "int",
					defaultValue : 500,
					group : "Behavior"
				},
				/**
				 * If set to true, shows dividers between scrollable items.
				 */
				showDividers : {
					type : "boolean",
					defaultValue : true,
					group : "Appearance"
				},
				/**
				 * The view of the HeaderContainer.
				 */
				view : {
					type : "sap.m.HeaderContainerView",
					defaultValue : library.HeaderContainerView.Horizontal,
					group : "Appearance"
				},
				/**
				 * Specifies the background color of the content. The visualization of the different options depends on the used theme.
				 */
				backgroundDesign : {
					type : "sap.m.BackgroundDesign",
					defaultValue : library.BackgroundDesign.Transparent,
					group : "Appearance"
				}
			},
			defaultAggregation : "items",
			aggregations : {
				/**
				 * Items to add to HeaderContainer.
				 */
				items : {
					type : "sap.ui.core.Control",
					multiple : true
				},
				/**
				 * Scroll container for smooth scrolling on different platforms.
				 */
				_scrollContainer : {
					type : "sap.m.ScrollContainer",
					multiple : false,
					visibility : "hidden"
				},
				/**
				 * Button that allows to scroll to previous section.
				 */
				_prevButton : {
					type : "sap.m.Button",
					multiple : false,
					visibility : "hidden"
				},
				/**
				 * Button that allows to scroll to next section.
				 */
				_nextButton : {
					type : "sap.m.Button",
					multiple : false,
					visibility : "hidden"
				}
			}
		}
	});

	/* ============================================================ */
	/* Life-cycle Handling                                          */
	/* ============================================================ */

	HeaderContainer.prototype.init = function() {
		this._iSelectedCell = 0;
		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oScrollCntr = new library.ScrollContainer(this.getId() + "-scrl-cntnr", {
			width : "100%",
			height : "100%",
			horizontal : !Device.system.desktop
		});

		this.setAggregation("_scrollContainer", this._oScrollCntr, true);
		var that = this;

		if (Device.system.desktop) {
			this._oArrowPrev = new sap.m.Button({
				id : this.getId() + "-scrl-prev-button",
				tooltip : this._oRb.getText("HEADERCONTAINER_BUTTON_PREV_SECTION"),
				press : function(oEvt) {
					oEvt.cancelBubble();
					this._scroll(-this.getScrollStep(), this.getScrollTime());
				}.bind(this)
			}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft");
			this.setAggregation("_prevButton", this._oArrowPrev, true);

			this._oArrowNext = new sap.m.Button({
				id : this.getId() + "-scrl-next-button",
				tooltip : this._oRb.getText("HEADERCONTAINER_BUTTON_NEXT_SECTION"),
				press : function(oEvt) {
					oEvt.cancelBubble();
					this._scroll(this.getScrollStep(), this.getScrollTime());
				}.bind(this)
			}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight");
			this.setAggregation("_nextButton", this._oArrowNext, true);

			this._oScrollCntr.addDelegate({
				onAfterRendering : function() {
					if (Device.system.desktop) {
						var oFocusRef = jQuery.sap.domById(that.getId() + "-scrl-cntnr-scroll"); // TODO: use this$()
						var oFocusObj = jQuery.sap.byId(that.getId() + "-scrl-cntnr-scroll");    // TODO: use this$()
						var aDomRefs = oFocusObj.find(".sapMHrdrCntrInner").attr("tabindex", "0");

						if (!that._oItemNavigation) {
							that._oItemNavigation = new ItemNavigation();
							that.addDelegate(that._oItemNavigation);
							that._oItemNavigation.attachEvent(sap.ui.core.delegate.ItemNavigation.Events.BorderReached, that._handleBorderReached, that); // TODO: use short cut for long module access
							that._oItemNavigation.attachEvent(sap.ui.core.delegate.ItemNavigation.Events.AfterFocus, that._handleBorderReached, that);    // TODO: use short cut for long module access
						}
						that._oItemNavigation.setRootDomRef(oFocusRef);
						that._oItemNavigation.setItemDomRefs(aDomRefs);
						that._oItemNavigation.setTabIndex0();
						that._oItemNavigation.setCycling(false);
					}
					that._refreshScroll();
				},

				onBeforeRendering : function() {
					if (Device.system.desktop) {
						that._oScrollCntr._oScroller = new ScrollEnablement(that._oScrollCntr, that._oScrollCntr.getId() + "-scroll", {
							horizontal : true,
							vertical : true,
							zynga : false,
							preventDefault : false,
							nonTouchScrolling : true
						});
					}
				}
			});
		}
	};

	HeaderContainer.prototype.onBeforeRendering = function() {
		if (Device.system.desktop) {
			sap.ui.getCore().attachIntervalTimer(this._checkOverflow, this);
			this._oArrowPrev.setIcon(this.getView() === library.HeaderContainerView.Horizontal ? "sap-icon://navigation-left-arrow" : "sap-icon://navigation-up-arrow");
			this._oArrowNext.setIcon(this.getView() === library.HeaderContainerView.Horizontal ? "sap-icon://navigation-right-arrow" : "sap-icon://navigation-down-arrow");
			this.$().unbind("click", this._handleSwipe); // TODO: check why click is unbinded.
		}
		if (this._sScrollResizeHandlerId) {
			sap.ui.core.ResizeHandler.deregister(this._sScrollResizeHandlerId);
		}
	};

	HeaderContainer.prototype.onAfterRendering = function() {
		jQuery.sap.byId(this.getId() + "-scrl-next-button").attr("tabindex","-1"); // TODO: use this.$()
		jQuery.sap.byId(this.getId() + "-scrl-prev-button").attr("tabindex","-1"); // TODO: use this.$()
		if (Device.system.desktop) {
			this.$().bind("swipe", this._handleSwipe.bind(this)); // TODO: check why click is bind for desktop devices.
		}
		this._sScrollResizeHandlerId = sap.ui.core.ResizeHandler.register(this,  this._refreshScroll.bind(this));
	};

	HeaderContainer.prototype.exit = function() {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			this._oItemNavigation = null;
		}
		if (this._sScrollResizeHandlerId) {
			sap.ui.core.ResizeHandler.deregister(this._sScrollResizeHandlerId);
		}
	};

	/* =========================================================== */
	/* Event Handling                                              */
	/* =========================================================== */
	HeaderContainer.prototype._handleSwipe = function(oEvt) {
		oEvt.preventDefault();
		oEvt.stopPropagation();
		this._isDragEvent = true;
	};

	HeaderContainer.prototype.onclick = function(oEvt) {
		if (this._isDragEvent) {
			oEvt.preventDefault();
			oEvt.stopPropagation();
			this._isDragEvent = false;
		}
	};

	HeaderContainer.prototype.onsaptabnext = function(oEvt) {
		this._iSelectedCell = this._oItemNavigation.getFocusedIndex();
		var oFocusables = this.$().find(":focusable");		// all tabstops in the control
		var iThis = oFocusables.index(oEvt.target);				// focused element index
		var oNext = oFocusables.eq(iThis + 1).get(0);			// next tab stop element
		var oFromCell = this._getParentCell(oEvt.target);
		var oToCell = (typeof oNext != 'undefined') ? this._getParentCell(oNext) : undefined;
		if ((typeof oFromCell != 'undefined') && (typeof oToCell != 'undefined') && oFromCell.id != oToCell.id) { // attempt to jump to other cell
			var oLastInnerTab = oFocusables.last().get(0);
			if (typeof oLastInnerTab != 'undefined') {
				oLastInnerTab.focus();
			}
		}
	};

	HeaderContainer.prototype.onsaptabprevious = function(oEvt) {
		var oFocusables = this.$().find(":focusable");			// all tabstops in the control
		var iThis = oFocusables.index(oEvt.target);					// focused element index
		var oPrev = oFocusables.eq(iThis - 1).get(0);				// previous tab stop element
		var oFromCell = this._getParentCell(oEvt.target);
		this._iSelectedCell = this._oItemNavigation.getFocusedIndex();
		var oToCell = (typeof oPrev != 'undefined') ? this._getParentCell(oPrev) : undefined;
		if (typeof oPrev != 'undefined' && typeof oToCell != 'undefined' && oToCell.id == oPrev.id) { // previous step goes to cell
			oEvt.preventDefault();
			oEvt.stopPropagation();
			oToCell.tabindex = 0;
			oToCell.focus();
		} else if (typeof oToCell == 'undefined' || oFromCell && oFromCell.id != oToCell.id) { // attempt to jump outside or to other cell
			var sTabIndex = this.$().attr("tabindex");	// save tabindex
			this.$().attr("tabindex", "0");
			this.$().focus(); 													// set focus before the control
			if (typeof sTabIndex == 'undefined') {			// restore tabindex
				this.$().removeAttr("tabindex");
			} else {
				this.$().attr("tabindex", sTabIndex);
			}
		}
	};

	/* =========================================================== */
	/* Public property getters/setters                             */
	/* =========================================================== */
	HeaderContainer.prototype.setView = function(value) {
	  this.setProperty("view", value, true);
		if (value === library.HeaderContainerView.Horizontal && !Device.system.desktop) {
			this._oScrollCntr.setHorizontal(true); // TODO: check if setProperty can used instead.
			this._oScrollCntr.setVertical(false);
		} else if (!Device.system.desktop) {
			this._oScrollCntr.setHorizontal(false);
			this._oScrollCntr.setVertical(true);
		}
		return this;
	};

	HeaderContainer.prototype.addItem = function(oItem) { // TODO: Needs to be checked if needed.
		return this._oScrollCntr.addContent(oItem.addStyleClass("sapMHrdrCntrInner"));
	};

	HeaderContainer.prototype.insertItem = function(oItem, iIndex) {  // TODO: Needs to be checked if needed.
		return this._oScrollCntr.insertContent(oItem.addStyleClass("sapMHrdrCntrInner"), iIndex);
	};

	HeaderContainer.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	HeaderContainer.prototype.getAggregation = function(sAggregationName, oObject, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.indexOfAggregation = function(sAggregationName, oObject) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	HeaderContainer.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
	};

	HeaderContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	HeaderContainer.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) { // TODO: Needs to be checked if needed.
		return this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */
	HeaderContainer.prototype._refreshScroll = function() {
		var oHc = this.$();
		var iRealHeight = jQuery.sap.domById(this.getId() + "-scrl-cntnr").scrollHeight; // TODO: use this.$()
		var iAvailHeight = oHc.height();

		if (iRealHeight > iAvailHeight) {
			oHc.css("height", "100%");
		} else {
			oHc.css("height", "");
		}
	};

	HeaderContainer.prototype._setScrollInProcess = function(value) {
		this.bScrollInProcess = value;
	};

	HeaderContainer.prototype._scroll = function(iDelta, iDuration) {
		this._setScrollInProcess(true);
		jQuery.sap.delayedCall(iDuration + 300, this, this._setScrollInProcess, [false]);
		if (this.getView() === library.HeaderContainerView.Horizontal) {
			this._hScroll(iDelta, iDuration);
		} else {
			this._vScroll(iDelta, iDuration);
		}
	};

	HeaderContainer.prototype._vScroll = function(iDelta, iDuration) {
		var oDomRef = jQuery.sap.domById(this.getId() + "-scrl-cntnr"); // TODO: use this.$()
		var iScrollTop = oDomRef.scrollTop;
		var iScrollTarget = iScrollTop + iDelta;
		this._oScrollCntr.scrollTo(0, iScrollTarget, iDuration);
	};

	HeaderContainer.prototype._hScroll = function(iDelta, iDuration) {
		var oDomRef = jQuery.sap.domById(this.getId() + "-scrl-cntnr"); // TODO: use this.$()
		var iScrollTarget;
		if (!this._bRtl) {
			var iScrollLeft = oDomRef.scrollLeft;
			iScrollTarget = iScrollLeft + iDelta;
			this._oScrollCntr.scrollTo(iScrollTarget, 0, iDuration);
		} else {
			iScrollTarget = jQuery(oDomRef).scrollRightRTL() + iDelta;
			this._oScrollCntr.scrollTo((iScrollTarget > 0) ? iScrollTarget : 0, 0, iDuration);
		}
	};

	HeaderContainer.prototype._checkOverflow = function() {
		if (this.getView() === library.HeaderContainerView.Horizontal) {
			this._checkHOverflow();
		} else {
			this._checkVOverflow();
		}
	};

	HeaderContainer.prototype._checkVOverflow = function() {
		var oBarHead = this._oScrollCntr.getDomRef();
		var bScrolling = false;

		if (oBarHead) {
			if (oBarHead.scrollHeight > oBarHead.clientHeight) {
				// scrolling possible
				bScrolling = true;
			}
		}

		this._lastVScrolling = bScrolling;
		if (oBarHead) {
			var iScrollTop = Math.round(oBarHead.scrollTop);

			// check whether scrolling to the left is possible
			var bScrollBack = false;
			var bScrollForward = false;

			var realHeight = oBarHead.scrollHeight;
			var availableHeight = oBarHead.clientHeight;

			if (Math.abs(realHeight - availableHeight) === 1) {
				realHeight = availableHeight;
			}

			if (iScrollTop > 0) {
				bScrollBack = true;
			}
			if ((realHeight > availableHeight) && (iScrollTop + availableHeight < realHeight)) {
				bScrollForward = true;
			}

			if (!bScrollBack) {
				this._oArrowPrev.$().hide();
			} else {
				this._oArrowPrev.$().show();
			}
			if (!bScrollForward) {
				this._oArrowNext.$().hide();
			} else {
				this._oArrowNext.$().show();
			}
		}
	};

	HeaderContainer.prototype._checkHOverflow = function() {
		var oBarHead = this._oScrollCntr.getDomRef();
		var oBarHeadContainer = this.$("scroll-area");
		var bScrolling = false;

		if (oBarHead) {
			if (oBarHead.scrollWidth - 5 > oBarHead.clientWidth) {
				// scrolling possible
				bScrolling = true;
			}
		}

		this._lastScrolling = bScrolling;
		if (oBarHead) {
			var iScrollLeft = Math.floor(oBarHead.scrollLeft);

			// check whether scrolling to the left is possible
			var bScrollBack = false;
			var bScrollForward = false;

			var realWidth = oBarHead.scrollWidth;
			var availableWidth = oBarHead.clientWidth;

			if (Math.abs(realWidth - availableWidth) === 1) {
				realWidth = availableWidth;
			}
			if (this._bRtl) {
				var iScrollLeftRTL = jQuery(oBarHead).scrollLeftRTL();
				if (iScrollLeftRTL > (Device.browser.internet_explorer ? 1 : 0)) {
					bScrollForward = true;
				}
			} else if (iScrollLeft > 1) {
				bScrollBack = true;
			}

			var fnRightMarginCalc = function() {
				var iPadding = parseFloat(oBarHeadContainer.css("padding-right"));
				return Device.browser.internet_explorer ? iPadding + 1 : iPadding;
			};

			if (realWidth - 5 > availableWidth) {
				if (this._bRtl) {
					if (jQuery(oBarHead).scrollRightRTL() > 1) {
						bScrollBack = true;
					}
				} else if (Math.abs(iScrollLeft + availableWidth - realWidth) > fnRightMarginCalc()) {
						bScrollForward = true;
				}
			}

			var oOldScrollBack = this._oArrowPrev.$().is(":visible");
			var bRefresh = false;
			if (oOldScrollBack && !bScrollBack) {
				this._oArrowPrev.$().hide();
				bRefresh = true;
			}
			if (!oOldScrollBack && bScrollBack) {
				this._oArrowPrev.$().show();
				bRefresh = true;
			}

			var oOldScrollForward = this._oArrowNext.$().is(":visible");
			if (oOldScrollForward && !bScrollForward) {
				this._oArrowNext.$().hide();
				bRefresh = true;
			}
			if (!oOldScrollForward && bScrollForward) {
				this._oArrowNext.$().show();
				bRefresh = true;
			}
			if (bRefresh) {
				this._refreshScroll();
			}
		}
	};

	HeaderContainer.prototype._handleBorderReached = function(oEvt) {
		if (Device.browser.internet_explorer && this.bScrollInProcess) {
			return;
		}
		var iIndex = oEvt.getParameter("index");
		if (iIndex === 0) {
			this._scroll(-this.getScrollStep(), this.getScrollTime());
		} else if (iIndex === this.getItems().length - 1){
			this._scroll(this.getScrollStep(), this.getScrollTime());
		}
	};

	HeaderContainer.prototype._callMethodInManagedObject = function(sFunctionName, sAggregationName) {
		var args = Array.prototype.slice.call(arguments);
		if (sAggregationName === "items") {
			args[1] = "content";
			return this._oScrollCntr[sFunctionName].apply(this._oScrollCntr, args.slice(1));
		} else {
			return sap.ui.base.ManagedObject.prototype[sFunctionName].apply(this, args.slice(1)); // TODO: Check if it is needed that MO is called instead of prototype of HeaderContainer
		}
	};

	HeaderContainer.prototype._getParentCell = function(oDomElement) {
		return jQuery(oDomElement).parents(".sapMHrdrCntrInner").andSelf(".sapMHrdrCntrInner").get(0);
	};

	return HeaderContainer;
});