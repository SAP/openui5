/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabFilter.
sap.ui.define([
	"./library",
	"sap/ui/core/Icon",
	"./IconTabFilterExpandButtonBadge",
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/Item",
	"sap/ui/core/Renderer",
	"sap/ui/core/IconPool",
	'sap/ui/core/InvisibleMessage',
	'sap/ui/Device',
	"sap/m/BadgeCustomData",
	"sap/m/Button",
	"sap/m/ResponsivePopover",
	"sap/m/IconTabBarSelectList",
	"sap/m/BadgeEnabler",
	"sap/m/ImageHelper"
], function(
	library,
	Icon,
	IconTabFilterExpandButtonBadge,
	Localization,
	Library,
	coreLibrary,
	Item,
	Renderer,
	IconPool,
	InvisibleMessage,
	Device,
	BadgeCustomData,
	Button,
	ResponsivePopover,
	IconTabBarSelectList,
	BadgeEnabler,
	ImageHelper
) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = library.IconTabFilterDesign;

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterInteractionMode = library.IconTabFilterInteractionMode;

	// shortcut for sap.m.BadgeStyle
	var BadgeStyle = library.BadgeStyle;

	// shortcut for sap.m.BadgeState
	var BadgeState = library.BadgeState;

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;

	/**
	 * The time between tab activation and the disappearance of the badge.
	 * @constant {int}
	 */
	var BADGE_AUTOHIDE_TIME = 3000;

	// shortcut for sap.ui.core.InvisibleMessageMode
	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	var POPOVER_OFFSET_Y_TOOL_HEADER = -8;

	/**
	 * Constructor for a new IconTabFilter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a selectable item inside an IconTabBar.
	 *
	 * @extends sap.ui.core.Item
	 * @implements sap.m.IconTab
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabFilter
	 */
	var IconTabFilter = Item.extend("sap.m.IconTabFilter", /** @lends sap.m.IconTabFilter.prototype */ { metadata : {

		interfaces : [
			"sap.m.IconTab",
			// The IconTabFilter doesn't have renderer. The sap.ui.core.PopupInterface is used to indicate
			// that the IconTabFilter content is not rendered by the IconTabFilter, it is rendered by IconTabBar.
			"sap.ui.core.PopupInterface",
			"sap.m.IBadge"
		],
		library : "sap.m",
		designtime: "sap/m/designtime/IconTabFilter.designtime",
		properties : {

			/**
			 * Represents the "count" text, which is displayed in the tab filter.
			 */
			count : {type : "string", group : "Data", defaultValue : ''},

			/**
			 * Enables special visualization for disabled filter (show all items).
			 * <b>Note:</b> You can use this property when you use <code>IconTabBar</code> as a filter.
			 * In order for it to be displayed correctly, the other tabs in the filter should consist of an icon, text and an optional count.
			 * It can be set to true for the first tab filter.
			 * You can find more detailed information in the {@link https://experience.sap.com/fiori-design-web/icontabbar/#tabs-as-filters UX Guidelines}.
			 */
			showAll : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Specifies the icon to be displayed for the tab filter.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : ''},

			/**
			 * Specifies the icon color.
			 *
			 * If an icon font is used, the color can be chosen from the icon colors (sap.ui.core.IconColor).
			 * Possible semantic colors are: Neutral, Positive, Critical, Negative.
			 * Instead of the semantic icon color the brand color can be used, this is named Default.
			 * Semantic colors and brand colors should not be mixed up inside one IconTabBar.
			 */
			iconColor : {type : "sap.ui.core.IconColor", group : "Appearance", defaultValue : IconColor.Default},

			/**
			 * If set to true, it sends one or more requests,
			 * trying to get the density perfect version of the image if this version of
			 * the image doesn't exist on the server. Default value is set to true.
			 *
			 * If bandwidth is key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Specifies whether the tab filter is rendered.
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Specifies whether the icon and the texts are placed vertically or horizontally.
			 */
			design : {type : "sap.m.IconTabFilterDesign", group : "Appearance", defaultValue : IconTabFilterDesign.Vertical},

			/**
			 * Specifies the interaction mode.
			 * @experimental Since 1.121.
			 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
			 */
			interactionMode : {type : "sap.m.IconTabFilterInteractionMode", group : "Behavior", defaultValue : IconTabFilterInteractionMode.Auto}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The content displayed for this item (optional).
			 *
			 * If this content is set, it is displayed instead of the general content inside the IconTabBar.
			 * @since 1.15.0
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"},

			/**
			 * The sub items of this filter (optional).
			 * @since 1.77
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item"},

			/**
			 * The expand icon if there are sub filters
			 * @since 1.77
			 */
			_expandIcon : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"},

			/**
			 * The badge of the expand button
			 * @since 1.83
			 */
			_expandButtonBadge : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		}
	}});

	BadgeEnabler.call(IconTabFilter.prototype);

	/**
	 * Library internationalization resource bundle.
	 *
	 * @type {module:sap/base/i18n/ResourceBundle}
	 */
	var oResourceBundle = Library.getResourceBundleFor("sap.m");

	/**
	 * Array of all available icon color CSS classes
	 *
	 * @private
	 */
	IconTabFilter._aAllIconColors = ['sapMITBFilterCritical', 'sapMITBFilterPositive', 'sapMITBFilterNegative', 'sapMITBFilterDefault', 'sapMITBFilterNeutral'];

	/**
	 * Lazy load icon tab filter image.
	 *
	 * @param {Array} aCssClassesToAdd Array of CSS classes, which will be added if the image needs to be created.
	 * @param {sap.ui.core.Control} oParent This element's parent
	 * @param {Array} aCssClassesToRemove All CSS clases, that oImageControl has and which are
	 * contained in this array are removed before adding the CSS classes listed in aCssClassesToAdd.
	 *
	 * @private
	 */
	IconTabFilter.prototype._getImageControl = function(aCssClassesToAdd, oParent, aCssClassesToRemove) {
		var mProperties = {
			src : this.getIcon(),
			densityAware : this.getIconDensityAware(),
			useIconTooltip : false
		};
		if (mProperties.src) {
			this._oImageControl = ImageHelper.getImageControl(this.getId() + "-icon", this._oImageControl, oParent, mProperties, aCssClassesToAdd, aCssClassesToRemove);
		} else if (this._oImageControl) {
			this._oImageControl.destroy();
			this._oImageControl = null;
		}

		return this._oImageControl;
	};

	/**
	 * Function is called when the element is initialized.
	 *
	 * @private
	 */
	IconTabFilter.prototype.init = function () {
		this._oDragEventDelegate = {
			onlongdragover: this._handleOnLongDragOver,
			ondragover: this._handleOnDragOver,
			ondragleave: this._handleOnDragLeave,
			ondrop: this._handleOnDrop
		};

		this.initBadgeEnablement({
			style: BadgeStyle.Attention,
			selector: {
				selector: ".sapMITBBadgeHolder"
			}
		});

		this._oCloneInList = null; // holds reference to the cloned item in the SelectList
		this.setAggregation("_expandButtonBadge", new IconTabFilterExpandButtonBadge());
	};

	/**
	 * Function is called when exiting the element.
	 *
	 * @private
	 */
	IconTabFilter.prototype.exit = function(oEvent) {
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}

		if (Item.prototype.exit) {
			Item.prototype.exit.call(this, oEvent);
		}

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}

		if (this._oExpandIcon) {
			this._oExpandIcon.removeEventDelegate(this._oDragEventDelegate);
			this._oExpandIcon.destroy();
			this._oExpandIcon = null;
		}

		this.removeEventDelegate(this._oDragEventDelegate);
		this._oDragEventDelegate = null;

		if (this._iHideBadgeTimeout) {
			clearTimeout(this._iHideBadgeTimeout);
		}
	};

	IconTabFilter.prototype.invalidate = function() {
		var oIconTabHeader = this.getParent(),
			oIconTabBar,
			oObjectHeader;

		// invalidate the correct parent - IconTabHeader, IconTabBar or ObjectHeader
		if (!oIconTabHeader) {
			return;
		}

		oIconTabBar = oIconTabHeader.getParent();

		if (!(oIconTabBar && oIconTabBar.isA("sap.m.IconTabBar"))) {
			oIconTabHeader.invalidate();
			return;
		}

		oObjectHeader = oIconTabBar.getParent();

		if (oObjectHeader && oObjectHeader.isA("sap.m.ObjectHeader")) {
			// invalidate the object header to re-render IconTabBar content and header
			oObjectHeader.invalidate();
		} else {
			oIconTabBar.invalidate();
		}
	};

	IconTabFilter.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
		// invalidate only the IconTabHeader if a property change
		// doesn't affect the IconTabBar content
		switch (sPropertyName) {
			case 'textDirection':
			case 'text':
			case 'count':
			case 'showAll':
			case 'icon':
			case 'iconColor':
			case 'iconDensityAware':
			case 'design':
				if (this.getProperty(sPropertyName) === oValue) {
					return this;
				}
				Item.prototype.setProperty.call(this, sPropertyName, oValue, true);
				if (!bSuppressInvalidate) {
					var oIconTabHeader = this.getParent();
					if (oIconTabHeader && oIconTabHeader.isA("sap.m.IconTabHeader")) {
						oIconTabHeader.invalidate();
					}
				}
				break;
			default:
				Item.prototype.setProperty.apply(this, arguments);
				break;
		}

		return this;
	};

	/**
	 * If the IconTabFilter doesn't have a key, the function returns the ID of the IconTabFilter,
	 * so the IconTabBar can remember the selected IconTabFilter.
	 *
	 * @private
	 */
	IconTabFilter.prototype._getNonEmptyKey = function () {
		// BCP: 1482007468
		var sKey = this.getKey();

		if (sKey) {
			return sKey;
		}

		return this.getId();
	};

	/**
	 * @returns {sap.m.IconTabFilter} the underlying instance of a tab
	 * @private
	 */
	IconTabFilter.prototype._getRealTab = function () {
		return this._oRealItem || this;
	};

	/**
	 * @returns {sap.m.IconTabFilter} the top-level tab, if this instance item is nested, or itself, if it's not nested
	 * @private
	 */
	IconTabFilter.prototype._getRootTab = function () {
		var oTab = this._getRealTab(),
			oParent = oTab.getParent();

		while (oParent && oParent.isA("sap.m.IconTabFilter")) {
			oTab = oParent;
			oParent = oParent.getParent();
		}

		return oTab;
	};

	/**
	 * @returns {int} the level at which this item has been nested, or 1 if an item has not been nested
	 * @private
	 */
	IconTabFilter.prototype._getNestedLevel = function () {
		var oParent = this._getRealTab().getParent(),
			iLevel;

		for (iLevel = 1; oParent && oParent.isA("sap.m.IconTabFilter"); iLevel++) {
			oParent = oParent.getParent();
		}

		return iLevel;
	};

	/**
	 * Renders this item in the IconTabHeader.
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {int} iVisibleIndex the visible index within the parent control
	 * @param {int} iVisibleItemsCount the visible items count
	 * @protected
	 */
	IconTabFilter.prototype.render = function (oRM, iVisibleIndex, iVisibleItemsCount) {
		if (!this.getVisible()) {
			return;
		}
		var oIconTabHeader = this.getParent(),
			oIconTabBar = oIconTabHeader.getParent();

		if (oIconTabHeader.getEnableTabReordering()) {
			this._prepareDragEventDelegate();
		}

		var bHasIconTabBar = oIconTabHeader._isInsideIconTabBar(),
			mAriaParams = { role: "tab"},
			sId = this.getId(),
			sCount = this.getCount(),
			sText = this.getText(),
			oIcon = this.getIcon(),
			sIconColor = this.getIconColor(),
			bEnabled = this.getEnabled(),
			bShouldReadIconColor = this._shouldReadIconColor(),
			bHorizontalDesign = this.getDesign() === IconTabFilterDesign.Horizontal,
			bTextOnly = oIconTabHeader._bTextOnly,
			bInLine = oIconTabHeader._bInLine || oIconTabHeader.isInlineMode(),
			bShowAll = this.getShowAll(),
			sTextDir = this.getTextDirection(),
			bIsSelectable = oIconTabHeader._isSelectable(this);

		if (this._isOverflow()) {
			mAriaParams.role = "button";
		}

		if (this.getItems().length && bIsSelectable) {
			mAriaParams.haspopup = "menu";
		}

		if (bHasIconTabBar) {
			mAriaParams.controls = oIconTabBar.getId() + "-content";
		}

		if (sText.length ||
			sCount !== "" ||
			oIcon) {

			var aId = [];

			if (sCount !== "" && !bInLine) {
				aId.push(sId + "-count");
			}
			if (sText.length) {
				aId.push(sId + "-text");
			}
			if (oIcon) {
				aId.push(sId + "-icon");
			}
			if (bShouldReadIconColor) {
				aId.push(sId + "-iconColor");
			}

			mAriaParams.labelledby = aId.join(" ");
		}

		if (iVisibleIndex !== undefined && iVisibleItemsCount !== undefined) {
			Object.assign(mAriaParams, {
				posinset: iVisibleIndex + 1,
				setsize: iVisibleItemsCount
			});
		}

		oRM.openStart("div", this)
			.accessibilityState(mAriaParams)
			.class("sapMITBItem");

		if (!sCount) {
			oRM.class("sapMITBItemNoCount");
		}

		if (bHorizontalDesign) {
			oRM.class("sapMITBHorizontal");
		} else {
			oRM.class("sapMITBVertical");
		}

		if (bShowAll) {
			oRM.class("sapMITBAll");
		} else {
			oRM.class("sapMITBFilter");
		}

		if (!bShowAll && bEnabled) {
			oRM.class("sapMITBFilter" + sIconColor);
		}

		if (!bIsSelectable) {
			oRM.class("sapMITHUnselectable");
		}

		if (this.getItems().length > 0) {
			oRM.class("sapMITBFilterWithItems");
		}

		if (!bEnabled) {
			oRM.class("sapMITBDisabled")
				.attr("aria-disabled", true);
		}

		oRM.attr("tabindex", "-1");
		if (!this._isOverflow()) {
			oRM.attr("aria-selected", false);
		}

		var sTooltip = this.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		if (this._isOverflow() || !bIsSelectable) {
			oRM.attr("aria-haspopup", "menu");
		}

		oRM.openEnd();

		if (bShouldReadIconColor) {
			this._renderIconColorDescription(oRM);
		}

		oRM.openStart("div")
			.class("sapMITBFilterWrapper")
			.openEnd();

		if (!bInLine) {
			oRM.openStart("div", sId + "-tab")
				.class("sapMITBTab")
				.openEnd();

			if (!bShowAll || !oIcon) {
				var aCssClasses = ["sapMITBFilterIcon", "sapMITBBadgeHolder"];
				if (bEnabled) {
					aCssClasses.push("sapMITBFilter" + sIconColor);
				}

				oRM.renderControl(this._getImageControl(aCssClasses, oIconTabHeader, IconTabFilter._aAllIconColors));
			}

			if (!bShowAll && !oIcon && !bTextOnly) {
				oRM.openStart("span").class("sapMITBFilterNoIcon").openEnd().close("span");
			}

			if (bHorizontalDesign && !bShowAll) {
				oRM.close("div");

				oRM.openStart("div")
					.class("sapMITBHorizontalWrapper")
					.openEnd();
			}

			oRM.openStart("span", sId + "-count")
				.class("sapMITBCount");

			if (bShowAll || (!oIcon && !sText.length)) {
				oRM.class("sapMITBBadgeHolder");
			}

			oRM.openEnd();

			if (sCount === "" && bHorizontalDesign) {
				//this is needed for the correct placement of the text in the horizontal design
				oRM.unsafeHtml("&nbsp;");
			} else {
				oRM.text(sCount);
			}

			oRM.close("span");

			if (!bHorizontalDesign) {
				oRM.close("div");
			}
		}

		if (sText.length) {
			oRM.openStart("div", sId + "-text")
				.class("sapMITBText");

			if (!bShowAll) {
				oRM.class("sapMITBBadgeHolder");
			}

			// Check for upperCase property on IconTabBar
			if (bHasIconTabBar && oIconTabBar.getUpperCase()) {
				oRM.class("sapMITBTextUpperCase");
			}

			oRM.openEnd();

			if (bInLine && oIcon) {
				this._renderIcon(oRM);
			}

			oRM.openStart("span")
				.class("sapMITHTextContent")
				.attr("dir", sTextDir !== TextDirection.Inherit ? sTextDir.toLowerCase() : "auto");

			oRM.openEnd()
				.text(oIconTabHeader._getDisplayText(this))
				.close("span");

			if (this._isOverflow() || this.getItems().length && !bIsSelectable) {
				oRM.openStart("span", this.getId() + "-expandButton").class("sapMITHShowSubItemsIcon").openEnd();
				oRM.icon(IconPool.getIconURI("slim-arrow-down"), null, {
					"title": null,
					"aria-hidden": true // icon is only decorative
				});
				oRM.close("span");
			}

			oRM.close("div");
		}

		if (!bInLine && bHorizontalDesign) {
			oRM.close("div");
		}

		oRM.openStart("div").class("sapMITBContentArrow").openEnd().close("div");
		oRM.close("div");

		if (this.getItems().length && bIsSelectable) {

			oRM.openStart("span").class("sapMITBFilterExpandBtnSeparator")
				.accessibilityState({ role: "separator" })
				.openEnd()
			.close("span");

			oRM.openStart("span", this.getId() + "-expandButton").class("sapMITBFilterExpandBtn").openEnd();
				oRM.renderControl(this._getExpandIcon());
			oRM.close("span");
		}

		oRM.renderControl(this.getAggregation("_expandButtonBadge"));

		if (this.getItems().length) {
			this._updateExpandButtonBadge();
		}

		oRM.close("div");
	};

	/**
	 * Renders this item in the IconTabSelectList.
	 * @param {sap.ui.core.RenderManager} oRM RenderManager used for writing to the render output buffer
	 * @param {sap.m.IconTabBarSelectList} oSelectList the select list in which this filter is rendered
	 * @param {int} iIndexInSet this item's index within the aggregation of items
	 * @param {int} iSetSize total length of the aggregation of items
	 * @param {float} fPaddingValue the padding with which the item should be indented
	 * @protected
	 */
	IconTabFilter.prototype.renderInSelectList = function (oRM, oSelectList, iIndexInSet, iSetSize, fPaddingValue) {
		if (!this.getVisible()) {
			return;
		}

		var bIconOnly = oSelectList._bIconOnly,
			bTextOnlyItemsInSelectList = true,
			oIconTabHeader = oSelectList._oIconTabHeader,
			sIconColor = this.getIconColor(),
			bEnabled = this.getEnabled();

		if (oIconTabHeader) {
			bTextOnlyItemsInSelectList = oSelectList._checkTextOnly();
		}

		oRM.openStart("li", this)
			.class("sapMITBSelectItem")
			.attr("tabindex", "-1")
			.attr("role", "menuitem");

		if (fPaddingValue) {
			oRM.style("padding-left", fPaddingValue + "rem");
		}

		if (iIndexInSet !== undefined && iSetSize !== undefined) {
			oRM.attr("aria-posinset", iIndexInSet + 1);
			oRM.attr("aria-setsize", iSetSize);
		}

		var sTooltip = this.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		if (!oIconTabHeader._isSelectable(this)) {
			oRM.class("sapMITHUnselectable");
		}

		if (!bEnabled) {
			oRM.class("sapMITBDisabled")
				.attr("aria-disabled", true);
		}


		if (oSelectList.getSelectedItem() == this) {
			oRM.class("sapMITBSelectItemSelected");
			oRM.attr("aria-selected", true);
		}

		if (bEnabled) {
			oRM.class("sapMITBFilter" + sIconColor);
		}

		var sItemId = this.getId(),
			bShouldReadIconColor = this._shouldReadIconColor(),
			aLabelledByIds = [];

		if (!bIconOnly) {
			aLabelledByIds.push(sItemId + "-text");
		}

		if (!bTextOnlyItemsInSelectList && this.getIcon()) {
			aLabelledByIds.push(sItemId + "-icon");
		}

		if (bShouldReadIconColor) {
			aLabelledByIds.push(sItemId + "-iconColor");
		}

		oRM.accessibilityState({ labelledby: aLabelledByIds.join(" ") })
			.openEnd();

		if (bShouldReadIconColor) {
			this._renderIconColorDescription(oRM);
		}

		if (!bTextOnlyItemsInSelectList) {
			this._renderIcon(oRM, bIconOnly);
		}

		if (!bIconOnly) {
			this._renderText(oRM);
		}
		oRM.close("li");
	};

	IconTabFilter.prototype._onAfterParentRendering = function () {
		this._renderBadge();

		// force initializing the invisible message,
		// as the live region should be rendered, when we announce the text
		InvisibleMessage.getInstance();
	};

	/**
	 * Renders an icon.
	 * @private
	 */
	IconTabFilter.prototype._renderIcon = function (oRM, bIconOnly) {
		var oIcon = this.getIcon();
		if (oIcon) {
			var oIconInfo = IconPool.getIconInfo(oIcon),
				aClasses = ["sapMITBSelectItemIcon"];

			if (oIconInfo && !oIconInfo.suppressMirroring) {
				aClasses.push("sapUiIconMirrorInRTL");
			}

			if (bIconOnly) {
				aClasses.push("sapMITBBadgeHolder");
			}

			if (this._getIconTabHeader().isInlineMode()) {
				aClasses.push("sapMITBInlineIcon");
			}

			oRM.icon(oIcon, aClasses, {
				id: this.getId() + "-icon",
				"aria-hidden": true
			});
		} else {
			oRM.openStart("span").class("sapUiIcon").openEnd().close("span");
		}
	};

	IconTabFilter.prototype._renderIconColorDescription = function (oRM) {
		oRM.openStart("div", this.getId() + "-iconColor")
			.style("display", "none")
			.openEnd()
			.text(oResourceBundle.getText("ICONTABBAR_ICONCOLOR_" + this.getIconColor().toUpperCase()))
			.close("div");
	};

	/**
	 * Renders text in SelectList.
	 * @private
	 */
	IconTabFilter.prototype._renderText =  function (oRM) {
		var sText = this.getText(),
			sCount = this.getCount(),
			bRTL = Localization.getRTL(),
			sTextDir = this.getTextDirection();

		oRM.openStart("span", this.getId() + "-text")
			.attr("dir", sTextDir !== TextDirection.Inherit ? sTextDir.toLowerCase() : "auto")
			.class("sapMText")
			.class("sapMTextNoWrap")
			.class("sapMITBText")
			.class("sapMITBBadgeHolder");


		var sTextAlign = Renderer.getTextAlign(TextAlign.Begin, sTextDir);
		if (sTextAlign) {
			oRM.style("text-align", sTextAlign);
		}

		if (sCount) {
			if (bRTL) {
				sText = '(' + sCount + ') ' + sText;
			} else {
				sText += ' (' + sCount + ')';
			}
		}

		oRM.openEnd()
			.text(sText)
			.close("span");
	};

	IconTabFilter.prototype._getSelectList = function () {
		if (!this._oSelectList) {
			this._oSelectList = new IconTabBarSelectList({
				selectionChange: function (oEvent) {
					var oTarget = oEvent.getParameter("selectedItem");
					this._oIconTabHeader.setSelectedItem(oTarget._getRealTab());
					this._oTabFilter._closePopover();
				}
			});
			this._oSelectList._oIconTabHeader = this.getParent();
			this._oSelectList._oTabFilter = this;
			this._oSelectList._bIsOverflow = this._isOverflow();
		}
		return this._oSelectList;
	};

	/**
	 * Sets the appropriate drag and drop event delegate
	 * based on whether or not the IconTabFilter is selectable.
	 *
	 * @private
	 */
	IconTabFilter.prototype._prepareDragEventDelegate = function () {

		if (this.getEnabled()) {
			this.addEventDelegate(this._oDragEventDelegate, this);
		} else {
			this.removeEventDelegate(this._oDragEventDelegate);
		}
	};

	IconTabFilter.prototype._updateTabCountText = function () {
		if (!this._isOverflow()) {
			return;
		}

		var iTabFilters = this._getIconTabHeader()
			._getItemsForOverflow(this._bIsStartOverflow, true)
			.filter(function (oItem) { return oItem.isA("sap.m.IconTabFilter"); })
			.length;

		this.setText("+" + iTabFilters);
	};

	/**
	 * Returns the expand button for this instance.
	 * This button is conditionally shown in the DOM
	 * based on whether or not the IconTabFilter is selectable.
	 * @private
	 */
	IconTabFilter.prototype._getExpandIcon = function () {
		this._oExpandIcon = this.getAggregation("_expandIcon");

		if (!this._oExpandIcon) {
			this._oExpandIcon = new Icon(this.getId() + "-expandIcon", {
				src: IconPool.getIconURI("slim-arrow-down"),
				tooltip: oResourceBundle.getText("ICONTABHEADER_OVERFLOW_MORE"),
				noTabStop: true,
				press: this._expandButtonPress.bind(this)
			}).addStyleClass("sapMITBFilterExpandIcon");

			this.setAggregation("_expandIcon", this._oExpandIcon);
		}

		return this._oExpandIcon;
	};

	/**
	 * Adds or hides badge.
	 */
	IconTabFilter.prototype._updateExpandButtonBadge = function () {
		var oExpandButtonBadge = this.getAggregation("_expandButtonBadge"),
			bHasBadge = oExpandButtonBadge.getBadgeCustomData() && oExpandButtonBadge.getBadgeCustomData().getVisible(),
			bAddBadge = this._hasChildWithBadge();

		if (bAddBadge && !bHasBadge) {
			oExpandButtonBadge.addCustomData(new BadgeCustomData({ visible: true }));
		} else if (!bAddBadge && bHasBadge) {
			oExpandButtonBadge.getBadgeCustomData().setVisible(false);
		}
	};

	IconTabFilter.prototype._hasChildWithBadge = function () {
		var aItems = this._isOverflow() ? this._getIconTabHeader()._getItemsForOverflow(this._bIsStartOverflow) : this._getAllSubItems();

		return aItems.some(function (oIT) {
			return oIT.isA("sap.m.IBadge") && oIT.getBadgeCustomData() && oIT.getBadgeCustomData().getVisible();
		});
	};

	/**
	 * Handles the expand button's "press" event
	 * @private
	 */
	IconTabFilter.prototype._expandButtonPress = function () {
		if (!this.getEnabled()) {
			return;
		}

		// prepare the next focus if the select list gets closed if no item was selected
		this.$().trigger("focus");

		if (!this._oPopover) {
			this._oPopover = new ResponsivePopover({
				showArrow: false,
				showHeader: false,
				offsetY: 0,
				offsetX: 0,
				placement: PlacementType.VerticalPreferredBottom
			}).addStyleClass("sapMITBFilterPopover");

			this._oPopover.attachAfterClose(function () {
				this._getSelectList().destroyItems();
			}, this);

			if (Device.system.phone) {
				this._oPopover._oControl.addButton(this._createPopoverCloseButton());
			}

			if (this._getIconTabHeader()._isInsideToolHeader()) {
				this._oPopover.addStyleClass("sapMITBFilterPopoverInToolHeader");
				this._oPopover.setOffsetY(POPOVER_OFFSET_Y_TOOL_HEADER);

				if (!Device.system.phone) {
					this._oPopover.addEventDelegate({
						onAfterRendering: function (oEvent) {
							this._oPopover.getDomRef().style.minWidth = this.$().outerWidth(true) + "px";
						}.bind(this)
					});
				}
			}

			this.addDependent(this._oPopover);

			this._oPopover._oControl._adaptPositionParams = function () {
				var bCompact = this.$().parents().hasClass("sapUiSizeCompact");
				this._arrowOffset = 0;
				if (bCompact) {
					this._offsets = ["0 0", "0 0", "0 4", "0 0"];
				} else {
					this._offsets = ["0 0", "0 0", "0 5", "0 0"];
				}
				this._atPositions = ["end top", "end top", "end bottom", "begin top"];
				this._myPositions = ["end bottom", "begin top", "end top", "end top"];
			};
		}

		var bHasSelectedItem = this._setSelectListItems();
		var oSelectList = this._getSelectList();

		this._oPopover.removeAllContent();

		if (this.getItems().length || this._isOverflow()) {
			this._oPopover.addContent(oSelectList);
			this._oPopover.setInitialFocus(bHasSelectedItem ? oSelectList.getSelectedItem() : oSelectList.getVisibleTabFilters()[0]);
			this._oPopover.openBy(this);
		}
	};

	/**
	 * Returns all the items of an IconTabFilter and its sub-items recursively.
	 *
	 * @private
	 * @returns {sap.m.IconTab[]} All sub items in the hierarchy
	 */
	IconTabFilter.prototype._getAllSubItems = function () {
		var aResult = [];

		this._getRealTab().getItems().forEach(function (oItem) {
			if (oItem.isA("sap.m.IconTabFilter")) {
				aResult = aResult.concat(oItem, oItem._getAllSubItems());
			} else {
				aResult = aResult.concat(oItem);
			}
		});

		return aResult;
	};

	/**
	 * Returns all the filters of an IconTabFilter and their sub-items recursively.
	 *
	 * @private
	 * @returns {sap.m.IconTabFilter[]} All sub items in the hierarchy
	 */
	IconTabFilter.prototype._getAllSubFilters = function () {
		return this._getAllSubItems().filter(function (oItem) {
			return oItem.isA("sap.m.IconTabFilter");
		});
	};

	IconTabFilter.prototype._getAllSubFiltersDomRefs = function () {
		return this._getAllSubFilters()
			.filter(function (oSubItem) { return Boolean(oSubItem._getRealTab().getDomRef()); })
			.map(function (oSubItem) { return oSubItem._getRealTab().getDomRef(); });
	};

	/**
	 * @private
	 * @returns {sap.m.IconTabFilter} Returns first available SubFilter that is visible and has content
	 */
	IconTabFilter.prototype._getFirstAvailableSubFilter = function () {
		var aItems = this._getAllSubFilters();
		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i];
			if (oItem.getContent().length && oItem.getVisible()) {
				return oItem;
			}
		}
		// no inner items available
		return this;
	};

	IconTabFilter.prototype._isParentOf = function (oChild) {
		var aChildren = this._getAllSubFilters();
		for (var i = 0; i < aChildren.length; i++) {
			if (aChildren[i]._getRealTab() === oChild) {
				return true;
			}
		}
		return false;
	};

	IconTabFilter.prototype._createPopoverCloseButton = function () {
		return new Button({
			text: oResourceBundle.getText("SELECT_CANCEL_BUTTON"),
			press: this._closePopover.bind(this)
		});
	};

	/**
	 * Closes the popover
	 * @private
	 */
	IconTabFilter.prototype._closePopover = function () {
		if (this._oPopover) {
			this._oPopover.close();
			this._oPopover.removeAllContent();
		}

		if (this._isOverflow() && this.getParent().oSelectedItem) {
			(this.getParent()._oSelectedRootItem || this.getParent().oSelectedItem._getRootTab()).$().trigger("focus");
		}
	};

	/** Handles onDragOver.
	 * @private
	 * @param {jQuery.Event} oEvent The jQuery drag over event
	 */
	IconTabFilter.prototype._handleOnDragOver = function (oEvent) {

		if (this._isDropPossible(oEvent)) {
			this.getDomRef().classList.add("sapMITHDragOver");
			oEvent.preventDefault(); // allow drop, so that the cursor is correct
		}
	};

	/** Handles onLongDragOver.
	 * @param {jQuery.Event} oEvent The jQuery long drag over event
	 * @private
	 */
	IconTabFilter.prototype._handleOnLongDragOver = function (oEvent) {
		if (this._isDropPossible(oEvent)) {
			if (this._oPopover && this._oPopover.isOpen()) {
				return;
			}

			this._expandButtonPress();
		}
	};

	/**
	 * Handles onDrop.
	 * @private
	 */
	IconTabFilter.prototype._handleOnDrop = function () {
		this.getDomRef().classList.remove("sapMITHDragOver");
	};

	/**
	 * Handles onDragLeave.
	 * @private
	 */
	IconTabFilter.prototype._handleOnDragLeave = function () {
		this.getDomRef().classList.remove("sapMITHDragOver");
	};

	/**
	 * Checks if the dragged item can be dropped as a sub item to this item.
	 * @private
	 */
	IconTabFilter.prototype._isDropPossible = function (oEvent) {
		var oIconTabHeader = this._getIconTabHeader(),
			oDragControl = oEvent.dragSession.getDragControl()._getRealTab(),
			oSelectedItem = oIconTabHeader.oSelectedItem;

		// disable DnD between different IconTabHeaders
		if (oIconTabHeader !== oDragControl._getIconTabHeader()) {
			return false;
		}

		// an item can't be dropped as a child item to itself
		if (oDragControl === this || oDragControl._isParentOf(this)) {
			return false;
		}

		if (!this._isOverflow() && !oIconTabHeader.getMaxNestingLevel()) {
			return false;
		}

		// disable dragging selected item to the overflow
		if (this._isOverflow() && oSelectedItem && (oSelectedItem === oDragControl || oSelectedItem._getRootTab() === oDragControl)) {
			return false;
		}

		return true;
	};

	/**
	 * Populates the IconTabBarSelectList with the context of this instance's items
	 *
	 * @returns {boolean} True if a there is selected item in the list, false if the list has no selected items
	 * @private
	 */
	IconTabFilter.prototype._setSelectListItems = function () {
		var oIconTabHeader = this.getParent(),
			oSelectList = this._getSelectList(),
			aItemsForList = this._getAllSubItems(),
			oPrevSelectedItem = oIconTabHeader.oSelectedItem,
			bHasSelectedItem = false,
			oItem,
			oListItem,
			aCustomData,
			i,
			iCustomDataItemIndex;

		if (this._isOverflow()) {
			aItemsForList = oIconTabHeader._getItemsForOverflow(this._bIsStartOverflow);
		}

		oSelectList.destroyItems();
		oSelectList.setSelectedItem(null);

		for (i = 0; i < aItemsForList.length; i++) {
			oItem = aItemsForList[i];
			oListItem = oItem.clone(undefined, undefined, { cloneChildren: false, cloneBindings: true });
			oItem._oCloneInList = oListItem;

			// clone all custom data
			aCustomData = oItem.getCustomData();
			for (iCustomDataItemIndex = 0; iCustomDataItemIndex < aCustomData.length; iCustomDataItemIndex++) {
				oListItem.addCustomData(aCustomData[iCustomDataItemIndex].clone());
			}

			oListItem._oRealItem = oItem; // link list item to its underlying item from the items aggregation
			oSelectList.addItem(oListItem);

			if (oItem.isA("sap.m.IconTabSeparator")) {
				continue;
			}

			if (oListItem._getRealTab() === oPrevSelectedItem) {
				oSelectList.setSelectedItem(oListItem);
				bHasSelectedItem = true;
				continue;
			}

			if (oListItem._getRealTab()._isParentOf(oPrevSelectedItem)) {
				oSelectList.setSelectedItem(oPrevSelectedItem._getRealTab());
				bHasSelectedItem = true;
			}
		}

		return bHasSelectedItem;
	};

	IconTabFilter.prototype._isOverflow = function () {
		return this._bIsOverflow || this._bIsStartOverflow;
	};

	/**
	 * Returns the IconTabHeader instance which holds all the TabFilters.
	 */
	IconTabFilter.prototype._getIconTabHeader = function () {
		return this._getRootTab().getParent();
	};

	IconTabFilter.prototype.onsapdown = function (oEvent) {
		if (!this.getEnabled()) {
			return;
		}

		if (this._isOverflow() ||
				((this._getNestedLevel() === 1 && this._getRealTab() === this) && this._getRealTab().getItems().length !== 0)) {

					oEvent.stopImmediatePropagation();
					this._expandButtonPress();
		}
	};

	IconTabFilter.prototype._startBadgeHiding = function () {
		if (this._iHideBadgeTimeout) {
			return;
		}

		this._iHideBadgeTimeout = setTimeout(this._hideBadge.bind(this), BADGE_AUTOHIDE_TIME);

		if (this._getRootTab() !== this) {
			this._getRootTab()._updateExpandButtonBadge();
		}
	};

	IconTabFilter.prototype._hideBadge = function () {
		var oBadgeCustomData = this.getBadgeCustomData();

		if (!oBadgeCustomData) {
			return;
		}

		oBadgeCustomData.setVisible(false);

		if (this._getRootTab() !== this) {
			this._getRootTab()._updateExpandButtonBadge();
		}

		if (this._oCloneInList && !this._oCloneInList.bIsDestroyed && this._oCloneInList.getBadgeCustomData()) {
			this._oCloneInList.getBadgeCustomData().setVisible(false);
			this._oCloneInList = null;
		}

		if (this._isInOverflow()) {
			this._getIconTabHeader()._getOverflow()._updateExpandButtonBadge();
		}
		if (this._isInStartOverflow()) {
			this._getIconTabHeader()._getStartOverflow()._updateExpandButtonBadge();
		}

		this._iHideBadgeTimeout = null;
	};

	/**
	 * Should be called only after rendering has completed.
	 * @returns {boolean} Whether the IconTabFilter is in the overflow menu.
	 */
	IconTabFilter.prototype._isInOverflow = function () {
		return !this._bIsOverflow && this._getIconTabHeader()._getItemsInStrip().indexOf(this._getRealTab()) === -1;
	};

	IconTabFilter.prototype._isInStartOverflow = function () {
		return !this._bIsStartOverflow && this._getIconTabHeader()._getItemsInStrip().indexOf(this._getRealTab()) === -1;
	};

	IconTabFilter.prototype.onBadgeUpdate = function (sValue, sState, sBadgeId) {

		var oDomRef = this.getDomRef(),
			oIconTabHeader = this._getIconTabHeader(),
			oRootTab,
			oInvisibleMessage,
			sAriaLabelledBy,
			sText,
			oOverflow,
			oStartOverflow,
			sRbKey,
			oRbArgs;

		if (!oIconTabHeader) {
			return;
		}

		if (oDomRef) {
			sAriaLabelledBy = oDomRef.getAttribute("aria-labelledby") || "";

			switch (sState) {
				case BadgeState.Appear:
					sAriaLabelledBy = sBadgeId + " " + sAriaLabelledBy;
					break;
				case BadgeState.Disappear:
					sAriaLabelledBy = sAriaLabelledBy.replace(sBadgeId, "").trim();
					break;
			}

			oDomRef.setAttribute("aria-labelledby", sAriaLabelledBy);
		}

		if (!oIconTabHeader._isRendered()) {
			return;
		}

		oRootTab = this._getRootTab();

		if (oRootTab._isInOverflow()) {
			oOverflow = this._getIconTabHeader()._getOverflow();
			oOverflow._updateExpandButtonBadge();
		}
		if (oRootTab._isInStartOverflow()) {
			oStartOverflow = this._getIconTabHeader()._getStartOverflow();
			oStartOverflow._updateExpandButtonBadge();
		} else if (oRootTab !== this) {
			oRootTab._updateExpandButtonBadge();
		}

		if (sState !== BadgeState.Appear) {
			return;
		}

		this._enableMotion();

		if ((this._isInOverflow() || this._isInStartOverflow()) && this._oCloneInList) {
			this._oCloneInList.addCustomData(new BadgeCustomData());
		}

		oInvisibleMessage = InvisibleMessage.getInstance();
		sText = this.getText();

		if (oRootTab._isInOverflow()) {
			sRbKey = "ICONTABFILTER_SUB_ITEM_BADGE";
			oRbArgs = [sText, oOverflow.getText()];
		}
		if (oRootTab._isInStartOverflow()) {
			sRbKey = "ICONTABFILTER_SUB_ITEM_BADGE";
			oRbArgs = [sText, oStartOverflow.getText()];
		} else {
			if (oRootTab !== this) {
				sRbKey = "ICONTABFILTER_SUB_ITEM_BADGE";
				oRbArgs = [sText, oRootTab.getText()];
			} else {
				sRbKey = "ICONTABFILTER_BADGE_MSG";
				oRbArgs = [sText];
			}
		}

		oInvisibleMessage.announce(oResourceBundle.getText(sRbKey, oRbArgs), InvisibleMessageMode.Assertive);
	};

	IconTabFilter.prototype.getAriaLabelBadgeText = function () {
		return oResourceBundle.getText("ICONTABFILTER_BADGE");
	};

	IconTabFilter.prototype._enableMotion = function () {
		if (this._getRealTab()._isInOverflow() || this._getRealTab()._isInStartOverflow()) {
			if (this._oCloneInList && this._oCloneInList.getDomRef()) {
				this._oCloneInList.getDomRef().classList.add("sapMITBFilterBadgeMotion");
			}
		} else if (this.getDomRef()) {
			this.getDomRef().classList.add("sapMITBFilterBadgeMotion");
		}
	};

	IconTabFilter.prototype._shouldReadIconColor = function () {
		var sIconColor = this.getIconColor();

		return this.getEnabled() &&
			(sIconColor === "Positive" || sIconColor === "Critical" || sIconColor === "Negative" || sIconColor === "Neutral");
	};

	return IconTabFilter;
});
