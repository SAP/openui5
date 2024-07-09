/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/Log"],
	function (Log) {
		"use strict";

		/**
		 * @classdesc
		 * A dummy implementation that does not really utilize the cache. Can be used when one wants to switch-off
		 * the cache without changing its code
		 * @private
		 * @since 1.37.0
		 * @namespace
		 * @alias sap.ui.core.cache.CacheManagerNOP
		 */
		var CacheManagerNOP = {
			name: "CacheManagerNOP",
			logResolved: function(sFnName) {
				Log.debug("Cache Manager is not supported on this environment.");
			},
			set: function () {
				return Promise.resolve();
			},
			get: function () {
				return Promise.resolve(undefined);
			},
			has: function () {
				return Promise.resolve(false);
			},
			del: function () {
				return Promise.resolve();
			},
			delWithFilters: function() {
				return Promise.resolve();
			},
			reset: function () {
				return Promise.resolve();
			},
			init: function() {
				return Promise.resolve(this);
			},
			_db: {
				close: function () {
				}
			},
			_getCount: function () {
				return Promise.resolve(0);
			},
			_destroy: function () {
			},
			_getVersion: function() {
				return "";
			}
		};

		return CacheManagerNOP;
	});