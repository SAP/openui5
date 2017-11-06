/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.IconTabBar", function() {
	"use strict";

	var bPhone = null;
	var _closeIconTabBarOverflow = function () {
		var sId = bPhone ? "__popover0-dialog-footer" : "page5-intHeader";

		element(by.id(sId)).click();
	};
	// initial loading
	it("should load test page", function(){
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// semantic colours
	it("should be in semantic colours scheme", function() {
		var itb1 = element(by.id('itb1'));
		expect(takeScreenshot(itb1)).toLookAs("1_semantic_colors");
	});
	// focus
	it("should focus the second filter icon when I simulate click on it", function() {
		var itb1 = element(by.id('itb1'));
		element(by.id("itf1")).click();
		expect(takeScreenshot(itb1)).toLookAs("1_filter_focus");
	});
	// check property expandable: false
	it("should not collapse when filter icon is clicked again", function() {
		var itb1 = element(by.id('itb1'));
		element(by.id("itf1")).click();
		expect(takeScreenshot(itb1)).toLookAs("1_expandable_false");
	});


	// check property selectedKey
	it("key with key:'key13' must be selected", function() {
		var page2 = element(by.id('sample2'));
		page2.click();
		var itb2 = element(by.id('itb2'));
		expect(takeScreenshot(itb2)).toLookAs("2_selectableKey");
	});
	// check property expandable: true
	it("should collapse when filter is clicked", function() {
		var itb2 = element(by.id('itb2'));
		element(by.id("itf2")).click();
		expect(takeScreenshot(itb2)).toLookAs("2_expandable_true");
	});


	// tabs with labels and invisible tabs
	it("should contain tabs with labels", function() {
		var itb3 = element(by.id('itb3'));
		//next line is to move the view in the window
		element(by.id("itb3")).click();
		expect(takeScreenshot(itb3)).toLookAs("3_tabs_with_labels_and_invisible_tabs");
	});


	// check property applyContentPadding: false
	it("should not have padding of the content", function() {
		var itb4a = element(by.id('itb4a'));
		browser.executeScript('document.getElementById("itb4a").scrollIntoView()').then(function() {
			expect(takeScreenshot(itb4a)).toLookAs("5_applyContentPadding_false");
		});
	});


	// tabs with no icons, only labels in upperCase, semantic colours, transparent background design
	it("should contain tabs without icons in upperCase in semantic colours and transparent background design", function() {
		var page3 = element(by.id('sample3'));
		page3.click();
		var itb5 = element(by.id('itb5'));
		//next line is to move the view in the window
		element(by.id("itb5")).click();
		expect(takeScreenshot(itb5)).toLookAs("6_noIcons_upperCase_semantic_transp_bckg");
	});

	// initially collapsed IconTabBar with no ative item
	it("should be initially collapsed and with no active item", function() {
		var itb6 = element(by.id('itb6'));
		//next line is to move the view in the window
		element(by.id("itb6")).click();
		expect(takeScreenshot(itb6)).toLookAs("7_initially_collapsed_no_active_item");
	});


	// process-like IconTabBar with horizontal layout
	it("should be with horizontal layout", function() {
		var itb9 = element(by.id('itb9'));
		//next line is to move the view in the window
		browser.executeScript('document.getElementById("itb9").scrollIntoView()').then(function() {
			itb9.click();
			expect(takeScreenshot(itb9)).toLookAs("8_horizontal_layout");
		});
	});


	//  no parameters and no items
	it("should not have any parameters or items", function() {
		var page4 = element(by.id('sample4'));
		page4.click();

		var itb10 = element(by.id('itb10'));
		//next line is to move the view in the window
		element(by.id("itb10")).click();
		expect(takeScreenshot(itb10)).toLookAs("9_no_parameters_no_items");
	});


	//  images as items
	it("should have images as items", function() {
		var itb11 = element(by.id('itb11'));
		//next line is to move the view in the window
		element(by.id("itb11")).click();
		expect(takeScreenshot(itb11)).toLookAs("10_images_as_items");
	});

	var itb12 = element(by.id('itb12'));
	//  Property stretchContentHeight: true, class sapUiResponsiveContentPadding, arrows
	it("should have images as items", function() {
		//next line is to move the view in the window
		browser.executeScript('document.getElementById("itb12").scrollIntoView()').then(function() {
			expect(takeScreenshot(itb12)).toLookAs("11_stretchContentHeight_ResponsivePaddin");
		});
	});

	it("should show icon tab overflow", function() {
		var page5 = element(by.id('sample5'));
		page5.click();
		var itb13 = element(by.id("overFlowTab"));
		//next line is to move the view in the window
		element(by.id("overFlowTab")).click();
		expect(takeScreenshot(itb13)).toLookAs("12_icontab_overflow");
	});

	it("should have show overflow menu", function() {
		//next line is to move the view in the window
		element(by.id("overFlowTab--header-overflow")).click();
		expect(takeScreenshot()).toLookAs("13_opened_overflow_tab");
		_closeIconTabBarOverflow();
	});

	// backgroundDesign property tests
	it("should change IconTabBar container background design to Transparent", function () {
		element(by.id("RB1-Transparent")).click();
		browser.executeScript('document.getElementById("backgroundDesignIconTabBar_fileter3").scrollIntoView()').then(function() {
			expect(takeScreenshot()).toLookAs("14_backgroundDesign_Transparent");
		});
	});

	it("should change IconTabBar container background design to Translucent", function () {
		element(by.id("RB1-Translucent")).click();
		browser.executeScript('document.getElementById("backgroundDesignIconTabBar_fileter3").scrollIntoView()').then(function() {
			element(by.id("backgroundDesignIconTabBar_fileter3")).click();
			expect(takeScreenshot()).toLookAs("14_backgroundDesign_Translucent");
		});
	});

	it("should change IconTabBar container background design to Solid", function () {
		element(by.id("RB1-Solid")).click();
		browser.executeScript('document.getElementById("backgroundDesignIconTabBar_fileter3").scrollIntoView()').then(function() {
			expect(takeScreenshot()).toLookAs("14_backgroundDesign_Solid");
		});
	});

	// headerBackgroundDesign property tests
	it("should change IconTabBar header background design to Transparent", function () {
		element(by.id("RB2-Transparent")).click();
		browser.executeScript('document.getElementById("backgroundDesignIconTabBar_fileter3").scrollIntoView()').then(function() {
			expect(takeScreenshot()).toLookAs("14_headerBackgroundDesign_Transparent");
		});
	});

	it("should change IconTabBar header background design to Translucent", function () {
		element(by.id("RB2-Translucent")).click();
		browser.executeScript('document.getElementById("backgroundDesignIconTabBar_fileter3").scrollIntoView()').then(function() {
			expect(takeScreenshot()).toLookAs("14_headerBackgroundDesign_Translucent");
		});
	});

	it("should change IconTabBar header background design to Solid", function () {
		element(by.id("RB2-Solid")).click();
		element(by.id("backgroundDesignIconTabBar_fileter3")).click(); // move the view in the window
		browser.executeScript('document.getElementById("backgroundDesignIconTabBar_fileter3").scrollIntoView()').then(function() {
			expect(takeScreenshot()).toLookAs("14_headerBackgroundDesign_Solid");
		});
	});
});
