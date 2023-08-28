/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/MDCTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/base/util/UriParameters",
	"sap/ui/core/Core",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/base/util/deepEqual'
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	MDCTable,
	Conditions,
	FilterBar,
	FilterField,
	Field,
	mdcTable,
	mdcColumn,
	ResponsiveTableType,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	UriParameters,
	Core,
	Condition,
	ConditionValidated,
	StateUtil,
	deepEqual
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);
	ValueHelpDelegate.apiVersion = 2;//CLEANUPD_DELEGATE

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer, sContentId) {
		var oValueHelp = oContainer && oContainer.getParent();

		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		var bMultiSelect = oValueHelp.getMaxConditions() === -1;


		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable(oValueHelp.getId() + "--MTable", {keyPath: "ID", descriptionPath: "name", filterFields: "$search"});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table(oCurrentContent.getId() + "--popover-mTable", {
					width: "30rem",
					mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
						length: 10,
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
								new Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
							]
						})
					}
				}));
			}
		}

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new MDCTable({keyPath: "ID", descriptionPath: "name", filterFields: "$search", group:"group1", title: "Default Search Template"});

				oCurrentContent.setFilterBar(
					new FilterBar("mdcFilterbar-listcollection-1", {
						liveMode: false,
						delegate: {
							name: "delegates/GenericVhFilterBarDelegate",
							payload: {}
						},
						basicSearchField: new FilterField({
							delegate: {
								name: "delegates/odata/v4/FieldBaseDelegate",
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
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Name",
								conditions: "{$filters>/conditions/name}"
							})
						]
					})
				);

				oContainer.addContent(oCurrentContent);

				oCurrentContent = new MDCTable({keyPath: "ID", descriptionPath: "name", filterFields: "$search", group:"group1", title: "Search Template 1"});
				oCurrentContent.setFilterBar(
					new FilterBar("mdcFilterbar-listcollection-2", {
						liveMode: false,
						delegate: {
							name: "delegates/GenericVhFilterBarDelegate",
							payload: {}
						},
						basicSearchField: new FilterField({
							delegate: {
								name: "delegates/odata/v4/FieldBaseDelegate",
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
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								label: "Country",
								conditions: "{$filters>/conditions/countryOfOrigin_code}"
							})
						]
					})
				);
				oContainer.addContent(oCurrentContent);

				if (bMultiSelect) {
					var oAdditionalContent = new Conditions({
						title:"Define Conditions",
						shortTitle:"Conditions",
						label:"Label of Field"
					});
					oContainer.addContent(oAdditionalContent);
				}
			}
		}

		// Example for slow fulfilling promise
		/* return new Promise(function (resolve) {
			setTimeout(function () {
				console.log("FB0-FH1-11-ValueHelp.delegate.retrieveContent", sContentId);
				resolve();
			},1500);
		}); */
		return Promise.resolve();
	};

	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		var oConditions = ODataV4ValueHelpDelegate.getFilterConditions(arguments);

		var oFilterBar = oContent.getFilterBar();

		if (oFilterBar) {

			var bHasCountryFilter = [].find(function (oFilterItem) {
				return oFilterItem.getBinding("conditions").sPath.indexOf("countryOfOrigin_code") >= 0;
			});

			if (bHasCountryFilter) {
				var oCountry = Core.byId("FB0-FF6");
				var aCountryConditions = oCountry && oCountry.getConditions();
				if (aCountryConditions && aCountryConditions.length) {
					oConditions["countryOfOrigin_code"] = aCountryConditions;
					return oConditions;
				}
			}
		}

		return oConditions;
	};

	// Exemplatory implementation of outparameter update
	ValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason, oConfig) {
		// find all conditions carrying country information
		var aAllConditionCountries = oValueHelp.getConditions().reduce(function (aResult, oCondition) {
			if (oCondition.payload) {
				Object.values(oCondition.payload).forEach(function (oSegment) {
					if (oSegment["countryOfOrigin_code"] && aResult.indexOf(oSegment["countryOfOrigin_code"]) === -1) {
						aResult.push(oSegment["countryOfOrigin_code"]);
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
