/*global describe,it,element,by,takeScreenshot,expect,browser,document*/

describe('sap.m.QuickView', function() {
	"use strict";

	var bPhone = null;
	var _resolveQuickView = function (sId) {
		var mDesktopToPhoneIds = {
			"QV1-quickView-popover": "QV1-quickView-dialog",
			"QV2-quickView-popover": "QV2-quickView-popover-dialog"
		};

		return bPhone ? mDesktopToPhoneIds[sId] : sId;
	};
	var _closeQuickView = function (sCloseName) {
		var sName = bPhone ? sCloseName : "quickViewPage-title";
		if (bPhone) {
			browser.executeScript('document.getElementsByClassName("' + sName + '").click()');
		} else {
			element(by.id(sName)).click();
		}

	};
	// initial loading
	it('should load test page', function () {
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs('0_initial');
	});

	// standard
	it('should visualize standard QuickView', function () {
		element(by.id('QVButton')).click();
		var qv1 = element(by.id(_resolveQuickView('QV1-quickView-popover')));
		expect(takeScreenshot(qv1)).toLookAs('1_standard_QuickView');
	});

	// go to page 2
	it('should go to page 2', function () {
		element(by.id('__link2')).click();
		var qv1 = element(by.id(_resolveQuickView('QV1-quickView-popover')));
		expect(takeScreenshot(qv1)).toLookAs('2_go_to_page_2');
		_closeQuickView("sapMBtn sapMBtnBase");
	});

	// return to page 1
	it('should return to page 1', function () {
		var qv1 = element(by.id(_resolveQuickView('QV1-quickView-popover')));
		expect(takeScreenshot(qv1)).toLookAs('3_return_to_page_1');
		_closeQuickView("sapMBtn sapMBtnBase");
	 });

	// single page
	it('should visualize QuickView with single page', function () {
		element(by.id('SinglePageQVButton')).click();
		var qv2 = element(by.id(_resolveQuickView('QV2-quickView-popover')));
		expect(takeScreenshot(qv2)).toLookAs('5_single_page_QuickView');
		_closeQuickView("sapMBtn sapMBtnBase");
	});

});