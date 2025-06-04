/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContent",
	"./BaseListContentRenderer",
	"sap/ui/integration/util/BindingResolver",
	"sap/m/IllustratedMessageType",
	"sap/ui/integration/library",
	"sap/ui/core/Lib",
	"sap/base/Log"
], function (
	BaseContent,
	BaseListContentRenderer,
	BindingResolver,
	IllustratedMessageType,
	library,
	Library,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new <code>BaseListContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A base control for all list contents.
	 *
	 * @extends sap.ui.integration.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.76
	 * @alias sap.ui.integration.cards.BaseListContent
	 */
	var BaseListContent = BaseContent.extend("sap.ui.integration.cards.BaseListContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseListContentRenderer
	});

	/**
	 * @override
	 */
	BaseListContent.prototype.init = function () {
		BaseContent.prototype.init.apply(this, arguments);
		this._oAwaitingPromise = null;
		this._fMinHeight = 0;
	};

	/**
	 * @override
	 */
	BaseListContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		this._oAwaitingPromise = null;
	};

	BaseListContent.prototype.onAfterRendering = function () {
		if (this.isReady() && this.getCardInstance()?.isReady()) {
			this._keepHeight();
		}
	};

	BaseListContent.prototype.onDataChanged = function () {
		if (this.hasData()) {
			this.hideNoDataMessage();
		} else {
			this.showNoDataMessage({
				illustrationType: IllustratedMessageType.NoEntries,
				title: Library.getResourceBundleFor("sap.ui.integration").getText("CARD_NO_ITEMS_ERROR_LISTS")
			});
		}

		this.getPaginator()?.onDataChanged(this);
	};

	/**
	 * @override
	 */
	BaseListContent.prototype.setModelData = function (vData, oModel) {
		const oPaginator = this.getPaginator();

		if (oPaginator?.isLoadingMore()) {
			oPaginator.setModelData(vData, oModel);
		} else {
			BaseContent.prototype.setModelData.apply(this, arguments);
		}
	};

	BaseListContent.prototype._keepHeight = function () {
		if (!this.getDomRef()) {
			return;
		}

		const fCurrentHeight = this.getDomRef().getBoundingClientRect().height;
		if (fCurrentHeight > this._fMinHeight) {
			this._fMinHeight = fCurrentHeight;
		}

		// should not exceed the card content section height in cases where content is overflowing
		const oContainer = this.getCardInstance()?.getDomRef("contentSection");
		const fContainerHeight = oContainer?.getBoundingClientRect().height;
		if (fContainerHeight && this._fMinHeight > fContainerHeight) {
			this._fMinHeight = fContainerHeight;
		}

		if (this._fMinHeight) {
			this.getDomRef().style.minHeight = this._fMinHeight + "px";
		}

		this._keepPlaceholderMinItems();
	};

	BaseListContent.prototype._keepPlaceholderMinItems = function () {
		var oLoadingPlaceholder = this.getAggregation("_loadingPlaceholder"),
			bContentReady = !!this.getAggregation("_content"),
			iNumberOfItems,
			iNewMinItems;

		if (!oLoadingPlaceholder || !oLoadingPlaceholder.getMinItems || !bContentReady) {
			return;
		}

		iNumberOfItems = this.getItemsLength();
		iNewMinItems = Math.max(oLoadingPlaceholder.getMinItems(), iNumberOfItems);
		oLoadingPlaceholder.setMinItems(iNewMinItems);
	};

	/**
	 * @override
	 */
	BaseListContent.prototype.applyConfiguration = function () {
		const oConfiguration = this.getParsedConfiguration();
		const oList = this.getInnerList();

		if (!oConfiguration || !oList) {
			return;
		}

		this._fMinHeight = 0;

		const oPaginator = this.getPaginator();
		if (oPaginator?.getActive()) {
			return;
		}

		let vMaxItems = BindingResolver.resolveValue(oConfiguration.maxItems, this);
		vMaxItems = parseInt(vMaxItems);

		if (oPaginator && (Number.isNaN(vMaxItems) || !vMaxItems)) {
			vMaxItems = oPaginator.getPageSize();
		}

		if (vMaxItems) {
			oList.applySettings({
				growing: true,
				growingThreshold: vMaxItems
			});
			oList.addStyleClass("sapFCardMaxItems");
		}
	};

	/**
	 * The function should be overwritten for content types which support the maxItems property.
	 *
	 * @protected
	 * @virtual
	 * @returns {sap.ui.core.Control|null} An instance of ListBase or <code>null</code>.
	 */
	BaseListContent.prototype.getInnerList = function () {
		return null;
	};

	/**
	 * @protected
	 * @returns {int} Number of items
	 */
	BaseListContent.prototype.getItemsLength = function () {
		return 0;
	};

	BaseListContent.prototype.setPaginator = function (oPaginator) {
		this._oPaginator = oPaginator;
	};

	BaseListContent.prototype.getPaginator = function () {
		return this._oPaginator;
	};

	/**
	 * Used to check which content items should be hidden based on the Navigation Service.
	 *
	 * @protected
	 * @param {Object} mItemConfig The item template.
	 */
	BaseListContent.prototype._checkHiddenNavigationItems = function (mItemConfig) {
		if (!mItemConfig.actions) {
			return;
		}

		if (!this.getInnerList()) {
			return;
		}

		var oInnerList = this.getInnerList(),
			aItems = this.isA("sap.ui.integration.cards.TimelineContent") ? oInnerList.getContent() : oInnerList.getItems(),
			aPromises = [],
			oAction = mItemConfig.actions[0],
			sActionName,
			iVisibleItems = 0;

		if (!oAction || !oAction.service || oAction.type !== "Navigation") {
			return;
		}

		if (oAction.service === "object") {
			sActionName = oAction.service.name;
		} else {
			sActionName = oAction.service;
		}

		// create new promises
		aItems.forEach(function (oItem) {
			var mParameters = BindingResolver.resolveValue(
				oAction.parameters,
				this,
				oItem.getBindingContext().getPath()
			);

			aPromises.push(this._oServiceManager
				.getService(sActionName)
				.then(function (oNavigationService) {
					if (!oNavigationService.hidden) {
						return false;
					}

					return oNavigationService.hidden({parameters: mParameters});
				})
				.then(function (bHidden) {
					oItem.setVisible(!bHidden);
					if (!bHidden) {
						iVisibleItems++;
					}
				})
				.catch(function (sMessage) {
					Log.error(sMessage);
				}));

		}.bind(this));

		this.awaitEvent("_filterNavItemsReady");

		var pCurrent = this._oAwaitingPromise = Promise.all(aPromises)
			.then(function () {
				if (this._oAwaitingPromise === pCurrent) {
					if (this.getModel("parameters")) {
						this.getModel("parameters").setProperty("/visibleItems", iVisibleItems);
					}
					this.fireEvent("_filterNavItemsReady");
				}
			}.bind(this));
	};

	BaseListContent.prototype.hasData = function () {
		var oInnerList = this.getInnerList(),
			oBindingInfo = oInnerList.getBinding(oInnerList.getMetadata().getDefaultAggregationName()),
			oModel = oBindingInfo.getModel(),
			sPath = oBindingInfo.getPath(),
			aItems = oModel.getProperty(sPath);

		if (aItems && aItems.length) {
			return true;
		}

		return false;
	};

	BaseListContent.prototype.getDataLength = function () {
		var oData = this.getModel().getProperty(this.getInnerList().getBindingContext().getPath());

		if (Array.isArray(oData)) {
			return oData.length;
		}

		return Object.getOwnPropertyNames(oData).length;
	};

	BaseListContent.prototype.ontap = function (oEvent) {
		oEvent.stopPropagation();
	};

	BaseListContent.prototype.onsapenter = function (oEvent) {
		oEvent.stopPropagation();
	};

	BaseListContent.prototype.onsapspace = function (oEvent) {
		oEvent.stopPropagation();
	};

	return BaseListContent;
});