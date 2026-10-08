/*!
 * ${copyright}
 */

sap.ui.define([
	"./AggregationBaseDelegate",
	"sap/ui/mdc/mixin/delegate/FilterIntegrationDefault",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/model/Sorter",
	"sap/ui/core/Lib"
], (
	AggregationBaseDelegate,
	FilterIntegrationDefault,
	loadModules,
	Sorter,
	Lib
) => {
	"use strict";

	/**
	 * Base delegate for {@link sap.ui.mdc.List}. Extend this object in your project to use all functionalities of the list.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/ListDelegate
	 * @extends module:sap/ui/mdc/AggregationBaseDelegate
	 * @mixes module:sap/ui/mdc/mixin/delegate/FilterIntegrationDefault
	 * @since 1.151
	 * @public
	 */
	const ListDelegate = Object.assign({}, AggregationBaseDelegate, FilterIntegrationDefault);

	/**
	 * Returns group-level sorters to be applied when updating the list's binding based on the group conditions of the list.
	 *
	 * Override this method in a concrete delegate to customize group sorter construction.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @returns {sap.ui.model.Sorter[]} Array of group sorters
	 * @protected
	 */
	ListDelegate.getGroupSorters = function(oList) {
		const aPropertyInfo = oList.getPropertyHelper()?.getProperties() || [];
		const oGroupConditions = oList.getGroupConditions();
		const aGroupConditions = oGroupConditions ? oGroupConditions.groupLevels : [];
		const aSorters = [];

		aGroupConditions.forEach((oCondition) => {
			const oPropertyInfo = aPropertyInfo.find((oProp) => oProp.name === oCondition.key);
			if (oPropertyInfo) {
				const sPath = oPropertyInfo.path;
				const sKey = oCondition.key;
				aSorters.push(new Sorter(sPath, false, (oContext) => {
					return this.formatGroupHeader(oList, oContext, sKey);
				}));
			}
		});

		return aSorters;
	};

	/**
	 * Returns sorters to be applied when updating the list's binding based on the sort conditions of the list.
	 *
	 * Override this method in a concrete delegate to customize sort sorter construction.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @returns {sap.ui.model.Sorter[]} Array of sorters
	 * @protected
	 */
	ListDelegate.getSorters = function(oList) {
		const aPropertyInfo = oList.getPropertyHelper()?.getProperties() || [];
		const oSortConditions = oList.getSortConditions();
		const aSortConditions = oSortConditions ? oSortConditions.sorters : [];
		const aSorters = [];

		aSortConditions.forEach((oCondition) => {
			const oPropertyInfo = aPropertyInfo.find((oProp) => oProp.name === oCondition.key);
			if (oPropertyInfo) {
				const sPath = oPropertyInfo.path;
				aSorters.push(new Sorter(sPath, oCondition.descending));
			}
		});

		return aSorters;
	};

	/**
	 * Formats the title text of a group header row of the list.
	 *
	 * Override this method in a concrete delegate to provide a custom group header label.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @param {sap.ui.model.Context} oContext Binding context
	 * @param {string} sPropertyKey Key of the grouped property
	 * @returns {string} The group header title
	 * @protected
	 */
	ListDelegate.formatGroupHeader = function(oList, oContext, sPropertyKey) {
		const oPropertyHelper = oList.getPropertyHelper();
		const oProperty = oPropertyHelper?.getProperty(sPropertyKey);
		if (!oProperty) {
			return "";
		}
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");
		return oResourceBundle.getText("table.ROW_GROUP_TITLE", [oProperty.label, oContext.getProperty(oProperty.path, true)]);
	};

	ListDelegate.updateBindingInfo = function(oList, oBindingInfo) {
		const sBindingPath = oList.getPayload()?.bindingPath;

		if (!oBindingInfo.path && sBindingPath) {
			oBindingInfo.path = sBindingPath;
		}

		oBindingInfo.filters = this.getFilters(oList);

		const aGroupSorters = this.getGroupSorters(oList);
		const aSorters = this.getSorters(oList);

		// Group sorters precede sort sorters; deduplicate paths already covered by group sorters.
		oBindingInfo.sorter = aGroupSorters.concat(
			aSorters.filter((oSorter) => !aGroupSorters.some((oGroupSorter) => oGroupSorter.sPath === oSorter.sPath))
		);
	};

	/**
	 * Updates the items binding of the list.
	 *
	 * The default implementation rebinds the list. Model-specific subclasses may call dedicated binding methods
	 * to update the binding instead of triggering a full rebind.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object used to bind the list items
	 * @param {sap.ui.model.ListBinding} [oBinding] The current binding instance, if one exists
	 * @param {object} [mSettings] Additional settings
	 * @param {boolean} [mSettings.forceRefresh] Indicates that the binding must be refreshed even if <code>oBindingInfo</code> has not changed
	 * @protected
	 */
	ListDelegate.updateBinding = function(oList, oBindingInfo, oBinding, mSettings) {
		this.rebind(oList, oBindingInfo);
	};

	/**
	 * Rebinds the list with the binding info object returned from
	 * {@link module:sap/ui/mdc/ListDelegate.updateBindingInfo updateBindingInfo}.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object used to bind the list
	 * @protected
	 */
	ListDelegate.rebind = function(oList, oBindingInfo) {
		oList._getType().bindItems(oBindingInfo);
	};

	/**
	 * Returns the filter delegate of the list that provides basic filter functionality, such as adding filter fields.
	 *
	 * Application delegates must override this method and return an object with a working
	 * <code>addItem</code> implementation to enable the inbuilt filter personalization panel.
	 * The default implementation returns <code>null</code> from <code>addItem</code>, which means
	 * the filter panel is available but no filter fields are created unless overridden.
	 *
	 * @example
	 * oFilterDelegate = {
	 * 		addItem: function(oList, sPropertyKey) {
	 * 			return Promise.resolve(new FilterField({propertyKey: sPropertyKey, ...}));
	 * 		},
	 * 		addCondition: function(oList, sPropertyKey, mPropertyBag) {
	 * 			return Promise.resolve();
	 * 		},
	 * 		removeCondition: function(oList, sPropertyKey, mPropertyBag) {
	 * 			return Promise.resolve();
	 * 		}
	 * }
	 * @returns {sap.ui.mdc.FilterDelegateObject} Object for the list's filter personalization
	 * @protected
	 */
	ListDelegate.getFilterDelegate = function() {
		return {
			/**
			 * Creates an instance of a {@link sap.ui.mdc.FilterField FilterField}.
			 *
			 * By default, this method does not create a <code>FilterField</code> and returns a <code>Promise</code> that resolves with
			 * <code>null</code>. Override this in a concrete delegate to create filter fields from property metadata.
			 *
			 * @param {sap.ui.mdc.List} oList Instance of the list
			 * @param {string} sPropertyKey The property key
			 * @returns {Promise<sap.ui.mdc.FilterField>}
			 *     A <code>Promise</code> that resolves with an instance of <code>sap.ui.mdc.FilterField</code>.
			 */
			addItem: function(oList, sPropertyKey) {
				return Promise.resolve(null);
			},

			/**
			 * This method is called during the appliance of the add condition change.
			 *
			 * @param {sap.ui.mdc.List} oList Instance of the list
			 * @param {string} sPropertyKey The property key
			 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility API
			 * @returns {Promise} A <code>Promise</code> that resolves once the property info has been updated
			 */
			addCondition: function(oList, sPropertyKey, mPropertyBag) {
				return Promise.resolve();
			},

			/**
			 * This method is called during the appliance of the remove condition change.
			 *
			 * @param {sap.ui.mdc.List} oList Instance of the list
			 * @param {string} sPropertyKey The property key
			 * @param {object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility API
			 * @returns {Promise} A <code>Promise</code> that resolves once the property info has been updated
			 */
			removeCondition: function(oList, sPropertyKey, mPropertyBag) {
				return Promise.resolve();
			}
		};
	};

	/**
	 * Returns the export capabilities for the given list.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @returns {Promise<object>} A promise that resolves with the export capabilities
	 * @protected
	 */
	ListDelegate.fetchExportCapabilities = function(oList) {
		return Promise.resolve({XLSX: {}});
	};

	/**
	 * This is called after the list has loaded the necessary libraries and modules and initialized its content,
	 * but before it resolves its <code>initialized</code> promise. Override this method to perform custom initialization
	 * steps, such as setting up selection plugins or loading async content.
	 *
	 * @param {sap.ui.mdc.List} oList Instance of the list
	 * @returns {Promise} A <code>Promise</code> that resolves after the content has been initialized
	 * @private
	 */
	ListDelegate.initializeContent = async function(oList) {
		const [TitleProvider] = await loadModules("sap/m/plugins/TitleProvider");

		if (oList.isDestroyed()) {
			return;
		}

		oList._oList.addDependent(new TitleProvider({
			id: `${oList.getId()}-titleProvider`,
			title: `${oList.getId()}-tableTitle`,
			enabled: "{= ${$sap.ui.mdc.List>/headerVisible} && ${$sap.ui.mdc.List>/showItemCount} }",
			manageSelectedCount: "{= ${$sap.ui.mdc.List>/selectionMode} === 'Multi' }"
		}));
	};

	return ListDelegate;
});
