/*!
 * ${copyright}
 */

// Provides control sap.m.Breadcrumbs.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dom/units/Rem",
	"sap/ui/core/theming/Parameters",
	"sap/ui/util/openWindow",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"sap/m/library",
	"./BreadcrumbsRenderer",
	'sap/ui/base/ManagedObject',
	'sap/ui/core/InvisibleText'
], function(
	Control,
	Element,
	Library,
	Rem,
	Parameters,
	openWindow,
	Text,
	Link,
	Select,
	Item,
	ItemNavigation,
	ResizeHandler,
	IconPool,
	Device,
	library,
	BreadcrumbsRenderer,
	ManagedObject,
	InvisibleText
) {
	"use strict";

	// shortcut for sap.m.SelectType
	var SelectType = library.SelectType,

		// shortcut for sap.m.BreadCrumbsSeparatorStyle
		SeparatorStyle = library.BreadcrumbsSeparatorStyle,

		// shortcut for texts resource bundle
		oResource = Library.getResourceBundleFor("sap.m");

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
	 * @implements sap.m.IBreadcrumbs, sap.m.IOverflowToolbarContent, sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.Breadcrumbs
	 *
	 */
	var Breadcrumbs = Control.extend("sap.m.Breadcrumbs", {
		metadata: {
			library: "sap.m",
			interfaces: [
				"sap.m.IBreadcrumbs",
				"sap.m.IOverflowToolbarContent",
				"sap.m.IToolbarInteractiveControl",
				"sap.ui.core.IShrinkable"
			],
			designtime: "sap/m/designtime/Breadcrumbs.designtime",
			properties: {

				/**
				 * Determines the text of current/last element in the Breadcrumbs path.
				 * @since 1.34
				 */
				currentLocationText: {type: "string", group: "Data", defaultValue: null},
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
				 * Link determing the current/last element in the Breadcrumbs path.
				 * @since 1.123
				 */
				currentLocation: {type: "sap.m.Link", multiple: false},

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
			defaultAggregation: "links",
			associations: {

				/**
				 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
				 * @since 1.92
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"
				}
			}
		},

		renderer: BreadcrumbsRenderer
	});

	/*
	 * STATIC MEMBERS
	 */

	Breadcrumbs.STYLE_MAPPER = {
		Slash: "/",
		BackSlash: "\\",
		DoubleSlash: "//",
		DoubleBackSlash: "\\\\",
		GreaterThan: ">",
		DoubleGreaterThan: ">>"
	};

	Breadcrumbs._getResourceBundleText = function (sText, vOptions) {
		return oResource.getText(sText, vOptions);
	};

	/*************************************** Framework lifecycle events ******************************************/

	Breadcrumbs.prototype.init = function () {
		this._sSeparatorSymbol = Breadcrumbs.STYLE_MAPPER[this.getSeparatorStyle()];
		this._aCachedInvisibleTexts = [];
		this._getInvisibleText();
		this.MIN_WIDTH_IN_OFT = parseInt(Parameters.get({
			name: "_sap_m_Breadcrumbs_MinWidth_OFT",
			callback: function(sValue) {
				this.MIN_WIDTH_IN_OFT = parseInt(sValue);
				this._iMinWidth = this.MIN_WIDTH_IN_OFT;
			}.bind(this)
		}));
		this._iMinWidth = this.MIN_WIDTH_IN_OFT;
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

		this._destroyInvisibleTexts();
		this._aCachedInvisibleTexts = this._buildInvisibleTexts();
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
		this._setMinWidth();

		this.bRenderingPhase = false;
	};

	Breadcrumbs.prototype.focus = function () {
		setTimeout(() => { Control.prototype.focus.apply(this, arguments); } , 0);
	};

	Breadcrumbs.prototype._setMinWidth = function () {
		var oCurrentLocation = this.getCurrentLocation(),
			iWidth,
			iDefaultMinWidthOFT;
		// When in OFT, set min-width=width of the currentLocationText, so that it won't be truncated too much, before going into the overflow menu
		if (this.$().hasClass("sapMTBShrinkItem")) {

			if (!this._iMinWidth || this._iMinWidth !== this.MIN_WIDTH_IN_OFT) {
				return;
			}

			this.$().removeClass("sapMTBShrinkItem");
			iWidth = oCurrentLocation.$().width();

			// Theme parameters should be resolved when reaching this point
			iDefaultMinWidthOFT = Rem.toPx(Parameters.get({
				name: "_sap_m_Toolbar_ShrinkItem_MinWidth",
				callback: function(sValue) {
					iDefaultMinWidthOFT = Rem.toPx(sValue);
				}
			}));
			this.$().addClass("sapMTBShrinkItem");

			if (iWidth > iDefaultMinWidthOFT) {
				this.$().css("min-width", iWidth);
			}

			this.fireEvent("_minWidthChange");
			this._iMinWidth = iWidth;
		}
	};

	Breadcrumbs.prototype.onThemeChanged = function () {
		this._resetControl();
	};

	Breadcrumbs.prototype.exit = function () {
		this._resetControl();
		this._destroyItemNavigation();
		this._destroyInvisibleTexts();

		if (this._oInvisibleText) {
			this._oInvisibleText.destroy();
			this._oInvisibleText = null;
		}
	};

	/*************************************** Static members ******************************************/

	Breadcrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	/*************************************** Internal aggregation handling  ******************************************/

	Breadcrumbs.prototype._getAugmentedId = function (sSuffix) {
		return this.getId() + "-" + sSuffix;
	};


	Breadcrumbs.prototype._getInvisibleText = function() {
		var oAriaLabelText = Breadcrumbs._getResourceBundleText("BREADCRUMB_LABEL");

		if (!this._oInvisibleText) {
			this._oInvisibleText = new InvisibleText({ id: this.getId() + "-InvisibleText"});
			this._oInvisibleText.setText(oAriaLabelText).toStatic();
		}

		return this._oInvisibleText;
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
				tooltip: Breadcrumbs._getResourceBundleText("BREADCRUMB_SELECT_TOOLTIP")
			})), true);
		}
		return this.getAggregation("_select");
	};

	Breadcrumbs.prototype._getCurrentLocation = function () {
		if (!this.getAggregation("_currentLocation")) {
			var oCurrentLocation = new Text({
				id: this._getAugmentedId("currentText"),
				text: this.getCurrentLocationText()
			}).addStyleClass("sapMBreadcrumbsCurrentLocation");

			oCurrentLocation.addEventDelegate({
				onAfterRendering: function () {
					this._setCurrentLocationAccInfo(oCurrentLocation);
				}.bind(this)
			});

			this.setAggregation("_currentLocation", oCurrentLocation).addStyleClass("sapMBreadcrumbsCurrentLocation");
		}
		return this.getAggregation("_currentLocation");
	};

	Breadcrumbs.prototype.setCurrentLocation = function (oLink) {
		if (oLink) {
			oLink.addStyleClass("sapMBreadcrumbsCurrentLocation");
		}

		return this.setAggregation("currentLocation", oLink);
	};

	Breadcrumbs.prototype.getCurrentLocation = function () {
		var oLinkAggregation = this.getAggregation("currentLocation");

		if (!oLinkAggregation || !oLinkAggregation.getText()) {
			return this._getCurrentLocation();
		}

		return oLinkAggregation;
	};

	Breadcrumbs.prototype._setCurrentLocationAccInfo = function (oCurrentLocation) {
		var aVisibleItems = this._getControlsForBreadcrumbTrail(),
			positionText = Breadcrumbs._getResourceBundleText("BREADCRUMB_ITEM_POS", [aVisibleItems.length, aVisibleItems.length]);

		oCurrentLocation.$().attr("aria-current", "page");
		oCurrentLocation.$().attr("tabindex", 0);
		oCurrentLocation.$().attr("role", "link");
		oCurrentLocation.$().attr("aria-label", this.getCurrentLocation().getText() + " " + positionText);
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

	Breadcrumbs.prototype._destroyInvisibleTexts = function () {
		var oControl;
		this._aCachedInvisibleTexts.forEach(function (oData) {
			oControl = Element.getElementById(oData.controlId);

			// remove reference to the invisible text on the sap.m.Link control
			// check for control existence as it might have been destroyed already
			if (oControl && oControl.removeAriaLabelledBy) {
				oControl.removeAriaLabelledBy(oData.invisibleText.getId());
			}

			oData.invisibleText.destroy();
		});
		this._aCachedInvisibleTexts = [];
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

		if (this.getCurrentLocation().getText() && Device.system.phone) {
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
			text: ManagedObject.escapeSettingsValue(oItem.getText())
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

		oLink = Element.getElementById(oSelectedItem.getKey());

		/* if it's not a link, then it must be only the current location text, we shouldn't do anything */
		if (!(oLink instanceof Link)) {
			return;
		}

		sLinkHref = oLink.getHref();
		sLinkTarget = oLink.getTarget();

		oLink.firePress();

		if (sLinkHref) {
			if (sLinkTarget) {
				// TODO: take oLink.getRel() value into account ('links' is a public aggregation)
				openWindow(sLinkHref, sLinkTarget);
			} else {
				window.location.href = sLinkHref;
			}
		}
	};

	Breadcrumbs.prototype._getItemsForMobile = function () {
		var oItems = this.getLinks().filter(function (oLink) { return oLink.getVisible(); });

		if (this.getCurrentLocation().getText()) {
			oItems.push(this.getCurrentLocation());
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

		if (this.getCurrentLocation().getText()) {
			return aVisibleControls.concat([this.getCurrentLocation()]);
		}
		return aVisibleControls;
	};

	Breadcrumbs.prototype._getControlInfo = function (oControl) {
		return {
			id: oControl.getId(),
			control: oControl,
			width: getElementWidth(oControl.$().parent()),
			bCanOverflow: oControl instanceof Link
		};
	};

	/**
	 * Creates InvisibleText instances for the Link controls in the Breadcrumbs.
	 * Used to add the position and the size of the controls to their ariaLabelledBy association.
	 * An array of objects is returned for the instances to be destroyed on next invalidation with the following properties:
	 * - controlId: the id of the Link to later remove the InvisibleText instance id from the ariaLabelledBy association
	 * - invisibleText: the InvisibleText control itself to be destroyed
	 */
	Breadcrumbs.prototype._buildInvisibleTexts = function() {
		var aVisibleItems = this._getControlsForBreadcrumbTrail(), // all visible links outside the drop-down, including current location
			iItemCount = aVisibleItems.length,
			oInvisibleText,
			oInvisibleTexts = [];

		aVisibleItems.forEach(function(oItem, iIndex) {
			if (!oItem.isA("sap.m.Link")) {
				// only links are relevant for the ariaLabelledBy association
				return;
			}

			oInvisibleText = new InvisibleText({
				text: Breadcrumbs._getResourceBundleText("BREADCRUMB_ITEM_POS", [iIndex + 1, iItemCount])
			}).toStatic();

			if (oItem.getAriaLabelledBy().indexOf(oItem.getId()) === -1) {
				oItem.addAriaLabelledBy(oItem.getId());
			}

			oItem.addAriaLabelledBy(oInvisibleText.getId());
			oInvisibleTexts.push({
				controlId: oItem.getId(),
				invisibleText: oInvisibleText
			});
		});

		return oInvisibleTexts;
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
			this._iSelectWidth = getElementWidth(this._getSelect().$().parent()) || 0;
			this._aControlInfo = this._getControlsForBreadcrumbTrail().map(this._getControlInfo);
			// ceil the container width to prevent unnecessary overflow of a link due to rounding issues
			// (when the available space appears insufficient with less than a pixel
			this._iContainerSize = Math.ceil(getElementWidth(this.$()));
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
	 * @returns {this} this
	 * @private
	 */
	Breadcrumbs.prototype._handleScreenResize = function (oEvent) {
		var iCachedControlsForBreadcrumbTrailCount,
			oControlsDistribution,
			iCalculatedControlsForBreadcrumbTrailCount;

		if (oEvent.size.width === oEvent.oldSize.width || oEvent.size.width === 0) {
			return this;
		}

		iCachedControlsForBreadcrumbTrailCount = this._oDistributedControls.aControlsForBreadcrumbTrail.length;
		// ceil the container width to prevent unnecessary overflow of a link due to rounding issues
		// (when the available space appears insufficient with less than a pixel
		oControlsDistribution = this._getControlDistribution(Math.ceil(getElementWidth(this.$())));
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
			aNavigationDomRefs = [],
			oItemDomRef;

		if (aItemsToNavigate.length === 0) {
			return;
		}

		aItemsToNavigate.forEach(function (oItem, iIndex) {
			oItemDomRef = oItem.getFocusDomRef();
			if (oItemDomRef) {
				oItemDomRef.setAttribute("tabindex", iIndex === 0 ? "0" : "-1");
			}
			aNavigationDomRefs.push(oItem.getFocusDomRef());
		});

		this.addDelegate(oItemNavigation);
		oItemNavigation.setDisabledModifiers({
			sapnext: ["alt", "meta"],
			sapprevious: ["alt", "meta"],
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

	/* @deprecated as of version 1.123 */
	Breadcrumbs.prototype.setCurrentLocationText = function (sText) {
		var oCurrentLocation = this._getCurrentLocation(),
			vResult = this.setProperty("currentLocationText", sText, true);

		if (oCurrentLocation.getText() !== sText) {
			oCurrentLocation.setText(sText);
			// Enable new measuring of the currentLocationText
			this._iMinWidth = this.MIN_WIDTH_IN_OFT;
			this._resetControl();
		}

		return vResult;
	};

	/**
	 * Custom setter for the <code>Breadcrumbs</code> separator style.
	 *
	 * @returns {sap.m.Breadcrumbs} this
	 * @param {sap.m.BreadcrumbsSeparatorStyle} sSeparatorStyle
	 * @public
	 * @since 1.71
	 */
	Breadcrumbs.prototype.setSeparatorStyle = function (sSeparatorStyle) {
		this.setProperty("separatorStyle", sSeparatorStyle);
		var sSeparatorSymbol = Breadcrumbs.STYLE_MAPPER[this.getSeparatorStyle()];
		if (sSeparatorSymbol){
			this._sSeparatorSymbol = sSeparatorSymbol;
		}
		return this;
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

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidation event which is fired when width of the control is changed.
	 *
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar
	 */
	Breadcrumbs.prototype.getOverflowToolbarConfig = function() {
		var oConfig = {
			canOverflow: true,
			getCustomImportance: function () {
				return "Medium";
			},
			invalidationEvents: ["_minWidthChange"],
			onAfterExitOverflow: this._onAfterExitOverflow.bind(this)
		};

		return oConfig;
	};

	Breadcrumbs.prototype._onAfterExitOverflow = function () {
		this._resetControl();
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	 Breadcrumbs.prototype._getToolbarInteractive = function () {
		return true;
	};

	// helper functions
	function getElementWidth($element) {
		var iMargins;
		if ($element.length) {
			iMargins = $element.outerWidth(true) - $element.outerWidth();

			return $element.get(0).getBoundingClientRect().width + iMargins;
		}
	}

	return Breadcrumbs;

});
