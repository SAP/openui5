describe("sap.m.MessageToast", function () {
	var sPosition;

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	["begin", "center", "end", "left", "right"].forEach(function (sFirstPosition) {
		["bottom", "center", "top"].forEach(function (sSecondPosition) {
			sPosition = sFirstPosition + "-" + sSecondPosition;
			it("should open MessageToast with position " + sPosition, function () {
				element(by.id("select-list")).click();
				element(by.id(sPosition)).click();
				element(by.id("show-button")).click();
				expect(takeScreenshot()).toLookAs(sPosition);
			});
		});
	});

});