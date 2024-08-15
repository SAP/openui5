/*!
 * ${copyright}
 */

// Provides control sap.uxap.AnchorBar.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/thirdparty/jquery",
	"sap/m/Button",
	"sap/m/MenuButton",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/ui/core/IconPool",
	"sap/ui/core/Item",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/Device",
	"sap/ui/core/CustomData",
	"sap/ui/core/Control",
	"./HierarchicalSelect",
	"./library",
	"sap/uxap/AnchorBarRenderer",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	// jQuery Plugin "scrollLeftRTL"
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(Localization, Element, Library, Theming, jQuery, Button, MenuButton, mobileLibrary, Toolbar, IconPool, Item, ResizeHandler, ScrollEnablement, HorizontalLayout, Device, CustomData, Control, HierarchicalSelect, library, AnchorBarRenderer, Log, ManagedObject) {
	"use strict";

	// shortcut for sap.m.SelectType
	var SelectType = mobileLibrary.SelectType;

	// 2px tollerance when calculating how much the scroll of the AnchorBar should be moved, when using arrow keys. This way the focus border is not cut.
	var OFFSET_SCROLL = 2;

	/**
	 * Constructor for a new <code>AnchorBar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays the titles of the sections and subsections in the {@link sap.uxap.ObjectPageLayout ObjectPageLayout}
	 * and allows the user to scroll to the respective content.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>AnchorBar</code> is internally generated as a menu in the <code>ObjectPageLayout</code>.
	 * It displays the sections and subsections and allows the user to directly scroll to the respective
	 * content by selecting them, while it remains visible at the top of the page (below the page header).
	 *
	 * @extends sap.m.Toolbar
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @since 1.26
	 * @see {@link topic:370b67986497463187336fa130aebbf1 Anchor Bar}
	 * @alias sap.uxap.AnchorBar
	 */
	var AnchorBar = Toolbar.extend("sap.uxap.AnchorBar", /** @lends sap.uxap.AnchorBar.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Determines whether to show a Popover with Subsection links when clicking on Section links in the Anchor bar.
				 */
				showPopover: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether the Anchor bar items are displayed in upper case.
				 */
				upperCase: {type: "boolean", defaultValue: false},

				/**
				 * Determines the background color of the <code>AnchorBar</code>.
				 *
				 * <b>Note:</b> The default value of <code>backgroundDesign</code> property is null.
				 * If the property is not set, the color of the background is <code>@sapUiObjectHeaderBackground</code>,
				 * which depends on the specific theme.
				 * @since 1.58
				*/
				backgroundDesign : {type: "sap.m.BackgroundDesign", group: "Appearance"}
			},
			associations: {

				/**
				 * The button that represents the Section being scrolled by the user.
				 */
				selectedButton: {type: "sap.m.Button", multiple: false}
			},
			aggregations: {

				_select: {type: "sap.uxap.HierarchicalSelect", multiple: false, visibility: "hidden"},
				_scrollArrowLeft: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				_scrollArrowRight: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			}
		},

		renderer: AnchorBarRenderer
	});

	AnchorBar.ButtonDelegate = {
		onAfterRendering: function () {
			var oButton = this.isA("sap.m.MenuButton") ? this._getButtonControl() : this,
				bSelected = this.hasStyleClass("sapUxAPAnchorBarButtonSelected");

			// set ARIA has-popup if button opens submenu
			if (this.data("bHasSubMenu")) {
				oButton.$().attr("aria-haspopup", "menu");

				// although the inner (arrow like) buttons are not focusable
				// set role 'none' since it is not allowed nesting
				// them in elements with role 'option'
				oButton.$().find(".sapMBtn")
					.attr("role", "none")
					// remove ARIA has-popup from inner elements
					// since they are not receiving any focus
					.removeAttr('aria-haspopup');
			}
			// set ARIA attributes of main buttons
			oButton.$().attr("aria-controls", this.data("sectionId")).attr("aria-selected", bSelected);
		}
	};

	AnchorBar.prototype.init = function () {
		if (Toolbar.prototype.init) {
			Toolbar.prototype.init.call(this);
		}

		this.addStyleClass("sapUxAPAnchorBar");

		this._oPressHandlers = {};  //keep references on the press handlers we set on first level items (in case of behavior change)
		this._oSectionInfo = {};    //keep scrolling info on sections
		this._oScroller = null;
		this._sSelectedKey = null; // keep track of sap.uxap.HierarchicalSelect selected key
		this._bRtl = Localization.getRTL();

		//there are 2 different uses cases:
		//case 1: on a real phone we don't need the scrolling anchorBar, just the hierarchicalSelect
		//case 2: on a real tablet or a desktop we need both as the size may change
		this._bHasButtonsBar = Device.system.tablet || Device.system.desktop;

		this.oLibraryResourceBundleOP = Library.getResourceBundleFor("sap.uxap"); // get resource translation bundle

		this._oSelect = this._getHierarchicalSelect();

		//case 2 requires the scrolling anchorBar
		if (this._bHasButtonsBar) {
			//horizontal scrolling
			this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
				horizontal: true,
				vertical: false,
				nonTouchScrolling: true
			});

			this._iREMSize = 0;
			this._iTolerance = 0;
			this._iOffset = 0;

			//listen to resize
			this._sResizeListenerId = undefined; //defined in onAfterRendering
		}

		//composite controls
		this.setDesign("Transparent"); //styling is coming from css
	};

	/*******************************************************************************
	 * UX design
	 ******************************************************************************/
	AnchorBar.SCROLL_STEP = 250;// how many pixels to scroll with every overflow arrow click
	AnchorBar.SCROLL_DURATION = 500; // ms
	AnchorBar.DOM_CALC_DELAY = 200; // ms

	AnchorBar.prototype.setSelectedButton = function (oButton) {
		var sPreviouslySelectedButtonId = this.getSelectedButton(),
			oPreviouslySelectedButton,
			aSelectItems = this._oSelect.getItems(),
			bHasSelectItems = aSelectItems.length > 0;

		if (typeof oButton === "string") {
			oButton = Element.getElementById(oButton);
		}

		if (oButton) {

			if (oButton.getId() === sPreviouslySelectedButtonId) {
				return this;
			}

			var oSelectedSectionId = oButton.data("sectionId");
			this._sSelectedKey = oSelectedSectionId;

			if (oSelectedSectionId && bHasSelectItems) {
				this._oSelect.setSelectedKey(oSelectedSectionId);
			}

			if (this._bHasButtonsBar && oButton.data("secondLevel") !== true) {

				oPreviouslySelectedButton = Element.getElementById(sPreviouslySelectedButtonId);
				this._toggleSelectionStyleClass(oPreviouslySelectedButton, false);
				this._toggleSelectionStyleClass(oButton, true);

				if (oSelectedSectionId) {
					this.scrollToSection(oSelectedSectionId, AnchorBar.SCROLL_DURATION);
				}

				this._setAnchorButtonsTabFocusValues(oButton);
			}

			this.setAssociation("selectedButton", oButton, true /* don't rerender */);
		}

		return this;
	};

	AnchorBar.prototype.setShowPopover = function (bValue, bSuppressInvalidate) {

		if (this.getShowPopover() === bValue) {
			return this;
		}

		return this.setProperty("showPopover", bValue, true /* always trigger re-rendering manually */);
	};

	AnchorBar.prototype.getSelectedSection = function () {

		var oSelectedButton = this.getSelectedButton();

		if (oSelectedButton && (typeof (oSelectedButton) === "string" )) {
			oSelectedButton = Element.getElementById(oSelectedButton);
		}

		if (oSelectedButton && (oSelectedButton instanceof Button)
			&& oSelectedButton.data("sectionId")) {

			return Element.getElementById(oSelectedButton.data("sectionId"));
		}

		return null;
	};

	/**
	 * create phone equivalents for each of the provided content controls
	 */
	AnchorBar.prototype.onBeforeRendering = function () {
		if (this._bHasButtonsBar) {
			this._iREMSize = parseInt(jQuery("body").css("font-size"));
			this._iTolerance = this._iREMSize * 1;  // 1 rem
			this._iOffset = this._iREMSize * 3;  // 3 rem
		}

		if (Toolbar.prototype.onBeforeRendering) {
			Toolbar.prototype.onBeforeRendering.call(this);
		}

		var aContent = this.getContent() || [],
			bUpperCase = this.getUpperCase();

		this._oSelect.setUpperCase(bUpperCase);
		this.toggleStyleClass("sapUxAPAnchorBarUpperCase", bUpperCase);

		if (aContent.length > 0 && this._sSelectedKey) {
			this._oSelect.setSelectedKey(this._sSelectedKey);
		}
	};

	AnchorBar.prototype.addContent = function (oButton, bInvalidate) {
		var bIsSecondLevel = oButton.data("secondLevel") === true || oButton.data("secondLevel") === "true";
		oButton.addStyleClass("sapUxAPAnchorBarButton");
		oButton.removeAllAriaDescribedBy();

		this._createSelectItem(oButton, bIsSecondLevel);

		if (bIsSecondLevel) {
			oButton.destroy();
		} else {
			oButton.addEventDelegate(AnchorBar.ButtonDelegate, oButton);
			this.addAggregation("content", oButton, bInvalidate);
		}

		return this;
	};

	AnchorBar.prototype._removeButtonsDelegate = function () {
		var aContent = this.getContent();

		aContent.forEach(function (oButton) {
			oButton.removeEventDelegate(AnchorBar.ButtonDelegate);
		});
	};

	AnchorBar.prototype._createSelectItem = function (oButton, bIsSecondLevel) {
		//create the phone equivalent item if the button has some visible text (UX rule)
		var oBindingInfo = oButton.getBindingInfo("text"),
			bButtonHasText = oButton.getText().trim() != "" || oBindingInfo;
		if (bButtonHasText && (!bIsSecondLevel || oButton.data("bTitleVisible") === true)) {
			var oPhoneItem = new Item({
				key: oButton.data("sectionId"),
				text: ManagedObject.escapeSettingsValue(oButton.getText()),
				customData: [
					new CustomData({
						key: "secondLevel",
						value: oButton.data("secondLevel")
					})
				]
			});

			if (oBindingInfo) {
				oPhoneItem.bindProperty("text", Object.assign({}, oBindingInfo));
			}

			this._oSelect.addItem(oPhoneItem);
		}
	};

	AnchorBar.prototype._decorateSubMenuButtons = function (oEvent) {
		var aContent = oEvent.getSource().getContent();

		aContent.forEach(function (oButton) {
			oButton.$().attr("aria-controls", oButton.data("sectionId"));
		});
	};

	AnchorBar.prototype._toggleSelectionStyleClass = function(oButton, bAdd) {
		if (oButton && oButton.toggleStyleClass) {
			oButton.toggleStyleClass("sapUxAPAnchorBarButtonSelected", bAdd);
			if (oButton instanceof MenuButton) {
				oButton._getButtonControl().$().attr("aria-selected", bAdd);
			} else {
				oButton.$().attr("aria-selected", bAdd);
			}
		}
	};

	AnchorBar.prototype.onButtonPress = function (oEvent) {
		this.fireEvent("_anchorPress", {
			sectionBaseId: oEvent.getSource().data("sectionId")
		});
	};

	/**
	 * called on phone display only when a user selects a section to navigate to
	 * simulate the press on the corresponding button
	 * @param {*} oEvent event
	 * @private
	 */
	AnchorBar.prototype._onSelectChange = function (oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem"),
			oSelectedSection,
			oSelectedSectionDomRef;

		if (!oSelectedItem) {
			Log.warning("AnchorBar :: no selected hierarchicalSelect item");
			return;
		}

		oSelectedSection = Element.getElementById(oSelectedItem.getKey());

		if (oSelectedSection) {
			this.fireEvent("_anchorPress", { sectionBaseId: oSelectedSection.getId() });
			oSelectedSectionDomRef = oSelectedSection.getDomRef();

			if (oSelectedSectionDomRef) {
				setTimeout(function () {
					oSelectedSectionDomRef.focus();
				}, 0);
			}
		} else {
			Log.error("AnchorBar :: cannot find corresponding section", oSelectedItem.getKey());
		}
	};

	AnchorBar.prototype._getHierarchicalSelect = function () {

		if (!this.getAggregation('_select')) {

			this.setAggregation('_select', new HierarchicalSelect({
				width: "100%",
				icon: "sap-icon://slim-arrow-down",
				tooltip: this.oLibraryResourceBundleOP.getText("ANCHOR_BAR_OVERFLOW"),
				change: jQuery.proxy(this._onSelectChange, this)
			}));
		}

		return this.getAggregation('_select');
	};

	/**
	 * Creates a new scroll arrow. The scroll arrow consists of two controls:
	 * 1. A HorizontalLayout which is used to display the gradient mask and to serve as a container for the arrow.
	 * 2. A Button which displays the arrow itself.
	 * In bluecrystal theme the button appears when hovering over the gradient mask and is not focusable.
	 * In HCB, the button is always visible and can receive focus.
	 *
	 * @param {boolean} bLeft indicates whether this is the left button
	 * @return {sap.ui.layout.HorizontalLayout} a new scroll arrow
	 * @private
	 */
	AnchorBar.prototype._createScrollArrow = function (bLeft) {
		var sArrowId,
			sIconName,
			sArrowClass,
			sArrowTooltip,
			oScrollButton,
			that = this,
			sTooltipLeft = this.oLibraryResourceBundleOP.getText("TOOLTIP_OP_SCROLL_LEFT_ARROW"),
			sTooltipRight = this.oLibraryResourceBundleOP.getText("TOOLTIP_OP_SCROLL_RIGHT_ARROW");

		if (bLeft) {
			sArrowId = this.getId() + "-arrowScrollLeft";
			sIconName = "slim-arrow-left";
			sArrowClass = "anchorBarArrowLeft";
			sArrowTooltip = this._bRtl ? sTooltipRight : sTooltipLeft;
		} else {
			sArrowId = this.getId() + "-arrowScrollRight";
			sIconName = "slim-arrow-right";
			sArrowClass = "anchorBarArrowRight";
			sArrowTooltip = this._bRtl ? sTooltipLeft : sTooltipRight;
		}

		oScrollButton = new Button(sArrowId, {
			icon: IconPool.getIconURI(sIconName),
			type: "Transparent",
			press: function (oEvent) {
				oEvent.preventDefault();
				that._handleScrollButtonTap(bLeft);
			},
			tooltip: sArrowTooltip
		});

		oScrollButton.addEventDelegate({
			onAfterRendering: function () {
				if (Theming.getTheme() != "sap_hcb") {
					this.$().attr("tabindex", -1);
				}
			},
			onThemeChanged: function () {
				if (Theming.getTheme() == "sap_hcb") {
					this.$().removeAttr("tabindex");
				} else {
					this.$().attr("tabindex", -1);
				}
			}
		}, oScrollButton);

		return new HorizontalLayout({
			content: [oScrollButton]
		}).addStyleClass("anchorBarArrow").addStyleClass(sArrowClass);
	};

	/**
	 * Overwritten getter for aggregation "_scrollArrowLeft".
	 * Implements lazy loading mechanism.
	 *
	 * @return {sap.ui.layout.HorizontalLayout} reference to the left scroll arrow instance
	 * @private
	 */
	AnchorBar.prototype._getScrollArrowLeft = function () {

		var oScrollArrowLeft = this.getAggregation("_scrollArrowLeft");

		if (oScrollArrowLeft) {
			return oScrollArrowLeft;
		} else {
			oScrollArrowLeft = this._createScrollArrow(true);
			this.setAggregation("_scrollArrowLeft", oScrollArrowLeft);
			return oScrollArrowLeft;
		}
	};

	/**
	 * Overwritten getter for aggregation "_scrollArrowRight".
	 * Implements lazy loading mechanism.
	 *
	 * @return {sap.ui.layout.HorizontalLayout} reference to the right scroll arrow instance
	 * @private
	 */
	AnchorBar.prototype._getScrollArrowRight = function () {

		var oScrollArrowRight = this.getAggregation("_scrollArrowRight");

		if (oScrollArrowRight) {
			return oScrollArrowRight;
		} else {
			oScrollArrowRight = this._createScrollArrow(false);
			this.setAggregation("_scrollArrowRight", oScrollArrowRight);
			return oScrollArrowRight;
		}
	};

	/*******************************************************************************
	 * Horizontal scrolling
	 ******************************************************************************/
	AnchorBar.prototype._applyHierarchicalSelectMode = function () {

		if (this._sHierarchicalSelectMode === AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon) {
			this.$().find(".sapUxAPAnchorBarScrollContainer").show();

			this._oSelect.setWidth("auto");
			this._oSelect.setAutoAdjustWidth(true);
			this._oSelect.setType(SelectType.IconOnly);
			this._computeBarSectionsInfo();

		} else {
			this.$().find(".sapUxAPAnchorBarScrollContainer").hide();

			this._oSelect.setWidth("100%");
			this._oSelect.setAutoAdjustWidth(false);
			this._oSelect.setType(SelectType.Default);
		}

		this.$().toggleClass("sapUxAPAnchorBarOverflow", this._sHierarchicalSelectMode === AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon);
	};

	AnchorBar.prototype._adjustSize = function (oEvent) {

		//size changed => check if switch in display-mode (phone-view vs. desktop-view) needed
		var oMediaRange = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD, this._getWidth(this)),
			bWidthChange = oEvent && oEvent.size && (oEvent.size.width !== oEvent.oldSize.width),
			sNewMode = library.Utilities.isPhoneScenario(oMediaRange) ?
			AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Text :
			AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon;

		if (sNewMode !== this._sHierarchicalSelectMode) {
			this._sHierarchicalSelectMode = sNewMode;
			this._applyHierarchicalSelectMode();
		}

		//size changed => check if overflow gradients needed
		if (this._sHierarchicalSelectMode === AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon) {

			//don't go any further if the positions of the items are not calculated yet
			if (this._iMaxPosition < 0) {
				return;
			}

			var $dom = this.$(),
				$scrollContainer = $dom.find(".sapUxAPAnchorBarScrollContainer"),
				bNeedScrollingBegin,
				bNeedScrollingEnd,
				iContainerWidth,
				iScrollLeft,
				fnSwapBeginEnd = function swapBeginEnd () {
					var vSwap = bNeedScrollingBegin;
					bNeedScrollingBegin = bNeedScrollingEnd;
					bNeedScrollingEnd = vSwap;
				};

			// if width has changed we need to scroll AnchorBar to selected section
			if (bWidthChange) {
				this.scrollToSection(this._sSelectedKey);
			}

			iContainerWidth = $scrollContainer.width();
			iScrollLeft = this._bRtl ? $scrollContainer.scrollLeftRTL() : $scrollContainer.scrollLeft();

			bNeedScrollingBegin = iScrollLeft >= this._iTolerance;
			bNeedScrollingEnd = iScrollLeft + iContainerWidth < (this._iMaxPosition - this._iTolerance);

			if (this._bRtl) {
				fnSwapBeginEnd();
			}

			Log.debug("AnchorBar :: scrolled at " + iScrollLeft, "scrollBegin [" + (bNeedScrollingBegin ? "true" : "false") + "] scrollEnd [" + (bNeedScrollingEnd ? "true" : "false") + "]");

			$dom.toggleClass("sapUxAPAnchorBarScrollLeft", bNeedScrollingBegin);
			$dom.toggleClass("sapUxAPAnchorBarScrollRight", bNeedScrollingEnd);
		}


	};

	/**
	 * Handles scrolling via the scroll buttons.
	 *
	 * @param {boolean} bScrollLeft Indicates whether the left arrow button was pressed
	 * @private
	 */
	AnchorBar.prototype._handleScrollButtonTap = function (bScrollLeft) {

		/* calculate the direction where to scroll
		 increase if:
		 - ltr and right arrow was pressed
		 - rtl and the left arrow was pressed
		 decrease if:
		 - ltr and the left arrow was pressed
		 - rtl and the right arrow was pressed */
		var iScrollDirection = ((!this._bRtl && bScrollLeft) || (this._bRtl && !bScrollLeft)) ? -1 : 1;

		this._oScroller.scrollTo(this._iMaxPosition * iScrollDirection, 0, AnchorBar.SCROLL_DURATION * 3); //increase scroll duration when scrolling to the other end of the anchorBar (UX requirement)
	};

	/**
	 * Scroll to a specific Section.
	 *
	 * @param {string} sId The Section ID to scroll to
	 * @param {int} [iDuration=0] Scroll duration (in ms)
	 * @public
	 */
	AnchorBar.prototype.scrollToSection = function (sId, iDuration) {

		if (this._bHasButtonsBar) {
			var oMediaRange = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD, this._getWidth(this)),
				iDuration = iDuration || AnchorBar.SCROLL_DURATION,
				iScrollTo;

			if (!library.Utilities.isPhoneScenario(oMediaRange)
				&& this._oSectionInfo[sId]) {

				if (this._bRtl && Device.browser.firefox) {
					// in firefox RTL mode we are working with negative numbers and we have to add the offset in order not to hide the selected item
					iScrollTo = this._oSectionInfo[sId].scrollLeft + this._iOffset;
				} else {
						//scroll to the positionRtl minus the offset (so the gradient never hide the selected item)
						iScrollTo = this._oSectionInfo[sId].scrollLeft - this._iOffset;
						if (iScrollTo < 0) { //do not allow hiding part of the content if negative value for scroll is calculated here
							iScrollTo = 0;
						}
				}

				Log.debug("AnchorBar :: scrolling to section " + sId + " of " + iScrollTo);

				//avoid triggering twice the scrolling onto the same target section
				if (this._sCurrentScrollId != sId) {
					this._sCurrentScrollId = sId;

					if (this._iCurrentScrollTimeout) {
						clearTimeout(this._iCurrentScrollTimeout);
						this.$("scroll").parent().stop(true, false);
					}

					this._iCurrentScrollTimeout = setTimeout(function () {
						this._sCurrentScrollId = undefined;
						this._iCurrentScrollTimeout = undefined;
					}.bind(this), iDuration);

					this._oScroller.scrollTo(iScrollTo, 0, iDuration);
				}
			} else {
				Log.debug("AnchorBar :: no need to scroll to " + sId);
			}
		}
	};

	/**
	 * Scrolls to the currently selected Section tab, when the header titles is snapped/unsnapped
	 *
	 * @public
	 */
	AnchorBar.prototype.scrollToCurrentlySelectedSection = function () {
		var sSelectedButton = this.getSelectedButton(),
			oSelectedButton = Element.getElementById(sSelectedButton),
			sSelectedSectionId;

		if (oSelectedButton) {
			sSelectedSectionId = oSelectedButton.data("sectionId");
			this.scrollToSection(sSelectedSectionId, 0);
		}
	};

	// use type 'object' because Metamodel doesn't know ScrollEnablement
	/**
	 * Returns an sap.ui.core.delegate.ScrollEnablement object used to handle scrolling.
	 *
	 * @type object
	 * @public
	 * @returns {sap.ui.core.delegate.ScrollEnablement} The <code>sap.ui.core.delegate.ScrollEnablement</code> instance
	 */
	AnchorBar.prototype.getScrollDelegate = function () {
		return this._oScroller;
	};

	/*******************************************************************************
	 * Keyboard navigation
	 ******************************************************************************/
	AnchorBar.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	/**
	 * Handles RIGHT key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapright = function (oEvent) {
		oEvent.preventDefault();

		var iNextIndex,
			aAnchors = this.getContent(),
			oAnchor;

		aAnchors.forEach(function (oAnchor, iAnchorIndex) {
			if (oEvent.target.id.indexOf(oAnchor.getId()) > -1) {
				iNextIndex = iAnchorIndex + 1;
				return;
			}
		});

		if (iNextIndex && aAnchors[iNextIndex]) {
			oAnchor = aAnchors[iNextIndex];
			oAnchor.focus();
		} else if (aAnchors[aAnchors.length - 1]) {
			oAnchor = aAnchors[aAnchors.length - 1];
			oAnchor.focus();
		}

		this._forceScrollIfNeeded(oAnchor);
	};

	/**
	 * Handles LEFT key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapleft = function (oEvent) {
		oEvent.preventDefault();

		var iNextIndex,
			aAnchors = this.getContent(),
			oAnchor;

		aAnchors.forEach(function (oAnchor, iAnchorIndex) {
			if (oEvent.target.id.indexOf(oAnchor.getId()) > -1) {
				iNextIndex = iAnchorIndex - 1;
				return;
			}
		});

		if (iNextIndex && aAnchors[iNextIndex]) {
			oAnchor = aAnchors[iNextIndex];
			oAnchor.focus();
		} else if (aAnchors[0]) {
			oAnchor = aAnchors[0];
			oAnchor.focus();
		}

		this._forceScrollIfNeeded(oAnchor, true);
	};

	/**
	 * Checks if AnchorBar should be scrolled and scrolls it forcly, if needed.
	 *
	 * @param {object} oAnchor
	 * @param {boolean} bLeft
	 * @private
	 */
	AnchorBar.prototype._forceScrollIfNeeded = function (oAnchor, bLeft) {
		var oAnchorDomRef = oAnchor.getDomRef(),
			oParentRef = oAnchorDomRef.parentElement,
			iParentRefOffsetLeft = oParentRef.offsetLeft,
			oParentRefOffsetWidth = oParentRef.offsetWidth,
			iAnchorDomRefWidth = oAnchorDomRef && oAnchorDomRef.offsetWidth,
			iAnchorDomOffsetLeft = oAnchorDomRef && oAnchorDomRef.offsetLeft,
			iCurrentScrollPosition = this._oScroller.getScrollLeft(),
			iVisibleScrollPosition,
			iAnchorPosition,
			iOffsetScroll;

		if (!oParentRef || !iAnchorDomRefWidth) {
			return;
		}

		if (!this._bRtl) {
			// The right position of the tab
			iAnchorPosition =  iAnchorDomOffsetLeft + iAnchorDomRefWidth;

			// Calculates how much the scroll container should be scrolled, so that the right position of the tab will be visible
			iOffsetScroll = oParentRefOffsetWidth - (iParentRefOffsetLeft + iAnchorPosition - iCurrentScrollPosition);
			if (!bLeft && iOffsetScroll < 0 && oParentRefOffsetWidth - iAnchorPosition < 0) {
				this._scrollAnchorBar(bLeft, iOffsetScroll);
			}

			// Calculates how much the scroll container should be scrolled, so that the left position of the tab will be visible
			iOffsetScroll = iAnchorDomOffsetLeft - this._iOffset - iParentRefOffsetLeft - OFFSET_SCROLL;
			if (bLeft && iCurrentScrollPosition > iOffsetScroll) {
				this._scrollAnchorBar(bLeft, iOffsetScroll);
			}
		} else {
			if (bLeft) {
				// The last visible right position of the scroll container (in RTL left/right scrolling is reversed)
				iVisibleScrollPosition =  iCurrentScrollPosition + oParentRefOffsetWidth - this._iOffset;
				// The right position of the tab
				iAnchorPosition = iAnchorDomOffsetLeft - iParentRefOffsetLeft;

				if (iAnchorPosition + iAnchorDomRefWidth > iVisibleScrollPosition) {
					// Calculates how much the scroll container should be scrolled, so that the right position of the tab will be visible
					iOffsetScroll = ((iAnchorPosition + iAnchorDomRefWidth) - iVisibleScrollPosition + OFFSET_SCROLL);
					this._scrollAnchorBar(bLeft, iOffsetScroll);
				}
			} else {
				if (iAnchorDomOffsetLeft - iParentRefOffsetLeft - this._iOffset - OFFSET_SCROLL < iCurrentScrollPosition) {
					// Calculates how much the scroll container should be scrolled, so that the left position of the tab will be visible
					iOffsetScroll = iAnchorDomRefWidth - iAnchorDomOffsetLeft + OFFSET_SCROLL;
					this._scrollAnchorBar(bLeft, iOffsetScroll);
				}
			}
		}
	};

	/**
	 * Forcly scrolls AnchorBar, if the currently focused tab is not fully visible.
	 *
	 * @param {boolean} bScrollLeft
	 * @param {number} iOffsetScroll
	 * @private
	 */
	AnchorBar.prototype._scrollAnchorBar = function (bScrollLeft, iOffsetScroll) {
		var iScrollDirection = ((!this._bRtl && bScrollLeft) || (this._bRtl && !bScrollLeft)) ? -1 : 1,
			iCurrentScrollPosition = this._oScroller.getScrollLeft(),
			iNewScrollPosition = iOffsetScroll;

		if (iScrollDirection === 1) {
			iNewScrollPosition = this._bRtl ? iCurrentScrollPosition + iOffsetScroll : iCurrentScrollPosition + Math.abs(iOffsetScroll);
		}

		if (this._bRtl && iScrollDirection === -1) {
			iNewScrollPosition = iOffsetScroll * iScrollDirection;
		}

		this._oScroller.scrollTo(iNewScrollPosition, 0, AnchorBar.SCROLL_DURATION * 3);
	};

	/**
	 * Handles DOWN key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapdown = function (oEvent) {
		oEvent.preventDefault();
	};

	/**
	 * Handles UP key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapup = function (oEvent) {
		oEvent.preventDefault();
	};

	/**
	 * Handles HOME key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsaphome = function (oEvent) {
		oEvent.preventDefault();

		var aAnchors = this.getContent();

		aAnchors[0].focus();
	};

	/**
	 * Handles END key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapend = function (oEvent) {
		oEvent.preventDefault();

		var aAnchors = this.getContent();

		aAnchors[aAnchors.length - 1].focus();
	};

	/**
	 * Handles PAGE UP key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsappageup = function (oEvent) {
		this._handlePageUp(oEvent);
	};

	/**
	 * Handles PAGE DOWN key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsappagedown = function (oEvent) {
		this._handlePageDown(oEvent);
	};

	/**
	 * Handler for sappageup event.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype._handlePageUp = function (oEvent) {
		oEvent.preventDefault();

		var iNextIndex;
		var aAnchors = this.getContent();

		aAnchors.forEach(function (oAnchor, iAnchorIndex) {
			if (oEvent.target.id.indexOf(oAnchor.getId()) > -1) {
				iNextIndex = iAnchorIndex - (AnchorBar.PAGEUP_AND_PAGEDOWN_JUMP_SIZE + 1);
				return;
			}
		});

		if (iNextIndex && aAnchors[iNextIndex]) {
			aAnchors[iNextIndex].focus();
		} else if (aAnchors[0]) {
			aAnchors[0].focus();
		}
	};

	/**
	 * Handler for sappagedown event.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype._handlePageDown = function (oEvent) {
		oEvent.preventDefault();

		var iNextIndex;
		var aAnchors = this.getContent();

		aAnchors.forEach(function (oAnchor, iAnchorIndex) {
			if (oEvent.target.id.indexOf(oAnchor.getId()) > -1) {
				iNextIndex = iAnchorIndex + AnchorBar.PAGEUP_AND_PAGEDOWN_JUMP_SIZE + 1;
				return;
			}
		});

		if (iNextIndex && aAnchors[iNextIndex]) {
			aAnchors[iNextIndex].focus();
		} else if (aAnchors[aAnchors.length - 1]) {
			aAnchors[aAnchors.length - 1].focus();
		}
	};

	/**
	 * handle tab focusing
	 */
	AnchorBar.prototype._setAnchorButtonsTabFocusValues = function (oSelectedButton) {
		var aAnchorBarContent = this.getContent() || [],
			$anchorBarItem,
			sFocusable = '0',
			sNotFocusable = '-1',
			sTabIndex = "tabIndex";

		aAnchorBarContent.forEach(function (oAnchorBarItem) {
			$anchorBarItem = oAnchorBarItem.getAggregation("_button") ? oAnchorBarItem.getAggregation("_button").$() : oAnchorBarItem.$();
			if (oAnchorBarItem === oSelectedButton) {
				$anchorBarItem.attr(sTabIndex, sFocusable);
			} else {
				$anchorBarItem.attr(sTabIndex, sNotFocusable);
			}
		});
	};

	/**
	 * called for figuring out responsive scenarios
	 */
	AnchorBar.prototype.onAfterRendering = function () {
		var oSelectedButton;
		if (Toolbar.prototype.onAfterRendering) {
			Toolbar.prototype.onAfterRendering.call(this);
		}

		oSelectedButton = Element.getElementById(this.getSelectedButton());
		this._setAnchorButtonsTabFocusValues(oSelectedButton);

		//save max for arrow show/hide management, the max position is the required scroll for the item to be fully visible
		this._iMaxPosition = -1;

		//show/hide scrolling arrows
		this._sResizeListenerId = ResizeHandler.register(this, jQuery.proxy(this._adjustSize, this));

		this.$().find(".sapUxAPAnchorBarScrollContainer").on("scroll", jQuery.proxy(this._onScroll, this));

		//restore state from previous rendering
		if (oSelectedButton) {
			this.setSelectedButton(oSelectedButton);
		}

		//initial state
		if (this._bHasButtonsBar) {
			this._iComputeContentSizeTimeout = setTimeout(function () {
				if (this._sHierarchicalSelectMode === AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon) {
					this._computeBarSectionsInfo();
				}
				this._adjustSize();
				this._iComputeContentSizeTimeout = null;
			}.bind(this), AnchorBar.DOM_CALC_DELAY);
		}
	};

	AnchorBar.prototype.onThemeChanged = function () {
		if (this._sHierarchicalSelectMode === AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon) {
			this._computeBarSectionsInfo();
		}
	};

	AnchorBar.prototype._onScroll = function () {
		if (!this._iCurrentSizeCheckTimeout) {
			this._iCurrentSizeCheckTimeout = setTimeout(function () {
				this._iCurrentSizeCheckTimeout = undefined;
				this._adjustSize();
			}.bind(this), AnchorBar.SCROLL_DURATION);
		}
	};

	AnchorBar.prototype._computeBarSectionsInfo = function () {

		//reset the max position
		this._iMaxPosition = 0;

		var aContent = this.getContent() || [];

		aContent.forEach(this._computeNextSectionInfo, this);

		//post processing based on how browsers implement rtl
		//chrome, safari && Device.browser.webkit && firefox
		if (this._bRtl && (Device.browser.webkit || Device.browser.firefox)) {
			aContent.forEach(this._adjustNextSectionInfo, this); // adjust positions depending of the browser
			this._oScroller && this._oScroller.scrollTo(this._iMaxPosition, 0, 0);
		}
	};

	AnchorBar.prototype._computeNextSectionInfo = function (oContent) {
		var iWidth = oContent.$().outerWidth(true);

		//store info on the various sections for horizontalScrolling
		//scrollLeft is the amount of scroll required for reaching that item in normal mode
		this._oSectionInfo[oContent.data("sectionId")] = {
			scrollLeft: this._iMaxPosition,
			width: iWidth
		};

		this._iMaxPosition += iWidth;
	};

	/**
	 * Adjustment for webkit only
	 *
	 * Reverse the position as the scroll 0 is at the far end (first item = maxPosition, last item = 0)
	 */
	AnchorBar.prototype._adjustNextSectionInfo = function (oContent) {

		var oSectionInfo = this._oSectionInfo[oContent.data("sectionId")];

		if (Device.browser.firefox) {
			// 27.11.2015 fix made for the following issue
			// firefox not working yet see internal incident 1570001701
			oSectionInfo.scrollLeft = -oSectionInfo.scrollLeft;
		} else {
			 // Reverse all positions as the scroll 0 is at the far end (first item = maxPosition, last item = 0)
			oSectionInfo.scrollLeft = this._iMaxPosition - oSectionInfo.scrollLeft - oSectionInfo.width;
		}
	};

	AnchorBar.prototype._resetControl = function () {
		this._removeButtonsDelegate();
		this.destroyAggregation('content');
		this._oSelect.destroyAggregation("items", true);

		return this;
	};

	AnchorBar.prototype._getAccessibilityRole = function () {
		return 'none';
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {object} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	AnchorBar.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
		var oContent = this.getContent(),
			iIndex = oContent.indexOf(oElement);

		if (iIndex !== -1) {
			mAriaProps.role = "option";
			mAriaProps.setsize = oContent.length;
			mAriaProps.posinset = iIndex + 1; // we need "+ 1", since iIndex would start from 0 (due to indexOf)
		}
	};

	/**
	 * clean created controls and deregister handlers
	 */
	AnchorBar.prototype.exit = function () {

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		if (this._oScroller) {
			this._oScroller.destroy();
			this._oScroller = null;
		}

		if (this.oLibraryResourceBundleOP) {
			this.oLibraryResourceBundleOP = null;
		}

		if (this._iComputeContentSizeTimeout) {
			clearTimeout(this._iComputeContentSizeTimeout);
			this._iComputeContentSizeTimeout = null;
		}

		this._removeButtonsDelegate();
	};

	/**
	 * Determines the width of a control safely. If the control doesn't exist, it returns 0.
	 * If it exists, it returns the DOM element width.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {number} the width of the control
	 */
	AnchorBar.prototype._getWidth = function (oControl) {
		var oDomReference = oControl.getDomRef();
		return !(oControl instanceof Control) ? 0 : (oDomReference && oDomReference.offsetWidth) || 0;
	};

	AnchorBar.prototype.setVisible = function (bVisible) {
		this.getParent() && this.getParent().toggleStyleClass("sapUxAPObjectPageLayoutNoAnchorBar", !bVisible);
		return this.setProperty("visible", bVisible);
	};

	return AnchorBar;
});