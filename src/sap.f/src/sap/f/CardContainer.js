/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/base/ManagedObjectObserver",
	'sap/ui/core/ResizeHandler',
	"sap/ui/core/delegate/ItemNavigation",
	"sap/f/CardContainerRenderer"
], function (
	Control,
	ManagedObjectObserver,
	ResizeHandler,
	ItemNavigation,
	CardContainerRenderer
) {
	"use strict";

	var itemWidth = 5 * 16; // 5 rem
	var gapSize = 16; // 1rem

	function getItemColumnCount(item) {
		var layoutData = item.getLayoutData();
		return layoutData ? layoutData.getColumns() : 1;
	}

	/**
	 * Constructor for a new <code>CardContainer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents ...
	 *
	 * <h3>Overview</h3>
	 *
	 * ...
	 *
	 * <h3>Usage</h3>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.62
	 * @see {@link TODO Card}
	 * @alias sap.f.CardContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CardContainer = Control.extend("sap.f.CardContainer", /** @lends sap.f.CardContainer.prototype */ {
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
				height: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * The items contained by the control.
				 */
				items: {type: "sap.ui.core.Control", multiple: true, singularName: "item"}
			}
		}
	});

	CardContainer.prototype._onBeforeItemRendering = function () {
		var container = this.getParent(),
			resizeListenerId = container._resizeListeners[this.getId()];

		if (resizeListenerId) {
			ResizeHandler.deregister(resizeListenerId);
		}

		delete container._resizeListeners[this.getId()];
	};

	CardContainer.prototype._onAfterItemRendering = function () {
		var container = this.getParent(),
			itemColumnCount = getItemColumnCount(this);

		this.$().parent().css({
			'grid-column': 'span ' + itemColumnCount
		});

		container._resizeListeners[this.getId()] = ResizeHandler.register(this.getDomRef(), container._resizeHandler);
		container._setItemNavigationItems();
		container._applyLayout();
	};

	CardContainer.prototype._onItemChange = function (changes) {
		if (changes.name !== "items" || !changes.child) {
			return;
		}

		if (changes.mutation === "insert") {
			changes.child.addEventDelegate(this._itemDelegate, changes.child);
		} else if (changes.mutation === "remove") {
			changes.child.removeEventDelegate(this._itemDelegate, changes.child);
		}
	};

	CardContainer.prototype._deregisterResizeListeners = function () {
		var key,
			id;

		for (key in this._resizeListeners) {
			id = this._resizeListeners[key];
			ResizeHandler.deregister(id);
		}

		delete this._resizeListeners;
	};

	CardContainer.prototype._setItemNavigationItems = function() {
		if (!this._isRenderingFinished) {
			return;
		}

		// this._itemNavigation.setRootDomRef(this.getDomRef());
		// this._itemNavigation.setItemDomRefs(this.$().children().map(function () {
		// 	return this.firstChild;
		// }));
	};

	CardContainer.prototype.init = function () {

		this._resizeListeners = {};

		this._itemDelegate = {
			onBeforeRendering: this._onBeforeItemRendering,
			onAfterRendering: this._onAfterItemRendering
		};

		this._itemsObserver = new ManagedObjectObserver(this._onItemChange.bind(this));
		this._itemsObserver.observe(this, { aggregations: ["items"] });

		this._resizeHandler = this._resize.bind(this);

		this._itemNavigation = new ItemNavigation().setCycling(false);
		this._itemNavigation.setDisabledModifiers({
			sapnext : ["alt", "meta"],
			sapprevious : ["alt", "meta"]
		});
		this.addDelegate(this._itemNavigation);
	};

	CardContainer.prototype.onBeforeRendering = function () {
		var resizeListenerId = this._resizeListeners[this.getId()];
		if (resizeListenerId) {
			ResizeHandler.deregister(resizeListenerId);
		}

		this._isRenderingFinished = false;
	};

	CardContainer.prototype.onAfterRendering = function () {
		this._resizeListeners[this.getId()] = ResizeHandler.register(this.getDomRef(),  this._resizeHandler);

		this._isRenderingFinished = true;

		this._setItemNavigationItems();
		this._applyLayout();
	};

	CardContainer.prototype.exit = function () {
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

	CardContainer.prototype._resize = function () {
		this._applyLayout();
	};

	CardContainer.prototype._applyLayout = function () {
		if (!this._isRenderingFinished) {
			return;
		}

		this.$().children().each(function () {
			var $this = jQuery(this);
			var height = jQuery($this.children()[0]).outerHeight();
			$this.css({
				'grid-row': 'span ' + (Math.floor(height / (itemWidth + gapSize)) + 1)
			});
		});
	};

	return CardContainer;
});
