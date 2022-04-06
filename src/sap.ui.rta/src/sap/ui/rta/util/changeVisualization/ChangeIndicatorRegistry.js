/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/util/includes",
	"sap/base/util/values",
	"sap/base/util/restricted/_omit"
], function(
	ManagedObject,
	includes,
	values,
	_omit
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
				}
			}
		},
		constructor: function () {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this._oChanges = {};
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
		return values(this._oChanges || {}).map(function (oChange) {
			return Object.assign({}, oChange);
		});
	};

	/**
	 * Returns the IDs of all registered changes.
	 *
	 * @returns {string[]} Promise with both design time and runtime change
	 */
	ChangeIndicatorRegistry.prototype.getChangeIds = function () {
		return Object.keys(this._oChanges || {});
	};

	/**
	 * Returns a registered change.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 * @returns {object} Registered change
	 */
	ChangeIndicatorRegistry.prototype.getChange = function (sChangeId) {
		return this._oChanges[sChangeId] && Object.assign({}, this._oChanges[sChangeId]);
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

		values(this._oChanges).forEach(function (oChange) {
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
	 * Checks if the given element ID was registered as a change indicator.
	 *
	 * @param {string} sSelectorId - ID of the element to check
	 * @returns {boolean} Whether the element was registered as an indicator
	 */
	ChangeIndicatorRegistry.prototype.hasChangeIndicator = function (sSelectorId) {
		return !!this._oChangeIndicators[sSelectorId];
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
	 */
	ChangeIndicatorRegistry.prototype.registerChange = function (oChange, sCommandName) {
		var aCategories = this.getCommandCategories();
		var oNewChangeInformation = {
			change: oChange,
			commandName: sCommandName,
			commandCategory: Object.keys(aCategories).find(function (sCommandCategoryName) {
				return includes(aCategories[sCommandCategoryName], sCommandName);
			}),
			visualizationInfo: {
				affectedElementIds: [],
				displayElementIds: [],
				dependentElementIds: []
			}
		};

		this._oChanges[oChange.getId()] = oNewChangeInformation;
	};

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
	 * Adds selectors for a registered change.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 * @param {object} mVisualizationInfo - Map of selector IDs to register
	 * @param {string[]} [mVisualizationInfo.affectedElementIds] - Array of affected element IDs
	 * @param {string[]} [mVisualizationInfo.displayElementIds] - Array of element IDs that the indicators are attached to
	 * @param {string[]} [mVisualizationInfo.dependentElementIds] - Array of element IDs that the dependent indicators are attached to
	 * @param {object} [mVisualizationInfo.payload] - Command category specific visualization information
	 */
	ChangeIndicatorRegistry.prototype.addVisualizationInfo = function (sChangeId, mVisualizationInfo) {
		var oChange = this._oChanges[sChangeId];
		if (oChange === undefined) {
			throw new Error("Change id is not registered");
		}

		oChange.visualizationInfo = Object.assign({}, oChange.visualizationInfo, mVisualizationInfo);
	};

	/**
	 * Resets the change and change indicator registries.
	 */
	ChangeIndicatorRegistry.prototype.reset = function () {
		Object.keys(this._oChanges).forEach(function (sKeyToRemove) {
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
		delete this._oChanges[sChangeId];
	};

	return ChangeIndicatorRegistry;
});
