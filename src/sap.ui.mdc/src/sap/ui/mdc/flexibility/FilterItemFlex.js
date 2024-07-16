/*!
 * ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex', './Util', "sap/ui/fl/changeHandler/common/ChangeCategories"
], (ItemBaseFlex, Util, ChangeCategories) => {
	"use strict";

	/**
	 * FilterBar-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.FilterBar
	 * @author SAP SE
	 * @version ${version}
	 */

	const oFilterItemFlex = Object.assign({}, ItemBaseFlex);

	oFilterItemFlex.findItem = function(oModifier, aFilters, sName) {
		return aFilters.reduce((oPreviousPromise, oFilter) => {
			return oPreviousPromise
				.then((oFoundFilter) => {
					if (!oFoundFilter) {
						return oModifier.getProperty(oFilter, "propertyKey")
							.then((sPropertyName) => {
								if (sPropertyName === sName) {
									return oFilter;
								}
							});
					}
					return oFoundFilter;
				});
		}, Promise.resolve());
	};

	oFilterItemFlex.beforeApply = function(oControl) {
		if (oControl.applyConditionsAfterChangesApplied) {
			oControl.applyConditionsAfterChangesApplied();
		}
	};

	oFilterItemFlex.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oContent = oChange.getContent();
		const oFilterBar = oAppComponent.byId(oChange.getSelector().id);
		let sKey;
		const aArgs = [oContent.name];
		const mVersionInfo = { descriptionPayload: {} };

		if (oChange.getChangeType() === "addFilter") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.ADD;
			sKey = "filterbar.ITEM_ADD_CHANGE";
			aArgs.push(oContent.index);
		} else if (oChange.getChangeType() === "removeFilter") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.REMOVE;
			sKey = "filterbar.ITEM_DEL_CHANGE";
		} else if (oChange.getChangeType() === "moveFilter") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.MOVE;
			sKey = "filterbar.ITEM_MOVE_CHANGE";
			aArgs.push(oChange.getRevertData().index);
			aArgs.push(oContent.index);
		}

		const oProperty = oFilterBar?.getPropertyHelper()?.getProperty(oContent.name);
		if (oProperty) {
			aArgs.splice(0, 1, oProperty.label);
		}

		return Util.getMdcResourceText(sKey, aArgs).then((sText) => {
			mVersionInfo.descriptionPayload.description = sText;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};
	oFilterItemFlex.addFilter = oFilterItemFlex.createAddChangeHandler();
	oFilterItemFlex.removeFilter = oFilterItemFlex.createRemoveChangeHandler();
	oFilterItemFlex.moveFilter = oFilterItemFlex.createMoveChangeHandler();


	return oFilterItemFlex;
});