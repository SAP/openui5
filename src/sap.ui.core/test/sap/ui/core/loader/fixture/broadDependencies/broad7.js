/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad7-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad7-fn");

	busyWait(20);

	console.timeEnd("broad7-fn");
});

console.timeEnd("broad7-root");
