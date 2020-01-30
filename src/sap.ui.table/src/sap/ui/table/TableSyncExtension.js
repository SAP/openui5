/*!
 * ${copyright}
 */

sap.ui.define([
	"./Table", "./TableExtension", "./TableUtils", "./library", "sap/base/Log"
], function(Table, TableExtension, TableUtils, library, Log) {
	"use strict";

	/**
	 * Provides utility functions.
	 */
	var ExtensionHelper = {
		/**
		 * Sets the selection state of a row.
		 *
		 * @param {int} iIndex The index of the row in the aggregation.
		 * @param {boolean} bSelected Whether the row should be selected.
		 */
		setRowSelection: function(iIndex, bSelected) {
			var oTable = this.getTable();
			var oRow = oTable.getRows()[iIndex];

			if (oRow && bSelected != null) {
				TableUtils.toggleRowSelection(oTable, oRow.getIndex(), bSelected);
			}
		},

		/**
		 * Sets the hover state of a row.
		 *
		 * @param {int} iIndex The index of the row in the aggregation.
		 * @param {boolean} bHovered Whether the row should be hovered.
		 */
		setRowHover: function(iIndex, bHovered) {
			var oTable = this.getTable();
			var oRow = oTable.getRows()[iIndex];

			if (oRow && bHovered != null) {
				oRow._setHovered(bHovered);
			}
		},

		addVerticalScrollingListener: function(mConfig) {
			var oTable = this.getTable();
			var oScrollExtension = oTable._getScrollExtension();
			var ScrollDirection = oScrollExtension.constructor.ScrollDirection;

			if (mConfig) {
				oScrollExtension.registerForMouseWheel(mConfig.wheelAreas, {scrollDirection: ScrollDirection.VERTICAL});
				oScrollExtension.registerForTouch(mConfig.touchAreas, {scrollDirection: ScrollDirection.VERTICAL});
			}
		},

		placeVerticalScrollbarAt: function(oHTMLElement) {
			var oTable = this.getTable();
			var oScrollExtension = oTable._getScrollExtension();

			if (!oHTMLElement) {
				throw new Error("The HTMLElement in which the vertical scrollbar should be placed must be specified.");
			}

			if (!oScrollExtension.isVerticalScrollbarExternal()) {
				var oRenderManager = sap.ui.getCore().createRenderManager();
				oTable.getRenderer().renderVSbExternal(oRenderManager, oTable);
				oRenderManager.flush(oHTMLElement);

				// Notify ScrollExtension and table that the vertical scrollbar is now rendered outside the table.
				var oExternalVerticalScrollbar = oHTMLElement.querySelector("#" + oTable.getId() + "-" + library.SharedDomRef.VerticalScrollBar);
				oScrollExtension.markVerticalScrollbarAsExternal(oExternalVerticalScrollbar);

				// Rendering the vertical scrollbar outside the table makes it necessary to remove the currently existing internal scrollbar from the
				// table's DOM and update the table's CSS. Also event listeners need to be attached to the new scrollbar element.
				oTable.invalidate();
			} else {
				// To avoid table invalidation on every call of this method, the scrollbar that is still in memory is inserted back into the DOM.
				oHTMLElement.appendChild(oScrollExtension.getVerticalScrollbar());

				// If an element is removed from DOM and is inserted again, the scroll position is reset to 0 and needs to be restored.
				oScrollExtension.updateVerticalScrollPosition(oScrollExtension._nVerticalScrollPosition);
			}
		},

		renderHorizontalScrollbar: function(oRM, sId, iScrollWidth) {
			var oTable = this.getTable();

			if (sId == null) {
				throw new Error("The id must be specified.");
			}

			oTable.getRenderer().renderHSbExternal(oRM, oTable, sId, iScrollWidth);
		}
	};

	var ExtensionDelegate = {
		onAfterRendering: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bRenderedRows = oEvent && oEvent.isMarked("renderRows");
			var oContentDomRef = this.getDomRef("tableCCnt");

			// On a full re-rendering of the table, the newly rendered scrollbar would have the correct attributes already. The external
			// scrollbar is independent from the tables rendering and therefore needs to be updated after rendering.
			if (oScrollExtension.isVerticalScrollbarExternal() && !bRenderedRows) {
				oScrollExtension.updateVerticalScrollbarHeight();
				oScrollExtension.updateVerticalScrollHeight();
			}

			// Temporarily handled by this extension. A change of the inner vertical scroll position by focus change is currently not handled.
			// As soon as this works, synchronization of the inner vertical scroll position should be triggered by the scroll extension, not by the
			// sync extension.
			// BLI: CPOUIFTEAMB-667
			if (!bRenderedRows) {
				oContentDomRef.addEventListener("scroll", function(oEvent) {
					this._getSyncExtension().syncInnerVerticalScrollPosition(oEvent.target.scrollTop);
				}.bind(this));
			}
		}
	};

	/**
	 * Extension for sap.ui.table.Table that allows synchronization with a table.
	 * It provides an API to allow other controls to synchronize with certain parts of the table for which the table's public and protected APIs
	 * are insufficient.
	 *
	 * @class Extension for sap.ui.table.Table that allows synchronization with a table.
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableSyncExtension
	 */
	var TableSyncExtension = TableExtension.extend("sap.ui.table.TableSyncExtension",
		/** @lends sap.ui.table.TableSyncExtension.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._delegate = ExtensionDelegate;
			this._oPublicInterface = {
				syncRowSelection: ExtensionHelper.setRowSelection.bind(this),
				syncRowHover: ExtensionHelper.setRowHover.bind(this),
				registerVerticalScrolling: ExtensionHelper.addVerticalScrollingListener.bind(this),
				placeVerticalScrollbarAt: ExtensionHelper.placeVerticalScrollbarAt.bind(this),
				renderHorizontalScrollbar: ExtensionHelper.renderHorizontalScrollbar.bind(this)
			};

			TableUtils.addDelegate(this._delegate, oTable, true);

			return "SyncExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			var oTable = this.getTable();

			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}

			this._delegate = null;
			this._oPublicInterface = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		}
	});

	/**
	 * Synchronizes the number of rendered rows.
	 *
	 * @param {int} iCount The number of rendered rows.
	 */
	TableSyncExtension.prototype.syncRowCount = function(iCount) {
		this.callInterfaceHook("rowCount", arguments);
	};

	/**
	 * Synchronizes the selection state of a row.
	 *
	 * @param {int} iIndex The index of the row.
	 * @param {boolean} bSelected Whether the row is selected.
	 */
	TableSyncExtension.prototype.syncRowSelection = function(iIndex, bSelected) {
		this.callInterfaceHook("rowSelection", arguments);
	};

	/**
	 * Synchronizes the hover state of a row.
	 *
	 * @param {int} iIndex The index of the row.
	 * @param {boolean} bHovered Whether the row is hovered.
	 */
	TableSyncExtension.prototype.syncRowHover = function(iIndex, bHovered) {
		this.callInterfaceHook("rowHover", arguments);
	};

	/**
	 * Synchronizes the heights of the rendered rows.
	 *
	 * @param {number[]} aHeights The row heights.
	 * @returns {any} Returns the return value of the hook method.
	 */
	TableSyncExtension.prototype.syncRowHeights = function(aHeights) {
		return this.callInterfaceHook("rowHeights", arguments);
	};

	/**
	 * Synchronizes the inner vertical scroll position.
	 *
	 * @param {int[]} iScrollPosition The inner vertical scroll position.
	 */
	TableSyncExtension.prototype.syncInnerVerticalScrollPosition = function(iScrollPosition) {
		this.callInterfaceHook("innerVerticalScrollPosition", arguments);
	};

	/**
	 * Synchronizes the layout information.
	 *
	 * @param {{top:number, headerHeight:number, contentHeight:number}} mLayoutData The layout information.
	 */
	TableSyncExtension.prototype.syncLayout = function(mLayoutData) {
		this.callInterfaceHook("layout", arguments);
	};

	/**
	 * Calls a hook on the interface if it exists. Passes the arguments to the hook.
	 *
	 * @param {string} sHook The name of the hook.
	 * @param {Object} oArguments The arguments object to pass to the hook.
	 * @returns {any} Returns the return value of the hook method.
	 * @private
	 */
	TableSyncExtension.prototype.callInterfaceHook = function(sHook, oArguments) {
		var oCall = {};
		oCall[sHook] = Array.prototype.slice.call(oArguments);
		Log.debug("sap.ui.table.TableSyncExtension", "Sync " + sHook + "(" + oCall[sHook] + ")", this.getTable());
		return TableUtils.dynamicCall(this._oPublicInterface, oCall);
	};

	/**
	 * Notifications of changes in the table are made via hooks that can be added to the public interface of this extension.
	 * Available hooks:
	 * <ul>
	 *   <li>rowCount: function(count:int):void</li>
	 *   <li>rowSelection: function(index:int, selected:boolean):void</li>
	 *   <li>rowHover: function(index:int, hovered:boolean}:void</li>
	 *   <li>rowHeights: function(heights:float[]):undefined|float[]</li>
	 *   <li>innerVerticalScrollPosition: function(position:int):void</li>
	 *   <li>layout: function({top:float, headerHeight:float, contentHeight:float}):void</li>
	 * </ul>
	 *
	 * It is also possible to synchronize something back to the table and let the table handle certain events on outside elements, e.g. for vertical
	 * scrolling.
	 * Available methods:
	 * <ul>
	 *   <li>syncRowSelection: function(index:int, selected:boolean):void</li>
	 *   <li>syncRowHover: function(index:int, selected:boolean):void</li>
	 *   <li>registerVerticalScrolling: function({wheelAreas:HTMLElement[], touchAreas:HTMLElement[]}):void</li>
	 *   <li>placeVerticalScrollbarAt: function(container:HTMLElement):void</li>
	 *   <li>renderHorizontalScrollbar: function(renderManager:sap.ui.core.RenderManager, id:string, scrollWidth:int):void</li>
	 * </ul>
	 *
	 * <b>Note</b>
	 * Synchronization is only fully working if the table is rendered.
	 * Row selection, row hover and row heights synchronization is only fully working if the rows aggregation of the table is bound.
	 * There is no initial synchronization. Make sure to setup synchronization before rendering, or invalidate the table afterwards.
	 * The <code>SyncExtension</code> has no mechanisms to avoid infinite synchronization loops. This means that the <code>SyncExtension</code> can
	 * also call the corresponding hook if a synchronization method of this interface is used. It is the responsibility of the user of the
	 * synchronization interface to avoid endless loops.
	 * Registering HTMLElements for event handling by the table (e.g. via <code>registerVerticalScrolling</code>) can cause memory leaks. To avoid
	 * this, make sure to avoid registering the same elements multiple times.
	 *
	 * @example
	 * // Add a row selection hook.
	 * oInterface.rowSelection = function(iIndex, bSelected) {...};
	 * // Add a row heights hook.
	 * oInterface.rowHeights = function(aHeights) {...};
	 * // Add a row heights hook that changes a row height.
	 * oInterface.rowHeights = function(aHeights) {
	 *     aHeights[0] += 10;
	 *     return aHeights;
	 * }
	 * // Select the first rendered row in the table.
	 * oInterface.syncRowSelection(0, true);
	 * @override
	 * @inheritDoc
	 */
	TableSyncExtension.prototype.getInterface = function() {
		return this._oPublicInterface;
	};

	return TableSyncExtension;
});

/**
 * Gets the synchronization extension.
 *
 * @name sap.ui.table.Table#_getSyncExtension
 * @function
 * @returns {sap.ui.table.TableSyncExtension} The synchronization extension.
 * @private
 */