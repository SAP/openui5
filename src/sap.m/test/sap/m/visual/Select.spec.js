/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.Select", function() {
	"use strict";

	var bPhone,
		//gets the CSS selector for the element to be clicked in order to close the select dropdown
		_getClosingElement = function() {
			return bPhone ?
				'.sapMSltPicker .sapMIBar.sapMHeader-CTX .sapMBtnInner' : // the 'cancel' footer button will close the select dropdown
				'#select_page'; // the background page can be clicked to close the select dropdown
		},
		//gets the CSS selector of the element that represents the opened select
		_getOpenedElement = function(sDefaultElementId) {
			return bPhone ?
				".sapMSltPicker" :
				"#" + sDefaultElementId;
		};

	it('should load test page',function(){
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});

		expect(takeScreenshot()).toLookAs('initial');
	});

	// verify regular select
	it('should click on regular select', function() {
		expect(takeScreenshot(element(by.id('select_regular')))).toLookAs('select_regular_before_click');
		element(by.id('select_regular')).click();
		expect(takeScreenshot(element(by.css(_getOpenedElement('select_regular'))))).toLookAs('select_regular_after_click');
		element(by.css(_getClosingElement())).click();
	});

	// verify icon-only select
	it('should click on icon-only select', function() {
		expect(takeScreenshot(element(by.id('select_icon')))).toLookAs('select_icon_before_click');
		element(by.id('select_icon')).click();
		expect(takeScreenshot(element(by.css(_getOpenedElement('select_icon'))))).toLookAs('select_icon_after_click');
		element(by.css(_getClosingElement())).click();
	});

	// verify select in footer
	it('should click on select in footer', function() {
		expect(takeScreenshot(element(by.id('select_footer')))).toLookAs('select_footer_before_click');
		element(by.id('select_footer')).click();
		expect(takeScreenshot(element(by.css(_getOpenedElement('select_footer'))))).toLookAs('select_footers_after_click');
		element(by.css(_getClosingElement())).click();
	});

	// verify disabled select
	it('should click on disabled select', function() {
		browser.executeScript(function() { // scroll to the target control
			document.getElementById("select_page-cont").scrollTop = 500;
		});
		expect(takeScreenshot(element(by.id('select_disabled')))).toLookAs('select_disabled_before_click');
		element(by.id('select_disabled')).click();
		expect(takeScreenshot(element(by.id('select_disabled')))).toLookAs('select_disabled_before_click');
	});

});
