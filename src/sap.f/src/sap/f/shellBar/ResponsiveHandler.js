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

	var oControl;

	/**
	 * Class taking care of the control responsive behaviour.
	 * @alias sap/f/shellBar/ResponsiveHandler
	 * @experimental Since 1.63. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @since 1.63
	 * @private
	 * @property {object} oContext the context of the ShellBar control instance
	 */
	var ResponsiveHandler = function (oContext) {
		oControl = oContext;

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
		oControl.addDelegate(this._oDelegate, false, this);

		// Init resize handler method
		this._fnResize = this._resize;

		// Attach events
		oControl._oOverflowToolbar.attachEvent("_controlWidthChanged", this._handleResize, this);
	};

	/**
	 * Lifecycle event handler for ShellBar onAfterRendering event
	 */
	ResponsiveHandler.prototype.onAfterRendering = function () {
		this._oDomRef = oControl.getDomRef(); // Cache DOM Reference

		if (oControl._oMegaMenu) {
			// Attach on internal button image load
			this._oButton = oControl._oMegaMenu.getAggregation("_button");
			if (this._oButton && this._oButton._image) {
				// We need to update all the measurements of the control when the image is loaded in the DOM as we can't
				// measure it before that
				this._oButton._image.attachEvent("load", this._updateMegaMenuWidth, this);
			}
		}

		this._initResize();
		this._handleResize();
	};

	/**
	 * Lifecycle event handler for ShellBar onBeforeRendering event
	 */
	ResponsiveHandler.prototype.onBeforeRendering = function () {
		if (oControl._oHomeIcon) {
			oControl._oHomeIcon.attachEvent("load", this._updateHomeIconWidth, this);
		}
	};

	/**
	 * Lifecycle event handler for cleaning after the control is not needed anymore
	 */
	ResponsiveHandler.prototype.exit = function () {
		if (oControl._oOverflowToolbar) {
			oControl._oOverflowToolbar.detachEvent("_controlWidthChanged", this._handleResize, this);
		}
		if (oControl._oHomeIcon) {
			oControl._oHomeIcon.detachEvent("load", this._updateHomeIconWidth, this);
		}
		if (this._oButton) {
			this._oButton.detachEvent("load", this._updateMegaMenuWidth, this);
		}
		oControl.removeDelegate(this._oDelegate);
	};

	/**
	 * Initialize the resize handler by caching some sizes which are changing only control property changes or image
	 * loads of child controls. We don't need to update these cached sizes on control width changes.
	 * @private
	 */
	ResponsiveHandler.prototype._initResize = function () {
		this._iStaticWidth = 0;

		this._iMBWidth = this.getTargetWidth(oControl._oMegaMenu) + 65/* Control padding and arrow */ + (2 * this._iChildControlMargin);
		this._iTitleWidth = this.getTargetWidth(oControl._oSecondTitle);

		if (oControl._oHomeIcon) {
			this._iStaticWidth += oControl._oHomeIcon.$().outerWidth(true);
		}

		if (oControl._oNavButton) {
			this._iStaticWidth += 36 + this._iDoubleChildControlMargin;
		}

		if (oControl._oMenuButton) {
			this._iStaticWidth += 36 + this._iDoubleChildControlMargin;
		}
	};

	/**
	 * Handler for the homeIcon image load event
	 * @private
	 */
	ResponsiveHandler.prototype._updateHomeIconWidth = function () {
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

		var $Control = oControl.$(),
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
		if (!oControl._oNavButton &&
			!oControl._oMenuButton &&
			!oControl._oHomeIcon &&
			!oControl._oMegaMenu &&
			!oControl._oSecondTitle &&
			!oControl._oCopilot) {
			return;
		}

		// Note: We change the final resize handler depending on available width of the control. This is done
		// only once when we go from mobile to desktop size and back.
		if (bPhoneRange && !this.bWasInPhoneRange) {
			this._fnResize = this._resizeOnPhone;
			this._transformToPhoneState();
			return;
		} else if (!bPhoneRange && this.bWasInPhoneRange) {
			this._fnResize = this._resize;
			this._transformToRegularState();
			return;
		}

		// We call the final resize handler which will resize the managed controls according to the UX rules
		setTimeout(this._fnResize.bind(this), 0);
	};

	/**
	 * Apply's UX rules to the control for phone size
	 * @private
	 */
	ResponsiveHandler.prototype._transformToPhoneState = function () {
		// Second title should not be visible
		if (oControl._oSecondTitle) {
			oControl._oSecondTitle.setVisible(false);
		}

		// Home icon should not be visible
		if (oControl._oHomeIcon) {
			oControl._oHomeIcon.setVisible(false);
			// We should inject the homeIcon in the MegaMenu and remove the text
			if (oControl._oMegaMenu) {
				oControl._oMegaMenu.setWidth("auto").setText("").setIcon(oControl.getHomeIcon());
			}
		}

		// Cache controls layout data
		this._cacheControlsLayoutData();

		// Force all controls in the overflow
		oControl._aOverflowControls.forEach(function (oControl) {
			oControl.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			}));
		});

		this.bWasInPhoneRange = true;
		oControl.invalidate();
	};

	/**
	 * Apply's UX rules to the control for bigger than phone screen sizes
	 * @private
	 */
	ResponsiveHandler.prototype._transformToRegularState = function () {
		// Second title should be visible
		if (oControl._oSecondTitle) {
			oControl._oSecondTitle.setVisible(true);
		}

		// Home icon should be visible
		if (oControl._oHomeIcon) {
			oControl._oHomeIcon.setVisible(true);
			// If we have MegaMenu we should get back the Icon and restore it's text
			if (oControl._oMegaMenu) {
				oControl._oMegaMenu.setWidth("auto").setText(oControl._sTitle).setIcon("");
			}
		}

		// Restore controls layout data from cache
		this._restoreControlsLayoutData();

		this.bWasInPhoneRange = false;
		oControl.invalidate();
	};

	/**
	 * Responsive handler for phone screen sizes.
	 * Applies managed controls sizes according to UX rules.
	 * @private
	 */
	ResponsiveHandler.prototype._resizeOnPhone = function () {
		var iWidth,
			iAvailableWidth;

		if  (oControl._oCopilot) {
			iWidth = oControl.$().width() - this._iCoPilotWidth;
			iAvailableWidth = (iWidth / 2) - this._iStaticWidth;
		} else {
			iWidth = oControl.$().width();
			iAvailableWidth = iWidth - this._iStaticWidth - this._getWidthOfAllNonManagedControls();
		}

		if (!oControl._oHomeIcon && oControl._sTitle) {
			if (this._iMBWidth >= iAvailableWidth) {
				// Applied width should be without margins
				oControl._oMegaMenu.setWidth((iAvailableWidth - this._iDoubleChildControlMargin) + "px");
			} else {
				// Applied width should be without margins
				oControl._oMegaMenu.setWidth((this._iMBWidth - this._iDoubleChildControlMargin) + "px");
			}
		}

		if (oControl._oMegaMenu) {
			iAvailableWidth -= oControl._oMegaMenu.$().outerWidth(true);
		}

		if (iAvailableWidth < 0) {iAvailableWidth = 0;}
		oControl._oControlSpacer.setWidth(iAvailableWidth + "px");
	};

	/**
	 * Responsive handler for bigger than phone screen sizes.
	 * Calculates the available width for managed controls based on ShellBar state.
	 * @private
	 */
	ResponsiveHandler.prototype._resize = function () {
		var iWidth = oControl.$().width(),
			iAvailableWidth,
			iOTBControls;

		if (!oControl._oCopilot) {
			iOTBControls = this._getWidthOfAllNonManagedControls();
			iAvailableWidth = iWidth - iOTBControls - this._iStaticWidth - (8 * this._iREMSize);

			this._adaptManagedWidthControls(iAvailableWidth);
			return;
		}

		iAvailableWidth = (iWidth / 2) - this._iHalfCoPilotWidth - this._iStaticWidth;
		this._adaptManagedWidthControls(iAvailableWidth);
	};

	/**
	 * Utility method to measure all non-managed controls that are part of the OverflowToolbar but are not in the
	 * overflow part of the control.
	 * @returns {int} Sum of all visible control widths
	 * @private
	 */
	ResponsiveHandler.prototype._getWidthOfAllNonManagedControls = function () {
		var aControls = oControl._oOverflowToolbar.$().children(),
			iOTBControls = 0;

		aControls.filter(function (i, oDomRef) {
			var $Ctr = jQuery(oDomRef),
				oCtr = $Ctr.control(0);

			if (oCtr === oControl._oNavButton) {return false;}
			if (oCtr === oControl._oMenuButton) {return false;}
			if (oCtr === oControl._oHomeIcon) {return false;}
			if (oCtr === oControl._oMegaMenu) {return false;}
			if (oCtr === oControl._oSecondTitle) {return false;}
			if (oCtr === oControl._oControlSpacer) {return false;}
			if (oCtr === oControl._oToolbarSpacer) {return false;}

			iOTBControls += $Ctr.outerWidth(true);
			return true;
		});

		return iOTBControls;
	};

	/**
	 * Final resize handler which handles control widths of all managed controls according to UX rules and the available
	 * width for them. Keep in mind that this handler takes care for different scenarios based on availability of
	 * managed controls. This handler is taking care for bigger than phone screen sizes.
	 * @param {int} iAvailableWidth The available width for the managed controls
	 * @private
	 */
	ResponsiveHandler.prototype._adaptManagedWidthControls = function (iAvailableWidth) {
		var bHasTitle = oControl._sTitle,
			iMBWidth = bHasTitle ? this._iMBWidth : 36 + this._iDoubleChildControlMargin,
			iTitleWidth = this._iTitleWidth,
			iCollectiveWidth = iMBWidth + iTitleWidth,
			oSecondTitle = oControl._oSecondTitle,
			oMegaMenu = oControl._oMegaMenu,
			oControlSpacer = oControl._oControlSpacer,
			iSecondTitleWidth;

		if (!oMegaMenu) {
			iCollectiveWidth -= 36 + this._iDoubleChildControlMargin;
		}

		if (iCollectiveWidth < 0) {iCollectiveWidth = 0;}
		if (iMBWidth < 0) {iMBWidth = 0;}

		if (iMBWidth >= iAvailableWidth) {
			oControlSpacer && oControlSpacer.setWidth("0px");
			oSecondTitle && oSecondTitle.setWidth("0px");

			// Applied width should be without margins
			bHasTitle && oMegaMenu.setWidth((iAvailableWidth - this._iDoubleChildControlMargin) + "px");
			return;
		} else {
			// Applied width should be without margins
			bHasTitle && oMegaMenu.setWidth((iMBWidth - this._iDoubleChildControlMargin) + "px");
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
		oControl._aOverflowControls.forEach(function (oCtr) {
			this._oCachedLayoutData[oCtr.getId()] = oCtr.getLayoutData();
		}.bind(this));
	};

	/**
	 * Restore layout data for all the control that were in the overflow area
	 * @private
	 */
	ResponsiveHandler.prototype._restoreControlsLayoutData = function () {
		oControl._aOverflowControls.forEach(function (oCtr) {
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
		oDiv.style.setProperty("font-size", "0.875rem");
		if (bBold) {
			oDiv.style.setProperty("font-weight", "bold");
		}
		oStaticArea.appendChild(oDiv);

		// Record width
		iWidth = oDiv.scrollWidth;

		// Remove child from static area
		oStaticArea.removeChild(oDiv);

		return iWidth;
	};

	return ResponsiveHandler;

});