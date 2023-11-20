/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad6-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad6-fn");

	busyWait(20);

	console.timeEnd("broad6-fn");
});

console.timeEnd("broad6-root");
