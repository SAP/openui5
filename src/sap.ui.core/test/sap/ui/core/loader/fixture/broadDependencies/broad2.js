/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad2-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad2-fn");

	busyWait(20);

	console.timeEnd("broad2-fn");
});

console.timeEnd("broad2-root");
