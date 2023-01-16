/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad5-root");

sap.ui.define([], function() {
	"use strict";

	console.time("broad5-fn");

	busyWait(20);

	console.timeEnd("broad5-fn");
});

console.timeEnd("broad5-root");
