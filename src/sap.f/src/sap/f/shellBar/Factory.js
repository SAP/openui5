/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/m/Label",
	"sap/m/Image",
	"sap/tnt/InfoLabel",
	"./ContentButton",
	"sap/m/MenuButton",
	"sap/m/ButtonType",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"./ControlSpacer",
	"sap/m/ToolbarSpacer",
	"sap/m/ToolbarDesign",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/OverflowToolbarPriority"
], function(
	Element,
	Label,
	Image,
	InfoLabel,
	ContentButton,
	MenuButton,
	ButtonType,
	OverflowToolbar,
	OverflowToolbarButton,
	ControlSpacer,
	ToolbarSpacer,
	ToolbarDesign,
	OverflowToolbarLayoutData,
	OverflowToolbarPriority
) {
	"use strict";

	/**
	 * Factory class which is used to create internal controls used by the ShellBar control and care for their
	 * lifecycle.
	 * @alias sap/f/shellBar/Factory
	 * @experimental Since 1.63. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @since 1.63
	 * @private
	 */
	var Factory = function (oContext) {
		this._oContext = oContext;
		this._oControls = {};
		this._sCPImage = "CoPilot_white.svg";
	};

	Factory.prototype.getOverflowToolbar = function () {
		if (!this._oControls.oOverflowToolbar) {
			this._oControls.oOverflowToolbar = new OverflowToolbar({
				design: ToolbarDesign.Transparent,
				style: "Clear"
			}).addStyleClass("sapFShellBarOTB");
			this._oControls.oOverflowToolbar._getOverflowButton().addStyleClass("sapFShellBarOverflowButton");
		}
		return this._oControls.oOverflowToolbar;
	};

	Factory.prototype.getControlSpacer = function () {
		if (!this._oControls.oControlSpacer) {
			this._oControls.oControlSpacer = new ControlSpacer().setLayoutData(
				new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}));
		}
		return this._oControls.oControlSpacer;
	};

	Factory.prototype.getToolbarSpacer = function () {
		if (!this._oControls.oToolbarSpacer) {
			this._oControls.oToolbarSpacer = new ToolbarSpacer();
		}
		return this._oControls.oToolbarSpacer;
	};

	Factory.prototype.getSecondTitle = function () {
		if (!this._oControls.oSecondTitle) {
			this._oControls.oSecondTitle = new Label()
				.addStyleClass("sapFShellBarSecondTitle")
				.setLayoutData(new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}));
		}
		return this._oControls.oSecondTitle;
	};

	Factory.prototype.getAvatarButton = function () {
		if (!this._oControls.oAvatarButton) {
			this._oControls.oAvatarButton = new ContentButton({
				icon: "none",
				type: ButtonType.Transparent,
				iconDensityAware: false,
				press: function () {
					this._oContext.fireEvent("avatarPressed", {avatar: this._oControls.oAvatarButton.getAvatar()});
				}.bind(this)
			})
			.addStyleClass("sapFShellBarProfile")
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oAvatarButton;
	};

	Factory.prototype.getHomeIcon = function () {
		if (!this._oControls.oHomeIcon) {
			this._oControls.oHomeIcon = new Image({
				densityAware: false,
				press: function () {
					this._oContext.fireEvent("homeIconPressed", {icon: this._oControls.oHomeIcon});
				}.bind(this)
			})
			.addStyleClass("sapFShellBarHomeIcon")
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oHomeIcon;
	};

	Factory.prototype.getMegaMenu = function () {
		if (!this._oControls.oMegaMenu) {
			this._oControls.oMegaMenu = new MenuButton({
				type: ButtonType.Transparent,
				iconDensityAware: false
			})
			.addStyleClass("sapFSHMegaMenu")
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oMegaMenu;
	};

	Factory.prototype.getCopilot = function () {
		if (!this._oControls.oCopilot) {
			this._oControls.oCopilot = new Image({
				src: this._getCopilotImagePath(),
				press: function () {
					this._oContext.fireEvent("copilotPressed", {image: this._oControls.oCopilot});
				}.bind(this)
			})
			.addStyleClass("CPImage")
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oCopilot;
	};

	Factory.prototype.getSearch = function () {
		if (!this._oControls.oSearch) {
			this._oControls.oSearch = new OverflowToolbarButton({
				text: "Search",
				icon: "sap-icon://search",
				type: ButtonType.Transparent,
				press: function () {
					this._oContext.fireEvent("searchButtonPressed", {button: this._oControls.oSearch});
				}.bind(this)
			}).setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}));
		}
		return this._oControls.oSearch;
	};

	Factory.prototype.getNavButton = function () {
		if (!this._oControls.oNavButton) {
			this._oControls.oNavButton = new OverflowToolbarButton({
				icon: "sap-icon://nav-back",
				type: ButtonType.Transparent,
				press: function () {
					this._oContext.fireEvent("navButtonPressed", {button: this._oControls.oNavButton});
				}.bind(this)
			}).setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oNavButton;
	};

	Factory.prototype.getMenuButton = function () {
		if (!this._oControls.oMenuButton) {
			this._oControls.oMenuButton = new OverflowToolbarButton({
				icon: "sap-icon://menu2",
				type: ButtonType.Transparent
			}).setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oMenuButton;
	};

	Factory.prototype.getNotifications = function () {
		if (!this._oControls.oNotifications) {
			this._oControls.oNotifications = new OverflowToolbarButton({
				text: "Notifications",
				icon: "sap-icon://bell",
				type: ButtonType.Transparent,
				press: function () {
					this._oContext.fireEvent("notificationsPressed", {button: this._oControls.oNotifications});
				}.bind(this)
			}).setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}));
		}
		return this._oControls.oNotifications;
	};

	Factory.prototype.getProductSwitcher = function () {
		if (!this._oControls.oProductSwitcher) {
			this._oControls.oProductSwitcher = new OverflowToolbarButton({
				text: "My products",
				icon: "sap-icon://grid",
				type: ButtonType.Transparent,
				press: function () {
					this._oContext.fireEvent("productSwitcherPressed", {button: this._oControls.oProductSwitcher});
				}.bind(this)
			})
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.High
			}))
			.addStyleClass("sapFShellBarGridButton");
		}
		return this._oControls.oProductSwitcher;
	};

	/**
	 * Destroys all controls created by this factory
	 */
	Factory.prototype.destroy = function () {
		Object.keys(this._oControls).forEach(function (sKey) {
			var oControl = this._oControls[sKey];
			if (oControl) {
				oControl.destroy();
			}
		}.bind(this));
	};

	Factory.prototype._getCopilotImagePath = function () {
		return sap.ui.require.toUrl("sap/f/shellBar/" + this._sCPImage);
	};

	Factory.prototype.setCPImage = function (sImage) {
		this._sCPImage = sImage;
		if (this._oControls.oCopilot) {
			this._oControls.oCopilot.setSrc(this._getCopilotImagePath());
		}
	};

	return Factory;

});