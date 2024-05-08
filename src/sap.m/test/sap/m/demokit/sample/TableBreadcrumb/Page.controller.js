sap.ui.define([
		'sap/m/Label',
		'sap/m/Link',
		'sap/m/MessageToast',
		'sap/m/Text',
		'./Formatter',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Label, Link, MessageToast, Text, Formatter, Fragment, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TableBreadcrumb.Page", {

		// Setup crumb info, the collection root
		// and an initial product selection / order state
		sCollection: "/ProductHierarchy",
		aCrumbs: ["Suppliers", "Categories", "Products"],
		mInitialOrderState: {
			products: {},
			count: 0,
			hasCounts: false
		},

		// Pull in the table row template fragment, grab
		// a reference to the table, work out the initial crumb path
		// and create the order model, setting it on the view
		onInit: function (oEvent) {

			// set demo model on this sample
			var sPath = sap.ui.require.toUrl("sap/m/sample/TableBreadcrumb/productHierarchy.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.getView().setModel(new JSONModel(this.mInitialOrderState), "Order");

			if (!this._pTemplate) {
				this._pTemplate = Fragment.load({
					id: this.getView().getId(),
					name: "sap.m.sample.TableBreadcrumb.Row"
				});
			}
			this._oTable = this.byId("idProductsTable");

			sPath = this._getInitialPath();
			this._setAggregation(sPath);
			var oBreadCrumb = this.byId("breadcrumb");
			var oLink = new Link({
				text: "Suppliers",
				press:[sPath, this.onBreadcrumbPress, this]
			});
			oBreadCrumb.addLink(oLink);
		},

		// Initial path is the first crumb appended to the collection root
		_getInitialPath: function () {
			return [this.sCollection, this.aCrumbs[0]].join("/");
		},


		// Find the next crumb that follows the given crumb
		_nextCrumb: function (sCrumb) {
			for (var i = 0, ii = this.aCrumbs.length; i < ii; i++) {
				if (this.aCrumbs[i] === sCrumb) {
					return this.aCrumbs[i + 1];
				}
			}
		},


		// Remove the numeric item binding from a path
		_stripItemBinding: function (sPath) {
			var aParts = sPath.split("/");
			return aParts.slice(0, aParts.length - 1).join("/");
		},

		// Navigate through the product hierarchy by rebinding the
		// table's items aggregation. Navigation is either through
		// branches (Suppliers, Categories) or leaves (Products)
		_setAggregation: function (sPath) {
			// If we're at the leaf end, turn off navigation
			var sPathEnd = sPath.split("/").reverse()[0];
			if (sPathEnd === this.aCrumbs[this.aCrumbs.length - 1]) {
				this._oTable.setMode("MultiSelect");
				this.byId("weightColumn").setVisible(true);
				this.byId("dimensionsColumn").setVisible(true);
			} else {
				this._oTable.setMode("SingleSelectMaster");
				this.byId("dimensionsColumn").setVisible(false);
				this.byId("weightColumn").setVisible(false);
			}

			// Set the new aggregation
			this._pTemplate.then(function(oTemplate){
				this._oTable.bindAggregation("items", sPath, oTemplate);
			}.bind(this));
		},


		// Add to the order based on the selection
		_updateOrder: function (oSelectionInfo) {
			var oOrderModel = this.getView().getModel("Order");
			oOrderModel.setData({products: oSelectionInfo}, true);
			var aProductsSelected = Formatter.listProductsSelected(this.getView());
			oOrderModel.setData({
				count: aProductsSelected.length,
				hasCounts: aProductsSelected.length > 0
			}, true);
		},


		// Show a message toast only if there are products selected
		handleOrderPress: function (oEvent) {
			var aProductsSelected = Formatter.listProductsSelected(this.getView());
			if (aProductsSelected) {
				MessageToast.show("Ordering: " + aProductsSelected.map(function (mProduct) {
					return mProduct.Name;
				}));
			}
		},

		// Removes unwanted links added to breadcrumb and updates the breadcrumb
		onBreadcrumbPress: function (oEvent, sPath) {
			var oLink = oEvent.getSource();
			var oBreadCrumb = this.byId("breadcrumb");
			var iIndex = oBreadCrumb.indexOfLink(oLink);
			var aCrumb = oBreadCrumb.getLinks().slice(iIndex + 1);
			if (aCrumb.length) {
				aCrumb.forEach(function(oLink) {
					oLink.destroy();
				});
				this._setAggregation(sPath);
			}
		},

		// Handles breadcrumb creation and binding
		// Take care of the navigation through the hierarchy when the
		// user selects a table row
		handleSelectionChange: function (oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var aPath = sPath.split("/");
			var sPathEnd = sPath.split("/").reverse()[1];
			var sCurrentCrumb = aPath[aPath.length - 2];

			if (sPathEnd !== this.aCrumbs[this.aCrumbs.length - 1]) {
				var oBreadCrumb = this.byId("breadcrumb");
				var sPrevNode = aPath[aPath.length - 2];
				var iCurNodeIndex = this.aCrumbs.indexOf(sPrevNode) + 1;

				var oLink = new Link({
					text: "{Name}",
					press:[sPath + "/" + this.aCrumbs[iCurNodeIndex], this.onBreadcrumbPress, this]
				});

				oLink.bindElement({
					path : sPath
				});
				oBreadCrumb.addLink(oLink);
			}

			// If we're on a leaf, remember the selections;
			// otherwise navigate
			if (sCurrentCrumb === this.aCrumbs[this.aCrumbs.length - 1]) {
				var oSelectionInfo = {};
				var bSelected = oEvent.getParameter("selected");
				oEvent.getParameter("listItems").forEach(function (oItem) {
					oSelectionInfo[oItem.getBindingContext().getPath()] = bSelected;
				});
				this._updateOrder(oSelectionInfo);
			} else {
				var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");
				this._setAggregation(sNewPath);
			}
		},

		// Returns whether there are any products selected at all
		isAnyProductSelected : function () {
			return Formatter.listProductsSelected(this.getView()).length > 0;
		}

	});

	return PageController;

});