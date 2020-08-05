/* global sinon */
sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	var xhr = sinon.useFakeXMLHttpRequest(),
		_setTimeout = window.setTimeout;

	xhr.useFilters = true;
	xhr.addFilter(function(method, url) {
		return url.indexOf("/fake") != 0;
	});

	xhr.onCreate = function(request) {
		request.onSend = function() {
			// Default request answer values:
			var mJSONHeaders = 	{
				"Content-Type": "application/json;charset=utf-8",
				"DataServiceVersion": "2.0"
			};
			var iStatus = 200;
			var sAnswer = "ERROR!";
			var iDelay = 10;

			switch (request.url) {
				case "/fake/testdata3.json":
					sAnswer = '{' +
						'"foo": "The quick brown fox jumps over the lazy dog.",' +
					  '"bar": "ABCDEFG",' +
					  '"baz": [52, 97]' +
					'}';
					iDelay = 100;
					break;
				case "/fake/testdata4.json":
					sAnswer = '{' +
						'"foo": "The quick brown fox jumps over the lazy dog.",' +
						'"bar": "ABCDEFGHIJ",' +
						'"baz": [52, 97],' +
						'"merged": true' +
					'}';
					break;
				case "/fake/broken.json":
					sAnswer = '{' +
						'"foo": "The quick brown fox jumps over the lazy dog.",' +
						'"bar": "ABCDEFGHIJ"' + // missing ","
						'"baz": [52, 97]' +
					'}';
					break;

				default:
					// No dummy request!

					break;
			}

			_setTimeout(function() {
				Log.info("[FakeService] Responding to: " + request.url);
				request.respond(iStatus, mJSONHeaders, sAnswer);
			}, iDelay);
		};
	};

});
