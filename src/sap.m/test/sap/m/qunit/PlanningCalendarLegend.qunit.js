/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/m/PlanningCalendarLegend",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/CalendarLegendItem"
], function(XMLView, JSONModel, PlanningCalendarLegend, nextUIUpdate, CalendarLegendItem) {
	"use strict";

	var sPclNoDB =
		"<mvc:View" +
		"    xmlns:core=\"sap.ui.core\"" +
		"    xmlns:mvc=\"sap.ui.core.mvc\"" +
		"    xmlns:unified=\"sap.ui.unified\"" +
		"    xmlns:l=\"sap.ui.layout\"" +
		"    xmlns=\"sap.m\">" +
		"    <PlanningCalendarLegend id=\"PlanningCalendarLegend\"" +
		"        itemsHeader=\"MyItemsHeader\"" +
		"        appointmentItemsHeader=\"MyAppointmentItemsHeader\"" +
		"        standardItems=\"Today,Selected,NonWorkingDay\">" +
		"        <items>" +
		"            <unified:CalendarLegendItem text=\"Calendar section Item 1\" type=\"Type01\" tooltip=\"Tooltip for Item 1\" />" +
		"            <unified:CalendarLegendItem text=\"Calendar section Item 2\" type=\"Type02\" tooltip=\"Tooltip for Item 2\" />" +
		"        </items>" +
		"        <appointmentItems>" +
		"            <unified:CalendarLegendItem text=\"Appointment section Item 1\" type=\"Type11\" tooltip=\"Tooltip for Item 1\" />" +
		"        </appointmentItems>" +
		"    </PlanningCalendarLegend>" +
		"</mvc:View>";

	var sPclDB =
		"<mvc:View" +
		"    xmlns:core=\"sap.ui.core\"" +
		"    xmlns:mvc=\"sap.ui.core.mvc\"" +
		"    xmlns:unified=\"sap.ui.unified\"" +
		"    xmlns:l=\"sap.ui.layout\"" +
		"    xmlns=\"sap.m\">" +
		"    <PlanningCalendarLegend id=\"PlanningCalendarLegend\"" +
		"        itemsHeader=\"{/itemsHeader}\"" +
		"        items=\"{path : '/legendItems', templateShareable: 'true'}\"" +
		"        appointmentItems=\"{path : '/legendAppointmentItems', templateShareable: 'true'}\"" +
		"        standardItems=\"{/legendStandardItems}\">" +
		"        <items>" +
		"            <unified:CalendarLegendItem text=\"{text}\" type=\"{type}\" tooltip=\"{text}\" />" +
		"        </items>" +
		"        <appointmentItems>" +
		"            <unified:CalendarLegendItem text=\"{text}\" type=\"{type}\" tooltip=\"{text}\" />" +
		"        </appointmentItems>" +
		"    </PlanningCalendarLegend>" +
		"</mvc:View>";

	var oModel = new JSONModel({
		itemsHeader: "MyItemsHeader",
		legendItems: [
			{
				text: "Public holiday",
				type: "Type07"
			},
			{
				text: "Team building",
				type: "Type08"
			},
			{
				text: "Customer event",
				type: "Type20"
			}
		],
		legendAppointmentItems: [
			{
				text: "Reminder",
				type: "Type06"
			},
			{
				text: "Client meeting",
				type: "Type02"
			},
			{
				text: "Team meeting",
				type: "Type01"
			}
		],
		legendStandardItems: ['WorkingDay', 'NonWorkingDay']
	});



	QUnit.module("API");

	QUnit.test("setColumnWidth - any value", function (assert) {
		//Act
		var oPCLegend = new PlanningCalendarLegend();

		oPCLegend.setColumnWidth("500px");

		//Assert
		assert.equal(oPCLegend.getColumnWidth(), '500px', "value should be the same as the one set before");

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("setColumnWidth - default value", function (assert) {
		//Act
		var oPCLegend = new PlanningCalendarLegend();
		//Assert
		assert.equal(oPCLegend.getColumnWidth(), 'auto', "Default value should be 'auto'");

		//Prepare
		oPCLegend.setColumnWidth("100px");
		assert.equal(oPCLegend.getColumnWidth(), '100px', "[test prerequisite:] column width should be 100px");

		//Act
		oPCLegend.setColumnWidth();

		//Assert
		assert.equal(oPCLegend.getColumnWidth(), 'auto', "When setter is called with 'undefined', the columnWidth should be 'auto'");

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("PlanningCalendarLegend as XML view without data binding", function (assert) {

		//Act
		return XMLView.create({
			definition: sPclNoDB
		}).then(function(myView) {

			var oPCLegend = myView.byId("PlanningCalendarLegend");

			//Assert
			assert.deepEqual(oPCLegend.getStandardItems(), ["Today", "Selected", "NonWorkingDay"], "Should return the same items");
			assert.equal(oPCLegend.getItems().length, 2, "Should has 2 Calendar items");
			assert.equal(oPCLegend.getAppointmentItems().length, 1, "Should has 1 Appointment items");

			//Cleanup
			myView.destroy();
		});

	});

	QUnit.test("PlanningCalendarLegend as XML view with data binding", function (assert) {

		//Act
		return XMLView.create({
			definition: sPclDB
		}).then(async function(myView) {
			myView.setModel(oModel);

			var oPCLegend = myView.byId("PlanningCalendarLegend");

			myView.placeAt("qunit-fixture");
			await nextUIUpdate();

			//Assert
			assert.deepEqual(oPCLegend.getStandardItems(), ["WorkingDay", "NonWorkingDay"], "Should return the same items");
			assert.equal(oPCLegend.getItems().length, 3, "Should has 3 Calendar items");
			assert.equal(oPCLegend.getAppointmentItems().length, 3, "Should has 3 Appointment items");

			//Cleanup
			myView.destroy();
		});
	});

	QUnit.module("Rendering");
	QUnit.test("Basic", function (assert) {
		//Act
		return XMLView.create({
			definition: sPclNoDB
		}).then( async function(myView) {

			var oPCLegend = myView.byId("PlanningCalendarLegend");

			//Act
			oPCLegend.placeAt("qunit-fixture");
			await nextUIUpdate();

			//Assert --section header
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").length, 2, "Two header sections should be rendered");
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").get(0).innerText, "MyItemsHeader", "The calendar section should be available");
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").get(1).innerText, "MyAppointmentItemsHeader", "The Appointments section should be available");

			//Assert -- Types
			assert.equal(oPCLegend.$().find(".sapUiUnifiedLegendItems")[0].childElementCount, 5, 'Calendar section should contain exact amount of elements');
			assert.equal(oPCLegend.$().find(".sapUiUnifiedLegendItems")[1].childElementCount, 1, 'Appointments section should contain exact amount of elements');

			//Cleanup
			oPCLegend.destroy();
		});
	});

	QUnit.test("when no appointmenetItems is set, the Appointments section should not appear", async function (assert) {
		//Prepare
		var oPCLegend = new PlanningCalendarLegend();

		//Act
		oPCLegend.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").length, 1, "One header sections should rendered");
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").text(), "Calendar", "Only the calendar section should be available");

		//Cleanup
		oPCLegend.destroy();
	});

	QUnit.test("Legend header elements roles", function (assert) {
		//Act
		return XMLView.create({
			definition: sPclNoDB
		}).then(async function(myView) {

			var oPCLegend = myView.byId("PlanningCalendarLegend");

			//Act
			oPCLegend.placeAt("qunit-fixture");
			await nextUIUpdate();

			//Assert --section header
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").length, 2, "Two header sections should be rendered");
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").get(0).getAttribute("role"), "listitem", "The headers have a listitem role");
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").get(0).getAttribute("aria-level"), "3", "The headers have aria-level - 3");
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").get(1).getAttribute("role"), "listitem", "The headers have a listitem role");
			assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").get(1).getAttribute("aria-level"), "3", "The headers have aria-level - 3");

			//Cleanup
			oPCLegend.destroy();
		});
	});

	QUnit.test("itemsHeader and appointmentItemsHeader", async function (assert) {
		// arrange
		var oPCLegend = new PlanningCalendarLegend({
			items: [new CalendarLegendItem({ text: "abc", type: "Type01" })],
			appointmentItems: [new CalendarLegendItem({ text: "def", type: "Type02" })]
		});
		oPCLegend.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader")[0].innerText, "Calendar", "there is a default items header");
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader")[1].innerText, "Appointments", "there is a default appointment items header");

		// act
		oPCLegend.setItemsHeader("");
		oPCLegend.setAppointmentItemsHeader("");
		await nextUIUpdate();

		// assert
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader").length, 0, "the items and appointment items headers can be empty");

		// act
		oPCLegend.setItemsHeader("A");
		oPCLegend.setAppointmentItemsHeader("B");
		await nextUIUpdate();

		// assert
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader")[0].innerText, "A", "the items header is correct");
		assert.equal(oPCLegend.$().find(".sapMPlanCalLegendHeader")[1].innerText, "B", "the appointment items header is correct");

		// clean
		oPCLegend.destroy();
	});
});