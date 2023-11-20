/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep5-root");

sap.ui.define(["./deep6"], function() {
	"use strict";

	console.time("deep5-fn");

	busyWait(20);

	console.timeEnd("deep5-fn");
});

console.timeEnd("deep5-root");
