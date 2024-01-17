/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController", "sap/ui/core/Lib", "sap/ui/mdc/enums/ChartItemRoleType"
], (BaseController, Library, ChartItemRoleType) => {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const ChartItemController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartItemController");

	ChartItemController.prototype.initAdaptationUI = function(oPropertyHelper) {

		return this.getAdaptationControl().getAdaptationUI().then((oPanel) => {
			this._oPanel = oPanel;
			oPanel.setTitle(oResourceBundle.getText("p13nDialog.TAB_Chart"));
			const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
			oPanel.setP13nData(oAdaptationData.items);
			return oPanel;
		});

	};

	ChartItemController.prototype.update = function(oPropertyHelper) {
		BaseController.prototype.update.apply(this, arguments);
		//this._oPanel.setP13nData(this.mixInfoAndState(oPropertyHelper).items);
	};

	ChartItemController.prototype.getDelta = function(mPropertyBag) {
		mPropertyBag.deltaAttributes.push("role");
		return BaseController.prototype.getDelta.apply(this, arguments);
	};

	ChartItemController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const aItemState = this.getCurrentState();
		const mItemState = this.arrayToMap(aItemState);

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {
			const oExisting = mItemState[oProperty.name];
			mItem.visible = !!oExisting;
			mItem.position = oExisting ? oExisting.position : -1;
			mItem.role = oExisting ? oExisting.role : oProperty.role;
			if (oProperty.groupable) {
				mItem.kind = "Groupable";
			} else if (oProperty.aggregatable) {
				mItem.kind = "Aggregatable";
			}

			return oProperty.visible;
		});


		this.sortP13nData({
			visible: "visible",
			position: "position"
		}, oP13nData.items);

		oP13nData.items.forEach((oItem) => { delete oItem.position; });

		return oP13nData;
	};

	ChartItemController.prototype.getChangeOperations = function() {
		return {
			add: "addItem",
			remove: "removeItem",
			move: "moveItem"
		};
	};

	return ChartItemController;

});