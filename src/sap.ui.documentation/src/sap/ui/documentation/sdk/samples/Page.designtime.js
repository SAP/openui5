/*!
 * ${copyright}
 */

/**
 * Design Time Metadata extension for the UI Component.
 *
 * This module extends the default PageDesigntime metadata with additional tooling methods
 * for starting and stopping RTA (Runtime Adaptation) via postMessage communication.
 *
 * @module sap/ui/documentation/sdk/samples/Page.designtime
 *
 * @requires sap/m/designtime/Page.designtime
 *
 * @returns {object} Extended PageDesigntime metadata object with `tool` property.
 *
 * @property {object} tool - Tooling methods for RTA integration.
 * @property {Function} tool.start - Sends a "RTA_START" message to the parent window with a status message.
 * @property {Function} tool.stop - Sends a "RTA_STOP" message to the parent window with a status message.
 */
// Provides the Design Time Metadata for the UI Component
sap.ui.define(["sap/m/designtime/Page.designtime"],
	function (PageDesigntime) {
		"use strict";

		const getUrlParam = function(sParamName) {
			return new window.URLSearchParams(window.location.search).get(sParamName);
		},
		postMessageToOrigin = function(oData) {
			window.parent.postMessage(oData, getUrlParam('sap-ui-xx-dk-origin'));
		};

		return Object.assign({}, PageDesigntime, {
			tool: {
				start:function() {
					postMessageToOrigin({
						type: "RTA_START",
						data: {
							"msg": "RTA started"
						}
					});
				},
				stop:function() {
					postMessageToOrigin({
						type: "RTA_STOP",
						data: {
							"msg": "RTA stopped"
						}
					});
				}
			}
		});
	});