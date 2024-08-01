/*global it,element,by,takeScreenshot,expect,browser,module*/
(function() {
	"use strict";

	var fnRunAllCases = function(sType){
		it("should see Text only IconTabBar with sub filters (Two click areas)", function() {
			var itb1 = element(by.id("itb1"));
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1)).toLookAs(sType + "_1_text_only_two_click");
			});
		});

		// focus
		it("should focus the first filter icon when I simulate click on it", function() {
			var itb1 = element(by.id("itb1"));
			element(by.id("itf1")).click();
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1)).toLookAs(sType + "_2_filter_focus");
			});
		});

		// sub-tabs
		it("should open the sub-tabs list on the first filter", function() {
			element(by.id("itf1-expandButton")).click();
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot()).toLookAs(sType + "_3_sub-tabs_list");
			});
		});

		// overflow
		it("should open the sub-tabs list on the first filter", function() {
			element(by.id("itb1--header-overflow-text")).click();
			browser.executeScript("document.getElementById('itb1').scrollIntoView()").then(function() {
				expect(takeScreenshot()).toLookAs(sType + "_4_overflow_list");
			});
		});

		it("should see Text only IconTabBar with filters with NO own content (non selectable) and only sub filters (Single click area)", function() {
			var itb1a = element(by.id("itb1b"));
			browser.executeScript("document.getElementById('itb1b').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1a)).toLookAs(sType + "_5_text_only_single_click");
			});
		});

		it("should see 'interactionMode' testing", function() {
			var itb1a = element(by.id("itb1b2"));
			browser.executeScript("document.getElementById('itb1b2').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb1a)).toLookAs(sType + "_5_1_interactionMode_property");
			});
		});

		// focus
		it("should focus the tenth filter icon when I simulate click on it", function() {
			element(by.id("itf10a")).click();
			browser.executeScript("document.getElementById('itb1a').scrollIntoView()").then(function() {
				expect(takeScreenshot()).toLookAs(sType + "_6_filter_focus");
			});
		});

		it("should see Text and counter IconTabBar with sub filters", function() {
			var itb4 = element(by.id("itb4"));
			browser.executeScript("document.getElementById('itb4').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb4)).toLookAs(sType + "_7_text_and_counter");
			});
		});

		it("should see Text and counter IconTabBar with filters with NO own content (non selectable) and only sub filters", function() {
			var itb4a = element(by.id("itb4a"));
			browser.executeScript("document.getElementById('itb4a').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb4a)).toLookAs(sType + "_8_text_and_counter_single_click");
			});
		});

		it("should see text in Hindi", function() {
			var itb4b = element(by.id("itb4b"));
			browser.executeScript("document.getElementById('itb4b').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb4b)).toLookAs(sType + "_8b_text_in_Hindi");
			});
		});

		it("should see IconTabBar with sub filters", function() {
			var itb5 = element(by.id("itb5"));
			browser.executeScript("document.getElementById('itb5').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb5)).toLookAs(sType + "_9_text_and_icons");
			});
		});

		it("should see IconTabBar with filters with NO own content (non selectable) and only sub filters", function() {
			var itb5a = element(by.id("itb5a"));
			browser.executeScript("document.getElementById('itb5a').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb5a)).toLookAs(sType + "_10_text_and_icons_single_click");
			});
		});

		it("should see Horizontal IconTabBar with sub filters", function() {
			var itb6 = element(by.id("itb6"));
			browser.executeScript("document.getElementById('itb6').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb6)).toLookAs(sType + "_11_horizontal_text_and_icons");
			});
		});

		it("should see Horizontal IconTabBar with filters with NO own content (non selectable) and only sub filters", function() {
			var itb6a = element(by.id("itb6a"));
			browser.executeScript("document.getElementById('itb6a').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb6a)).toLookAs(sType + "_12_horizontal_text_and_icons_single");
			});
		});

		it("should see IconTabBar icons only with sub filters", function() {
			var itb7 = element(by.id("itb7"));
			browser.executeScript("document.getElementById('itb7').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb7)).toLookAs(sType + "_13_icon_only");
			});
		});

		it("should see IconTabBar icons only with filters with NO own content (non selectable) and only sub filters", function() {
			var itb7a = element(by.id("itb7a"));
			browser.executeScript("document.getElementById('itb7a').scrollIntoView()").then(function() {
				expect(takeScreenshot(itb7a)).toLookAs(sType + "_14_icon_only_single_click");
			});
		});

		// start overflow
		it("should open the select list on the start overflow", function() {
			element(by.id("itb1a--header-startOverflow-text")).click();
			browser.executeScript("document.getElementById('itb1a').scrollIntoView()").then(function() {
				expect(takeScreenshot()).toLookAs(sType + "_15_startOverflow_list");
			});
		});

		// inline icons
		it("should open the select list on the start overflow", function() {
			browser.executeScript("document.getElementById('itb1c').scrollIntoView()").then(function() {
				expect(takeScreenshot()).toLookAs(sType + "_16_inline_icons");
			});
		});

	};

	module.exports = fnRunAllCases;
})();