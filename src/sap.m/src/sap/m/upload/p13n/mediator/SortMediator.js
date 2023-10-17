/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/m/upload/p13n/mediator/BaseMediator",
		"sap/m/p13n/SortPanel",
		"sap/m/upload/p13n/modules/CustomDataConfig",
		"sap/base/util/deepEqual",
		"sap/ui/model/Sorter"
	],
	function(BaseMediator, SortPanel, CustomDataConfig, deepEqual, Sorter) {
		"use strict";

		 /**
		 * Constructor for a new <code>SortMediator</code>.
		 *
		 * @param {object} [mSettings] Initial settings for the new control
     	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this mediator
      	 * @param {string} mSettings.targetAggregation The name of the aggregation that is now managed by this mediator
     	 * @param {string} mSettings.p13nMetadataTarget The name of the personalization metadata target that is now managed by this mediator
		 *
		 * @class
		 * The <code>SortMediator</code> entity serves as a class which handles sort panel related logic.
		 *
		 * @extends sap.m.upload.p13n.mediator.BaseMediator
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @private
		 * @experimental
		 * @internal
		 * @alias sap.m.upload.p13n.mediator.SortMediator
		 */

		const SortMediator = BaseMediator.extend("sap.m.upload.p13n.mediator.SortMediator", {
			constructor: function (mSettings) {
				BaseMediator.call(this, mSettings);
			}
		});

		SortMediator.prototype.createPanel = function () {
			return Promise.resolve(this.createUi(this.getPanelData()));
		};

		SortMediator.prototype.createUi = function (aPanelData) {
			this._oPanel = new SortPanel();
			this._oPanel.setP13nData(aPanelData);
			return this._oPanel;
		};

		SortMediator.prototype.getPanelData = function () {
			const mCurrentState = this.arrayToMap(this.getCurrentState(), true);
			const aPanelState = [],
				oMetadata = this.getControl()._getP13nMetadata();
			oMetadata[this.getP13nMetadataTarget()].forEach((oMetadataItem) => {
				aPanelState.push({
					name: oMetadataItem.key,
					label: oMetadataItem.label || oMetadataItem.key,
					tooltip: oMetadataItem.tooltip,
					index: mCurrentState[oMetadataItem.key] ? mCurrentState[oMetadataItem.key].index : undefined,
					sorted: !!mCurrentState[oMetadataItem.key],
					descending: mCurrentState[oMetadataItem.key] ? mCurrentState[oMetadataItem.key].descending : undefined
				});
			});

			// Sort panel config
			const sLocale = undefined/*Configuration*/.getLocale().toString(),
				oCollator = window.Intl.Collator(sLocale, {});
			aPanelState.sort((mItem1, mItem2) => {
				if (mItem1.sorted && mItem2.sorted) {
					return (mItem1.index || 0) - (mItem2.index || 0);
				}
				if (mItem1.sorted) {
					return -1;
				}
				if (mItem2.sorted) {
					return 1;
				}
				return oCollator.compare(mItem1.label, mItem2.label);
			});
			aPanelState.forEach((oItem) => delete oItem.index);
			return aPanelState;
		};

		SortMediator.prototype.getCurrentState = function () {
			const oCustomConfig = CustomDataConfig.read(this.getControl()) || {};
			const oSortConditions =
				oCustomConfig.hasOwnProperty("properties") && oCustomConfig.properties[this.getTargetAggregation()]
					? oCustomConfig.properties[this.getTargetAggregation()]
					: {};

			const aState = Object.values(oSortConditions)
				.filter((oItem) => oItem.sorted)
				.sort((oItem1, oItem2) => {
					return oItem1.index - oItem2.index;
				});

			return aState.map((oItem) => ({ key: oItem.key, descending: oItem.descending }));
		};

		SortMediator.prototype.getChanges = function () {
			const aChanges = [],
				aCurrentState = this.getCurrentState(),
				aP13nData = this._getP13nData(),
				aNextState = aP13nData
					.filter((oEntry) => !!oEntry.sorted)
					.map((oEntry) => ({ key: oEntry.name, descending: oEntry.descending }));

			if (deepEqual(aCurrentState, aNextState)) {
				return aChanges;
			}

			const aDeleted = this._getDeletes(aCurrentState, aNextState),
				aInserted = this._getInserts(aCurrentState, aNextState),
				aMoved = this._getMove(aCurrentState, aNextState, aDeleted, aInserted);


			aChanges.push(
				this.createChange("uploadSetTableSortStateChange", { deleted: aDeleted, moved: aMoved, inserted: aInserted })
			);

			return aChanges;
		};

		SortMediator.prototype._getP13nData = function () {
			return this._oPanel ? this._oPanel.getP13nData() : {};
		};

		SortMediator.prototype._getDeletes = function (aCurrentState, aNextState) {
			const aResult = [],
				mNextState = this.arrayToMap(aNextState);

			aCurrentState.forEach((oState, iIndex) => {
				if (!mNextState[oState.key]) {
					aResult.push({ key: oState.key, prevIndex: iIndex, prevDescending: oState.descending });
				}
			});
			return aResult;
		};

		SortMediator.prototype._getInserts = function (aCurrentState, aNextState) {
			const aResult = [],
				mCurrentState = this.arrayToMap(aCurrentState);

			aNextState.forEach((oState, iIndex) => {
				if (!mCurrentState[oState.key]) {
					aResult.push({ key: oState.key, index: iIndex, descending: oState.descending });
				}
			});
			return aResult;
		};

		SortMediator.prototype._getMove = function (aCurrentState, aNextState) {
			const aResult = [],
				mNextState = this.arrayToMap(aNextState, true);

			aCurrentState.forEach((oState, iIndex) => {
				if (
					mNextState[oState.key] &&
					(mNextState[oState.key].index !== iIndex || mNextState[oState.key].descending !== oState.descending)
				) {
					aResult.push({
						key: oState.key,
						index: mNextState[oState.key].index,
						prevIndex: iIndex,
						descending: mNextState[oState.key].descending,
						prevDescending: oState.descending
					});
				}
			});
			return aResult;
		};

		SortMediator.prototype.applyStateToTable = function (oSorters = {}) {
			const aState = this.getCurrentState();
			if (aState.length) {
				const aSortMetadata = this.getControl()._getP13nMetadata()[this.getP13nMetadataTarget()] ?? [],
					mSortMetadata = this.arrayToMap(aSortMetadata);

				aState.forEach((oEntry) => {
					if (!mSortMetadata[oEntry.key]) {
						return;
					}
					if (oSorters[oEntry.key]) {
						oSorters[oEntry.key].bDescending = oEntry.descending;
					} else {
						oSorters[oEntry.key] = new Sorter(mSortMetadata[oEntry.key].path, oEntry.descending);
					}
				});
			}
		};

		return SortMediator;
	}
);
