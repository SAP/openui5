/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/odata/v4/FilterBarDelegate",
	'sap/ui/base/ManagedObjectObserver'
], function(FilterBarDelegate, ManagedObjectObserver) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.filterbar.vh.GenericFilterBarDelegate.
	*  This GenericFilterbarDelegate creates the propertyInfo based on the FilterItems of the Filterbar and does NOT load and analyse any metadata!
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.86
	 * @alias sap.ui.mdc.filterbar.vh.GenericFilterBarDelegate
	 */
	var GenericFilterBarDelegate = Object.assign({}, FilterBarDelegate);
	var _oObserver;
	var _aProperties = [];

	/**
	 * Fetches the relevant metadata (from the FilterItems of the FiterBar) for the FilterBar and returns property info array
	 *
	 * @param {Object} oFilterBar - instance of the valuehelp FilterBar
	 * @returns {Array} array of property info
	 */
	GenericFilterBarDelegate.fetchProperties = function(oFilterBar) {
		if (!_oObserver) {
			_oObserver = new ManagedObjectObserver(_observeChanges);
			_oObserver.observe(oFilterBar, {
				aggregations: ["filterItems"]
			});
		}

		return new Promise(function(fResolve) {
			var aFilterItems = oFilterBar.getFilterItems();
			_aProperties = [];
			aFilterItems.forEach(function(oFF){
				addFilterField(oFF);
			});

			fResolve(_aProperties);
		});

	};

	function addFilterField(oFF) {
		var sPath = oFF.getBindingPath("conditions");
		if (!sPath) {
			return;
		}
		var aPathParts = sPath.split("/");
		var sFieldPath = aPathParts[aPathParts.length - 1];

		_aProperties.push({
			name: sFieldPath,
			label: oFF.getLabel() || sFieldPath,
			type: oFF.getDataType(),
			formatOptions: oFF.getDataTypeFormatOptions(),
			constraints: oFF.getDataTypeConstraints(),
			typeConfig: oFF._getFormatOptions().delegate.getTypeUtil().getTypeConfig(oFF.getDataType(), oFF.getDataTypeFormatOptions(), oFF.getDataTypeConstraints()),
			required: oFF.getRequired(),
			hiddenFilter: false,
			visible: oFF.getVisible(),
			maxConditions : oFF.getMaxConditions(),
			fieldHelp: oFF.getFieldHelp()
		});
	}

	function removeFilterField(oFF) {
		var sPath = oFF.getBindingPath("conditions");
		if (!sPath) {
			return;
		}
		var aPathParts = sPath.split("/");
		var sFieldPath = aPathParts[aPathParts.length - 1];
		if (_getProperty(sFieldPath)) {
			_removeProperty(sFieldPath);
		}
	}

	function _getProperty(sName) {
		var oNamedProperty = null;
		_aProperties.some(function(oProperty) {
			if (oProperty.name === sName) {
				oNamedProperty = oProperty;
			}
			return oNamedProperty !== null;
		});

		return oNamedProperty;
	}

	function _removeProperty(sName) {
		var nIdx = -1;
		_aProperties.some(function(oProperty, index) {
			if (oProperty.name === sName) {
				nIdx = index;
			}
			return nIdx !== -1;
		});

		if (nIdx >= 0) {
			_aProperties.splice(nIdx, 1);
		}

		return nIdx;
	}

	function _observeChanges(oChanges) {

		if (oChanges.name === "filterItems") {
			if (oChanges.mutation === "insert") {
				var oNewFF = oChanges.child;
				addFilterField(oNewFF);
				return;
			}
			if (oChanges.mutation === "remove") {
				var oRemoveFF = oChanges.child;
				removeFilterField(oRemoveFF);
				return;
			}
		}
	}

	return GenericFilterBarDelegate;
});
