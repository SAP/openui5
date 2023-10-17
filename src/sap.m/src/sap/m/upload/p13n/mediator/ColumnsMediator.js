/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/m/upload/p13n/mediator/BaseMediator",
		"sap/m/p13n/SelectionPanel",
		"sap/m/upload/p13n/modules/CustomDataConfig",
		"sap/base/util/deepEqual"
	],
	function(BaseMediator, SelectionPanel, CustomDataConfig, deepEqual) {
		"use strict";

		/**
		 * Constructor for a new <code>ColumnsMediator</code>.
		 *
		 * @param {object} [mSettings] Initial settings for the new control
     	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this mediator
      	 * @param {string} mSettings.targetAggregation The name of the aggregation that is now managed by this mediator
     	 * @param {string} mSettings.p13nMetadataTarget The name of the personalization metadata target that is now managed by this mediator
		 *
		 * @class
		 * The <code>ColumnsMediator</code> entity serves as a class which handles columns panel related logic.
		 *
		 * @extends sap.m.upload.p13n.mediator.BaseMediator
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @private
		 * @experimental
		 * @internal
		 * @alias sap.m.upload.p13n.mediator.ColumnsMediator
		 */

		const ColumnsMediator = BaseMediator.extend("sap.m.upload.p13n.mediator.ColumnsMediator", {
			constructor: function (mSettings) {
				BaseMediator.call(this, mSettings);
			}
		});

		ColumnsMediator.prototype.createPanel = function () {
			return Promise.resolve(this.createUi(this.getPanelData()));
		};

		ColumnsMediator.prototype.createUi = function (aPanelData) {
			this._oPanel = new SelectionPanel({ enableCount: true, showHeader: true });
			this._oPanel.setP13nData(aPanelData);
			return this._oPanel;
		};

		ColumnsMediator.prototype.getPanelData = function () {
			const mCurrentState = this.arrayToMap(this.getCurrentState(), true);
			const aPanelState = [],
				oMetadata = this.getControl()._getP13nMetadata();
			oMetadata[this.getP13nMetadataTarget()].forEach((oMetadataItem) => {
				aPanelState.push({
					key: oMetadataItem.key,
					label: oMetadataItem.label || oMetadataItem.key,
					tooltip: oMetadataItem.tooltip,
					index: mCurrentState[oMetadataItem.key] ? mCurrentState[oMetadataItem.key].index : undefined,
					visible: !!mCurrentState[oMetadataItem.key]
				});
			});

			// Sort panel config
			const sLocale = undefined/*Configuration*/.getLocale().toString(),
				oCollator = window.Intl.Collator(sLocale, {});
			aPanelState.sort((mItem1, mItem2) => {
				if (mItem1.visible && mItem2.visible) {
					return (mItem1.index || 0) - (mItem2.index || 0);
				}
				if (mItem1.visible) {
					return -1;
				}
				if (mItem2.visible) {
					return 1;
				}
				return oCollator.compare(mItem1.label, mItem2.label);
			});
			aPanelState.forEach((oItem) => delete oItem.index);
			return aPanelState;
		};

		ColumnsMediator.prototype.getCurrentState = function () {
			const oState = [],
				aAggregateItems = this.getControl().getAggregation(this.getTargetAggregation()) || [],
				oView = this.getView();
			aAggregateItems.forEach((oItem, iIndex) => {
				const sKey = oView ? oView.getLocalId(oItem.getId()) : oItem.getId();
				oState[sKey] = { key: sKey, index: iIndex, visible: oItem.getVisible() };
			});

			const oCustomConfig = CustomDataConfig.read(this.getControl()) || {};
			const oFlexConfig = oCustomConfig.hasOwnProperty("aggregations")
				? oCustomConfig.aggregations[this.getTargetAggregation()]
				: {};


			for (const sKey in oFlexConfig) {
				const { index, visible = true } = oFlexConfig[sKey];
				if (!oState[sKey]) {
					continue;
				}
				if (index !== undefined) {
					oState[sKey].index = index;
				}
				oState[sKey].visible = visible;
			}
			const aState = Object.values(oState)
				.filter((oItem) => oItem.visible)
				.sort((oItem1, oItem2) => {
					return oItem1.index - oItem2.index;
				});

			return aState.map((oItem) => ({ key: oItem.key }));
		};

		ColumnsMediator.prototype._getP13nData = function () {
			return this._oPanel ? this._oPanel.getP13nData() : {};
		};

		ColumnsMediator.prototype.getChanges = function () {
			const aChanges = [],
				aCurrentState = this.getCurrentState(),
				aP13nData = this._getP13nData(),
				aNextState = aP13nData.filter((oEntry) => !!oEntry.visible).map((oEntry) => ({ key: oEntry.key }));

			if (deepEqual(aCurrentState, aNextState)) {
				return aChanges;
			}

			// Calculate inserts, delete and move actions
			const aDeleted = this._getDeletes(aCurrentState, aNextState),
				aInserted = this._getInserts(aCurrentState, aNextState),
				aMoved = this._getMove(aCurrentState, aNextState, aDeleted, aInserted);

			aChanges.push(
				this.createChange("uploadSetTableColumnsStateChange", { deleted: aDeleted, moved: aMoved, inserted: aInserted })
			);
			return aChanges;
		};

		ColumnsMediator.prototype._getDeletes = function (aCurrentState, aNextState) {
			const aResult = [],
				mNextState = this.arrayToMap(aNextState);

			aCurrentState.forEach((oState, iIndex) => {
				if (!mNextState[oState.key]) {
					aResult.push({ key: oState.key, prevIndex: iIndex });
				}
			});
			return aResult;
		};

		ColumnsMediator.prototype._getInserts = function (aCurrentState, aNextState) {
			const aResult = [],
				mCurrentState = this.arrayToMap(aCurrentState);

			aNextState.forEach((oState, iIndex) => {
				if (!mCurrentState[oState.key]) {
					aResult.push({ key: oState.key, index: iIndex });
				}
			});
			return aResult;
		};

		ColumnsMediator.prototype._getMove = function (aCurrentState, aNextState) {
			const aResult = [],
				mNextState = this.arrayToMap(aNextState, true);

			aCurrentState.forEach((oState, iIndex) => {
				if (mNextState[oState.key] && mNextState[oState.key].index !== iIndex) {
					aResult.push({ key: oState.key, index: mNextState[oState.key].index, prevIndex: iIndex });
				}
			});
			return aResult;
		};

		ColumnsMediator.prototype.applyStateToTable = function () {
			const aState = this.getCurrentState(),
				oView = this.getView();

			this.getControl()
				.getColumns()
				.forEach((oCol) => {
					oCol.setVisible(false);
				});
			const oColMap = this.getControl()
				.getColumns()
				.reduce((oInit, oCol) => {
					const sKey = oView ? oView.getLocalId(oCol.getId()) : oCol.getId();
					oInit[sKey] = oCol;
					return oInit;
				}, {});

			aState.forEach((oCol, iIndex) => {
				if (oColMap[oCol.key]) {
					oColMap[oCol.key].setVisible(true);
					oColMap[oCol.key].setOrder(iIndex);
				}
			});
		};

		return ColumnsMediator;
	}
);
