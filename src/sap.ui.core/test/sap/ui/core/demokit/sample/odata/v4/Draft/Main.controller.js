/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (library, MessageBox, Controller, Filter, FilterOperator, Sorter, JSONModel) {
	"use strict";

	var LayoutType = library.LayoutType;

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.Main", {
		getNextSortOrder : function (bDescending) {
			var sNewIcon;

			// choose next sort order: no sort => ascending <-> descending
			if (bDescending) {
				sNewIcon = "sap-icon://sort-ascending";
				bDescending = false;
			} else {
				sNewIcon = "sap-icon://sort-descending";
				bDescending = true;
			}
			return {bDescending : bDescending, sNewIcon : sNewIcon};
		},

		hasPendingChanges : function (vBindingOrContext, sVerb, bIgnoreKeptAlive) {
			if (vBindingOrContext.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.error(
					"There are unsaved changes which will be lost; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		onCancel : function () {
			var oObjectPage = this.byId("objectPage"),
				oDraftContext = oObjectPage.getBindingContext(),
				oProductsTable = this.getView().byId("Products"),
				that = this;

			function gotoActiveContext(oActiveContext) {
				oProductsTable.setSelectedItem(
					oProductsTable.getItems()[oActiveContext.getIndex()], true);
				oObjectPage.setBindingContext(oActiveContext);
				that.oActiveContext = null; // not needed anymore
				oDraftContext.delete("$auto", true);
			}

			if (this.oActiveContext) {
				oDraftContext.replaceWith(this.oActiveContext);
				gotoActiveContext(this.oActiveContext);
			} else {
				oDraftContext.getModel().bindContext("SiblingEntity(...)", oDraftContext,
						{$$inheritExpandSelect : true})
					.execute("$auto", false, null, true).then(gotoActiveContext);
			}
		},

		onEdit : function () {
			this.toggleDraft("draftEdit");
		},

		onExit : function () {
			this.oUIModel.destroy(); // avoid changes on UI elements if this view destroys
			Controller.prototype.onExit.apply(this);
		},

		onFilterProducts : function (oEvent) {
			var oBinding = this.byId("Products").getBinding("items"),
				sQuery = oEvent.getParameter("query");

			if (this.hasPendingChanges(oBinding, "filtering", true)) {
				return;
			}

			oBinding.filter(sQuery ? new Filter("amount", FilterOperator.GT, sQuery) : null);
		},

		onInit : function () {
			this.oUIModel = new JSONModel({
					sLayout : LayoutType.OneColumn,
					bSortProductIDDescending : undefined,
					sSortProductIDIcon : ""
				}
			);
			this.getView().setModel(this.oUIModel, "ui");
			this.getView().setModel(this.getView().getModel(), "headerContext");
			this.byId("productsTitle").setBindingContext(
				this.byId("Products").getBinding("items").getHeaderContext(),
				"headerContext");

			this.oActiveContext = null; // the previous active context, while a draft is shown
		},

		onRefreshProduct : function () {
			var oContext = this.byId("objectPage").getBindingContext();

			if (this.hasPendingChanges(oContext, "refreshing")) {
				return;
			}
			oContext.refresh(undefined, true);
		},

		onRefreshProducts : function () {
			var oBinding = this.byId("Products").getBinding("items");

			if (this.hasPendingChanges(oBinding, "refreshing")) {
				return;
			}
			oBinding.refresh();
		},

		onProductSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext(),
				oObjectPage = this.byId("objectPage");

			oContext.setKeepAlive(true);
			if (oObjectPage.getBindingContext()) {
				oObjectPage.getBindingContext().setKeepAlive(false);
			}
			oObjectPage.setBindingContext(oContext);

			this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
		},

		onSave : function () {
			this.toggleDraft("draftActivate").then(function (oDraftContext) {
				oDraftContext.delete(null);
			});
		},

		onSortByProductID : function () {
			var oBinding = this.byId("Products").getBinding("items"),
				bDescending = this.oUIModel.getProperty("/bSortProductIDDescending"),
				oSortOrder;

			if (this.hasPendingChanges(oBinding, "sorting", true)) {
				return;
			}

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("ID", oSortOrder.bDescending)
			);

			this.oUIModel.setProperty("/bSortProductIDDescending", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortProductIDIcon", oSortOrder.sNewIcon);
		},

		toggleDraft : function (sAction) {
			var oObjectPage = this.byId("objectPage"),
				oContext = oObjectPage.getBindingContext(),
				oProductsTable = this.getView().byId("Products"),
				that = this;

			return oContext.getModel().bindContext("SampleService." + sAction + "(...)",
				oContext, {$$inheritExpandSelect : true})
				.execute("$auto", false, null, true)
				.then(function (oSiblingContext) {
					that.oActiveContext = oSiblingContext.getProperty("IsActiveEntity")
						? null
						: oContext;
					oObjectPage.setBindingContext(oSiblingContext);
					oProductsTable.setSelectedItem(
						oProductsTable.getItems()[oSiblingContext.getIndex()], true);

					return oContext;
				});
		}
	});
});
