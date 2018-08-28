

/*global QUnit */
sap.ui.define(function(){
	"use strict";

	//prepare HTML
	var div = document.createElement("div");
	div.id = "iframe";
	document.body.appendChild(div);

	var sPath = sap.ui.require.toUrl("testdata/core/dom/");

	QUnit.test("After loading the minimal bootstrap code...", function(assert) {
		var done = assert.async();

		var iframe = document.createElement('iframe');
		iframe.src = sPath + "activeElementFixIFrame.html";
		iframe.onload = function (o) {
			var iframeWindow = o.target.contentWindow;

			assert.ok(iframeWindow.sapUiDomActiveElementAccessSucceeded, "iframe successfully loaded");
			if (!iframeWindow.sapUiDomActiveElementAccessSucceeded) {
				assert.ok(false, "Error: " + iframeWindow.sapUiDomActiveElementAccessError);
			}
			// do not remove iframe to prevent exceptions from async operations accessing its DOM
			done();
		};

		document.getElementById("iframe").appendChild(iframe);
	});

	QUnit.test("fix IE11 issue of returning empty object from document.activeElement", function (assert) {
		var done = assert.async();

		var iframe = document.createElement("iframe");
		iframe.src = sPath + "activeElementEmptyObjectFixIFrame.html";
		iframe.onload = function (o) {
			var iframeWindow = o.target.contentWindow;

			assert.ok(iframeWindow.inputRemoved, "input is removed");
			assert.equal(iframeWindow.savedActiveElement, iframeWindow.document.body, "The active element should be body");

			// do not remove iframe to prevent exceptions from async operations accessing its DOM
			done();
		};

		document.getElementById("iframe").appendChild(iframe);
	});
});