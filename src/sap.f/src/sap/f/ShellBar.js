/*!
 * ${copyright}
 */

// Provides control sap.f.ShellBar
sap.ui.define([
	'sap/f/library',
	"sap/ui/core/Control",
	"./shellBar/Factory",
	"./shellBar/AdditionalContentSupport",
	"./shellBar/ResponsiveHandler",
	"./shellBar/Accessibility",
	"sap/m/BarInPageEnabler",
	"sap/m/BadgeCustomData",
	"sap/m/Button",
	"./ShellBarRenderer"
],
function(
	library,
	Control,
	Factory,
	AdditionalContentSupport,
	ResponsiveHandler,
	Accessibility,
	BarInPageEnabler,
	BadgeCustomData,
	Button
	/*, ShellBarRenderer */
) {
	"use strict";

	var AvatarSize = library.AvatarSize;

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
				profile: {type: "sap.m.Avatar", multiple: false},
				/**
				 * Additional content to be displayed in the control.
				 *
				 * <b>Note:</b> Only controls implementing the <code>{@link sap.f.IShellBar}</code> interface are allowed.
				 */
				additionalContent: {type: "sap.f.IShellBar", multiple: true, singularName: "additionalContent"},

				/**
				 * Holds the internally created OverflowToolbar.
				 */

				_overflowToolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"},
				/**
				 * Holds the internally created HBox with text content.
				 */
				_additionalBox: {type: "sap.m.HBox", multiple: false, visibility: "hidden"}
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
						avatar: {type: "sap.m.Avatar"}
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
		this._bLeftBoxUpdateNeeded = true;
		this._bRightBoxUpdateNeeded = true;

		this._oOverflowToolbar = this._oFactory.getOverflowToolbar();
		this._oAdditionalBox = this._oFactory.getAdditionalBox();
		this._aControls = [];
		this._aAdditionalContent = [];
		this.setAggregation("_overflowToolbar", this._oOverflowToolbar);
		this.setAggregation("_additionalBox", this._oAdditionalBox);

		this._oToolbarSpacer = this._oFactory.getToolbarSpacer();

		// Init responsive handler
		this._oResponsiveHandler = new ResponsiveHandler(this);

		this._oAcc = new Accessibility(this);
	};

	ShellBar.prototype.onBeforeRendering = function () {
		this._assignControls();
	};

	ShellBar.prototype.exit = function () {
		this._aLeftControls = [];
		this._aRightControls = [];
		this._aControls = [];
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

		this._bLeftBoxUpdateNeeded = true;

		return this.setProperty("homeIcon", sSrc);
	};

	ShellBar.prototype.setProfile = function (oAvatar) {
		this.validateAggregation("profile", oAvatar, false);

		if (oAvatar) {
			oAvatar.setDisplaySize(AvatarSize.XS);
			oAvatar.setTooltip(this._oAcc.getEntityTooltip("PROFILE"));
			oAvatar.attachPress(function () {
				this.fireEvent("avatarPressed", {avatar: oAvatar});
			}, this);

			oAvatar.addStyleClass("sapFShellBarProfile");
		}

		return this.setAggregation("profile", oAvatar);
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
		this._bLeftBoxUpdateNeeded = true;

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

		this._bLeftBoxUpdateNeeded = true;

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
		this._bLeftBoxUpdateNeeded = true;
		this._bRightBoxUpdateNeeded = true;

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
		var oShellbar = this;

		if (bShow) {
			if (!this._oNotifications) {
				this._oNotifications = this._oFactory.getNotifications();
				this._oNotifications._onBeforeEnterOverflow = function () {
					var oOTBButtonBadgeData = this.getParent()._getOverflowButton().getBadgeCustomData();
					this._bInOverflow = true;
					oOTBButtonBadgeData && oOTBButtonBadgeData.setVisible(this.getBadgeCustomData().getVisible());
				};

				this._oNotifications._onAfterExitOverflow = function () {
					var oOTBButtonBadgeData = this.getParent()._getOverflowButton().getBadgeCustomData();
					this._bInOverflow = false;
					oOTBButtonBadgeData && oOTBButtonBadgeData.setVisible(false);
				};

				this._oNotifications.onBadgeUpdate = function(vValue, sState) {
					Button.prototype.onBadgeUpdate.apply(this, arguments);

					if (!this._bInOverflow) {
						oShellbar._oAcc.updateNotificationsNumber(vValue);
					} else {
						oShellbar._oAcc.updateNotificationsNumber("");
					}
				};

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

		this._bRightBoxUpdateNeeded = true;

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

		this._bLeftBoxUpdateNeeded = true;

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

		this._bLeftBoxUpdateNeeded = true;

		return this.setProperty("showMenuButton", bShow);
	};

	/**
	 * Sets the number of upcoming notifications.
	 *
	 * @override
	 */
	ShellBar.prototype.setNotificationsNumber = function (sNotificationsNumber) {

		if (this.getShowNotifications()) {
			this._updateNotificationsIndicators(sNotificationsNumber);
		}

		return this.setProperty("notificationsNumber", sNotificationsNumber, true);
	};

	/**
	 * Helper method for tracking information of controls and their order.
	 *
	 * @private
	 */
	ShellBar.prototype._addDataToControl = function(oControl){
		oControl.addStyleClass("sapFShellBarItem");
		if (this._aControls.indexOf(oControl) === -1) {
			this._aControls.push(oControl);
		}
		return oControl;
	};

	ShellBar.prototype._assignControls = function() {

		if (!this._bOTBUpdateNeeded && !this._bLeftBoxUpdateNeeded && !this._bRightBoxUpdateNeeded) {return;}


		//First assign controls on the left
		if (this._bLeftBoxUpdateNeeded) {
			this._aLeftControls = [];
			if (this._oNavButton) {
				this.addControlToCollection(this._oNavButton, this._aLeftControls);
			}
			if (this._oMenuButton) {
				this.addControlToCollection(this._oMenuButton, this._aLeftControls);
			}
			if (this._oHomeIcon) {
				this.addControlToCollection(this._oHomeIcon, this._aLeftControls);
			}
			this._assignControlsToAdditionalBox();
			this._aLeftControls.push(this._oAdditionalBox);
		}

		// Assign the CoPilot independently
		if (this._oCopilot) {
			this._addDataToControl(this._oCopilot);
		}

		//Then assign controls on the right
		if (this._bRightBoxUpdateNeeded || this._bOTBUpdateNeeded) {

			this._aRightControls = [];

			if (this._bOTBUpdateNeeded) {
				this._assignControlsToOverflowToolbar();
			}

			this._aRightControls.push(this._oOverflowToolbar);
		}

		this._bLeftBoxUpdateNeeded = false;
		this._bRightBoxUpdateNeeded = false;
		this._bOTBUpdateNeeded = false;
	};

	// Utility
	ShellBar.prototype._assignControlsToAdditionalBox = function () {
		this._oAdditionalBox.removeAllItems();

		// we need to create and assign null to the title control reference,
		// which we will later read in ResponsiveHandler
		this._oTitleControl = null;
		//depends on the given configuration we either show MenuButton with MegaMenu, or Title
		if (this.getShowMenuButton() ){
			if (this._oPrimaryTitle) {
				this.addControlToCollection(this._oPrimaryTitle, this._oAdditionalBox);
				this._oTitleControl = this._oPrimaryTitle;
			}

		} else if (this._oMegaMenu) {
			if (this._oMegaMenu.getMenu() && this._oMegaMenu.getMenu().getItems().length) {
				this.addControlToCollection(this._oMegaMenu, this._oAdditionalBox);
				this._oTitleControl = this._oMegaMenu;
			} else if (this._oPrimaryTitle) {
				this.addControlToCollection(this._oPrimaryTitle, this._oAdditionalBox);
				this._oTitleControl = this._oPrimaryTitle;
			}
		}

		if (this._oSecondTitle) {
			this.addControlToCollection(this._oSecondTitle, this._oAdditionalBox);
		}

		return this._oAdditionalBox;
	};

	// Utility
	ShellBar.prototype._assignControlsToOverflowToolbar = function () {
		var aAdditionalContent;

		if (!this._oOverflowToolbar) {return;}

		this._oOverflowToolbar.removeAllContent();

		this.addControlToCollection(this._oToolbarSpacer, this._oOverflowToolbar);

		if (this._oManagedSearch) {
			this.addControlToCollection(this._oManagedSearch, this._oOverflowToolbar);
		}

		if (this._oSearch) {
			this.addControlToCollection(this._oSearch, this._oOverflowToolbar);
		}

		if (this._oNotifications) {
			this.addControlToCollection(this._oNotifications, this._oOverflowToolbar);
		}

		// Handle additional content
		aAdditionalContent = this.getAdditionalContent();
		if (aAdditionalContent) {
			aAdditionalContent.forEach(function (oControl) {
				this.addControlToCollection(oControl, this._oOverflowToolbar);
			}, this);
		}

		this._bOTBUpdateNeeded = false;

		return this._oOverflowToolbar;
	};

	//Utility method for preparing and adding control to proper collection
	ShellBar.prototype.addControlToCollection = function(oControl, aEntity) {
		var fnAction;
		if (Array.isArray(aEntity)) {
			fnAction = "push";
		} else {
			fnAction = aEntity === this._oAdditionalBox ? "addItem" : "addContent";
		}
		this._addDataToControl(oControl);
		aEntity[fnAction](oControl);
	};

	ShellBar.prototype._updateNotificationsIndicators = function(sNotificationsNumber) {
		var oOTBButton;

		if (!this.getShowNotifications()) { return; }

		oOTBButton = this._oOverflowToolbar._getOverflowButton();

		this._addOrUpdateBadges(oOTBButton, sNotificationsNumber);
		if (!this._oNotifications._bInOverflow ) {
			this._oOverflowToolbar._getOverflowButton().getBadgeCustomData().setVisible(false);
		}

		this._addOrUpdateBadges(this._oNotifications, sNotificationsNumber);


	};

	ShellBar.prototype._addOrUpdateBadges = function(oControl, sData) {
		if (oControl.getBadgeCustomData()) {
			oControl.getBadgeCustomData().setValue(sData);
		} else {
			oControl.addCustomData(new BadgeCustomData({value: sData, animation: "Update"}));
		}
	};

	ShellBar.prototype._getMenu = function () {
		if (!this._oMegaMenu) {
			this._oMegaMenu = this._oFactory.getMegaMenu();
		}

		return this._oMegaMenu;
	};

	ShellBar.prototype.onThemeChanged = function () {
		this._oResponsiveHandler._handleResize();
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
	 * @function
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
