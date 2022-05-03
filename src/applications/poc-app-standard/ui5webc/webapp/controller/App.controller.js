sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.todo.controller.App", {
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

			// test to enforce fesr request
			sap.ui.requireSync("sap/ui/model/xml/XMLModel");
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
		}

	});

});
