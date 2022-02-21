/*!
* ${copyright}
*/

sap.ui.define([
	"../library",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	'sap/ui/core/Icon',
	'./PaginatorRenderer'
], function (
	library,
	mLibrary,
	Core,
	Control,
	Icon
) {
	"use strict";

	/**
	 * Constructor for a new Paginator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.Paginator
	 */
	var Paginator = Control.extend("sap.ui.integration.controls.Paginator", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				card: {type: "object"},
				pageNumber: {type: "int", defaultValue: 0},
				pageCount: {type: "int", defaultValue: 0},
				pageSize: {type: "int", defaultValue: 0},

				totalCount: {type: "int"},
				skip: {type: "int"}
			},
			aggregations: {
				_prevIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				_nextIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			}
		}
	});

	Paginator.create = function (oCard, oConfig) {
		if (!oConfig) {
			return null;
		}

		return new Paginator({
			card: oCard,
			totalCount: oConfig.totalCount,
			pageSize: oConfig.pageSize,
			skip: oConfig.skip
		});
	};

	Paginator.prototype.init = function() {
		this.setAggregation("_prevIcon", new Icon({
			src: "sap-icon://slim-arrow-left",
			useIconTooltip: false,
			decorative: false,
			press: this._previous.bind(this)
		}));

		this.setAggregation("_nextIcon", new Icon({
			src: "sap-icon://slim-arrow-right",
			useIconTooltip: false,
			decorative: false,
			press: this._next.bind(this)
		}));
	};

	Paginator.prototype.exit = function () {
		var oCard = this.getCard();

		if (oCard && this._dataChangedHandler) {
			oCard.detachEvent("_contentDataChange", this._dataChangedHandler);
		}

		delete this._iPreviousStartIndex;
	};

	Paginator.prototype.dataChanged = function() {
		var oCardContent = this.getCard().getCardContent();

		if (!oCardContent || !oCardContent.isA("sap.ui.integration.cards.BaseContent")) {
			this.setPageCount(0);
			return;
		}

		this.setModel(oCardContent.getModel());

		var iTotalCount = this.getTotalCount() || oCardContent.getDataLength();

		this.setPageCount(Math.ceil(iTotalCount / this.getPageSize()));
		this.setPageNumber(Math.min(Math.max(0, this.getPageNumber()), this.getPageCount() - 1));

		this.sliceData();
	};

	Paginator.prototype.setCard = function(oCard) {
		this.setProperty("card", oCard, true);

		this._dataChangedHandler = this.dataChanged.bind(this);

		if (oCard) {
			oCard.attachEvent("_contentDataChange", this._dataChangedHandler);
		}
	};

	Paginator.prototype.sliceData = function() {
		var oCard = this.getCard(),
			oCardContent,
			iStartIndex;

		if (!oCard) {
			return;
		}

		oCardContent = oCard.getCardContent();
		iStartIndex = this.getPageNumber() * this.getPageSize();

		if (this.getTotalCount()) {
			if (this._iPreviousStartIndex !== undefined
				&& this._iPreviousStartIndex !== iStartIndex) {

				this.getModel("paginator").setData({
					skip: iStartIndex,
					size: this.getPageSize(),
					pageIndex: this.getPageNumber()
				});

				oCardContent.refreshData();
			}
		} else {
			oCard.getCardContent().sliceData(iStartIndex, iStartIndex + this.getPageSize());
		}

		this._iPreviousStartIndex = iStartIndex;
	};

	Paginator.prototype._getNavigationArrow = function (sDirection) {
		return this.getAggregation("_" + sDirection + "Icon");
	};

	Paginator.prototype._previous = function () {
		this.setPageNumber(Math.max(0, this.getPageNumber() - 1));
		this.sliceData();
	};

	Paginator.prototype._next = function () {
		this.setPageNumber(Math.min(this.getPageCount() - 1, this.getPageNumber() + 1));
		this.sliceData();
	};

	return Paginator;
});