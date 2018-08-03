/*global describe,it,element,by,takeScreenshot,expect,browser,document*/

describe('sap.m.QuickView', function() {
	"use strict";

	var bPhone = null;

	var _getQuickViewID = function (IDStart) {
		var phoneID = IDStart + '-quickView-dialog';
		var desktopID = IDStart + '-quickView-popover';

		return bPhone ? phoneID : desktopID;
	};

	var _closeQuickView = function () {
		if (bPhone) {
			element(by.css('button[title=Decline]')).click();
		} else {
			element(by.id('quickViewPage-title')).click();
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
		var qv1 = element(by.id(_getQuickViewID('QV1')));
		expect(takeScreenshot(qv1)).toLookAs('1_standard_QuickView');
	});

	// go to page 2
	it('should go to page 2', function () {
		var sQuickViewID = _getQuickViewID('QV1');
		element(by.css('#' + sQuickViewID + ' .sapUiFormResGridLastContM:first-of-type a:first-of-type')).click(); //click on the link "SAP AG"
		var qv1 = element(by.id(sQuickViewID));
		expect(takeScreenshot(qv1)).toLookAs('2_go_to_page_2');
	});

	// return to page 1
	it('should return to page 1', function () {
		element(by.css('button[title=Back]')).click(); //press "Back" arrow
		var qv1 = element(by.id(_getQuickViewID('QV1')));
		expect(takeScreenshot(qv1)).toLookAs('3_return_to_page_1');
		_closeQuickView();
	 });

	// single page
	it('should visualize QuickView with single page', function () {
		element(by.id('SinglePageQVButton')).click();
		var qv2 = element(by.id(_getQuickViewID('QV2')));
		expect(takeScreenshot(qv2)).toLookAs('4_single_page_QuickView');
		_closeQuickView();
	});

});