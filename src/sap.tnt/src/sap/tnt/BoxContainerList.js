/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/m/library",
		"sap/m/ListBase",
		"sap/tnt/Box",
		"sap/ui/Device",
		"sap/ui/core/ResizeHandler"
	], function (library, ListBase, Box, Device, ResizeHandler) {
	"use strict";

	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// Maps StdExt sizes to BoxContainer size classes
	var mSizeClasses = {
		"Phone": "sapTntBoxContainerSizeS",
		"Tablet": "sapTntBoxContainerSizeM",
		"Desktop": "sapTntBoxContainerSizeL",
		"LargeDesktop": "sapTntBoxContainerSizeXL"
	};

	/**
	 * Constructor for a new BoxContainerList.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The BoxContainerList is a private control used by the BoxContainer.
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.56
	 * @alias sap.tnt.BoxContainerList
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BoxContainerList = ListBase.extend("sap.tnt.BoxContainerList", { metadata : {
		library : "sap.tnt",
		properties: {

			/**
			 * Defines the width of the Boxes
			 */
			boxWidth: { type: "sap.ui.core.CSSSize", defaultValue: "" },

			/**
			 * A string type that represents BoxContainer's number of boxes for extra large, large, medium and small screens
			 */
			boxesPerRowConfig: { type: "sap.tnt.BoxesPerRowConfig", group: "Behavior", defaultValue: "XL7 L6 M4 S2" }
		}
	}});

	BoxContainerList.prototype.onBeforeRendering = function () {
		this._deregisterResizeListener();
		ListBase.prototype.onBeforeRendering.apply(this, arguments);
	};

	BoxContainerList.prototype.exit = function () {
		this._deregisterResizeListener();
		ListBase.prototype.exit.apply(this, arguments);
	};

	BoxContainerList.prototype.onAfterRendering = function () {
		this._registerResizeListener();

		// Size class is used when no boxWidth is being set.
		if (!this.getBoxWidth()) {
			this._applySizeClass(this.$().width());
		}

		if (Device.browser.msie) {
			this._flattenHeight();
		}

		ListBase.prototype.onAfterRendering.apply(this, arguments);
	};

	/**
	 * Registers the resize handler.
	 * @private
	 */
	BoxContainerList.prototype._registerResizeListener = function () {
		this._sResizeListenerId = ResizeHandler.register(this, this._onResize.bind(this));
	};

	/**
	 * Deregisters the resize handler.
	 * @private
	 */
	BoxContainerList.prototype._deregisterResizeListener = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	};

	/**
	 * Resize handler for the BoxContainerList.
	 *  - Changes the size class if needed.
	 *  - Recalculates the number of columns of the ItemNavigation.
	 *  - For IE11 manually flatten the height of the boxes.
	 *
	 * @param {object} oEvent - The event from a resize
	 * @private
	 */
	BoxContainerList.prototype._onResize = function (oEvent) {
		if (oEvent) {
			// Size class is used when no boxWidth is being set.
			if (!this.getBoxWidth()) {
				this._applySizeClass(oEvent.size.width);
			}

			this.setItemNavigationColumns();
		}

		if (Device.browser.msie) {
			this._flattenHeight();
		}
	};

	/**
	 * Applies a size class on the list. The class is used for breakpoints.
	 * Note: The class is needed only when no fixed width is set on the boxes.
	 *
	 * @param {string} sWidth - The width based on which to set the size class.
	 * @private
	 */
	BoxContainerList.prototype._applySizeClass = function (sWidth) {
		var $this = this.$(),
			oRange = Device.media.getCurrentRange("StdExt", sWidth),
			sSizeClass = mSizeClasses[oRange.name],
			aClasses;

		if (!$this.hasClass(sSizeClass)) {
			aClasses = Object.keys(mSizeClasses).map(function (sSize) {
				return mSizeClasses[sSize];
			});
			$this.removeClass(aClasses.join(" "));
			$this.addClass(sSizeClass);
		}
	};

	/**
	 * Make all Boxes inside the BoxContainer equal heights.
	 * Note: Only needed for IE11.
	 *
	 * @private
	 */
	BoxContainerList.prototype._flattenHeight = function () {
		var aItemDoms = [],
			iMaxHeight = 0,
			oDomRef;

		// Collect all items' DOMs and max height
		this.getItems().forEach(function (oItem) {
			if (oItem instanceof Box) {
				oDomRef = oItem.getDomRef();
				aItemDoms.push(oDomRef);
				oDomRef.style.height = null;
				iMaxHeight = Math.max(oDomRef.getBoundingClientRect().height, iMaxHeight);
			}
		});

		// apply height to all items
		aItemDoms.forEach(function (oDomRef) {
			if (oDomRef.getBoundingClientRect().height < iMaxHeight) {
				oDomRef.style.height = iMaxHeight + "px";
			}
		});
	};

	/**
	 * Starts the ItemNavigation. Override to set table mode and number of columns.
	 *
	 * @protected
	 * @override
	 */
	BoxContainerList.prototype._startItemNavigation = function () {
		ListBase.prototype._startItemNavigation.apply(this, arguments);

		// Override item navigation mode
		if (this._oItemNavigation) {
			this._oItemNavigation.setTableMode(true, false);
			this.setItemNavigationColumns();
		}
	};

	/**
	 * Sets the number of columns of the ItemNavigation.
	 *
	 * @protected
	 */
	BoxContainerList.prototype.setItemNavigationColumns = function () {
		var aItems,
			oPositionTop,
			i,
			oItem;

		if (!this._oItemNavigation) {
			return;
		}

		aItems = this.getItems();

		if (aItems.length) {
			// Get the position top of the first element as reference for column setting.
			oPositionTop = aItems[0].$().offset().top;

			for (i = 1; i < aItems.length; i++) {
				oItem = aItems[i];

				if (oItem.$().offset().top !== oPositionTop) {
					break;
				}
			}

			this._oItemNavigation.setColumns(i);
		}
	};

	/**
	 * Sets DOM References for keyboard navigation. Override to ensure correct dom references are used for items.
	 *
	 * @param {sap.ui.core.delegate.ItemNavigation} oItemNavigation - The ItemNavigation instance
	 * @param {HTMLElement} [oNavigationRoot] - The navigation root DOM element
	 * @protected
	 * @override
	 */
	BoxContainerList.prototype.setNavigationItems = function(oItemNavigation, oNavigationRoot) {
		var aNavigationItems = [];

		// Ensure high specificity selectors in order not to mess with dom refs of lists created as content inside Boxes.
		if (this.isGrouped()) {
			aNavigationItems = jQuery(oNavigationRoot).find(".sapTntBoxContainerGrid > .sapMLIB").get();
		} else {
			aNavigationItems = jQuery(oNavigationRoot).children(".sapMLIB").get();
		}

		oItemNavigation.setItemDomRefs(aNavigationItems);
		if (oItemNavigation.getFocusedIndex() == -1) {
			if (this.getGrowing() && this.getGrowingDirection() == ListGrowingDirection.Upwards) {
				oItemNavigation.setFocusedIndex(aNavigationItems.length - 1);
			} else {
				oItemNavigation.setFocusedIndex(0);
			}
		}
	};

	return BoxContainerList;
});
