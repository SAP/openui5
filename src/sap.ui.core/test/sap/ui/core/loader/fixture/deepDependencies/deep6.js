/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep6-root");

sap.ui.define(["./deep7"], function() {
	"use strict";

	console.time("deep6-fn");

	busyWait(20);

	console.timeEnd("deep6-fn");
});

console.timeEnd("deep6-root");
