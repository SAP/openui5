/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core"
], function(
	Core
) {
	"use strict";

	var oControl;

	/**
	 * This class is used to maintain all the accessibility roles, tooltips, etc., needed for the ShellBar control life cycle.
	 * @alias sap/f/shellBar/Accessibility
	 * @experimental Since 1.64. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @since 1.64
	 * @private
	 */
	var Accessibility = function (oContext) {
		if (oContext) {
			oControl = oContext;
			oControl.addDelegate(this._controlDelegate, false, this);
		}

		this.oRb = Core.getLibraryResourceBundle("sap.f");
	};

	Accessibility.prototype._controlDelegate = {
		onBeforeRendering: function () {
			this.attachDelegates();
		}
	};

	Accessibility.prototype.attachDelegates = function () {
		this._oDelegateSecondTitle = {
			onAfterRendering: this.onAfterRenderingSecondTitle
		};
		this._oDelegateSearch = {
			onAfterRendering: this.onAfterRenderingSearch
		};
		this._oDelegateNotifications = {
			onAfterRendering: this.onAfterRenderingNotifications
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
		if (oControl._oSecondTitle) {
			oControl._oSecondTitle.addDelegate(this._oDelegateSecondTitle, false, this);
		}
		if (oControl._oSearch) {
			oControl._oSearch.addDelegate(this._oDelegateSearch, false, this);
		}
		if (oControl._oNotifications) {
			oControl._oNotifications.addDelegate(this._oDelegateNotifications, false, this);
		}
		if (oControl._oAvatarButton) {
			oControl._oAvatarButton.addDelegate(this._oDelegateAvatar, false, this);
		}
		if (oControl._oProductSwitcher) {
			oControl._oProductSwitcher.addDelegate(this._oDelegateProducts, false, this);
		}
		if (oControl._oNavButton) {
			oControl._oNavButton.addDelegate(this._oDelegateNavButton, false, this);
		}
		if (oControl._oMenuButton) {
			oControl._oMenuButton.addDelegate(this._oDelegateMenuButton, false, this);
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

		oControl._oNotifications.setTooltip(sAriaLabel);
		oControl._oNotifications.$().attr("aria-label", sAriaLabel);
	};

	Accessibility.prototype.onAfterRenderingSecondTitle = function () {
		var $oSecondTitle = oControl._oSecondTitle.$();

		$oSecondTitle.attr("role", "heading");
		$oSecondTitle.attr("aria-level", "2");
	};

	Accessibility.prototype.onAfterRenderingSearch = function () {
		oControl._oSearch.$().attr("aria-label", this.getEntityTooltip("SEARCH"));
	};

	Accessibility.prototype.onAfterRenderingNotifications = function () {
		var $oNotifications = oControl._oNotifications.$(),
			sTooltip = this.getEntityTooltip("NOTIFICATIONS"),
			sNotificationsNubmer = oControl._oNotifications.data("notifications"),
			sAriaLabel = sNotificationsNubmer ? sNotificationsNubmer + " " + sTooltip : sTooltip;

		$oNotifications.attr("aria-label", sAriaLabel);
		$oNotifications.attr("aria-haspopup", "dialog");
	};

	Accessibility.prototype.onAfterRenderingAvatar = function () {
		var $oAvatar = oControl._oAvatarButton.$();

		$oAvatar.attr("aria-label", this.getEntityTooltip("PROFILE"));
		$oAvatar.attr("aria-haspopup", "menu");
	};

	Accessibility.prototype.onAfterRenderingProducts = function () {
		var $oProducts = oControl._oProductSwitcher.$();

		$oProducts.attr("aria-label", this.getEntityTooltip("PRODUCTS"));
		$oProducts.attr("aria-haspopup", "menu");
	};

	Accessibility.prototype.onAfterRenderingNavButton = function () {
		oControl._oNavButton.$().attr("aria-label", this.getEntityTooltip("BACK"));
	};

	Accessibility.prototype.onAfterRenderingMenuButton = function () {
		var $oMenuButton = oControl._oMenuButton.$();

		$oMenuButton.attr("aria-label", this.getEntityTooltip("MENU"));
		$oMenuButton.attr("aria-haspopup", "menu");
	};

	Accessibility.prototype.exit = function () {
		// Detach Event Delegates
		if (oControl) {
			oControl.removeDelegate(this._controlDelegate);
		}
		if (oControl._oSecondTitle) {
			oControl._oSecondTitle.removeDelegate(this._oDelegateSecondTitle);
		}
		if (oControl._oSearch) {
			oControl._oSearch.removeDelegate(this._oDelegateSearch);
		}
		if (oControl._oNotifications) {
			oControl._oNotifications.removeDelegate(this._oDelegateNotifications);
		}
		if (oControl._oAvatarButton) {
			oControl._oAvatarButton.removeDelegate(this._oDelegateAvatar);
		}
		if (oControl._oProductSwitcher) {
			oControl._oProductSwitcher.removeDelegate(this._oDelegateProducts);
		}
		if (oControl._oNavButton) {
			oControl._oNavButton.removeDelegate(this._oDelegateNavButton);
		}
		if (oControl._oMenuButton) {
			oControl._oMenuButton.removeDelegate(this._oDelegateMenuButton);
		}
	};

	return Accessibility;

});