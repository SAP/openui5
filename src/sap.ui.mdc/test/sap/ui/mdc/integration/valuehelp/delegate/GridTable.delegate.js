/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/core/Core",
	"sap/ui/mdc/util/FilterUtil",
	"delegates/odata/v4/util/DelegateUtil",
	"delegates/odata/v4/FilterBarDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"sap/ui/model/Filter",
	"sap/base/Log",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	'sap/ui/mdc/odata/v4/TypeMap',
	"sap/ui/core/Element"
], function(
	TableDelegate,
	Core,
	FilterUtil,
	DelegateUtil,
	FilterBarDelegate,
	ODataMetaModelUtil,
	Filter,
	Log,
	Column,
	Text,
	ODataV4TypeMap,
	Element
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	const ODataTableDelegate = Object.assign({}, TableDelegate);

	ODataTableDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

	ODataTableDelegate.fetchProperties = function(oTable) {
		const oModel = this._getModel(oTable);
		let pCreatePropertyInfos;

		if (!oModel) {
			pCreatePropertyInfos = new Promise(function(resolve) {
				oTable.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange, this);
			}.bind(this)).then(function(oModel) {
				return this._createPropertyInfos(oTable, oModel);
			}.bind(this));
		} else {
			pCreatePropertyInfos = this._createPropertyInfos(oTable, oModel);
		}

		return pCreatePropertyInfos.then(function(aProperties) {
			if (oTable.data){
				oTable.data("$tablePropertyInfo", aProperties);
			}
			return aProperties;
		});
	};

	function onModelContextChange(oEvent, oData) {
		const oTable = oEvent.getSource();
		const oModel = this._getModel(oTable);

		if (oModel) {
			oTable.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	ODataTableDelegate._createPropertyInfos = function(oTable, oModel) {
		const oMetadataInfo = oTable.getDelegate().payload;
		const aProperties = [];
		const sEntitySetPath = "/" + oMetadataInfo.collectionName;
		const oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function(aResults) {
			const oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
			const oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
			const oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
			const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			const oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

			for (const sKey in oEntityType) {
				const oObj = oEntityType[sKey];

				if (oObj && oObj.$kind === "Property") {
					// ignore (as for now) all complex properties
					// not clear if they might be nesting (complex in complex)
					// not clear how they are represented in non-filterable annotation
					// etc.
					if (oObj.$isCollection) {
						Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
						continue;
					}

					const oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

					aProperties.push({
						name: sKey,
						path: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						dataType: oObj.$Type,
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1
					});
				}
			}

			return aProperties;
		});
	};

	/**
	 * Updates the binding info with the relevant path and model from the metadata.
	 *
	 * @param {Object} oTable The MDC table instance
	 * @param {Object} oBindingInfo The bindingInfo of the table
	 */
	 ODataTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		const oDelegatePayload = oTable.getPayload();

		if (oDelegatePayload ) {
			oBindingInfo.path = oBindingInfo.path || oDelegatePayload.collectionPath || "/" + oDelegatePayload.collectionName;
			oBindingInfo.model = oBindingInfo.model || oDelegatePayload.model;
		}

		const oFilterBar = Element.registry.get(oTable.getFilter());
		// var bTableFilterEnabled = oTable.isFilteringEnabled();
		let mConditions;
		let oOuterFilterInfo;
		const aFilters = [];

		// if (bTableFilterEnabled) {
		// 	mConditions = oTable.getConditions();
		// 	var aPropertiesMetadata = oTable.getPropertyHelper().getProperties();
		// 	oInnerFilterInfo = FilterUtil.getFilterInfo(ODataTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata);

		// 	if (oInnerFilterInfo.filters) {
		// 		aFilters.push(oInnerFilterInfo.filters);
		// 	}
		// }

		if (oFilterBar) {
			mConditions = oFilterBar.getConditions();
			if (mConditions) {

				const aPropertiesMetadata = oFilterBar.getPropertyHelper().getProperties();
				oOuterFilterInfo = FilterUtil.getFilterInfo(ODataTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata);

				if (oOuterFilterInfo.filters) {
					aFilters.push(oOuterFilterInfo.filters);
				}
			}

			// get the basic search
			let sSearchText = oFilterBar.getSearch instanceof Function ? oFilterBar.getSearch() :  "";
			if (sSearchText && sSearchText.indexOf(" ") === -1) { // to allow search for "(".....
				sSearchText = '"' + sSearchText + '"'; // TODO: escape " in string
			} // if it contains spaces allow opeartors like OR...
			oBindingInfo.parameters.$search = sSearchText || undefined;
		}

		if (aFilters && aFilters.length > 0) {
			oBindingInfo.filters = new Filter(aFilters, true);
		}

		oBindingInfo.parameters.$count = true;
	};

	ODataTableDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	ODataTableDelegate._getModel = function(oTable) {
		const oMetadataInfo = oTable.getDelegate().payload;
		return oTable.getModel(oMetadataInfo.model);
	};

	ODataTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		if (oTable.getModel) {
			return this._createColumn(sPropertyName, oTable);
		}
		return Promise.resolve(null);
	};

	/**
	 * Creates the Column for the specified property info and table
	 *
	 * @param {string} sPropertyName The property info name
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} Promise that resolves with the instance of mdc.table.Column
	 * @private
	 */
	ODataTableDelegate._createColumn = function(sPropertyName, oTable) {
		return this.fetchProperties(oTable).then(function(aProperties) {
			const oPropertyInfo = aProperties.find(function(oCurrentPropertyInfo) {
				return oCurrentPropertyInfo.name === sPropertyName;
			});

			if (!oPropertyInfo) {
				return null;
			}

			return this._createColumnTemplate(oPropertyInfo, oTable).then(function(oTemplate) {
				const oColumnInfo = this._getColumnInfo(oPropertyInfo, oTable);
				oColumnInfo.template = oTemplate;
				oColumnInfo.propertyKey = sPropertyName;
				return new Column(oTable.getId() + "--" + oPropertyInfo.name, oColumnInfo);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Creates the Column for the specified property info and table
	 *
	 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Object} column info to be used in creation of the column/cell
	 * @private
	 */
	ODataTableDelegate._getColumnInfo = function(oPropertyInfo, oTable) {
		return {
			header: oPropertyInfo.label
		};
	};

	/**
	 * Creates and returns the template info of the column for the specified property info
	 *
	 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Object} template info to be used in creationg of the column/cell
	 * @private
	 */
	ODataTableDelegate._getColumnTemplateInfo = function(oPropertyInfo, oTable) {
		return {
			text: {
				path: oPropertyInfo.path || oPropertyInfo.name
			}
		};
	};

	/**
	 * Creates and returns the template of the column for the specified info
	 *
	 * @param {Object} oPropertyInfo The property info object/json containing at least name and label properties
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} Promise that resolves with the template to be used in the column/cell
	 * @private
	 */
	ODataTableDelegate._createColumnTemplate = function(oPropertyInfo, oTable) {
		return Promise.resolve(new Text(this._getColumnTemplateInfo(oPropertyInfo, oTable)));
	};

	return ODataTableDelegate;
});
