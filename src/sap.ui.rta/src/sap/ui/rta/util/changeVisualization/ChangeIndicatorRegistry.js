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
	 * @ui5-restricted
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

	// Utils

	ChangeIndicatorRegistry.prototype._getCommandForChange = function (oChange) {
		// Open task: Support pre 1.84 changes
		return oChange.getDefinition().support.command;
	};

	// Registry

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

		var fnAddSelector = function (sSelectorId, oChange, bDependent) {
			if (oChangeIndicators[sSelectorId] === undefined) {
				oChangeIndicators[sSelectorId] = [];
			}
			oChangeIndicators[sSelectorId].push(Object.assign(
				{
					id: oChange.change.getId(),
					dependent: bDependent
				},
				_omit(oChange, ["selectors", "dependentSelectors"])
			));
		};

		values(this._oChanges).forEach(function (oChange) {
			(oChange.selectors || []).forEach(function (sSelectorId) {
				fnAddSelector(sSelectorId, oChange, false);
			});

			(oChange.dependentSelectors || []).forEach(function (sSelectorId) {
				fnAddSelector(sSelectorId, oChange, true);
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
	 */
	ChangeIndicatorRegistry.prototype.registerChange = function (oChange) {
		var aCategories = this.getCommandCategories();
		var sCommandName = this._getCommandForChange(oChange);
		var oNewChangeInformation = {
			change: oChange,
			commandName: sCommandName,
			commandCategory: Object.keys(aCategories).find(function (sCommandCategoryName) {
				return includes(aCategories[sCommandCategoryName], sCommandName);
			})
		};

		// Only register changes that are valid for visualization
		if (oNewChangeInformation.commandCategory === undefined) {
			return;
		}

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
	 * @param {object[]} aSelectors - List of selectors to register
	 * @param {boolean} bDependent - Whether the selectors are dependent selectors
	 */
	ChangeIndicatorRegistry.prototype.addSelectorsForChangeId = function (sChangeId, aSelectors, bDependent) {
		var oChange = this._oChanges[sChangeId];
		var sPropertyKey = bDependent ? "dependentSelectors" : "selectors";

		if (oChange === undefined) {
			throw new Error("Change id is not registered");
		}

		if (oChange[sPropertyKey] === undefined) {
			oChange[sPropertyKey] = [];
		}

		aSelectors.forEach(function (oSelector) {
			if (!oChange[sPropertyKey].includes(oSelector.getId())) {
				oChange[sPropertyKey].push(oSelector.getId());
			}
		});
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
