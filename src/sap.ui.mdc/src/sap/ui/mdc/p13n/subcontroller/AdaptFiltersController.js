/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController",
	"sap/ui/core/Lib",
	"sap/m/library",
	"sap/base/util/merge",
	"sap/m/Button"
], (BaseController, Library, mLibrary, merge, Button) => {
	"use strict";

	const { ButtonType } = mLibrary;

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

	AdaptFiltersController.prototype.enhancePopup = function(oPopup) {
		// Check if new UI is enabled
		const oFilterBar = this.getAdaptationControl();
		let bIsNewAdaptFiltersUI = true; // default

		// Check URL parameter first
		const sUrlParam = new URLSearchParams(window.location.search).get("sap-ui-xx-new-adapt-filters");
		if (sUrlParam === "true") {
			bIsNewAdaptFiltersUI = true;
		} else if (sUrlParam === "false") {
			bIsNewAdaptFiltersUI = false;
		} else if (oFilterBar?.isA?.("sap.ui.mdc.FilterBar") && oFilterBar.getEnableLegacyUI) {
			bIsNewAdaptFiltersUI = !oFilterBar.getEnableLegacyUI();
		}

		if (bIsNewAdaptFiltersUI) {
			const oFilter = new Button({
				text: Library.getResourceBundleFor("sap.ui.mdc").getText("adaptFiltersPanel.FILTER_BUTTON"),
				press: () => {
					const oAdaptationFilter =  this.getAdaptationControl().getInbuiltFilter();
					if (!oAdaptationFilter) {
						return;
					}

					oAdaptationFilter.cleanUpAllFilterFieldsInErrorState();
					oAdaptationFilter.validate(true).then((oResult) => {
						oPopup._onClose(null, "Filter");
						oAdaptationFilter._validateAdaptationState();
					}).catch(() => {
						oAdaptationFilter._validateAdaptationState();
					});
				},
				type: ButtonType.Ghost
			});
			oPopup.insertAdditionalButton(oFilter, 1);
		}

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
				oAdaptationFilterBar._determineValidationState();
				return oAdaptationFilterBar;
			});
		});
	};

	AdaptFiltersController.prototype.update = function(oPropertyHelper) {
		if (this._oPanel) {
			const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
			this._oPanel.setP13nData(oAdaptationData);
			this.getAdaptationControl().getInbuiltFilter().createFilterFields();
		}
	};

	AdaptFiltersController.prototype.getP13nData = function() {
		return this.injectInactivePropertyKeys(this._oPanel.getP13nData().items);
	};

	AdaptFiltersController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const mExistingFilters = this.getAdaptationControl().getCurrentState().filter || {};

		const mExistingProperties = this._stateToMap();

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (oItem, oProperty) => {

			const sPropertyKey = oProperty.key;
			const oExistingProperty = mExistingProperties[sPropertyKey];
			const aExistingFilters = mExistingFilters[sPropertyKey];
			oItem.visible = oExistingProperty ? true : false;
			oItem.visibleInDialog = true;
			oItem.position = oExistingProperty ? oExistingProperty.position : -1;
			oItem.isFiltered = aExistingFilters && aExistingFilters.length > 0 ? true : false;
			oItem.required = oProperty.required;
			// requiresValidation is true if the item is visible or has been toggled in the current session
			oItem.requiresValidation = oItem.visible;

			return !(oProperty.hiddenFilter === true || sPropertyKey == "$search");
		}, true);

		this.sortP13nData({
			visible: "visible",
			position: "position"
		}, oP13nData.items);

		return oP13nData;
	};

	return AdaptFiltersController;

});