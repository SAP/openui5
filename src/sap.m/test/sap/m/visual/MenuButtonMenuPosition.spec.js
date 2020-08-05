/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.MenuButtonMenuPosition", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.MenuButton';

	var fnClickThenCompare = function (bPosButtonClick, sTestMessage, sImageName) {
		it(sTestMessage, function () {
			if (bPosButtonClick) {
				element(by.id("posButtonId")).click();
			}
			element(by.id("posMenuId")).click();
			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios" && browser.testrunner.runtime.browserName != "safari") {
				// only on desktop and not in Safari (sendKeys needs an Element in Safari, so test makes no sense there)
				browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
				expect(takeScreenshot()).toLookAs(sImageName);
			}
		});
	};
	// verify MenuButton is opened and the menu position is BeginBottom
	fnClickThenCompare(false, "should open MenuButton in position BeginBottom", "menu_in_BeginBottom_position");

	// verify MenuButton is opened and the menu position is BeginTop
	fnClickThenCompare(true, "should open MenuButton in position BeginTop", "menu_in_BeginTop_position");

	// verify MenuButton is opened and the menu position is BeginCenter
	fnClickThenCompare(true, "should open MenuButton in position BeginCenter", "menu_in_BeginCenter_position");

	// verify MenuButton is opened and the menu position is LeftTop
	fnClickThenCompare(true, "should open MenuButton in position LeftTop", "menu_in_LeftTop_position");

	// verify MenuButton is opened and the menu position is LeftCenter
	fnClickThenCompare(true, "should open MenuButton in position LeftCenter", "menu_in_LeftCenter_position");

	// verify MenuButton is opened and the menu position is LeftBottom
	fnClickThenCompare(true, "should open MenuButton in position LeftBottom", "menu_in_LeftBottom_position");

	// verify MenuButton is opened and the menu position is CenterTop
	fnClickThenCompare(true, "should open MenuButton in position CenterTop", "menu_in_CenterTop_position");

	// verify MenuButton is opened and the menu position is LeftTop
	fnClickThenCompare(true, "should open MenuButton in position CenterCenter", "menu_in_CenterCenter_position");

	// verify MenuButton is opened and the menu position is CenterBottom
	fnClickThenCompare(true, "should open MenuButton in position CenterBottom", "menu_in_CenterBottom_position");

	// verify MenuButton is opened and the menu position is RightTop
	fnClickThenCompare(true, "should open MenuButton in position RightTop", "menu_in_RightTop_position");

	// verify MenuButton is opened and the menu position is RightCenter
	fnClickThenCompare(true, "should open MenuButton in position RightCenter", "menu_in_RightCenter_position");

	// verify MenuButton is opened and the menu position is RightBottom
	fnClickThenCompare(true, "should open MenuButton in position RightBottom", "menu_in_RightBottom_position");

	// verify MenuButton is opened and the menu position is EndTop
	fnClickThenCompare(true, "should open MenuButton in position EndTop", "menu_in_EndTop_position");

	// verify MenuButton is opened and the menu position is EndCenter
	fnClickThenCompare(true, "should open MenuButton in position EndCenter", "menu_in_EndCenter_position");

	// verify MenuButton is opened and the menu position is EndBottom
	fnClickThenCompare(true, "should open MenuButton in position EndBottom", "menu_in_EndBottom_position");
});
