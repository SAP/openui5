/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad3-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad3-fn");

	busyWait(20);

	console.timeEnd("broad3-fn");
});

console.timeEnd("broad3-root");
