describe('sap.m.SplitApp', function() {

	it("SplitApp initial rendering",function() {
		expect(takeScreenshot()).toLookAs("SplitApp-InitialRendering");
	});

	it('should hide the master form as mode is switched to Hide', function() {
		element(by.id('saHideMasterMode')).click();
		expect(takeScreenshot()).toLookAs('saModes-HideMaster');
	});

	it('should show the master form again as mode is switched to Show/Hide', function() {
		element(by.id('saShowHideMasterMode')).click();
		expect(takeScreenshot()).toLookAs('saModes-ShowHideMaster');
	});

	it('should navigate to master page 2', function() {
		element(by.id('saNavigateToMaster')).click();
		expect(takeScreenshot()).toLookAs('navigateTo-Master2');
	});

	it('should navigate to detaildetail page', function() {
		element(by.id('saNavigationToDetail')).click();
		expect(takeScreenshot()).toLookAs('navigateTo-DetailDetail');
	});




});