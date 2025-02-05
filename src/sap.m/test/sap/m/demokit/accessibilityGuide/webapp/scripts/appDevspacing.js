sap.ui.define("sapSuiteUICommons",[
	"sap/ui/core/Lib",
	"sap/base/Log"
], function(Library, Log){
        "use strict";
	Promise.all([
		Library.load("sap.suite.ui.commons")
	]).then(function() {
		sap.ui.require([
			"sap/suite/ui/commons/networkgraph/Graph"
		], function() {
			document.getElementById("network-graph").style.display = "block";
			document.getElementById("network-graph-link").style.display = "block";
			document.getElementById("network-graph-example").style.display = "block";
		}, function () {
			document.getElementById("network-graph").style.display = "none";
			document.getElementById("network-graph-link").style.display = "none";
			document.getElementById("network-graph-example").style.display = "none";
		});
	}).catch(function() {
		Log.error("Failed to load sap.suite.ui.commons.");
	});
});