/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/ResizeHandler",
	"sap/ui/base/ManagedObjectObserver"
], function (
	BaseObject,
	ResizeHandler,
	ManagedObjectObserver
) {
	"use strict";

	/**
	 * Constructor for a new <code>MicrochartsResizeHelper</code>.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.cards.list.MicrochartsResizeHelper
	 * @abstract
	 */
	var MicrochartsResizeHelper = BaseObject.extend("sap.ui.integration.cards.list.MicrochartsResizeHelper", {
		constructor: function (oList) {
			BaseObject.call(this);

			this._oItemDelegate = {
				onAfterRendering: this._onAfterItemRendering
			};

			this._oList = oList;
			this._oItemsObserver = new ManagedObjectObserver(this._onItemChange.bind(this));
			this._oItemsObserver.observe(oList, {aggregations: ["items"]});
		}
	});

	/**
	 * @override
	 */
	MicrochartsResizeHelper.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);

		if (this._iMicrochartsResizeHandler) {
			ResizeHandler.deregister(this._iMicrochartsResizeHandler);
			this._iMicrochartsResizeHandler = undefined;
		}

		if (this._iResizeMicrochartsTimeout) {
			clearTimeout(this._iResizeMicrochartsTimeout);
			this._iResizeMicrochartsTimeout = null;
		}

		this._oItemsObserver = null;
		this._oItemDelegate = null;
	};

	/**
	 * @private
	 * @param {Object} mChanges The changes.
	 */
	MicrochartsResizeHelper.prototype._onItemChange = function (mChanges) {
		if (mChanges.name !== "items" || !mChanges?.child?.getMicrochart?.()) {
			return;
		}

		if (mChanges.mutation === "insert") {
			mChanges.child.getMicrochart().addEventDelegate(this._oItemDelegate, this);
		} else if (mChanges.mutation === "remove") {
			mChanges.child.getMicrochart().removeEventDelegate(this._oItemDelegate, this);
		}
	};

	/**
	 * @private
	 */
	MicrochartsResizeHelper.prototype._onAfterItemRendering = function () {
		this._scheduleResizeMicrocharts();
	};

	/**
	 * @private
	 */
	MicrochartsResizeHelper.prototype._scheduleResizeMicrocharts = function () {
		if (this._iResizeMicrochartsTimeout) {
			clearTimeout(this._iResizeMicrochartsTimeout);
			this._iResizeMicrochartsTimeout = null;
		}

		this._iResizeMicrochartsTimeout = setTimeout(function () {
			this._resizeMicrocharts();
		}.bind(this), 0);
	};

	/**
	 * @private
	 */
	MicrochartsResizeHelper.prototype._resizeMicrocharts = function () {
		var $charts = this._oList.$().find(".sapUiIntMicrochartChart"),
			iShortestWidth = Number.MAX_VALUE;

		if ($charts.length === 0) {
			return;
		}

		$charts.each(function (iIndex, oChartWrapper) {
			iShortestWidth = Math.min(iShortestWidth, oChartWrapper.offsetWidth);
		});

		$charts.find(".sapUiIntMicrochartChartInner").css("max-width", iShortestWidth + "px");

		if (!this._iMicrochartsResizeHandler) {
			this._iMicrochartsResizeHandler = ResizeHandler.register(this._oList, this._resizeMicrocharts.bind(this));
		}
	};

	return MicrochartsResizeHelper;
});
