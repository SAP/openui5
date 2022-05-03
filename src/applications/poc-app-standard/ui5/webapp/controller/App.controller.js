sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function(Device, Controller, Filter, FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.todo.controller.App", {

		onInit: function() {
			this.aSearchFilters = [];
			this.aTabFilters = [];

			this.getView().setModel(new JSONModel({
				isMobile: Device.browser.mobile,
				filterText: undefined
			}), "view");
		},

		/**
		 * Adds a new todo item to the bottom of the list.
		 */
		addTodo: function() {
			var oModel = this.getView().getModel();
			var aTodos = oModel.getProperty("/todos").map(function (oTodo) { return Object.assign({}, oTodo); });

			aTodos.push({
				title: oModel.getProperty("/newTodo"),
				completed: false
			});

			oModel.setProperty("/todos", aTodos);
			oModel.setProperty("/newTodo", "");
		},

		deleteTodo:function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var oModel = this.getView().getModel();
			var aTodos = oModel.getProperty("/todos").map(function (oTodo) { return Object.assign({}, oTodo); });
			var iIndex = oContext.getPath().split("/")[2];
			aTodos.splice(iIndex, 1);
			oModel.setProperty("/todos", aTodos);
		},

		editTodo: function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var oDialog = this.getView().byId("editDialog");
			oDialog.setBindingContext(oContext);
			oDialog.show(false);
		},

		closeEdit: function() {
			var oDialog = this.getView().byId("editDialog");
			oDialog.close();
		},

		/**
		 * Removes all completed items from the todo list.
		 */
		clearCompleted: function() {
			var oModel = this.getView().getModel();
			var aTodos = oModel.getProperty("/todos").map(function (oTodo) { return Object.assign({}, oTodo); });

			var i = aTodos.length;
			while (i--) {
				var oTodo = aTodos[i];
				if (oTodo.completed) {
					aTodos.splice(i, 1);
				}
			}

			oModel.setProperty("/todos", aTodos);
		},

		/**
		 * Updates the number of items not yet completed
		 */
		updateItemsLeftCount: function() {
			var oModel = this.getView().getModel();
			var aTodos = oModel.getProperty("/todos") || [];

			var iItemsLeft = aTodos.filter(function(oTodo) {
				return oTodo.completed !== true;
			}).length;

			oModel.setProperty("/itemsLeftCount", iItemsLeft);
		},

		/**
		 * Trigger search for specific items. The removal of items is disable as long as the search is used.
		 * @param {sap.ui.base.Event} oEvent Input changed event
		 */
		onSearch: function(oEvent) {
			var oModel = this.getView().getModel();

			// First reset current filters
			this.aSearchFilters = [];

			// add filter for search
			this.sSearchQuery = oEvent.getSource().getValue();
			if (this.sSearchQuery && this.sSearchQuery.length > 0) {
				oModel.setProperty("/itemsRemovable", false);
				var filter = new Filter("title", FilterOperator.Contains, this.sSearchQuery);
				this.aSearchFilters.push(filter);
			} else {
				oModel.setProperty("/itemsRemovable", true);
			}

			this._applyListFilters();
		},

		onFilter: function(oEvent) {
			// First reset current filters
			this.aTabFilters = [];

			// add filter for search
			this.sFilterKey = oEvent.getParameter("item").getKey();

			// eslint-disable-line default-case
			switch (this.sFilterKey) {
				case "active":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, false));
					break;
				case "completed":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, true));
					break;
				case "all":
				default:
					// Don't use any filter
			}

			this._applyListFilters();
		},

		_applyListFilters: function() {
			var oList = this.byId("todoList");
			var oBinding = oList.getBinding("items");

			oBinding.filter(this.aSearchFilters.concat(this.aTabFilters), "todos");

			var sI18nKey;
			if (this.sFilterKey && this.sFilterKey !== "all") {
				if (this.sFilterKey === "active") {
					sI18nKey = "ACTIVE_ITEMS";
				} else {
					// completed items: sFilterKey = "completed"
					sI18nKey = "COMPLETED_ITEMS";
				}
				if (this.sSearchQuery) {
					sI18nKey += "_CONTAINING";
				}
			} else if (this.sSearchQuery) {
				sI18nKey = "ITEMS_CONTAINING";
			}

			var sFilterText;
			if (sI18nKey) {
				var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
				sFilterText = oResourceBundle.getText(sI18nKey, [this.sSearchQuery]);
			}

			this.getView().getModel("view").setProperty("/filterText", sFilterText);
		},

	});

});
