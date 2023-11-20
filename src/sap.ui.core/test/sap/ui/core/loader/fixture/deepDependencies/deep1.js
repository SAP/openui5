/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep1-root");

sap.ui.define(["./deep2"], function() {
	"use strict";

	console.time("deep1-fn");

	busyWait(20);

	console.timeEnd("deep1-fn");
});

console.timeEnd("deep1-root");
