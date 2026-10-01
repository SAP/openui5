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
		this._fMinHeight = 0;
		this._fLastWidth = 0;
	};

	BaseListContent.prototype.onAfterRendering = function () {
		BaseContent.prototype.onAfterRendering.apply(this, arguments);

		if (this.isReady() && this.getCardInstance()?.isReady()) {
			if (this._hasWidthChanged()) {
				this._resetHeightCalculations();
			} else {
				this._keepHeight();
			}
		}
	};

	/**
	 * Checks if the width of the content has changed since the last rendering.
	 * @returns {boolean} <code>true</code> if the width has changed, otherwise <code>false</code>.
	 * @private
	 */
	BaseListContent.prototype._hasWidthChanged = function () {
		const fCurrentWidth = this.getCardInstance()?.getDomRef()?.getBoundingClientRect().width;
		let bHasChanged = false;

		if (this._fLastWidth && fCurrentWidth !== this._fLastWidth) {
			// Width has changed, reset height calculations
			bHasChanged = true;
		}

		this._fLastWidth = fCurrentWidth;

		return bHasChanged;
	};

	/**
	 * Resets height calculations by clearing the minimum height and resetting the stored minimum height value.
	 * @private
	 */
	BaseListContent.prototype._resetHeightCalculations = function () {
		this.getDomRef().style.minHeight = "";
		this._fMinHeight = 0;
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

	/**
	 * Checks if the width has changed and resets height calculations if needed.
	 * @private
	 */
	BaseListContent.prototype._checkWidthChange = function () {
		if (!this.getDomRef()) {
			return;
		}

		const fCurrentWidth = this.getCardInstance()?.getDomRef()?.getBoundingClientRect().width;
		if (this._fLastWidth && fCurrentWidth !== this._fLastWidth) {
			// Width has changed, reset height calculations
			this.getDomRef().style.minHeight = "";
			this._fMinHeight = 0;
		}
		this._fLastWidth = fCurrentWidth;
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

		// Skip growing when running headlessly via SkeletonCard (Mobile SDK), so that all items
		// are rendered and getStaticConfiguration() can return the full untruncated list.
		if (vMaxItems && !this.getCardInstance().isSkeleton()) {
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

	/**
	 * Returns the first action if it is of type "Navigation"; otherwise, it returns undefined.
	 * Only one action is supported.
	 *
	 * @protected
	 * @param {Array} aActions The actions array from the item/row configuration.
	 * @returns {Object|undefined} The navigation action or undefined.
	 */
	BaseListContent.prototype._getNavigationAction = function (aActions) {
		return aActions && aActions[0] && aActions[0].type === "Navigation" ? aActions[0] : undefined;
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