/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.SplitApp', function() {
	"use strict";

	var bPhone = null;

	it("SplitApp initial rendering",function() {
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			bPhone = response;
		});
		expect(takeScreenshot()).toLookAs("SplitApp-InitialRendering");
	});

	it('should hide the master form as mode is switched to Hide', function() {
		if (bPhone) {
			element(by.id('saNavigateToMaster')).click();
			expect(takeScreenshot()).toLookAs('saModes-HideMaster');
		} else {
			it('should navigate to master page', function() {
				element(by.id('saNavigateToMaster')).click();
				element(by.id('listDetail')).click();
				expect(takeScreenshot()).toLookAs('navigateTo-Deatil');
			});
		}
	});

	it('should show the master form again as mode is switched to Show/Hide', function() {
		if (!bPhone) {
			element(by.id('saShowHideMasterMode')).click();
			expect(takeScreenshot()).toLookAs('saModes-ShowHideMaster');
		}
	});

	it('should navigate to master page 2', function() {
		if (!bPhone) {
			element(by.id('saNavigateToMaster')).click();
			expect(takeScreenshot()).toLookAs('navigateTo-Master2');
		}
	});

	it('should navigate to detaildetail page', function() {
		if (!bPhone) {
			element(by.id('saNavigationToDetail')).click();
			expect(takeScreenshot()).toLookAs('navigateTo-DetailDetail');
		}
	});

});