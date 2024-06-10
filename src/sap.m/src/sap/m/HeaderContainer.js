/*!
 * ${copyright}
 */
sap.ui.define([
		'./library',
		'./Button',
		'./ScrollContainer',
		"sap/base/i18n/Localization",
		'sap/ui/core/Control',
		'sap/ui/core/Element',
		'sap/ui/Device',
		'sap/m/HeaderContainerItemNavigator',
		'sap/ui/core/delegate/ItemNavigation',
		'sap/ui/core/library',
		'sap/ui/core/IntervalTrigger',
		'sap/ui/core/Icon',
		'./HeaderContainerRenderer',
		"sap/base/Log",
		"sap/ui/events/KeyCodes",
		"sap/ui/events/PseudoEvents",
		"sap/ui/thirdparty/jquery",
		"sap/ui/core/Lib",
		"sap/ui/dom/jquery/scrollLeftRTL", // jQuery Plugin "scrollLeftRTL"
		"sap/ui/dom/jquery/scrollRightRTL", // jQuery Plugin "scrollRightRTL"
		"sap/ui/dom/jquery/Selectors" // jQuery custom selectors ":sapTabbable"
	],
	function (
		library,
		Button,
		ScrollContainer,
		Localization,
		Control,
		Element,
		Device,
		HeaderContainerItemNavigator,
		ItemNavigation,
		coreLibrary,
		IntervalTrigger,
		Icon,
		HeaderContainerRenderer,
		Log,
		KeyCodes,
		PseudoEvents,
		jQuery,
		CoreLib
	) {
		"use strict";

		// shortcut for sap.ui.core.Orientation
		var Orientation = coreLibrary.Orientation;
		var ScreenSizes = library.ScreenSizes;

		var HeaderContainerItemContainer = Control.extend("sap.m.HeaderContainerItemContainer", {
			metadata: {
				defaultAggregation: "item",
				properties: {
					/**
					 * This value is rendered as an <code>aria-posinset</code> attribute
					 */
					position: {
						type: "int",
						defaultValue: null
					},
					/**
					 * This value is rendered as an <code>aria-setsize</code> attribute
					 */
					setSize: {
						type: "int",
						defaultValue: null
					},
					/**
					 * This value is rendered as an <code>aria-labelledby</code> attribute
					 */
					ariaLabelledBy: {
						type: "string",
						defaultValue: null
					}
				},
				aggregations: {
					item: {
						type: "sap.ui.core.Control",
						multiple: false
					}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function (oRM, oControl) {
					var oInnerControl = oControl.getAggregation("item");
					if (!oInnerControl || !oInnerControl.getVisible()) {
						return;
					}

					oRM.openStart("div", oControl);
					oRM.class("sapMHdrCntrItemCntr");
					oRM.class("sapMHrdrCntrInner");
					oRM.attr("tabindex", -1);
					oRM.attr("aria-setsize", oControl.getSetSize());
					oRM.attr("aria-posinset", oControl.getPosition());
					oRM.attr("role", "listitem");
					if (oControl.getAriaLabelledBy()) {
						oRM.attr("aria-labelledby", oControl.getAriaLabelledBy());
					}
					oRM.openEnd();
					oRM.renderControl(oInnerControl);
					oRM.close("div");
				}
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
		 */
		var HeaderContainer = Control.extend("sap.m.HeaderContainer", /** @lends sap.m.HeaderContainer.prototype */ {
			metadata: {
				interfaces: ["sap.m.ObjectHeaderContainer"],
				library: "sap.m",
				properties: {
					/**
					 * Number of pixels to scroll when the user chooses Next or Previous buttons. Relevant only for desktop.
					 */
					scrollStep: {
						type: "int",
						defaultValue: 300,
						group: "Behavior"
					},
					/**
					 * Number of items to scroll when the user chose Next or Previous buttons. Relevant only for desktop.
					 * Have priority over 'ScrollStep'. Have to be positive number.
					 */
					scrollStepByItem: {
						type: "int",
						defaultValue: 1,
						group: "Behavior"
					},
					/**
					 * Scroll animation time in milliseconds.
					 */
					scrollTime: {
						type: "int",
						defaultValue: 500,
						group: "Behavior"
					},
					/**
					 * Indicates whether the incomplete item on the edge of visible area is displayed or hidden.
					 */
					showOverflowItem: {
						type: "boolean",
						defaultValue: true,
						group: "Behavior"
					},
					/**
					 * If set to true, it shows dividers between the different content controls.
					 */
					showDividers: {
						type: "boolean",
						defaultValue: true,
						group: "Appearance"
					},
					/**
					 * The orientation of the HeaderContainer. There are two orientation modes: horizontal and vertical. In horizontal mode
					 * the content controls are displayed next to each other, in vertical mode the content controls are displayed
					 * on top of each other.
					 */
					orientation: {
						type: "sap.ui.core.Orientation",
						defaultValue: Orientation.Horizontal,
						group: "Appearance"
					},
					/**
					 * Specifies the background color of the content. The visualization of the different options depends on the used theme.
					 */
					backgroundDesign: {
						type: "sap.m.BackgroundDesign",
						defaultValue: library.BackgroundDesign.Transparent,
						group: "Appearance"
					},
					/**
					 * The width of the whole HeaderContainer. If not specified, it is rendered as '100%' in horizontal orientation and as 'auto' in vertical orientation.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Appearance"},
					/**
					 * The height of the whole HeaderContainer. If not specified, it is rendered as 'auto' in horizontal orientation and as '100%' in vertical orientation.
					 */
					height: {type: "sap.ui.core.CSSSize", group: "Appearance"},
					/**
					* Enables grid layout in mobile view.
        			* @since 1.99
					* @experimental since 1.99
					*/
					gridLayout: {type: "boolean", defaultValue: false},
					/**
					 * The height of all the items is stretched to match the largest item in the row within the HeaderContainer.
					 *
					 * If set to <code>true</code>, the items are going to get stretched.
					 */
					snapToRow: {type: "boolean", group: "Appearance", defaultValue: false}
				},
				defaultAggregation: "content",
				aggregations: {
					/**
					 * Content to add to HeaderContainer.
					 */
					content: {
						type: "sap.ui.core.Control",
						multiple: true
					},
					/**
					 * Scroll container for smooth scrolling on different platforms.
					 */
					_scrollContainer: {
						type: "sap.m.ScrollContainer",
						multiple: false,
						visibility: "hidden"
					},
					/**
					 * Button that allows to scroll to previous section.
					 */
					_prevButton: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					},
					/**
					 * Button that allows to scroll to next section.
					 */
					_nextButton: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					}
				},
				associations: {
					/**
					 * Controls or IDs that label controls in the <code>content</code> aggregation.
					 * Each ariaLabelledBy item is assigned to its appropriate counterpart in the <code>content</code> aggregation.
					 * <br>If you want to annotate all the controls in the <code>content</code> aggregation, add the same number of items to the <code>ariaLabelledBy</code> annotation.
					 * <br>Can be used by screen reader software.
					 *
					 * @since 1.62.0
					 */
					ariaLabelledBy: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "ariaLabelledBy"
					}
				},
				events: {
					/**
					 * This event is triggered on pressing the scroll button.
					 */
					scroll: {

					}
				}
			},

			renderer: HeaderContainerRenderer
		});

		/* ============================================================ */
		/* Life-cycle Handling                                          */
		/* ============================================================ */

		HeaderContainer.prototype.init = function () {
			this._aItemEnd = [];
			this._bRtl = Localization.getRTL();
			this._oRb = CoreLib.getResourceBundleFor("sap.m");
			this._oScrollCntr = new ScrollContainer(this.getId() + "-scrl-cntnr", {
				width: "100%",
				height: "100%",
				horizontal: !Device.system.desktop
			});

			this.setAggregation("_scrollContainer", this._oScrollCntr, true);

			if (Device.system.desktop) {
				this._oArrowPrev = new Button({
					id: this.getId() + "-scrl-prev-button",
					type: library.ButtonType.Transparent,
					tooltip: this._oRb.getText("HEADERCONTAINER_BUTTON_PREV_SECTION"),
					press: function (oEvt) {
						oEvt.cancelBubble();
						this._scroll(this._getScrollValue(false), this.getScrollTime());
					}.bind(this)
				}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft");
				this._oArrowPrev._bExcludeFromTabChain = true;
				this.setAggregation("_prevButton", this._oArrowPrev, true);

				this._oArrowNext = new Button({
					id: this.getId() + "-scrl-next-button",
					type: library.ButtonType.Transparent,
					tooltip: this._oRb.getText("HEADERCONTAINER_BUTTON_NEXT_SECTION"),
					press: function (oEvt) {
						oEvt.cancelBubble();
						this._scroll(this._getScrollValue(true), this.getScrollTime());
					}.bind(this)
				}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight");
				this._oArrowNext._bExcludeFromTabChain = true;
				this.setAggregation("_nextButton", this._oArrowNext, true);
			} else if ((Device.system.phone || Device.system.tablet)) {
				if (!this._isMobileView()) {
					this._oArrowPrev = new Icon({
						id: this.getId() + "-scrl-prev-button"
					}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrLeft").addStyleClass("sapMHdrCntrBtnIcon");
					this.setAggregation("_prevButton", this._oArrowPrev, true);
					this._oArrowNext = new Icon({
						id: this.getId() + "-scrl-next-button"
					}).addStyleClass("sapMHdrCntrBtn").addStyleClass("sapMHdrCntrRight").addStyleClass("sapMHdrCntrBtnIcon");
					this.setAggregation("_nextButton", this._oArrowNext, true);
				}
			}

			this._oScrollCntr.addDelegate({
				onAfterRendering: function () {
					if (Device.system.desktop) {
						var oFocusRef = this._oScrollCntr.getDomRef("scroll");
						var oFocusObj = this._oScrollCntr.$("scroll");
						var aDomRefs = oFocusObj.find(".sapMHrdrCntrInner").attr("tabindex", "0");
						oFocusRef.setAttribute("role", "list");

						if (!this._oItemNavigation) {
							this._oItemNavigation = new HeaderContainerItemNavigator();
							this.addDelegate(this._oItemNavigation);
							this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._handleBorderReached, this);
							this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._handleAfterFocus, this);
							this._oItemNavigation.attachEvent(ItemNavigation.Events.BeforeFocus, this._handleBeforeFocus, this);
						}
						this._oItemNavigation.setRootDomRef(oFocusRef);
						this._oItemNavigation.setItemDomRefs(aDomRefs);
						this._oItemNavigation.setTabIndex0();
						this._oItemNavigation.setCycling(false);

						//Respecting Global Shortcuts like alt+right/left, cmd+right/left which is used for browser navigation with keyboard
	                    this._oItemNavigation.setDisabledModifiers({
	                        sapnext: ["alt", "meta"],
	                        sapprevious: ["alt", "meta"]
                        });

						this._handleMobileScrolling();
					}
					if (this._isMobileView()) {
						this._oScrollCntr.attachBrowserEvent("scrollstart", function(oEvent){
							var aItems = this._filterVisibleItems();
							this.aItemSize = [];
								this.aItemScrollValue = [0];
								var fnGetItemSize = function (oItem) {
									 if (oItem.getDomRef() && oItem.getDomRef().parentElement) {
										return oItem.getDomRef().parentElement.offsetWidth
										+ parseFloat(getComputedStyle(oItem.getDomRef().parentElement).marginLeft)
										+ parseFloat(getComputedStyle(oItem.getDomRef().parentElement).marginRight);
									 }
								};
								for (var i = 0; i < aItems.length; i++) {
									this.aItemSize.push(fnGetItemSize(aItems[i]));
									this.aItemScrollValue.push(this.aItemScrollValue[i] ? this.aItemScrollValue[i] + this.aItemSize[i] : this.aItemSize[i]);
								}
							this.triggerScrollStop = false;
						}.bind(this));
						this._oScrollCntr.attachBrowserEvent("scrollstop", function(oEvent){
							if (!this.triggerScrollStop) {
								var aItems = this._filterVisibleItems();
								this.triggerScrollStop = true;
								var iScrollValue = 0, iScrollOffset = 15;
								var oFinalItem = aItems[aItems.length - 1];
								var oScrollCntrDomRef = this._oScrollCntr.getDomRef();
								if ( oScrollCntrDomRef && oFinalItem){
									var oFinalItemParentDomRef = oFinalItem.getParent().getDomRef();
									var oFinalItemDomRef = oFinalItem.getDomRef();
									var iScrollContainerScrollLeft = oScrollCntrDomRef.scrollLeft;
									var iScrollContainerWidth = iScrollContainerScrollLeft + oScrollCntrDomRef.clientWidth;
									var iFinalElementScrollLeft = oFinalItemParentDomRef.offsetLeft;
									var iFinalElementContainerWidth = iFinalElementScrollLeft + oFinalItemDomRef.clientWidth;

									var bIsFinalItemVisible = ((iFinalElementContainerWidth <= iScrollContainerWidth) && (iFinalElementScrollLeft >= iScrollContainerScrollLeft));
									var iCurrectScrollValue = this._bRtl ? Math.abs(oEvent.currentTarget.scrollLeft) : oEvent.currentTarget.scrollLeft;

									if (bIsFinalItemVisible) {
										iScrollValue = this.aItemScrollValue[aItems.length - 1] - iScrollOffset - iCurrectScrollValue;
										this.triggerScrollStop = false;
									} else {
										var value = this.aItemScrollValue.reduce(function(a, b) {
											var aDiff = Math.abs(a - iCurrectScrollValue);
											var bDiff = Math.abs(b - iCurrectScrollValue);
											if (aDiff == bDiff) {
												return a > b ? a : b;
											} else {
												return bDiff < aDiff ? b : a;
											}
										});
										if (iCurrectScrollValue == 0) {
											iScrollValue = 0;
											this.triggerScrollStop = false;
										} else {
											iScrollValue = value - iScrollOffset - iCurrectScrollValue;
										}
									}
									this._scroll(iScrollValue, this.getScrollTime());
							}
						}
						}.bind(this));
					}
				}.bind(this)
			});
			IntervalTrigger.addListener(this._checkOverflow, this);
		};

		HeaderContainer.prototype.onBeforeRendering = function () {
			var isHorizontal = this.getOrientation() === Orientation.Horizontal,
				sIconPrev = isHorizontal ? "sap-icon://slim-arrow-left" : "sap-icon://slim-arrow-up",
				sIconNext = isHorizontal ? "sap-icon://slim-arrow-right" : "sap-icon://slim-arrow-down";
			if (!this.getHeight()) {
				Log.warning("No height provided", this);
			}
			if (!this.getWidth()) {
				Log.warning("No width provided", this);
			}
			if (Device.system.desktop) {
				this._oArrowPrev.setIcon(sIconPrev);
				this._oArrowNext.setIcon(sIconNext);
			} else if (Device.system.phone || Device.system.tablet) {
				this._oArrowPrev.setSrc(sIconPrev);
				this._oArrowNext.setSrc(sIconNext);
			}

			// before rendering starts, content items need to be updated - see _callSuperMethod
			this.getContent();
		};

		HeaderContainer.prototype.onAfterRendering = function () {
			this._bRtl = Localization.getRTL();
			this._checkOverflow();
		};

		HeaderContainer.prototype.exit = function () {
			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				this._oItemNavigation = null;
			}
			IntervalTrigger.removeListener(this._checkOverflow, this);
		};

		HeaderContainer.prototype.onsaptabnext = function (oEvt) {
			var oFocusables = this.$().find(":focusable"); // all tabstops in the control
			var iThis = oFocusables.index(oEvt.target); // focused element index
			var oNext = oFocusables.eq(iThis + 1).get(0); // next tab stop element
			var oFromCell = this._getParentCell(oEvt.target);
			var oToCell;
			if (oNext) {
				oToCell = this._getParentCell(oNext);
			}

			if ((oFromCell && oToCell && oFromCell.id !== oToCell.id) || (oNext && oNext.id === this.getId() + "-after") || (oNext && oNext.id === this.getId() + "-scrl-prev-button") || (oNext && oNext.id === this.getId() + "-scrl-next-button")) { // attempt to jump out of HeaderContainer
				var oLastInnerTab = oFocusables.last().get(0);
				if (oLastInnerTab) {
					this._bIgnoreFocusIn = true;
					oLastInnerTab.focus();
				}
			}
		};

		HeaderContainer.prototype.onsaptabprevious = function (oEvt) {
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
				this.$().trigger("focus"); // set focus before the control
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
		HeaderContainer.prototype.setOrientation = function (value) {
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

		HeaderContainer.prototype.validateAggregation = function (sAggregationName, oObject, bMultiple) {
			return this._callSuperMethod("validateAggregation", sAggregationName, oObject, bMultiple);
		};

		HeaderContainer.prototype.getAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			return this._callSuperMethod("getAggregation", sAggregationName, oObject, bSuppressInvalidate);
		};

		HeaderContainer.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			return this._callSuperMethod("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		};

		HeaderContainer.prototype.indexOfAggregation = function (sAggregationName, oObject) {
			return this._callSuperMethod("indexOfAggregation", sAggregationName, oObject);
		};

		HeaderContainer.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			return this._callSuperMethod("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		};

		HeaderContainer.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			return this._callSuperMethod("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		};

		HeaderContainer.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			return this._callSuperMethod("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
		};

		HeaderContainer.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
			return this._callSuperMethod("removeAllAggregation", sAggregationName, bSuppressInvalidate);
		};

		HeaderContainer.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
			return this._callSuperMethod("destroyAggregation", sAggregationName, bSuppressInvalidate);
		};

		/* =========================================================== */
		/* Private methods                                             */
		/* =========================================================== */
		/**
		 * Handle the key dwon event for Arrow Naviagtion.
		 * @param {jQuery.Event} oEvent - the keyboard event.
		 * @private
		 */
		 HeaderContainer.prototype.onkeydown = function(oEvent) {
			var bHorizontal = this.getOrientation() === Orientation.Horizontal,
				$prevButton = this.$("prev-button-container"),
				$nextButton = this.$("next-button-container"),
				iScrollSize, iButtonSize = 0,
				aItems = this._filterVisibleItems();
			if (oEvent.which === KeyCodes.ARROW_RIGHT && bHorizontal) {
				iScrollSize = aItems[oEvent.srcControl.mProperties.position - 1].$().parent().outerWidth(true);
				if (iScrollSize < this._getSize($prevButton.is(":visible"))){
					this._scroll((iScrollSize - iButtonSize), this.getScrollTime());
				}
			} else if (oEvent.which === KeyCodes.ARROW_LEFT && bHorizontal) {
				iScrollSize = aItems[oEvent.srcControl.mProperties.position - 1].$().parent().outerWidth(true);
				if (iScrollSize < this._getSize($nextButton.is(":visible"))) {
					if (!$nextButton.is(":visible")) {
						var OFFSET = 10;
						if (iScrollSize + OFFSET < this._getSize(true)) {
							iButtonSize = $nextButton.width() + OFFSET;
						} else {
							iButtonSize = $nextButton.width();
						}
					}
					this._scroll(-(iScrollSize - iButtonSize), this.getScrollTime());
				}
			}
			if (oEvent.which === KeyCodes.ARROW_DOWN && !bHorizontal) {
				iScrollSize = aItems[oEvent.srcControl.mProperties.position - 1].$().parent().outerHeight(true);
				if (iScrollSize < this._getSize($prevButton.is(":visible"))) {
					this._scroll((iScrollSize - iButtonSize), this.getScrollTime());
				}
			} else if (oEvent.which === KeyCodes.ARROW_UP && !bHorizontal) {
				iScrollSize = aItems[oEvent.srcControl.mProperties.position - 1].$().parent().outerHeight(true);
				if (iScrollSize < this._getSize($nextButton.is(":visible"))) {
					if (!$nextButton.is(":visible")) {
						var OFFSET = 10;
						if (iScrollSize + OFFSET < this._getSize(true)) {
							iButtonSize = $nextButton.height() + OFFSET;
						} else {
							iButtonSize = $nextButton.wheightidth();
						}
					}
					this._scroll(-(iScrollSize - iButtonSize), this.getScrollTime());
				}
			}
		};
		HeaderContainer.prototype._setScrollInProcess = function (value) {
			this.bScrollInProcess = value;
		};

		HeaderContainer.prototype._scroll = function (iDelta, iDuration) {
			this._setScrollInProcess(true);
			this.fireScroll();
			setTimeout(this._setScrollInProcess.bind(this, false), iDuration + 300);
			if (this.getOrientation() === Orientation.Horizontal) {
				this._hScroll(iDelta, iDuration);
			} else {
				this._vScroll(iDelta, iDuration);
			}
		};

		HeaderContainer.prototype._vScroll = function (delta, duration) {
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

		HeaderContainer.prototype._hScroll = function (delta, duration) {
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

		HeaderContainer.prototype._collectItemSize = function () {
			var iSize = 0,
				aItems = this._filterVisibleItems(),
				sFnName = this.getOrientation() === Orientation.Horizontal ? "outerWidth" : "outerHeight";

			this._aItemEnd = [];
			aItems.forEach(function (oItem, i) {
				iSize += oItem.$().parent()[sFnName](true);
				this._aItemEnd[i] = iSize;
			}, this);
		};

		HeaderContainer.prototype._getScrollValue = function (bForward) {
			if (!this._oScrollCntr) {
				return 0;
			}

			var bHorizontal = this.getOrientation() === Orientation.Horizontal,
				$scrollContainer = this._oScrollCntr.$(),
				$prevButton = this.$("prev-button-container"),
				$nextButton = this.$("next-button-container"),
				iScroll = bHorizontal ? $scrollContainer[0].scrollLeft : $scrollContainer[0].scrollTop,
				iTarget = 0, iSize = 0, iScrollSize,
				aItems = this._filterVisibleItems();

			var fnGetItemPosition = function (iIndex) {
				var iSize = 0,
					iButtonSize = 0;

				var OFFSET = 10;

				// RTL button offset fixes
				if (this._bRtl && bHorizontal) {
					if (!$prevButton.is(":visible")) {
						iButtonSize = $prevButton.width();
					}

					if (!$nextButton.is(":visible")) {
						iButtonSize = $nextButton.width();
					}
				}

				for (var i = 0; i < aItems.length && i < iIndex; i++) {
					iSize += fnGetItemSize(aItems[i]);
				}

				return iSize !== 0 ? iSize + OFFSET - iButtonSize : 0;

			}.bind(this);

			var fnGetItemSize = function (oItem) {
				return bHorizontal ? oItem.$().parent().outerWidth(true) : oItem.$().parent().outerHeight(true);
			};

			// this function ensures that after clicking right arrow (left for RTL) at least on item is shown
			// this does not by default happen in some cases when items are not of the same size
			var fnEnsureAtLeastOneItemMove = function () {
				var iSize = this._getSize(true),
					iMinScroll, iAdditionalScroll = 0;

				// find first invisible item (after scrolled element)
				// compute how many scrolling size is needed to fully display it
				// and iterate through all foregoing elements to reach this size
				for (var i = iTarget; i < aItems.length; i++) {
					if (!aItems[i].$().is(":visible")) {
						iMinScroll = fnGetItemSize(aItems[i]) + fnGetItemPosition(i) - iSize - iScroll;
						for (var k = iTarget; k < aItems.length && k < i; k++) {
							if (iScrollSize + iAdditionalScroll > iMinScroll) {
								break;
							}

							iTarget++;
							iAdditionalScroll += fnGetItemSize(aItems[k]);
						}

						iScrollSize += iAdditionalScroll;
						break;
					}
				}
			}.bind(this);

			if (this.getScrollStepByItem() > 0) {

				// start of the scrolling (three modes: vertical, horizontal and horizontal RTL)
				iScroll = bHorizontal && this._bRtl ? $scrollContainer.scrollRightRTL() : iScroll;

				// for different browser implementation (especially in RTL) we want to avoid offsetLeft and its variations
				// we sum width (height for vertical) of each item and compare it with scrolling start position
				for (var i = 0; i < aItems.length; i++) {
					iSize += fnGetItemSize(aItems[i]);
					if (iSize >= iScroll) {
						iTarget = i;
						break;
					}
				}

				iTarget = (bForward ? 1 : -1) * this.getScrollStepByItem() + iTarget;

				if (iTarget < 0) {
					iTarget = 0;
				}
				if (iTarget >= aItems.length) {
					iTarget = aItems.length - 1;
				}

				iScrollSize = fnGetItemPosition(iTarget) - iScroll;

				if (bForward && !this.getShowOverflowItem()) {
					fnEnsureAtLeastOneItemMove();
				}

				return iScrollSize;
			}

			return bForward ? this.getScrollStep() : -this.getScrollStep();
		};

		HeaderContainer.prototype._calculateRemainingScrolling = function (delta, duration, distance) {
			return Math.abs(distance * duration / (1000 * delta));
		};

		HeaderContainer.prototype._checkOverflow = function () {
			if (this.getOrientation() === Orientation.Horizontal) {
				this._checkHOverflow();
			} else {
				this._checkVOverflow();
			}
		};

		HeaderContainer.prototype._filterVisibleItems = function () {
			return this.getContent().filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		HeaderContainer.prototype._getFirstItemOffset = function (sType) {
			var oFirstItem = this._filterVisibleItems()[0],
				$firstItem = oFirstItem && oFirstItem.$(),
				$parent = $firstItem && $firstItem.parent(),
				iFirst = $parent && $parent[0] && $parent[0][sType];

			return iFirst || 0;
		};

		HeaderContainer.prototype._checkVOverflow = function () {
			var oBarHead = this._oScrollCntr.getDomRef(), oOldScrollBack, $ButtonContainer;

			if (oBarHead) {
				var iFirst = this._getFirstItemOffset("offsetTop");

				// in Chrome the scrollTop and scrollLeft return decimal value (in IE and Firefox return integer)
				// which results in one pixel smaller than actual value.
				var iScrollTop = Math.ceil(oBarHead.scrollTop);

				// check whether scrolling to the left is possible
				var bScrollBack = false;
				var bScrollForward = false;

				var realHeight = oBarHead.scrollHeight;
				//Take height using offsetHeight to handle Different Browsers Compatibility for a empty Header container during Vertical Orientation.
				var availableHeight = oBarHead.offsetHeight;

				if (Math.abs(realHeight - availableHeight) === 1) {
					realHeight = availableHeight;
				}

				if (iScrollTop > iFirst) {
					bScrollBack = true;
				}
				if ((realHeight > availableHeight) && (iScrollTop + availableHeight < realHeight)) {
					bScrollForward = true;
				}
				bScrollForward = this._checkForOverflowItem(bScrollForward);

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


		HeaderContainer.prototype._handleMobileScrolling = function () {
			if (Device.browser.mobile) {
				var $scroll = this.$("scrl-cntnr-scroll"),
					bIsHorizontal = this.getOrientation() === Orientation.Horizontal,
					sProperty = bIsHorizontal ? "clientX" : "clientY",
					iPos = 0,
					that = this,
					bScrolling = false;

				$scroll.on("touchstart", function (oEvent) {
					bScrolling = true;
					iPos = oEvent.targetTouches[0][sProperty];
				});

				$scroll.on("touchmove", function (oEvent) {
					if (bScrolling) {
						var fCurrent = oEvent.targetTouches[0][sProperty],
							iDelta = iPos - fCurrent,
							oScroller = that._oScrollCntr.getDomRef();

						bIsHorizontal ? oScroller.scrollLeft += iDelta : oScroller.scrollTop += iDelta;
						iPos = fCurrent;

						// prevent navigation
						oEvent.preventDefault();
					}
				});

				$scroll.on("touchend", function () {
					bScrolling = false;
				});
			}
		};

		HeaderContainer.prototype._checkHOverflow = function () {
			var oBarHead = this._oScrollCntr.getDomRef(), $ButtonContainer;

			if (oBarHead) {
				var iFirst = this._getFirstItemOffset("offsetLeft");
				// in Chrome the scrollTop and scrollLeft return decimal value (in IE and Firefox return integer)
				// which results in one pixel smaller than actual value.
				var iScrollLeft = Math.ceil(oBarHead.scrollLeft);

				// check whether scrolling to the left is possible
				var bScrollBack = false;
				var bScrollForward = false;

				var realWidth = oBarHead.scrollWidth;
				//Take width using offsetWidth to handle Different Browsers Compatibility for a empty Header container during Horizontal Orientation.
				var availableWidth = oBarHead.offsetWidth;

				if (Math.abs(realWidth - availableWidth) === 1) {
					realWidth = availableWidth;
				}
				if (this._bRtl) {
					var iScrollLeftRTL = jQuery(oBarHead).scrollLeftRTL();
					if (iScrollLeftRTL > 0) {
						bScrollForward = true;
					}
				} else if (iScrollLeft > iFirst) {
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

				bScrollForward = this._checkForOverflowItem(bScrollForward);

				var bOldScrollBack = $ButtonContainer.is(":visible");
				if (bOldScrollBack && !bScrollBack && !this._isMobileView()) {
					$ButtonContainer.hide();
					this.$().removeClass("sapMHrdrLeftPadding");
				}
				if (!bOldScrollBack && bScrollBack && !this._isMobileView()) {
					$ButtonContainer.show();
					this.$().addClass("sapMHrdrLeftPadding");
				}

				$ButtonContainer = this.$("next-button-container");
				var bOldScrollForward = $ButtonContainer.is(":visible");
				if (bOldScrollForward && !bScrollForward && !this._isMobileView()) {
					$ButtonContainer.hide();
					this.$().removeClass("sapMHrdrRightPadding");
				}
				if (!bOldScrollForward && bScrollForward && !this._isMobileView()) {
					$ButtonContainer.show();
					this.$().addClass("sapMHrdrRightPadding");
				}
			}
		};

		HeaderContainer.prototype._getSize = function (bAddOffset) {
			var $cont = this._oScrollCntr.$(),
				bHorizontal = this.getOrientation() === Orientation.Horizontal,
				$nextButton = this.$("next-button-container"),
				bContainerOffset = !$nextButton.is(":visible") && bAddOffset,
				sFnName = bHorizontal ? "width" : "height";

			return $cont[sFnName]() - (bContainerOffset ? $nextButton[sFnName]() : 0);
		};

		HeaderContainer.prototype._checkForOverflowItem = function (bScrollForward) {
			if (this._oScrollCntr && !this.getShowOverflowItem()) {
				var $cont = this._oScrollCntr.$(),
					bHorizontal = this.getOrientation() === Orientation.Horizontal,
					/*eslint-disable no-nested-ternary */
					iScroll = !bHorizontal ? $cont[0].scrollTop : (this._bRtl ? $cont.scrollRightRTL() : $cont[0].scrollLeft),
					/*eslint-enable no-nested-ternary */
					sFnName = bHorizontal ? "width" : "height",
					iSize = this._getSize(bScrollForward),
					aItems = this._filterVisibleItems();

				this._collectItemSize();

				// to hide overflow items we have to "hide" item itself and all other items behind it
				// but we need to set same width and height of the item to prevent breaking scrolling mechanisms
				// so we set current width (height) to the parent and hide its children
				// with such case, width (height) is remained but items are not visible

				this._aItemEnd.forEach(function (iEnd, i) {
					var $item = aItems[i].$(),
						$parent = $item.parent(),
						bVisible = $item.is(":visible");

					if (bScrollForward && iEnd > iScroll + iSize) {
						// this force at least one item is visible
						if (i === 0 || this._aItemEnd[i - 1] <= iScroll) {
							$parent.css(sFnName, "auto");
							$item.show();
						} else if (bVisible) {
							$parent[sFnName]($parent[sFnName]());
							$item.hide();

							bScrollForward = true;
						}
					} else {
						if (!bVisible) {
							$parent.css(sFnName, "auto");
							$item.show();
						}
					}
				}, this);
			}

			return bScrollForward;
		};

		HeaderContainer.prototype._handleBorderReached = function (oEvt) {
			var iIndex = oEvt.getParameter("index");
			if (iIndex === 0) {
				this._scroll(this._getScrollValue(false), this.getScrollTime());
			} else if (iIndex === this._filterVisibleItems().length - 1) {
				this._scroll(this._getScrollValue(true), this.getScrollTime());
			}
		};

		HeaderContainer.prototype._handleAfterFocus = function (oEvt) {
			var iIndex = oEvt.getParameter("index");
			if (iIndex === 0) {
				this._scroll(this._getScrollValue(false), this.getScrollTime());
			} else if (iIndex === this._filterVisibleItems().length - 1) {
				this._scroll(this._getScrollValue(true), this.getScrollTime());
			}

		};

		HeaderContainer.prototype._handleFocusAgain = function (oEvt) {
			oEvt.getParameter("event").preventDefault();
		};

		HeaderContainer.prototype._handleBeforeFocus = function (oEvt) {
			var oOriginalEvent = oEvt.getParameter("event");
			if (jQuery(oOriginalEvent.target).hasClass("sapMHdrCntrItemCntr") ||
				jQuery(oOriginalEvent.target).hasClass("sapMScrollContScroll") ||
				PseudoEvents.events.sapprevious.fnCheck(oOriginalEvent) ||
				PseudoEvents.events.sapnext.fnCheck(oOriginalEvent)) {
				this.$().find(".sapMHdrCntrItemCntr").css("border-color", "");
			} else {
				this.$().find(".sapMHdrCntrItemCntr").css("border-color", "transparent");
			}
		};

		HeaderContainer.prototype._isMobileView = function() {
			return this.getGridLayout()
						&& this.getOrientation() === Orientation.Horizontal
						&& Device.resize.width >= ScreenSizes.xsmall && Device.resize.width < ScreenSizes.tablet;
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
		HeaderContainer.prototype._unWrapHeaderContainerItemContainer = function (wrapped) {
			if (wrapped instanceof HeaderContainerItemContainer) {
				wrapped = wrapped.getItem();
			} else if (Array.isArray(wrapped)) {
				for (var i = 0; i < wrapped.length; i++) {
					if (wrapped[i] instanceof HeaderContainerItemContainer) {
						wrapped[i] = wrapped[i].getItem();
					}
				}
			}
			return wrapped;
		};

		HeaderContainer._AGGREGATION_FUNCTIONS = ["validateAggregation", "getAggregation", "setAggregation", "indexOfAggregation", "removeAggregation"];
		HeaderContainer._AGGREGATION_FUNCTIONS_FOR_INSERT = ["insertAggregation", "addAggregation"];
		HeaderContainer.prototype._callSuperMethod = function (sFunctionName, sAggregationName) {
			var args = Array.prototype.slice.call(arguments);
			if (sAggregationName === "content") {
				var oContent = args[2];
				args[1] = "content";
				if (oContent instanceof Control) {
					if (HeaderContainer._AGGREGATION_FUNCTIONS.indexOf(sFunctionName) > -1 && oContent.getParent() instanceof HeaderContainerItemContainer) {
						args[2] = oContent.getParent();
					} else if (HeaderContainer._AGGREGATION_FUNCTIONS_FOR_INSERT.indexOf(sFunctionName) > -1) {
						args[2] = new HeaderContainerItemContainer({
							item: oContent
						});
					}
				}

				//Traverse through the ScrollContainer Contents and remove the Contents which does not contain any Inner Items.
				var aContentsToRemove = [];
				this._oScrollCntr.getContent().forEach(function (oContent, index) {
					if (!oContent.getItem()) {
						aContentsToRemove.push(index);
					}
				});

				for (var i = 0; i < aContentsToRemove.length; i++ ) {
					this._oScrollCntr.removeContent(aContentsToRemove[i]);
				}

				var vResult = this._oScrollCntr[sFunctionName].apply(this._oScrollCntr, args.slice(1));

				if (sFunctionName !== "removeAllAggregation") {
					var aContent = this._oScrollCntr.getContent();
					var aAriaLabelledBy = this.getAriaLabelledBy();

					//Set the Position, Size based on visible containers
					var iPosition = 1;
					var iVisibleSize = aContent.filter(function (oContainer) {
						return oContainer.getItem().getVisible();
					}).length;

					for (var i = 0; i < aContent.length; i++) {
						var oItem = aContent[i];
						if (oItem.getItem().getVisible()) {
							oItem.setVisible(true);
							oItem.setPosition(iPosition);
							oItem.setSetSize(iVisibleSize);
							oItem.setAriaLabelledBy(aAriaLabelledBy[i]);
							iPosition++;
						} else {
							oItem.setVisible(false);
						}
					}
				}

				return this._unWrapHeaderContainerItemContainer(vResult);
			} else {
				return Control.prototype[sFunctionName].apply(this, args.slice(1));
			}
		};

		HeaderContainer.prototype._callMethodInManagedObject = function() {
			throw new TypeError("Method no longer exists: HeaderContainer.prototype._callMethodInManagedObject");
		};

		HeaderContainer.prototype._getParentCell = function (oDomElement) {
			return jQuery(oDomElement).parents(".sapMHrdrCntrInner").andSelf(".sapMHrdrCntrInner").get(0);
		};


		HeaderContainer.prototype.onfocusin = function (oEvt) {
			if (this._bIgnoreFocusIn) {
				this._bIgnoreFocusIn = false;
				return;
			}
			if (oEvt.target.id === this.getId() + "-after") {
				this._restoreLastFocused();
			}
		};

		HeaderContainer.prototype._restoreLastFocused = function () {
			if (!this._oItemNavigation) {
				return;
			}
			//get the last focused Element from the HeaderContainer
			var aNavigationDomRefs = this._oItemNavigation.getItemDomRefs();
			var iLastFocusedIndex = this._oItemNavigation.getFocusedIndex();
			var $LastFocused = jQuery(aNavigationDomRefs[iLastFocusedIndex]);

			// find related item control to get tabbables
			var oRelatedControl = Element.closestTo($LastFocused[0]) || {};
			var $Tabbables = oRelatedControl.getTabbables ? oRelatedControl.getTabbables() : $LastFocused.find(":sapTabbable");

			// get the last tabbable item or itself and focus
			$Tabbables.eq(-1).add($LastFocused).eq(-1).trigger("focus");
		};

		return HeaderContainer;
	});