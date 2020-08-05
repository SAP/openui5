/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabFilter.
sap.ui.define([
	"./library",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/core/Item",
	"sap/ui/core/Renderer",
	"sap/ui/core/IconPool",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Control",
	'sap/ui/Device',
	"./AccButton",
	"sap/m/Button",
	"sap/m/ResponsivePopover",
	"sap/m/IconTabBarSelectList"
], function (
	library,
	coreLibrary,
	Core,
	Item,
	Renderer,
	IconPool,
	InvisibleText,
	Control,
	Device,
	AccButton,
	Button,
	ResponsivePopover,
	IconTabBarSelectList
) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = library.IconTabFilterDesign;

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;

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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabFilter = Item.extend("sap.m.IconTabFilter", /** @lends sap.m.IconTabFilter.prototype */ { metadata : {

		interfaces : [
			"sap.m.IconTab",
			// The IconTabBar doesn't have renderer. The sap.ui.core.PopupInterface is used to indicate
			// that the IconTabFilter content is not rendered by the IconTabFilter, it is rendered by IconTabBar.
			"sap.ui.core.PopupInterface"
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
			design : {type : "sap.m.IconTabFilterDesign", group : "Appearance", defaultValue : IconTabFilterDesign.Vertical}
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
			 * @experimental As of 1.77
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item"},

			/**
			 * The expand icon if there are sub filters
			 * @since 1.77
			 */
			_expandButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"}
		}
	}});

	/**
	 * Library internationalization resource bundle.
	 *
	 * @type {module:sap/base/i18n/ResourceBundle}
	 */
	var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

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

		if (this._invisibleText) {
			this._invisibleText.destroy();
			this._invisibleText = null;
		}

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}

		if (this._oExpandButton) {
			this._oExpandButton.removeEventDelegate(this._oDragEventDelegate);
			this._oExpandButton.destroy();
			this._oExpandButton = null;
		}

		this.removeEventDelegate(this._oDragEventDelegate);
		this._oDragEventDelegate = null;
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

		if (!(oIconTabBar instanceof sap.m.IconTabBar)) {
			oIconTabHeader.invalidate();
			return;
		}

		oObjectHeader = oIconTabBar.getParent();

		if (oObjectHeader instanceof sap.m.ObjectHeader) {
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
			case 'enabled':
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
				Control.prototype.setProperty.call(this, sPropertyName, oValue, true);
				if (!bSuppressInvalidate) {
					var oIconTabHeader = this.getParent();
					if (oIconTabHeader instanceof sap.m.IconTabHeader) {
						oIconTabHeader.invalidate();
					}
				}
				break;
			default:
				Control.prototype.setProperty.apply(this, arguments);
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

		this._prepareDragEventDelegate();

		var oIconTabHeader = this.getParent(),
			oIconTabBar = oIconTabHeader.getParent(),
			bHasIconTabBar = oIconTabHeader._isInsideIconTabBar(),
			mAriaParams = { role: "tab" },
			sId = this.getId(),
			sCount = this.getCount(),
			sText = this.getText(),
			oIcon = this.getIcon(),
			oIconColor = this.getIconColor(),
			bShouldReadIconColor = oIconColor === 'Positive' || oIconColor === 'Critical' || oIconColor === 'Negative' || oIconColor === 'Neutral',
			bHorizontalDesign = this.getDesign() === IconTabFilterDesign.Horizontal,
			bTextOnly = oIconTabHeader._bTextOnly,
			bInLine = oIconTabHeader._bInLine || oIconTabHeader.isInlineMode();

		if (bHasIconTabBar) {
			mAriaParams.controls = oIconTabBar.getId() + "-content";
		}

		if (this.getItems().length) {
			mAriaParams.roledescription = oResourceBundle.getText("ICONTABFILTER_SPLIT_TAB");
		}

		if (sText.length ||
			sCount !== "" ||
			oIcon) {

			var aId = [];

			if (sCount !== "") {
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

		if (this.getShowAll()) {
			oRM.class("sapMITBAll");
		} else {
			oRM.class("sapMITBFilter")
				.class("sapMITBFilter" + oIconColor);
		}

		if (oIconTabHeader._isUnselectable(this)) {
			oRM.class("sapMITHUnselectable");
		}

		if (this.getItems().length > 0) {
			oRM.class("sapMITBFilterWithItems");
		}

		if (!this.getEnabled()) {
			oRM.class("sapMITBDisabled")
				.attr("aria-disabled", true);
		}

		oRM.attr("aria-selected", false);

		var sTooltip = this.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		if (this._bIsOverflow || this.getItems().length) {
			oRM.attr("aria-haspopup", "menu");
		}

		oRM.openEnd();

		oRM.openStart("div")
			.class("sapMITBFilterWrapper")
			.openEnd();

		if (!bInLine) {
			oRM.openStart("div", sId + "-tab")
				.class("sapMITBTab")
				.openEnd();

			if (!this.getShowAll() || !oIcon) {
				if (bShouldReadIconColor) {
					oRM.openStart("div", sId + "-iconColor")
						.style("display", "none")
						.openEnd()
						.text(oResourceBundle.getText('ICONTABBAR_ICONCOLOR_' + oIconColor.toUpperCase()))
						.close("div");
				}

				oRM.renderControl(this._getImageControl(['sapMITBFilterIcon', 'sapMITBFilter' + oIconColor], oIconTabHeader, IconTabFilter._aAllIconColors));
			}

			if (!this.getShowAll() && !oIcon && !bTextOnly) {
				oRM.openStart("span").class("sapMITBFilterNoIcon").openEnd().close("span");
			}

			if (bHorizontalDesign && !this.getShowAll()) {
				oRM.close("div");

				oRM.openStart("div")
					.class("sapMITBHorizontalWrapper")
					.openEnd();
			}

			oRM.openStart("span", sId + "-count")
				.class("sapMITBCount")
				.openEnd();

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

			// Check for upperCase property on IconTabBar
			if (bHasIconTabBar && oIconTabBar.getUpperCase()) {
				oRM.class("sapMITBTextUpperCase");
			}

			if (bInLine) {
				oRM.attr("dir", "ltr");
			}

			oRM.openEnd();
			oRM.openStart("span").class("sapMITHTextContent").openEnd().text(oIconTabHeader._getDisplayText(this));
			oRM.close("span");

			if (this._bIsOverflow || this.getItems().length && oIconTabHeader._isUnselectable(this)) {
				oRM.openStart("span", this.getId() + "-expandButton").class("sapMITHShowSubItemsIcon").openEnd();
				oRM.icon(IconPool.getIconURI("slim-arrow-down"), [], {title: oResourceBundle.getText("ICONTABHEADER_OVERFLOW_MORE")});
				oRM.close("span");
			}

			oRM.close("div");
		}

		if (!bInLine && bHorizontalDesign) {
			oRM.close("div");
		}

		oRM.openStart("div").class("sapMITBContentArrow").openEnd().close("div");
		oRM.close("div");

		if (this.getItems().length && !oIconTabHeader._isUnselectable(this)) {
			oRM.openStart("span")
				.accessibilityState({ role: "separator" })
				.openEnd()
			.close("span");

			oRM.renderControl(this._getExpandButton());
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
		if (this._invisibleText) {
			this._invisibleText.destroy();
			this._invisibleText = null;
		}

		if (!this.getVisible()) {
			return;
		}

		var bTextOnly = true,
			bIconOnly = oSelectList._bIconOnly,
			oIconTabHeader = oSelectList._oIconTabHeader;

		if (oIconTabHeader) {
			bTextOnly = oIconTabHeader._bTextOnly;
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
			oRM.attr("aria-level", this._getNestedLevel());
		}

		var sTooltip = this.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		if (oIconTabHeader._isUnselectable(this)) {
			oRM.class("sapMITHUnselectable");
		}

		if (!this.getEnabled()) {
			oRM.class("sapMITBDisabled")
				.attr("aria-disabled", true);
		}


		if (oSelectList.getSelectedItem() == this) {
			oRM.class("sapMITBSelectItemSelected");
			oRM.attr("aria-selected", true);
		}

		var oIconColor = this.getIconColor();
		oRM.class("sapMITBFilter" + oIconColor);


		var sItemId = this.getId(),
			bShouldReadIconColor = oIconColor == 'Positive' || oIconColor == 'Critical' || oIconColor == 'Negative' || oIconColor == 'Neutral',
			aLabelledByIds = [];

		if (!bIconOnly) {
			aLabelledByIds.push(sItemId + "-text");
		}

		if (!bTextOnly && this.getIcon()) {
			aLabelledByIds.push(sItemId + "-icon");
		}

		if (bShouldReadIconColor) {
			this._invisibleText = new InvisibleText({
				text: oResourceBundle.getText('ICONTABBAR_ICONCOLOR_' + oIconColor.toUpperCase())
			});

			aLabelledByIds.push(this._invisibleText.getId());
		}

		oRM.accessibilityState({ labelledby: aLabelledByIds.join(" ") })
			.openEnd();

		if (this._invisibleText) {
			oRM.renderControl(this._invisibleText);
		}

		if (!bTextOnly) {
			this._renderIcon(oRM);
		}

		if (!bIconOnly) {
			this._renderText(oRM);
		}
		oRM.close("li");
	};

	/**
	 * Renders an icon.
	 * @private
	 */
	IconTabFilter.prototype._renderIcon = function (oRM) {
		var oIcon = this.getIcon();
		if (oIcon) {
			var oIconInfo = IconPool.getIconInfo(oIcon),
				aClasses = ["sapMITBSelectItemIcon"];

			if (oIconInfo && !oIconInfo.suppressMirroring) {
				aClasses.push("sapUiIconMirrorInRTL");
			}

			oRM.icon(oIcon, aClasses, {
				id: this.getId() + "-icon",
				"aria-hidden": true
			});
		} else {
			oRM.openStart("span").class("sapUiIcon").openEnd().close("span");
		}
	};

	/**
	 * Renders a text.
	 * @private
	 */
	IconTabFilter.prototype._renderText =  function (oRM) {
		var sText = this.getText(),
			sCount = this.getCount(),
			bRTL = Core.getConfiguration().getRTL(),
			sTextDir = this.getTextDirection();

		oRM.openStart("span", this.getId() + "-text")
			.attr("dir", "ltr")
			.class("sapMText")
			.class("sapMTextNoWrap")
			.class("sapMITBText");

		if (sTextDir !== TextDirection.Inherit){
			oRM.attr('dir', sTextDir.toLowerCase());
		}

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
		}
		return this._oSelectList;
	};

	/**
	 * Sets the appropriate drag and drop event delegate
	 * based on whether or not the IconTabFilter is unselectable.
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

	/**
	 * Returns the expand button for this instance.
	 * This button is conditionally shown in the DOM
	 * based on whether or not the IconTabFilter is unselectable.
	 * @private
	 */
	IconTabFilter.prototype._getExpandButton = function () {
		this._oExpandButton = this.getAggregation("_expandButton");

		if (!this._oExpandButton) {
			this._oExpandButton = new AccButton(this.getId() + "-expandButton", {
				type: ButtonType.Transparent,
				icon: IconPool.getIconURI("slim-arrow-down"),
				tooltip: oResourceBundle.getText("ICONTABHEADER_OVERFLOW_MORE"),
				tabIndex: "-1",
				press: this._expandButtonPress.bind(this)
			}).addStyleClass("sapMITBFilterExpandBtn");

			this.setAggregation("_expandButton", this._oExpandButton);
		}

		return this._oExpandButton;
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

			this._oPopover.attachBeforeClose(function () {
				this._getSelectList().destroyItems();
			}, this);

			if (Device.system.phone) {
				this._oPopover._oControl.addButton(this._createPopoverCloseButton());
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

		if (this.getItems().length || this._bIsOverflow) {
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

		if (this._bIsOverflow && this.getParent().oSelectedItem) {
			(this.getParent()._oSelectedRootItem || this.getParent().oSelectedItem).$().focus();
		}
	};


	/** Handles onDragOver.
	* @private
	* @param {jQuery.Event} oEvent The jQuery drag over event
	*/
	IconTabFilter.prototype._handleOnDragOver = function (oEvent) {
		if (!this._bIsOverflow && !this._getIconTabHeader().getMaxNestingLevel()) {
			return;
		}
		this.getDomRef().classList.add("sapMITHDragOver");
		oEvent.preventDefault(); // allow drop, so that the cursor is correct
	};

	/** Handles onLongDragOver.
	* @private
	*/
	IconTabFilter.prototype._handleOnLongDragOver = function () {
		if (!this._bIsOverflow && !this._getIconTabHeader().getMaxNestingLevel()) {
			return;
		}

		if (this._oPopover && this._oPopover.isOpen()) {
			return;
		}

		this._expandButtonPress();
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
			oItem;

		if (this._bIsOverflow) {
			var aHeaderItems = oIconTabHeader.getItems();
			var aItemsInStrip = oIconTabHeader._getItemsInStrip();
			aItemsForList = [];

			aHeaderItems.forEach(function (oItem) {
				// If tab is an overflow tab and oItem is already in Tab Strip, do not add it to list
				// on a mobile device, this behaviour doesn't occur, and all items are shown
				if (!Device.system.phone && aItemsInStrip.indexOf(oItem) > -1) {
					return;
				}

				aItemsForList.push(oItem);
				if (oItem.isA("sap.m.IconTabFilter")) {
					oItem._getAllSubItems().forEach(function (oSubItem) {
						aItemsForList.push(oSubItem);
					});
				}
			});
		}

		oSelectList.destroyItems();
		oSelectList.setSelectedItem(null);

		for (var i = 0; i < aItemsForList.length; i++) {
			oItem = aItemsForList[i];
			var oListItem = oItem.clone(undefined, undefined, { cloneChildren: false, cloneBindings: true });
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

		if (this._bIsOverflow ||
				((this._getNestedLevel() === 1 && this._getRealTab() === this) && this._getRealTab().getItems().length !== 0)) {

					oEvent.stopImmediatePropagation();
					this._expandButtonPress();
		}
	};

	return IconTabFilter;
});
