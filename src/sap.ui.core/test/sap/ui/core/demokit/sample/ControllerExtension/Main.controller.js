sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"./ReuseExtension",
	//This is only needed to simulate creation of flex changes
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/m/MessageBox"
	],
	function(
		Controller,
		JSONModel,
		Sorter,
		ReuseExtension,
		FlexControllerFactory,
		FlexUtils,
		MessageBox
	) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.ControllerExtension.Main", {
		onInit: function() {
			var oModel = new JSONModel({
				employees: [
					{Name:"Horst", Salary: 100000, JobTitle: "Associate Developer"},
					{Name:"Erwin", Salary: 10000, JobTitle: "Senior Developer"},
					{Name:"Karl", Salary: 98000, JobTitle: "Associate Architect"},
					{Name:"Paul", Salary: 3440000, JobTitle: "Developer"},
					{Name:"Hans", Salary: 23400, JobTitle: "Senior Developer"},
					{Name:"Gerd", Salary: 1000, JobTitle: "Development Architect"}
				]
			});
			var oView = this.getView();
			oView.setModel(oModel);
			var oToolbarTitle = this.getView().byId("toolbarTitle");

			//Having a call to our public method we can override
			oToolbarTitle.setText(this.getToolbarTitle());
		},

		/*
		 * Possibility to use controller extensions as API in the controller directly;
		 * this has the benefit of controlling if and how to override functionality,
		 * which is only possible for controller extensions
		 */
		reuse: ReuseExtension,

		//Internal state
		bSortDescending: false,
		bFilter: false,

		//Expose important controls
		getTable : function(){
			return this.getView().byId("employeeTable");
		},
		getTableToolbar : function(){
			return this.getView().byId("tableToolbar");
		},

		//A public function we can override
		getToolbarTitle : function(){
			return "Table Operations:";
		},

		//Private event handler (as it starts with 'on' prefix) that uses a hook defined in the reuse extension
		onPrivateFilter: function(oEvent) {
			var oTable = this.getTable();
			var oTableBinding = oTable.getBinding("items");
			var aFilters = [];

			//Toggle filtering
			if (!this.bFilter) {

				//We use the hook to allow only influencing the filter values
				this.reuse.onFilterHook(aFilters);

				this.bFilter = true;
			} else {
				this.bFilter = false;
			}
			oTableBinding.filter(aFilters);
		},


		//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// Only needed to simulate changes as done in Web IDE with UI Adaptation Editor, not part of regular controller logic
		//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		addChanges: function(){
			var sFragment = jQuery.sap.loadResource(
				"sap/ui/core/sample/ControllerExtension/CustomerExtension.fragment.xml",
				{
					dataType: "text"
				}
			);
			this._addFragmentToTableToolbar(sFragment, "sap.my");
			var sCode = jQuery.sap.loadResource(
				"sap/ui/core/sample/ControllerExtension/CustomerExtension.js",
				{
					dataType: "text"
				}
			);
			this._addControllerExtension(sCode, "sap.my");
			MessageBox.confirm("We will reload the page to apply the controller extension", {
				onClose: function(){
					window.location.reload();
				}
			});
		},
		addOtherChanges: function(){
			var sFragment = jQuery.sap.loadResource(
				"sap/ui/core/sample/ControllerExtension/OtherCustomerExtension.fragment.xml",
				{
					dataType: "text"
				}
			);
			this._addFragmentToTableToolbar(sFragment, "sap.other");
			var sCode = jQuery.sap.loadResource(
				"sap/ui/core/sample/ControllerExtension/OtherCustomerExtension.js",
				{
					dataType: "text"
				}
			);
			this._addControllerExtension(sCode, "sap.other");
			MessageBox.confirm("We will reload the page to apply the controller extension", {
				onClose: function(){
					window.location.reload();
				}
			});
		},
		_addFragmentToTableToolbar: function (sFragment, sProjectId) {
			var oFlexController = FlexControllerFactory.createForControl(this.getTableToolbar());
			var oAppComponent = FlexUtils.getAppComponentForControl(this.getTableToolbar());
			var oChange = oFlexController.createBaseChange({
				changeType: "addXML",
				content: {
					targetAggregation: "content",
					index: 1,
					fragment: FlexUtils.stringToAscii(sFragment)
				},
				selector: {
					id: this.getTableToolbar().getId(),
					idIsLocal: false
				},
				layer : "VENDOR",
				projectId : sProjectId
			}, oAppComponent);
			oFlexController.addPreparedChange(oChange, oAppComponent);
			oFlexController.saveAll();
		},
		_addControllerExtension: function (sCode, sProjectId) {
			var oFlexController = FlexControllerFactory.createForControl(this.getTableToolbar());
			var oAppComponent = FlexUtils.getAppComponentForControl(this.getTableToolbar());
			var oChange = oFlexController.createBaseChange({
				changeType: "codeExt",
				content: {
					codeRef: sProjectId + "my.code.ref.doesnt.matter.in.simulation.js",
					code: sap.ui.fl.Utils.stringToAscii(sCode)
				},
				selector: {
					controllerName : "sap.ui.core.sample.ControllerExtension.Main"
				},
				layer : "VENDOR",
				projectId : sProjectId
			}, oAppComponent);
			oFlexController.addPreparedChange(oChange, oAppComponent);
			oFlexController.saveAll();
		},
		resetChanges: function(){
			var oFlexController = FlexControllerFactory.createForControl(this.getTableToolbar());
			oFlexController.resetChanges();
			MessageBox.confirm("We will reload the page to have a clean view without the extensions", {
				onClose: function(){
					window.location.reload();
				}
			});
		}
	});
});
