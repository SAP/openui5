/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep3-root");

sap.ui.define(["./deep4"], function() {
	"use strict";

	console.time("deep3-fn");

	busyWait(20);

	console.timeEnd("deep3-fn");
});

console.timeEnd("deep3-root");
