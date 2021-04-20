/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/Log"
], function (
	BaseContent,
	BindingResolver,
	library,
	Filter,
	FilterOperator,
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
	 * @alias sap.ui.integration.cards.BaseContent
	 */
	var BaseListContent = BaseContent.extend("sap.ui.integration.cards.BaseListContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * @override
	 */
	BaseListContent.prototype.init = function () {
		BaseContent.prototype.init.apply(this, arguments);
		this._oAwaitingPromise = null;
	};

	/**
	 * @override
	 */
	BaseListContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		this._oAwaitingPromise = null;
	};

	/**
	 * @override
	 */
	BaseListContent.prototype.setConfiguration = function (oConfiguration, sType) {
		BaseContent.prototype.setConfiguration.apply(this, arguments);

		if (!oConfiguration) {
			return this;
		}

		var oList = this.getInnerList(),
			maxItems = oConfiguration.maxItems;

		if (oList && maxItems) {
			oList.setGrowing(true);
			//If pass trough parameters maxItems is a string
			oList.setGrowingThreshold(parseInt(maxItems));
			oList.addStyleClass("sapFCardMaxItems");
		}

		return this;
	};

	/**
	 * The function should be overwritten for content types which support the maxItems property.
	 *
	 * @protected
	 * @virtual
	 * @returns {sap.ui.core.Control|null} An instance of ListBase or null.
	 */
	BaseListContent.prototype.getInnerList = function () {
		return null;
	};

	/**
	 * Used to filter the content items that are to be hidden.
	 *
	 * @protected
	 * @param {Object} mItemConfig The item template.
	 * @param {Object} oBindingInfo The binding info on which to attach the filter.
	 */
	BaseListContent.prototype._filterHiddenNavigationItems = function (mItemConfig, oBindingInfo) {
		if (!mItemConfig.actions) {
			return;
		}
		var oAction = mItemConfig.actions[0];
		if (!(oAction && oAction.service && oAction.type === "Navigation")) {
			return;
		}
		var oFilter = new Filter("_card_item_hidden", FilterOperator.EQ, false);
		this.awaitEvent("_filterNavItemsReady");
		oBindingInfo.filters = [oFilter];
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

		var oBindingInfo = this.getInnerList().getBinding("items"),
			oModel = oBindingInfo.getModel(),
			sPath = oBindingInfo.getPath(),
			aItems = oModel.getProperty(sPath),
			aPromises = [],
			oAction = mItemConfig.actions[0],
			sBasePath = sPath.trim().replace(/\/$/, ""),
			sActionName;

		if (!(oAction && oAction.service && oAction.type === "Navigation")) {
			return;
		}

		if (oAction.service === "object") {
			sActionName = oAction.service.name;
		} else {
			sActionName = oAction.service;
		}

		// create new promises
		aItems.forEach(function (oItem, iIndex) {
			var mParameters = BindingResolver.resolveValue(
				oAction.parameters,
				this,
				sBasePath + "/" + iIndex
			);

			if (oItem._card_item_hidden === undefined) {
				oItem._card_item_hidden = false;
			}

			aPromises.push(
				this._oServiceManager
					.getService(sActionName)
					.then(function (oNavigationService) {
						if (!oNavigationService.hidden) {
							return false;
						}

						return oNavigationService.hidden({ parameters: mParameters });
					})
					.then(function (bHidden) {
						oItem._card_item_hidden = !!bHidden;
						oModel.checkUpdate(true);
					})
					.catch(function (sMessage) {
						Log.error(sMessage);
					})
			);
		}.bind(this));

		oModel.checkUpdate(true);
		this._awaitPromises(aPromises);
	};

	/**
	 * Awaits the promises for the current items and then fires "_filterNavItemsReady" event.
	 * @param {Promise[]} aPromises The current promises
	 */
	BaseListContent.prototype._awaitPromises = function (aPromises) {
		var pCurrent = this._oAwaitingPromise = Promise.all(aPromises);

		pCurrent.then(function () {
			// cancel if promises changed in the meantime
			if (this._oAwaitingPromise === pCurrent) {
				this.fireEvent("_filterNavItemsReady");
			}
		}.bind(this));
	};

	return BaseListContent;
});