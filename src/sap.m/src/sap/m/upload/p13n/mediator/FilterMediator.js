/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/m/upload/p13n/mediator/BaseMediator",
		"sap/m/upload/FilterPanel",
		"sap/m/upload/p13n/modules/CustomDataConfig",
		"sap/base/util/deepEqual",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterType"
	],
	function (BaseMediator, FilterPanel, CustomDataConfig, deepEqual, Filter, FilterType) {
		"use strict";

		 /**
		 * Constructor for a new <code>FilterMediator</code>.
		 *
		 * @param {object} [mSettings] Initial settings for the new control
     	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this mediator
      	 * @param {string} mSettings.targetAggregation The name of the aggregation that is now managed by this mediator
     	 * @param {string} mSettings.p13nMetadataTarget The name of the personalization metadata target that is now managed by this mediator
		 *
		 * @class
		 * The <code>FilterMediator</code> entity serves as a class which handles filter panel related logic.
		 *
		 * @extends sap.m.upload.p13n.mediator.BaseMediator
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @private
		 * @experimental
		 * @internal
		 * @alias sap.m.upload.p13n.mediator.FilterMediator
		 */

		const FilterMediator = BaseMediator.extend("sap.m.upload.p13n.mediator.FilterMediator", {
			constructor: function (mSettings) {
				BaseMediator.call(this, mSettings);
			}
		});

		FilterMediator.prototype.createPanel = function () {
			return Promise.resolve(this.createUi(this.getPanelData()));
		};

		FilterMediator.prototype.createUi = function (aPanelData) {
			const oMetadata = this.getControl()._getP13nMetadata();
			this._oPanel = new FilterPanel({ fields: oMetadata[this.getP13nMetadataTarget()] });
			this._oPanel.setP13nData(aPanelData);
			return this._oPanel;
		};

		FilterMediator.prototype.getPanelData = function () {
			const aCurrentState = this.getCurrentState(),
				aPanelState = [],
				mMetadata = this.getControl()
					._getP13nMetadata()
					[this.getP13nMetadataTarget()].reduce((mMap, oProp) => {
						mMap[oProp.path] = oProp;
						return mMap;
					}, {});

			aCurrentState.forEach((oEntry) => {
				if (!mMetadata[oEntry.path]) {
					return;
				}
				aPanelState.push({
					name: oEntry.key,
					path: oEntry.path,
					operator: oEntry.operator,
					value: oEntry.value
				});
			});

			return aPanelState;
		};

		FilterMediator.prototype.getCurrentState = function () {
			const oCustomConfig = CustomDataConfig.read(this.getControl()) || {};
			const oFilterConditions =
				oCustomConfig.hasOwnProperty("properties") && oCustomConfig.properties[this.getTargetAggregation()]
					? oCustomConfig.properties[this.getTargetAggregation()]
					: {};

			const aState = Object.values(oFilterConditions)
				// .filter((oItem) => oItem.sorted)
				.sort((oItem1, oItem2) => {
					return oItem1.index - oItem2.index;
				});

			return aState.map((oItem) => ({ key: oItem.key, path: oItem.path, operator: oItem.operator, value: oItem.value }));
		};

		FilterMediator.prototype.getChanges = function () {
			const aChanges = [],
				aCurrentState = this.getCurrentState(),
				aP13nData = this._getP13nData(),
				aNextState = aP13nData
					// .filter((oEntry) => !!oEntry.sorted)
					.map((oEntry) => ({ key: oEntry.name, path: oEntry.path, operator: oEntry.operator, value: oEntry.value }));

			if (deepEqual(aCurrentState, aNextState)) {
				return aChanges;
			}

			const aDeleted = this._getDeletes(aCurrentState, aNextState),
				aInserted = this._getInserts(aCurrentState, aNextState),
				aMoved = this._getMove(aCurrentState, aNextState, aDeleted, aInserted);


			aChanges.push(
				this.createChange("uploadSetTableFilterStateChange", { deleted: aDeleted, moved: aMoved, inserted: aInserted })
			);

			return aChanges;
		};

		FilterMediator.prototype._getP13nData = function () {
			return this._oPanel ? this._oPanel.getP13nData() : {};
		};

		FilterMediator.prototype._getDeletes = function (aCurrentState, aNextState) {
			const aResult = [],
				mNextState = this.arrayToMap(aNextState);

			aCurrentState.forEach((oState, iIndex) => {
				if (!mNextState[oState.key]) {
					aResult.push({
						key: oState.key,
						prevIndex: iIndex,
						prevPath: oState.path,
						prevOperator: oState.operator,
						prevValue: oState.value
					});
				}
			});
			return aResult;
		};

		FilterMediator.prototype._getInserts = function (aCurrentState, aNextState) {
			const aResult = [],
				mCurrentState = this.arrayToMap(aCurrentState);

			aNextState.forEach((oState, iIndex) => {
				if (!mCurrentState[oState.key]) {
					aResult.push({
						key: oState.key,
						index: iIndex,
						path: oState.path,
						operator: oState.operator,
						value: oState.value
					});
				}
			});
			return aResult;
		};

		FilterMediator.prototype._getMove = function (aCurrentState, aNextState) {
			const aResult = [],
				mNextState = this.arrayToMap(aNextState, true),
				aProperties = ["path", "operator", "value"];

			aCurrentState.forEach((oState, iIndex) => {
				if (
					mNextState[oState.key] &&
					(mNextState[oState.key].index !== iIndex || !aProperties.every((sEntry) => mNextState[oState.key][sEntry] === oState[sEntry]))
				) {
					aResult.push({
						key: oState.key,
						index: mNextState[oState.key].index,
						prevIndex: iIndex,
						path: mNextState[oState.key].path,
						prevPath: oState.path,
						operator: mNextState[oState.key].operator,
						prevOperator: oState.operator,
						value: mNextState[oState.key].value,
						prevValue: oState.value
					});
				}
			});
			return aResult;
		};

		FilterMediator.prototype.applyStateToTable = function (oSorters = {}) {
			const aState = this.getCurrentState(),
				aFilters = aState.map((oEntry) => new Filter(oEntry.path, oEntry.operator, oEntry.value));
			this.getControl().getBinding("items").filter(aFilters.length ? new Filter(aFilters, true) : null, FilterType.Control);
		};

		return FilterMediator;
	}
);
