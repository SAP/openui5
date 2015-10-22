/*!
 * ${copyright}
 */

// Provides control sap.m.Breadcrumbs.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/ActionSelect",
	"sap/m/Button",
	"sap/ui/core/Item",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device"
], function (Control, Text, Link, Select, Button, Item, ItemNavigation, ResizeHandler, Device) {
	"use strict";

	/**
	 * Constructor for a new Breadcrumbs
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables users to navigate between items by providing a list of links to previous steps in the user's
	 * navigation path. The last three steps can be accessed as links directly The remaining links prior to them
	 * are available in a drop-down menu.
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
			properties: {

				/**
				 * Determines the text of current/last element in the Breadcrumbs path.
				 * @since 1.34
				 */
				currentLocationText: {type: "string", group: "Behavior", defaultValue: null}
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

	/*************************************** Framework lifecycle events ******************************************/

	Breadcrumbs.prototype.onBeforeRendering = function () {
		if (this._bControlsInfoCached) {
			this._updateSelect(true);
		}
	};

	Breadcrumbs.prototype.onAfterRendering = function () {
		if (!this._bControlsInfoCached) {
			this._updateSelect(true);
			return;
		}

		this._configureKeyboardHandling();
	};

	Breadcrumbs.prototype.exit = function () {
		this._resetControl();
		this._destroyItemNavigation();
	};

	/*************************************** Static members ******************************************/

	Breadcrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	Breadcrumbs._getResourceBundle = function () {
		return sap.ui.getCore().getLibraryResourceBundle("sap.m");
	};

	/*************************************** Internal aggregation handling  ******************************************/

	Breadcrumbs.prototype._getAugmentedId = function (sSuffix) {
		return this.getId() + "-" + sSuffix;
	};

	Breadcrumbs.prototype._getSelectButton = function () {
		if (!this._closeButton) {
			this._closeButton = new Button({
				id: this._getAugmentedId("closeButton"),
				text: Breadcrumbs._getResourceBundle().getText("BREADCRUMB_CLOSE"),
				press: this._selectCancelButtonHandler.bind(this),
				visible: Device.system.phone
			});
		}

		return this._closeButton;
	};

	Breadcrumbs.prototype._getSelect = function () {
		if (!this.getAggregation("_select")) {
			this.setAggregation("_select", this._decorateSelect(new Select({
				id: this._getAugmentedId("select"),
				change: this._selectChangeHandler.bind(this),
				forceSelection: false,
				autoAdjustWidth: true,
				icon: "sap-icon://slim-arrow-down",
				type: sap.m.SelectType.IconOnly,
				buttons: [this._getSelectButton()]
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

	Breadcrumbs.prototype.insertLink = function (oLink) {
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
	Breadcrumbs.prototype.removeLink = function (oLink) {
		this._deregisterControlListener(oLink);
		this._resetControl();
		return this.removeAggregation.apply(this, fnConvertArguments("links", arguments));
	};
	Breadcrumbs.prototype.removeAllLinks = function () {
		this.getAggregation("links").forEach(this._deregisterControlListener, this);
		this._resetControl();
		return this.removeAllAggregation.apply(this, fnConvertArguments("links", arguments));
	};

	Breadcrumbs.prototype.destroyLinks = function () {
		this.getAggregation("links").forEach(this._deregisterControlListener, this);
		this._resetControl();
		return this.destroyAggregation.apply(this, fnConvertArguments("links", arguments));
	};

	/*************************************** Select Handling ******************************************/

	Breadcrumbs.prototype._decorateSelect = function (oSelect) {
		oSelect.getPicker()
			.attachAfterOpen(this._removeItemNavigation, this)
			.attachBeforeClose(this._restoreItemNavigation, this);

		oSelect._onBeforeOpenDialog = this._onSelectBeforeOpen.bind(this);
		oSelect._onBeforeOpenPopover = this._onSelectBeforeOpen.bind(this);
		oSelect.onsapescape = this._onSelectEscPress.bind(this);

		return oSelect;
	};

	Breadcrumbs.prototype._removeItemNavigation = function () {
		this.removeDelegate(this._getItemNavigation());
	};

	Breadcrumbs.prototype._onSelectBeforeOpen = function () {
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

		if (!oSelectedItem) {
			return;
		}

		/* The select change event is fired every time a selection is made, in Icon mode (in which we're using it)
		 the user doesn't see this selection change and we shouldn't act on it */
		if (!this._getSelect().isOpen()) {
			return;
		}

		oLink = sap.ui.getCore().byId(oSelectedItem.getKey());
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

	Breadcrumbs.prototype._selectCancelButtonHandler = function () {
		this._getSelect().close();
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
			oSelect.removeAllItems();
			aControlsForSelect = Device.system.phone ? this.getLinks() : oControlsDistribution.aControlsForSelect;
			aControlsForSelect.map(this._createSelectItem).reverse().forEach(oSelect.insertItem, oSelect);
			this._bControlDistributionCached = true;
			this.invalidate(this);
		}

		oSelect.setVisible(!!oControlsDistribution.aControlsForSelect.length);

		if (!this._sResizeListenerId) {
			this._sResizeListenerId = ResizeHandler.register(this, this._handleScreenResize.bind(this));
		}
	};

	Breadcrumbs.prototype._getControlsForBreadcrumbTrail = function () {
		if (this._bControlDistributionCached && this._oDistributedControls) {
			return this._oDistributedControls.aControlsForBreadcrumbTrail;
		}
		if (this.getCurrentLocationText()) {
			return this.getLinks().concat([this._getCurrentLocation()]);
		}
		return this.getLinks();
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

	Breadcrumbs.prototype._determineControlDistribution = function (iMaxContentSize) {
		var index,
			oControlInfo,
			aControlInfo = this._getControlsInfo().aControlInfo,
			iSelectWidth = this._iSelectWidth,
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
	 * Stores the sizes and other info of controls so they don't need to be recalculated again until they change
	 * @private
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

		aItemsToNavigate.forEach(function (oItem, iIndex) {
			if (iIndex === 0) {
				oItem.$().attr("tabIndex", "0");
			}
			oItem.$().attr("tabIndex", "-1");
			aNavigationDomRefs.push(oItem.getDomRef());
		});

		this.addDelegate(oItemNavigation);
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

}, /* bExport= */ true);
