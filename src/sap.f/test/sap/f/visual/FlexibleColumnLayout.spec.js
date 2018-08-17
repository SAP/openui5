/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.f.FlexibleColumnLayout', function() {
	'use strict';

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Set busy to the FlexibleColumnLayout', function() {
		var oButton = element(by.id('button7'));

		oButton.click();
		expect(takeScreenshot(oButton)).toLookAs('fcl_busy');
		browser.executeScript(function(){
			sap.ui.getCore().byId('fcl').setBusy(false);
		});
	});
});