

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
		"use strict";
		return Controller.extend("sap.m.sample.FormattedText.C", {
			onInit : function() {

				// HTML string bound to the formatted text control
				var oModel = new JSONModel({
					HTML : "<h3>subheader</h3>" +
					"<p>link: <a href=\"//www.sap.com\" style=\"color:green; font-weight:600;\">link to sap.com</a> - links open in a new window.</p>" +
					"<p>paragraph: <strong>strong</strong> and <em>emphasized</em>.</p>" +
					"<p>list:</p>" +
					"<ul><li>list item 1</li><li>list item 2<ul><li>sub item 1</li><li>sub item 2</li></ul></li></ul>" +
					"<p>pre:</p><pre>abc    def    ghi</pre>" +
					"<p>code: <code>var el = document.getElementById(\"myId\");</code></p>" +
					"<p>cite: <cite>a reference to a source</cite></p>" +
					"<dl><dt>definition:</dt><dd>definition list of terms and descriptions</dd>"
				});
				this.getView().setModel(oModel);
			}
		});
	});