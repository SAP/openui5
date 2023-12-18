/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/p13n/SelectionController', 'sap/m/p13n/SortPanel', 'sap/m/p13n/modules/xConfigAPI'
], (BaseController, SortPanel, xConfigAPI) => {
	"use strict";

	/**
	 * Personalization <code>SortState</code> object type. This object describes the state processed by this controller when accessing it through the {@link sap.m.p13n.Engine Engine}.
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.SortState
	 * @property {string} key The key for the sort state
	 * @property {boolean} [sorted] Defines whether the item is sorted (if a sort state is provided, it's sorted automatically)
	 * @property {boolean} [descending] Defines whether the sorting is processed in a descending order (<code>false</code> is the default)
	 * @property {int} [index] Describes the index of the sorter
	 *
	 */

	 /**
	 * Constructor for a new <code>SortController</code>.
	 *
	 * @param {object} mSettings Initial settings for the new controller
	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this controller
	 *
	 * @class
	 * The <code>SortController</code> entity serves as a base class to create personalization implementations that are specific to sorting.
	 *
	 * @extends sap.m.p13n.SelectionController
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.m.p13n.SortController
	 */
	const SortController = BaseController.extend("sap.m.p13n.SortController", {
		constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
	});

	SortController.prototype.getStateKey = () => {
		return "sorters";
	};

	SortController.prototype.getDelta = function(mPropertyBag) {
		mPropertyBag.deltaAttributes.push("descending");
		return BaseController.prototype.getDelta.apply(this, arguments);
	};

	SortController.prototype.initAdaptationUI = function(oPropertyHelper) {

		const oSortPanel = new SortPanel();

		const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		oSortPanel.setP13nData(oAdaptationData.items);
		this._oPanel = oSortPanel;

		return Promise.resolve(oSortPanel);
	};

	SortController.prototype.model2State = function() {
		const aItems = [];
		if (this._oPanel) {
			this._oPanel.getP13nData(true).forEach((oItem) => {
				if (oItem.sorted) {
					aItems.push({
						key: oItem.key
					});
				}
			});
			return aItems;
		}
	};

	SortController.prototype.getChangeOperations = () => {
		return {
			add: "addSort",
			remove: "removeSort",
			move: "moveSort"
		};
	};

	SortController.prototype.getCurrentState = function(bExternalize) {
		const oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
		const aSortConditions = oXConfig.hasOwnProperty("properties") ? oXConfig.properties.sortConditions : [];

		return aSortConditions || [];
	};

	SortController.prototype._createAddRemoveChange = (oControl, sOperation, oContent) => {
		const oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oContent
			}
		};
		return oAddRemoveChange;
	};

	SortController.prototype._getPresenceAttribute = (bexternalAppliance) => {
		return "sorted";
	};

	SortController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const aItemState = this.getCurrentState();
		const mExistingSorters = this.arrayToMap(aItemState);

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {

			const oExistingSorter = mExistingSorters[oProperty.key];

			mItem.sorted = oExistingSorter ? true : false;
			mItem.sortPosition = oExistingSorter ? oExistingSorter.position : -1;
			mItem.descending = oExistingSorter ? !!oExistingSorter.descending : false;

			return !(oProperty.sortable === false);
		});

		this.sortP13nData({
			visible: "sorted",
			position: "sortPosition"
		}, oP13nData.items);

		oP13nData.presenceAttribute = this._getPresenceAttribute();

		oP13nData.items.forEach((oItem) => {
			delete oItem.sortPosition;
		});

		return oP13nData;
	};

	return SortController;

});