/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([], function () {
	"use strict";

	return {
		doSomething: {
			changeHandler: {
				applyChange: function () {
				},
				completeChangeContent: function () {
				},
				revertChange: function() {
				},
				dummyId: "testChangeHandler-doSomething"
			},
			layers: {
				USER: true,
				CUSTOMER: false
			}
		},
		doSomethingElse: {
			changeHandler: {
				applyChange: function () {
				},
				completeChangeContent: function () {
				},
				revertChange: function() {
				}
			},
			layers: {
				USER: true,
				CUSTOMER: false
			}
		}
	};
}, /* bExport= */true);
