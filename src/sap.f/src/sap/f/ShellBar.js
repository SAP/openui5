/*!
 * ${copyright}
 */

// Provides control sap.f.ShellBar
sap.ui.define([
	"sap/ui/core/Control",
	"./shellBar/Factory",
	"./shellBar/AdditionalContentSupport",
	"./shellBar/ResponsiveHandler",
	"./shellBar/Accessibility",
	"sap/m/BarInPageEnabler",
	"./ShellBarRenderer"
],
function(
	Control,
	Factory,
	AdditionalContentSupport,
	ResponsiveHandler,
	Accessibility,
	BarInPageEnabler
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
	 * @implements sap.f.IShellBar, sap.m.IBar, sap.tnt.IToolHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.f.ShellBar
	 * @since 1.63
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ShellBar = Control.extend("sap.f.ShellBar", /** @lends sap.f.ShellBar.prototype */ {
		metadata: {
			library: "sap.f",
			interfaces: [
				"sap.f.IShellBar",
				"sap.m.IBar",
				"sap.tnt.IToolHeader"
			],
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
				 * Defines a custom tooltip for the home icon. If not set, a default tooltip is used.
				 * @since 1.67
				 */
				homeIconTooltip: {type: "string", group: "Appearance", defaultValue: ""},
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
				showProductSwitcher: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Defines the displayed number of upcoming notifications.
				 * @since 1.64
				 */
				notificationsNumber: {type: "string", group: "Appearance", defaultValue: ""}
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
				 * Configurable search.
				 *
				 * <b>Note:</b> If <code>showSearch</code> is set to <code>true</code>, two search buttons appear.
				 * @since 1.67
				 */
				searchManager: { type: "sap.f.SearchManager", multiple: false },
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

		this._oAcc = new Accessibility(this);
	};

	ShellBar.prototype.onBeforeRendering = function () {
		var sNotificationsNumber = this.getNotificationsNumber();

		this._assignControlsToOverflowToolbar();
		if (this.getShowNotifications() && sNotificationsNumber !== undefined) {
			this._updateNotificationsIndicators(sNotificationsNumber);
		}
	};

	ShellBar.prototype.exit = function () {
		this._oResponsiveHandler.exit();
		this._oFactory.destroy();
		this._oAcc.exit();
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

	ShellBar.prototype.setHomeIconTooltip = function (sTooltip) {
		var sDefaultTooltip = this._oAcc.getEntityTooltip("LOGO");

		if (!this._oHomeIcon) {
			this._oHomeIcon = this._oFactory.getHomeIcon();
		}

		if (sTooltip) {
			this._oHomeIcon.setTooltip(sTooltip);
		} else {
			this._oHomeIcon.setTooltip(sDefaultTooltip);
		}

		this._bOTBUpdateNeeded = false;
		return this.setProperty("homeIconTooltip", sTooltip, true);
	};

	ShellBar.prototype.setTitle = function (sTitle) {
		this._sTitle = sTitle;
		if (!sTitle) {
			this._oPrimaryTitle = null;
			this._oMegaMenu = null;
		} else {
			if (!this._oMegaMenu) {
				this._oMegaMenu = this._oFactory.getMegaMenu();
			}
			this._oMegaMenu.setText(sTitle);
			if (!this._oPrimaryTitle) {
				this._oPrimaryTitle = this._oFactory.getPrimaryTitle();
			}
			this._oPrimaryTitle.setText(sTitle);

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

	ShellBar.prototype.setSearchManager = function (oConfig) {
		this.setAggregation("searchManager", oConfig);

		if (oConfig) {
			if (!this._oManagedSearch) {
				this._oManagedSearch = this._oFactory.getManagedSearch();
			}
		} else {
			this._oManagedSearch = null;
		}

		this._bOTBUpdateNeeded = true;

		return this;
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

	/**
	 * Sets the number of upcoming notifications.
	 *
	 * @override
	 */
	ShellBar.prototype.setNotificationsNumber = function (sNotificationsNumber) {
		if (this.getShowNotifications() && sNotificationsNumber !== undefined) {
			this._updateNotificationsIndicators(sNotificationsNumber);
			this._oAcc.updateNotificationsNumber(sNotificationsNumber);
		}

		return this.setProperty("notificationsNumber", sNotificationsNumber, true);
	};

	/**
	 * Helper method for unification of all Content items.
	 *
	 * @private
	 */
	ShellBar.prototype._addOTContent = function(oControl){
		oControl.addStyleClass("sapFShellBarItem");
		this._oOverflowToolbar.addContent(oControl);
	};

	// Utility
	ShellBar.prototype._assignControlsToOverflowToolbar = function () {
		var aAdditionalContent;

		if (!this._oOverflowToolbar) {return;}
		if (!this._bOTBUpdateNeeded) {return;}

		this._aOverflowControls = [];

		this._oOverflowToolbar.removeAllContent();

		if (this._oNavButton) {
			this._addOTContent(this._oNavButton);
		}

		if (this._oMenuButton) {
			this._addOTContent(this._oMenuButton);
		}

		if (this._oHomeIcon) {
			this._addOTContent(this._oHomeIcon);
		}


		// we need to create and assign null to the title control reference,
		// which we will later read in ResponsiveHandler
		this._oTitleControl = null;
		//depends on the given configuration we either show MenuButton with MegaMenu, or Title
		if (this.getShowMenuButton() && this._oPrimaryTitle){
			this._addOTContent(this._oPrimaryTitle);
			this._oTitleControl = this._oPrimaryTitle;
		} else if (this._oMegaMenu) {
			this._addOTContent(this._oMegaMenu);
			this._oTitleControl = this._oMegaMenu;
		}

		if (this._oSecondTitle) {
			this._addOTContent(this._oSecondTitle);
		}
		if (this._oControlSpacer) {
			this._addOTContent(this._oControlSpacer);
		}
		if (this._oCopilot) {
			this._addOTContent(this._oCopilot);
		}

		this._addOTContent(this._oToolbarSpacer);

		if (this._oManagedSearch) {
			this._addOTContent(this._oManagedSearch);
			this._aOverflowControls.push(this._oManagedSearch);
		}

		if (this._oSearch) {
			this._addOTContent(this._oSearch);
			this._aOverflowControls.push(this._oSearch);
		}

		if (this._oNotifications) {
			this._addOTContent(this._oNotifications);
			this._aOverflowControls.push(this._oNotifications);
		}

		// Handle additional content
		aAdditionalContent = this.getAdditionalContent();
		if (aAdditionalContent) {
			aAdditionalContent.forEach(function (oControl) {
				this._addOTContent(oControl);
				this._aOverflowControls.push(oControl);
			}.bind(this));
		}

		if (this._oAvatarButton) {
			this._addOTContent(this._oAvatarButton);
		}
		if (this._oProductSwitcher) {
			this._addOTContent(this._oProductSwitcher);
		}

		this._bOTBUpdateNeeded = false;
	};

	ShellBar.prototype._updateNotificationsIndicators = function(sNotificationsNumber) {
		this._oOverflowToolbar._getOverflowButton().data("notifications", sNotificationsNumber, true);
		this._oNotifications.data("notifications", sNotificationsNumber, true);
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

	///////////////////////////
	// Bar in page delegation
	///////////////////////////

	/**
	 * Gets the available Bar contexts.
	 *
	 * @returns {Object} with all available contexts
	 * @protected
	 * @since 1.65
	 */
	ShellBar.prototype.getContext = BarInPageEnabler.prototype.getContext;

	/**
	 * Returns if the bar is sensitive to the container context. Implementation of the IBar interface
	 * @returns {boolean} isContextSensitive
	 * @protected
	 * @function
	 * @since 1.65
	 */
	ShellBar.prototype.isContextSensitive = BarInPageEnabler.prototype.isContextSensitive;

	/**
	 * Sets the HTML tag of the root DOM Reference.
	 * @param {string} sTag
	 * @returns {sap.m.IBar} this for chaining
	 * @protected
	 * @function
	 * @since 1.65
	 */
	ShellBar.prototype.setHTMLTag = BarInPageEnabler.prototype.setHTMLTag;

	/**
	 * Gets the HTML tag of the root DOM Reference.
	 * @returns {string} the HTML-tag
	 * @protected
	 * @function
	 * @since 1.65
	 */
	ShellBar.prototype.getHTMLTag = BarInPageEnabler.prototype.getHTMLTag;

	/**
	 * Sets classes and HTML tag according to the context of the page. Possible contexts are header, footer, and subheader
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 * @since 1.65
	 */
	ShellBar.prototype.applyTagAndContextClassFor = BarInPageEnabler.prototype.applyTagAndContextClassFor;

	/**
	 * Sets classes according to the context of the page. Possible contexts are header, footer, and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	 * @since 1.65
	 */
	ShellBar.prototype._applyContextClassFor  = BarInPageEnabler.prototype._applyContextClassFor;

	/**
	 * Sets the HTML tag according to the context of the page. Possible contexts are header, footer, and subheader.
	 * @returns {sap.m.IBar} <code>this</code> for chaining
	 * @protected
	 * @function
	* @since 1.65
	 */
	ShellBar.prototype._applyTag  = BarInPageEnabler.prototype._applyTag;

	/**
	 * Gets context options of the Page.
	 *
	 * Possible contexts are header, footer, and subheader.
	 * @param {string} sContext allowed values are header, footer, subheader.
	 * @returns {object|null}
	 * @private
	 */
	ShellBar.prototype._getContextOptions  = BarInPageEnabler.prototype._getContextOptions;

	/**
	 * Sets the accessibility role of the Root HTML element.
	 *
	 * @param {string} sRole AccessibilityRole of the root Element
	 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
	 * @private
	 */
	ShellBar.prototype._setRootAccessibilityRole = BarInPageEnabler.prototype._setRootAccessibilityRole;

	/**
	 * Gets the accessibility role of the Root HTML element.
	 *
	 * @returns {string} Accessibility role
	 * @private
	 */
	ShellBar.prototype._getRootAccessibilityRole = BarInPageEnabler.prototype._getRootAccessibilityRole;


	/**
	 * Sets accessibility aria-level attribute of the Root HTML element.
	 *
	 * This is only needed if <code>sap.m.Bar</code> has role="heading"
	 * @param {string} sLevel aria-level attribute of the root Element
	 * @returns {sap.m.IBar} <code>this</code> to allow method chaining
	 * @private
	 */
	ShellBar.prototype._setRootAriaLevel = BarInPageEnabler.prototype._setRootAriaLevel;

	/**
	 * Gets accessibility aria-level attribute of the Root HTML element.
	 *
	 * This is only needed if <code>sap.m.Bar</code> has role="heading"
	 * @returns {string} aria-level
	 * @private
	 */
	ShellBar.prototype._getRootAriaLevel = BarInPageEnabler.prototype._getRootAriaLevel;

	return ShellBar;

});
