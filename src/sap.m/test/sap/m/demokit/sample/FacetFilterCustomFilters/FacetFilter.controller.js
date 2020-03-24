sap.ui.define([
	'sap/m/ObjectIdentifier',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterType',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	"sap/ui/core/Component",
	"sap/ui/core/Element"
], function(ObjectIdentifier, Controller, Filter, FilterType, JSONModel, MessageToast, Component, Element) {
	"use strict";

	return Controller.extend("sap.m.sample.FacetFilterCustomFilters.FacetFilter", {

		onInit: function() {
			Component.create({
				name : 'sap.m.sample.Table'
			})
			.then(function(oComp) {
				// set explored app's demo model on this sample
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json"),
					oTable,
					oBindingInfo;

				this.getView().setModel(oModel);

				// Append demo table into VBox, making a minor modification
				// to the first column so that the Category information is shown
				oComp.setModel(this.getView().getModel());
				oTable = oComp.getTable();
				oBindingInfo = oTable.getBindingInfo("items");
				oBindingInfo.template.removeCell(0);
				oBindingInfo.templateShareable = true;
				oBindingInfo.template.insertCell(new ObjectIdentifier({
					title: "{Name}",
					text: "{Category}"
				}));
				oTable.bindItems(oBindingInfo);
				this.byId("idVBox").addItem(oTable);
			}.bind(this));
		},

		_applyFilter: function(oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var aVBoxItems = this.byId("idVBox").getItems(),
				oTable = aVBoxItems[aVBoxItems.length - 1];

			oTable.getBinding("items").filter(oFilter);
		},

		handleFacetFilterReset: function(oEvent) {
			var oFacetFilter = Element.registry.get(oEvent.getParameter("id")),
				aFacetFilterLists = oFacetFilter.getLists(),
				oFilter = new Filter("text", 'Contains', "");

			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
				// Default filtering behavior is prevented so we need to define a filter which will be used when FacetFilter "reset" button is pressed
				if (aFacetFilterLists[i].isBound("items")) {
					aFacetFilterLists[i].getBinding("items").filter(oFilter, FilterType.Application);
				}
			}

			this._applyFilter([]);
		},

		handleConfirm: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource();
			this._filterModel(oFacetFilter);
			MessageToast.show("confirm event fired");
		},

		handleSearch: function (oEvent) {
			var oFacetFilterList = oEvent.getSource(),
				sSearchString = oEvent.getParameter("term"),
				bClearButtonPressed = oEvent.getParameter("clearButtonPressed"),
				// Define filter to be used for resetting the current list state or another one for searching through the list items
				oFilter = bClearButtonPressed ? new Filter("text", 'Contains', "") : new Filter("text", 'Contains', sSearchString.toLowerCase()),
				oItemTemplate, oBindingInfo;

			// Preventing the internal filtering behavior FacetFilter control
			oEvent.preventDefault();

			if (oFacetFilterList.isBound("items")) {
				// Items are already bound and we apply the filtering
				oFacetFilterList.getBinding("items").filter(oFilter, FilterType.Application);
			} else {
				oItemTemplate = new sap.m.FacetFilterItem({
					text: "{text}",
					key: "{key}",
					count: "{data}"
				});
				oBindingInfo = {
					path: "values",
					template: oItemTemplate,
					templateShareable: false,
					filters: [oFilter]
				};

				// Bind items aggregation with specifically defined filter criterion
				oFacetFilterList.bindItems(oBindingInfo);
			}
		},

		_filterModel: function(oFacetFilter) {
			var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
				return oList.getSelectedItems().length;
			});

			if (mFacetFilterLists.length) {
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
				var oFilter = new Filter(mFacetFilterLists.map(function(oList) {
					return new Filter(oList.getSelectedItems().map(function(oItem) {
						return new Filter(oList.getTitle(), "EQ", oItem.getText());
					}), false);
				}), true);
				this._applyFilter(oFilter);
			} else {
				this._applyFilter([]);
			}
		}

	});

});