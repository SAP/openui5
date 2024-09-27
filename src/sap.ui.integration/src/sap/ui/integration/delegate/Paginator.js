/*!
* ${copyright}
*/

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/base/ManagedObject",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/openCardDialog",
	"sap/ui/integration/util/Utils",
	"sap/m/BusyIndicator"
], (
	uid,
	ManagedObject,
	library,
	BindingResolver,
	openCardDialog,
	Utils,
	BusyIndicator
) => {
	"use strict";

	const CardDataMode = library.CardDataMode;

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
				paginatorModel: { type: "object" },
				pageSize: { type: "int", defaultValue: 0 },
				totalCount: { type: "int", defaultValue: 0 }
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

		this.applySettings(BindingResolver.resolveValue({
			totalCount: oConfiguration.totalCount,
			pageSize: iPageSize
		}, oParent));
	};

	Paginator.prototype.exit = function () {
		this._oBusyIndicator?.destroy();
	};

	Paginator.prototype.openDialog = function() {
		const oCard = this.getCard();
		const oManifest = oCard.getManifestEntry("/");

		oManifest["sap.app"].id = oManifest["sap.app"].id + uid();

		openCardDialog(oCard, {
			manifest: oManifest,
			baseUrl: oCard.getBaseUrl(),
			resizable: true,
			showCloseButton: true,
			dataMode: CardDataMode.Active
		});
	};

	Paginator.prototype.isServerSide = function() {
		return this.getTotalCount() > 0;
	};

	Paginator.prototype.onDataChanged = function(oContent) {
		if (!oContent.hasData()) {
			this._iPageCount = 0;
			return;
		}

		this._applySettings();

		const oList = oContent.getInnerList();
		const iTotalCount = this.getTotalCount() || oContent.getDataLength();
		this._iPageCount = Math.ceil(iTotalCount / this.getPageSize());
		this._iPageNumber = Math.min(Math.max(0, this._iPageNumber), this._getLastPageNumber());

		if (!this.getActive()) {
			return;
		}

		if (this.isServerSide()) {
			this._oBusyIndicator = this._oBusyIndicator || new BusyIndicator().addStyleClass("sapUiIntPaginatorBusyIndicator");

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

					// show items until scrollbar appears
					if (oContent.hasData() && oScrollContainer.clientHeight >= oScrollContainer.scrollHeight && oContent.getDataLength() < iTotalCount) {
						this._loadMore();
					} else {
						this.fireEvent("_ready");
					}
				}
			};

			oList.addEventDelegate(oDelegate);
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
			skip: this._iPageNumber * this.getPageSize(),
			size: this.getPageSize(),
			pageIndex: this._iPageNumber
		});
	};

	Paginator.prototype._getLastPageNumber = function () {
		return Math.max(0, this._iPageCount - 1);
	};

	return Paginator;
});