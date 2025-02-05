/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/openCardShowMore",
	"sap/ui/integration/util/Utils",
	"sap/m/BusyIndicator"
], (
	ManagedObject,
	BindingResolver,
	openCardShowMore,
	Utils,
	BusyIndicator
) => {
	"use strict";

	/**
	 * Constructor for a new Paginator.
	 *
	 * @param {string} [sId] ID, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings
	 *
	 * @class
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @ui5-restricted
	 * @private
	 * @alias sap.ui.integration.delegate.Paginator
	 */
	const Paginator = ManagedObject.extend("sap.ui.integration.delegate.Paginator", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				active: { type: "boolean", defaultValue: false },
				card: { type: "object" },
				/**
				 * Paginator configuration from the manifest
				 */
				configuration: { type: "object" },
				paginatorModel: { type: "object" }
			}
		}
	});

	Paginator.create = function (oSettings) {
		if (!oSettings) {
			return null;
		}

		const oPaginator = new Paginator(oSettings);

		oPaginator._applySettings();
		oPaginator._updatePaginatorModel();

		return oPaginator;
	};

	Paginator.prototype.init = function() {
		this._iPageNumber = 0;
		this._iPageCount = 0;
	};

	Paginator.prototype._applySettings = function() {
		const oConfiguration = this.getConfiguration();
		const oCard = this.getCard();
		let iPageSize = oConfiguration.pageSize;

		if (oCard.isSkeleton() && !oConfiguration.totalCount) {
			// client side pagination for resolved manifest should directly show all items
			iPageSize = oCard.getModelSizeLimit();
		}

		let oParent = oCard;
		const oContent = oCard.getCardContent();

		if (oContent) {
			oParent = oCard.getCardContent();
		}

		this._iTotalCount = BindingResolver.resolveValue(oConfiguration.totalCount, oParent);
		this._iPageSize = BindingResolver.resolveValue(iPageSize, oParent);
	};

	Paginator.prototype.exit = function () {
		this._oBusyIndicator?.destroy();
	};

	Paginator.prototype.openDialog = function() {
		const oCard = this.getCard();
		openCardShowMore(oCard);
	};

	Paginator.prototype.isServerSide = function() {
		return this._iTotalCount > 0;
	};

	Paginator.prototype.onDataChanged = function(oContent) {
		if (!oContent.hasData()) {
			this._iPageCount = 0;
			this.fireEvent("_ready");
			return;
		}

		this._applySettings();
		const iTotalCount = this._iTotalCount || oContent.getDataLength();
		this._iPageCount = Math.ceil(iTotalCount / this._iPageSize);
		this._iPageNumber = Math.min(Math.max(0, this._iPageNumber), this._getLastPageNumber());

		if (!this.getActive()) {
			this.fireEvent("_ready");
			return;
		}

		if (this.isServerSide()) {
			this._onDataChangedServerSidePagination(oContent, iTotalCount);

			if (this._bInitialLoadComplete) {
				this.fireEvent("_ready");
			}
		} else {
			this.fireEvent("_ready");
		}
	};

	Paginator.prototype.setModelData = function(vData, oModel) {
		const oCard = this.getCard();
		const sBindingPath = oCard.getManifestEntry("/sap.card/content/data/path") || oCard.getManifestEntry("/sap.card/data/path") || "/";
		const oCurrentValue = oModel.getProperty(sBindingPath);
		const oNewValue = Utils.getNestedPropertyValue(vData, sBindingPath);

		if (oCurrentValue && oNewValue) {
			oModel.setProperty(sBindingPath, oCurrentValue.concat(oNewValue));
		} else {
			oModel.setData(vData);
		}

		this._loadingMore = false;
		this.fireEvent("_loadMoreComplete");
	};

	Paginator.prototype.isLoadingMore = function() {
		return this._loadingMore;
	};

	/**
	 * Goes back to the first page
	 */
	Paginator.prototype.reset = function () {
		this.getPaginatorModel().setData({
			skip: 0,
			size: 0,
			pageIndex: 0
		});

		this._iPageNumber = 0;
		this._loadingMore = false;
	};

	Paginator.prototype.render = function (oRm) {
		if (this._oBusyIndicator && this.isLoadingMore()) {
			oRm.renderControl(this._oBusyIndicator);
		}
	};

	/**
	 * @returns {object} Paginator configuration with static values.
	 */
	Paginator.prototype.getStaticConfiguration = function () {
		return {
			pageCount: this._iPageCount,
			pageIndex: this._iPageNumber
		};
	};

	Paginator.prototype.getPageCount = function() {
		return this._iPageCount;
	};

	Paginator.prototype.getPageSize = function() {
		return this._iPageSize;
	};

	Paginator.prototype._onDataChangedServerSidePagination = function(oContent, iTotalCount) {
		const oList = oContent.getInnerList();
		this._oBusyIndicator = this._oBusyIndicator || new BusyIndicator().addStyleClass("sapUiIntPaginatorBusyIndicator");

		// attempt to load 1 more page initially
		if (!this._bInitialLoadComplete && oContent.getDataLength() < iTotalCount) {
			this._loadMore();
			this.attachEventOnce("_loadMoreComplete", () => {
				this._bInitialLoadComplete = true;
			});
		} else {
			this._bInitialLoadComplete = true;
		}

		const onScroll = (e) => {
			if (this.isLoadingMore()) {
				return;
			}

			const LOAD_MORE_THRESHOLD = 300;
			// approaching the end of the list
			if (e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < LOAD_MORE_THRESHOLD && this.getCard().getCardContent().getDataLength() < iTotalCount) {
				this._loadMore();
			}
		};

		const oDelegate = {
			onAfterRendering: () => {
				oList.removeEventDelegate(oDelegate);

				const oScrollContainer = oList.getDomRef().closest(".sapFCardContent");

				oScrollContainer.removeEventListener("scroll", onScroll);
				oScrollContainer.addEventListener("scroll", onScroll);

				// load more items until scrollbar appears
				if (!this.isLoadingMore() && oContent.hasData() && oScrollContainer.clientHeight >= oScrollContainer.scrollHeight && oContent.getDataLength() < iTotalCount) {
					this._loadMore();
				}
			}
		};

		oList.addEventDelegate(oDelegate);
	};

	Paginator.prototype._loadMore = function() {
		if (!this.isServerSide()) {
			return;
		}

		this._loadingMore = true;
		this.getCard().getCardContent().invalidate();
		this._iPageNumber = Math.min(this._getLastPageNumber(), this._iPageNumber + 1);
		this._updatePaginatorModel();
	};

	Paginator.prototype._updatePaginatorModel = function() {
		this.getPaginatorModel().setData({
			skip: this._iPageNumber * this._iPageSize,
			size: this._iPageSize,
			pageIndex: this._iPageNumber
		});
	};

	Paginator.prototype._getLastPageNumber = function () {
		return Math.max(0, this._iPageCount - 1);
	};

	return Paginator;
});