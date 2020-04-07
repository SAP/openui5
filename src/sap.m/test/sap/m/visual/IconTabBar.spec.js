/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.IconTabBar", function() {
	"use strict";

	var bPhone = null;
	var _closeIconTabBarOverflow = function () {
		var sId = bPhone ? "__popover0-dialog-footer" : "page1-intHeader";

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

	var fnRunAllCases = function(sType){
		// semantic colours
		it("should be in semantic colours scheme", function() {
			var itb1 = element(by.id("itb1"));
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1)).toLookAs(sType + "_1_semantic_colors");
			});
		});

		// focus
		it("should focus the second filter icon when I simulate click on it", function() {
			var itb1 = element(by.id("itb1"));
			element(by.id("itf1")).click();
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1)).toLookAs(sType + "_2_filter_focus");
			});
		});

		// check property expandable: false
		it("should not collapse when filter icon is clicked again", function() {
			var itb1 = element(by.id("itb1"));
			element(by.id("itf1")).click();
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1)).toLookAs(sType + "_3_expandable_false");
			});
		});

		// check property selectedKey
		it("key with key:'key13' must be selected", function() {
			var itb2 = element(by.id("itb2"));
			browser.executeScript("document.getElementById('itb2').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb2)).toLookAs(sType + "_4_selectableKey");
			});
		});

		// check property expandable: true
		it("should collapse when filter is clicked", function() {
			var itb2 = element(by.id("itb2"));
			element(by.id("itf2")).click();
			browser.executeScript("document.getElementById('itb2').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb2)).toLookAs(sType + "_5_expandable_true");
			});
		});

		// check icon only ITB with semantic colors
		it("should visualize icon only ITB with semantic colors", function() {
			var itb2a = element(by.id("itb2a"));
			browser.executeScript("document.getElementById('itb2a').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb2a)).toLookAs(sType + "_5a_icon_only_semantic");
			});
		});

		// tabs with labels and invisible tabs
		it("should contain tabs with labels", function() {
			var itb3 = element(by.id("itb3"));
			browser.executeScript("document.getElementById('itb3').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb3)).toLookAs(sType + "_6_tabs_with_labels_and_inv_tabs");
			});
		});

		// check property applyContentPadding: false
		it("should not have padding of the content", function() {
			var itb4a = element(by.id("itb4a"));
			browser.executeScript("document.getElementById('itb4a').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb4a)).toLookAs(sType + "_7_applyContentPadding_false");
			});
		});

		// tabs with no icons, only labels in upperCase, semantic colours, transparent background design
		it("should contain tabs without icons in upperCase in semantic colours and transparent background design", function() {
			var itb5 = element(by.id("itb5"));
			browser.executeScript("document.getElementById('itb5').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb5)).toLookAs(sType + "_8_noIcons_upperCase_semantic");
			});
		});

		// initially collapsed IconTabBar with no active item
		it("should be initially collapsed and with no active item", function() {
			var itb6 = element(by.id("itb6"));
			browser.executeScript("document.getElementById('itb6').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb6)).toLookAs(sType + "_9_initially_collapsed_no_active_item");
			});
		});

		// process-like IconTabBar with horizontal layout
		it("should be with horizontal layout", function() {
			var itb9 = element(by.id("itb9"));
			browser.executeScript("document.getElementById('itb9').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb9)).toLookAs(sType + "_10_horizontal_layout");
			});
		});

		// no parameters and no items
		it("should not have any parameters or items", function() {
			var itb10 = element(by.id("itb10"));
			browser.executeScript("document.getElementById('itb10').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb10)).toLookAs(sType + "_11_no_parameters_no_items");
			});
		});

		// images as items
		it("should have images as items", function() {
			var itb11 = element(by.id("itb11"));
			browser.executeScript("document.getElementById('itb11').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb11)).toLookAs(sType + "_12_images_as_items");
			});
		});

		// Property stretchContentHeight: true, class sapUiResponsiveContentPadding, arrows
		var itb12 = element(by.id("itb12"));
		it("should have images as items", function() {
			browser.executeScript("document.getElementById('itb12').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb12)).toLookAs(sType + "_13_stretchContentHeight_resp_padd");
			});
		});

		it("should show icon tab overflow", function() {
			var itb13 = element(by.id("overFlowTab"));
			browser.executeScript("document.getElementById('overFlowTab').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb13)).toLookAs(sType + "_14_icontab_overflow");
			});
		});

		it("should have show overflow menu", function() {
			element(by.id("overFlowTab--header-overflowButton")).click();
			browser.executeScript("document.getElementById('overFlowTab').scrollIntoView()").then(function() {
				expect(takeScreenshot()).toLookAs(sType + "_15_opened_overflow_tab");
			});
			_closeIconTabBarOverflow();
		});

		// backgroundDesign property tests
		it("should change IconTabBar container background design to Transparent", function () {
			element(by.id("RB1-Transparent")).click();
			browser.executeScript("document.getElementById('backgroundDesignIconTabBar_filter3').scrollIntoView()").then(function() {
				expect(takeScreenshot(element(by.id("backgroundDesignIconTabBar")))).toLookAs(sType + "_16_backgroundDesign_Transparent");
			});
		});

		it("should change IconTabBar container background design to Translucent", function () {
			element(by.id("RB1-Translucent")).click();
			browser.executeScript("document.getElementById('backgroundDesignIconTabBar').scrollIntoView()").then(function() {
				element(by.id("backgroundDesignIconTabBar_filter3")).click();
				expect(takeScreenshot(element(by.id("backgroundDesignIconTabBar")))).toLookAs(sType + "_17_backgroundDesign_Translucent");
			});
		});

		it("should change IconTabBar container background design to Solid", function () {
			element(by.id("RB1-Solid")).click();
			browser.executeScript("document.getElementById('backgroundDesignIconTabBar').scrollIntoView()").then(function() {
				expect(takeScreenshot(element(by.id("backgroundDesignIconTabBar")))).toLookAs(sType + "_18_backgroundDesign_Solid");
			});
		});

		// headerBackgroundDesign property tests
		it("should change IconTabBar header background design to Transparent", function () {
			element(by.id("RB2-Transparent")).click();
			browser.executeScript("document.getElementById('backgroundDesignIconTabBar').scrollIntoView()").then(function() {
				expect(takeScreenshot(element(by.id("backgroundDesignIconTabBar")))).toLookAs(sType + "_19_headerBackgroundDesign_Transp");
			});
		});

		it("should change IconTabBar header background design to Translucent", function () {
			element(by.id("RB2-Translucent")).click();
			browser.executeScript("document.getElementById('backgroundDesignIconTabBar').scrollIntoView()").then(function() {
				expect(takeScreenshot(element(by.id("backgroundDesignIconTabBar")))).toLookAs(sType + "_20_headerBackgroundDesign_Transl");
			});
		});

		it("should change IconTabBar header background design to Solid", function () {
			element(by.id("RB2-Solid")).click();
			element(by.id("backgroundDesignIconTabBar_filter3")).click(); // move the view in the window
			browser.executeScript("document.getElementById('backgroundDesignIconTabBar').scrollIntoView()").then(function() {
				expect(takeScreenshot(element(by.id("backgroundDesignIconTabBar")))).toLookAs(sType + "_21_headerBackgroundDesign_Solid");
			});
		});

		it("should have Responsive Padding in Fiori 3 themes", function() {
			browser.executeScript("document.getElementById('itb_rp').scrollIntoView()").then(function() {
				expect(takeScreenshot(element(by.id("itb_rp")))).toLookAs(sType + "_22_responsivePadding");
			});
		});
	};

	//check tabDensityMode property = Cozy
	fnRunAllCases("Cz");

	//check tabDensityMode property = Compact
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('RBGTabDensityMode').scrollIntoView()");
		element(by.id("RB8-Compact")).click();
	});
	fnRunAllCases("Cp");

	//check tabDensityMode property = Inherit when the page is in Cozy density mode
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('RBGTabDensityMode').scrollIntoView()");
		element(by.id("RB9-Inherit")).click();
	});
	fnRunAllCases("ICz");

	//check tabDensityMode property = Inherit when the page is in Compact density mode
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('RBGTabDensityMode').scrollIntoView()");
		element(by.id("densityModeBox")).click();
	});
	fnRunAllCases("ICp");


	//check Contrast IconTabBar with transparent backgrounds
	it("should have transparent background", function() {
		browser.executeScript("document.getElementById('contrastPlusIconTabBar').scrollIntoView()").then(function() {
			expect(takeScreenshot(element(by.id("contrastPlusIconTabBar")))).toLookAs("Contrast_Plus_IconTabBar");
		});
	});
});
