/*!
 * ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex', './Util', "sap/ui/fl/changeHandler/common/ChangeCategories", "sap/ui/mdc/chart/Util"

], (ItemBaseFlex, Util, ChangeCategories, ChartUtil) => {
	"use strict";

	const oChartItemFlex = Object.assign({}, ItemBaseFlex);

	oChartItemFlex.beforeAddItem = function(Delegate, sPropertyKey, oControl, mPropertyBag, oChangeContent) {
		return Delegate.addItem.call(Delegate, oControl, sPropertyKey, mPropertyBag, oChangeContent.role);
	};

	oChartItemFlex.findItem = function(oModifier, aItems, sName) {
		return aItems.reduce((oPreviousPromise, oItem) => {
			return oPreviousPromise
				.then((oFoundItem) => {
					if (!oFoundItem) {
						return Promise.all([
								oModifier.getProperty(oItem, "propertyKey"), oModifier.getProperty(oItem, "key")
							])
							.then((aProperties) => {
								if (aProperties[0] === sName || aProperties[1] === sName) {
									return oItem;
								}
							});
					}
					return oFoundItem;
				});
		}, Promise.resolve());
	};

	oChartItemFlex.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oContent = oChange.getContent();
		const oChart = oAppComponent.byId(oChange.getSelector().id);
		let sKey;
		const aArgs = [oContent.name];
		const mVersionInfo = { descriptionPayload: {} };

		if (oChange.getChangeType() === "addItem") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.ADD;
			sKey = "chart.ITEM_ADD_CHANGE";
			aArgs.push(oContent.index);
			aArgs.push(oContent.role);
		} else if (oChange.getChangeType() === "removeItem") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.REMOVE;
			sKey = "chart.ITEM_DEL_CHANGE";
		} else if (oChange.getChangeType() === "moveItem") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.MOVE;
			sKey = "chart.ITEM_MOVE_CHANGE";
			aArgs.push(oChange.getRevertData().index);
			aArgs.push(oContent.index);
		}

		const oChartPropertyHelper = oChart?.getPropertyHelper();
		if (oChartPropertyHelper) {
			let sType;
			const oProperty = oChartPropertyHelper.getProperty(oContent.name);
			if (oProperty) {
				if (oProperty.isAggregatable()) {
					sType = "aggregatable";
					sKey += "_MEAS";
				} else if (oProperty.groupable) {
					sType = "groupable";
					sKey += "_DIM";
				}

				aArgs.splice(0, 1, oProperty.label);
			}

			if ((oChange.getChangeType() === "addItem") && sType) {
				const oText = ChartUtil.getLayoutOptionTextForTypeAndRole(sType, oContent.role);
				if (oText) {
					aArgs.splice(2, 1, oText);
				}
			}
		}

		return Util.getMdcResourceText(sKey, aArgs).then((sText) => {
			mVersionInfo.descriptionPayload.description = sText;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};

	oChartItemFlex.addItem = oChartItemFlex.createAddChangeHandler();
	oChartItemFlex.removeItem = oChartItemFlex.createRemoveChangeHandler();
	oChartItemFlex.moveItem = oChartItemFlex.createMoveChangeHandler();

	return oChartItemFlex;

});