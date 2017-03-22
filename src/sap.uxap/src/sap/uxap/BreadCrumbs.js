/*!
 * ${copyright}
 */

// Provides control sap.uxap.BreadCrumbs.
sap.ui.define([
	"sap/m/Link",
	"sap/m/Select",
	"sap/m/Text",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/Item",
	"sap/ui/core/Icon",
	"sap/ui/Device",
	"./library"
], function (Link, Select, Text, Control, ResizeHandler, ItemNavigation, Item, Icon, Device, library) {
	"use strict";

	/**
	 * Constructor for a new BreadCrumbs.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * The BreadCrumbs control represents the navigation steps up to the current location in the application and allows
	 * the user to quickly navigate to a previous location on the path that got him to the current location.
	 * It has two main modes of operation. One is a trail of links followed by separators (when there's enough space
	 * for the control to fit on one line), and the other is a dropdown list with the links (when the trail of links
	 * wouldn't fit on one line).
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.uxap.BreadCrumbs
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BreadCrumbs = Control.extend("sap.uxap.BreadCrumbs", /** @lends sap.uxap.BreadCrumbs.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Sets the visibility of the current/last element in the BreadCrumbs path.
				 */
				showCurrentLocation: {type: "boolean", group: "Behavior", defaultValue: true}
			},
			defaultAggregation: "links",
			aggregations: {

				/**
				 * A list of all the active link elements in the BreadCrumbs control.
				 */
				links: {type: "sap.m.Link", multiple: true, singularName: "link"},

				/**
				 * The current/last element in the BreadCrumbs path.
				 */
				currentLocation: {type: "sap.m.Text", multiple: false},

				/**
				 * An icon that is used as a separator after each link in the standard mode.
				 */
				_tubeIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},

				/**
				 *
				 * A select control which is used to display the BreadCrumbs content on smaller mobile devices or
				 * when there's not enough space for the control to fit on one line.
				 */
				_overflowSelect: {type: "sap.m.Select", multiple: false, visibility: "hidden"}
			}
		}
	});

	BreadCrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	BreadCrumbs.prototype.init = function () {
		this._iREMSize = parseInt(jQuery("body").css("font-size"), 10);
		this._iContainerMaxHeight = this._iREMSize * 2;
	};

	BreadCrumbs.prototype.onBeforeRendering = function () {
		this._bOnPhone = Device.system.phone;
		this._resetControl();
	};

	BreadCrumbs.prototype.onAfterRendering = function () {
		this._handleInitialModeSelection();
	};

	/**
	 * Handles the the initial mode selection between overflowSelect and normal mode
	 *
	 * @private
	 * @returns {object} this
	 */
	BreadCrumbs.prototype._handleInitialModeSelection = function () {
		if (this._bOnPhone) {
			this._setSelectVisible(true);
			return this;
		}

		this._configureKeyboardHandling();

		if (!this._iContainerHeight) {
			this._iContainerHeight = this.$().outerHeight();
		}

		if (this._iContainerHeight > this._iContainerMaxHeight) {
			this._toggleOverflowMode(true);
			return this;
		}

		this._sResizeListenerId = ResizeHandler.register(this, this._handleScreenResize.bind(this));

		return this;
	};

	/**
	 * Handles the switching between overflowSelect and normal mode
	 *
	 * @private
	 * @param {*} bUseOverFlowSelect use overflow select
	 * @returns {object} this
	 */
	BreadCrumbs.prototype._toggleOverflowMode = function (bUseOverFlowSelect) {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
		}
		this._setSelectVisible(bUseOverFlowSelect);
		this._setBreadcrumbsVisible(!bUseOverFlowSelect);
		this._sResizeListenerId = ResizeHandler.register(this, this._handleScreenResize.bind(this));
		return this;
	};

	/**
	 * Retrieves the tube separator icon with lazy loading
	 *
	 * @returns {sap.ui.core.Icon} tube icon
	 * @private
	 */
	BreadCrumbs.prototype._getTubeIcon = function () {

		if (!this.getAggregation("_tubeIcon")) {
			this.setAggregation("_tubeIcon", new Icon({
				"src": "sap-icon://slim-arrow-right",
				"color": "#bfbfbf",
				"size": "1rem",
				"useIconTooltip": false
			}).addStyleClass("sapUxAPTubeIcon"));
		}

		return this.getAggregation("_tubeIcon");
	};

	/**
	 * Retrieves the overflowSelect with lazy loading
	 *
	 * @returns {sap.m.Select} select
	 * @private
	 */
	BreadCrumbs.prototype._getOverflowSelect = function () {
		var oOverflowSelect,
			aSelectItems;

		if (!this.getAggregation("_overflowSelect")) {
			aSelectItems = this.getLinks().reverse() || [];
			aSelectItems.unshift(this.getCurrentLocation());

			oOverflowSelect = new Select({
				items: aSelectItems.map(this._createSelectItem),
				autoAdjustWidth: true
			});

			oOverflowSelect.attachChange(this._overflowSelectChangeHandler);
			this.setAggregation("_overflowSelect", oOverflowSelect);
		}

		return this.getAggregation("_overflowSelect");
	};

	/**
	 * Retrieves the an overflowSelect item using an sap.m.Link or sap.m.Text
	 *
	 * @param {sap.m.Text} oItem item
	 * @returns  {sap.ui.core.Item} new item
	 * @private
	 */
	BreadCrumbs.prototype._createSelectItem = function (oItem) {
		return new Item({
			key: oItem.getId(),
			text: oItem.getText()
		});
	};

	/**
	 * Handles the overflowSelect "select" event
	 *
	 * @param {jQuery.Event} oEvent event
	 * @returns {object} this
	 * @private
	 */
	BreadCrumbs.prototype._overflowSelectChangeHandler = function (oEvent) {
		var oSelectedKey = oEvent.getParameter("selectedItem").getKey(),
			oControl = sap.ui.getCore().byId(oSelectedKey),
			sLinkHref,
			sLinkTarget;

		if (oControl instanceof Link) {
			sLinkHref = oControl.getHref();
			oControl.firePress();
			if (sLinkHref) {
				sLinkTarget = oControl.getTarget();
				if (sLinkTarget) {
					window.open(sLinkHref, sLinkTarget);
				} else {
					window.location.href = sLinkHref;
				}
			}
		}

		return this;
	};

	/**
	 * Handles the resize event of the Breadcrumbs control container
	 *
	 * @param {jQuery.Event} oEvent event
	 * @returns {object} this
	 * @private
	 */
	BreadCrumbs.prototype._handleScreenResize = function (oEvent) {
		var bShouldSwitchToOverflow = this._shouldOverflow(),
			bUsingOverflowSelect = this._getUsingOverflowSelect();

		if (bShouldSwitchToOverflow && !bUsingOverflowSelect) {
			this._toggleOverflowMode(true);
		} else if (!bShouldSwitchToOverflow && bUsingOverflowSelect) {
			this._toggleOverflowMode(false);
		}

		return this;
	};

	/**
	 * Handles the decision making on whether or not the control should go into overflow mode
	 *
	 * @returns {boolean} should overflow
	 * @private
	 */
	BreadCrumbs.prototype._shouldOverflow = function () {
		var $breadcrumbs = this._getBreadcrumbsAsJQueryObject(),
			bShouldOverflow,
			bUsingOverflowSelect = this._getUsingOverflowSelect();

		if (bUsingOverflowSelect) {
			this._setBreadcrumbsVisible(true);
		}

		$breadcrumbs.addClass("sapUxAPInvisible");
		bShouldOverflow = $breadcrumbs.outerHeight() > this._iContainerMaxHeight;
		$breadcrumbs.removeClass("sapUxAPInvisible");

		if (bUsingOverflowSelect) {
			this._setBreadcrumbsVisible(false);
		}

		return bShouldOverflow;
	};

	/**
	 * Retrieves the Breadcrumbs jQuery object
	 *
	 * @returns {jQuery.Object} breadcrumbs jQuery instance
	 * @private
	 */
	BreadCrumbs.prototype._getBreadcrumbsAsJQueryObject = function () {
		if (!this._$breadcrumbs) {
			this._$breadcurmbs = this.$("breadcrumbs");
		}

		return this._$breadcurmbs;
	};

	/**
	 * Retrieves the overflowSelect jQuery object
	 *
	 * @returns {jQuery.Object} jQuery select object
	 * @private
	 */
	BreadCrumbs.prototype._getOverflowSelectAsJQueryObject = function () {
		if (!this._$select) {
			this._$select = this.$("select");
		}

		return this._$select;
	};

	/**
	 * Sets the visibility of the Breadcrumbs
	 *
	 * @param {boolean} bVisible visibility of breadcrumbs
	 * @returns {jQuery.Object} $this
	 * @private
	 */
	BreadCrumbs.prototype._setBreadcrumbsVisible = function (bVisible) {
		var $this = this.$(),
			$breadcrumbs = this._getBreadcrumbsAsJQueryObject(),
			sFullWidthClass = "sapUxAPFullWidth",
			sSapHiddenClass = "sapUiHidden";

		if (bVisible) {
			$breadcrumbs.removeClass(sSapHiddenClass);
			$this.removeClass(sFullWidthClass);
		} else {
			$breadcrumbs.addClass(sSapHiddenClass);
			$this.addClass(sFullWidthClass);
		}

		return $this;
	};

	/**
	 * Sets the visibility of the overflowSelect
	 *
	 * @param {boolean} bVisible select visibility state
	 * @returns {*} this
	 * @private
	 */
	BreadCrumbs.prototype._setSelectVisible = function (bVisible) {
		var $select = this._getOverflowSelectAsJQueryObject(),
			sSapHiddenClass = "sapUiHidden";

		if (bVisible) {
			$select.removeClass(sSapHiddenClass);
		} else {
			$select.addClass(sSapHiddenClass);
		}

		return this;
	};

	/**
	 * Resets all of the internally cached values used by the control
	 *
	 * @returns {object} this
	 * @private
	 */
	BreadCrumbs.prototype._resetControl = function () {
		this._iContainerHeight = null;
		this._$select = null;
		this._$breadcrumbs = null;
		this.setAggregation("_overflowSelect", null, true);

		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
		}

		return this;
	};

	/**
	 * Provides a default aria-labelled text
	 *
	 * @private
	 * @returns {sap.ui.core.InvisibleText} Aria Labelled By
	 */
	BreadCrumbs.prototype._getAriaLabelledBy = function () {
		if (!this._oAriaLabelledBy) {
			BreadCrumbs.prototype._oAriaLabelledBy = new sap.ui.core.InvisibleText({
				text: library.i18nModel.getResourceBundle().getText("BREADCRUMB_TRAIL_LABEL")
			}).toStatic();
		}

		return this._oAriaLabelledBy;
	};

	/**
	 * Retrieves the ItemNavigation with lazy loading
	 *
	 * @private
	 * @returns {sap.ui.core.delegate.ItemNavigation} item navigation
	 */
	BreadCrumbs.prototype._getItemNavigation = function () {
		if (!this._ItemNavigation) {
			this._ItemNavigation = new ItemNavigation();
		}

		return this._ItemNavigation;
	};

	/**
	 * Retrieves the items which should be included in navigation.
	 *
	 * @private
	 * @returns {array} aItemsToNavigate
	 */
	BreadCrumbs.prototype._getItemsToNavigate = function () {
		var aItemsToNavigate = this.getLinks(),
			oCurrentLocation = this.getCurrentLocation(),
			bShowCurrentLocation = this.getShowCurrentLocation();

		if (bShowCurrentLocation && oCurrentLocation) {
			aItemsToNavigate.push(oCurrentLocation);
		}

		return aItemsToNavigate;
	};

	/**
	 * Configures the Keyboard handling for the control
	 *
	 * @private
	 * @returns {object} this
	 */
	BreadCrumbs.prototype._configureKeyboardHandling = function () {
		var oItemNavigation = this._getItemNavigation(),
			oHeadDomRef = this._getBreadcrumbsAsJQueryObject()[0],
			iSelectedDomIndex = -1,
			aItemsToNavigate = this._getItemsToNavigate(),
			aNavigationDomRefs = [];

		aItemsToNavigate.forEach(function (oItem) {
			oItem.$().attr("tabIndex", "-1");
			aNavigationDomRefs.push(oItem.getDomRef());
		});

		this.addDelegate(oItemNavigation);
		oItemNavigation.setCycling(false);
		oItemNavigation.setRootDomRef(oHeadDomRef);
		oItemNavigation.setItemDomRefs(aNavigationDomRefs);
		oItemNavigation.setSelectedIndex(iSelectedDomIndex);

		// fix the tab indexes so the first link to be 0 and read correctly by the screen reader
		this._getBreadcrumbsAsJQueryObject().attr("tabindex", "-1");
		aItemsToNavigate[0].$().attr("tabindex", "0");

		return this;
	};

	/**
	 * Handles PAGE UP key.
	 *
	 * @param {jQuery.Event} oEvent event
	 * @private
	 */
	BreadCrumbs.prototype.onsappageup = function (oEvent) {
		this._handlePageKeys(oEvent, false);
	};

	/**
	 * Handles PAGE DOWN key.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	BreadCrumbs.prototype.onsappagedown = function (oEvent) {
		this._handlePageKeys(oEvent, true);
	};

	BreadCrumbs.prototype._handlePageKeys = function (oEvent, bMovingDown) {
		var iNextIndex,
			aBreadCrumbs = this._getItemsToNavigate(),
			iEventTargetIndex = 0,
			iLastIndex = bMovingDown ? aBreadCrumbs.length - 1 : 0;

		oEvent.preventDefault();

		aBreadCrumbs.some(function (oItem, iIndex) {
			if (oItem.getId() === oEvent.target.id) {
				iEventTargetIndex = iIndex;
				return true;
			}
		});

		if (bMovingDown) {
			iNextIndex = iEventTargetIndex + BreadCrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE;
		} else {
			iNextIndex = iEventTargetIndex - BreadCrumbs.PAGEUP_AND_PAGEDOWN_JUMP_SIZE;
		}

		if (iNextIndex && aBreadCrumbs[iNextIndex]) {
			aBreadCrumbs[iNextIndex].focus();
		} else if (aBreadCrumbs[iLastIndex]) {
			aBreadCrumbs[iLastIndex].focus();
		}
	};

	BreadCrumbs.prototype._getUsingOverflowSelect = function () {
		return !this._getOverflowSelectAsJQueryObject().hasClass("sapUiHidden");
	};

	BreadCrumbs.prototype.exit = function () {
		if (this._ItemNavigation) {
			this.removeDelegate(this._ItemNavigation);
			this._ItemNavigation.destroy();
			this._ItemNavigation = null;
		}

		this._resetControl();
	};

	return BreadCrumbs;

});
