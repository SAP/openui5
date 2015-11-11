/*!
 * ${copyright}
 */

// Provides control sap.uxap.AnchorBar.
sap.ui.define([
	"sap/m/Button",
	"sap/m/PlacementType",
	"sap/m/Popover",
	"sap/m/Toolbar",
	"sap/ui/core/IconPool",
	"sap/ui/core/Item",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/Device",
	"sap/ui/core/CustomData",
	"./HierarchicalSelect",
	"./library"
], function (Button, PlacementType, Popover, Toolbar, IconPool, Item, ResizeHandler,
			 ScrollEnablement, HorizontalLayout, Device, CustomData, HierarchicalSelect, library) {
	"use strict";

	/**
	 * Constructor for a new AnchorBar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Anchor bar is the navigation bar of an Object page. Its purpose is to provide links to all Sections and Subsections. Takes the form of a Select on phone.
	 * @extends sap.m.Toolbar
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @since 1.26
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
				upperCase: {type: "boolean", defaultValue: false}
			},
			associations: {

				/**
				 * The button that represents the Section being scrolled by the user.
				 */
				selectedButton: {type: "sap.m.Button", multiple: false}
			},
			aggregations: {

				_select: {type: "sap.uxap.HierarchicalSelect", multiple: false, visibility: "hidden"},
				_popovers: {type: "sap.m.Popover", multiple: true, visibility: "hidden"},
				_scrollArrowLeft: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				_scrollArrowRight: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			}
		}
	});


	/**
	 * Scrolls to the given Section
	 *
	 * @name sap.uxap.AnchorBar#scrollToSection
	 * @function
	 * @param {string} sId
	 *         The Section ID to scroll to
	 * @param {int} iDuration
	 *         Scroll duration (in ms). Default value is 0
	 * @type sap.uxap.ObjectPageLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Returns a sap.ui.core.delegate.ScrollEnablement object used to handle scrolling
	 *
	 * @name sap.uxap.AnchorBar#getScrollDelegate
	 * @function
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	AnchorBar.prototype.init = function () {
		if (Toolbar.prototype.init) {
			Toolbar.prototype.init.call(this);
		}

		this.addStyleClass("sapUxAPAnchorBar");

		this._oPressHandlers = {};  //keep references on the press handlers we set on first level items (in case of behavior change)
		this._oSectionInfo = {};    //keep scrolling info on sections
		this._oScroller = null;

		//are we on a rtl scenario?
		//IE handles rtl in a transparent way (positions positives, scroll starts at the end)
		//while firefox, safari and chrome have a special management (scroll at the beginning and negative positioning)
		//therefore we will apply some specific actions only if are in rtl and not in IE.
		this._bRtlScenario = sap.ui.getCore().getConfiguration().getRTL() && !Device.browser.msie;

		//there are 2 different uses cases:
		//case 1: on a real phone we don't need the scrolling anchorBar, just the hierarchicalSelect
		//case 2: on a a real ipad or a desktop we need both as the size may change
		this._bHasButtonsBar = Device.system.tablet || Device.system.desktop;

		this._oSelect = this._getHierarchicalSelect();

		//case 2 requires the scrolling anchorBar
		if (this._bHasButtonsBar) {
			//horizontal scrolling
			this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
				horizontal: true,
				vertical: false,
				nonTouchScrolling: true
			});

			this._iREMSize = parseInt(jQuery("body").css("font-size"), 10);
			this._iTolerance = this._iREMSize * 1;  // 1 rem
			this._iOffset = this._iREMSize * 3;  // 3 rem

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
	AnchorBar.DOM_CALC_DELAY = 200; //ms.

	AnchorBar.prototype.setSelectedButton = function (oButton) {

		if (typeof oButton === "string") {
			oButton = sap.ui.getCore().byId(oButton);
		}

		if (oButton) {

			var oSelectedSectionId = oButton.data("sectionId");

			if (oSelectedSectionId) {
				this._oSelect.setSelectedKey(oButton.getId());
			}

			if (this._bHasButtonsBar) {
				//remove selection class from the currently selected item
				this.$().find(".sapUxAPAnchorBarButtonSelected").removeClass("sapUxAPAnchorBarButtonSelected");
				oButton.$().addClass("sapUxAPAnchorBarButtonSelected");

				if (oSelectedSectionId) {
					this.scrollToSection(oSelectedSectionId, AnchorBar.SCROLL_DURATION);
				}

				this._setAnchorButtonsTabFocusValues(oButton);
			}
		}

		return this.setAssociation("selectedButton", oButton, true /* don't rerender */);
	};

	/*******************************************************************************
	 * Responsive behavior
	 ******************************************************************************/

	AnchorBar.prototype.setShowPopover = function (bValue, bSuppressInvalidate) {

		if (this.getShowPopover() === bValue) {
			return this;
		}

		var sSelectedButton, bNeedInvalidate = !jQuery.isEmptyObject(this._oPressHandlers);

		//changing the behavior after the firstRendering is removing all press handlers on first level items
		if (bNeedInvalidate) {
			var aContent = this.getContent() || [];
			sSelectedButton = this.getSelectedButton();

			aContent.forEach(this._detachPopoverHandler, this);
		}

		this.setProperty("showPopover", bValue, true /* always trigger re-rendering manually */);

		if (bNeedInvalidate) {
			this.rerender();

			if (sSelectedButton) {
				this.setSelectedButton(sSelectedButton);
			}
		}

		return this;
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
		if (Toolbar.prototype.onBeforeRendering) {
			Toolbar.prototype.onBeforeRendering.call(this);
		}

		var aContent = this.getContent() || [],
			bUpperCase = this.getUpperCase(),
			oPopoverState = {
				oLastFirstLevelButton: null,
				oCurrentPopover: null
			};

		//rebuild select items
		this._oSelect.removeAllItems();
		this._oSelect.setUpperCase(bUpperCase);
		this.toggleStyleClass("sapUxAPAnchorBarUpperCase", bUpperCase);


		//create responsive equivalents of the provided controls
		aContent.forEach(function (oButton) {

			this._createSelectItem(oButton);

			//desktop scenario logic: builds the scrolling anchorBar
			if (this._bHasButtonsBar) {
				this._createPopoverSubMenu(oButton, oPopoverState);
			}

		}, this);
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
				key: oButton.getId(),
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

	};

	AnchorBar.prototype._createPopoverSubMenu = function (oButton, oPopoverState) {

		var bIsSecondLevel = oButton.data("secondLevel") === true || oButton.data("secondLevel") === "true",
			fnPressHandler = null;

		//handles the tablet/desktop hierarchical behavior
		//a second level is injected into the latest first level
		//at this point we know that there are children to the last firstLevel therefore we can create the popover
		if (bIsSecondLevel) {

			if (oPopoverState.oLastFirstLevelButton && oPopoverState.oCurrentPopover) {

				//don't attach the parent press handler for each child
				if (!this._oPressHandlers[oPopoverState.oLastFirstLevelButton.getId()]) {

					fnPressHandler = jQuery.proxy(this._handlePopover, /* closure with oLastFirstLevelButton and oCurrentPopover as context */
						{
							oCurrentPopover: oPopoverState.oCurrentPopover,
							oLastFirstLevelButton: oPopoverState.oLastFirstLevelButton
						}
					);


					oPopoverState.oLastFirstLevelButton.attachPress(fnPressHandler);
					this._oPressHandlers[oPopoverState.oLastFirstLevelButton.getId()] = fnPressHandler;
				}

				oPopoverState.oCurrentPopover.addContent(oButton);
			} else if (this.getShowPopover()) {
				jQuery.sap.log.error("sapUxApAnchorBar :: missing parent first level for item " + oButton.getText());
			} else {
				this.removeContent(oButton);
			}
		} else {
			oPopoverState.oLastFirstLevelButton = oButton;

			//default behavior: the first level show a popover containing second levels
			if (this.getShowPopover()) {
				oPopoverState.oCurrentPopover = new Popover({
					placement: PlacementType.Bottom,
					showHeader: false,
					verticalScrolling: true,
					horizontalScrolling: false,
					contentWidth: "auto",
					showArrow: false
				});

				oPopoverState.oCurrentPopover.addStyleClass("sapUxAPAnchorBarPopover");

				this._addKeyboardHandling(oPopoverState.oCurrentPopover);

				this.addAggregation('_popovers', oPopoverState.oCurrentPopover);
				//alternative behavior: the first level triggers direct navigation
			} else if (!this._oPressHandlers[oPopoverState.oLastFirstLevelButton.getId()]) {
				fnPressHandler = jQuery.proxy(this._handleDirectScroll, this);

				oPopoverState.oLastFirstLevelButton.attachPress(fnPressHandler);

				this._oPressHandlers[oPopoverState.oLastFirstLevelButton.getId()] = fnPressHandler;
			}
		}
	};

	AnchorBar.prototype._addKeyboardHandling = function (oCurrentPopover) {
		oCurrentPopover.onsapdown = function (oEvent) {
			if (oEvent.target.nextSibling) {
				oEvent.target.nextSibling.focus();
			}
		};
		oCurrentPopover.onsapright = function (oEvent) {
			oCurrentPopover.onsapdown(oEvent);
		};
		oCurrentPopover.onsapup = function (oEvent) {
			if (oEvent.target.previousSibling) {
				oEvent.target.previousSibling.focus();
			}
		};
		oCurrentPopover.onsapleft = function (oEvent) {
			oCurrentPopover.onsapup(oEvent);
		};
		oCurrentPopover.onsaphome = function (oEvent) {
			if (oEvent.target.parentElement.firstChild) {
				oEvent.target.parentElement.firstChild.focus();
			}
		};
		oCurrentPopover.onsapend = function (oEvent) {
			if (oEvent.target.parentElement.lastChild) {
				oEvent.target.parentElement.lastChild.focus();
			}
		};
		oCurrentPopover.onsappageup = this._handlePageUp.bind(oCurrentPopover);
		oCurrentPopover.onsappagedown = this._handlePageDown.bind(oCurrentPopover);
	};

	AnchorBar.prototype._detachPopoverHandler = function (oButton) {
		if (this._oPressHandlers[oButton.getId()]) {
			oButton.detachPress(this._oPressHandlers[oButton.getId()]);
			this._oPressHandlers[oButton.getId()] = null;
		}
	};

	AnchorBar.prototype._handlePopover = function (oEvent) {
		var aPopoverButtons = this.oCurrentPopover.getContent() || [];

		//open the popover only if we are in Tablet/Desktop scenario = the button is visible in the anchorBar
		if (this.oLastFirstLevelButton.$().is(":visible")) {

			//specific use case management: if there are only 1 button in the popover, then we don't display it and navigate directly (= the subsection is "promoted" it to a section level)
			//this is a specific behavior asked by UX as of Sep 25, 2014
			if (aPopoverButtons.length == 1) {
				aPopoverButtons[0].firePress({});
			} else {
				this.oCurrentPopover.openBy(this.oLastFirstLevelButton);
			}
		}
	};

	AnchorBar.prototype._handleDirectScroll = function (oEvent) {

		if (oEvent.getSource().getParent() instanceof Popover) {
			oEvent.getSource().getParent().close();
		}

		this._requestScrollToSection(oEvent.getSource().data("sectionId"));
	};

	AnchorBar.prototype._requestScrollToSection = function (sRequestedSectionId) {

		var oRequestedSection = sap.ui.getCore().byId(sRequestedSectionId),
			oRequestedSectionParent = oRequestedSection.getParent();

		if (this.getParent() instanceof library.ObjectPageLayout) {

			// determine the next section that will appear selected in the anchorBar after the scroll
			var sNextSelectedSection = sRequestedSectionId;

			// if the requestedSection is a subsection, the the nextSelectedSection will be its parent (since anchorBar contains only first-level sections)
			if (oRequestedSection instanceof library.ObjectPageSubSection &&
				oRequestedSectionParent instanceof library.ObjectPageSection) {
				sNextSelectedSection = oRequestedSectionParent.getId();
			}
			// we set *direct* scrolling by which we instruct the page to *skip* processing of intermediate sections (sections between current and requested)
			this.getParent().setDirectScrollingToSection(sNextSelectedSection);
			// finally request the page to scroll to the requested section
			this.getParent().scrollToSection(oRequestedSection.getId());
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
		var oSelectedItem = oEvent.getParameter("selectedItem"), oOriginalControl;

		oOriginalControl = sap.ui.getCore().byId(oSelectedItem.getKey());

		if (oOriginalControl) {

			this._requestScrollToSection(oOriginalControl.data("sectionId"));
		} else {
			jQuery.sap.log.error("AnchorBar :: cannot find corresponding button", oSelectedItem.getKey());
		}
	};

	AnchorBar.prototype._getHierarchicalSelect = function () {

		if (!this.getAggregation('_select')) {

			this.setAggregation('_select', new HierarchicalSelect({
				width: "100%",
				icon: "sap-icon://slim-arrow-down",
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
			oScrollButton,
			that = this;

		if (bLeft) {
			sArrowId = this.getId() + "-arrowScrollLeft";
			sIconName = "slim-arrow-left";
			sArrowClass = "anchorBarArrowLeft";
		} else {
			sArrowId = this.getId() + "-arrowScrollRight";
			sIconName = "slim-arrow-right";
			sArrowClass = "anchorBarArrowRight";
		}

		oScrollButton = new Button(sArrowId, {
			icon: IconPool.getIconURI(sIconName),
			type: "Transparent",
			press: function (oEvent) {
				oEvent.preventDefault();
				that._handleScrollButtonTap(bLeft);
			}
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
	AnchorBar._hierarchicalSelectModes = {
		"Icon": "icon",   // Only icon - overview button mode
		"Text": "text"    // Text - phone mode
	};

	AnchorBar.prototype._applyHierarchicalSelectMode = function () {

		if (this._sHierarchicalSelectMode === AnchorBar._hierarchicalSelectModes.Icon) {
			this.$().find(".sapUxAPAnchorBarScrollContainer").show();

			this._oSelect.setWidth("auto");
			this._oSelect.setAutoAdjustWidth(true);
			this._oSelect.setType(sap.m.SelectType.IconOnly);
			this._computeBarSectionsInfo();

		} else {
			this.$().find(".sapUxAPAnchorBarScrollContainer").hide();

			this._oSelect.setWidth("100%");
			this._oSelect.setAutoAdjustWidth(false);
			this._oSelect.setType(sap.m.SelectType.Default);
		}

		this.$().toggleClass("sapUxAPAnchorBarOverflow", this._sHierarchicalSelectMode === AnchorBar._hierarchicalSelectModes.Icon);
	};

	AnchorBar.prototype._adjustSize = function () {

		//size changed => check if switch in display-mode (phone-view vs. desktop-view) needed
		var sNewMode = library.Utilities.isPhoneScenario() ?
			AnchorBar._hierarchicalSelectModes.Text :
			AnchorBar._hierarchicalSelectModes.Icon;

		if (sNewMode !== this._sHierarchicalSelectMode) {
			this._sHierarchicalSelectMode = sNewMode;
			this._applyHierarchicalSelectMode();
		}

		//size changed => check if overflow gradients needed
		if (this._sHierarchicalSelectMode === AnchorBar._hierarchicalSelectModes.Icon) {

			//don't go any further if the positions of the items are not calculated yet
			if (this._iMaxPosition < 0) {
				return;
			}

			var $dom = this.$(),
				bNeedScrollingBegin,
				bNeedScrollingEnd,
				iContainerWidth;


			iContainerWidth = this.$().find(".sapUxAPAnchorBarScrollContainer").width();

			//do we need to scroll left or right
			if (this._bRtlScenario) {

				if (Device.browser.firefox) {
					bNeedScrollingEnd = Math.abs(this._oScroller.getScrollLeft()) + iContainerWidth < (this._iMaxPosition - this._iTolerance);
					bNeedScrollingBegin = Math.abs(this._oScroller.getScrollLeft()) >= this._iTolerance;
				} else {
					bNeedScrollingEnd = Math.abs(this._oScroller.getScrollLeft()) >= this._iTolerance;
					bNeedScrollingBegin = Math.abs(this._oScroller.getScrollLeft()) + iContainerWidth < (this._iMaxPosition - this._iTolerance);
				}
			} else {
				bNeedScrollingEnd = this._oScroller.getScrollLeft() + iContainerWidth < (this._iMaxPosition - this._iTolerance);
				bNeedScrollingBegin = this._oScroller.getScrollLeft() >= this._iTolerance;
			}

			jQuery.sap.log.debug("AnchorBar :: scrolled at " + this._oScroller.getScrollLeft(), "scrollBegin [" + (bNeedScrollingBegin ? "true" : "false") + "] scrollEnd [" + (bNeedScrollingEnd ? "true" : "false") + "]");

			$dom.toggleClass("sapUxAPAnchorBarScrollLeft", bNeedScrollingBegin);
			$dom.toggleClass("sapUxAPAnchorBarScrollRight", bNeedScrollingEnd);
		}


	};

	/**
	 * Handles scrolling via the scroll buttons.
	 *
	 * @param boolean bScrollLeft indicates whether the left arrow button was pressed
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
	 * Scroll to a specific Section
	 *
	 * @param sId       id of the section to scroll to
	 * @param duration  Scroll duration. Default value is 0
	 *
	 */
	AnchorBar.prototype.scrollToSection = function (sId, duration) {

		if (this._bHasButtonsBar) {
			var iDuration = duration || AnchorBar.SCROLL_DURATION,
				iScrollTo;

			if ((this._sHierarchicalSelectMode === AnchorBar._hierarchicalSelectModes.Icon)
				&& this._oSectionInfo[sId]) {

				//scroll to the positionRtl minus the offset (so the gradient never hide the selected item)
				iScrollTo = this._oSectionInfo[sId].scrollLeft - this._iOffset;
				if (iScrollTo < 0) { //do not allow hiding part of the content if negative value for scroll is calculated here
					iScrollTo = 0;
				}

				jQuery.sap.log.debug("AnchorBar :: scrolling to section " + sId + " of " + iScrollTo);

				//avoid triggering twice the scrolling onto the same target section
				if (this._sCurrentScrollId != sId) {
					this._sCurrentScrollId = sId;

					if (this._iCurrentScrollTimeout) {
						jQuery.sap.clearDelayedCall(this._iCurrentScrollTimeout);
						jQuery.sap.byId(this.getId() + "-scroll").parent().stop(true, false);
					}

					this._iCurrentScrollTimeout = jQuery.sap.delayedCall(duration, this, function () {
						this._sCurrentScrollId = undefined;
						this._iCurrentScrollTimeout = undefined;
					});

					this._oScroller.scrollTo(iScrollTo, 0, iDuration);
				}
			} else {
				jQuery.sap.log.debug("AnchorBar :: no need to scroll to " + sId);
			}
		}
	};

	/**
	 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
	 */
	AnchorBar.prototype.getScrollDelegate = function () {
		return this._oScroller;
	};

	/*******************************************************************************
	 * Keyboard navigation
	 ******************************************************************************/
	AnchorBar.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	/**
	 * Handles DOWN key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapdown = function (oEvent) {
		oEvent.preventDefault();
		if (oEvent.target.nextSibling) {
			oEvent.target.nextSibling.focus();
		}
	};

	/**
	 * Handles RIGHT key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapright = function (oEvent) {
		this.onsapdown(oEvent);
	};

	/**
	 * Handles UP key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapup = function (oEvent) {
		oEvent.preventDefault();
		if (oEvent.target.previousSibling) {
			oEvent.target.previousSibling.focus();
		}
	};

	/**
	 * Handles LEFT key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapleft = function (oEvent) {
		this.onsapup(oEvent);
	};

	/**
	 * Handles HOME key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsaphome = function (oEvent) {
		oEvent.preventDefault();
		if (oEvent.target.parentElement.firstChild) {
			oEvent.target.parentElement.firstChild.focus();
		}
	};

	/**
	 * Handles END key, triggered on anchor bar level.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	AnchorBar.prototype.onsapend = function (oEvent) {
		oEvent.preventDefault();
		if (oEvent.target.parentElement.lastChild) {
			oEvent.target.parentElement.lastChild.focus();
		}
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
			if (oAnchor.getId() === oEvent.target.id) {
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
			if (oAnchor.getId() === oEvent.target.id) {
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
			$anchorBarItem = oAnchorBarItem.$();
			if (oAnchorBarItem.sId === oSelectedButton.sId) {
				$anchorBarItem.attr(sTabIndex, sFocusable);
			} else {
				$anchorBarItem.attr(sTabIndex, sNotFocusable);
			}
		});
	};

	/**
	 * Handler for F6
	 *
	 * @param oEvent - The event object
	 */
	AnchorBar.prototype.onsapskipforward = function (oEvent) {
		this._handleGroupNavigation(oEvent, false);
	};

	/**
	 * Handler for F6 and Shift + F6 group navigation
	 *
	 * @param oEvent {jQuery.EventObject}
	 * @param bShiftKey serving as a reference if shift is used
	 * @private
	 */
	AnchorBar.prototype._handleGroupNavigation = function (oEvent, bShiftKey) {
		var oEventF6 = jQuery.Event("keydown"),
			oSettings = {},
			aSections = this.getParent().getSections(),
			aSubSections = [this.getDomRef()],
			aCurruntSubSections;

		//this is needed in order to be sure that next F6 group will be found in sub sections
		aSections.forEach(function (oSection) {
			aCurruntSubSections = oSection.getSubSections().map(function (oSubSection) {
				return oSubSection.$().attr("tabindex", -1)[0];
			});

			aSubSections = aSubSections.concat(aCurruntSubSections);
		});
		oSettings.scope = aSubSections;

		oEvent.preventDefault();
		this.$().focus();

		oEventF6.target = oEvent.target;
		oEventF6.keyCode = jQuery.sap.KeyCodes.F6;
		oEventF6.shiftKey = bShiftKey;

		jQuery.sap.handleF6GroupNavigation(oEventF6, oSettings);
	};

	/**
	 * called for figuring out responsive scenarios
	 */

	AnchorBar.prototype.onAfterRendering = function () {
		if (Toolbar.prototype.onAfterRendering) {
			Toolbar.prototype.onAfterRendering.call(this);
		}

		this._sHierarchicalSelectMode = AnchorBar._hierarchicalSelectModes.Text;

		//save max for arrow show/hide management, the max position is the required scroll for the the item to be fully visible
		this._iMaxPosition = -1;

		//show/hide scrolling arrows
		this._sResizeListenerId = ResizeHandler.register(this, jQuery.proxy(this._adjustSize, this));

		this.$().find(".sapUxAPAnchorBarScrollContainer").scroll(jQuery.proxy(this._onScroll, this));

		//restore state from previous rendering
		if (this.getSelectedButton()) {
			this.setSelectedButton(this.getSelectedButton());
		}
	};

	AnchorBar.prototype._onScroll = function () {
		if (!this._iCurrentSizeCheckTimeout) {
			this._iCurrentSizeCheckTimeout = jQuery.sap.delayedCall(AnchorBar.SCROLL_DURATION, this, function () {
				this._iCurrentSizeCheckTimeout = undefined;
				this._adjustSize();
			});
		}

	};

	AnchorBar.prototype._computeBarSectionsInfo = function () {

		//reset the max position
		this._iMaxPosition = 0;

		var aContent = this.getContent() || [];

		aContent.forEach(this._computeNextSectionInfo, this);

		//post processing based on how browsers implement rtl
		//chrome, safari
		if (this._bRtlScenario && Device.browser.webkit) { // Reverse all positions as the scroll 0 is at the far end (first item = maxPosition, last item = 0)

			aContent.forEach(this._adjustNextSectionInfo, this);
			this._oScroller.scrollTo(this._iMaxPosition, 0, 0);
		}
		//firefox not working yet see internal incident 1570001701
	};

	AnchorBar.prototype._computeNextSectionInfo = function (oContent) {

		// set ARIA has-popup if button opens submenu
		if (oContent.data("bHasSubMenu")) {
			oContent.$().attr("aria-haspopup", "true");
		}
		// set ARIA attributes of main buttons
		oContent.$().attr("aria-controls", oContent.data("sectionId"));

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

		oSectionInfo.scrollLeft = this._iMaxPosition - oSectionInfo.scrollLeft - oSectionInfo.width;
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
	};


	return AnchorBar;

});
