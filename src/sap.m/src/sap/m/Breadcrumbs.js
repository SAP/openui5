/*!
 * ${copyright}
 */

// Provides control sap.m.Breadcrumbs.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/m/library",
	"./BreadcrumbsRenderer"
], function(
	Control,
	Text,
	Link,
	Select,
	Item,
	ItemNavigation,
	ResizeHandler,
	IconPool,
	Device,
	library,
	BreadcrumbsRenderer
) {
	"use strict";

	// shortcut for sap.m.SelectType
	var SelectType = library.SelectType,

		// shortcut for sap.m.BreadCrumbsSeparatorStyle
		SeparatorStyle = library.BreadcrumbsSeparatorStyle;

	/**
	 * Constructor for a new <code>Breadcrumbs</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables users to navigate between items by providing a list of links to previous steps in the user's
	 * navigation path. The last three steps can be accessed as links directly, while the remaining links prior to them
	 * are available in a drop-down menu.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/breadcrumb/ Breadcrumbs}
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.Breadcrumbs
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 *
	 */
	var Breadcrumbs = Control.extend("sap.m.Breadcrumbs", {
		metadata: {
			library: "sap.m",
			interfaces: ["sap.m.IBreadcrumbs"],
			designtime: "sap/m/designtime/Breadcrumbs.designtime",
			properties: {

				/**
				 * Determines the text of current/last element in the Breadcrumbs path.
				 * @since 1.34
				 */
				currentLocationText: {type: "string", group: "Behavior", defaultValue: null},
				/**
				 * Determines the visual style of the separator between the <code>Breadcrumbs</code> elements.
				 * @since 1.69
				 */
				separatorStyle: {
					type: "sap.m.BreadcrumbsSeparatorStyle",
					group: "Appearance",
					defaultValue: SeparatorStyle.Slash
				}
			},
			aggregations: {

				/**
				 * A list of all the active link elements in the Breadcrumbs control.
				 * <b>Note:</b> Enabling the property <code>wrapping</code> of the link will not work
				 * since it's incompatible with the concept of the control.
				 * The other properties will work, but their effect may be undesirable.
				 * @since 1.34
				 */
				links: {type: "sap.m.Link", multiple: true, singularName: "link"},

				/**
				 * Private aggregations
				 */
				_currentLocation: {type: "sap.m.Text", multiple: false, visibility: "hidden"},
				_select: {type: "sap.m.Select", multiple: false, visibility: "hidden"}
			},
			defaultAggregation: "links"
		}
	});

	/**
	 * STATIC MEMBERS
	 */

	Breadcrumbs.STYLE_MAPPER = {
		Slash: "&#047;",
		BackSlash: "&#092;",
		DoubleSlash: "&#047;&#047;",
		DoubleBackSlash: "&#092;&#092;",
		GreaterThan: "&gt;",
		DoubleGreaterThan: "&#187;"
	};

	/*************************************** Framework lifecycle events ******************************************/

	Breadcrumbs.prototype.init = function () {
		this._sSeparatorSymbol = Breadcrumbs.STYLE_MAPPER[this.getSeparatorStyle()];
	};

	Breadcrumbs.prototype.onBeforeRendering = function () {
		this.bRenderingPhase = true;

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		if (this._bControlsInfoCached) {
			this._updateSelect(true);
		}
	};

	Breadcrumbs.prototype.onAfterRendering = function () {
		if (!this._sResizeListenerId) {
			this._sResizeListenerId = ResizeHandler.register(this, this._handleScreenResize.bind(this));
		}

		if (!this._bControlsInfoCached) {
			this._updateSelect(true);
			return;
		}

		this._configureKeyboardHandling();

		this.bRenderingPhase = false;
	};

	Breadcrumbs.prototype.onThemeChanged = function () {
		this._resetControl();
	};

	Breadcrumbs.prototype.exit = function () {
		this._resetControl();
		this._destroyItemNavigation();
	};

	/*************************************** Static members ******************************************/

	Breadcrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	/*************************************** Internal aggregation handling  ******************************************/

	Breadcrumbs.prototype._getAugmentedId = function (sSuffix) {
		return this.getId() + "-" + sSuffix;
	};

	Breadcrumbs.prototype._getSelect = function () {
		if (!this.getAggregation("_select")) {
			this.setAggregation("_select", this._decorateSelect(new Select({
				id: this._getAugmentedId("select"),
				change: this._selectChangeHandler.bind(this),
				forceSelection: false,
				autoAdjustWidth: true,
				icon: IconPool.getIconURI("slim-arrow-down"),
				type: SelectType.IconOnly,
				tooltip: BreadcrumbsRenderer._getResourceBundleText("BREADCRUMB_SELECT_TOOLTIP")
			})));
		}
		return this.getAggregation("_select");
	};

	Breadcrumbs.prototype._getCurrentLocation = function () {
		if (!this.getAggregation("_currentLocation")) {
			this.setAggregation("_currentLocation", new Text({
				id: this._getAugmentedId("currentText"),
				text: this.getCurrentLocationText(),
				wrapping: false
			}).addStyleClass("sapMBreadcrumbsCurrentLocation"));
		}
		return this.getAggregation("_currentLocation");
	};

	function fnConvertArguments(sAggregationName, aArguments) {
		var aConvertedArguments = Array.prototype.slice.apply(aArguments);
		aConvertedArguments.unshift(sAggregationName);
		return aConvertedArguments;
	}

	Breadcrumbs.prototype.insertLink = function (oLink, iIndex) {
		var vResult = this.insertAggregation.apply(this, fnConvertArguments("links", arguments));
		this._registerControlListener(oLink);
		this._resetControl();
		return vResult;
	};

	Breadcrumbs.prototype.addLink = function (oLink) {
		var vResult = this.addAggregation.apply(this, fnConvertArguments("links", arguments));
		this._registerControlListener(oLink);
		this._resetControl();
		return vResult;
	};

	Breadcrumbs.prototype.removeLink = function (vObject) {
		var vResult = this.removeAggregation.apply(this, fnConvertArguments("links", arguments));
		this._deregisterControlListener(vResult);
		this._resetControl();
		return vResult;
	};

	Breadcrumbs.prototype.removeAllLinks = function () {
		var aLinks = this.getAggregation("links", []);
		var vResult = this.removeAllAggregation.apply(this, fnConvertArguments("links", arguments));
		aLinks.forEach(this._deregisterControlListener, this);
		this._resetControl();
		return vResult;
	};

	Breadcrumbs.prototype.destroyLinks = function () {
		var aLinks = this.getAggregation("links", []);
		var vResult = this.destroyAggregation.apply(this, fnConvertArguments("links", arguments));
		aLinks.forEach(this._deregisterControlListener, this);
		this._resetControl();
		return vResult;
	};

	/*************************************** Select Handling ******************************************/

	Breadcrumbs.prototype._decorateSelect = function (oSelect) {
		oSelect.getPicker()
			.attachAfterOpen(this._removeItemNavigation, this)
			.attachBeforeClose(this._restoreItemNavigation, this);

		oSelect._onBeforeOpenDialog = this._onSelectBeforeOpenDialog.bind(this);
		oSelect._onBeforeOpenPopover = this._onSelectBeforeOpenPopover.bind(this);
		oSelect.onsapescape = this._onSelectEscPress.bind(this);

		return oSelect;
	};

	Breadcrumbs.prototype._removeItemNavigation = function () {
		this.removeDelegate(this._getItemNavigation());
	};

	Breadcrumbs.prototype._onSelectBeforeOpenDialog = function () {
		var oSelect = this._getSelect();

		if (this.getCurrentLocationText() && Device.system.phone) {
			oSelect.setSelectedIndex(0);
		} else {
			oSelect.setSelectedItem(null);
		}

		Select.prototype._onBeforeOpenDialog.call(oSelect);
		this._removeItemNavigation();
	};

	Breadcrumbs.prototype._onSelectBeforeOpenPopover = function () {
		this._getSelect().setSelectedItem(null);
		this._removeItemNavigation();
	};

	Breadcrumbs.prototype._restoreItemNavigation = function () {
		this.addDelegate(this._getItemNavigation());
	};

	Breadcrumbs.prototype._onSelectEscPress = function () {
		this._getSelect().close();
	};

	/**
	 * Retrieves selected item item using an sap.m.Link or sap.m.Text
	 *
	 * @param {control} oItem
	 * @returns {sap.ui.core.Item}
	 * @private
	 */
	Breadcrumbs.prototype._createSelectItem = function (oItem) {
		return new Item({
			key: oItem.getId(),
			text: oItem.getText()
		});
	};

	/**
	 * Handles the "select" event
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Breadcrumbs.prototype._selectChangeHandler = function (oEvent) {
		var oLink,
			sLinkHref,
			sLinkTarget,
			oSelectedItem = oEvent.getParameter("selectedItem");

		/* there's no selected item, nothing to do in this case (the selected item is often set to null) */
		if (!oSelectedItem) {
			return;
		}

		/* The select change event is fired every time a selection is made, in Icon mode (in which we're using it)
		 the user doesn't see this selection change and we shouldn't act on it */
		if (!this._getSelect().isOpen()) {
			return;
		}

		oLink = sap.ui.getCore().byId(oSelectedItem.getKey());

		/* if it's not a link, then it must be only the current location text, we shouldn't do anything */
		if (!(oLink instanceof Link)) {
			return;
		}

		sLinkHref = oLink.getHref();
		sLinkTarget = oLink.getTarget();

		oLink.firePress();

		if (sLinkHref) {
			if (sLinkTarget) {
				window.open(sLinkHref, sLinkTarget);
			} else {
				window.location.href = sLinkHref;
			}
		}
	};

	Breadcrumbs.prototype._getItemsForMobile = function () {
		var oItems = this.getLinks();

		if (this.getCurrentLocationText()) {
			oItems.push(this._getCurrentLocation());
		}

		return oItems;
	};

	/**
	 * Updates the select with the current "distribution" of controls.
	 *
	 * @private
	 * @param {boolean} bInvalidateDistribution
	 */
	Breadcrumbs.prototype._updateSelect = function (bInvalidateDistribution) {
		var oSelect = this._getSelect(),
			aControlsForSelect,
			oControlsDistribution = this._getControlDistribution();

		if (!this._bControlDistributionCached || bInvalidateDistribution) {
			oSelect.destroyItems();
			aControlsForSelect = Device.system.phone ? this._getItemsForMobile() : oControlsDistribution.aControlsForSelect;
			aControlsForSelect.map(this._createSelectItem).reverse().forEach(oSelect.insertItem, oSelect);
			this._bControlDistributionCached = true;
			this.invalidate(this);
		}

		oSelect.setVisible(!!oControlsDistribution.aControlsForSelect.length);

		if (!this._sResizeListenerId && !this.bRenderingPhase) {
			this._sResizeListenerId = ResizeHandler.register(this, this._handleScreenResize.bind(this));
		}
	};

	Breadcrumbs.prototype._getControlsForBreadcrumbTrail = function () {
		var aVisibleControls;

		if (this._bControlDistributionCached && this._oDistributedControls) {
			return this._oDistributedControls.aControlsForBreadcrumbTrail;
		}

		aVisibleControls = this.getLinks().filter(function (oLink) { return oLink.getVisible(); });

		if (this.getCurrentLocationText()) {
			return aVisibleControls.concat([this._getCurrentLocation()]);
		}
		return aVisibleControls;
	};

	Breadcrumbs.prototype._getControlInfo = function (oControl) {
		return {
			id: oControl.getId(),
			control: oControl,
			width: oControl.$().parent().outerWidth(true),
			bCanOverflow: oControl instanceof Link
		};
	};

	Breadcrumbs.prototype._getControlDistribution = function (iMaxContentSize) {
		iMaxContentSize = iMaxContentSize || this._iContainerSize;
		this._iContainerSize = iMaxContentSize;
		this._oDistributedControls = this._determineControlDistribution(iMaxContentSize);
		return this._oDistributedControls;
	};

	Breadcrumbs.prototype._getSelectWidth = function() {
		return this._getSelect().getVisible() && this._iSelectWidth || 0;
	};

	Breadcrumbs.prototype._determineControlDistribution = function (iMaxContentSize) {
		var index,
			oControlInfo,
			aControlInfo = this._getControlsInfo().aControlInfo,
			iSelectWidth = this._getSelectWidth(),
			aControlsForSelect = [],
			aControlsForBreadcrumbTrail = [],
			iUsedSpace = iSelectWidth; // account for the selectWidth initially;

		// The rightmost controls should go into overflow first, hence iterating the controls in reverse
		for (index = aControlInfo.length - 1; index >= 0; index--) {
			oControlInfo = aControlInfo[index];
			iUsedSpace += oControlInfo.width;

			// put the last item of the array in the breadcrumb trail
			if (aControlInfo.length - 1 === index) {
				aControlsForBreadcrumbTrail.push(oControlInfo.control);
				continue;
			}

			// we've reached the last item and we've not used a select then we will not need to take it into account
			if (index === 0) {
				iUsedSpace -= iSelectWidth;
			}

			if (iUsedSpace > iMaxContentSize && oControlInfo.bCanOverflow) {
				aControlsForSelect.unshift(oControlInfo.control);
			} else {
				aControlsForBreadcrumbTrail.unshift(oControlInfo.control);
			}
		}

		return {
			aControlsForBreadcrumbTrail: aControlsForBreadcrumbTrail,
			aControlsForSelect: aControlsForSelect
		};
	};

	/**
	 * Stores the sizes and other info of controls so they don't need to be recalculated again until they change.
	 * @private
	 * @returns {Object} The <code>Breadcrumbs</code> control information
	 */
	Breadcrumbs.prototype._getControlsInfo = function () {
		if (!this._bControlsInfoCached) {
			this._iSelectWidth = this._getSelect().$().parent().outerWidth(true) || 0;
			this._aControlInfo = this._getControlsForBreadcrumbTrail().map(this._getControlInfo);
			this._iContainerSize = this.$().outerWidth(true);
			this._bControlsInfoCached = true;
		}

		return {
			aControlInfo: this._aControlInfo,
			iSelectWidth: this._iSelectWidth,
			iContentSize: this._iContainerSize
		};
	};

	/**
	 * Handles the resize event of the Breadcrumbs control container
	 *
	 * @param {jQuery.Event} oEvent
	 * @returns {object} this
	 * @private
	 */
	Breadcrumbs.prototype._handleScreenResize = function (oEvent) {
		var iCachedControlsForBreadcrumbTrailCount = this._oDistributedControls.aControlsForBreadcrumbTrail.length,
			oControlsDistribution = this._getControlDistribution(oEvent.size.width),
			iCalculatedControlsForBreadcrumbTrailCount = oControlsDistribution.aControlsForBreadcrumbTrail.length;

		if (iCachedControlsForBreadcrumbTrailCount !== iCalculatedControlsForBreadcrumbTrailCount) {
			this._updateSelect(true);
		}

		return this;
	};

	/**
	 * Retrieves the items which should be included in navigation.
	 *
	 * @private
	 * @returns {array} aItemsToNavigate
	 */
	Breadcrumbs.prototype._getItemsToNavigate = function () {
		var aItemsToNavigate = this._getControlsForBreadcrumbTrail().slice(),
			oSelect = this._getSelect();

		if (oSelect.getVisible()) {
			aItemsToNavigate.unshift(oSelect);
		}

		return aItemsToNavigate;
	};

	Breadcrumbs.prototype._getItemNavigation = function () {
		if (!this._itemNavigation) {
			this._itemNavigation = new ItemNavigation();
		}

		return this._itemNavigation;
	};

	Breadcrumbs.prototype._destroyItemNavigation = function () {
		if (this._itemNavigation) {
			this.removeEventDelegate(this._itemNavigation);
			this._itemNavigation.destroy();
			this._itemNavigation = null;
		}
	};

	/**
	 * Configures the Keyboard handling for the control
	 *
	 * @private
	 * @returns {object} this
	 */
	Breadcrumbs.prototype._configureKeyboardHandling = function () {
		var oItemNavigation = this._getItemNavigation(),
			iSelectedDomIndex = -1,
			aItemsToNavigate = this._getItemsToNavigate(),
			aNavigationDomRefs = [];

		if (aItemsToNavigate.length === 0) {
			return;
		}

		aItemsToNavigate.forEach(function (oItem, iIndex) {
			if (iIndex === 0) {
				oItem.$().attr("tabindex", "0");
			}
			oItem.$().attr("tabindex", "-1");
			aNavigationDomRefs.push(oItem.getDomRef());
		});

		this.addDelegate(oItemNavigation);
		oItemNavigation.setDisabledModifiers({
			sapnext : ["alt"],
			sapprevious : ["alt"],
			saphome : ["alt"],
			sapend : ["alt"]
		});
		oItemNavigation.setCycling(false);
		oItemNavigation.setPageSize(Breadcrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE);
		oItemNavigation.setRootDomRef(this.getDomRef());
		oItemNavigation.setItemDomRefs(aNavigationDomRefs);
		oItemNavigation.setSelectedIndex(iSelectedDomIndex);
		return this;
	};

	/**
	 * Every time a control is inserted in the breadcrumb, it must be monitored for size/visibility changes
	 * @param oControl
	 * @private
	 */
	Breadcrumbs.prototype._registerControlListener = function (oControl) {
		if (oControl) {
			oControl.attachEvent("_change", this._resetControl, this);
		}
	};

	/**
	 * Each time a control is removed from the breadcrumb, detach listeners
	 * @param oControl
	 * @private
	 */
	Breadcrumbs.prototype._deregisterControlListener = function (oControl) {
		if (oControl) {
			oControl.detachEvent("_change", this._resetControl, this);
		}
	};

	Breadcrumbs.prototype.setCurrentLocationText = function (sText) {
		var oCurrentLocation = this._getCurrentLocation(),
			vResult = this.setProperty("currentLocationText", sText, true);

		if (oCurrentLocation.getText() !== sText) {
			oCurrentLocation.setText(sText);
			this._resetControl();
		}

		return vResult;
	};

	/**
	* Custom setter for the <code>Breadcrumbs</code> separator style.
	*
	* @returns {object} this
	* @param {string} sSeparatorStyle
	* @public
	* @since 1.71
	*/
	Breadcrumbs.prototype.setSeparatorStyle = function (sSeparatorStyle) {
		var sSeparatorSymbol = Breadcrumbs.STYLE_MAPPER[sSeparatorStyle];
		if (!sSeparatorSymbol){
			return this;
		}

		this._sSeparatorSymbol = sSeparatorSymbol;
		return this.setProperty("separatorStyle", sSeparatorStyle);
	};

	/**
	 * Resets all of the internally cached values used by the control and invalidates it
	 *
	 * @returns {object} this
	 * @private
	 */
	Breadcrumbs.prototype._resetControl = function () {
		this._aControlInfo = null;
		this._iContainerSize = null;
		this._bControlsInfoCached = null;
		this._bControlDistributionCached = null;
		this._oDistributedControls = null;

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}

		this.removeDelegate(this._getItemNavigation());
		this.invalidate(this);
		return this;
	};

	return Breadcrumbs;

});
