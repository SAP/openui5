/*eslint-disable no-console*/
/*global busyWait*/
console.time("broad1-root");

sap.ui.define(["./broad2", "./broad3", "./broad4", "./broad5", "./broad6", "./broad7", "./broad8"], function() {
	"use strict";

	console.time("broad1-fn");

	busyWait(20);

	console.timeEnd("broad1-fn");
});

console.timeEnd("broad1-root");
