/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep8-root");

sap.ui.define([], function() {
	"use strict";

	console.time("deep8-fn");

	busyWait(20);

	console.timeEnd("deep8-fn");
});

console.timeEnd("deep8-root");
