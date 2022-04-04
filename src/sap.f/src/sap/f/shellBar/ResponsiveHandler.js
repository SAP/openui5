/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/units/Rem",
	"sap/m/library"
], function (
	OverflowToolbarLayoutData,
	Device,
	ResizeHandler,
	Rem,
	library
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	/**
	 * Constant based on UX concept for search bar behavior;
	 */
	var MIN_SEARCHBAR_WIDTH_REM = 12;

	/**
	 * Class taking care of the control responsive behaviour.
	 * @alias module:sap/f/shellBar/ResponsiveHandler
	 * @since 1.63
	 * @private
	 * @property {object} oContext the context of the ShellBar control instance
	 */
	var ResponsiveHandler = function (oContext) {
		this._oControl = oContext;

		// Delegate used to attach on ShellBar lifecycle events
		this._oDelegate = {
			onAfterRendering: this.onAfterRendering,
			onBeforeRendering: this.onBeforeRendering
		};

		// Attach Event Delegates
		this._oControl.addDelegate(this._oDelegate, false, this);

		this.sCurrentRange = "";

		this._bAttachedManagedSearchHandler = false;

		// Attach events
		this._oControl._iResizeHandlerId = ResizeHandler.register(this._oControl, this._handleResize.bind(this));

		this._iMinSearchWidth = Rem.toPx(MIN_SEARCHBAR_WIDTH_REM);
	};


	/**
	 * Lifecycle event handler for ShellBar onAfterRendering event
	 */
	ResponsiveHandler.prototype.onAfterRendering = function () {

		var bPhoneRange = Device.media.getCurrentRange("StdExt", this._oControl.$().outerWidth(true)).name === "Phone";
		this._oButton = this._oControl._oMegaMenu && this._oControl._oMegaMenu.getAggregation("_button");
		this._oDomRef = this._oControl.getDomRef(); // Cache DOM Reference
		this.bIsMegaMenuConfigured = this._oControl._oTitleControl &&
		this._oControl._oTitleControl === this._oControl._oMegaMenu;

		if (this._oControl._oManagedSearch && !this._bAttachedManagedSearchHandler) {
			this._oControl._oManagedSearch.attachEvent("_updateVisualState", this._switchOpenStateOnSearch, this);

			this._bAttachedManagedSearchHandler = true;
		}

		if (bPhoneRange) {
			this._transformTitleControlMobile();
		}

		this._handleResize();
	};

	/**
	 * Lifecycle event handler for cleaning after the control is not needed anymore
	 */
	ResponsiveHandler.prototype.exit = function () {
		if (this._oControl._iResizeHandlerId) {
			ResizeHandler.deregister(this._oControl._iResizeHandlerId);
			this._oControl._iResizeHandlerId = null;
		}
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
			oCurrentRange = Device.media.getCurrentRange("StdExt", iWidth),
			bPhoneRange;

		this.sCurrentRange = oCurrentRange.name;
		// Adapt control padding's outside the managed area
		if (oCurrentRange) {
			bPhoneRange = this.sCurrentRange === "Phone";

			$Control.toggleClass("sapFShellBarSizeLargeDesktop", this.sCurrentRange === "LargeDesktop");
			$Control.toggleClass("sapFShellBarSizeDesktop", this.sCurrentRange === "Desktop");
			$Control.toggleClass("sapFShellBarSizeTablet", this.sCurrentRange === "Tablet");
			$Control.toggleClass("sapFShellBarSizePhone", bPhoneRange);
		}

		/**
		 * Resize adaptation for the Search Bar UX requirements
		 */
		if (this._oControl._oManagedSearch && this._oControl._oManagedSearch.getIsOpen()) {
			setTimeout(this._adaptSearch.bind(this), 100);
		} else {
			this._oControl._bSearchPlaceHolder = false;
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
			!this._oControl._oManagedSearch &&
			!this._oControl._oCopilot) {
			return;
		}

		// Note: We change the final resize handler depending on available width of the control. This is done
		// only once when we go from mobile to desktop size and back.
		if (bPhoneRange && !this.bWasInPhoneRange) {
			this._transformToPhoneState();

		} else if (!bPhoneRange && this.bWasInPhoneRange) {
			this._transformToRegularState();

		}
	};

	ResponsiveHandler.prototype._switchOpenStateOnSearch = function () {
		var oSearch = this._oControl._oManagedSearch;
		if (!oSearch) {return; }
		if (this.bWasInPhoneRange) {
			this._transformToPhoneState();
		} else {
			this._transformToRegularState();
		}
		this._oControl.toggleStyleClass("sapFShellBarSearchIsOpen", oSearch.getIsOpen());
	};

	/**
	 * Apply's UX rules to the control for phone size
	 * @private
	 */
	ResponsiveHandler.prototype._transformToPhoneState = function () {
		var oSearch = this._oControl._oManagedSearch,
			aOverflowControls = this._oControl._getOverflowToolbar().getContent(),
			oSpacer = this._oControl._oToolbarSpacer;
		// Second title should not be visible
		if (this._oControl._oSecondTitle) {
			this._oControl._oSecondTitle.setVisible(false);
		}

		this._transformTitleControlMobile();

		if (!this._bControlsLayoutDataCached) {
			// Cache controls layout data
			this._cacheControlsLayoutData();
			this._bControlsLayoutDataCached = true;
		}
		// Force all controls in the overflow
		aOverflowControls.forEach(function (oControl) {
			if (oControl === oSpacer) { return; }

			oControl.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			}));
		});

		this.bWasInPhoneRange = true;

		if (oSearch) {
			oSearch.setPhoneMode(true);

			if (oSearch.getIsOpen()) {
				this._toggleAllControlsExceptSearch(true);

				this._bSearchWasOpen = true;
			} else if (this._bSearchWasOpen) {
				this._toggleAllControlsExceptSearch(false);

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
		this._toggleAllControlsExceptSearch(false);

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
				this._oControl._oPrimaryTitle.setText(this._oControl._sTitle);
			}
			if (this.bIsMegaMenuConfigured) {
				this._oControl._oHomeIcon.setVisible(true);
			}
		}

		if (this._bControlsLayoutDataCached) {
			// Restore controls layout data from cache
			this._restoreControlsLayoutData();
			this._bControlsLayoutDataCached = false;
		}

		this.bWasInPhoneRange = false;

		if (oSearch) {
			oSearch.setPhoneMode(false);
			this._oControl._bSearchPlaceHolder = false;
		}
		this._oControl.invalidate();
	};

	/**
	 * Applies different configuration for mobile for some of the contained controls
	 * @private
	 */

	ResponsiveHandler.prototype._transformTitleControlMobile = function (){
		var bControlUpdateNeeded;
		// Home icon should not be visible
		if (!this._oControl._oHomeIcon ) {
			return this.bIsMegaMenuConfigured ?
				this._oControl._oMegaMenu.setText(this._oControl.getTitle()).setIcon("")
				: false;
		}
			// We should inject the homeIcon in the MegaMenu and remove the text
		bControlUpdateNeeded = this.bIsMegaMenuConfigured && this._oControl._oHomeIcon.getVisible() ||
			!this.bIsMegaMenuConfigured && !this._oControl._oHomeIcon.getVisible();
		if (this._oControl._oMegaMenu) {
			this._oControl._oMegaMenu.setText("").setIcon(this._oControl.getHomeIcon());
		}
		if (this._oControl._oPrimaryTitle) {
			this._oControl._oPrimaryTitle.setText("");
		}

		if (bControlUpdateNeeded) {
			this._oControl._oHomeIcon.setVisible(!this.bIsMegaMenuConfigured);
			this._oControl.invalidate();
		}
	};

	/**
	 * Apply UX rules for open search on resize event
	 * @private
	 */

	ResponsiveHandler.prototype._adaptSearch = function () {
		var oSearch = this._oControl._oManagedSearch,
			iSearchWidth;

		if (!oSearch || this.sCurrentRange === "Phone") {
			return;
		}

		iSearchWidth = oSearch.$().width();

		if (this._oControl._bSearchPlaceHolder){
			if (iSearchWidth >= this._iMinSearchWidth) {
				this._oControl._bSearchPlaceHolder = false;
				this._toggleAllControlsExceptSearch(false);
			}
		} else if (iSearchWidth < this._iMinSearchWidth) {
			this._oControl._bSearchPlaceHolder = true;
			this._toggleAllControlsExceptSearch(true);
		} else if (oSearch.hasStyleClass("sapFShellBarSearchOpenTick")) {
			oSearch.removeStyleClass("sapFShellBarSearchOpenTick");
			this._adaptSearch();
		}

		return this;
	};

	/**
	 * Applies CSS class to the parent element, which conducts the visibility of all elements "under" the search bar
	 * @private
	 */
	ResponsiveHandler.prototype._toggleAllControlsExceptSearch = function (bShow) {
		var oSearch = this._oControl._oManagedSearch;
		this._oControl.toggleStyleClass("sapFShellBarFullSearch", bShow);
		oSearch && oSearch.toggleStyleClass("sapFShellBarSearchFullWidth", bShow);
	};
	/**
	 * Cache layout data of all the controls that should go into the overflow
	 * @private
	 */
	ResponsiveHandler.prototype._cacheControlsLayoutData = function () {
		var aOverflowControls = this._oControl._getOverflowToolbar().getContent();

		this._oCachedLayoutData = {};
		aOverflowControls.forEach(function (oCtr) {
			this._oCachedLayoutData[oCtr.getId()] = oCtr.getLayoutData();
		}, this);
	};

	/**
	 * Restore layout data for all the control that were in the overflow area
	 * @private
	 */
	ResponsiveHandler.prototype._restoreControlsLayoutData = function () {
		var aOverflowControls = this._oControl._getOverflowToolbar().getContent();

		aOverflowControls.forEach(function (oCtr) {
			var oLayoutData = this._oCachedLayoutData[oCtr.getId()];
			if (oLayoutData) {
				oCtr.setLayoutData(oLayoutData);
			}
		}, this);
	};

	return ResponsiveHandler;

});
