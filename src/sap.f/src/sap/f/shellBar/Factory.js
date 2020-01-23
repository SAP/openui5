/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/m/Title",
	"sap/m/Image",
	"./ContentButton",
	"sap/m/MenuButton",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/f/SearchManager",
	"./ControlSpacer",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarLayoutData",
	"./CoPilot",
	"./Accessibility",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/core/theming/Parameters"
], function(
	Element,
	Title,
	Image,
	ContentButton,
	MenuButton,
	OverflowToolbar,
	OverflowToolbarButton,
	ShellBarSearch,
	ControlSpacer,
	ToolbarSpacer,
	OverflowToolbarLayoutData,
	CoPilot,
	Accessibility,
	library,
	coreLibrary,
	Parameters
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Factory class which is used to create internal controls used by the ShellBar control and care for their
	 * lifecycle.
	 * @alias sap/f/shellBar/Factory
	 * @since 1.63
	 * @private
	 */
	var Factory = function (oContext) {
		this._oContext = oContext;
		this._oControls = {};
		this._oAcc = new Accessibility();

		this._alreadyAttachedSearchHandlers = false;
	};

	Factory.prototype.getOverflowToolbar = function () {
		if (!this._oControls.oOverflowToolbar) {
			this._oControls.oOverflowToolbar = new OverflowToolbar({
				design: ToolbarDesign.Transparent,
				style: "Clear"
			}).addStyleClass("sapFShellBarOTB");
			this._oControls.oOverflowToolbar._getOverflowButton().addStyleClass("sapFShellBarOverflowButton sapFShellBarItem");
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
			this._oControls.oSecondTitle = new Title({
				titleStyle: TitleLevel.H6
			})
				.addStyleClass("sapFShellBarSecondTitle")
				.setLayoutData(new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}));
		}
		this._oControls.oSecondTitle._sFontSize = Parameters.get("_sap_f_ShellBar_SecondTitle_FontSize");
		return this._oControls.oSecondTitle;
	};

	Factory.prototype.getAvatarButton = function () {
		if (!this._oControls.oAvatarButton) {
			this._oControls.oAvatarButton = new ContentButton({
				icon: "none",
				type: ButtonType.Transparent,
				tooltip: this._oAcc.getEntityTooltip("PROFILE"),
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
				tooltip: this._oAcc.getEntityTooltip("LOGO"),
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
		this._oControls.oMegaMenu._iStaticWidth = 43;
		this._oControls.oMegaMenu._sFontSize = Parameters.get("_sap_f_ShellBar_PrimaryTitle_FontSize");

		return this._oControls.oMegaMenu;
	};

	Factory.prototype.getPrimaryTitle = function () {
		if (!this._oControls.oPrimaryTitle) {
			this._oControls.oPrimaryTitle = new Title({
				titleStyle: TitleLevel.H6,
				level: TitleLevel.H1
			})
				.setLayoutData(new OverflowToolbarLayoutData({
					priority: OverflowToolbarPriority.NeverOverflow
				}))
				.addStyleClass("sapFShellBarPrimaryTitle");
		}
		this._oControls.oPrimaryTitle._iStaticWidth = 12;
		this._oControls.oPrimaryTitle._sFontSize = Parameters.get("_sap_f_ShellBar_PrimaryTitle_FontSize");
		return this._oControls.oPrimaryTitle;
	};

	Factory.prototype.getCopilot = function () {
		if (!this._oControls.oCopilot) {
			this._oControls.oCopilot = new CoPilot({
				tooltip: this._oAcc.getEntityTooltip("COPILOT"),
				press: function () {
					this._oContext.fireEvent("copilotPressed", {image: this._oControls.oCopilot});
				}.bind(this)
			})
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
				tooltip: this._oAcc.getEntityTooltip("SEARCH"),
				press: function () {
					this._oContext.fireEvent("searchButtonPressed", {button: this._oControls.oSearch});
				}.bind(this)
			})
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}));
		}
		return this._oControls.oSearch;
	};

	Factory.prototype.getManagedSearch = function () {
		if (!this._oControls.oManagedSearch) {
			this._oControls.oManagedSearch = this._oContext.getSearchManager()._oSearch;
		}

		return this._oControls.oManagedSearch;
	};

	Factory.prototype.getNavButton = function () {
		if (!this._oControls.oNavButton) {
			this._oControls.oNavButton = new OverflowToolbarButton({
				icon: "sap-icon://nav-back",
				type: ButtonType.Transparent,
				tooltip: this._oAcc.getEntityTooltip("BACK"),
				press: function () {
					this._oContext.fireEvent("navButtonPressed", {button: this._oControls.oNavButton});
				}.bind(this)
			})
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}));
		}
		return this._oControls.oNavButton;
	};

	Factory.prototype.getMenuButton = function () {
		if (!this._oControls.oMenuButton) {
			this._oControls.oMenuButton = new OverflowToolbarButton({
				icon: "sap-icon://menu2",
				type: ButtonType.Transparent,
				tooltip: this._oAcc.getEntityTooltip("MENU"),
				press: function () {
					this._oContext.fireEvent("menuButtonPressed", {button: this._oControls.oMenuButton});
				}.bind(this)
			})
			.setLayoutData(new OverflowToolbarLayoutData({
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
				tooltip: this._oAcc.getEntityTooltip("NOTIFICATIONS"),
				press: function () {
					this._oContext.fireEvent("notificationsPressed", {button: this._oControls.oNotifications});
				}.bind(this)
			})
			.addStyleClass("sapFButtonNotifications")
			.setLayoutData(new OverflowToolbarLayoutData({
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
				tooltip: this._oAcc.getEntityTooltip("PRODUCTS"),
				press: function () {
					this._oContext.fireEvent("productSwitcherPressed", {button: this._oControls.oProductSwitcher});
				}.bind(this)
			})
			.setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
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

	return Factory;

});
