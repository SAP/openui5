sap.ui.define([
], function() {
	"use strict";

	const aPropertyInfos = [{
		key: "numberWords",
		label: "Number of words",
		visible: true,
		path: "numberWords",
		dataType:"sap.ui.model.type.Integer",
		maxConditions: 1
	},{
		key: "descr",
		label: "Description",
		visible: true,
		path: "descr",
		dataType: "sap.ui.model.type.String"
	},{
		key: "status",
		label: "Status",
		visible: true,
		path: "status",
		dataType: "sap.ui.model.type.String"
	}];

	return aPropertyInfos;
});
