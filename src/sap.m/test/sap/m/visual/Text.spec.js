describe("sap.m.Text", function() {

	// initial loading
	// there is one invisible text with ID "text8". If it gets visible this will be seen in this screenshot
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// standard
	it("should vizualize the whole text", function () {
		var txt1 = element(by.id('text1'));
		expect(takeScreenshot(txt1)).toLookAs("1_standard");
	});

	// no wrapping
	it("should vizualize text with no wrapping", function () {
		var txt2 = element(by.id('text2'));
		expect(takeScreenshot(txt2)).toLookAs("2_no_wrapping");
	});

	// fixed width in em
	it("should vizualize text with fixed width in em", function () {
		var txt3 = element(by.id('text3'));
		expect(takeScreenshot(txt3)).toLookAs("3_fixed_width_in_em");
	});

	// fixed width in %
	it("should vizualize text with fixed width in %", function () {
		var txt3a = element(by.id('text3a'));
		//next line is to move the view in the window
		txt3a.click();
		expect(takeScreenshot(txt3a)).toLookAs("3a_fixed_width_in_percentage");
	});

	// fixed width in px
	it("should vizualize text with fixed width in px", function () {
		var txt3b = element(by.id('text3b'));
		//next line is to move the view in the window
		txt3b.click();
		expect(takeScreenshot(txt3b)).toLookAs("3b_fixed_width_in_px");
	});

	// styled
	it("should vizualize styled text", function () {
		var txt4 = element(by.id('text4'));
		//next line is to move the view in the window
		txt4.click();
		expect(takeScreenshot(txt4)).toLookAs("4_styled");
	});

	// align right
	it("should vizualize right aligned text", function () {
		var txt5 = element(by.id('text5'));
		//next line is to move the view in the window
		txt5.click();
		expect(takeScreenshot(txt5)).toLookAs("5_align_right");
	});

	// align left
	it("should vizualize left aligned text", function () {
		var txt5a = element(by.id('text5a'));
		//next line is to move the view in the window
		txt5a.click();
		expect(takeScreenshot(txt5a)).toLookAs("5a_align_left");
	});

	// align end
	it("should vizualize end aligned text", function () {
		var txt5b = element(by.id('text5b'));
		//next line is to move the view in the window
		txt5b.click();
		expect(takeScreenshot(txt5b)).toLookAs("5b_align_end");
	});

	// align begin
	it("should vizualize begin aligned text", function () {
		var txt5c = element(by.id('text5c'));
		//next line is to move the view in the window
		txt5c.click();
		expect(takeScreenshot(txt5c)).toLookAs("5c_align_begin");
	});

	// align center
	it("should vizualize center aligned text", function () {
		var txt5d = element(by.id('text5d'));
		//next line is to move the view in the window
		txt5d.click();
		expect(takeScreenshot(txt5d)).toLookAs("5d_align_center");
	});

	// align initial
	it("should vizualize initial aligned text", function () {
		var txt5e = element(by.id('text5e'));
		//next line is to move the view in the window
		txt5e.click();
		expect(takeScreenshot(txt5e)).toLookAs("5e_align_initial");
	});

	// RTL (Right-to-left)
	it("should vizualize text with RTL direction", function () {
		var txt6 = element(by.id('text6'));
		//next line is to move the view in the window
		txt6.click();
		expect(takeScreenshot(txt6)).toLookAs("6_RTL");
	});

	// LTR (Left-to-right)
	it("should vizualize text with LTR direction", function () {
		var txt6a = element(by.id('text6a'));
		//next line is to move the view in the window
		txt6a.click();
		expect(takeScreenshot(txt6a)).toLookAs("6a_LTR");
	});

	// Direction Inherit
	it("should vizualize text with direction inherit", function () {
		var txt6b = element(by.id('text6b'));
		//next line is to move the view in the window
		txt6b.click();
		expect(takeScreenshot(txt6b)).toLookAs("6b_Direction_Inherit");
	});

	// line breaks
	it("should vizualize text with line breaks", function () {
		var txt7 = element(by.id('text7'));
		//next line is to move the view in the window
		txt7.click();
		expect(takeScreenshot(txt7)).toLookAs("7_line_breaks");
	});

	// max lines 3
	it("should vizualize text in 3 lines", function () {
		var txt9 = element(by.id('text9'));
		//next line is to move the view in the window
		txt9.click();
		expect(takeScreenshot(txt9)).toLookAs("9_max_lines");
	});

	// RTL + max lines 2
	it("should vizualize text in RTL and in 2 lines", function () {
		var txt10 = element(by.id('text10'));
		//next line is to move the view in the window
		txt10.click();
		expect(takeScreenshot(txt10)).toLookAs("10_RTL_max_lines");
	});
});