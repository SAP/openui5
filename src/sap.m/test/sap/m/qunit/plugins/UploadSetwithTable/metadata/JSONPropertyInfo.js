sap.ui.define([
], function() {
	"use strict";

	const aPropertyInfos = [{
		key: "fileName",
		label: "File Name",
		visible: true,
		path: "fileName",
		dataType: "sap.ui.model.type.String",
		groupable: true
	},
	{
		key: "id",
		label: "ID",
		visible: true,
		path: "id",
		dataType: "sap.ui.model.type.Integer",
		groupable: true
	},
	{
		key: "revision",
		label: "Revision",
		visible: true,
		path: "revision",
		dataType: "sap.ui.model.type.Integer",
		groupable: true
	},
	{
		key: "status",
		label: "Status",
		visible: true,
		path: "status",
		dataType: "sap.ui.model.type.String",
		groupable: true
	},
	{
		key: "fileSize",
		label: "File Size",
		visible: true,
		path: "fileSize",
		dataType: "sap.ui.model.type.String"
	},
	{
		key: "lastModified",
		label: "Last Modified",
		visible: true,
		path: "lastModified",
		dataType: "sap.ui.model.type.Integer"
	},
	{
		key: "removeAction",
		label: "Remove Action",
		visible: true,
		path: "",
		dataType: "sap.ui.model.type.Boolean"
	}];

	return aPropertyInfos;
});
