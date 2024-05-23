/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/config"
], (
    config
) => {
	"use strict";

    const pReady = new Promise((res, rej) => {
        sap.ui.require([
            "sap/ui/test/starter/_setupAndStart"
        ], function(starter) {
            res(starter);
        }, rej);
    }).then((starter) => {
        return starter.init();
    });

	return {
		run: () => {
			return pReady;
		}
	};
});