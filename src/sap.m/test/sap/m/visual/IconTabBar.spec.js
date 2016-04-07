describe("sap.m.IconTabBar", function() {

	// initial loading
	it("should load test page", function(){
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// semantic colours
	var itb1 = element(by.id('itb1'));
	it("should be in semantic colours scheme", function() {
		expect(takeScreenshot(itb1)).toLookAs("1_semantic_colors");
	});
	// focus
	it("should focus the second filter icon when I simulate click on it", function() {
		element(by.id("itf1")).click();
		expect(takeScreenshot(itb1)).toLookAs("1_filter_focus");
	});
	// check property expandable: false
	it("should not collapse when filter icon is clicked again", function() {
		element(by.id("itf1")).click();
		expect(takeScreenshot(itb1)).toLookAs("1_expandable_false");
	});

	var itb2 = element(by.id('itb2'));
	// check property selectedKey
	it("key with key:'key13' must be selected", function() {
		expect(takeScreenshot(itb2)).toLookAs("2_selectableKey");
	});
	// check property expandable: true
	it("should collapse when filter is clicked", function() {
		element(by.id("itf2")).click();
		expect(takeScreenshot(itb2)).toLookAs("2_expandable_true");
	});

	var itb3 = element(by.id('itb3'));
	// tabs with labels and invisible tabs
	it("should contain tabs with labels", function() {
		//next line is to move the view in the window
		element(by.id("itb3")).click();
		expect(takeScreenshot(itb3)).toLookAs("3_tabs_with_labels_and_invisible_tabs");
	});

	var itb4 = element(by.id('itb4'));
	// tabs with no icons, only labels in upperCase
	it("should contain tabs without icons in upperCase", function() {
		//next line is to move the view in the window
		element(by.id("itb4")).click();
		expect(takeScreenshot(itb4)).toLookAs("4_tabs_without_icons_upperCase");
	});

	var itb4a = element(by.id('itb4a'));
	// check property applyContentPadding: false
	it("should not have padding of the content", function() {
		//next line is to move the view in the window
		element(by.id("itb4a")).click();
		expect(takeScreenshot(itb4a)).toLookAs("5_applyContentPadding_false");
	});

	var itb5 = element(by.id('itb5'));
	// tabs with no icons, only labels in upperCase, semantic colours, transparent background design
	it("should contain tabs without icons in upperCase in semantic colours and transparent background design", function() {
		//next line is to move the view in the window
		element(by.id("itb5")).click();
		expect(takeScreenshot(itb5)).toLookAs("6_noIcons_upperCase_semantic_transp_bckg");
	});

	var itb6 = element(by.id('itb6'));
	// initially collapsed IconTabBar with no ative item
	it("should be initially collapsed and with no active item", function() {
		//next line is to move the view in the window
		element(by.id("itb6")).click();
		expect(takeScreenshot(itb6)).toLookAs("7_initially_collapsed_no_active_item");
	});

	var itb9 = element(by.id('itb9'));
	// process-like IconTabBar with horizontal layout
	it("should be with horizontal layout", function() {
		//next line is to move the view in the window
		element(by.id("itb9")).click();
		expect(takeScreenshot(itb9)).toLookAs("8_horizontal_layout");
	});

	var itb10 = element(by.id('itb10'));
	//  no parameters and no items
	it("should not have any parameters or items", function() {
		//next line is to move the view in the window
		element(by.id("itb10")).click();
		expect(takeScreenshot(itb10)).toLookAs("9_no_parameters_no_items");
	});

	var itb11 = element(by.id('itb11'));
	//  images as items
	it("should have images as items", function() {
		//next line is to move the view in the window
		element(by.id("itb11")).click();
		expect(takeScreenshot(itb11)).toLookAs("10_images_as_items");
	});

	var itb12 = element(by.id('itb12'));
	//  Property stretchContentHeight: true, class sapUiResponsiveContentPadding, arrows
	it("should have images as items", function() {
		//next line is to move the view in the window
		element(by.id("itb12")).click();
		expect(takeScreenshot(itb12)).toLookAs("11_stretchContentHeight_ResponsivePaddin");
	});
});
