/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/m/p13n/SelectionController', 'sap/m/p13n/GroupPanel', 'sap/m/p13n/modules/xConfigAPI'
], (BaseController, GroupPanel, xConfigAPI) => {
	"use strict";

	/**
	 * Personalization <code>GroupState</code> object type. This object describes the state processed by this controller when accessing it through the {@link sap.m.p13n.Engine Engine}.
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.GroupState
	 * @property {string} key The key for the group state
	 * @property {boolean} [grouped] Defines whether the item is grouped (if a group state is provided, it's grouped automatically)
	 * @property {int} [index] Describes the index of the grouping
	 *
	 */

	 /**
	 * Constructor for a new <code>GroupController</code>.
	 *
	 * @param {object} mSettings Initial settings for the new controller
	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this controller
	 *
	 * @class
	 * The <code>GroupController</code> entity serves as a base class to create group-specific personalization implementations.
	 *
	 * @extends sap.m.p13n.SelectionController
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.104
	 * @alias sap.m.p13n.GroupController
	 */
	const GroupController = BaseController.extend("sap.m.p13n.GroupController");

	GroupController.prototype.getStateKey = () => {
		return "groupLevels";
	};

	GroupController.prototype.getCurrentState = function(bExternalize) {
		const oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
		const aSortConditions = oXConfig.hasOwnProperty("properties") ? oXConfig.properties.groupConditions : [];

		return aSortConditions || [];
	};

	GroupController.prototype.initAdaptationUI = function(oPropertyHelper) {
		const oGroupPanel = new GroupPanel();
		const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		const oAdaptationControl = this.getAdaptationControl();

		if (oAdaptationControl.isA("sap.m.Table")) {
			oGroupPanel.setQueryLimit(1);
		}

		oGroupPanel.setP13nData(oAdaptationData.items);
		this._oPanel = oGroupPanel;

		return Promise.resolve(oGroupPanel);
	};

	GroupController.prototype.model2State = function() {
		const aItems = [];
		this._oPanel.getP13nData(true).forEach((oItem) => {
			if (oItem.grouped) {
				aItems.push({
					key: oItem.key
				});
			}
		});
		return aItems;
	};

	GroupController.prototype.getChangeOperations = () => {
		return {
			add: "addGroup",
			remove: "removeGroup",
			move: "moveGroup"
		};
	};

	GroupController.prototype._getPresenceAttribute = () => {
		return "grouped";
	};

	GroupController.prototype._createAddRemoveChange = (oControl, sOperation, oContent) => {
		const oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oContent
			}
		};
		return oAddRemoveChange;
	};

	GroupController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const aItemState = this.getCurrentState();
		const mItemState = this.arrayToMap(aItemState);
		const oController = this.getAdaptationControl();
		const oAggregations = oController.getAggregateConditions ? oController.getAggregateConditions() || {} : {};

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {
			const oExisting = mItemState[oProperty.key];
			mItem.grouped = !!oExisting;
			mItem.position = oExisting ? oExisting.position : -1;
			return !(oProperty.groupable === false || oAggregations[oProperty.key]);
		});

		this.sortP13nData({
			visible: "grouped",
			position: "position"
		}, oP13nData.items);

		oP13nData.presenceAttribute = this._getPresenceAttribute();
		oP13nData.items.forEach((oItem) => {
			delete oItem.position;
		});

		return oP13nData;
	};

	GroupController.prototype.applyChange = (aSortState) => {
		return Promise.resolve();
	};

	return GroupController;

});