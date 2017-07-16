/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/Device', 'sap/ui/core/delegate/ScrollEnablement', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/Orientation', 'sap/ui/base/ManagedObject', 'sap/ui/core/Icon'],
	function(jQuery, library, Control, Device, ScrollEnablement, ItemNavigation, Orientation, ManagedObject, Icon) {
	"use strict";

	var HeaderContainerItemContainer = Control.extend("sap.m.HeaderContainerItemContainer", {
		metadata : {
			defaultAggregation : "item",
			aggregations : {
				item : {
					type : "sap.ui.core.Control",
					multiple : false
				}
			}
		},
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("sapMHdrCntrItemCntr");
			oRM.addClass("sapMHrdrCntrInner");
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("item"));
			oRM.write("</div>");
		}

	});

	/**
	 * Constructor for the new HeaderContainer control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The container that provides a horizontal layout. It provides a horizontal scrolling on the mobile devices.
	 * On the desktop, it provides scroll left and scroll right buttons. This control supports keyboard navigation.
	 * You can use left and right arrow keys to navigate through the inner content. The Home key puts focus on the first control and the End key puts focus on the last control.
	 * Use Enter or Space key to choose the control.
	 * @extends sap.ui.core.Control
	 * @implements sap.m.ObjectHeaderContainer
	 * @since 1.44.0
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
				 * If set to true, it shows dividers between the different content controls.
				 */
				showDividers : {
					type : "boolean",
					defaultValue : true,
					group : "Appearance"
				},
				/**
				 * The orientation of the HeaderContainer. There are two orientation modes: horizontal and vertical. In horizontal mode
				 * the content controls are displayed next to each other, in vertical mode the content controls are displayed
				 * on top of each other.
				 */
				orientation : {
					type : "sap.ui.core.Orientation",
					defaultValue : Orientation.Horizontal,
					group : "Appearance"
				},
				/**
				 * Specifies the background color of the content. The visualization of the different options depends on the used theme.
				 */
				backgroundDesign : {
					type : "sap.m.BackgroundDesign",
					defaultValue : library.BackgroundDesign.Transparent,
					group : "Appearance"
				},
				/**
				 * The width of the whole HeaderContainer. If not specified, it is rendered as '100%' in horizontal orientation and as 'auto' in vertical orientation.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance"},
				/**
				 * The height of the whole HeaderContainer. If not specified, it is rendered as 'auto' in horizontal orientation and as '100%' in vertical orientation.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Appearance"}
			},
			defaultAggregation : "content",
			aggregations : {
				/**
				 * Content to add to HeaderContainer.
				 */
				content : {
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
					type : "sap.ui.core.Control",
					multiple : false,
					visibility : "hidden"
				},
				/**
				 * Button that allows to scroll to next section.
				 */
				_nextButton : {
					type : "sap.ui.core.Control",
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
		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oScrollCntr = new library.ScrollContainer(this.getId() + "-scrl-cntnr", {
			width : "100%",
			height : "100%",
			horizontal : !Device.system.desktop
		});

		this.setAggregation("_scrollContainer", this._oScrollCntr, true);

		if (Device.system.desktop) {
			this._oArrowPrev = new library.Button({
				id : this.getId() + "-scrl-prev-button",
				type : library.ButtonType.Transparent,
				tooltip : this._oRb.getText("HEADERCONTAINER_BUTTON_PREV_SECTION"),
				press : function(oEvt) {
					oEvt.cancelBubble();
					this._scroll(-this.getScrollStep(), this.getScrollTime());
				}.bind(this)
			}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft");
			this._oArrowPrev._bExcludeFromTabChain = true;
			this.setAggregation("_prevButton", this._oArrowPrev, true);

			this._oArrowNext = new library.Button({
				id : this.getId() + "-scrl-next-button",
				type : library.ButtonType.Transparent,
				tooltip : this._oRb.getText("HEADERCONTAINER_BUTTON_NEXT_SECTION"),
				press : function(oEvt) {
					oEvt.cancelBubble();
					this._scroll(this.getScrollStep(), this.getScrollTime());
				}.bind(this)
			}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight");
			this._oArrowNext._bExcludeFromTabChain = true;
			this.setAggregation("_nextButton", this._oArrowNext, true);
		} else if (Device.system.phone || Device.system.tablet) {
			this._oArrowPrev = new Icon({
				id : this.getId() + "-scrl-prev-button"
			}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft");
			this.setAggregation("_prevButton", this._oArrowPrev, true);
			this._oArrowNext = new Icon({
				id : this.getId() + "-scrl-next-button"
			}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight");
			this.setAggregation("_nextButton", this._oArrowNext, true);
		}

		this._oScrollCntr.addDelegate({
			onAfterRendering : function() {
				if (Device.system.desktop) {
					var oFocusRef = this._oScrollCntr.getDomRef("scroll");
					var oFocusObj = this._oScrollCntr.$("scroll");
					var aDomRefs = oFocusObj.find(".sapMHrdrCntrInner").attr("tabindex", "0");

					if (!this._oItemNavigation) {
						this._oItemNavigation = new ItemNavigation();
						this.addDelegate(this._oItemNavigation);
						this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._handleBorderReached, this);
						this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._handleBorderReached, this);
						this._oItemNavigation.attachEvent(ItemNavigation.Events.BeforeFocus, this._handleBeforeFocus, this);
						if (Device.browser.msie || Device.browser.edge) {
							this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, this._handleFocusAgain, this);
						}
					}
					this._oItemNavigation.setRootDomRef(oFocusRef);
					this._oItemNavigation.setItemDomRefs(aDomRefs);
					this._oItemNavigation.setTabIndex0();
					this._oItemNavigation.setCycling(false);
				}
			}.bind(this)
		});
		sap.ui.getCore().attachIntervalTimer(this._checkOverflow, this);
	};

	HeaderContainer.prototype.onBeforeRendering = function() {
		if (!this.getHeight()) {
			jQuery.sap.log.warning("No height provided", this);
		}
		if (!this.getWidth()) {
			jQuery.sap.log.warning("No width provided", this);
		}
		if (Device.system.desktop) {
			this._oArrowPrev.setIcon(this.getOrientation() === Orientation.Horizontal ? "sap-icon://slim-arrow-left" : "sap-icon://slim-arrow-up");
			this._oArrowNext.setIcon(this.getOrientation() === Orientation.Horizontal ? "sap-icon://slim-arrow-right" : "sap-icon://slim-arrow-down");
		} else if (Device.system.phone || Device.system.tablet) {
			this._oArrowPrev.setSrc(this.getOrientation() === Orientation.Horizontal ? "sap-icon://slim-arrow-left" : "sap-icon://slim-arrow-up");
			this._oArrowNext.setSrc(this.getOrientation() === Orientation.Horizontal ? "sap-icon://slim-arrow-right" : "sap-icon://slim-arrow-down");
		}
	};

	HeaderContainer.prototype.exit = function() {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			this._oItemNavigation = null;
		}
		sap.ui.getCore().detachIntervalTimer(this._checkOverflow, this);
	};

	HeaderContainer.prototype.onsaptabnext = function(oEvt) {
		var oFocusables = this.$().find(":focusable"); // all tabstops in the control
		var iThis = oFocusables.index(oEvt.target); // focused element index
		var oNext = oFocusables.eq(iThis + 1).get(0); // next tab stop element
		var oFromCell = this._getParentCell(oEvt.target);
		var oToCell;
		if (oNext) {
			oToCell = this._getParentCell(oNext);
		}

		if (oFromCell && oToCell && oFromCell.id !== oToCell.id || oNext && oNext.id === this.getId() + "-after") { // attempt to jump out of HeaderContainer
			var oLastInnerTab = oFocusables.last().get(0);
			if (oLastInnerTab) {
				this._bIgnoreFocusIn = true;
				oLastInnerTab.focus();
			}
		}
	};

	HeaderContainer.prototype.onsaptabprevious = function(oEvt) {
		this.$().find(".sapMHdrCntrItemCntr").css("border-color", "");
		var oFocusables = this.$().find(":focusable"); // all tabstops in the control
		var iThis = oFocusables.index(oEvt.target); // focused element index
		var oPrev = oFocusables.eq(iThis - 1).get(0); // previous tab stop element
		var oFromCell = this._getParentCell(oEvt.target);
		var oToCell;
		if (oPrev) {
			oToCell = this._getParentCell(oPrev);
		}

		if (!oToCell || oFromCell && oFromCell.id !== oToCell.id) { // attempt to jump out of HeaderContainer
			var sTabIndex = this.$().attr("tabindex"); // save tabindex
			this.$().attr("tabindex", "0");
			this.$().focus(); // set focus before the control
			if (!sTabIndex) { // restore tabindex
				this.$().removeAttr("tabindex");
			} else {
				this.$().attr("tabindex", sTabIndex);
			}
		}
	};

	/* =========================================================== */
	/* Public property getters/setters                             */
	/* =========================================================== */
	HeaderContainer.prototype.setOrientation = function(value) {
	  this.setProperty("orientation", value);
		if (value === Orientation.Horizontal && !Device.system.desktop) {
			// Needs to be done by setter. No re-rendering done.
			this._oScrollCntr.setHorizontal(true);
			this._oScrollCntr.setVertical(false);
		} else if (!Device.system.desktop) {
			// Needs to be done by setter. No re-rendering done.
			this._oScrollCntr.setHorizontal(false);
			this._oScrollCntr.setVertical(true);
		}
		return this;
	};

	HeaderContainer.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	HeaderContainer.prototype.getAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	HeaderContainer.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		return this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
	};

	HeaderContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	HeaderContainer.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	HeaderContainer.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */
	HeaderContainer.prototype._setScrollInProcess = function(value) {
		this.bScrollInProcess = value;
	};

	HeaderContainer.prototype._scroll = function(iDelta, iDuration) {
		this._setScrollInProcess(true);
		jQuery.sap.delayedCall(iDuration + 300, this, this._setScrollInProcess, [false]);
		if (this.getOrientation() === Orientation.Horizontal) {
			this._hScroll(iDelta, iDuration);
		} else {
			this._vScroll(iDelta, iDuration);
		}
	};

	HeaderContainer.prototype._vScroll = function(delta, duration) {
		var oDomRef = this._oScrollCntr.getDomRef(),
		iScrollTop = oDomRef.scrollTop,
		iScrollHeight = oDomRef.scrollHeight,
		iScrollTarget = iScrollTop + delta,
		iClientHeight = oDomRef.clientHeight,
		iPaddingHeight = parseFloat(this.$("scroll-area").css("padding-top")),
		iRemainingTime;

		if (iScrollTarget <= 0) { // when the next scrolling will reach the top edge side
			iRemainingTime = this._calculateRemainingScrolling(delta, duration, iScrollTop);
			this.$("scroll-area").css("transition", "padding " + iRemainingTime + "s");
			this.$().removeClass("sapMHrdrTopPadding");
		} else if (iScrollTarget + iClientHeight + iPaddingHeight >= iScrollHeight) { // when the next scrolling will reach the bottom edge side
			iRemainingTime = this._calculateRemainingScrolling(delta, duration, iScrollHeight - iClientHeight - iScrollTop);
			this.$("scroll-area").css("transition", "padding " + iRemainingTime + "s");
			if (iClientHeight + delta > iScrollHeight && iClientHeight !== iScrollHeight) { // when scrolling from top edge direct to bottom edge
				this.$().removeClass("sapMHrdrBottomPadding");
				this.$().addClass("sapMHrdrTopPadding");
			} else {
				this.$().removeClass("sapMHrdrBottomPadding");
			}
		} else { // transition time is reset to the scrolling speed when scrolling does not reach the edge
			this.$("scroll-area").css("transition", "padding " + duration / 1000 + "s");
		}
		this._oScrollCntr.scrollTo(0, iScrollTarget, duration);
	};

	HeaderContainer.prototype._hScroll = function(delta, duration) {
		var oDomRef = this._oScrollCntr.getDomRef();
		var iScrollTarget, iScrollLeft, iClientWidth, iScrollWidth, iPaddingWidth, iRemainingTime;
		if (!this._bRtl) {
			iScrollLeft = oDomRef.scrollLeft;
			iScrollWidth = oDomRef.scrollWidth;
			iClientWidth = oDomRef.clientWidth;
			iScrollTarget = iScrollLeft + delta;
			iPaddingWidth = parseFloat(this.$("scroll-area").css("padding-left"));

			if (iScrollTarget <= 0) { // when the next scrolling will reach the left edge side
				iRemainingTime = this._calculateRemainingScrolling(delta, duration, iScrollLeft);
				this.$("scroll-area").css("transition", "padding " + iRemainingTime + "s");
				this.$().removeClass("sapMHrdrLeftPadding");
			} else if (iScrollTarget + oDomRef.clientWidth + iPaddingWidth >= iScrollWidth) { // when the next scrolling will reach the right edge side
				iRemainingTime = this._calculateRemainingScrolling(delta, duration, iScrollWidth - iClientWidth - iScrollLeft);
				this.$("scroll-area").css("transition", "padding " + iRemainingTime + "s");
				if (iClientWidth + delta > iScrollWidth && iClientWidth !== iScrollWidth) { // when scrolling from left edge direct to right edge
					this.$().removeClass("sapMHrdrRightPadding");
					this.$().addClass("sapMHrdrLeftPadding");
				} else {
					this.$().removeClass("sapMHrdrRightPadding");
				}
			} else { // transition time is reset to the scrolling speed when scrolling does not reach the edge
				this.$("scroll-area").css("transition", "padding " + duration / 1000 + "s");
			}
			this._oScrollCntr.scrollTo(iScrollTarget, 0, duration);
		} else {
			iScrollTarget = jQuery(oDomRef).scrollRightRTL() + delta;
			this._oScrollCntr.scrollTo((iScrollTarget > 0) ? iScrollTarget : 0, 0, duration);
		}
	};

	HeaderContainer.prototype._calculateRemainingScrolling = function(delta, duration, distance) {
		return Math.abs(distance * duration / (1000 * delta));
	};

	HeaderContainer.prototype._checkOverflow = function() {
		if (this.getOrientation() === Orientation.Horizontal) {
			this._checkHOverflow();
		} else {
			this._checkVOverflow();
		}
	};

	HeaderContainer.prototype._checkVOverflow = function() {
		var oBarHead = this._oScrollCntr.getDomRef(), oOldScrollBack, $ButtonContainer;

		if (oBarHead) {
			// in Chrome the scrollTop and scrollLeft return decimal value (in IE and Firefox return integer)
			// which results in one pixel smaller than actual value.
			var iScrollTop = Math.ceil(oBarHead.scrollTop);

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

			$ButtonContainer = this.$("prev-button-container");
			oOldScrollBack = $ButtonContainer.is(":visible");
			if (oOldScrollBack && !bScrollBack) {
				$ButtonContainer.hide();
				this.$().removeClass("sapMHrdrTopPadding");
			}
			if (!oOldScrollBack && bScrollBack) {
				$ButtonContainer.show();
				this.$().addClass("sapMHrdrTopPadding");
			}
			$ButtonContainer = this.$("next-button-container");
			var oOldScrollForward = $ButtonContainer.is(":visible");
			if (oOldScrollForward && !bScrollForward) {
				$ButtonContainer.hide();
				this.$().removeClass("sapMHrdrBottomPadding");
			}
			if (!oOldScrollForward && bScrollForward) {
				$ButtonContainer.show();
				this.$().addClass("sapMHrdrBottomPadding");
			}
		}
	};

	HeaderContainer.prototype._checkHOverflow = function() {
		var oBarHead = this._oScrollCntr.getDomRef(), $ButtonContainer;

		if (oBarHead) {
			// in Chrome the scrollTop and scrollLeft return decimal value (in IE and Firefox return integer)
			// which results in one pixel smaller than actual value.
			var iScrollLeft = Math.ceil(oBarHead.scrollLeft);

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
				if (iScrollLeftRTL > ((Device.browser.internet_explorer || Device.browser.edge) ? 1 : 0)) {
					bScrollForward = true;
				}
			} else if (iScrollLeft > 1) {
				bScrollBack = true;
			}

			if (realWidth - 5 > availableWidth) {
				if (this._bRtl) {
					if (jQuery(oBarHead).scrollRightRTL() > 1) {
						bScrollBack = true;
					}
				} else if (iScrollLeft + availableWidth < realWidth) {
						bScrollForward = true;
				}
			}

			$ButtonContainer = this.$("prev-button-container");
			var oOldScrollBack = $ButtonContainer.is(":visible");
			if (oOldScrollBack && !bScrollBack) {
				$ButtonContainer.hide();
				this.$().removeClass("sapMHrdrLeftPadding");
			}
			if (!oOldScrollBack && bScrollBack) {
				$ButtonContainer.show();
				this.$().addClass("sapMHrdrLeftPadding");
			}

			$ButtonContainer = this.$("next-button-container");
			var oOldScrollForward = $ButtonContainer.is(":visible");
			if (oOldScrollForward && !bScrollForward) {
				$ButtonContainer.hide();
				this.$().removeClass("sapMHrdrRightPadding");
			}
			if (!oOldScrollForward && bScrollForward) {
				$ButtonContainer.show();
				this.$().addClass("sapMHrdrRightPadding");
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
		} else if (iIndex === this.getContent().length - 1){
			this._scroll(this.getScrollStep(), this.getScrollTime());
		}
	};

	HeaderContainer.prototype._handleFocusAgain = function(oEvt) {
		oEvt.getParameter("event").preventDefault();
	};

	HeaderContainer.prototype._handleBeforeFocus = function(oEvt) {
		var oOriginalEvent = oEvt.getParameter("event");
		if (jQuery(oOriginalEvent.target).hasClass("sapMHdrCntrItemCntr") ||
			jQuery(oOriginalEvent.target).hasClass("sapMScrollContScroll") ||
			jQuery.sap.PseudoEvents.sapprevious.fnCheck(oOriginalEvent) ||
			jQuery.sap.PseudoEvents.sapnext.fnCheck(oOriginalEvent) ) {
			this.$().find(".sapMHdrCntrItemCntr").css("border-color", "");
		} else {
			this.$().find(".sapMHdrCntrItemCntr").css("border-color", "transparent");
		}
	};

	/**
	 * @description Unwraps the content of HeaderContainerItemContainer. Ignores elements that are not
	 * HeaderContainerItemContainer (allowing the proper behavior if used with indexOf).
	 * Works on single elements and arrays.
	 *
	 * @param {Object} wrapped The wrapped object
	 * @returns {Object} The wrapped content, if wrapped has originally been a HeaderContainerItemContainer
	 * or an array containing HeaderContainerItemContainer. Otherwise the parameter wrapped will be returned.
	 * @private
	 */
	HeaderContainer.prototype._unWrapHeaderContainerItemContainer = function(wrapped) {
		if (wrapped instanceof HeaderContainerItemContainer) {
			wrapped = wrapped.getItem();
		} else if (jQuery.isArray(wrapped)) {
			for (var i = 0; i < wrapped.length; i++) {
				if (wrapped[i] instanceof HeaderContainerItemContainer) {
					wrapped[i] = wrapped[i].getItem();
				}
			}
		}
		return wrapped;
	};

	HeaderContainer._AGGREGATION_FUNCTIONS = ["validateAggregation", "validateAggregation", "getAggregation", "setAggregation", "indexOfAggregation", "removeAggregation"];
	HeaderContainer._AGGREGATION_FUNCTIONS_FOR_INSERT = ["insertAggregation", "addAggregation"];
	HeaderContainer.prototype._callMethodInManagedObject = function(sFunctionName, sAggregationName) {
		var args = Array.prototype.slice.call(arguments);
		if (sAggregationName === "content") {
			var oContent = args[2];
			args[1] = "content";
			if (oContent instanceof Control) {
				if (jQuery.inArray(sFunctionName, HeaderContainer._AGGREGATION_FUNCTIONS) > -1 && oContent.getParent() instanceof HeaderContainerItemContainer) {
					args[2] = oContent.getParent();
				} else if (jQuery.inArray(sFunctionName, HeaderContainer._AGGREGATION_FUNCTIONS_FOR_INSERT) > -1) {
					args[2] = new HeaderContainerItemContainer({
						item: oContent
					});
				}
			}
			return this._unWrapHeaderContainerItemContainer(this._oScrollCntr[sFunctionName].apply(this._oScrollCntr, args.slice(1)));
		} else {
			return ManagedObject.prototype[sFunctionName].apply(this, args.slice(1));
		}
	};

	HeaderContainer.prototype._getParentCell = function(oDomElement) {
		return jQuery(oDomElement).parents(".sapMHrdrCntrInner").andSelf(".sapMHrdrCntrInner").get(0);
	};


	HeaderContainer.prototype.onfocusin = function(oEvt) {
		if (this._bIgnoreFocusIn) {
			this._bIgnoreFocusIn = false;
			return;
		}
		if (oEvt.target.id === this.getId() + "-after") {
			this._restoreLastFocused();
		}
	};

	HeaderContainer.prototype._restoreLastFocused = function() {
		if (!this._oItemNavigation) {
			return;
		}
		//get the last focused Element from the HeaderContainer
		var aNavigationDomRefs = this._oItemNavigation.getItemDomRefs();
		var iLastFocusedIndex = this._oItemNavigation.getFocusedIndex();
		var $LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]);

		// find related item control to get tabbables
		var oRelatedControl = $LastFocused.control(0) || {};
		var $Tabbables = oRelatedControl.getTabbables ? oRelatedControl.getTabbables() : $LastFocused.find(":sapTabbable");

		// get the last tabbable item or itself and focus
		$Tabbables.eq(-1).add($LastFocused).eq(-1).focus();
	};

	return HeaderContainer;
});
