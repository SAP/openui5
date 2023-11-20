/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	return {
		doSomething: {
			changeHandler: {
				applyChange() {
				},
				completeChangeContent() {
				},
				revertChange() {
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
				applyChange() {
				},
				completeChangeContent() {
				},
				revertChange() {
				}
			},
			layers: {
				USER: true,
				CUSTOMER: false
			}
		}
	};
}, /* bExport= */true);
