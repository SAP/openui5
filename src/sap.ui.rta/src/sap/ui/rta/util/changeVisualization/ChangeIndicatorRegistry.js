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
	"sap/ui/fl/Utils"
], function(
	includes,
	values,
	_omit,
	Log,
	ManagedObject,
	JsControlTreeModifier,
	ElementUtil,
	ChangesWriteAPI,
	FlUtils
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
				commandCategories: {
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
			this._oChangeIndicatorData = {};
			this._oChangeIndicators = {};
		}
	});

	ChangeIndicatorRegistry.prototype.exit = function () {
		this.reset();
	};

	/**
	 * Returns all registered changes.
	 *
	 * @returns {object[]} Registered changes
	 */
	ChangeIndicatorRegistry.prototype.getChanges = function () {
		return values(this._oChangeIndicatorData || {}).map(function (oChange) {
			return Object.assign({}, oChange);
		});
	};

	/**
	 * Returns the IDs of all registered changes.
	 *
	 * @returns {string[]} Promise with both design time and runtime change
	 */
	ChangeIndicatorRegistry.prototype.getChangeIds = function () {
		return Object.keys(this._oChangeIndicatorData || {});
	};

	/**
	 * Returns a registered change.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 * @returns {object} Registered change
	 */
	ChangeIndicatorRegistry.prototype.getChange = function (sChangeId) {
		return this._oChangeIndicatorData[sChangeId] && Object.assign({}, this._oChangeIndicatorData[sChangeId]);
	};

	/**
	 * Groups all registered changes by their selectors and returns a list of selectors
	 * with all dependent and non-dependent changes.
	 *
	 * @returns {object[]} Change indicators
	 */
	ChangeIndicatorRegistry.prototype.getChangeIndicatorData = function () {
		var oChangeIndicators = {};

		function addSelector (sSelectorId, sAffectedElementId, oChange, bDependent) {
			if (oChangeIndicators[sSelectorId] === undefined) {
				oChangeIndicators[sSelectorId] = [];
			}
			oChangeIndicators[sSelectorId].push(Object.assign(
				{
					id: oChange.change.getId(),
					dependent: bDependent,
					affectedElementId: sAffectedElementId,
					payload: oChange.visualizationInfo.payload || {}
				},
				_omit(oChange, ["visualizationInfo"])
			));
		}

		values(this._oChangeIndicatorData).forEach(function (oChange) {
			oChange.visualizationInfo.displayElementIds.forEach(function (sSelectorId, iIndex) {
				addSelector(sSelectorId, oChange.visualizationInfo.affectedElementIds[iIndex], oChange, false);
			});

			oChange.visualizationInfo.dependentElementIds.forEach(function (sSelectorId) {
				addSelector(sSelectorId, sSelectorId, oChange, true);
			});
		});

		return oChangeIndicators;
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
	 * @returns {Promise<undefined>} Resolves as soon as the change is registered
	 */
	ChangeIndicatorRegistry.prototype.registerChange = function(oChange, sCommandName) {
		var oAppComponent = FlUtils.getAppComponentForControl(ElementUtil.getElementInstance(this.getRootControlId()));
		return getVisualizationInfo(oChange, oAppComponent).then(function(mChangeVisualizationInfo) {
			var aCategories = this.getCommandCategories();
			var sCommandCategory;
			if (sCommandName === "settings" && includes(Object.keys(aCategories), mChangeVisualizationInfo.payload.category)) {
				sCommandCategory = mChangeVisualizationInfo.payload.category;
			} else {
				sCommandCategory = Object.keys(aCategories).find(function (sCommandCategoryName) {
					return includes(aCategories[sCommandCategoryName], sCommandName);
				});
			}

			this._oChangeIndicatorData[oChange.getId()] = {
				change: oChange,
				commandName: sCommandName,
				commandCategory: sCommandCategory,
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
					payload: mVisualizationInfo.payload || {}
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
		Object.keys(this._oChangeIndicatorData).forEach(function (sKeyToRemove) {
			this.removeChange(sKeyToRemove);
		}.bind(this));

		values(this._oChangeIndicators).forEach(function (oIndicator) {
			oIndicator.destroy();
		});
		this._oChangeIndicators = {};
	};

	/**
	 * Removes a change.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 */
	ChangeIndicatorRegistry.prototype.removeChange = function (sChangeId) {
		delete this._oChangeIndicatorData[sChangeId];
	};

	return ChangeIndicatorRegistry;
});
