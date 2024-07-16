/*!
 * ${copyright}
 */
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate",
	'sap/ui/base/ManagedObjectObserver'
], function(FilterBarDelegate, ManagedObjectObserver) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.filterbar.vh.GenericVhFilterBarDelegate.
	 * This GenericVhFilterBarDelegate creates the propertyInfo based on the FilterItems of the Filterbar and does NOT load and analyse any metadata!
	 */
	var GenericVhFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	GenericVhFilterBarDelegate.addCondition = function() {
		return Promise.resolve();
	};

	GenericVhFilterBarDelegate.removeCondition = function() {
		return Promise.resolve();
	};


	/**
	 * Fetches the relevant metadata (from the FilterItems of the FiterBar) for the FilterBar and returns property info array
	 *
	 * @param {Object} oFilterBar - instance of the valuehelp FilterBar
	 * @returns {Array} array of property info
	 */
	GenericVhFilterBarDelegate.fetchProperties = function(oFilterBar) {
		if (!oFilterBar.__oObserver) {
			oFilterBar.__oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
			oFilterBar.__oObserver.observe(oFilterBar, {
				aggregations: ["filterItems"]
			});
		}

		return new Promise(function(fResolve) {
			var aFilterItems = [];
			oFilterBar.__aProperties = [];
			aFilterItems.forEach(function(oFF){
				addFilterField.call(this, oFF, oFilterBar.__aProperties);
			}.bind(this));

			var bSearchExists = !!oFilterBar.__aProperties.find(function(oProperty){return oProperty.name === "$search";});
			if (!bSearchExists) {
				oFilterBar.__aProperties.push({
					name: "$search",
					label: "Search",
					dataType: "Edm.String"
				});
			}
			fResolve(oFilterBar.__aProperties);
		}.bind(this));

	};

	function addFilterField(oFF, aProperties) {
		var sPath = oFF.getBindingPath("conditions");
		if (!sPath) {
			return;
		}
		var aPathParts = sPath.split("/");
		var sFieldPath = aPathParts[aPathParts.length - 1];

		aProperties.push({
			name: sFieldPath,
			label: oFF.getLabel() || sFieldPath,
			dataType: oFF.getDataType(),
			formatOptions: oFF.getDataTypeFormatOptions(),
			constraints: oFF.getDataTypeConstraints(),
			required: oFF.getRequired(),
			hiddenFilter: false,
			visible: oFF.getVisible(),
			maxConditions : oFF.getMaxConditions()//,
			// valueHelp: oFF._getValueHelp()
		});
	}

	function removeFilterField(oFF, aProperties) {
		var sPath = oFF.getBindingPath("conditions");
		if (!sPath) {
			return;
		}

		function _getProperty(sName) {
			var oNamedProperty = null;
			aProperties.some(function(oProperty) {
				if (oProperty.name === sName) {
					oNamedProperty = oProperty;
				}
				return oNamedProperty !== null;
			});

			return oNamedProperty;
		}

		function _removeProperty(sName) {
			var nIdx = -1;
			aProperties.some(function(oProperty, index) {
				if (oProperty.name === sName) {
					nIdx = index;
				}
				return nIdx !== -1;
			});

			if (nIdx >= 0) {
				aProperties.splice(nIdx, 1);
			}

			return nIdx;
		}

		var aPathParts = sPath.split("/");
		var sFieldPath = aPathParts[aPathParts.length - 1];
		if (_getProperty(sFieldPath)) {
			_removeProperty(sFieldPath);
		}
	}



	function _observeChanges(oChanges) {
		var oFilterBar, aProperties;

		if (oChanges.name === "filterItems") {
			if (oChanges.mutation === "insert") {
				var oNewFF = oChanges.child;
				oFilterBar = oNewFF.getParent();
				aProperties = oFilterBar.__aProperties;
				addFilterField.call(this, oNewFF, aProperties);
				return;
			}
			if (oChanges.mutation === "remove") {
				var oRemoveFF = oChanges.child;
				oFilterBar = oRemoveFF.getParent();
				aProperties = oFilterBar.__aProperties;
				removeFilterField(oRemoveFF, aProperties);
				return;
			}
		}
	}

	GenericVhFilterBarDelegate.cleanup = function(oFilterBar) {

		if (oFilterBar.__oObserver) {
			oFilterBar.__oObserver.disconnect();
			delete oFilterBar.__oObserver;
			delete oFilterBar.__aProperties;
		}

	};

	return GenericVhFilterBarDelegate;
});