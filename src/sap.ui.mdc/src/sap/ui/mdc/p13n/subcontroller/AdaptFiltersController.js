/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController",
	"sap/ui/core/Lib",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/base/util/merge"
], (BaseController, Library, P13nBuilder, merge) => {
	"use strict";

	const AdaptFiltersController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.AdaptFiltersController", {
		constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
	});

	AdaptFiltersController.prototype.getUISettings = function() {
		return {
			verticalScrolling: false,
			title: Library.getResourceBundleFor("sap.ui.mdc").getText("filterbar.ADAPT_TITLE"),
			afterClose: function(oEvt) {
				const oDialog = oEvt.getSource();
				if (oDialog) {
					oDialog.getContent()[0].executeRemoves();
					oDialog.removeAllContent();
					oDialog.destroy();
				}
			}
		};
	};

	AdaptFiltersController.prototype.getBeforeApply = function() {
		const oAdaptationFilterBar = this.getAdaptationControl().getInbuiltFilter();
		const pConditionPromise = oAdaptationFilterBar ? oAdaptationFilterBar.createConditionChanges() : Promise.resolve([]);
		return pConditionPromise;
	};

	AdaptFiltersController.prototype.getFilterControl = function() {
		return this.getAdaptationControl();
	};

	AdaptFiltersController.prototype.getChangeOperations = function() {
		return {
			add: "addFilter",
			remove: "removeFilter",
			move: "moveFilter",
			additional: ["addCondition", "removeCondition"]
		};
	};

	AdaptFiltersController.prototype.initAdaptationUI = function(oPropertyHelper) {

		return this.getAdaptationControl().retrieveInbuiltFilter().then((oAdaptationFilterBar) => {
			const oAdaptationData = this.mixInfoAndState(oPropertyHelper);

			oAdaptationFilterBar.getTitle = function() {
				return Library.getResourceBundleFor("sap.ui.mdc").getText("filterbar.ADAPT_TITLE");
			};

			this._oPanel = oAdaptationFilterBar;

			oAdaptationFilterBar.setP13nData(oAdaptationData);
			oAdaptationFilterBar.setLiveMode(false);
			return oAdaptationFilterBar.createFilterFields().then(() => {
				return oAdaptationFilterBar;
			});
		});
	};

	AdaptFiltersController.prototype.getP13nData = function() {
		return this._oPanel.getP13nData().items;
	};

	AdaptFiltersController.prototype.update = function(oPropertyHelper) {
		if (this._oPanel) {
			const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
			this._oPanel.setP13nData(oAdaptationData);
			this.getAdaptationControl().getInbuiltFilter().createFilterFields();
		}
	};

	AdaptFiltersController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const mExistingFilters = this.getAdaptationControl().getCurrentState().filter || {};

		const aItemState = this.getCurrentState();
		const mExistingProperties = P13nBuilder.arrayToMap(aItemState);

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (oItem, oProperty) => {

			const oExistingProperty = mExistingProperties[oProperty.name];
			const aExistingFilters = mExistingFilters[oProperty.name];
			oItem.visible = oExistingProperty ? true : false;
			oItem.visibleInDialog = true;
			oItem.position = oExistingProperty ? oExistingProperty.position : -1;
			oItem.isFiltered = aExistingFilters && aExistingFilters.length > 0 ? true : false;
			oItem.required = oProperty.required;

			return !(oProperty.hiddenFilter === true || oProperty.name == "$search");
		}, true);

		this.sortP13nData({
			visible: "visible",
			position: "position"
		}, oP13nData.items);

		return oP13nData;
	};

	return AdaptFiltersController;

});