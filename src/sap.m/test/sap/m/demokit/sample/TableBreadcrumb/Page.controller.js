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

			if (!this.oTemplate) {
				this.oTemplate = sap.ui.xmlfragment("sap.m.sample.TableBreadcrumb.Row");
			}
			this._oTable = this.byId("idProductsTable");

			sPath = this._getInitialPath();
			this._setAggregation(sPath);

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


		// Build the crumb links for display in the toolbar
		_maintainCrumbLinks: function (sPath) {
			// Determine trail parts
			var aPaths = [];
			var aParts = sPath.split("/");
			while (aParts.length > 1) {
				aPaths.unshift(aParts.join("/"));
				aParts = aParts.slice(0, aParts.length - 2);
			}

			// Re-build crumb toolbar based on trail parts
			var oCrumbToolbar = this.byId("idCrumbToolbar");
			oCrumbToolbar.destroyContent();

			aPaths.forEach(function (sPath, iPathIndex) {

				var bIsFirst = iPathIndex === 0;
				var bIsLast = iPathIndex === aPaths.length - 1;

				// Special case for 1st crumb: fixed text
				var sText = bIsFirst ? this.aCrumbs[0] : "{Name}";

				// Context is one level up in path
				var sContext = this._stripItemBinding(sPath);

				var oCrumb = bIsLast
					? new Text({
						text: sText
					}).addStyleClass("crumbLast")
					: new Link({
						text: sText,
						target: sPath,
						press: [this.handleLinkPress, this]
					});
				oCrumb.bindElement(sContext);

				oCrumbToolbar.addContent(oCrumb);
				if (!bIsLast) {
					var oArrow = new Label({
						textAlign: "Center",
						text: ">"
					}).addStyleClass("crumbArrow");
					oCrumbToolbar.addContent(oArrow);
				}

			}, this);
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
			this._oTable.bindAggregation("items", sPath, this.oTemplate);

			this._maintainCrumbLinks(sPath);
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


		// Navigation means a new aggregation to work our
		// way through the ProductHierarchy
		handleLinkPress: function (oEvent) {
			this._setAggregation(oEvent.getSource().getTarget());
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


		// Take care of the navigation through the hierarchy when the
		// user selects a table row
		handleSelectionChange: function (oEvent) {
			// Determine where we are right now
			var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var aPath = sPath.split("/");
			var sCurrentCrumb = aPath[aPath.length - 2];

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
		}

	});

	return PageController;

});