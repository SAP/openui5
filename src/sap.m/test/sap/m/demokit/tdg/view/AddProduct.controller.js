sap.ui.core.mvc.Controller.extend("sap.ui.demo.tdg.view.AddProduct", {

	oAlertDialog : null,
	oBusyDialog : null,

	initializeNewProductData : function() {
		this.getView().getModel("newProduct").setData({
			Detail: {
				DiscontinuedFlag: false,
				Rating: 0
			}
		});
	},

	onInit : function() {
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "newProduct");
		this.initializeNewProductData();
	},

	showErrorAlert : function(sMessage) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert(sMessage);
	},

	dateFromString : function(sDate) {
		// try to create date directly
		var oDate = new Date(sDate);
		// if this is not working build manually
		if(!(oDate instanceof Date && isFinite(oDate))){
			var d = sDate.split('.').reverse();
			for(var i in d){ d[i] = parseInt(d[i]);}
			oDate = new Date(d[0], d[1], d[2]);
		}
		return oDate;
	},

	saveProduct : function(nID) {
		var mNewProduct = this.getView().getModel("newProduct").getData().Detail;
		// Basic payload data
		var mPayload = {
			ID: nID,
			Name: mNewProduct.Name,
			Description: mNewProduct.Description,
			ReleaseDate: this.dateFromString(mNewProduct.ReleaseDate),
			Price: mNewProduct.Price.toString(),
			Rating: mNewProduct.Rating
		};

		if (mNewProduct.DiscontinuedDate) {
			mPayload.DiscontinuedDate = this.dateFromString(mNewProduct.DiscontinuedDate);
		}

		// Add supplier & category associations
		["Supplier", "Category"].forEach(function(sRelation) {
			var oSelect = this.getView().byId("idSelect" + sRelation);
			var sPath = oSelect.getSelectedItem().getBindingContext().getPath();
			mPayload[sRelation] = {
				__metadata: {
					uri: sPath
				}
			};
		}, this);

		// Send OData Create request
		var oModel = this.getView().getModel();
		oModel.create("/Products", mPayload, {
			success : jQuery.proxy(function(mResponse) {
				this.initializeNewProductData();
				sap.ui.core.UIComponent.getRouterFor(this).navTo("product", {
					productId: mResponse.ID,
					tab: "supplier"
				}, false);
				jQuery.sap.require("sap.m.MessageToast");
				// ID of newly inserted product is available in mResponse.ID
				this.oBusyDialog.close();
				sap.m.MessageToast.show("Product '" + mPayload.Name + "' added");
			}, this),
			error : jQuery.proxy(function() {
				this.oBusyDialog.close();
				this.showErrorAlert("Problem creating new product");
			}, this)
		});

	},

	onSave : function() {
		// Show message if no product name has been entered
		// Otherwise, get highest existing ID, and invoke create for new product
		if (!this.getView().getModel("newProduct").getProperty("/Detail/Name")) {
			if (!this.oAlertDialog) {
				this.oAlertDialog = sap.ui.xmlfragment("sap.ui.demo.tdg.view.NameRequiredDialog", this);
				this.getView().addDependent(this.oAlertDialog);
			}
			this.oAlertDialog.open();
		} else {
			if (!this.oBusyDialog) {
				this.oBusyDialog = new sap.m.BusyDialog();
			}
			this.oBusyDialog.open();
			this.getView().getModel().read("/Products", {
				urlParameters : {
					"$top" : 1,
					"$orderby" : "ID desc",
					"$select" : "ID"
				},
				success : jQuery.proxy(function(oData) {
					this.saveProduct(oData.results[0].ID + 1);
				}, this),
				error : jQuery.proxy(function() {
					this.oBusyDialog.close();
					this.showErrorAlert("Cannot determine next ID for new product");
				}, this)
			});
		}
	},

	onCancel : function() {
		sap.ui.core.UIComponent.getRouterFor(this).backWithoutHash(this.getView());
	},

	onDialogClose : function(oEvent) {
		this.oAlertDialog.close();
	}

});