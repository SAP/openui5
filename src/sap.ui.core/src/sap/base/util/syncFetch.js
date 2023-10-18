/*!
 * ${copyright}
 */
sap.ui.define([
	"./fetch",
	"sap/ui/base/SyncPromise"
], function (fetch, SyncPromise) {
	"use strict";

	function SyncResponseMixin() {
		var superText = this.text;
		var superJson = this.json;

		this.text = function() {
			return superText().unwrap();
		};
		this.json = function () {
			return superJson().unwrap();
		};
	}


	syncFetch.ContentTypes = fetch.ContentTypes;

	return syncFetch;
});