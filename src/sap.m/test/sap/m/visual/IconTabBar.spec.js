describe("sap.m.IconTabBar", function() {

	// initial loading
	it("should load test page", function(){
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// TODO: must take picture only of first ITB - "itb1"
	// semantic colours
	it("should be in semantic colours scheme", function() {
		expect(takeScreenshot()).toLookAs("1_semantic_colors");
	});
	// focus
	it("should focus the second filter icon when I simulate click on it", function() {
		element(by.id("itf1")).click();
		expect(takeScreenshot()).toLookAs("1_filter_focus");
	});
	// check property expandable: false
	it("should not collapse when filter icon is clicked again", function() {
		element(by.id("itf1")).click();
		expect(takeScreenshot()).toLookAs("1_expandable_false");
	});

	// TODO: must take picture only of second ITB - "itb2"
	// check property selectedKey
	it("key with key:'key13' must be selected", function() {
		expect(takeScreenshot()).toLookAs("2_selectableKey");
	});
	// check property expandable: true
	it("should collapse when filter is clicked", function() {
		element(by.id("itf2")).click();
		expect(takeScreenshot()).toLookAs("2_expandable_true");
	});

	// TODO: must take picture only of third ITB - "itb3"
	// tabs with labels and invisible tabs
	it("should contain tabs with labels", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf3")).click();
		element(by.id("itf3")).click();
		expect(takeScreenshot()).toLookAs("3_tabs_with_labels_and_invisible_tabs");
	});

	// TODO: must take picture only of fourth ITB - "itb4"
	// tabs with no icons, only labels in upperCase
	it("should contain tabs without icons in upperCase", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf4")).click();
		element(by.id("itf4")).click();
		expect(takeScreenshot()).toLookAs("4_tabs_without_icons_upperCase");
	});

	// TODO: must take picture only of fifth ITB - "itb4a"
	// check property applyContentPadding: false
	it("should not have padding of the content", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf5")).click();
		element(by.id("itf5")).click();
		expect(takeScreenshot()).toLookAs("5_applyContentPadding_false");
	});

	// TODO: must take picture only of sixth ITB - "itb5"
	// tabs with no icons, only labels in upperCase, semantic colours, transparent background design
	it("should contain tabs without icons in upperCase in semantic colours and transparent background design", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf6")).click();
		element(by.id("itf6")).click();
		expect(takeScreenshot()).toLookAs("6_tabs_without_icons_upperCase_semantic_colours_transparent_background_design");
	});

	// TODO: must take picture only of seventh ITB - "itb6"
	// initially collapsed IconTabBar with no ative item
	it("should be initially collapsed and with no active item", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf7")).click();
		element(by.id("itf7")).click();
		expect(takeScreenshot()).toLookAs("7_initially_collapsed_no_active_item");
	});

	// TODO: must take picture only of eighth ITB - "itb9"
	// process-like IconTabBar with horizontal layout
	it("should be with horizontal layout", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf8")).click();
		element(by.id("itf8")).click();
		expect(takeScreenshot()).toLookAs("8_horizontal_layout");
	});

	// TODO: must take picture only of ninth ITB - "itb10"
	//  no parameters and no items
	it("should not have any parameters or items", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("itf8")).click();
		element(by.id("itf8")).click();
		expect(takeScreenshot()).toLookAs("9_no_parameters no_items");
	});

	// TODO: must take picture only of tenth ITB - "itb11"
	//  images as items
	it("should have images as items", function() {
		//TODO: remove next 2 lines after partial screenshot is avaialable
		element(by.id("btn")).click();
		element(by.id("btn")).click();
		expect(takeScreenshot()).toLookAs("10_images_as_items");
	});

	// TODO: must take picture only of eleventh ITB - "itb12"
	//  Property stretchContentHeight: true, class sapUiResponsiveContentPadding, arrows
	it("should have images as items", function() {
		expect(takeScreenshot()).toLookAs("11_property_stretchContentHeight_class_sapUiResponsiveContentPadding_arrows");
	});
});
