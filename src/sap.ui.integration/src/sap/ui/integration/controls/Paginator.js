/*!
* ${copyright}
*/

sap.ui.define([
	"../library",
	"sap/m/library",
	"sap/ui/base/EventProvider",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/Configuration",
	'sap/ui/core/Icon',
	'./PaginatorRenderer'
], function (
	library,
	mLibrary,
	EventProvider,
	Core,
	Control,
	Configuration,
	Icon
) {
	"use strict";

	var sAnimationMode = Core.getConfiguration().getAnimationMode(),
		bHasAnimations = sAnimationMode !== Configuration.AnimationMode.none && sAnimationMode !== Configuration.AnimationMode.minimal,
		iServerSideAfterTransitionDelay = 200;

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
		this._listUpdateFinishedHandler = this._listUpdateFinished.bind(this);

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
		var oCard = this.getCard(),
			oContent,
			oList;

		if (oCard) {
			if (this._dataChangedHandler) {
				oCard.detachEvent("_contentDataChange", this._dataChangedHandler);
			}

			oContent = oCard.getCardContent();

			if (oContent) {
				oList = oContent.getAggregation("_content");

				if (oList && EventProvider.hasListener(oList, "updateFinished", this._listUpdateFinishedHandler)) {
					oList.detachEvent("updateFinished", this._listUpdateFinishedHandler);
				}
			}
		}

		delete this._listUpdateFinishedHandler;
		delete this._iPreviousStartIndex;
		delete this._oClonedContent;
	};

	Paginator.prototype.isServerSide = function() {
		return this.getTotalCount();
	};

	Paginator.prototype._dataChanged = function() {
		var oCard = this.getCard(),
			oContent = oCard.getCardContent(),
			oList,
			iTotalCount,
			bInitialized;

		if (!oContent || !oContent.isA("sap.ui.integration.cards.BaseContent")) {
			this.setPageCount(0);
			return;
		}

		this.setModel(oContent.getModel());

		oList = oContent.getAggregation("_content");
		bInitialized = EventProvider.hasListener(oList, "updateFinished", this._listUpdateFinishedHandler);

		if (this._hasAnimation() && !bInitialized) {
			oList.attachEvent("updateFinished", this._listUpdateFinishedHandler);

			if (this.isServerSide()) {
				oContent.getAggregation("_loadingProvider")._oContentPlaceholder.addDelegate({
					onAfterRendering: this.onPlaceholderAfterRendering.bind(this)
				});
			}
		}

		if (bInitialized) {
			this._clearAnimation(this);
		}

		iTotalCount = this.getTotalCount() || oContent.getDataLength();

		this.setPageCount(Math.ceil(iTotalCount / this.getPageSize()));
		this.setPageNumber(Math.min(Math.max(0, this.getPageNumber()), this.getPageCount() - 1));

		this.sliceData();
	};

	Paginator.prototype.setCard = function(oCard) {
		this.setProperty("card", oCard, true);

		this._dataChangedHandler = this._dataChanged.bind(this);

		if (oCard) {
			oCard.attachEvent("_contentDataChange", this._dataChangedHandler);
		}
		return this;
	};

	Paginator.prototype.sliceData = function() {
		var oCard = this.getCard(),
			oContent,
			iStartIndex,
			bIsPageChanged;

		if (!oCard) {
			return;
		}

		oContent = oCard.getCardContent();
		iStartIndex = this.getPageNumber() * this.getPageSize();
		bIsPageChanged =  this._iPreviousStartIndex !== undefined && this._iPreviousStartIndex !== iStartIndex;

		if (bIsPageChanged) {
			this._prepareAnimation(iStartIndex);
		}

		if (this.isServerSide()) {
			if (bIsPageChanged) {
				// changing the model is triggering data update
				// so there is no need to call "refreshData" method
				this.getModel("paginator").setData({
					skip: iStartIndex,
					size: this.getPageSize(),
					pageIndex: this.getPageNumber()
				});

				if (this._hasAnimation()) {
					oContent.getAggregation("_loadingProvider")._bAwaitPagination = true;
					oCard.getAggregation("_loadingProvider")._bAwaitPagination = true;
				}
			}
		} else {
			oContent.sliceData(iStartIndex, iStartIndex + this.getPageSize());
		}

		this._iPreviousStartIndex = iStartIndex;
	};

	Paginator.prototype._prepareAnimation = function (iStartIndex) {
		if (!this._hasAnimation()) {
			return;
		}

		var oContentDomRef = this.getCard().getCardContent().getDomRef(),
			oContentDomRefCloned = oContentDomRef.cloneNode(true);

		this._bActiveAnimation = true;
		this._bReverseAnimation = this._iPreviousStartIndex > iStartIndex;

		oContentDomRefCloned.removeAttribute("id");

		oContentDomRefCloned.querySelectorAll("*[id]").forEach(function (oElement) {
			oElement.removeAttribute("id");
		});

		oContentDomRefCloned.classList.add("sapFCardContentCloned");
		if (this._bReverseAnimation) {
			oContentDomRefCloned.classList.add("sapFCardContentReverseAnim");
		}

		if (this.isServerSide()) {
			this._oClonedContent = oContentDomRefCloned;
		} else {
			oContentDomRef.classList.add("sapFCardContentOriginal");

			if (this._bReverseAnimation) {
				oContentDomRef.classList.add("sapFCardContentReverseAnim");
			}

			oContentDomRef.parentElement.insertBefore(oContentDomRefCloned, oContentDomRef);
		}
	};

	Paginator.prototype._clearAnimation = function () {
		if (!this._hasAnimation() || !this._bActiveAnimation) {
			return;
		}

		var oCard = this.getCard(),
			oContent = oCard.getCardContent(),
			oContentDomRef = oContent.getDomRef(),
			oContentDomRefCloned = oContentDomRef.previousSibling,
			oCardLoadingProvider,
			oContentLoadingProvider;

		oCardLoadingProvider = oCard.getAggregation("_loadingProvider");
		oContentLoadingProvider = oContent.getAggregation("_loadingProvider");

		if (oContentLoadingProvider._bAwaitPagination) {
			oContentLoadingProvider._bAwaitPagination = false;
			oCardLoadingProvider._bAwaitPagination = false;
		} else {
			oContentDomRefCloned.parentNode.removeChild(oContentDomRefCloned);

			oContentDomRef.classList.remove("sapFCardContentOriginal");
			oContentDomRef.classList.remove("sapFCardContentTransition");
			oContentDomRef.classList.remove("sapFCardContentReverseAnim");

			oContent.hideLoadingPlaceholders();
			oCardLoadingProvider.setLoading(false);
			this._bActiveAnimation = false;
		}
	};

	Paginator.prototype._listUpdateFinished = function () {
		if (!this._bActiveAnimation || this.isServerSide()) {
			return;
		}

		var oContent = this.getCard().getCardContent(),
			oContentDomRef = oContent.getDomRef(),
			oContentDomRefCloned = oContentDomRef.previousSibling;

		oContentDomRefCloned.addEventListener("transitionend", function () {
			oContentDomRefCloned.parentNode.removeChild(oContentDomRefCloned);

			oContentDomRef.classList.remove("sapFCardContentOriginal");
			oContentDomRef.classList.remove("sapFCardContentTransition");
			oContentDomRef.classList.remove("sapFCardContentReverseAnim");

			this._bActiveAnimation = false;
		}.bind(this));

		oContentDomRef.classList.add("sapFCardContentTransition");
		oContentDomRefCloned.classList.add("sapFCardContentTransition");
	};

	Paginator.prototype.onPlaceholderAfterRendering = function () {
		if (!this._oClonedContent) {
			return;
		}

		var oCard = this.getCard(),
			oContent = oCard.getCardContent(),
			oContentDomRef = oContent.getDomRef(),
			oContentDomRefCloned = this._oClonedContent;

		oContentDomRef.classList.add("sapFCardContentOriginal");
		oContentDomRef.parentElement.insertBefore(oContentDomRefCloned, oContentDomRef);

		if (this._bReverseAnimation) {
			oContentDomRef.classList.add("sapFCardContentReverseAnim");
		}

		this._oClonedContent.addEventListener("transitionend", function () {
			setTimeout(this._clearAnimation.bind(this), iServerSideAfterTransitionDelay);
		}.bind(this));

		this._oClonedContent = null;

		setTimeout(function () {
			oContentDomRefCloned.classList.add("sapFCardContentTransition");
			oContentDomRef.classList.add("sapFCardContentTransition");
		}, 30);
	};

	Paginator.prototype._getNavigationArrow = function (sDirection) {
		return this.getAggregation("_" + sDirection + "Icon");
	};

	Paginator.prototype._hasAnimation = function () {
		return bHasAnimations && this.getCard().getCardContent().isA("sap.ui.integration.cards.ListContent");
	};

	Paginator.prototype._hasActiveLoadingProvider = function () {
		var oCard = this.getCard();

		return oCard && oCard.hasActiveLoadingProvider();
	};

	Paginator.prototype._previous = function () {
		if (this._bActiveAnimation || this._hasActiveLoadingProvider()) {
			return;
		}

		this.setPageNumber(Math.max(0, this.getPageNumber() - 1));
		this.sliceData();
	};

	Paginator.prototype._next = function () {
		if (this._bActiveAnimation || this._hasActiveLoadingProvider()) {
			return;
		}

		this.setPageNumber(Math.min(this.getPageCount() - 1, this.getPageNumber() + 1));
		this.sliceData();
	};

	Paginator.prototype.onmousedown = function(oEvent) {
		var oTarget = oEvent.target,
			sDataSlide = oTarget.getAttribute("data-slide");

		if (sDataSlide && !oTarget.classList.contains("sapMCrslActive")) {
			this.setPageNumber(parseInt(sDataSlide) - 1);
			this.sliceData();
		}
	};

	return Paginator;
});