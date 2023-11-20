/*eslint-disable no-console*/
/*global busyWait*/
console.time("deep7-root");

sap.ui.define(["./deep8"], function() {
	"use strict";

	console.time("deep7-fn");

	busyWait(20);

	console.timeEnd("deep7-fn");
});

console.timeEnd("deep7-root");
