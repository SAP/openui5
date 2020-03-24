/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/Device",
	"sap/ui/core/theming/Parameters",
	"sap/m/library"
], function (
	OverflowToolbarLayoutData,
	Device,
	Parameters,
	library
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	/**
	 * Class taking care of the control responsive behaviour.
	 * @alias sap/f/shellBar/ResponsiveHandler
	 * @since 1.63
	 * @private
	 * @property {object} oContext the context of the ShellBar control instance
	 */
	var ResponsiveHandler = function (oContext) {
		this._oControl = oContext;

		// Get and calculate padding's
		this._iREMSize = parseInt(jQuery("body").css("font-size"));
		this._iChildControlMargin = parseInt(Parameters.get("_sap_f_ShellBar_ChildMargin"));
		this._iDoubleChildControlMargin = this._iChildControlMargin * 2;
		this._iCoPilotWidth = parseInt(Parameters.get("_sap_f_ShellBar_CoPilotWidth")) + this._iDoubleChildControlMargin;
		this._iHalfCoPilotWidth = this._iCoPilotWidth / 2;

		// Delegate used to attach on ShellBar lifecycle events
		this._oDelegate = {
			onAfterRendering: this.onAfterRendering,
			onBeforeRendering: this.onBeforeRendering
		};

		// Attach Event Delegates
		this._oControl.addDelegate(this._oDelegate, false, this);

		// Init resize handler method
		this._fnResize = this._resize;

		// Attach events
		this._oControl._oOverflowToolbar.attachEvent("_controlWidthChanged", this._handleResize, this);
	};

	/**
	 * Lifecycle event handler for ShellBar onAfterRendering event
	 */
	ResponsiveHandler.prototype.onAfterRendering = function () {

		var bPhoneRange = Device.media.getCurrentRange("Std", this._oControl.$().outerWidth(true)).name === "Phone";
		this._oButton = this._oControl._oMegaMenu && this._oControl._oMegaMenu.getAggregation("_button");
		this._oDomRef = this._oControl.getDomRef(); // Cache DOM Reference
		this.bIsMegaMenuConfigured = this._oControl._oTitleControl &&
		this._oControl._oTitleControl === this._oControl._oMegaMenu;

		if (this._oControl._oTitleControl) {
			// Attach on internal button image load
			// Title control is either MegaMenu or Title
			if (this.bIsMegaMenuConfigured && this._oButton && this._oButton._image) {
				// We need to update all the measurements of the control when the image is loaded in the DOM as we can't
				// measure it before that
				if (!this.bMenuButtonImageLoadAttached) {
					//Load callback attached only on initial rendering
					this._oButton._image.attachEvent("load", this._updateMegaMenuWidth, this);
					this.bMenuButtonImageLoadAttached = true;
				}
			}
			if (!this.bIsMegaMenuConfigured) {
				setTimeout(this._updateMegaMenuWidth.bind(this), 0);
			}
		}
		if (this._oControl._oHomeIcon && !this.bHomeIconLoadAttached) {
			//Load callback attached only on initial rendering
			this._oControl._oHomeIcon.attachEvent("load", this._updateHomeIconWidth, this);
			this.bHomeIconLoadAttached = true;
		}

		if (this._oControl._oManagedSearch && !this._bAttachedManagedSearchHandler) {
			this._oControl._oManagedSearch.attachEvent("_updateVisualState", this._switchOpenStateOnSearch, this);

			this._bAttachedManagedSearchHandler = true;
		}

		if (bPhoneRange) {
			this._transformTitleControlMobile();
		}

		this._initResize();
		this._handleResize();
	};

	/**
	 * Lifecycle event handler for cleaning after the control is not needed anymore
	 */
	ResponsiveHandler.prototype.exit = function () {
		if (this._oControl._oOverflowToolbar) {
			this._oControl._oOverflowToolbar.detachEvent("_controlWidthChanged", this._handleResize, this);
		}
		if (this._oControl._oHomeIcon) {
			this._oControl._oHomeIcon.detachEvent("load", this._updateHomeIconWidth, this);
			this.bHomeIconLoadAttached = false;
		}
		if (this._oButton) {
			this._oButton.detachEvent("load", this._updateMegaMenuWidth, this);
		}
		if (this._oControl._oTitleControl && this.bIsMegaMenuConfigured &&
			this._oButton && this._oButton._image) {
			this._oButton._image.detachEvent("load", this._updateMegaMenuWidth, this);
			this.bMenuButtonImageLoadAttached = false;
		}

		this._oControl.removeDelegate(this._oDelegate);
	};

	/**
	 * Initialize the resize handler by caching some sizes which are changing only control property changes or image
	 * loads of child controls. We don't need to update these cached sizes on control width changes.
	 * @private
	 */
	ResponsiveHandler.prototype._initResize = function () {
		this._iStaticWidth = 0;
		this._iMBWidth = 0;
		this._iStaticWidthForSearch = 0;

		if (this._oControl._oTitleControl ) {
			this._iMBWidth = this.getTargetWidth(this._oControl._oTitleControl, true) +
			this._oControl._oTitleControl._iStaticWidth + this._iDoubleChildControlMargin ;
		}

		this._iTitleWidth = this.getTargetWidth(this._oControl._oSecondTitle);

		if (this._oControl._oHomeIcon) {
			this._iStaticWidth += this._oControl._oHomeIcon.$().outerWidth(true);
		}

		if (this._oControl._oNavButton) {
			this._iStaticWidth += 36 + this._iDoubleChildControlMargin;
		}

		if (this._oControl._oMenuButton) {
			this._iStaticWidth += 36 + this._iChildControlMargin;
		}

		if (this._oControl._oAvatarButton) {
			this._iStaticWidthForSearch += 36 + this._iDoubleChildControlMargin;
		}

		// check is the overflow button should be shown
		if (this._oControl._oProductSwitcher || this._oControl._oNotifications || this._oControl.getAdditionalContent()) {
			this._iStaticWidthForSearch += 36 + this._iDoubleChildControlMargin;
		}

		if (this._oControl && this._oControl._oCopilot) {
			this._iStaticWidthForSearch += this._iHalfCoPilotWidth;
		}
	};

	/**
	 * Handler for the homeIcon image load event
	 * @private
	 */
	ResponsiveHandler.prototype._updateHomeIconWidth = function () {
		this._iCurrentWidth = this._oControl._oHomeIcon.$().width();

		if (this._iCurrentWidth === this._iLastWidth) {
			return;
		}

		this._iLastWidth = this._iCurrentWidth;

		this._initResize();
		this._fnResize();
	};

	/**
	 * Handler for the MegaMenu image load event
	 * @private
	 */
	ResponsiveHandler.prototype._updateMegaMenuWidth = function () {
		this._initResize();
		this._fnResize();
	};

	/**
	 * Event handler for control resize. This is a pre-resize handler which is executed on every control width change.
	 * It determines the available size for the managed controls prior to adapting their widths and visibility according
	 * to UX rules. This handler is also responsible for the control padding's outside of the managed area and for
	 * control mode according to available width as the control behaves different on desktop and mobile sizes and
	 * needs to adapt to different responsive behavior for the managed controls.
	 * @private
	 */
	ResponsiveHandler.prototype._handleResize = function () {
		if (!this._oDomRef) {return;}

		var $Control = this._oControl.$(),
			iWidth = $Control.outerWidth(),
			oCurrentRange = Device.media.getCurrentRange("Std", iWidth),
			bPhoneRange;

		// Adapt control padding's outside the managed area
		if (oCurrentRange) {
			bPhoneRange = oCurrentRange.name === "Phone";

			$Control.toggleClass("sapFShellBarSizeDesktop", oCurrentRange.name === "Desktop");
			$Control.toggleClass("sapFShellBarSizeTablet", oCurrentRange.name === "Tablet");
			$Control.toggleClass("sapFShellBarSizePhone", bPhoneRange);
		}

		if (this._iPreviousWidth === iWidth) {
			return; // We have nothing to update
		}
		this._iPreviousWidth = iWidth;

		// If none of the managed controls are available - no further adaptation is needed
		if (!this._oControl._oNavButton &&
			!this._oControl._oMenuButton &&
			!this._oControl._oHomeIcon &&
			!this._oControl._oMegaMenu &&
			!this._oControl._oSecondTitle &&
			!this._oControl._oCopilot) {
			return;
		}

		// Note: We change the final resize handler depending on available width of the control. This is done
		// only once when we go from mobile to desktop size and back.
		if (bPhoneRange && !this.bWasInPhoneRange) {
			this._fnResize = this._resizeOnPhone;
			this._transformToPhoneState();

		} else if (!bPhoneRange && this.bWasInPhoneRange) {
			this._fnResize = this._resize;
			this._transformToRegularState();

		}

		// We call the final resize handler which will resize the managed controls according to the UX rules
		setTimeout(this._fnResize.bind(this), 0);
	};

	ResponsiveHandler.prototype._switchOpenStateOnSearch = function () {
		if (this.bWasInPhoneRange) {
			this._transformToPhoneState();
		} else {
			this._transformToRegularState();
		}
	};

	/**
	 * Apply's UX rules to the control for phone size
	 * @private
	 */
	ResponsiveHandler.prototype._transformToPhoneState = function () {
		var oSearch = this._oControl._oManagedSearch;
		// Second title should not be visible
		if (this._oControl._oSecondTitle) {
			this._oControl._oSecondTitle.setVisible(false);
		}

		this._transformTitleControlMobile();

		if (!this._controlsLayoutDataCached) {
			// Cache controls layout data
			this._cacheControlsLayoutData();
			this._controlsLayoutDataCached = true;
		}
		// Force all controls in the overflow
		this._oControl._aOverflowControls.forEach(function (oControl) {
			oControl.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			}));
		});

		this.bWasInPhoneRange = true;

		if (oSearch) {
			oSearch.setPhoneMode(true);

			if (oSearch.getIsOpen()) {
				this._toggleAllControlsExceptSearch(false);

				this._bSearchWasOpen = true;
			} else if (this._bSearchWasOpen) {
				this._toggleAllControlsExceptSearch(true);

				this._oControl._oHomeIcon.setVisible(false);
				this._oControl._oSecondTitle.setVisible(false);

				this._bSearchWasOpen = false;
			}
		}

		this._oControl.invalidate();
	};
	/**
	 * Apply's UX rules to the control for bigger than phone screen sizes
	 * @private
	 */
	ResponsiveHandler.prototype._transformToRegularState = function () {
		var oSearch = this._oControl._oManagedSearch;
		// Second title should be visible
		this._toggleAllControlsExceptSearch(true);

		if (this._oControl._oSecondTitle) {
			this._oControl._oSecondTitle.setVisible(true);
		}

		// Home icon should be visible
		if (this._oControl._oHomeIcon) {
			// If we have MegaMenu we should get back the Icon and restore it's text
			if (this._oControl._oMegaMenu) {
				this._oControl._oMegaMenu.setText(this._oControl._sTitle).setIcon("");
			}
			if (this._oControl._oPrimaryTitle) {
				this._oControl._oPrimaryTitle.setVisible(true);
			}
			if (this.bIsMegaMenuConfigured) {
				this._oControl._oHomeIcon.setVisible(true);
			}
		}

		if (this._controlsLayoutDataCached) {
			// Restore controls layout data from cache
			this._restoreControlsLayoutData();
			this._controlsLayoutDataCached = false;
		}

		this.bWasInPhoneRange = false;

		oSearch && oSearch.setPhoneMode(false);

		this._oControl.invalidate();
	};
	/**
	 * Applies different configuration for mobile for some of the contained controls
	 * @private
	 */
	ResponsiveHandler.prototype._transformTitleControlMobile = function (){

		var bIsSearchOpen = this._oControl._oManagedSearch && this._oControl._oManagedSearch.getIsOpen();
		// Home icon should not be visible
		if (this._oControl._oHomeIcon) {
			// We should inject the homeIcon in the MegaMenu and remove the text
			if (this._oControl._oMegaMenu) {
				bIsSearchOpen ? this._oControl._oMegaMenu.setVisible(false) :
					this._oControl._oMegaMenu.setWidth("auto").setText("").setIcon(this._oControl.getHomeIcon());
			}
			if (this._oControl._oPrimaryTitle) {
				this._oControl._oPrimaryTitle.setVisible(false);
			}
			this._oControl._oHomeIcon.setVisible(!this.bIsMegaMenuConfigured && !bIsSearchOpen);
		}
	};

	/**
	 * Responsive handler for phone screen sizes.
	 * Applies managed controls sizes according to UX rules.
	 * @private
	 */
	ResponsiveHandler.prototype._resizeOnPhone = function () {
		var iWidth = this._oControl._getOverflowToolbar().$().width(),
			iAvailableWidth;

		if  (this._oControl._oCopilot) {
			iWidth -= this._iCoPilotWidth;
			iAvailableWidth = (iWidth / 2) - this._iStaticWidth;
		} else {
			iAvailableWidth = iWidth - this._iStaticWidth - this._getWidthOfAllNonManagedControls();
		}

		if (!this._oControl._oHomeIcon && this.bIsMegaMenuConfigured) {
			if (this._iMBWidth >= iAvailableWidth) {
				// Applied width should be without margins
				this._oControl._oTitleControl.setWidth((iAvailableWidth - this._iDoubleChildControlMargin) + "px");
			} else {
				// Applied width should be without margins
				this._oControl._oTitleControl.setWidth((this._iMBWidth - this._iDoubleChildControlMargin) + "px");
			}
		}

		if (this._oControl._oTitleControl) {
			iAvailableWidth -= this._oControl._oTitleControl.$().outerWidth(true);
		}

		if (iAvailableWidth < 0) {iAvailableWidth = 0;}
		this._oControl._oCopilot && this._oControl._oControlSpacer.setWidth(iAvailableWidth + "px");
	};

	/**
	 * Responsive handler for bigger than phone screen sizes.
	 * Calculates the available width for managed controls based on ShellBar state.
	 * @private
	 */
	ResponsiveHandler.prototype._resize = function () {
		var iWidth = this._oControl._getOverflowToolbar().$().width(),
			iAvailableWidth,
			iOTBControls,
			// iNeededWidthForSearch,
			iHalfWidth = iWidth / 2;

		if (this._oControl._oManagedSearch && this._oControl._oManagedSearch.getIsOpen()) {
			this._adaptSearch(iHalfWidth);
		}

		if (!this._oControl._oCopilot) {
			iOTBControls = this._getWidthOfAllNonManagedControls();
			iAvailableWidth = iWidth - iOTBControls - this._iStaticWidth - (8 * this._iREMSize);

			this._adaptManagedWidthControls(iAvailableWidth);
			return;
		}

		iAvailableWidth = iHalfWidth - this._iHalfCoPilotWidth - this._iStaticWidth;
		this._adaptManagedWidthControls(iAvailableWidth);
	};

	/**
	 * Utility method to measure all non-managed controls that are part of the OverflowToolbar but are not in the
	 * overflow part of the control.
	 * @returns {int} Sum of all visible control widths
	 * @private
	 */
	ResponsiveHandler.prototype._getWidthOfAllNonManagedControls = function () {
		var aControls = this._oControl._oOverflowToolbar.$().children(),
			iOTBControls = 0;

		aControls.filter(function (i, oDomRef) {
			var $Ctr = jQuery(oDomRef),
				oCtr = $Ctr.control(0);

			if (oCtr === this._oControl._oNavButton) {return false;}
			if (oCtr === this._oControl._oMenuButton) {return false;}
			if (oCtr === this._oControl._oHomeIcon) {return false;}
			if (oCtr === this._oControl._oMegaMenu) {return false;}
			if (oCtr === this._oControl._oSecondTitle) {return false;}
			if (oCtr === this._oControl._oControlSpacer) {return false;}
			if (oCtr === this._oControl._oToolbarSpacer) {return false;}

			iOTBControls += $Ctr.outerWidth(true);
			return true;
		}.bind(this));

		return iOTBControls;
	};

	ResponsiveHandler.prototype._adaptSearch = function (iAvailableWidth) {
		iAvailableWidth = iAvailableWidth - this._iStaticWidthForSearch - this._iDoubleChildControlMargin;

		// By UX design search max-width should be 29rem (464px)
		if (iAvailableWidth > 464) {
			this._oControl._oManagedSearch.setWidth("464px");
			return;
		}

		// By UX design search min-width should be 12rem (192px)
		if (iAvailableWidth < 192) {
			this._toggleAllControlsExceptSearch(false);
			this._oControl._oManagedSearch.setWidth("100%");
			this._oControl._oManagedSearch.setPhoneMode(true);

			this._bSearchFullWidth = true;
			return;
		}

		if (this._bSearchFullWidth) {
			this._toggleAllControlsExceptSearch(true);

			this._oControl._oManagedSearch.setPhoneMode(false);
			this._bSearchFullWidth = false;
		}

		// If available space is between 192px and 464px search should take whole
		this._oControl._oManagedSearch.setWidth(iAvailableWidth + "px");
	};

	ResponsiveHandler.prototype._toggleAllControlsExceptSearch = function (bShow) {
		this._oControl._oOverflowToolbar.getContent().forEach(function (oOTBControl) {
			if (oOTBControl !== this._oControl._oManagedSearch) {
				oOTBControl.setVisible(bShow);
			}
		}.bind(this));
	};

	/**
	 * Final resize handler which handles control widths of all managed controls according to UX rules and the available
	 * width for them. Keep in mind that this handler takes care for different scenarios based on availability of
	 * managed controls. This handler is taking care for bigger than phone screen sizes.
	 * @param {int} iAvailableWidth The available width for the managed controls
	 * @private
	 */
	ResponsiveHandler.prototype._adaptManagedWidthControls = function (iAvailableWidth) {
		var bHasTitle = !!this._oControl._oTitleControl,
			iMBWidth = bHasTitle ? this._iMBWidth : 0,
			iTitleWidth = this._iTitleWidth,
			iCollectiveWidth = iMBWidth + iTitleWidth,
			oSecondTitle = this._oControl._oSecondTitle,
			oControlSpacer = this._oControl._oControlSpacer,
			iSecondTitleWidth,
			iMinTitleWidth = 80,
			iMegaMenuWidth;

		if (iAvailableWidth <= 0) {
			oControlSpacer && oControlSpacer.setWidth("0px");
			oSecondTitle && oSecondTitle.setWidth("0px");

			// Applied width should be without margins
			bHasTitle && this._oControl._oTitleControl.setWidth(iMinTitleWidth + "px");
			return;
		}

		if (iCollectiveWidth < 0) {iCollectiveWidth = 0;}
		if (iMBWidth < 0) {iMBWidth = 0;}

		if (iMBWidth >= iAvailableWidth) {
			oControlSpacer && oControlSpacer.setWidth("0px");
			oSecondTitle && oSecondTitle.setWidth("0px");

			iMegaMenuWidth = iAvailableWidth - this._iDoubleChildControlMargin <= iMinTitleWidth ?
				iMinTitleWidth : iAvailableWidth - this._iDoubleChildControlMargin;
			// Applied width should be without margins
			bHasTitle && this._oControl._oTitleControl.setWidth(iMegaMenuWidth + "px");
			return;
		} else {
			iMegaMenuWidth = iMBWidth - this._iDoubleChildControlMargin <= iMinTitleWidth ?
				iMinTitleWidth : iMBWidth - this._iDoubleChildControlMargin;
			// Applied width should be without margins
			bHasTitle && this._oControl._oTitleControl.setWidth(iMegaMenuWidth + "px");
		}

		if (iAvailableWidth >= iMBWidth && iAvailableWidth <= iCollectiveWidth) {

			iSecondTitleWidth = iAvailableWidth - iMBWidth;
			if (iSecondTitleWidth < 0) {iSecondTitleWidth = 0;}

			if (iSecondTitleWidth > 32 /* min-width of the Second Title */) {
				oControlSpacer && oControlSpacer.setWidth("0px");
				oSecondTitle && oSecondTitle.setWidth(iSecondTitleWidth + "px");
			} else {
				oControlSpacer && oControlSpacer.setWidth(iSecondTitleWidth + "px");
				oSecondTitle && oSecondTitle.setWidth("0px");
			}
			return;
		} else {
			oSecondTitle && oSecondTitle.setWidth(iTitleWidth + "px");
		}

		if (iAvailableWidth > iCollectiveWidth) {
			oControlSpacer && oControlSpacer.setWidth((iAvailableWidth - iCollectiveWidth) + "px");
		}
	};

	/**
	 * Cache layout data of all the controls that should go into the overflow
	 * @private
	 */
	ResponsiveHandler.prototype._cacheControlsLayoutData = function () {
		this._oCachedLayoutData = {};
		this._oControl._aOverflowControls.forEach(function (oCtr) {
			this._oCachedLayoutData[oCtr.getId()] = oCtr.getLayoutData();
		}.bind(this));
	};

	/**
	 * Restore layout data for all the control that were in the overflow area
	 * @private
	 */
	ResponsiveHandler.prototype._restoreControlsLayoutData = function () {
		this._oControl._aOverflowControls.forEach(function (oCtr) {
			var oLayoutData = this._oCachedLayoutData[oCtr.getId()];
			if (oLayoutData) {
				oCtr.setLayoutData(oLayoutData);
			}
		}.bind(this));
	};

	/**
	 * Retrieve the target width of a control text by rendering a div with a specific font size in the static area
	 * to measure the width of the text and then removing the not needed div.
	 * @param {sap.ui.core.Control} oCtr the control with "text" property
	 * @param {boolean} [bBold=false] should we measure bold text
	 * @returns {int} the width of the measured text
	 */
	ResponsiveHandler.prototype.getTargetWidth = function (oCtr, bBold) {
		if (!oCtr) {return 0;}

		var sText = oCtr.getText(),
			oDiv = document.createElement("div"),
			oText = document.createTextNode(sText),
			oStaticArea = sap.ui.getCore().getStaticAreaRef(),
			iWidth;

		// Create div and add to static area
		oDiv.appendChild(oText);
		oDiv.style.setProperty("white-space", "nowrap");
		oDiv.style.setProperty("display", "inline-block");
		oDiv.style.setProperty("font-size", oCtr._sFontSize);
		if (bBold) {
			oDiv.style.setProperty("font-weight", "bold");
		}
		oStaticArea.appendChild(oDiv);

		// Record width
		if (oDiv.getBoundingClientRect) {
			iWidth = oDiv.getBoundingClientRect().width;
		} else {
			iWidth = oDiv.scrollWidth;
		}

		// We add 1px to compensate for rounding related to zoom levels
		iWidth += 1;

		// Remove child from static area
		oStaticArea.removeChild(oDiv);

		return iWidth;
	};

	return ResponsiveHandler;

});
