/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/base/ManagedObjectObserver",
	'sap/ui/core/ResizeHandler',
	"sap/ui/core/delegate/ItemNavigation",
	"sap/f/GridContainerRenderer",
	"sap/ui/Device",
	"sap/ui/layout/cssgrid/VirtualGrid",
	"sap/f/GridContainerSettings",
	"sap/ui/dom/units/Rem",
	"sap/base/Log"

], function (Control,
             ManagedObjectObserver,
             ResizeHandler,
             ItemNavigation,
             GridContainerRenderer,
             Device,
			 VirtualGrid,
			 GridContainerSettings,
			 Rem,
			 Log) {
	"use strict";

	var EDGE_VERSION_WITH_GRID_SUPPORT = 16;

	function getItemColumnCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getColumns() : 1;
	}

	function getItemRowCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getActualRows() : 1;
	}

	function hasItemAutoHeight(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.hasAutoHeight() : true;
	}

	function calcChildrenHeight($item) {
		var height = 0;

		$item.children().each(function () {
			height += jQuery(this).height();
		});

		return height;
	}

	/**
	 * @public
	 * @returns {boolean} If native grid is supported by the browser
	 */
	function isGridSupportedByBrowser() {
		return !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);
	}

	/**
	 * Constructor for a new <code>sap.f.GridContainer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A layout container control used for aligning items with various sizes in a simple grid.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control is used to align tiles, cards and other controls in configuration, such as a home page or a dashboard.
	 * It represents a grid layout with specific row and column sizes, in which the items can take any number of rows and columns.
	 *
	 * The number of columns and rows each item takes can be configured with the use of the <code>{@link sap.f.GridContainerItemLayoutData}</code>.
	 *
	 * All rows have the same height and all columns have the same width. Their sizes can be configured with the use of the <code>layout</code> aggregation and <code>{@link sap.f.GridContainerSettings}</code>.
	 *
	 * <h3>Usage</h3>
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>For aligning home page and dashboard items like Tiles and Cards in a simple grid system with equally sized rows and columns.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>If a more complex layout grid system, where columns and rows may vary in size, is needed.</li>
	 * </ul>
	 *
	 * <h3>Example:</h3>
	 * <pre>
	 * &lt;f:GridContainer&gt;
	 * 	&lt;f:layout&gt;
	 * 		&lt;f:GridContainerSettings rowSize=&quot;5rem&quot; columnSize=&quot;5rem&quot; gap=&quot;1rem&quot; /&gt;
	 * 	&lt;/f:layout&gt;
	 * 	&lt;f:layoutS&gt;
	 * 		&lt;f:GridContainerSettings rowSize=&quot;4rem&quot; columnSize=&quot;4rem&quot; gap=&quot;0.5rem&quot; /&gt;
	 * 	&lt;/f:layoutS&gt;
	 * 	&lt;f:items&gt;
	 * 		&lt;GenericTile header=&quot;Sales Fulfillment&quot;&gt;
	 * 			&lt;layoutData&gt;
	 * 				&lt;f:GridContainerItemLayoutData rows=&quot;2&quot; columns=&quot;2&quot; /&gt;
	 * 			&lt;/layoutData&gt;
	 * 		&lt;/GenericTile&gt;
	 * 		&lt;w:Card manifest=&quot;url-to-manifest&quot;&gt;
	 * 			&lt;w:layoutData&gt;
	 * 				&lt;f:GridContainerItemLayoutData rows=&quot;6&quot; columns=&quot;3&quot; /&gt;
	 * 			&lt;/w:layoutData&gt;
	 * 		&lt;/w:Card&gt;
	 * 		&lt;Panel&gt;
	 * 			&lt;layoutData&gt;
	 * 				&lt;f:GridContainerItemLayoutData columns=&quot;4&quot; /&gt;
	 * 			&lt;/layoutData&gt;
	 * 			&lt;Text text=&quot;Sales information&quot; /&gt;
	 * 		&lt;/Panel&gt;
	 * 	&lt;/f:items&gt;
	 * &lt;/f:GridContainer&gt;
	 * </pre>
	 *
	 * @see {@link topic:cca5ee5d63ca44c89318f8496a58f9f2 Grid Container (Experimental)}
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 * @see {@link topic:5b46b03f024542ba802d99d67bc1a3f4 Cards}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @experimental Since 1.65 This class is experimental. The API may change.
	 * @since 1.65
	 * @public
	 * @constructor
	 * @alias sap.f.GridContainer
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainer = Control.extend("sap.f.GridContainer", /** @lends sap.f.GridContainer.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * Defines the width of the control
				 *
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""},

				/**
				 * Defines the height of the control
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""},

				/**
				 * Should the items stretch to fill the rows which they occupy, or not.
				 * If set to true the items will stretch.
				 */
				snapToRow: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * The items contained by the control.
				 */
				items: {type: "sap.ui.core.Control", multiple: true, singularName: "item", dnd: true },

				/**
				 * The sap.f.GridContainerSettings applied if no settings are provided for a specific size
				 * If no layout is given, a default layout will be used. See the default values for <code>sap.f.GridContainerSettings</code>.
				 */
				layout: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "S"
				 */
				layoutS: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "M"
				 */
				layoutM: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "L"
				 */
				layoutL: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * The sap.f.GridContainerSettings applied for size "XL"
				 */
				layoutXL: { type: "sap.f.GridContainerSettings", multiple: false },

				/**
				 * Default sap.f.GridContainerSettings
				 */
				_defaultLayout: { type: "sap.f.GridContainerSettings", multiple: false, visibility: "hidden" }
			},
			dnd: { draggable: false, droppable: true }
		}
	});

	GridContainer.prototype._onBeforeItemRendering = function () {
		var container = this.getParent(),
			resizeListenerId = container._resizeListeners[this.getId()];

		if (resizeListenerId) {
			ResizeHandler.deregister(resizeListenerId);
		}

		delete container._resizeListeners[this.getId()];
	};

	GridContainer.prototype._onAfterItemRendering = function () {

		var container = this.getParent();

		if (!isGridSupportedByBrowser()) {
			container._applyIEPolyfillForItem(this);
		}

		container._resizeListeners[this.getId()] = ResizeHandler.register(this.getDomRef(), container._resizeHandler);
		container._setItemNavigationItems();
		container._applyLayout();
	};

	GridContainer.prototype._onItemChange = function (changes) {
		if (changes.name !== "items" || !changes.child) {
			return;
		}

		if (changes.mutation === "insert") {
			changes.child.addEventDelegate(this._itemDelegate, changes.child);
		} else if (changes.mutation === "remove") {
			changes.child.removeEventDelegate(this._itemDelegate, changes.child);
		}
	};

	GridContainer.prototype._deregisterResizeListeners = function () {
		var key,
			id;

		for (key in this._resizeListeners) {
			id = this._resizeListeners[key];
			ResizeHandler.deregister(id);
		}

		delete this._resizeListeners;
	};

	GridContainer.prototype._setItemNavigationItems = function () {
		if (!this._isRenderingFinished) {
			return;
		}

		// this._itemNavigation.setRootDomRef(this.getDomRef());
		// this._itemNavigation.setItemDomRefs(this.$().children().map(function () {
		// 	return this.firstChild;
		// }));
	};

	GridContainer.prototype._detectActiveLayout = function () {
		var iWidth = window.innerWidth, // TODO can use containerQuery approach which is used in CSSGrid
			oRange = Device.media.getCurrentRange("StdExt", iWidth),
			sLayout = GridContainer.mSizeLayouts[oRange.name];

		if (this._sActiveLayout === sLayout) {
			return;
		}

		this._sActiveLayout = sLayout;

		// TODO fire event
	};

	GridContainer.prototype.getActiveLayoutSettings = function () {
		return this.getAggregation(this._sActiveLayout)
			|| this.getAggregation("layout")
			|| this.getAggregation("_defaultLayout");
	};

	GridContainer.prototype.init = function () {
		this.setAggregation("_defaultLayout", new GridContainerSettings());
		this._detectActiveLayout();

		this._resizeListeners = {};

		this._itemDelegate = {
			onBeforeRendering: this._onBeforeItemRendering,
			onAfterRendering: this._onAfterItemRendering
		};

		this._itemsObserver = new ManagedObjectObserver(this._onItemChange.bind(this));
		this._itemsObserver.observe(this, {aggregations: ["items"]});

		this._resizeHandler = this._resize.bind(this);

		this._itemNavigation = new ItemNavigation().setCycling(false);
		this._itemNavigation.setDisabledModifiers({
			sapnext: ["alt", "meta"],
			sapprevious: ["alt", "meta"]
		});
		this.addDelegate(this._itemNavigation);
	};

	GridContainer.prototype.onBeforeRendering = function () {
		var resizeListenerId = this._resizeListeners[this.getId()];
		if (resizeListenerId) {
			ResizeHandler.deregister(resizeListenerId);
		}

		this._isRenderingFinished = false;
	};

	GridContainer.prototype.onAfterRendering = function () {
		this._resizeListeners[this.getId()] = ResizeHandler.register(this.getDomRef(), this._resizeHandler);

		this._isRenderingFinished = true;

		this._setItemNavigationItems();
		this._applyLayout();
	};

	GridContainer.prototype.exit = function () {
		this._deregisterResizeListeners();

		if (this._itemsObserver) {
			this._itemsObserver.disconnect();
			delete this._itemsObserver;
		}

		if (this._itemNavigation) {
			this.removeDelegate(this._itemNavigation);
			this._itemNavigation.destroy();
			delete this._itemNavigation;
		}
	};

	GridContainer.prototype._resize = function () {
		var oOldSettings = this.getActiveLayoutSettings();
		this._detectActiveLayout();

		if (oOldSettings !== this.getActiveLayoutSettings()) {
			// layout was changed - invalidate
			// TODO optimize, no need to invalidate
			this.invalidate();
			return;
		}

		this._applyLayout();
	};

	GridContainer.prototype._applyLayout = function () {
		if (!this._isRenderingFinished) {
			return;
		}

		if (isGridSupportedByBrowser()) {
			var oContainer = this;
			this.getItems().forEach(function (oItem) {
				if (hasItemAutoHeight(oItem)) {
					var $item = oItem.$(),
						height = $item.height(),
						$container = oContainer.$(),
						rowHeight = parseInt($container.css("grid-auto-rows")),
						gapSize = parseInt($container.css("grid-row-gap")),
						rows = Math.ceil((height + gapSize) / (rowHeight + gapSize));

					$item.parent().css({
						'grid-row': 'span ' + Math.max(rows, getItemRowCount(oItem))
					});
				}
			});
		} else {
			this._applyIEPolyfillLayout();
		}
	};

	/**
	 * ===================== IE11 Polyfill =====================
	 */

	function cssSizeToPx(sCssSize) {
		if (sCssSize === 0 || sCssSize === "0") {
			return 0;
		}

		var aMatch = sCssSize.match(/^(\d+(\.\d+)?)(px|rem)$/);
		if (aMatch) {
			if (aMatch[3] === "px") {
				return parseFloat(aMatch[1]);
			} else {
				return Rem.toPx(parseFloat(aMatch[1]));
			}
		} else {
			Log.error("Css size '" + sCssSize + "' is not supported for GridContainer. Only 'px' and 'rem' are supported.");
		}
	}

	GridContainer.prototype._applyIEPolyfillForItem = function (oItem) {
		var oSettings = this.getActiveLayoutSettings(),
			itemWidth = cssSizeToPx(oSettings.getColumnSize()),
			itemHeight = cssSizeToPx(oSettings.getRowSize()),
			gapSize = cssSizeToPx(oSettings.getGap()),
			itemColumnCount = getItemColumnCount(oItem),
			width = itemColumnCount * itemWidth + (itemColumnCount - 1) * gapSize,
			css = {
				top: 0,
				left: 0,
				width: width,
				position: 'absolute'
			};

		if (!hasItemAutoHeight(oItem)) {
			var itemRowCount = getItemRowCount(oItem);
			css.height = itemRowCount * itemHeight + (itemRowCount - 1) * gapSize;
		}

		oItem.$().parent().css(css);
	};

	GridContainer.prototype._applyIEPolyfillLayout = function () {

		var $that = this.$(),
			width = $that.innerWidth(),
			oSettings = this.getActiveLayoutSettings(),
			itemWidth = cssSizeToPx(oSettings.getColumnSize()),
			itemHeight = cssSizeToPx(oSettings.getRowSize()),
			gapSize = cssSizeToPx(oSettings.getGap()),
			columnsCount = oSettings.getColumns() || Math.floor((width + gapSize) / (itemWidth + gapSize)),
			topOffset = parseInt($that.css("padding-top").replace("px", "")),
			leftOffset = parseInt($that.css("padding-left").replace("px", "")),
			items = this.getItems(),
			$children = this.$().children();

		if (!items.length) {
			return;
		}

		var virtualGrid = new VirtualGrid();
		virtualGrid.init({
			numberOfCols: Math.max(1, columnsCount),
			cellWidth: itemWidth,
			cellHeight: itemHeight,
			unitOfMeasure: "px",
			gapSize: gapSize,
			topOffset: topOffset ? topOffset : 0,
			leftOffset: leftOffset ? leftOffset : 0
		});

		var i,
			item,
			virtualGridItem,
			columns,
			$child,
			$card,
			rows,
			height,
			itemsRows = [];

		for (i = 0; i < items.length; i++) {
			item = items[i];
			columns = getItemColumnCount(item);
			$child = jQuery($children.get(i));

			if (hasItemAutoHeight(item)) {

				$card = $child.find('.sapFCard');

				// todo - check this
				if ($card.length) {
					height = $card.height();
				} else {
					height = calcChildrenHeight($child);
				}

				rows = Math.ceil((height + gapSize) / (itemHeight + gapSize));
			} else {
				rows = getItemRowCount(item);
			}

			itemsRows[i] = rows;

			virtualGrid.fitElement(i + '', columns, rows);
		}

		virtualGrid.calculatePositions();

		for (i = 0; i < items.length; i++) {
			item = items[i];
			virtualGridItem = virtualGrid.getItems()[i];
			$child = jQuery($children.get(i));
			rows = itemsRows[i];

			$child.css({
				position: 'absolute',
				top: virtualGridItem.top,
				left: virtualGridItem.left,
				height: rows * itemHeight + (rows - 1) * gapSize
			});
		}

		$that.css("height", virtualGrid.getHeight() + "px");
	};

	/**
	 * A map from Std-ext size to layout aggregation name
	 * @private
	 */
	GridContainer.mSizeLayouts = {
		"Phone": "layoutS",
		"Tablet": "layoutM",
		"Desktop": "layoutL",
		"LargeDesktop": "layoutXL"
	};

	return GridContainer;
});
