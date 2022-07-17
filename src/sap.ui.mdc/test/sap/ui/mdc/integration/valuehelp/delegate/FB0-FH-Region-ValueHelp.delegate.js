/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/base/util/UriParameters",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/core/Core",
	'sap/ui/mdc/condition/Condition',
	'sap/base/util/merge',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/base/util/deepEqual',
	'sap/ui/model/odata/v4/ODataPropertyBinding'
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	FilterBar,
	FilterField,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	UriParameters,
	FilterOperatorUtil,
	Core,
	Condition,
	merge,
	ConditionValidated,
	StateUtil,
	deepEqual,
	ODataPropertyBinding
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {

		var oValueHelp = oContainer && oContainer.getParent();

		var oParams = UriParameters.fromQuery(window.location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		var oCurrentTable = oCurrentContent && oCurrentContent.getTable();

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentTable) {


				oCurrentTable = new Table("mTable-region-popover", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "Region"})}),
						new Column({header: new Text({text : "Name"})}),
						new Column({header: new Text({text : "Country"})})

					],
					items: {
						path : "/Regions",
						parameters: {
							$expand: "country"
						},
						length: 10,
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: "{path: 'code', type:'sap.ui.model.odata.type.String'}"}),
								new Text({text: "{path: 'text', type:'sap.ui.model.odata.type.String'}"}),
								new Text({text: "{path: 'country_code', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				});
				oCurrentContent.setTable(oCurrentTable);
			}
		}


		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable({keyPath: "code", descriptionPath: "text", filterFields: "$search", title: "Country"});
				oContainer.addContent(oCurrentContent);

				oCurrentContent.setFilterBar(
					new FilterBar({
						liveMode: false,
						delegate: {
							name: "delegates/GenericVhFilterBarDelegate",
							payload: {}
						},
						basicSearchField: new FilterField({
							delegate: {
								name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
								payload: {}
							},
							dataType: "Edm.String",
							conditions: "{$filters>/conditions/$search}",
							width: "50%",
							maxConditions: 1,
							placeholder: "Search"
						}),
						filterItems: [
							new FilterField({
								delegate: {
									name: "sap/ui/mdc/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Country",
								conditions: "{$filters>/conditions/country_code}"
							})
						]
					})
				);
			}

			if (oCurrentTable) {
				oCurrentTable.destroy();
			}

			oCurrentTable = new Table("mTable-region-dialog", {
				width: "100%",
				growing: true,
				growingScrollToLoad: true,
				growingThreshold: 20,
				mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
				columns: [
					new Column({header: new Text({text : "Region"})}),
					new Column({header: new Text({text : "Name"})}),
					new Column({header: new Text({text : "Country"})})
				],
				items: {
					path : "/Regions",
					parameters: {
						$expand: "country"
					},
					suspended: bSuspended,
					template : new ColumnListItem({
						type: "Active",
						cells: [
							new Text({text: "{path: 'code', type:'sap.ui.model.odata.type.String'}"}),
							new Text({text: "{path: 'text', type:'sap.ui.model.odata.type.String'}"}),
							new Text({text: "{path: 'country_code', type:'sap.ui.model.odata.type.String'}"})
						]
					})
				}
			});

			oCurrentContent.setTable(oCurrentTable);
		}

		return Promise.resolve();
	};

	/* function _resolveODataModelValue (sPath, oContent) {
		var oModel = oContent.getModel();
		var oPropertyBinding = new ODataPropertyBinding(oModel, sPath, "");
		return oPropertyBinding.requestValue();
	}

	function _resolveConditionModelValue (sModel, sPath, oContent) {
		var oModel = oContent.getModel(sModel);
		return oModel.getProperty(sPath);
	} */


	ValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {

		// Tooling experiments BEG
		/* var sConditionModelCountry = _resolveConditionModelValue('$filters', '/conditions/country_code', oContent);
		console.log("sConditionModelCountry", sConditionModelCountry);

		var sODataModelCountryPromise = _resolveODataModelValue('/Authors(101)/countryOfOrigin_code', oContent).then(function (sODataModelCountry) {
			console.log("sODataModelCountry", sODataModelCountry);
		}); */
		// Tooling experiments END


		var oConditions = ODataV4ValueHelpDelegate.getInitialFilterConditions(oPayload, oContent, oControl);

		var oCountry = Core.byId("FB0-FF6");
		var aCountryConditions = oCountry && oCountry.getConditions();
		if (aCountryConditions && aCountryConditions.length) {
			oConditions["country_code"] = aCountryConditions;
			return oConditions;
		}
	};

	// Exemplatory implementation of a condition payload
	ValueHelpDelegate.createConditionPayload = function (oPayload, oContent, aValues, vContext) {
		var sIdentifier = oContent.getId();
		var oConditionPayload = {};
		oConditionPayload[sIdentifier] = {};

		var oListBinding = oContent.getListBinding();
			var oContext = oListBinding && oListBinding.aContexts && oListBinding.aContexts.find(function (oContext) {
				return oContext.getObject(oContent.getKeyPath()) === aValues[0];
			});
			if (oContext) {
				var aDataProperties = oContent.getTable().getBindingInfo("items").template.getCells().map(function (oCell) {
					return oCell.getBindingInfo("text").parts[0].path;
				});

				if (aDataProperties.indexOf("country_code") !== -1) {
					oConditionPayload[sIdentifier]["country_code"] = oContext.getProperty("country_code");
				}
			}
		return oConditionPayload;
	};

	// Exemplatory implementation of outparameter update
	ValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason, oConfig) {
		// find all conditions carrying country information
		var aAllConditionCountries = oValueHelp.getConditions().reduce(function (aResult, oCondition) {
			if (oCondition.payload) {
				Object.values(oCondition.payload).forEach(function (oSegment) {
					if (oSegment["country_code"] && aResult.indexOf(oSegment["country_code"]) === -1) {
						aResult.push(oSegment["country_code"]);
					}
				});
			}
			return aResult;
		}, []);

		if (aAllConditionCountries && aAllConditionCountries.length) {
			var oFilterBar = Core.byId("FB0");
			StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
				aAllConditionCountries.forEach(function(sCountry) {
					var bExists = oState.filter && oState.filter['countryOfOrigin_code'] && oState.filter['countryOfOrigin_code'].find(function (oCondition) {
						return oCondition.values[0] === sCountry;
					});
					if (!bExists) {
						var oNewCondition = Condition.createCondition("EQ", [sCountry], undefined, undefined, ConditionValidated.Validated);
						oState.filter['countryOfOrigin_code'] = oState.filter && oState.filter['countryOfOrigin_code'] || [];
						oState.filter['countryOfOrigin_code'].push(oNewCondition);
					}
				});
				StateUtil.applyExternalState(oFilterBar, oState);
			});
		}
	};

	return ValueHelpDelegate;
});
