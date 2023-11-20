/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep4-root");

sap.ui.define(["./deep5"], function() {
	"use strict";

	console.time("deep4-fn");

	busyWait(20);

	console.timeEnd("deep4-fn");
});

console.timeEnd("deep4-root");
