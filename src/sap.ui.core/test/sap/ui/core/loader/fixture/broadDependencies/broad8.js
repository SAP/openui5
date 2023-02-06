/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad8-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad8-fn");

	busyWait(20);

	console.timeEnd("broad8-fn");
});

console.timeEnd("broad8-root");
