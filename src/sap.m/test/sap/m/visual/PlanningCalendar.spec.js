describe("sap.m.PlanningCalendar", function() {

	it("one month view shows calendar picker on sizes S and M and a calendar row on size L", function() {
		//click the view select
		element(by.id("PC1-IntType")).click();
		//click the 4th option - OneMonth
		element(by.id("PC1-4")).click();

		//click the width select
		element(by.id("select_width")).click();
		//select the 1st option - < 600px
		element(by.id("select_width_item_1")).click();

		//take a picture of the calendar one month interval - it should be a picker
		expect(takeScreenshot(element(by.id("PC1-OneMonthInt")))).toLookAs('size_S_one_month_view');

		//click the width select
		element(by.id("select_width")).click();
		//select the 2nd option - 600px < x < 1024px
		element(by.id("select_width_item_2")).click();

		//take a picture of the calendar one month interval - it should be a picker
		expect(takeScreenshot(element(by.id("PC1-OneMonthInt")))).toLookAs('size_M_one_month_view');

		//click the width select
		element(by.id("select_width")).click();
		//select the 3rd option - > 1024px
		element(by.id("select_width_item_3")).click();

		//take a picture of the calendar one month interval - it should be one row
		expect(takeScreenshot(element(by.id("PC1-OneMonthInt")))).toLookAs('size_L_one_month_view');
	});
});
