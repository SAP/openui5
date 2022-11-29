/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes",
	"sap/base/util/values",
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeStates"
], function(
	includes,
	values,
	_omit,
	Log,
	ManagedObject,
	JsControlTreeModifier,
	ElementUtil,
	ChangesWriteAPI,
	FlUtils,
	ChangeCategories,
	ChangeStates
) {
	"use strict";

	/**
	 * @class
	 * Registry for <code>sap.ui.rta.util.changeVisualization.ChangeIndicator</code> instances.
	 *
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.rta.util.changeVisualization.ChangeIndicatorRegistry
	 * @author SAP SE
	 * @since 1.86.0
	 * @version ${version}
	 * @private
	 */
	var ChangeIndicatorRegistry = ManagedObject.extend("sap.ui.rta.util.changeVisualization.ChangeIndicatorRegistry", {
		metadata: {
			properties: {
				/**
				 * Available command categories
				 */
				changeCategories: {
					type: "object",
					defaultValue: []
				},
				/**
				 * Id of the component or control to visualize the changes for
				 */
				 rootControlId: {
					type: "string"
				}
			}
		},
		constructor: function () {
			ManagedObject.prototype.constructor.apply(this, arguments);

			// List of entries with indicator data, grouped by Change ID
			this._oRegisteredChanges = {};

			// List of actual change indicator objects, grouped by selector
			this._oChangeIndicators = {};
		}
	});

	ChangeIndicatorRegistry.prototype.exit = function () {
		this.reset();
	};

	/**
	 * Returns the change indicator data for all registered changes.
	 *
	 * @returns {object[]} Change indicator data for all registered changes
	 */
	ChangeIndicatorRegistry.prototype.getAllRegisteredChanges = function () {
		return values(this._oRegisteredChanges || {}).map(function (oChange) {
			return Object.assign({}, oChange);
		});
	};

	/**
	 * Returns the IDs of all registered changes.
	 *
	 * @returns {string[]} Array with both design time and runtime registered changes
	 */
	ChangeIndicatorRegistry.prototype.getRegisteredChangeIds = function () {
		return Object.keys(this._oRegisteredChanges || {});
	};

	/**
	 * Returns a data entry of a registered change indicator for a change ID.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 * @returns {object} Registered change
	 */
	ChangeIndicatorRegistry.prototype.getRegisteredChange = function (sChangeId) {
		return this._oRegisteredChanges[sChangeId] && Object.assign({}, this._oRegisteredChanges[sChangeId]);
	};

	/**
	 * Groups all registered changes by their selectors and returns a list of selectors
	 * with all dependent and non-dependent change indicator data.
	 *
	 * @returns {object} List of selectors with change indicator data.
	 */
	ChangeIndicatorRegistry.prototype.getSelectorsWithRegisteredChanges = function () {
		var oChangeIndicators = {};

		function addSelector (sSelectorId, sAffectedElementId, oChangeIndicatorData, bDependent) {
			if (oChangeIndicators[sSelectorId] === undefined) {
				oChangeIndicators[sSelectorId] = [];
			}
			oChangeIndicators[sSelectorId].push(Object.assign(
				{
					id: oChangeIndicatorData.change.getId(),
					dependent: bDependent,
					affectedElementId: sAffectedElementId,
					descriptionPayload: oChangeIndicatorData.visualizationInfo.descriptionPayload || {}
				},
				_omit(oChangeIndicatorData, ["visualizationInfo"])
			));
		}

		values(this._oRegisteredChanges)
			.forEach(function (oChangeIndicatorData) {
				oChangeIndicatorData.visualizationInfo.displayElementIds
				.forEach(function (sId, iIndex) {
					addSelector(sId, oChangeIndicatorData.visualizationInfo.affectedElementIds[iIndex], oChangeIndicatorData, false);
				});

				oChangeIndicatorData.visualizationInfo.dependentElementIds
					.forEach(function (sId) {
						addSelector(sId, sId, oChangeIndicatorData, true);
					});
			});

		return oChangeIndicators;
	};

	ChangeIndicatorRegistry.prototype.getRelevantChangesWithSelector = function () {
		var oSelectors = this.getSelectorsWithRegisteredChanges();
		var aRelevantChanges = [];
		Object.keys(oSelectors).forEach(function(sSelectorId) {
			var aRelevantChangesForSelector = oSelectors[sSelectorId].filter(function (oChange) {
				return !oChange.dependent;
			});
			aRelevantChanges = aRelevantChanges.concat(aRelevantChangesForSelector);
		});
		return aRelevantChanges;
	};

	/**
	 * Returns the registered change indicator for the given element ID.
	 *
	 * @param {string} sSelectorId - ID of the indicator
	 * @returns {object} Registered change indicator
	 */
	ChangeIndicatorRegistry.prototype.getChangeIndicator = function (sSelectorId) {
		return this._oChangeIndicators[sSelectorId];
	};

	/**
	 * Returns all registered change indicators.
	 *
	 * @returns {object[]} Registered change indicators
	 */
	ChangeIndicatorRegistry.prototype.getChangeIndicators = function () {
		return values(this._oChangeIndicators || {});
	};

	/**
	 * Registers a change under its ID.
	 *
	 * @param {object} oChange - The change to register
	 * @param {string} sCommandName - Command name of the change
	 * @param {string} oVersionsModel - Model with versioning data
	 * @returns {Promise<undefined>} Resolves as soon as the change is registered
	 */
	ChangeIndicatorRegistry.prototype.registerChange = function(oChange, sCommandName, oVersionsModel) {
		var oAppComponent = FlUtils.getAppComponentForControl(ElementUtil.getElementInstance(this.getRootControlId()));
		return getVisualizationInfo(oChange, oAppComponent).then(function(mChangeVisualizationInfo) {
			var aCategories = this.getChangeCategories();
			var sChangeCategory;
			// For "settings", the control developer can choose one of the existing categories
			if (sCommandName === "settings" && includes(Object.keys(aCategories), mChangeVisualizationInfo.descriptionPayload.category)) {
				sChangeCategory = mChangeVisualizationInfo.descriptionPayload.category;
			} else {
				sChangeCategory = Object.keys(aCategories).find(function (sChangeCategoryName) {
					return includes(aCategories[sChangeCategoryName], sCommandName);
				});
				if (!sChangeCategory) {
					sChangeCategory = ChangeCategories.OTHER;
				}
			}
			var aChangeStates;
			var aDraftChangesList = [];
			if (oVersionsModel) {
				aDraftChangesList = oVersionsModel.getData().draftFilenames;
			}

			if (oChange.getState() === "NEW") {
				aChangeStates = ChangeStates.getDraftAndDirtyStates();
			} else if (aDraftChangesList && aDraftChangesList.includes(oChange.getId())) {
				aChangeStates = [ChangeStates.DRAFT];
			} else {
				aChangeStates = [ChangeStates.ACTIVATED];
			}

			this._oRegisteredChanges[oChange.getId()] = {
				change: oChange,
				commandName: sCommandName,
				changeCategory: sChangeCategory,
				changeStates: aChangeStates,
				visualizationInfo: mChangeVisualizationInfo
			};
		}.bind(this));
	};

	function getVisualizationInfo(oChange, oAppComponent) {
		function getSelectorIds(aSelectorList) {
			if (!aSelectorList) {
				return undefined;
			}
			return aSelectorList
				.map(function(vSelector) {
					var oElement = typeof vSelector.getId === "function"
						? vSelector
						: JsControlTreeModifier.bySelector(vSelector, oAppComponent);
					return oElement && oElement.getId();
				})
				.filter(Boolean);
		}

		return getInfoFromChangeHandler(oAppComponent, oChange)
			.then(function(oInfoFromChangeHandler) {
				var mVisualizationInfo = oInfoFromChangeHandler || {};
				var aAffectedElementIds = getSelectorIds(mVisualizationInfo.affectedControls || [oChange.getSelector()]);

				return {
					affectedElementIds: aAffectedElementIds,
					dependentElementIds: getSelectorIds(mVisualizationInfo.dependentControls) || [],
					displayElementIds: getSelectorIds(mVisualizationInfo.displayControls) || aAffectedElementIds,
					updateRequired: mVisualizationInfo.updateRequired,
					descriptionPayload: mVisualizationInfo.descriptionPayload || {}
				};
			});
	}

	function getInfoFromChangeHandler(oAppComponent, oChange) {
		var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
		if (oControl) {
			return ChangesWriteAPI.getChangeHandler({
				changeType: oChange.getChangeType(),
				element: oControl,
				modifier: JsControlTreeModifier,
				layer: oChange.getLayer()
			})
				.then(function(oChangeHandler) {
					if (oChangeHandler && typeof oChangeHandler.getChangeVisualizationInfo === "function") {
						return oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent);
					}
					return undefined;
				})
				.catch(function(vErr) {
					Log.error(vErr);
					return undefined;
				});
		}

		return Promise.resolve();
	}

	/**
	 * Adds a change indicator to the registry.
	 *
	 * @param {string} sSelectorId - The ID of the selector for which the change indicator is registered
	 * @param {object} oChangeIndicator - The change indicator to register
	 */
	ChangeIndicatorRegistry.prototype.registerChangeIndicator = function (sSelectorId, oChangeIndicator) {
		this._oChangeIndicators[sSelectorId] = oChangeIndicator;
	};

	/**
	 * Resets the change and change indicator registries.
	 */
	ChangeIndicatorRegistry.prototype.reset = function () {
		Object.keys(this._oRegisteredChanges).forEach(function (sKeyToRemove) {
			this.removeRegisteredChange(sKeyToRemove);
		}.bind(this));

		values(this._oChangeIndicators).forEach(function (oIndicator) {
			oIndicator.destroy();
		});
		this._oChangeIndicators = {};
	};

	/**
	 * Removes a data entry of a registered change indicator.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 */
	ChangeIndicatorRegistry.prototype.removeRegisteredChange = function (sChangeId) {
		delete this._oRegisteredChanges[sChangeId];
	};

	/**
	 * Removes changes with the updateRequired flag from the registry so the change can be re-registered and
	 * the visualizationInfo is updated => if an element has an unstable id this updates the id information in the registry (e.g simple forms)
	 */
	ChangeIndicatorRegistry.prototype.removeOutdatedRegisteredChanges = function () {
		this.getAllRegisteredChanges().forEach(function(oChange) {
			if (oChange.visualizationInfo && oChange.visualizationInfo.updateRequired) {
				this.removeRegisteredChange(oChange.change.getId());
			}
		}.bind(this));
	};

	/**
	 * Removes changes without any displayElementIds from the registry so the change can be re-registered and
	 * the visualizationInfo is updated => if an element is inside a dialog which hasnt been opened yet
	 */
	ChangeIndicatorRegistry.prototype.removeRegisteredChangesWithoutVizInfo = function () {
		this.getAllRegisteredChanges().forEach(function(oChange) {
			if (oChange.visualizationInfo && oChange.visualizationInfo.displayElementIds.length === 0) {
				this.removeRegisteredChange(oChange.change.getId());
			}
		}.bind(this));
	};

	return ChangeIndicatorRegistry;
});
