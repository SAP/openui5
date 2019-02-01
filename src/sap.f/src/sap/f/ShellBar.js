/*!
 * ${copyright}
 */

// Provides control sap.f.ShellBar
sap.ui.define([
	"sap/ui/core/Control",
	"./shellBar/Factory",
	"sap/ui/Device",
	"sap/ui/core/theming/Parameters",
	"./shellBar/AdditionalContentSupport",
	"./shellBar/SafeObject",
	"./ShellBarRenderer"
],
function(
	Control,
	Factory,
	Device,
	Parameters,
	AdditionalContentSupport,
	SafeObject
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
	 * The <code>ShellHeader</code> shows multiple child controls used as application shell header.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since 1.63. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @alias sap.f.ShellBar
	 * @since 1.63
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ShellBar = Control.extend("sap.f.ShellBar", /** @lends sap.f.ShellBar.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * Main title of the control
				 */
				title: {type: "string", group: "Appearance", defaultValue: ""},
				/**
				 * Secondary title
				 */
				secondTitle: {type: "string", group: "Appearance", defaultValue: ""},
				/**
				 * Used to display company/product logo or icon
				 */
				homeIcon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ""},
				/**
				 * Alternative menu button if <code>menu</code> aggregation is not used
				 */
				showMenuButton: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Back navigation button
				 */
				showNavButton: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * CoPilot
				 */
				showCopilot: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Search button
				 */
				showSearch: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Notifications button
				 */
				showNotifications: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Product Switcher button
				 */
				showProductSwitcher: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			aggregations: {
				/**
				 * Menu which will be attached to the main title
				 */
				menu: {type: "sap.m.Menu", multiple: false, forwarding: {
					getter: "_getMenu",
					aggregation: "menu"
				}},
				/**
				 * Profile Avatar
				 */
				profile: {type: "sap.f.Avatar", multiple: false, forwarding: {
					getter: "_getProfile",
					aggregation: "avatar"
				}},
				/**
				 * Additional content to be displayed in the control. Currently only a subset of controls are supported.
				 * Only controls implementing sap.f.IShellBar interface will be allowed here.
				 */
				additionalContent: {type: "sap.ui.core.Control", multiple: true, singularName : "additionalContent"},
				/**
				 * Holds the internally created OverflowToolbar
				 */
				_overflowToolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * Fired when the home Icon/Logo is pressed
				 */
				homeIconPressed: {
					parameters: {
						/**
						 * Reference to the image, that has been pressed.
						 */
						icon: {type: "sap.m.Image"}
					}
				},
				/**
				 * Fired when the alternative menu button is pressed
				 */
				menuButtonPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
						 */
						button : {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the navigation/back button is pressed
				 */
				navButtonPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
						 */
						button : {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the home CoPilot is pressed
				 */
				copilotPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
						 */
						image : {type: "sap.m.Image"}
					}
				},
				/**
				 * Fired when the search button is pressed
				 */
				searchButtonPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
						 */
						button: {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the home notifications button is pressed
				 */
				notificationsPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
						 */
						button: {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the home Product Switcher button is pressed
				 */
				productSwitcherPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
						 */
						button: {type: "sap.m.Button"}
					}
				},
				/**
				 * Fired when the Profile Avatar is pressed
				 */
				avatarPressed: {
					parameters: {
						/**
						 * Reference to the button, that has been pressed.
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
		// Get and calculate padding's
		this._iREMSize = parseInt(jQuery("body").css("font-size"));
		this._aPadding = {
			'Desktop': parseInt(Parameters.get("_sap_f_Shell_Bar_Padding_Desktop")) * this._iREMSize,
			'Tablet': parseInt(Parameters.get("_sap_f_Shell_Bar_Padding_Tablet")) * this._iREMSize,
			'Phone': parseInt(Parameters.get("_sap_f_Shell_Bar_Padding_Phone")) * this._iREMSize
		};
		this._oFactory = new Factory(this);

		// Handle "Dark" CoPilot image
		if (Parameters.get("_sap_f_Shell_Bar_Copilot_Design") === "dark") {
			this._oFactory.setCPImage("CoPilot_dark.svg");
		}

		this._bOTBUpdateNeeded = true;

		this._oOverflowToolbar = this._oFactory.getOverflowToolbar();
		this.setAggregation("_overflowToolbar", this._oOverflowToolbar);

		this._oToolbarSpacer = this._oFactory.getToolbarSpacer();
		this._oControlSpacer = this._oFactory.getControlSpacer();
	};

	ShellBar.prototype.onBeforeRendering = function () {
		this._assignControlsToOverflowToolbar();

		// Attach events
		this._oOverflowToolbar.attachEvent("_controlWidthChanged", this._handleResize, this);
		if (this._oHomeIcon) {
			this._wHomeIcon = new SafeObject(this._oHomeIcon); // We need the SafeObject early
			this._oHomeIcon.attachEvent("load", this._updateHomeIconWidth, this);
		}
	};

	ShellBar.prototype.onAfterRendering = function () {
		this.oStaticArea = sap.ui.getCore().getStaticAreaRef();
		this._initUxRules();
	};

	ShellBar.prototype.exit = function () {
		if (this._oOverflowToolbar) {
			this._oOverflowToolbar.detachEvent("_controlWidthChanged", this._handleResize, this);
		}
		if (this._oHomeIcon) {
			this._oHomeIcon.detachEvent("load", this._updateHomeIconWidth, this);
		}

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

		this._oOverflowToolbar.removeAllAggregation("content");

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
		}
		if (this._oNotifications) {
			this._oOverflowToolbar.addContent(this._oNotifications);
		}

		// Handle additional content
		aAdditionalContent = this.getAdditionalContent();
		if (aAdditionalContent) {
			aAdditionalContent.forEach(function (oControl) {
				this._oOverflowToolbar.addContent(oControl);
			}.bind(this));
		}

		if (this._oAvatarButton) {
			this._oOverflowToolbar.addContent(this._oAvatarButton);
		}
		if (this._oProductSwitcher) {
			this._oOverflowToolbar.addContent(this._oProductSwitcher);
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

	// Responsiveness
	ShellBar.prototype._handleResize = function () {
		setTimeout(this._applyUxRules.bind(this), 0);
	};

	ShellBar.prototype.getTargetWidth = function (oControl, bBold) {
		if (!oControl) {return 0;}

		var sText = oControl.getText(),
			oDiv = document.createElement("div"),
			oText = document.createTextNode(sText),
			iWidth;

		// Create div and add to static area
		oDiv.appendChild(oText);
		oDiv.style.setProperty("white-space", "nowrap");
		oDiv.style.setProperty("display", "inline-block");
		oDiv.style.setProperty("font-size", "0.875rem");
		if (bBold) {
			oDiv.style.setProperty("font-weight", "bold");
		}
		this.oStaticArea.appendChild(oDiv);

		// Record width
		iWidth = oDiv.scrollWidth;

		// Remove child from static area
		this.oStaticArea.removeChild(oDiv);

		return iWidth;
	};

	ShellBar.prototype._updateHomeIconWidth = function () {
		this._iHomeWidth = this._wHomeIcon.getWidth();
	};

	ShellBar.prototype._initUxRules = function () {
		// Create safe objects
		this._wHomeIcon = new SafeObject(this._oHomeIcon);
		this._wMegaMenu = new SafeObject(this._oMegaMenu);
		this._wSecondTitle = new SafeObject(this._oSecondTitle);
		this._wControlSpacer = new SafeObject(this._oControlSpacer);

		// Cache widths
		this._iHomeWidth = this._wHomeIcon.getWidth();
		this._iMBTargetWidth = this._oMegaMenu ? (this.getTargetWidth(this._oMegaMenu, true) + 50) : 0;

		// Static widths - items that don't change, disappear or overflow
		this._iStaticWidth = 0;

		if (this._oNavButton) {
			this._iStaticWidth += 48; // Standard width including margin
		}

		if (this._oMenuButton) {
			this._iStaticWidth += 48; // Standard width including margin
		}

		// Don't update width when the title is invisible
		if (this._wSecondTitle.getVisible()) {
			this._iTitleTargetWidth = this.getTargetWidth(this._oSecondTitle) + 8;
		} else {
			this._iTitleTargetWidth = 0;
		}

		this._handleResize();
	};

	ShellBar.prototype._applyUxRules = function () {
		if (!this.getDomRef()) {return;}

		if (this._oCopilot) {
			this._applyUxRulesWithCoPilot();
		} else {
			this._appluUxRulesWithoutCoPilot();
		}
	};

	ShellBar.prototype._appluUxRulesWithoutCoPilot = function () {
		var $This = this.$(),
			iWidth = $This.outerWidth(),
			oCurrentRange = Device.media.getCurrentRange("Std", iWidth),
			iPaddingCorrection = oCurrentRange ? parseInt(this._aPadding[oCurrentRange.name]) : 0,
			iLeftWidth = iWidth - this._iStaticWidth - iPaddingCorrection - (10 * this._iREMSize),
			iAvailableSpace = iLeftWidth - this._iHomeWidth,
			iTitleAvailableWidth = iAvailableSpace - this._iMBTargetWidth,
			iControlsPadding = (this._iHomeWidth > 0 ? 8 : 0) + (this._iMBTargetWidth > 0 ? 8 : 0) + (this._iTitleTargetWidth ? 8 : 0),
			bPhoneRange;

		if (oCurrentRange) {
			bPhoneRange = oCurrentRange.name === "Phone";

			$This.toggleClass("sapFShellBarSizeDesktop", oCurrentRange.name === "Desktop");
			$This.toggleClass("sapFShellBarSizeTablet", oCurrentRange.name === "Tablet");
			$This.toggleClass("sapFShellBarSizePhone", bPhoneRange);
		}

		if (iAvailableSpace < 0) {iAvailableSpace = 0;}
		if (iTitleAvailableWidth < 0) {iTitleAvailableWidth = 0;}

		if (bPhoneRange && !this.bWasInPhoneRange) {
			this._wSecondTitle.setVisible(false);
			this._wHomeIcon.setVisible(false);
			if (this._oHomeIcon) {
				this._wMegaMenu.setWidth("auto").setText("").setIcon(this.getHomeIcon());
			}

			this.bWasInPhoneRange = true;
			this.invalidate();
			return;
		} else if (!bPhoneRange && this.bWasInPhoneRange) {
			this._wSecondTitle.setVisible(true);
			this._wHomeIcon.setVisible(true);
			if (this._oHomeIcon) {
				this._wMegaMenu.setText(this._sTitle).setIcon("");
			}

			this.bWasInPhoneRange = false;
			this.invalidate();
			return;
		}

		if (!bPhoneRange) {
			if (this._iMBTargetWidth >= iAvailableSpace) {
				// +8: Compensates for one less control's margin
				this._wMegaMenu.setWidth((iAvailableSpace - iControlsPadding + 8) + "px");
				this._wSecondTitle.setWidth("0px");
				return;
			} else {
				this._wMegaMenu.setWidth(this._iMBTargetWidth + "px");
			}

			if (!this._wSecondTitle.getVisible() && iTitleAvailableWidth >= 48) {
				this._wSecondTitle.setVisible(true);
			} else if (iTitleAvailableWidth < 48) {
				this._wSecondTitle.setVisible(false);
			}

			if (this._wSecondTitle.getVisible() && this._iTitleTargetWidth >= (iTitleAvailableWidth - iControlsPadding)) {
				this._wSecondTitle.setWidth((iTitleAvailableWidth - iControlsPadding) + "px");
			} else if (this._wSecondTitle.getVisible()) {
				this._wSecondTitle.setWidth(this._iTitleTargetWidth + "px");
			}
		}

	};

	ShellBar.prototype._applyUxRulesWithCoPilot = function () {
		var $This = this.$(),
			iWidth = $This.outerWidth(),
			oCurrentRange = Device.media.getCurrentRange("Std", iWidth),
			iPaddingCorrection = oCurrentRange ? parseInt(this._aPadding[oCurrentRange.name]) : 0,
			iLeftWidth = (iWidth / 2) - this._iStaticWidth - iPaddingCorrection - 32 /* Copilot half width */,
			iAvailableSpace = iLeftWidth - this._iHomeWidth,
			iTitleAvailableWidth = iAvailableSpace - this._iMBTargetWidth,
			iSpacerAvailableWidth = iTitleAvailableWidth - this._iTitleTargetWidth,
			iControlsPadding = (this._iHomeWidth > 0 ? 8 : 0) + (this._iMBTargetWidth > 0 ? 8 : 0) + (this._iTitleTargetWidth ? 8 : 0),
			bPhoneRange;

		if (oCurrentRange) {
			bPhoneRange = oCurrentRange.name === "Phone";

			$This.toggleClass("sapFShellBarSizeDesktop", oCurrentRange.name === "Desktop");
			$This.toggleClass("sapFShellBarSizeTablet", oCurrentRange.name === "Tablet");
			$This.toggleClass("sapFShellBarSizePhone", bPhoneRange);
		}

		if (iAvailableSpace < 0) {iAvailableSpace = 0;}
		if (iTitleAvailableWidth < 0) {iTitleAvailableWidth = 0;}
		if (iSpacerAvailableWidth < 0) {iSpacerAvailableWidth = 0;}

		if (bPhoneRange && !this.bWasInPhoneRange) {
			this._wSecondTitle.setVisible(false);
			this._wHomeIcon.setVisible(false);
			if (this._oHomeIcon) {
				this._wMegaMenu.setWidth("auto").setText("").setIcon(this.getHomeIcon());
			}

			this.bWasInPhoneRange = true;
			this.invalidate();
			return;
		} else if (!bPhoneRange && this.bWasInPhoneRange) {
			this._wSecondTitle.setVisible(true);
			this._wHomeIcon.setVisible(true);
			if (this._oHomeIcon) {
				this._wMegaMenu.setText(this._sTitle).setIcon("");
			}

			this.bWasInPhoneRange = false;
			this.invalidate();
			return;
		}

		if (!bPhoneRange) {
			if (this._iMBTargetWidth >= iAvailableSpace) {
				// +8: Compensates for one less control's margin
				this._wMegaMenu.setWidth((iAvailableSpace - iControlsPadding + 8) + "px");
				this._wSecondTitle.setWidth("0px");
				this._wControlSpacer.setWidth("0px");
				return;
			} else {
				this._wMegaMenu.setWidth(this._iMBTargetWidth + "px");
			}

			if (!this._wSecondTitle.getVisible() && iTitleAvailableWidth >= 48) {
				this._wSecondTitle.setVisible(true);
			} else if (iTitleAvailableWidth < 48) {
				this._wSecondTitle.setVisible(false);
			}

			if (this._wSecondTitle.getVisible() && this._iTitleTargetWidth >= (iTitleAvailableWidth - iControlsPadding)) {
				this._wSecondTitle.setWidth((iTitleAvailableWidth - iControlsPadding) + "px");
				this._wControlSpacer.setWidth("0px");
				return;
			} else if (this._wSecondTitle.getVisible()) {
				this._wSecondTitle.setWidth(this._iTitleTargetWidth + "px");
			}


			if (this._wSecondTitle.getVisible()) {
				this._wControlSpacer.setWidth((iSpacerAvailableWidth - iControlsPadding) + "px");
			} else {
				// +8: Compensates for one less control's margin
				this._wControlSpacer.setWidth((iTitleAvailableWidth - iControlsPadding + 8) + "px");
			}
		} else {
			this._wControlSpacer.setWidth(iAvailableSpace - this._wMegaMenu.getWidth() - iControlsPadding + "px");
		}
	};

	return ShellBar;

}, /* bExport= */ true);