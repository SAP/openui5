/*!
 * ${copyright}
 */

// Provides control sap.f.AvatarGroup.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/dom/units/Rem",
	"./AvatarGroupRenderer",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/ResizeHandler",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/Theming"
], function(library, Control, Library, ItemNavigation, Rem, AvatarGroupRenderer, Button, mLibrary, ResizeHandler, KeyCodes, Core, Theming) {
	"use strict";

	var AvatarGroupType = library.AvatarGroupType;

	var AvatarColor = mLibrary.AvatarColor;

	var AvatarSize = mLibrary.AvatarSize;

	var AVATAR_WIDTH = {
		XS: 2,
		S: 3,
		M: 4,
		L: 5,
		XL: 7
	};

	var AVATAR_MARGIN_GROUP = {
		XS: 0.5,
		S: 1.25,
		M: 1.625,
		L: 2,
		XL: 2.75
	};

	var AVATAR_MARGIN_INDIVIDUAL = {
		XS: 0.0625,
		S: 0.125,
		M: 0.125,
		L: 0.125,
		XL: 0.25,
		Custom: 0.125
	};

	/**
	 * Constructor for a new <code>AvatarGroup</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays a group of avatars arranged horizontally. It is useful to visually
	 * showcase a group of related avatars, such as, project team members or employees.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control allows you to display the avatars in different sizes,
	 * depending on your use case.
	 *
	 * The <code>AvatarGroup</code> control has two group types:
	 * <ul>
	 * <li><code>Group</code> type: The avatars are displayed as partially overlapped on
	 * top of each other and the entire group has one click/tap area.</li>
	 * <li><code>Individual</code> type: The avatars are displayed side-by-side and each
	 * avatar has its own click/tap area.</li>
	 * </ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * When the available space is less than the width required to display all avatars,
	 * an overflow visualization appears as a button placed at the end with the same shape
	 * and size as the avatars. The visualization displays the number of avatars that have overflowed
	 * and are not currently visible.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the <code>AvatarGroup</code> if:
	 * <ul>
	 * <li>You want to display a group of avatars.</li>
	 * <li>You want to display several avatars which have something in common.</li>
	 * </ul>
	 *
	 * Do not use the <code>AvatarGroup</code> if:
	 * <ul>
	 * <li>You want to display a single avatar.</li>
	 * <li>You want to display a gallery for simple images.</li>
	 * <li>You want to use it for other visual content than avatars.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.73
	 * @alias sap.f.AvatarGroup
	 */
	var AvatarGroup = Control.extend("sap.f.AvatarGroup", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * Defines the mode of the <code>AvatarGroup</code>.
				 */
				groupType: {type: "sap.f.AvatarGroupType", group: "Appearance", defaultValue: AvatarGroupType.Group},
				/**
				 * Defines the display size of each avatar.
				 */
				avatarDisplaySize: { type: "sap.m.AvatarSize", group: "Appearance", defaultValue: AvatarSize.S },
				/**
				 * Specifies a custom display size for each avatar.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>Supports only <code>px</code> and code>rem</code> values.</li>
				 * <li>It takes effect only if the <code>avatarDisplaySize</code> property
				 * is set to <code>Custom</code>.</li>
				 * </ul>
				 *
				 * @since 1.103
				 */
				avatarCustomDisplaySize: {type: "sap.ui.core.AbsoluteCSSSize", group: "Appearance", defaultValue: "3rem"},
				/**
				 * Specifies a custom font size for each avatar.
				 *
				 * <b>Note:</b> It takes effect only if the <code>avatarDisplaySize</code>
				 * property is set to <code>Custom</code>.
				 *
				 * @since 1.103
				 */
				avatarCustomFontSize: {type: "sap.ui.core.AbsoluteCSSSize", group: "Appearance", defaultValue: "1.125rem"},
				/**
				 * Defines if keyboard or mouse interactions on this control are allowed.
				 * @private
				 */
				_interactive: { type: "boolean", group: "Behavior", defaultValue: true, visibility: "hidden" }
			},
			defaultAggregation : "items",
			aggregations : {
				/**
				 *
				 * The <code>AvatarGroupItems</code> contained by the control.
				 * @public
				 */
				items: {type: 'sap.f.AvatarGroupItem', multiple: true}
			},
			events : {
				/**
				 * Fired when the user clicks or taps on the control.
				 */
				press: {
						parameters : {
						/**
						 * The <code>GroupType</code> of the control.
						 */
						groupType : {type : "string"},
						/**
						 * Indication whether the overflow button is pressed.
						 */
						overflowButtonPressed : { type: "boolean" },
						/**
						 * The number of currently displayed (visible) avatars.
						 */
						avatarsDisplayed : { type: "int" }
					}
				}
			}
		},

		renderer: AvatarGroupRenderer
	});

	AvatarGroup.prototype.init = function () {
		this._oShowMoreButton = new Button();
		this._oShowMoreButton.addStyleClass("sapFAvatarGroupMoreButton");
		this._oShowMoreButton.addStyleClass("sapFAvatarGroupMoreButton" + this.getAvatarDisplaySize());
		this._bFirstRendering = true;
		this._onResizeRef = this._onResize.bind(this);
		this._iCurrentAvatarColorNumber = 1;
		this._bShowMoreButton = false;
	};

	AvatarGroup.prototype.exit = function () {
		this._detachResizeHandlers();
		this._destroyItemNavigation();
		this._oShowMoreButton.destroy();
		this._oShowMoreButton = null;
	};

	AvatarGroup.prototype._destroyItemNavigation = function () {
		if (this._oItemNavigation) {
			this.removeEventDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			this._oItemNavigation = null;
		}
	};

	AvatarGroup.prototype.onBeforeRendering = function () {
		if (this._bFirstRendering) {
			this._iAvatarsToShow = this.getItems().length;
			this._bFirstRendering = false;
		}
	};

	AvatarGroup.prototype.onAfterRendering = function() {
		var bInteractive = this.getProperty("_interactive"),
			oDomRef,
			aDomRefs = [];

		if (!this._oItemNavigation && bInteractive) {

			this._oItemNavigation = new ItemNavigation(null, null);
			this._oItemNavigation.setDisabledModifiers({
				// Alt + arrow keys are reserved for browser navigation
				sapnext: [
					"alt", // Windows and Linux
					"meta" // Apple (⌘)
				],
				sapprevious: [
					"alt",
					"meta"
				]
			});
			this.addEventDelegate(this._oItemNavigation);
		}

		if (bInteractive) {
			oDomRef = this.getDomRef();
			// set the root dom node that surrounds the items
			this._oItemNavigation.setRootDomRef(oDomRef);
		}

		if (bInteractive && this.getGroupType() === AvatarGroupType.Individual) {
			this.getItems().forEach(function(oItem) {
				aDomRefs.push(oItem.getDomRef());
			});

			// set the array of DOM elements representing the items
			this._oItemNavigation.setItemDomRefs(aDomRefs);
		}

		this._detachResizeHandlers();
		this._attachResizeHandlers();

		if (this._isThemeApplied()) {
			this._onResize();
		}

		if (this._shouldShowMoreButton()) {
			this._oShowMoreButton.$().attr("role", "button");

			if (this.getGroupType() === AvatarGroupType.Group) {
				this._oShowMoreButton.$().attr("tabindex", "-1");
			} else {
				this._oShowMoreButton.$().attr("aria-label", this._getResourceBundle().getText("AVATARGROUP_POPUP"));
			}
		}

		this._updateAccState();
	};

	/**
	 * Informs whether the current theme is fully applied already.
	 * Replacement for Core#isThemeApplied.
	 * Based on sap/m/table/Util#isThemeApplied
	 *
	 * @returns {boolean} true if theme is applied
	 * @private
	 */
	AvatarGroup.prototype._isThemeApplied = function() {
		var bIsApplied = false;
		var fnOnThemeApplied = function() {
			bIsApplied = true;
		};
		Theming.attachApplied(fnOnThemeApplied); // Will be called immediately when theme is applied
		Theming.detachApplied(fnOnThemeApplied);
		return bIsApplied;
	};

	AvatarGroup.prototype.onThemeChanged = function () {
		if (!this.getDomRef()) {
			return;
		}

		this._onResize();
	};

	AvatarGroup.prototype._getResourceBundle = function () {
		return Library.getResourceBundleFor("sap.f");
	};

	AvatarGroup.prototype._updateAccState = function () {
		var oResourceBundle = this._getResourceBundle(),
			sBaseMessage = oResourceBundle.getText("AVATARGROUP_NUMBER_OF_AVATARS",
				 [this._iAvatarsToShow, (this.getItems().length - this._iAvatarsToShow)]),
			sPopupMessage = oResourceBundle.getText("AVATARGROUP_POPUP");

		if (this.getGroupType() === AvatarGroupType.Group) {
			this.$().attr("aria-label", sPopupMessage + " " + sBaseMessage);
		}
	};

	/**
	 * Called after rendering.
	 *
	 * @private
	 */
	AvatarGroup.prototype._attachResizeHandlers = function () {
		this._iResizeHandlerId = ResizeHandler.register(this, this._onResizeRef);
	};

	/**
	 * Called after rendering and upon exit.
	 *
	 * @private
	 */
	AvatarGroup.prototype._detachResizeHandlers = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}
	};

	AvatarGroup.prototype.setGroupType = function (sValue) {
		this.getItems().forEach(function (oItem) {
			oItem._setGroupType(sValue);
		});

		return this.setProperty("groupType", sValue);
	};

	AvatarGroup.prototype.addItem = function (oItem) {
		oItem._setDisplaySize(this.getAvatarDisplaySize());
		oItem._setCustomDisplaySize(this.getAvatarCustomDisplaySize());
		oItem._setCustomFontSize(this.getAvatarCustomFontSize());
		oItem._setAvatarColor(AvatarColor["Accent" + this._iCurrentAvatarColorNumber]);
		oItem._setGroupType(this.getGroupType());
		oItem._setInteractive(this.getProperty("_interactive"));

		this.addAggregation("items", oItem);

		this._iAvatarsToShow = this.getItems().length;

		this._iCurrentAvatarColorNumber++;
		if (this._iCurrentAvatarColorNumber > 10) {
			this._iCurrentAvatarColorNumber = 1;
		}

		return this;
	};

	AvatarGroup.prototype.setAvatarDisplaySize = function (sValue) {
		var sOldAvatarDisplaySize = this.getAvatarDisplaySize();

		this._oShowMoreButton.removeStyleClass("sapFAvatarGroupMoreButton" + sOldAvatarDisplaySize);
		this._oShowMoreButton.addStyleClass("sapFAvatarGroupMoreButton" + sValue);

		if (sOldAvatarDisplaySize === sValue) {
			return this;
		}

		this.getItems().forEach(function (oItem) {
			oItem._setDisplaySize(sValue);
		});

		return this.setProperty("avatarDisplaySize", sValue);
	};

	AvatarGroup.prototype.setAvatarCustomDisplaySize = function (sValue) {
		var sOldAvatarCustomDisplaySize = this.getAvatarCustomDisplaySize();

		if (sOldAvatarCustomDisplaySize === sValue) {
			return this;
		}

		this.setProperty("avatarCustomDisplaySize", sValue);

		this.getItems().forEach(function (oItem) {
			oItem._setCustomDisplaySize(sValue);
		});

		return this;
	};

	AvatarGroup.prototype.setAvatarCustomFontSize = function (sValue) {
		var sOldAvatarCustomFontSize = this.getAvatarCustomFontSize();

		if (sOldAvatarCustomFontSize === sValue) {
			return this;
		}

		this.setProperty("avatarCustomFontSize", sValue);

		this.getItems().forEach(function (oItem) {
			oItem._setCustomFontSize(sValue);
		});

		return this;
	};

	/**
	 * Called when the <code>AvatarGroup</code> is clicked/tapped.
	 *
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	AvatarGroup.prototype.ontap = function (oEvent) {
		if (!this.getProperty("_interactive")) {
			return;
		}

		var oEventSource = oEvent.srcControl;

		this.firePress({
			groupType: this.getGroupType(),
			eventSource: oEventSource,
			overflowButtonPressed: oEventSource === this._oShowMoreButton,
			avatarsDisplayed: this._iAvatarsToShow
		});
	};

	/**
	 * Handles the keydown event for SPACE on which we have to prevent the browser scrolling.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	AvatarGroup.prototype.onsapspace = function(oEvent) {
		this.ontap(oEvent);
	};

	/**
	 * Event handler called when the enter key is pressed onto the AvatarGroup.
	 *
	 * @param {jQuery.Event} oEvent The ENTER keyboard key event object
	 */
	AvatarGroup.prototype.onsapenter = function(oEvent) {
		this.ontap(oEvent);
	};

	/**
	 * Handles keyup event
	 *
	 * @param {jQuery.Event} oEvent - keyup event object
	 * @private
	 */
	AvatarGroup.prototype.onkeyup = function (oEvent) {
		if (oEvent.shiftKey && oEvent.keyCode == KeyCodes.ENTER
			|| oEvent.shiftKey && oEvent.keyCode == KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Returns the current margin, applied to each <code>Avatar</code>
	 *
	 * @param {string} sAvatarDisplaySize - a value from the <code>sap.m.AvatarSize</code> enum
	 * @returns {float} The margin, applied to each <code>Avatar</code>
	 * @private
	 */
	AvatarGroup.prototype._getAvatarMargin = function (sAvatarDisplaySize) {
		var sGroupType = this.getGroupType(),
			sDisplaySize = this.getAvatarDisplaySize(),
			iMargin;

		if (sDisplaySize === AvatarSize.Custom && sGroupType === AvatarGroupType.Group) {
			iMargin = this._getAvatarWidth(AvatarSize.Custom) * 0.4;
		} else if (sGroupType === AvatarGroupType.Group) {
			iMargin = AVATAR_MARGIN_GROUP[sAvatarDisplaySize];
		} else {
			iMargin = AVATAR_MARGIN_INDIVIDUAL[sAvatarDisplaySize];
		}

		return iMargin;
	};

	/**
	 * Returns the width of each <code>Avatar</code>
	 *
	 * @param {string} sAvatarDisplaySize - a value from the <code>sap.m.AvatarSize</code> enum
	 * @returns {int} The width of each <code>Avatar</code>
	 * @private
	 */
	AvatarGroup.prototype._getAvatarWidth = function (sAvatarDisplaySize) {
		var iWidth,
			sCustomDisplaySize = this.getAvatarCustomDisplaySize(),
			bInPx = /.*[pP][xX]/.test(sCustomDisplaySize);

		if (sAvatarDisplaySize !== AvatarSize.Custom) {
			iWidth = AVATAR_WIDTH[sAvatarDisplaySize];
		} else {
			iWidth = parseFloat(bInPx ? Rem.fromPx(sCustomDisplaySize) : sCustomDisplaySize);
		}

		return iWidth;
	};

	/**
	 * Returns the net width of each <code>Avatar</code>
	 *
	 * @param {int} iAvatarWidth - the width of the <code>sap.m.Avatar</code>
	 * @param {int} iAvatarMargin - the margin of the <code>sap.m.Avatar</code>
	 * @returns {int} The net width of each <code>Avatar</code>
	 * @private
	 */
	AvatarGroup.prototype._getAvatarNetWidth = function (iAvatarWidth, iAvatarMargin) {
		var sGroupType = this.getGroupType();

		if (sGroupType === AvatarGroupType.Group) {
			return iAvatarWidth - iAvatarMargin;
		} else {
			return iAvatarWidth + iAvatarMargin;
		}
	};

	/**
	 * Returns the number of <code>Avatars</code> to be shown
	 *
	 * @param {int} iWidth - the width of the <code>sap.f.AvatarGroup</code>
	 * @param {int} iAvatarWidth - the width full of the <code>sap.m.Avatar</code>
	 * @param {int} iAvatarNetWidth - the net width of the <code>sap.m.Avatar</code>
	 * @returns {int} The <code>Avatars</code> to be shown
	 * @private
	 */
	AvatarGroup.prototype._getAvatarsToShow = function (iWidth, iAvatarWidth, iAvatarNetWidth) {
		var iRemToPx = Rem.toPx(1),
			iRestWidth = iWidth - (iAvatarWidth * iRemToPx),
			iAvatarsToShow = Math.floor(iRestWidth / (iAvatarNetWidth * iRemToPx));

		return iAvatarsToShow + 1;
	};

	/**
	 * Adjustes the number of <code>Avatars</code> to be shown in case ShowMoreButton is visible
	 *
	 * @param {int} iAvatarGroupItems - the number of <code>sap.f.AvatarGroupItems</code>
	 * @private
	 */
	AvatarGroup.prototype._adjustAvatarsToShow = function (iAvatarGroupItems) {
		if (iAvatarGroupItems - this._iAvatarsToShow > 99) {
			this._iAvatarsToShow -= 2;
		} else {
			this._iAvatarsToShow--;
		}
	};

	/**
	 * Returns the width of <code>AvatarGroup</code>
	 *
	 * @returns {int} width
	 * @private
	 */
	AvatarGroup.prototype._getWidth = function () {
		return Math.ceil(this.$().width());
	};

	/**
	 * Handles the resize event of the <code>AvatarGroup</code>.
	 * Defines how many <code>Avatars</code> can be shown and whether the showMore button should be rendered.
	 *
	 * @private
	 */
	AvatarGroup.prototype._onResize = function () {
		var iWidth = this._getWidth(),
			aItems = this.getItems(),
			iAvatarGroupItems = aItems.length,
			sAvatarDisplaySize = this.getAvatarDisplaySize(),
			iAvatarWidth = this._getAvatarWidth(sAvatarDisplaySize),
			iAvatarMargin = this._getAvatarMargin(sAvatarDisplaySize),
			iAvatarNetWidth = this._getAvatarNetWidth(iAvatarWidth, iAvatarMargin),
			iRenderedAvatars = this.$().children(".sapFAvatarGroupItem").length;

		if (iWidth === 0) {
			return;
		}

		this._iAvatarsToShow = this._getAvatarsToShow(iWidth, iAvatarWidth, iAvatarNetWidth);

		if (sAvatarDisplaySize === AvatarSize.Custom) {
			this.getDomRef().style.setProperty("--sapUiAvatarGroupCustomMarginRight", (iAvatarWidth * -0.4) + "rem");
		}

		if (iAvatarGroupItems > this._iAvatarsToShow && iAvatarGroupItems > 0) {
			this._bShowMoreButton = true;
			this._bAutoWidth = false;
			this._adjustAvatarsToShow(iAvatarGroupItems);

			if (iRenderedAvatars != this._iAvatarsToShow) {
				this._oShowMoreButton.setText("+"  + (iAvatarGroupItems - this._iAvatarsToShow));
				this.invalidate();
			}
		} else {
			this._bAutoWidth = true;
			this.getDomRef().style.width = "auto";

			if (this._bShowMoreButton) {
				this._bShowMoreButton = false;
				this.invalidate();
			}
		}
	};

	/**
	 * Defines if keyboard or mouse interactions on this control are allowed.
	 *
	 * @param {boolean} bInteractive
	 * @private
	 */
	AvatarGroup.prototype._setInteractive = function (bInteractive) {
		if (!bInteractive) {
			this._destroyItemNavigation();
		}

		this.getItems().forEach(function (oAvatar) {
			oAvatar._setInteractive(bInteractive);
		});

		return this.setProperty("_interactive", bInteractive);
	};

	/**
	 * Indicates whether the showMoreButton should be shown.
	 *
	 * @private
	 */
	AvatarGroup.prototype._shouldShowMoreButton = function () {
		return this._bShowMoreButton;
	};

	return AvatarGroup;
});