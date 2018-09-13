/* global QUnit */
(function () {
	"use strict";

	sap.ui.define(["sap/base/util/LoaderExtensions"], function (LoaderExtensions) {
		LoaderExtensions.loadResource("static/jquery.sap.dom.html", {
			dataType: "html",
			async: true
		}).then(function (sHTML) {
			document.body.innerHTML += sHTML;
			QUnit.start();
		});
	});

}());

