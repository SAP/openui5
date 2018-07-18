/*!
 * ${copyright}
 */

// listens for new log entries to $.sap.log
// collects logs created when _autoWaiter hasPending is called
// this includes only the final pending result logs without any intermediate advanced logs
// final result logs are recognized by a component name suffix "#hasPending"
sap.ui.define([
	"sap/base/Log"
], function (Log) {
	"use strict";

	var aLogs = [];
	var oListener = {
		onLogEntry: function (oLogEntry) {
			if (oLogEntry.component.match(/^sap.ui.test.autowaiter.*#hasPending$/)) {
				aLogs.push(oLogEntry.message);
			}
		}
	};

	return {
		start: function () {
			Log.addLogListener(oListener);
		},
		getAndClearLog: function () {
			var sLogs = aLogs.join("\n");
			aLogs.length = 0;
			return sLogs;
		},
		stop: function () {
			aLogs.length = 0;
			Log.removeLogListener(oListener);
		}
	};
}, true);