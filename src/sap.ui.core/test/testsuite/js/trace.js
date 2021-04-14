sap.ui.define([
	"./testfwk"
], function(testfwk) {
	"use strict";

	testfwk.attachContentWillChange(onContentWillChange);

	var oLogViewer;

	Object.defineProperty(window, "oLogViewer", {
		get: function() {
			return oLogViewer;
		},
		set: function(oNewLogViewer) {
			oLogViewer = oNewLogViewer;
		}
	});

	function onContentWillChange() {
		if ( oLogViewer ) {
			try {
				oLogViewer.onDetachFromLog(null);
				oLogViewer.lock();
			} catch (e) {
				// ignore
			}
		}
	}

	var oTimerId;
	function setLogFilter(oEvent) {
		var oInputField = oEvent.target;
		var oFilter;
		if ( oInputField.value ) {
			var sFilter = oInputField.value.toUpperCase();
			oFilter = function(sText) {
				return sText && sText.toUpperCase().indexOf(sFilter) >= 0;
			};
		}
		clearTimeout(oTimerId);
		oTimerId = setTimeout(function() {
			if ( oLogViewer ) {
				oLogViewer.setFilter(oFilter);
			}
		}, 200);
	}

	function clearLogFilter() {
		document.getElementById("filterString").value = "";
		oLogViewer.setFilter();
	}

	function setLogLevel(oEvent) {
		var iLevel = parseInt(oEvent.target.value);
		if ( !isNaN(iLevel) && oLogViewer ) {
			oLogViewer.setLogLevel(iLevel);
		}
	}

	function clearLog(event) {
		if ( oLogViewer ) {
			if ( event.shiftKey === true ) {
				oLogViewer.fillFromLogger(0);
			} else {
				oLogViewer.truncate();
			}
		}
	}

	document.getElementById("loglevel").addEventListener("change", setLogLevel);
	document.getElementById("clear").addEventListener("click", clearLog);
	document.getElementById("filterString").addEventListener("keyup", setLogFilter);
	document.getElementById("resetFilter").addEventListener("click", clearLogFilter);

});
