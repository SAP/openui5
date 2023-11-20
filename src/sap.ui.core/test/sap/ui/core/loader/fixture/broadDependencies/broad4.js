/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad4-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad4-fn");

	busyWait(20);

	console.timeEnd("broad4-fn");
});

console.timeEnd("broad4-root");
