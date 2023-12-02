/*!
 * ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex', './Util', "sap/ui/fl/changeHandler/common/ChangeCategories"
], (ItemBaseFlex, Util, ChangeCategories) => {
	"use strict";

	const ColumnFlex = Object.assign({}, ItemBaseFlex);

	ColumnFlex.findItem = function(oModifier, aColumns, sName) {
		return aColumns.reduce((oPreviousPromise, oColumn) => {
			return oPreviousPromise
				.then((oFoundColumn) => {
					if (!oFoundColumn) {
						return Promise.all([
								oModifier.getProperty(oColumn, "propertyKey"), oModifier.getProperty(oColumn, "dataProperty")
							])
							.then((aProperties) => {
								if (aProperties[0] === sName || aProperties[1] === sName) {
									return oColumn;
								}
							});
					}
					return oFoundColumn;
				});
		}, Promise.resolve());
	};

	ColumnFlex.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oContent = oChange.getContent();
		const oTable = oAppComponent.byId(oChange.getSelector().id);
		let sKey;
		const aArgs = [oContent.name];
		const mVersionInfo = { descriptionPayload: {} };

		if (oChange.getChangeType() === "addColumn") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.ADD;
			sKey = "table.ITEM_ADD_CHANGE";
			aArgs.push(oContent.index);
		} else if (oChange.getChangeType() === "removeColumn") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.REMOVE;
			sKey = "table.ITEM_DEL_CHANGE";
		} else if (oChange.getChangeType() === "moveColumn") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.MOVE;
			sKey = "table.ITEM_MOVE_CHANGE";
			aArgs.push(oChange.getRevertData().index);
			aArgs.push(oContent.index);
		}

		if (oTable) {
			const oProperty = oTable.getPropertyHelper()?.getProperty(oContent.name);
			if (oProperty) {
				aArgs.splice(0, 1, oProperty.label);
			}
		}

		return Util.getMdcResourceText(sKey, aArgs).then((sText) => {
			mVersionInfo.descriptionPayload.description = sText;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};

	ColumnFlex.addColumn = ColumnFlex.createAddChangeHandler();
	ColumnFlex.removeColumn = ColumnFlex.createRemoveChangeHandler();
	ColumnFlex.moveColumn = ColumnFlex.createMoveChangeHandler();

	return ColumnFlex;
});