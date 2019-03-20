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
	"sap/ui/layout/cssgrid/VirtualGrid"

], function (Control,
             ManagedObjectObserver,
             ResizeHandler,
             ItemNavigation,
             GridContainerRenderer,
             Device,
             VirtualGrid) {
	"use strict";

	var itemWidth = 5 * 16; // 5 rem
	var gapSize = 16; // 1rem
	var EDGE_VERSION_WITH_GRID_SUPPORT = 16;

	function getItemColumnCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getColumns() : 1;
	}

	function getItemRowCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getRows() : 1;
	}

	function getItemRowsAutoSpan(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getRowsAutoSpan() : true;
	}

	function getScrollHeight($item) {
		var childrenScrollHeight = 0;

		$item.children().each(function () {
			childrenScrollHeight += this.scrollHeight;
		});

		return Math.max(childrenScrollHeight, $item[0].scrollHeight);
	}

	/**
	 * @public
	 * @returns {boolean} If native grid is supported by the browser
	 */
	function isGridSupportedByBrowser() {
		return !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);
	}

	/**
	 * Constructor for a new <code>GridContainer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A container control which uses css display grid to show items in a grid.
	 * Main usage is to position cards and tiles on a home page.
	 *
	 * <h3>Overview</h3>
	 * TODO
	 *
	 * <h3>Usage</h3>
	 * TODO
	 *
	 * <h3>Responsive Behavior</h3>
	 * TODO
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.65
	 * @see {@link TODO Card}
	 * @alias sap.f.GridContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
				 * Should the items stretch to fill the rows which they occupy
				 */
				itemsStretch: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * The items contained by the control.
				 */
				items: {type: "sap.ui.core.Control", multiple: true, singularName: "item", dnd: true }
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
		var container = this.getParent(),
			itemColumnCount = getItemColumnCount(this),
			$item = this.$();

		if ($item[0].style.height === "auto"
			&& (container.getItemsStretch() || $item.hasClass("sapFCardStretchableContent"))) {
			$item.height("100%");
		}

		if (!isGridSupportedByBrowser()) {
			var width = itemColumnCount * itemWidth + (itemColumnCount - 1) * gapSize,
				css = {
					top: 0,
					left: 0,
					width: width,
					position: 'absolute'
				};

			if (!getItemRowsAutoSpan(this)) {
				var itemRowCount = getItemRowCount(this);
				css.height = itemRowCount * itemWidth + (itemRowCount - 1) * gapSize;
			}

			this.$().parent().css(css);
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

	GridContainer.prototype.init = function () {

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
		this._applyLayout();
	};

	GridContainer.prototype._applyLayout = function () {
		if (!this._isRenderingFinished) {
			return;
		}

		if (isGridSupportedByBrowser()) {
			this.getItems().forEach(function (oItem) {
				if (getItemRowsAutoSpan(oItem)) {
					var $item = oItem.$();
					var height = getScrollHeight($item);
					$item.parent().css({
						'grid-row': 'span ' + (Math.floor(height / (itemWidth + gapSize)) + 1)
					});
				}
			});
		} else {
			this._applyIEPolyfillLayout();
		}


	};

	GridContainer.prototype._applyIEPolyfillLayout = function () {

		var $that = this.$(),
			width = $that.innerWidth(),
			columnsCount = Math.floor((width - gapSize) / (itemWidth + gapSize)),
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
			cellHeight: itemWidth,
			unitOfMeasure: "px",
			gapSize: gapSize,
			topOffset: topOffset ? topOffset : 0,
			leftOffset: leftOffset ? leftOffset : 0
		});

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var columns = getItemColumnCount(item);
			var $child = jQuery($children.get(i));

			var rows;
			if (getItemRowsAutoSpan(item)) {
				var height = getScrollHeight(jQuery($child.children().get(0)));
				rows = (Math.floor(height / (itemWidth + gapSize)) + 1);
			} else {
				rows = getItemRowCount(item);
			}

			virtualGrid.fitElement(i + '', columns, rows);
		}

		virtualGrid.calculatePositions();

		for (var i = 0; i < items.length; i++) {
			var item = virtualGrid.getItems()[i];
			var $child = jQuery($children.get(i));

			$child.css({
				position: 'absolute',
				top: item.top,
				left: item.left
			});
		}

		$that.css("height", virtualGrid.getHeight() + "px");
	};

	return GridContainer;
});
