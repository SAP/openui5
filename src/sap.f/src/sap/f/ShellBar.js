/*!
 * ${copyright}
 */

// Provides control sap.f.ShellBar
sap.ui.define([
	"sap/ui/core/Control",
	"./shellBar/Factory",
	"./shellBar/AdditionalContentSupport",
	"./shellBar/ResponsiveHandler",
	"./ShellBarRenderer"
],
function(
	Control,
	Factory,
	AdditionalContentSupport,
	ResponsiveHandler
	/*, ShellBarRenderer */
) {
	"use strict";

	/**
	 * Constructor for a new <code>ShellBar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A horizontal bar control holding multiple child controls used as application shell header.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>ShellBar</code> is used as the uppermost section (shell) of the app. It is fully
	 * responsive and adaptive, and corresponds to the SAP Fiori Design Guidelines.
	 *
	 * <h3>Usage</h3>
	 *
	 * Content specified in the <code>ShellBar</code> properties and aggregations is automatically
	 * positioned in dedicated places of the control.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since 1.63, that provides only limited functionality. Also, the API might be changed in future.
	 * @alias sap.f.ShellBar
	 * @since 1.63
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ShellBar = Control.extend("sap.f.ShellBar", /** @lends sap.f.ShellBar.prototype */ {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.IShellBar"],
			properties: {
				/**
				 * Defines the main title of the control.
				 */
				title: {type: "string", group: "Appearance", defaultValue: ""},
				/**
				 * Defines the secondary title of the control.
				 */
				secondTitle: {type: "string", group: "Appearance", defaultValue: ""},
				/**
				 * Defines the URI to the home icon, such as company or product logo.
				 */
				homeIcon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ""},
				/**
				 * Determines whether a hamburger menu button is displayed (as an alternative
				 * if the <code>menu</code> aggregation is not used).
				 */
				showMenuButton: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Determines whether a back navigation button is displayed.
				 */
				showNavButton: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Determines whether the SAP CoPilot icon is displayed.
				 */
				showCopilot: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Determines whether the search button is displayed.
				 */
				showSearch: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Determines whether the notifications button is displayed.
				 */
				showNotifications: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Determines whether the product switcher button is displayed.
				 */
				showProductSwitcher: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			aggregations: {
				/**
				 * The menu attached to the main title.
				 */
				menu: {type: "sap.m.Menu", multiple: false, forwarding: {
					getter: "_getMenu",
					aggregation: "menu"
				}},
				/**
				 * The profile avatar.
				 */
				profile: {type: "sap.f.Avatar", multiple: false, forwarding: {
					getter: "_getProfile",
					aggregation: "avatar"
				}},
				/**
				 * Additional content to be displayed in the control.
				 *
				 * <b>Note:</b> Only controls implementing the <code>{@link sap.f.IShellBar}</code> interface are allowed.
				 */
				additionalContent: {type: "sap.f.IShellBar", multiple: true, singularName: "additionalContent"},
				/**
				 * Holds the internally created OverflowToolbar.
				 */
				_overflowToolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * Fired when the <code>homeIcon</code> is pressed.
				 */
				homeIconPressed: {
					parameters: {
						/**
						 * Reference to the image that has been pressed
						 */
						icon: {type: "sap.m.Image"}
					}
				},
				/**
				 * Fired when the alternative menu button is pressed.
				 */
				menuButtonPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						button : {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the navigation/back button is pressed.
				 */
				navButtonPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						button : {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the SAP CoPilot icon is pressed.
				 */
				copilotPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						image : {type: "sap.m.Image"}
					}
				},
				/**
				 * Fired when the search button is pressed.
				 */
				searchButtonPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						button: {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the notifications button is pressed.
				 */
				notificationsPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						button: {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the product switcher button is pressed.
				 */
				productSwitcherPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						button: {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the profile avatar is pressed.
				 */
				avatarPressed: {
					parameters: {
						/**
						 * Reference to the button that has been pressed
						 */
						avatar: {type: "sap.f.Avatar"}
					}
				}
			}
		}
	});

	// Enhance the prototype with additional content aggregation support
	AdditionalContentSupport.apply(ShellBar.prototype);

	// Lifecycle
	ShellBar.prototype.init = function () {
		this._oFactory = new Factory(this);

		this._bOTBUpdateNeeded = true;

		this._oOverflowToolbar = this._oFactory.getOverflowToolbar();
		this.setAggregation("_overflowToolbar", this._oOverflowToolbar);

		this._oToolbarSpacer = this._oFactory.getToolbarSpacer();
		this._oControlSpacer = this._oFactory.getControlSpacer();

		// Init responsive handler
		this._oResponsiveHandler = new ResponsiveHandler(this);

		// List of controls that can go forcibly in the overflow
		this._aOverflowControls = [];
	};

	ShellBar.prototype.onBeforeRendering = function () {
		this._assignControlsToOverflowToolbar();
	};

	ShellBar.prototype.exit = function () {
		this._oResponsiveHandler.exit();
		this._oFactory.destroy();
	};

	// Setters
	ShellBar.prototype.setHomeIcon = function (sSrc) {
		if (sSrc) {
			if (!this._oHomeIcon) {
				this._oHomeIcon = this._oFactory.getHomeIcon();
			}
			this._oHomeIcon.setSrc(sSrc);
		} else {
			this._oHomeIcon = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("homeIcon", sSrc);
	};

	ShellBar.prototype.setTitle = function (sTitle) {
		this._sTitle = sTitle;
		if (sTitle) {
			if (!this._oMegaMenu) {
				this._oMegaMenu = this._oMegaMenu = this._oFactory.getMegaMenu();
			}
			this._oMegaMenu.setText(sTitle);
		} else {
			this._oMegaMenu = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("title", sTitle);
	};

	ShellBar.prototype.setSecondTitle = function (sTitle) {
		if (sTitle) {
			if (!this._oSecondTitle) {
				this._oSecondTitle = this._oFactory.getSecondTitle();
			}
			this._oSecondTitle.setText(sTitle);
		} else {
			this._oSecondTitle = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("secondTitle", sTitle);
	};

	ShellBar.prototype.setShowCopilot = function (bShow) {
		if (bShow) {
			if (!this._oCopilot) {
				this._oCopilot = this._oFactory.getCopilot();
			}
		} else {
			this._oCopilot = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("showCopilot", bShow);
	};

	ShellBar.prototype.setShowSearch = function (bShow) {
		if (bShow) {
			if (!this._oSearch) {
				this._oSearch = this._oFactory.getSearch();
			}
		} else {
			this._oSearch = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("showSearch", bShow);
	};

	ShellBar.prototype.setShowNotifications = function (bShow) {
		if (bShow) {
			if (!this._oNotifications) {
				this._oNotifications = this._oFactory.getNotifications();
			}
		} else {
			this._oNotifications = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("showNotifications", bShow);
	};

	ShellBar.prototype.setShowProductSwitcher = function (bShow) {
		if (bShow) {
			if (!this._oProductSwitcher) {
				this._oProductSwitcher = this._oFactory.getProductSwitcher();
			}
		} else {
			this._oProductSwitcher = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("showProductSwitcher", bShow);
	};

	ShellBar.prototype.setShowNavButton = function (bShow) {
		if (bShow) {
			if (!this._oNavButton) {
				this._oNavButton = this._oFactory.getNavButton();
			}
		} else {
			this._oNavButton = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("showNavButton", bShow);
	};

	ShellBar.prototype.setShowMenuButton = function (bShow) {
		if (bShow) {
			if (!this._oMenuButton) {
				this._oMenuButton = this._oFactory.getMenuButton();
			}
		} else {
			this._oMenuButton = null;
		}

		this._bOTBUpdateNeeded = true;
		return this.setProperty("showMenuButton", bShow);
	};

	// Utility
	ShellBar.prototype._assignControlsToOverflowToolbar = function () {
		var aAdditionalContent;

		if (!this._oOverflowToolbar) {return;}
		if (!this._bOTBUpdateNeeded) {return;}

		this._aOverflowControls = [];

		this._oOverflowToolbar.removeAllContent();

		if (this._oNavButton) {
			this._oOverflowToolbar.addContent(this._oNavButton);
		}

		if (this._oMenuButton) {
			this._oOverflowToolbar.addContent(this._oMenuButton);
		}

		if (this._oHomeIcon) {
			this._oOverflowToolbar.addContent(this._oHomeIcon);
		}
		if (this._oMegaMenu) {
			this._oOverflowToolbar.addContent(this._oMegaMenu);
		}
		if (this._oSecondTitle) {
			this._oOverflowToolbar.addContent(this._oSecondTitle);
		}
		if (this._oControlSpacer) {
			this._oOverflowToolbar.addContent(this._oControlSpacer);
		}
		if (this._oCopilot) {
			this._oOverflowToolbar.addContent(this._oCopilot);
		}

		this._oOverflowToolbar.addContent(this._oToolbarSpacer);

		if (this._oSearch) {
			this._oOverflowToolbar.addContent(this._oSearch);
			this._aOverflowControls.push(this._oSearch);
		}
		if (this._oNotifications) {
			this._oOverflowToolbar.addContent(this._oNotifications);
			this._aOverflowControls.push(this._oNotifications);
		}

		// Handle additional content
		aAdditionalContent = this.getAdditionalContent();
		if (aAdditionalContent) {
			aAdditionalContent.forEach(function (oControl) {
				this._oOverflowToolbar.addContent(oControl);
				this._aOverflowControls.push(oControl);
			}.bind(this));
		}

		if (this._oAvatarButton) {
			this._oOverflowToolbar.addContent(this._oAvatarButton);
		}
		if (this._oProductSwitcher) {
			this._oOverflowToolbar.addContent(this._oProductSwitcher);
			this._aOverflowControls.push(this._oProductSwitcher);
		}

		this._bOTBUpdateNeeded = false;
	};

	ShellBar.prototype._getProfile = function () {
		this._oAvatarButton = this._oFactory.getAvatarButton();
		return this._oAvatarButton;
	};

	ShellBar.prototype._getMenu = function () {
		if (!this._oMegaMenu) {
			this._oMegaMenu = this._oFactory.getMegaMenu();
		}
		return this._oMegaMenu;
	};

	ShellBar.prototype._getOverflowToolbar = function () {
		return this._oOverflowToolbar;
	};

	return ShellBar;

}, /* bExport= */ true);