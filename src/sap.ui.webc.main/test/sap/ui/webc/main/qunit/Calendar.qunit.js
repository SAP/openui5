/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/webc/main/Calendar",
	"sap/ui/webc/main/CalendarDate"
], function(createAndAppendDiv, nextUIUpdate, Calendar, CalendarDate) {
	"use strict";

	createAndAppendDiv("uiArea");

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oCalendar = new Calendar({
				dates: [
					new CalendarDate({
						value: "Control value"
					}),
					new CalendarDate({
						value: "Control value"
					}),
					new CalendarDate({
						value: "Control value"
					})
				],
				selectedDatesChange: function(oEvent) {
					// console.log("Event selectedDatesChange fired for Calendar with parameters: ", oEvent.getParameters());
				}
			});
			this.oCalendar.placeAt("uiArea");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oCalendar.destroy();
			this.oCalendar = null;
		}
	});

	QUnit.test("Should render", function(assert) {
		assert.ok(this.oCalendar.$(), "Rendered");
	});
});