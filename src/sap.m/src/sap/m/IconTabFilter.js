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
	"./AccButton",
	"sap/m/Button",
	"sap/m/ResponsivePopover",
	"sap/m/IconTabBarSelectList",
	'sap/ui/Device'
], function (
	library,
	coreLibrary,
	Core,
	Item,
	Renderer,
	IconPool,
	InvisibleText,
	Control,
	AccButton,
	Button,
	ResponsivePopover,
	IconTabBarSelectList,
	Device
) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

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
			 * The sub icon tab bar filters (optional).
			 * @since 1.77
			 * @experimental As of 1.77
			 */
			items : {type : "sap.m.IconTabFilter", multiple : true, singularName : "item"},

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
	 * @type {sap.base.i18n.ResourceBundle}
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
		return this._tabFilter || this;
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
			oIconTabBar = oIconTabHeader.getParent(),
			bHasIconTabBar = oIconTabHeader._isInsideIconTabBar(),
			oRB = Core.getLibraryResourceBundle("sap.m"),
			mAriaParams = { role: "tab" },
			sId = this.getId(),
			sCount = this.getCount(),
			sText = this.getText(),
			oIcon = this.getIcon(),
			oIconColor = this.getIconColor(),
			bShouldReadIconColor = oIconColor === 'Positive' || oIconColor === 'Critical' || oIconColor === 'Negative',
			bHorizontalDesign = this.getDesign() === IconTabFilterDesign.Horizontal,
			bTextOnly = oIconTabHeader._bTextOnly,
			bInLine = oIconTabHeader._bInLine || oIconTabHeader.isInlineMode();

		if (bHasIconTabBar) {
			mAriaParams.controls = oIconTabBar.getId() + "-content";
		}

		if (this._getAllSubFilters().length) {
			mAriaParams.roledescription = oRB.getText("ICONTABFILTER_SPLIT_TAB");
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

		if (!this.getEnabled()) {
			oRM.class("sapMITBDisabled")
				.attr("aria-disabled", true);
		}

		oRM.attr("aria-selected", false);

		var sTooltip = this.getTooltip_AsString();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
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
						.text(oRB.getText('ICONTABBAR_ICONCOLOR_' + oIconColor.toUpperCase()))
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

			oRM.openEnd()
				.text(oIconTabHeader._getDisplayText(this))
				.close("div");
		}

		if (!bInLine && bHorizontalDesign) {
			oRM.close("div");
		}

		oRM.openStart("div").class("sapMITBContentArrow").openEnd().close("div");
		oRM.close("div");

		if (this.getItems() && this.getItems().length > 0) {
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
			oIconTabHeader = oSelectList._oIconTabHeader,
			oRB = Core.getLibraryResourceBundle('sap.m');

		if (oIconTabHeader) {
			bTextOnly = oIconTabHeader._bTextOnly;
		}

		oRM.openStart("li", this)
			.attr("tabindex", "-1")
			.attr("role", "treeitem");

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

		if (!this.getEnabled()) {
			oRM.class("sapMITBDisabled")
				.attr("aria-disabled", true);
		}

		oRM.class("sapMITBSelectItem");

		if (oSelectList.getSelectedItem() == this) {
			oRM.class("sapMITBSelectItemSelected");
			oRM.attr("aria-selected", true);
		}

		var oIconColor = this.getIconColor();
		oRM.class("sapMITBFilter" + oIconColor);


		var sItemId = this.getId(),
			bShouldReadIconColor = oIconColor == 'Positive' || oIconColor == 'Critical' || oIconColor == 'Negative',
			aLabelledByIds = [];

		if (!bIconOnly) {
			aLabelledByIds.push(sItemId + "-text");
		}

		if (!bTextOnly && this.getIcon()) {
			aLabelledByIds.push(sItemId + "-icon");
		}

		if (bShouldReadIconColor) {
			this._invisibleText = new InvisibleText({
				text: oRB.getText('ICONTABBAR_ICONCOLOR_' + oIconColor.toUpperCase())
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
	IconTabFilter.prototype._renderIcon =  function(oRM) {
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
					this.getParent().close();
				}
			});
			this._oSelectList._oIconTabHeader = this.getParent();
		}
		return this._oSelectList;
	};

	IconTabFilter.prototype._getExpandButton = function () {
		var oButton = this.getAggregation("_expandButton");
		if (!oButton) {
			oButton = new AccButton(this.getId() + "-expandButton", {
				type: ButtonType.Transparent,
				icon: IconPool.getIconURI("slim-arrow-down"),
				tooltip: "More",
				ariaHaspopup: "menu",
				tabIndex: "-1",
				press: this._expandButtonPress.bind(this)
			}).addStyleClass("sapMITBFilterExpandBtn");

			this.setAggregation("_expandButton", oButton);
		}

		return oButton;
	};

	/**
	 * Handles the expand button's "press" event
	 * @private
	 */
	IconTabFilter.prototype._expandButtonPress = function () {
		this.$().focus(); // prepare the next focus

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
		this._oPopover.addContent(oSelectList)
			.setInitialFocus(bHasSelectedItem ? oSelectList.getSelectedItem() : oSelectList.getItems()[0])
			.openBy(this._getExpandButton());
	};

	/**
	 * Returns all the items of an IconTabFilter and its sub-items recursively.
	 *
	 * @private
	 * @returns {sap.m.IconTabFilter[]|[]} All filters
	 */
	IconTabFilter.prototype._getAllSubFilters = function () {
		var aResult = [];

		this._getRealTab().getItems().forEach(function (oItem) {
			aResult = aResult.concat(oItem, oItem._getAllSubFilters());
		});

		return aResult;
	};

	IconTabFilter.prototype._getAllSubFiltersDomRefs = function () {
		return this._getAllSubFilters()
			.filter(function (oSubItem) { return Boolean(oSubItem._getRealTab().getDomRef()); })
			.map(function (oSubItem) { return oSubItem._getRealTab().getDomRef(); });
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
			press: this._closeOverflow.bind(this)
		});
	};

	/**
	 * Closes the tree popover
	 * @private
	 */
	IconTabFilter.prototype._closeOverflow = function () {
		if (this._oPopover) {
			this._oPopover.close();
			this._oPopover.destroyAllContent();
		}
	};

	IconTabFilter.prototype._setSelectListItems = function () {
		var oSelectList = this._getSelectList(),
			aSubFilters = this.getItems(),
			oPrevSelectedItem = this.getParent().oSelectedItem,
			bHasSelectedItem = false;

		oSelectList.destroyItems();
		oSelectList.setSelectedItem(null);
		for (var i = 0; i < aSubFilters.length; i++) {
			var oSubFilter = aSubFilters[i];

			var oListItem = oSubFilter.clone(undefined, undefined, { cloneChildren: false, cloneBindings: true });
			oListItem._tabFilter = oSubFilter; // link list item to its underlying tab filter

			oSelectList.addItem(oListItem);

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

	IconTabFilter.prototype.onsapdown = function (oEvent) {
		if ((this._getNestedLevel() === 1 && this._getRealTab() === this)
			&& this._getRealTab().getItems().length !== 0) {
				oEvent.stopImmediatePropagation();
				this._expandButtonPress();
		}
	};

	return IconTabFilter;
});