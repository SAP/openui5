/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/library',
	"sap/ui/core/Core"
], function(
	coreLibrary,
	Core
) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;

	/**
	 * This class is used to maintain all the accessibility roles, tooltips, etc., needed for the ShellBar control life cycle.
	 * @alias module:sap/f/shellBar/Accessibility
	 * @since 1.64
	 * @private
	 */
	var Accessibility = function (oContext) {
		if (oContext) {
			this._oControl = oContext;
			this._oControl.addDelegate(this._controlDelegate, false, this);
		}

		this.oRb = Core.getLibraryResourceBundle("sap.f");
	};

	Accessibility.AriaHasPopup = {
		MENU: AriaHasPopup.Menu,
		PRODUCTS: AriaHasPopup.Menu,
		PROFILE: AriaHasPopup.Menu,
		NOTIFICATIONS: AriaHasPopup.Dialog
	};
	Accessibility.prototype._controlDelegate = {
		onBeforeRendering: function () {
			this.attachDelegates();
		}
	};

	Accessibility.prototype.attachDelegates = function () {
		var oAvatar = this._oControl.getProfile();

		this._oDelegateSecondTitle = {
			onAfterRendering: this.onAfterRenderingSecondTitle
		};
		this._oDelegateSearch = {
			onAfterRendering: this.onAfterRenderingSearch
		};
		this._oDelegateAvatar = {
			onAfterRendering: this.onAfterRenderingAvatar
		};
		this._oDelegateProducts = {
			onAfterRendering: this.onAfterRenderingProducts
		};
		this._oDelegateNavButton = {
			onAfterRendering: this.onAfterRenderingNavButton
		};
		this._oDelegateMenuButton = {
			onAfterRendering: this.onAfterRenderingMenuButton
		};

		// Attach Event Delegates
		if (this._oControl._oSecondTitle) {
			this._oControl._oSecondTitle.addDelegate(this._oDelegateSecondTitle, false, this);
		}
		if (this._oControl._oSearch) {
			this._oControl._oSearch.addDelegate(this._oDelegateSearch, false, this);
		}
		if (oAvatar) {
			oAvatar.addDelegate(this._oDelegateAvatar, false, this);
		}
		if (this._oControl._oProductSwitcher) {
			this._oControl._oProductSwitcher.addDelegate(this._oDelegateProducts, false, this);
		}
		if (this._oControl._oNavButton) {
			this._oControl._oNavButton.addDelegate(this._oDelegateNavButton, false, this);
		}
		if (this._oControl._oMenuButton) {
			this._oControl._oMenuButton.addDelegate(this._oDelegateMenuButton, false, this);
		}
	};

	Accessibility.prototype.getRootAttributes = function () {
		return {
			role: "banner",
			label: this.oRb.getText("SHELLBAR_CONTAINER_LABEL")
		};
	};

	Accessibility.prototype.getCoPilotAttributes = function () {
		return {
			role: "button",
			label: this.oRb.getText("SHELLBAR_COPILOT_TOOLTIP")
		};
	};

	Accessibility.prototype.getEntityTooltip = function (sEntity) {
		return this.oRb.getText("SHELLBAR_" + sEntity + "_TOOLTIP") || "";
	};

	Accessibility.prototype.updateNotificationsNumber = function (sNotificationsNumber) {
		var sTooltip = this.getEntityTooltip("NOTIFICATIONS"),
			sAriaLabel = sNotificationsNumber ? sNotificationsNumber + " " + sTooltip : sTooltip;

		this._oControl._oNotifications.setTooltip(sAriaLabel);
	};

	Accessibility.prototype.onAfterRenderingSecondTitle = function () {
		var $oSecondTitle = this._oControl._oSecondTitle.$();

		$oSecondTitle.attr("role", "heading");
		$oSecondTitle.attr("aria-level", "2");
	};

	Accessibility.prototype.onAfterRenderingSearch = function () {
		this._oControl._oSearch.$().attr("aria-label", this.getEntityTooltip("SEARCH"));
	};

	Accessibility.prototype.onAfterRenderingAvatar = function () {
		var $oAvatar = this._oControl.getProfile().$();

		$oAvatar.attr("aria-label", this.getEntityTooltip("PROFILE"));
		$oAvatar.attr("aria-haspopup", "menu");
	};

	Accessibility.prototype.onAfterRenderingProducts = function () {
		var $oProducts = this._oControl._oProductSwitcher.$();

		$oProducts.attr("aria-label", this.getEntityTooltip("PRODUCTS"));
	};

	Accessibility.prototype.onAfterRenderingNavButton = function () {
		this._oControl._oNavButton.$().attr("aria-label", this.getEntityTooltip("BACK"));
	};

	Accessibility.prototype.onAfterRenderingMenuButton = function () {
		var $oMenuButton = this._oControl._oMenuButton.$();

		$oMenuButton.attr("aria-label", this.getEntityTooltip("MENU"));
	};

	Accessibility.prototype.exit = function () {
		var oAvatar = this._oControl.getProfile();
		// Detach Event Delegates
		if (this._oControl) {
			this._oControl.removeDelegate(this._controlDelegate);
		}
		if (this._oControl._oSecondTitle) {
			this._oControl._oSecondTitle.removeDelegate(this._oDelegateSecondTitle);
		}
		if (this._oControl._oSearch) {
			this._oControl._oSearch.removeDelegate(this._oDelegateSearch);
		}
		if (oAvatar) {
			oAvatar.removeDelegate(this._oDelegateAvatar);
		}
		if (this._oControl._oProductSwitcher) {
			this._oControl._oProductSwitcher.removeDelegate(this._oDelegateProducts);
		}
		if (this._oControl._oNavButton) {
			this._oControl._oNavButton.removeDelegate(this._oDelegateNavButton);
		}
		if (this._oControl._oMenuButton) {
			this._oControl._oMenuButton.removeDelegate(this._oDelegateMenuButton);
		}
	};

	return Accessibility;

});