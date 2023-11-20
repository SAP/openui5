/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep2-root");

sap.ui.define(["./deep3"], function() {
	"use strict";

	console.time("deep2-fn");

	busyWait(20);

	console.timeEnd("deep2-fn");
});

console.timeEnd("deep2-root");
