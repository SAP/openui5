/*global QUnit */

sap.ui.define([
	"sap/m/SelectDialog",
	"sap/ui/model/Filter",
	"sap/m/StandardListItem",
	"sap/ui/core/Core",
	"sap/ui/model/odata/v4/ODataModel",
	"test-resources/sap/m/qunit/localService/mockserver"
],
	function(
		SelectDialog,
		Filter,
		StandardListItem,
		Core,
		ODataModel,
		mockserver
	) {
		"use strict";

		QUnit.module("Search and Growing OData V4", {
			beforeEach: function () {
				// arrange
				this.oSelectDialog = new SelectDialog({
					multiSelect: true,
					growingThreshold: 8,
					items: {
						path: "/People",
						template: new StandardListItem({
							title: "{FirstName} {LastName}"
						})
					},
					search: function (oEvent) {
						var value = oEvent.getParameter("value");
						var binding = oEvent.getParameter("itemsBinding");

						if (value === "" || oEvent.getParameter("clearButtonPressed")) {
							binding.filter(null);
							return;
						}

						var filter = [
							new Filter({
								path: "LastName",
								operator: "Contains",
								value1: value
							})
						];

						binding.filter(filter, "Application");
					}
				});
			}, afterEach: function () {
				// cleanup
				this.oSelectDialog.destroy();
			}
		});

		QUnit.test("Filter the results", function (assert) {
			// Arrange
			var that = this,
				bFirstUpdateFinished = false,
				done = assert.async();

			mockserver.init().finally(function () {
				this.oSelectDialog.attachUpdateFinished(function () {
					if (!bFirstUpdateFinished) {
						that.oSelectDialog._executeSearch("an", false, "search");
						bFirstUpdateFinished = true;
					} else {
						that.oSelectDialog.getItems()[0].setSelected(true);
						that.oSelectDialog._getOkButton().firePress();
						Core.applyChanges();
					}
				});

				this.oSelectDialog.attachConfirm(function (oEvent) {
					var aSelectedItems = oEvent.getParameter("selectedItems");

					assert.strictEqual(aSelectedItems.length, 1, '1 item is selected');

					mockserver.stop();
					done();
				});

				// create an ODataModel from URL
				var oModel = new ODataModel({
					serviceUrl: "https://services.odata.org/TripPinRESTierService/(S(id))/",
					operationMode: "Server"
				});
				oModel.setSizeLimit(10);
				this.oSelectDialog.setModel(oModel);
				this.oSelectDialog.open();
			}.bind(this));
		});
	});
