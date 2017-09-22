/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.ResponsivePopover", function() {
	"use strict";

	var bPhone = null;
	var _resolvePopover = function (sId) {
		var mDesktopToPhoneIds = {
			"popoverBottom-popover": "popoverBottom-dialog",
			"popoverWithNavContainer-popover": "popoverWithNavContainer-dialog",
			"popoverHeader-popover": "popoverHeader-dialog"
		};

		return bPhone ? mDesktopToPhoneIds[sId] : sId;
	};
	var _closePopover = function (sCloseId) {
		var sId = bPhone ? sCloseId : "page1-title";

		element(by.id(sId)).click();
	};

	it('should load test page',function(){
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});

		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Should open ResponsivePopover', function() {
		element(by.id('btnPopoverBottom')).click();
		expect(takeScreenshot(element(by.id(_resolvePopover('popoverBottom-popover'))))).toLookAs('responsive-popover');
		_closePopover("popoverBottom-closeButton");
	});

	it('Should open ResponsivePopover with detail page', function() {
		element(by.id('btnPopoverWithNavContainer')).click();
		expect(takeScreenshot(element(by.id(_resolvePopover('popoverWithNavContainer-popover'))))).toLookAs('responsive-popover2-first-page');
		element(by.id('listPage')).click();
		expect(takeScreenshot(element(by.id(_resolvePopover('popoverWithNavContainer-popover'))))).toLookAs('responsive-popover2-detail-page');
		_closePopover("popoverWithNavContainer-closeButton");
	});

	it('Should open ResponsivePopover with shared title', function() {
		element(by.id('btnPopoverHeader')).click();
		expect(takeScreenshot(element(by.id(_resolvePopover('popoverHeader-popover'))))).toLookAs('responsive-popover-shared-title1');
		element(by.id('btnNextPage')).click();
		expect(takeScreenshot(element(by.id(_resolvePopover('popoverHeader-popover'))))).toLookAs('responsive-popover-shared-title2');
		_closePopover("popoverHeader-closeButton");
	});

});