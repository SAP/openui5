/*!
 * ${copyright}
 */

// Provides control sap.uxap.AnchorBar.
sap.ui.define([
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
	"sap/ui/events/KeyCodes"
], function (jQuery, Button, MenuButton, mobileLibrary, Toolbar, IconPool, Item, ResizeHandler,	ScrollEnablement,
		HorizontalLayout, Device, CustomData, Control, HierarchicalSelect, library, AnchorBarRenderer, Log, KeyCodes) {
	"use strict";

	// shortcut for sap.m.SelectType
	var SelectType = mobileLibrary.SelectType;

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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
		}
	});


	AnchorBar.prototype.init = function () {
		if (Toolbar.prototype.init) {
			Toolbar.prototype.init.call(this);
		}

		this.addStyleClass("sapUxAPAnchorBar");

		this._oPressHandlers = {};  //keep references on the press handlers we set on first level items (in case of behavior change)
		this._oSectionInfo = {};    //keep scrolling info on sections
		this._oScroller = null;
		this._sSelectedKey = null; // keep track of sap.uxap.HierarchicalSelect selected key
		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();

		//are we on an rtl scenario?
		//IE handles rtl in a transparent way (positions positives, scroll starts at the end)
		//while firefox, safari and chrome have a special management (scroll at the beginning and negative positioning)
		//therefore we will apply some specific actions only if are in rtl and not in IE.
		/* TODO remove after 1.62 version */
		this._bRtlScenario = this._bRtl && !Device.browser.msie;

		//there are 2 different uses cases:
		//case 1: on a real phone we don't need the scrolling anchorBar, just the hierarchicalSelect
		//case 2: on a real tablet or a desktop we need both as the size may change
		this._bHasButtonsBar = Device.system.tablet || Device.system.desktop;

		this.oLibraryResourceBundleOP = sap.ui.getCore().getLibraryResourceBundle("sap.uxap"); // get resource translation bundle

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
			oButton = sap.ui.getCore().byId(oButton);
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

				oPreviouslySelectedButton = sap.ui.getCore().byId(sPreviouslySelectedButtonId);
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
			oSelectedButton = sap.ui.getCore().byId(oSelectedButton);
		}

		if (oSelectedButton && (oSelectedButton instanceof Button)
			&& oSelectedButton.data("sectionId")) {

			return sap.ui.getCore().byId(oSelectedButton.data("sectionId"));
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

		//rebuild select items
		this._oSelect.removeAllItems();
		this._oSelect.setUpperCase(bUpperCase);
		this.toggleStyleClass("sapUxAPAnchorBarUpperCase", bUpperCase);

		//create responsive equivalents of the provided controls
		aContent.forEach(function (oButton) {
			this._createSelectItem(oButton);
		}, this);

		if (aContent.length > 0 && this._sSelectedKey) {
			this._oSelect.setSelectedKey(this._sSelectedKey);
		}
	};

	AnchorBar.prototype.addContent = function (oButton, bInvalidate) {
		oButton.addStyleClass("sapUxAPAnchorBarButton");
		oButton.removeAllAriaDescribedBy();

		if (this._bHasButtonsBar && (oButton.data("secondLevel") === true || oButton.data("secondLevel") === "true")) {

			//attach handler on the scrolling mechanism
			oButton.attachPress(this._handleDirectScroll, this);
		}

		return this.addAggregation("content", oButton, bInvalidate);
	};

	AnchorBar.prototype._createSelectItem = function (oButton) {
		var bIsSecondLevel = oButton.data("secondLevel") === true || oButton.data("secondLevel") === "true";

		//create the phone equivalent item if the button has some visible text (UX rule)
		if (oButton.getText().trim() != "" && (!bIsSecondLevel || oButton.data("bTitleVisible") === true)) {
			var oPhoneItem = new Item({
				key: oButton.data("sectionId"),
				text: oButton.getText(),
				customData: [
					new CustomData({
						key: "secondLevel",
						value: oButton.data("secondLevel")
					})
				]
			});

			this._oSelect.addItem(oPhoneItem);
		}
		if (bIsSecondLevel) {
			this.removeContent(oButton);
			oButton.destroy();
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
				oButton._getButtonControl().$().attr("aria-checked", bAdd);
			} else {
				oButton.$().attr("aria-checked", bAdd);
			}
		}
	};

	AnchorBar.prototype._handleDirectScroll = function (oEvent) {
		this._requestScrollToSection(oEvent.getSource().data("sectionId"));
	};

	AnchorBar.prototype._requestScrollToSection = function (sRequestedSectionId) {

		var oRequestedSection = sap.ui.getCore().byId(sRequestedSectionId),
			oRequestedSectionParent = oRequestedSection.getParent();

		if (this.getParent() instanceof library.ObjectPageLayout) {

			// determine the next section that will appear selected in the anchorBar after the scroll
			var sNextSelectedSection = sRequestedSectionId;

			// if the requestedSection is a subsection, the nextSelectedSection will be its parent (since anchorBar contains only first-level sections)
			if (oRequestedSection instanceof library.ObjectPageSubSection &&
				oRequestedSectionParent instanceof library.ObjectPageSection) {
				sNextSelectedSection = oRequestedSectionParent.getId();
			}
			// we set *direct* scrolling by which we instruct the page to *skip* processing of intermediate sections (sections between current and requested)
			this.getParent().setDirectScrollingToSection(sNextSelectedSection);
			// finally request the page to scroll to the requested section
			this.getParent().scrollToSection(oRequestedSection.getId(), null, 0, true);
		}

		if (oRequestedSection instanceof library.ObjectPageSubSection &&
			oRequestedSectionParent instanceof library.ObjectPageSection) {
			oRequestedSectionParent.setAssociation("selectedSubSection", oRequestedSection, true);
		}
	};

	/**
	 * called on phone display only when a user selects a section to navigate to
	 * simulate the press on the corresponding button
	 * @param {*} oEvent event
	 * @private
	 */
	AnchorBar.prototype._onSelectChange = function (oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem"), oSelectedSection;

		oSelectedSection = sap.ui.getCore().byId(oSelectedItem.getKey());

		if (oSelectedSection) {

			this._requestScrollToSection(oSelectedSection.getId());
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
				if (sap.ui.getCore().getConfiguration().getTheme() != "sap_hcb") {
					this.$().attr("tabindex", -1);
				}
			},
			onThemeChanged: function () {
				if (sap.ui.getCore().getConfiguration().getTheme() == "sap_hcb") {
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
				iContainerWidth;

			// if width has changed we need to scroll AnchorBar to selected section
			if (bWidthChange) {
				this.scrollToSection(this._sSelectedKey);
			}

			iContainerWidth = $scrollContainer.width();

			//do we need to scroll left or right
			if (this._bRtlScenario) {

				if (Device.browser.firefox) {
					bNeedScrollingEnd = Math.abs($scrollContainer.scrollLeft()) + iContainerWidth < (this._iMaxPosition - this._iTolerance);
					bNeedScrollingBegin = Math.abs($scrollContainer.scrollLeft()) >= this._iTolerance;
				} else {
					bNeedScrollingEnd = Math.abs($scrollContainer.scrollLeft()) >= this._iTolerance;
					bNeedScrollingBegin = Math.abs($scrollContainer.scrollLeft()) + iContainerWidth < (this._iMaxPosition - this._iTolerance);
				}
			} else {
				bNeedScrollingEnd = $scrollContainer.scrollLeft() + iContainerWidth < (this._iMaxPosition - this._iTolerance);
				bNeedScrollingBegin = $scrollContainer.scrollLeft() >= this._iTolerance;
			}

			Log.debug("AnchorBar :: scrolled at " + $scrollContainer.scrollLeft(), "scrollBegin [" + (bNeedScrollingBegin ? "true" : "false") + "] scrollEnd [" + (bNeedScrollingEnd ? "true" : "false") + "]");

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
		var iScrollDirection = ((!this._bRtlScenario && bScrollLeft) || (this._bRtlScenario && !bScrollLeft)) ? -1 : 1;

		this._oScroller.scrollTo(this._iMaxPosition * iScrollDirection, 0, AnchorBar.SCROLL_DURATION * 3); //increase scroll duration when scrolling to the other end of the anchorBar (UX requirement)
	};

	/**
	 * Scroll to a specific Section.
	 *
	 * @param {string} sId The Section ID to scroll to
	 * @param {int} iDuration Scroll duration (in ms). Default value is 0.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	AnchorBar.prototype.scrollToSection = function (sId, iDuration) {

		if (this._bHasButtonsBar) {
			var oMediaRange = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD, this._getWidth(this)),
				iDuration = iDuration || AnchorBar.SCROLL_DURATION,
				iScrollTo;

			if (!library.Utilities.isPhoneScenario(oMediaRange)
				&& this._oSectionInfo[sId]) {

				if (this._bRtlScenario && Device.browser.firefox) {
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
						jQuery(document.getElementById(this.getId() + "-scroll")).parent().stop(true, false);
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

	// use type 'object' because Metamodel doesn't know ScrollEnablement
	/**
	 * Returns an sap.ui.core.delegate.ScrollEnablement object used to handle scrolling.
	 *
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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

		var iNextIndex;
		var aAnchors = this.getContent();

		aAnchors.forEach(function (oAnchor, iAnchorIndex) {
			if (oEvent.target.id.indexOf(oAnchor.getId()) > -1) {
				iNextIndex = iAnchorIndex + 1;
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
	 * Handles LEFT key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapleft = function (oEvent) {
		oEvent.preventDefault();

		var iNextIndex;
		var aAnchors = this.getContent();

		aAnchors.forEach(function (oAnchor, iAnchorIndex) {
			if (oEvent.target.id.indexOf(oAnchor.getId()) > -1) {
				iNextIndex = iAnchorIndex - 1;
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
			if (oAnchorBarItem.sId === (oSelectedButton && oSelectedButton.sId)) {
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
		var oSelectedButton,
			sHeaderTitleAriaLabelText = this._getHeadeTitleAriaLabelText();

		if (Toolbar.prototype.onAfterRendering) {
			Toolbar.prototype.onAfterRendering.call(this);
		}

		oSelectedButton = sap.ui.getCore().byId(this.getSelectedButton());
		this._setAnchorButtonsTabFocusValues(oSelectedButton);

		//save max for arrow show/hide management, the max position is the required scroll for the item to be fully visible
		this._iMaxPosition = -1;

		//show/hide scrolling arrows
		this._sResizeListenerId = ResizeHandler.register(this, jQuery.proxy(this._adjustSize, this));

		this.$().find(".sapUxAPAnchorBarScrollContainer").scroll(jQuery.proxy(this._onScroll, this));

		if (sHeaderTitleAriaLabelText) {
			this.$().attr("aria-label", sHeaderTitleAriaLabelText);
		}

		//restore state from previous rendering
		if (oSelectedButton) {
			this.setSelectedButton(oSelectedButton);
		}

		//initial state
		if (this._bHasButtonsBar) {
			setTimeout(function () {
				if (this._sHierarchicalSelectMode === AnchorBarRenderer._AnchorBarHierarchicalSelectMode.Icon) {
					this._computeBarSectionsInfo();
				}
				this._adjustSize();
			}.bind(this), AnchorBar.DOM_CALC_DELAY);
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
		if (this._bRtlScenario && (Device.browser.webkit || Device.browser.firefox)) {
			aContent.forEach(this._adjustNextSectionInfo, this); // adjust positions depending of the browser
			this._oScroller.scrollTo(this._iMaxPosition, 0, 0);
		}
	};

	AnchorBar.prototype._computeNextSectionInfo = function (oContent) {
		var oButton = oContent.isA("sap.m.MenuButton") ? oContent._getButtonControl() : oContent,
			bSelected = oContent.hasStyleClass("sapUxAPAnchorBarButtonSelected");

		// set ARIA has-popup if button opens submenu
		if (oContent.data("bHasSubMenu")) {
			oButton.$().attr("aria-haspopup", "true");
		}
		// set ARIA attributes of main buttons
		oButton.$().attr("aria-controls", oContent.data("sectionId")).attr("aria-checked", bSelected);

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
		this.destroyAggregation('content', true);
		return this;
	};

	AnchorBar.prototype._getHeadeTitleAriaLabelText = function () {
		var oObjectPage = this.getParent();

		if (oObjectPage.isA("sap.uxap.ObjectPageLayout")) {
			return oObjectPage._getAriaLabelText("NAVTOOLBAR");
		}

		return null;
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {Object} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	AnchorBar.prototype.enhanceAccessibilityState = function (oElement, mAriaProps) {
		var oContent = this.getContent(),
			iIndex = oContent.indexOf(oElement);

		if (iIndex !== -1) {
			mAriaProps.role = "menuitemradio";
			mAriaProps.roledescription = this.oLibraryResourceBundleOP.getText("ANCHOR_BAR_MENUITEM");
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
	};

	/**
	 * Determines the width of a control safely. If the control doesn't exist, it returns 0.
	 * If it exists, it returns the DOM element width.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the width of the control
	 */
	AnchorBar.prototype._getWidth = function (oControl) {
		var oDomReference = oControl.getDomRef();
		return !(oControl instanceof Control) ? 0 : (oDomReference && oDomReference.offsetWidth) || 0;
	};

	return AnchorBar;
});
