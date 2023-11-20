/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.ScrollingIOS.
sap.ui.define([
	"./ExtensionBase",
	"../utils/TableUtils"
], function(ExtensionBase, TableUtils) {
	"use strict";

	var ExtensionDelegate = {
		onAfterRendering: function() {
			this.attachScrollbar();
		}
	};

	/**
	 * Extension for sap.ui.table.Table which displays vertical scrollbar on iOS and provides event handlers for user interaction.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library
	 * is strictly prohibited!</b>
	 *
	 * <b>Displays vertical scrollbar on iOS and provides event handlers for user interaction.</b>
	 *
	 * @class Extension for sap.ui.table.Table which handles the scrollbar on iOS.
	 * @extends sap.ui.table.extensions.ExtensionBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.extensions.ScrollingIOS
	 */
	var ScrollIOSExtension = ExtensionBase.extend("sap.ui.table.extensions.ScrollingIOS", /** @lends sap.ui.table.extensions.ScrollingIOS.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable) {
			TableUtils.addDelegate(oTable, ExtensionDelegate, this);
			this.attachScrollbar();
			return "ScrollIOSExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			var oTable = this.getTable();

			TableUtils.removeDelegate(oTable, ExtensionDelegate);
			clearTimeout(this._iUpdateDefaultScrollbarPositionTimeoutId);
			ExtensionBase.prototype.destroy.apply(this, arguments);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			var oTable = this.getTable();

			TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, this.onTotalRowCountChanged, this);
			TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UpdateSizes, this.onUpdateTableSizes, this);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_detachEvents: function() {
			var oTable = this.getTable();

			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			if (oVSb) {
				oVSb.removeEventListener("scroll", this._onVerticalScrollEventHandler);
			}
			delete this._onVerticalScrollEventHandler;

			var oVSbIOS = this.getVerticalScrollbar();
			if (oVSbIOS) {
				oVSbIOS.removeEventListener("pointerdown", this._onPointerDownEventHandler);
			}
			delete this._onPointerDownEventHandler;

			var oVSbThumb = this.getVerticalScrollbarThumb();
			if (oVSbThumb) {
				oVSbThumb.removeEventListener("touchmove", this._onTouchMoveEventHandler);
			}
			delete this._onTouchMoveEventHandler;

			TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, this.onTotalRowCountChanged, this);
			TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.UpdateSizes, this.onUpdateTableSizes, this);
		}
	});

	ScrollIOSExtension.prototype.onUpdateTableSizes = function() {
		this.updateVerticalScrollbarThumbHeight();
		this.updateVerticalScrollbarThumbPosition();
	};

	ScrollIOSExtension.prototype.onTotalRowCountChanged = function() {
		this.updateVerticalScrollbarThumbHeight();
	};

	/**
	 * Inserts the scrollbar into the DOM if it does not yet exist.
	 */
	ScrollIOSExtension.prototype.attachScrollbar = function() {
		var oTable = this.getTable();
		var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
		var oVSbIOS = this.getVerticalScrollbar();
		var oVSbThumb = this.getVerticalScrollbarThumb();

		if (!oVSb || !oVSb.isConnected) {
			return;
		}

		// Render scrollbar
		if (!oVSbIOS) {
			oVSbIOS = document.createElement("div");
			oVSbIOS.setAttribute("id", oTable.getId() + "-vsb-ios");
			oVSbIOS.classList.add("sapUiTableVSbIOS");

			oVSbThumb = document.createElement("div");
			oVSbThumb.classList.add("sapUiTableVSbIOSThumb");
			oVSbIOS.append(oVSbThumb);

			oVSb.after(oVSbIOS);
		}

		// Attach events
		if (!this._onPointerDownEventHandler) {
			this._onPointerDownEventHandler = this.onPointerDown.bind(this);
			oVSbIOS.addEventListener("pointerdown", this._onPointerDownEventHandler);
			this._onTouchMoveEventHandler = this.onTouchMove.bind(this);
			oVSbThumb.addEventListener("touchmove", this._onTouchMoveEventHandler);
			this._onVerticalScrollEventHandler = this.updateVerticalScrollbarThumbPosition.bind(this);
			oVSb.addEventListener("scroll", this._onVerticalScrollEventHandler);
		}

		this.updateVerticalScrollbar();
	};

	/**
	 * Gets DOM reference of the custom vertical scrollbar.
	 *
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the vertical scrollbar does not exist.
	 */
	ScrollIOSExtension.prototype.getVerticalScrollbar = function() {
		var oTable = this.getTable();
		return oTable ? oTable.getDomRef("vsb-ios") : null;
	};

	/**
	 * Gets DOM reference of the thumb of the custom vertical scrollbar.
	 *
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the vertical scrollbar thumb does not exist.
	 */
	ScrollIOSExtension.prototype.getVerticalScrollbarThumb = function() {
		var oVSb = this.getVerticalScrollbar();
		return oVSb ? oVSb.firstElementChild : null;
	};

	/**
	 * Performs a full update of the vertical scrollbar.
	 */
	ScrollIOSExtension.prototype.updateVerticalScrollbar = function() {
		var oTable = this.getTable();
		var oVSbIOS = this.getVerticalScrollbar();

		oVSbIOS.style.height = oTable._getScrollExtension().getVerticalScrollbarHeight() + "px";
		oVSbIOS.style.top = Math.max(0, oTable._getRowCounts().fixedTop * oTable._getBaseRowHeight() - 1) + "px";

		this.updateVerticalScrollbarThumbPosition();
		this.updateVerticalScrollbarThumbHeight();
	};

	/**
	 * Updates the position of the vertical scroll thumb
	 */
	ScrollIOSExtension.prototype.updateVerticalScrollbarThumbPosition = function() {
		var oVSbThumb = this.getVerticalScrollbarThumb();

		if (oVSbThumb) {
			oVSbThumb.style.top = this.getCalculateThumbOffset() + "px";
		}
	};

	/**
	 * Updates the height of the vertical scroll thumb
	 */
	ScrollIOSExtension.prototype.updateVerticalScrollbarThumbHeight = function() {
		var oTable = this.getTable();
		var oScrollExtension = oTable._getScrollExtension();
		var oVSbThumb = this.getVerticalScrollbarThumb();

		if (oVSbThumb) {
			if (oScrollExtension.isVerticalScrollbarRequired()) {
				oVSbThumb.style.height = this.getCalculateThumbHeight() + "px";
			} else {
				oVSbThumb.style.height = "0";
			}
		}
	};

	/**
	 * Calculates the height of the vertical scroll thumb
	 *
	 * @returns {int} The calculated height of the vertical scroll thumb
	 */
	ScrollIOSExtension.prototype.getCalculateThumbHeight = function() {
		var oTable = this.getTable();
		var oScrollExtension = oTable._getScrollExtension();
		var iVerticalScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();
		var iVerticalScrollHeight = oScrollExtension.getVerticalScrollHeight();

		return Math.round(Math.pow(iVerticalScrollbarHeight, 2) / iVerticalScrollHeight);
	};

	/**
	 * Calculates the position of the vertical scroll thumb
	 *
	 * @returns {number} The calculated offset of the vertical scroll thumb
	 */
	ScrollIOSExtension.prototype.getCalculateThumbOffset = function() {
		var oTable = this.getTable();
		var oScrollExtension = oTable._getScrollExtension();
		var iVerticalScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();
		var iVerticalScrollHeight = oScrollExtension.getVerticalScrollHeight();
		var oVSb = oScrollExtension.getVerticalScrollbar();
		var iVerticalScrollTop = oVSb ? oScrollExtension.getVerticalScrollbar().scrollTop : 0;

		return Math.round(iVerticalScrollTop * iVerticalScrollbarHeight / iVerticalScrollHeight);
	};

	/**
	 * Updates the position of the vertical scroll thumb and the table position accordingly
	 *
	 * @param {jQuery.Event} oEvent The event triggered
	 */
	ScrollIOSExtension.prototype.onTouchMove = function(oEvent) {
		var oTable = this.getTable();
		var oScrollExtension = oTable._getScrollExtension();
		var oVSbThumb = this.getVerticalScrollbarThumb();
		var iThumbTop = oVSbThumb.getBoundingClientRect().y;
		var iThumbHeight = this.getCalculateThumbHeight();
		var iTop = oVSbThumb.offsetTop + oEvent.touches[0].pageY - iThumbTop - iThumbHeight / 2;
		var iOffset = Math.min(oScrollExtension.getVerticalScrollbarHeight() - iThumbHeight, Math.max(0, iTop));

		oEvent.preventDefault();
		oEvent.stopPropagation();
		oVSbThumb.style.top = iOffset + "px";

		clearTimeout(this._iUpdateDefaultScrollbarPositionTimeoutId);
		this._iUpdateDefaultScrollbarPositionTimeoutId = setTimeout(function() {
			this.updateDefaultScrollbarPosition(iOffset, iThumbHeight);
			delete this._iUpdateDefaultScrollbarPositionTimeoutId;
		}.bind(this), 30);
	};

	/**
	 * Sets the position of the vertical scroll thumb and updates the table position accordingly
	 *
	 * @param {jQuery.Event} oEvent The event triggered
	 */
	ScrollIOSExtension.prototype.onPointerDown = function(oEvent) {
		var oTable = this.getTable();
		var oScrollExtension = oTable._getScrollExtension();
		var oVSbThumb = this.getVerticalScrollbarThumb();
		var iThumbTop = oVSbThumb.getBoundingClientRect().y;
		var iThumbHeight = this.getCalculateThumbHeight();
		var iTop = oVSbThumb.offsetTop + oEvent.clientY - iThumbTop - iThumbHeight / 2;
		var iOffset = Math.min(oScrollExtension.getVerticalScrollbarHeight() - iThumbHeight, Math.max(0, iTop));

		oEvent.preventDefault();
		oEvent.stopPropagation();

		oVSbThumb.style.top = iOffset + "px";
		this.updateDefaultScrollbarPosition(iOffset, iThumbHeight);
	};

	/**
	 * Updates the scroll position of the default scrollbar
	 *
	 * @param {number} iOffset The position of the scroll thumb
	 * @param {number} iThumbHeight The height of the scroll thumb
	 */
	ScrollIOSExtension.prototype.updateDefaultScrollbarPosition = function(iOffset, iThumbHeight) {
		var oTable = this.getTable();
		if (!oTable) {
			return;
		}

		var oScrollExtension = oTable._getScrollExtension();
		var iScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();

		if (iOffset + iThumbHeight >= iScrollbarHeight) {
			oScrollExtension.scrollVerticallyMax(true);
		} else {
			var iScrollTop = iOffset * oScrollExtension.getVerticalScrollHeight() / iScrollbarHeight;

			var oVSb = oScrollExtension.getVerticalScrollbar();
			oVSb.scrollTop = iScrollTop;
		}
	};

	return ScrollIOSExtension;
});

/**
 * Gets the scroll extension.
 *
 * @name sap.ui.table.Table#_getScrollIOSExtension
 * @function
 * @returns {sap.ui.table.extensions.ScrollingIOS} The scroll extension.
 * @private
 */