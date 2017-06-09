sap.ui.controller("sap.ui.rta.test.performance.ext.controller.ListReportExtension", {
	onInitSmartFilterBarExtension : function() {
		"use strict";
		// the custom field in the filter bar might have to be
		// bound to a custom data model
		// if a value change in the field shall trigger a follow
		// up action, this method is the place to define and
		// bind an event handler to the field
	},

	onBeforeRebindTableExtension : function(oEvent) {
		"use strict";
		// usually the value of the custom field should have an
		// effect on the selected data in the table. So this is
		// the place to add a binding parameter depending on the
		// value in the custom field.
		var oBindingParams = oEvent.getParameter("bindingParams");
		oBindingParams.parameters = oBindingParams.parameters || {};

		var oSmartTable = oEvent.getSource();
		var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
		if (oSmartFilterBar instanceof sap.ui.comp.smartfilterbar.SmartFilterBar) {
			var oCustomControl = oSmartFilterBar.getControlByKey("CustomPriceFilter");
			if (oCustomControl instanceof sap.m.ComboBox) {
				var vCategory = oCustomControl.getSelectedKey();
				switch (vCategory) {
					case "0" :
						oBindingParams.filters.push(new sap.ui.model.Filter('Price', 'LE', "100"));
						break;
					case "1" :
						oBindingParams.filters.push(new sap.ui.model.Filter('Price', 'BT', "100", "500"));
						break;
					case "2" :
						oBindingParams.filters.push(new sap.ui.model.Filter('Price', 'BT', "500", "1000"));
						break;
					case "3" :
						oBindingParams.filters.push(new sap.ui.model.Filter('Price', 'GT', "1000"));
						break;
					default :
						break;
				}
			}
		}
	},

	getCustomAppStateDataExtension : function(oCustomData) {
		"use strict";
		// the content of the custom field shall be stored in
		// the app state, so that it can be restored later again
		// e.g. after a back navigation. The developer has to
		// ensure, that the content of the field is stored in
		// the object that is returned by this method.
		// Example:
		oCustomData.CustomPriceFilter = this.byId("CustomPriceFilter-combobox").getSelectedKey();
	},

	restoreCustomAppStateDataExtension : function(oCustomData) {
		"use strict";
		// in order to to restore the content of the custom
		// field in the filter bar e.g. after a back navigation,
		// an object with the content is handed over to this
		// method and the developer has to ensure, that the
		// content of the custom field is set accordingly
		// also, empty properties have to be set
		// Example:
		if ( oCustomData.CustomPriceFilter !== undefined ){
			if ( this.byId("CustomPriceFilter-combobox") ) {
				this.byId("CustomPriceFilter-combobox").setSelectedKey(oCustomData.CustomPriceFilter);
			}
		}
	},


	// extensions for custom action breakout scenario
	/**
	 * SCENARIO 1: custom action without function import
	 *
	 * IMPORTANT:
	 * Note that this example implementation is only a preliminary PoC until there is an official Smart Templates API.
	 * Therefore, the functions currently used in the example implementation are not to be used in productive coding.
	 */
	onChangePrice : function(oEvent) {
		"use strict";
		var oTable = oEvent.getSource().getParent().getParent().getTable();
		var aContext = this._getSelectedContexts(oTable);
		if (aContext.length > 1) {
			sap.m.MessageBox.error("Multi selection is currently not supported", {});
		} else {
			var oContext = aContext[0];
			if (this.getDraftContext().hasDraft(oContext)) {
				// selected object is draft enabled
				var oDraftAdminData = oContext.getProperty("DraftAdministrativeData");
				if (oDraftAdminData) {
					if (oDraftAdminData.DraftIsCreatedByMe) {
						this._showChangePricePopup(oContext);
					} else {
						sap.m.MessageBox.error("You can change the price directly only on your draft", {});
					}
				} else {
					sap.m.MessageBox.error("You can change the price directly only on your draft", {});
				}
			}
		}
	},

	_showChangePricePopup : function(oContext) {
		"use strict";
		var that = this;
		var oModel = this.getView().getModel();

		var oField = new sap.ui.comp.smartfield.SmartField({
			value : "{Price}"
		});

		var oParameterDialog = new sap.m.Dialog({
			title : "Change Price",
			content : [new sap.m.Text({
				text : 'New Price '
			}), oField],
			beginButton : new sap.m.Button({
				text : "OK",
				press : function() {
					that.getTransactionController().triggerSubmitChanges();
					oParameterDialog.close();
				}
			}),
			endButton : new sap.m.Button({
				text : "Cancel",
				press : function() {
					that.getTransactionController().resetChanges();
					oParameterDialog.close();
				}
			}),
			afterClose : function() {
				oParameterDialog.destroy();
			}
		});

		oParameterDialog.setModel(oModel);
		oParameterDialog.setBindingContext(oContext);
		oParameterDialog.open();
	},

	/**
	 * SCENARIO 2: custom action on function import
	 *
	 * IMPORTANT:
	 * Note that this example implementation is only a preliminary PoC until there is an official Smart Templates API.
	 * Therefore, the functions currently used in the example implementation are not to be used in productive coding.
	 */
	onCopyWithNewSupplier : function(oEvent) {
		"use strict";
		var that = this;
		var oModel = this.getView().getModel();

		var oTable = oEvent.getSource().getParent().getParent().getTable();
		var aContext = this._getSelectedContexts(oTable);
		if (aContext.length > 1) {
			sap.m.MessageBox.error("Multi selection is currently not supported", {});
		} else {
			var oContext = aContext[0];
			var oSelectedObject = oContext.getObject();

			var oForm = new sap.ui.layout.form.SimpleForm({
				editable : true
			});

			var sParameterLabel = "Supplier";
			var sBinding = '{Supplier}';

			var oField = new sap.ui.comp.smartfield.SmartField({
				value : sBinding
			});
			var sLabel = new sap.ui.comp.smartfield.SmartLabel();

			sLabel.setText(sParameterLabel);
			sLabel.setLabelFor(oField);

			oForm.addContent(sLabel);
			oForm.addContent(oField);

			var oParameterDialog = new sap.m.Dialog({
				title : "Copy with new Supplier",
				content : [oForm],
				beginButton : new sap.m.Button({
					text : "OK",
					press : function() {
						try {
							var mParameters = {
								urlParameters : {
									"ProductDraftUUID" : oSelectedObject.ProductDraftUUID,
									"ActiveProduct" : oSelectedObject.ActiveProduct,
									"Supplier" : oField.getValue()
								}
							};
							that.getTransactionController().invokeAction("STTA_PROD_MAN.STTA_PROD_MAN_Entities/STTA_C_MP_ProductCopywithparams", oContext, mParameters).then(function(oResponse) {
								that.refreshView();
								that.handleSuccess(oResponse);
							}, function(oError) {
								that.handleError(oError, {
									context : oContext
								});
							});
						} catch (ex) {
							that.handleError(ex, {
								context : oContext
							});
						}
						that.getTransactionController().resetChanges();
						oParameterDialog.close();
					}
				}),
				endButton : new sap.m.Button({
					text : "Cancel",
					press : function() {
						that.getTransactionController().resetChanges();
						oParameterDialog.close();
					}
				}),
				afterClose : function() {
					oParameterDialog.destroy();
				}
			});

			oParameterDialog.setModel(oModel);
			oParameterDialog.setBindingContext(oContext);
			oParameterDialog.open();
		}
	}
});
