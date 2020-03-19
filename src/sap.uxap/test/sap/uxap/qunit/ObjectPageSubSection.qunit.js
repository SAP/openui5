/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/base/Log",
	"sap/uxap/library",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSectionBase",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/BlockBase",
	"sap/uxap/ObjectPageLayout",
	"sap/m/Label",
	"sap/m/Button"],
function($, Core, Log, Lib, ObjectPageDynamicHeaderTitle, ObjectPageSection, ObjectPageSectionBase, ObjectPageSubSectionClass, BlockBase, ObjectPageLayout, Label, Button) {
	"use strict";

	var aStandardModeConfig = [{
		"configString": "a-1",
		"expectedBlockConfig": [[12, 6, 8, 9, false, false, false, false], [12, 6, 4, 3, false, false, false, false]]
	}, {
		"configString": "a-2",
		"expectedBlockConfig": [[12, 12, 4, 6, false, false, false, false], [12, 12, 8, 6, false, true, false, false]]
	}, {
		"configString": "a-3",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false]]
	}, {
		"configString": "1-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 9, false, false, false, false]]
	}, {
		"configString": "2-a",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 12, 4, 6, false, true, false, false]]
	}, {
		"configString": "3-a",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-a-1",
		"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false]]
	}, {
		"configString": "a-a-2",
		"expectedBlockConfig": [[12, 6, 8, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false]]
	}, {
		"configString": "1-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false]]
	}, {
		"configString": "1-a-2",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false]]
	}, {
		"configString": "2-a-a",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
	}, {
		"configString": "2-a-1",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "2-1-a",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
	}, {
		"configString": "a-a-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "a-a-a-2",
		"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, true]]
	}, {
		"configString": "a-1-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "1-a-1-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
	}, {
		"configString": "1-a-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "a-2-a-1",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true]]
	}, {
		"configString": "a-2-a-2",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 12, 4, 3, false, true, true, false], [12, 12, 8, 6, false, true, false, true]]
	}, {
		"configString": "2-a-a-2",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 6, false, true, false, true]]
	}, {
		"configString": "3-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true]]
	}, {
		"configString": "2-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 12, 4, 6, false, true, false, true], [12, 12, 8, 6, false, true, true, false]]
	}, {
		"configString": "3-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 6, false, false, false, true], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "3-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, false]]
	}, {
		"configString": "a-a-1-1-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 12, false, true, false, true]]
	}, {
		"configString": "a-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true]]
	}, {
		"configString": "a-3-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 8, 3, false, true, true, true], [12, 6, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false]]
	}, {
		"configString": "a-2-a-a-1",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 9, false, false, false, true], [12, 6, 4, 3, false, true, false, false]]
	}, {
		"configString": "a-2-a-a-2",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 6, false, false, false, true], [12, 12, 8, 6, false, true, true, false]]
	}, {
		"configString": "a-1-a-1-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 12, false, true, false, true]]
	}, {
		"configString": "a-1-a-2-a",
		"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, true], [12, 12, 4, 6, false, true, false, false]]
	}, {
		"configString": "a-2-a-1-a",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 4, 9, false, true, false, false]]
	}, {
		"configString": "a-3-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 4, 6, false, true, true, true], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false]]
	}, {
		"configString": "1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true]]
	}, {
		"configString": "1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 12, false, true, false, true]]
	}, {
		"configString": "1-a-2-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "1-a-3-a-2",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 9, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 4, 3, false, true, true, false], [12, 12, 8, 6, false, true, false, true]]
	}, {
		"configString": "2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 6, false, true, false, true], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 12, 9, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
	}, {
		"configString": "1-a-a-a-a-3",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 12, 4, 3, false, true, false, true], [12, 12, 12, 9, false, true, true, false]]
	}, {
		"configString": "a-a-a-1-a-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
	}, {
		"configString": "a-a-a-2-a-a",
		"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, true], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
	}, {
		"configString": "a-a-1-a-a-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
	}, {
		"configString": "a-a-2-a-a-a",
		"expectedBlockConfig": [[12, 6, 8, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false], [12, 6, 4, 6, false, true, false, true], [12, 6, 8, 3, false, false, true, false], [12, 12, 4, 3, false, true, false, false]]
	}, {
		"configString": "a-a-3-a-a-a",
		"expectedBlockConfig": [[12, 6, 8, 9, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 9, false, false, false, true], [12, 12, 4, 3, false, true, false, false]]
	}, {
		"configString": "a-1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true], [12, 6, 4, 9, false, false, false, false]]
	}, {
		"configString": "a-2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 8, 6, false, true, true, false], [12, 12, 4, 3, false, true, false, false]]
	}, {
		"configString": "a-3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 8, 9, false, true, true, true], [12, 6, 4, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
	}, {
		"configString": "a-2-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 6, false, false, false, true], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
	}, {
		"configString": "a-1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
	}, {
		"configString": "a-2-a-2-a-2",
		"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 12, 4, 3, false, true, true, false], [12, 12, 8, 6, false, true, false, true], [12, 12, 4, 6, false, true, true, false], [12, 12, 8, 6, false, true, false, true]]
	}, {
		"configString": "a-3-a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 12, 4, 3, false, true, true, true], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true]]
	}],
	aTwoColumnInLConfig = [{
		"configString": "a-1",
		"expectedBlockConfig": [[12, 6, 6, 9, false, false, false, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-2",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "a-3",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false]]
	}, {
		"configString": "1-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, false, false, false]]
	}, {
		"configString": "2-a",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "3-a",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false]]
	}, {
		"configString": "a-a-2",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false]]
	}, {
		"configString": "1-a-2",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "2-a-a",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "2-1-a",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-a-a-2",
		"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
	}, {
		"configString": "a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "1-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "1-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true]]
	}, {
		"configString": "a-2-a-2",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
	}, {
		"configString": "2-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, true]]
	}, {
		"configString": "3-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true]]
	}, {
		"configString": "2-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "3-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 6, false, false, false, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "3-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "a-a-1-1-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true]]
	}, {
		"configString": "a-3-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 6, 3, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "a-2-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 9, false, false, false, true], [12, 6, 6, 3, false, true, true, false]]
	}, {
		"configString": "a-2-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 6, false, false, false, true], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "a-1-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-1-a-2-a",
		"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "a-2-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 9, false, true, true, false]]
	}, {
		"configString": "a-3-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 6, 6, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true]]
	}, {
		"configString": "1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-2-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "1-a-3-a-2",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
	}, {
		"configString": "2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false]]
	}, {
		"configString": "3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 9, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "1-a-a-a-a-3",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, true], [12, 12, 12, 9, false, true, true, false]]
	}, {
		"configString": "a-a-a-1-a-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-a-a-2-a-a",
		"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-a-1-a-a-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-a-2-a-a-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 6, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-a-3-a-a-a",
		"expectedBlockConfig": [[12, 6, 6, 9, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 9, false, false, false, true], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true], [12, 6, 6, 9, false, false, false, false]]
	}, {
		"configString": "a-2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
	}, {
		"configString": "a-1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-2-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 6, false, false, false, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
	}, {
		"configString": "a-2-a-2-a-2",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
	}, {
		"configString": "a-3-a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 12, 12, 3, false, true, true, true], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true]]
	}],
	aTitleOnTheLeftConfig = [{
		"configString": "a-1",
		"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-3",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false]]
	}, {
		"configString": "2-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false]]
	}, {
		"configString": "a-a-2",
		"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false]]
	}, {
		"configString": "1-a-2",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "2-a-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
	}, {
		"configString": "2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "2-1-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
	}, {
		"configString": "a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "a-a-a-2",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "1-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
	}, {
		"configString": "1-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-2-a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "2-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "3-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 6, 6, 4, false, true, true, false]]
	}, {
		"configString": "2-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "3-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "3-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-a-1-1-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 6, 6, 4, false, true, true, false]]
	}, {
		"configString": "a-3-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-2-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false]]
	}, {
		"configString": "a-2-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-1-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-1-a-2-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-2-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-3-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 6, 6, 4, false, true, true, false]]
	}, {
		"configString": "1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "1-a-2-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "1-a-3-a-2",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "1-a-a-a-a-3",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-a-a-1-a-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-a-a-2-a-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
	}, {
		"configString": "a-a-1-a-a-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-a-2-a-a-a",
		"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-a-3-a-a-a",
		"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-2-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
	}, {
		"configString": "a-1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
	}, {
		"configString": "a-2-a-2-a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-3-a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false]]
	}],
	aTitleOnTheLeftConfigAndTwoColumnInL = [{
		"configString": "a-1",
		"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-3",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false]]
	}, {
		"configString": "2-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-a-2",
		"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "1-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false]]
	}, {
		"configString": "1-a-2",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "2-a-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
	}, {
		"configString": "2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "2-1-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
	}, {
		"configString": "a-a-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "a-a-a-2",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-1-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "1-a-1-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
	}, {
		"configString": "1-a-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-2-a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "2-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "3-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 6, 12, 4, false, true, true, false]]
	}, {
		"configString": "2-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "3-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "3-a-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-a-1-1-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 6, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-3-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-2-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-2-a-a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
	}, {
		"configString": "a-1-a-1-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-1-a-2-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-2-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-3-a-1-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 6, 12, 4, false, true, true, false]]
	}, {
		"configString": "1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "1-a-2-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "1-a-3-a-2",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "1-a-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "1-a-a-a-a-3",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-a-a-1-a-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-a-a-2-a-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
	}, {
		"configString": "a-a-1-a-a-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-a-2-a-a-a",
		"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-a-3-a-a-a",
		"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-1-a-a-1-a",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-2-a-a-2-a",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
	}, {
		"configString": "a-3-a-a-3-a",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
	}, {
		"configString": "a-1-a-a-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-2-a-a-a-1",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
	}, {
		"configString": "a-1-a-1-a-1",
		"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
	}, {
		"configString": "a-2-a-2-a-2",
		"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
	}, {
		"configString": "a-3-a-2-a-1",
		"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false]]
	}];

	var ObjectPageSubSection = ObjectPageSubSectionClass.prototype,
		sConfiguration = "BlockLayout Configuration - ",
		aPropertyTypes = ["span", "linebreak"],
		aScreenTypes = ["S", "M", "L", "XL"],
		oHelpers = {
			getBlock: function (sColumnLayout) {
				return new BlockBase({
					columnLayout: sColumnLayout
				});
			},
			getSubSection: function () {
				return new ObjectPageSubSectionClass();
			},
			getLayoutProviderStub: function (bTwoColumnLayout) {
				return {getUseTwoColumnsForLargeScreen: sinon.stub().returns(bTwoColumnLayout)};
			},
			generateLayoutConfigTests: function (sTitleConfig, bUseTwoColumnLayoutL, aModeConfig) {
				QUnit.test("Generates correct layout Configuration", function (assert) {
					var oLayoutProviderStub = oHelpers.getLayoutProviderStub(bUseTwoColumnLayoutL),
						oActualLayout = ObjectPageSubSection._calculateLayoutConfiguration(sTitleConfig, oLayoutProviderStub);

					assert.propEqual(oActualLayout, this.oLayoutConfig);
				});

				aModeConfig.forEach(oHelpers.generateBlockTest);
			},
			getBlocksByConfigString: function (sConfig) {
				return sConfig.split("-").map(this.getBlockFromChar, this);
			},
			getBlockFromChar: function (char) {
				return char === "a" ? this.getBlock("auto") : this.getBlock(char);
			},
			callGetter: function (object, propertyName) {
				return object["get" + propertyName[0].toUpperCase() + propertyName.slice(1)]();
			},
			convertToLayoutObject: function (oLayoutData, aProperties) {
				var resultObject = {};
				aProperties.forEach(function (sProperty) {
					resultObject[sProperty] = this.callGetter(oLayoutData, sProperty);
				}, this);

				return resultObject;
			},
			generateProperties: function (aPropTypes, aScreenTypes) {
				var aResult = [];

				aPropTypes.forEach(function (sPropType) {
					aScreenTypes.forEach(function (sScreenSize) {
						aResult.push(sPropType + sScreenSize);
					});
				});

				return aResult;
			},
			generateLayoutObject: function (aExpectedResult) {
				var resultObject = {};
				aExpectedResult.forEach(function (value, iIndex) {
					resultObject[aProperties[iIndex]] = value;
				});

				return resultObject;
			},
			generateBlockTest: function (oConfigToTest) {
				QUnit.test(sConfiguration + oConfigToTest.configString, function (assert) {
					var aBlocks = oHelpers.getBlocksByConfigString(oConfigToTest.configString);
					ObjectPageSubSection._calcBlockColumnLayout(aBlocks, this.oLayoutConfig);

					aBlocks.forEach(function (oBlock, iIndex) {
						var expected = oHelpers.generateLayoutObject(oConfigToTest.expectedBlockConfig[iIndex]),
							actual = oHelpers.convertToLayoutObject(oBlock.getLayoutData(), aProperties);

						assert.propEqual(actual, expected, "Block " + (iIndex + 1) + " configuration is correct");
					});
				});
			}
		},
		aProperties = oHelpers.generateProperties(aPropertyTypes, aScreenTypes);

	QUnit.module("Object Page SubSection - blocks aggregation");

	QUnit.test("Generates correct layout Configuration", function (assert) {
		var oSubSection = oHelpers.getSubSection(),
			oBlock1 = oHelpers.getBlock(),
			oBlock2 = oHelpers.getBlock(),
			iBlockCount = 0,
			iBlock2ExpectedIndex = 1;

		// Assert default.
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: add a block.
		oSubSection.addBlock(oBlock1);
		iBlockCount++;

		// Assert: check if the block is added
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: insert a block (index = 0)
		oSubSection.insertBlock(oBlock2, 0);
		iBlockCount++;

		// Assert: check if the block is added.
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");
		// Assert: check if the block is added to the end although it is being inserted at index 0.
		assert.equal(oSubSection.indexOfBlock(oBlock2), iBlock2ExpectedIndex,
			"There inserted block is added to the end of the blocks aggregation.");

		oSubSection.removeAllBlocks();
		iBlockCount = 0;
		assert.equal(oSubSection.getBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		oSubSection.destroy();
	});

	QUnit.test("removeAggregation", function (assert) {
		var sXmlView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:uxap="sap.uxap" xmlns:m="sap.m">' +
							'<uxap:ObjectPageLayout id="page">' +
								'<uxap:headerTitle>' +
									'<uxap:ObjectPageHeader objectTitle="Title" objectSubtitle="Subtitle">' +
										'<uxap:actions>' +
											'<m:Button press="doSomething" text="Remove Button"/>' +
										'</uxap:actions>' +
										'<uxap:breadCrumbsLinks/>' +
										'<uxap:navigationBar/>' +
									'</uxap:ObjectPageHeader>' +
								'</uxap:headerTitle>' +
								'<uxap:sections>' +
									'<uxap:ObjectPageSection showTitle="true" title="Page Section Title" titleUppercase="true" visible="true">' +
										'<uxap:subSections>' +
											'<uxap:ObjectPageSubSection id="subSection" title="Sub Section Title" mode="Expanded">' +
												'<uxap:blocks>' +
													'<m:Button id="buttonToRemove" text="Button" type="Default" iconFirst="true" width="auto" enabled="true" visible="true" iconDensityAware="false"/>' +
													'<m:SegmentedButton width="auto" enabled="true" visible="true">' +
														'<m:items>' +
															'<m:SegmentedButtonItem icon="sap-icon://taxi" text="Button" width="auto" enabled="true"/>' +
															'<m:SegmentedButtonItem icon="sap-icon://lab" text="Button" width="auto" enabled="true"/>' +
															'<m:SegmentedButtonItem icon="sap-icon://competitor" text="Button" width="auto" enabled="true"/>' +
														'</m:items>' +
													'</m:SegmentedButton>' +
												'</uxap:blocks>' +
												'<uxap:moreBlocks/>' +
												'<uxap:actions/>' +
											'</uxap:ObjectPageSubSection>' +
										'</uxap:subSections>' +
									'</uxap:ObjectPageSection>' +
								'</uxap:sections>' +
							'</uxap:ObjectPageLayout>' +
						'</mvc:View>',
			oView = sap.ui.xmlview({viewContent: sXmlView}),
			oSubSection = oView.byId("subSection"),
			oButton = oView.byId("buttonToRemove");

		oView.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oSubSection.getBlocks().length, 2, "subSection has two blocks");

		// act
		var oResult = oSubSection.removeAggregation("blocks", oButton);

		// assert
		assert.strictEqual(oResult, oButton, "removeAggregation returns the removed control");
		assert.strictEqual(oSubSection.getBlocks().length, 1, "subSection has only one block left");

		oSubSection.destroy();
		oButton.destroy();
	});

	QUnit.test("addAggregation", function (assert) {
		var oSubSection = new ObjectPageSubSectionClass({
				blocks: [new sap.m.Text({text: "sample"})]
			}),
			opl = new ObjectPageLayout({
				sections: [
					new ObjectPageSection({
						subSections: [
							oSubSection
						]
					})
				]
			}),
		oSandbox = sinon.sandbox.create(),
		oSpy = oSandbox.spy(Log, "error"),
		done = assert.async();

		opl.addEventDelegate({
			onAfterRendering: function() {
				oSpy.reset();
				oSubSection.addBlock(new BlockBase());
				oSubSection._applyLayout(opl);
				assert.equal(oSpy.callCount, 0, "no error on adding block");
				done();
				oSubSection.removeAllDependents();
				opl.destroy();
				oSandbox.restore();
			}
		});

		new sap.m.App({pages: [opl]}).placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.module("Object Page SubSection - moreBlocks aggregation");

	QUnit.test("Generates correct layout Configuration", function (assert) {
		var oSubSection = oHelpers.getSubSection(),
			oBlock1 = oHelpers.getBlock(),
			oBlock2 = oHelpers.getBlock(),
			iBlockCount = 0,
			iBlock2ExpectedIndex = 1,
			aSeeMoreButtonLabels = oSubSection._getSeeMoreButton().getAriaLabelledBy(),
			sSubSectionId = oSubSection.getId();

		// Assert default.
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: add a block.
		oSubSection.addMoreBlock(oBlock1);
		iBlockCount++;
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		// Act: insert a block (index = 0).
		oSubSection.insertMoreBlock(oBlock2, 0);
		iBlockCount++;
		// Assert: check if the block is added.
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");
		// Assert: check if the block is added to the end although it is being inserted at index 0.
		assert.equal(oSubSection.indexOfMoreBlock(oBlock2), iBlock2ExpectedIndex,
			"There inserted block is added to the end of the blocks aggregation.");

		assert.ok(aSeeMoreButtonLabels.indexOf(sSubSectionId) > -1, "See more button is labelled correctly.");

		oSubSection.removeAllMoreBlocks();
		iBlockCount = 0;
		assert.equal(oSubSection.getMoreBlocks().length, iBlockCount, "There are: " + iBlockCount + " blocks.");

		oSubSection.destroy();
	});

	QUnit.module("Object Page SubSection - Managing Block Layouts in Standard Mode", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 3, XL: 4};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnTop", false, aStandardModeConfig);

	QUnit.module("Object Page SubSection - Managing Block Layouts in two column layout in L", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 2, XL: 4};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnTop", true, aTwoColumnInLConfig);

	QUnit.module("Object Page SubSection - Managing Block With Title On The Left", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 2, XL: 3};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnLeft", false, aTitleOnTheLeftConfig);

	QUnit.module("Object Page SubSection - Managing Block With Title On The Left and two column layout in L", {
		beforeEach: function () {
			this.oLayoutConfig = {M: 2, L: 1, XL: 3};
		}
	});

	oHelpers.generateLayoutConfigTests("TitleOnLeft", true, aTitleOnTheLeftConfigAndTwoColumnInL);

	QUnit.module("Object Page SubSection - subSectionLayout prop");

	QUnit.test("SubSection Header is with title on the LEFT", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({
				subSectionLayout: Lib.ObjectPageSubSectionLayout.TitleOnLeft,
				sections: [
					new ObjectPageSection({
						title:"Personal",
						subSections: [
							new ObjectPageSubSectionClass({
								title: "Connect",
								blocks: new Label({text: "Block1" })
							}),
							new ObjectPageSubSectionClass({
								title: "Payment information",
								blocks: new Label({text: "Block1" })
							})
						]
					})
				]
			}),
			oSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];


		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();


		assert.ok(oSubSection.$("header").hasClass("titleOnLeftLayout"), "SubSection header has class titleOnLeftLayout");

		oObjectPageLayout.destroy();
	});

	QUnit.test("SubSection Header is with title on TOP", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({
					sections: [
						new ObjectPageSection({
							title:"Personal",
							subSections: [
								new ObjectPageSubSectionClass({
									title: "Connect",
									blocks: new Label({text: "Block1" })
								}),
								new ObjectPageSubSectionClass({
									title: "Payment information",
									blocks: new Label({text: "Block1" })
								})
							]
						})
					]
				}),
				oSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];


		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();


		assert.notOk(oSubSection.$("header").hasClass("titleOnLeftLayout"), "SubSection header has no titleOnLeftLayout class");

		oObjectPageLayout.destroy();
	});

	QUnit.test("SubSection action buttons visibility", function (assert) {
		var oActionButton1 = new Button({text: "Invisible", visible: false}),
			oActionButton2 = new Button({text: "Invisible", visible: false}),
			oObjectPageLayout = new ObjectPageLayout({
					sections: [
						new ObjectPageSection({
							title:"Personal",
							subSections: [
								new ObjectPageSubSectionClass({
									actions: [oActionButton1],
									blocks: new Label({text: "Block1" })
								}),
								new ObjectPageSubSectionClass({
									title: "Payment information",
									actions: [oActionButton2],
									blocks: new Label({text: "Block1" })
								})
							]
						})
					]
				}),
				oSubSection1 = oObjectPageLayout.getSections()[0].getSubSections()[0],
				oSubSection2 = oObjectPageLayout.getSections()[0].getSubSections()[1];

		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();

		//assert
		assert.ok(oSubSection1.$("header").hasClass("sapUiHidden"), "SubSection header with no visisble title and actions should be invisible");
		assert.notOk(oSubSection2.$("header").hasClass("sapUiHidden"), "SubSection header with title and no visible actions should be visible");

		//act
		oActionButton1.setVisible(true);
		oSubSection2.setTitle("");
		Core.applyChanges();

		//assert
		assert.notOk(oSubSection1.$("header").hasClass("sapUiHidden"), "SubSection header with visible actions should become visible");
		assert.ok(oSubSection2.$("header").hasClass("sapUiHidden"), "SubSection header with no visisble title and actions should become invisible");

		oObjectPageLayout.destroy();
	});

	QUnit.module("Object Page SubSection media classes", {
		beforeEach: function () {
			this.oObjectPageLayout = new ObjectPageLayout({
				selectedSection: "section2",
				sections: [
					new ObjectPageSection("section1", {
						title: "section 1",
						subSections: [
							new ObjectPageSubSectionClass({
								title:"subsection 1",
								blocks: [
									new Button({ text: 'notext' })
								]
							})
						]
					}),
					new ObjectPageSection("section2", {
						title: "section 2",
						subSections: [
							new ObjectPageSubSectionClass({
								id: "subsection2",
								title:"subsection 2",
								blocks: [
									new Button({ text: 'notext' })
								]
							})
						]
					})
				]
			});
			this.fnOnScrollSpy = sinon.spy(this.oObjectPageLayout, "_onScroll");
			this.oObjectPageLayout.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test(".sapUxAPSubSectionSeeMoreContainer class is toggled correctly", function(assert) {
		// Arrange
		var oSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0],
			oChildrenSpy = sinon.spy($.fn, "children"),
			oSectionBaseSpy = sinon.spy(ObjectPageSectionBase.prototype, "_updateShowHideState");

		// Act
		oSubSection._updateShowHideState(true);

		// Assert
		assert.ok(oChildrenSpy.calledWith(".sapUxAPSubSectionSeeMoreContainer"),
			"Visibility of children with .sapUxAPSubSectionSeeMoreContainer is toggled");
		assert.ok(oSectionBaseSpy.calledWith(true), "_updateShowHideState method of ObjectPageSectionBase is called");

		oChildrenSpy.reset();

		// Act
		oSubSection._updateShowHideState(true);
		assert.ok(oChildrenSpy.notCalled,
			"Visibility of children with .sapUxAPSubSectionSeeMoreContainer is not toggled when there is no change in visibility");
	});

	QUnit.test(".sapUxAPObjectPageSubSectionWithSeeMore is applied to SubSections correctly", function(assert) {
		// Arrange
		var oSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0];

		// Act
		oSubSection.addMoreBlock(oHelpers.getBlock());
		Core.applyChanges();

		// Assert
		assert.ok(oSubSection.$().hasClass("sapUxAPObjectPageSubSectionWithSeeMore"),
			".sapUxAPObjectPageSubSectionWithSeeMore class is added to SubSection with more blocks");
	});

	QUnit.test("Content scrollTop is preserved on section rerendering", function(assert) {
		// note that selected section is the last visible one
		var oLastSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0],
		oObjectPageLayout = this.oObjectPageLayout,
		fnOnScrollSpy =	this.fnOnScrollSpy,
		done = assert.async(),
		iReRenderingCount = 0,
		iScrollTop;

		assert.expect(1);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// save the scrollTop position
			iScrollTop = oObjectPageLayout._$opWrapper.scrollTop();

			//act
			//makes a change that causes invalidates of the subsection and anchorBar
			oLastSubSection.setTitle("changed");

			oLastSubSection.addEventDelegate({ onAfterRendering: function() {
				iReRenderingCount++;
				// we are interested in the second rerendering
				// (there are two rerenderings because two properties of the oLastSubSection (title and internal title)
				// are changed but at different stages
				// where the second invalidation happens internally in applyUXRules)
				if (iReRenderingCount < 2) {
					return;
				}
				setTimeout(function() {
					assert.equal(fnOnScrollSpy.alwaysCalledWithMatch({target: {scrollTop: iScrollTop}}), true, "the correct scroll top is preserved");
					done();
				}, 0);
			}});
		});
	});

    QUnit.module("SubSection access to parent ObjectPage", {
        beforeEach: function () {
            this.oObjectPageLayout = new ObjectPageLayout({
                sections: [
                    new ObjectPageSection("section1", {
                        title: "section 1",
                        subSections: [
                            new ObjectPageSubSectionClass({
                                title:"subsection 1",
                                blocks: [
                                    new Button({ text: 'notext' })
                                ]
                            })
                        ]
                    })
                ]
            });
            this.oObjectPageLayout.placeAt('qunit-fixture');
            Core.applyChanges();
        },
        afterEach: function () {
            this.oObjectPageLayout.destroy();
        }
    });

    QUnit.test("No error when accessing a property of parent ObjectPage", function(assert) {
        // note that selected section is the last visible one
        var oSection = this.oObjectPageLayout.getSections()[0],
            oSubSection;

        //act
        oSubSection = oSection.removeSubSection(0);

        assert.ok(!oSubSection._getUseTitleOnTheLeft(), "falsy value is returned");
    });

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.ObjectPageSectionView = sap.ui.xmlview("UxAP-13_objectPageSection", {
				viewName: "view.UxAP-13_ObjectPageSection"
			});

			this.ObjectPageSectionView.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

    QUnit.test("Test aria-labelledby attribute", function(assert) {
		var oSubSectionWithoutTitle = this.ObjectPageSectionView.byId("subsection6"),
			oSubSectionWithTitle = this.ObjectPageSectionView.byId("subsection1"),
			sSubSectionWithTitleAriaLabelledBy = oSubSectionWithTitle.$().attr("aria-labelledby"),
			sSubSectionControlName = ObjectPageSubSectionClass._getLibraryResourceBundle().getText("SUBSECTION_CONTROL_NAME");

		assert.strictEqual(oSubSectionWithoutTitle.$().attr("aria-label"), sSubSectionControlName, "Subsections without titles should have aria-label='Subsection'");
		assert.strictEqual(oSubSectionWithTitle.getTitle(), document.getElementById(sSubSectionWithTitleAriaLabelledBy).innerText, "Subsection title is properly labelled");
	});

	QUnit.module("Title ID propagation");

	QUnit.test("_initTitlePropagationSupport is called on init", function (assert) {
		// Arrange
		var oSpy = sinon.spy(ObjectPageSubSectionClass.prototype, "_initTitlePropagationSupport"),
			oControl;

		// Act
		oControl = new ObjectPageSubSectionClass();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initTitlePropagationSupport called on init of control");
		assert.ok(oSpy.calledOn(oControl), "The spy is called on the tested control instance");

		// Cleanup
		oSpy.restore();
		oControl.destroy();
	});

	QUnit.test("_getTitleDomId and _setBorrowedTitleDomId", function (assert) {
		// Arrange
		var oSubSection = new ObjectPageSubSectionClass("TestSubSection");

		// Assert
		assert.strictEqual(oSubSection._getTitleDomId(), false, "By default the method should return false");

		// Act - set title
		oSubSection.setTitle("Test");

		// Assert
		assert.strictEqual(oSubSection._getTitleDomId(), "TestSubSection-headerTitle",
			"The internal SubSection title DOM ID should be returned");

		// Act - set internal title visible false
		oSubSection._setInternalTitleVisible(false);

		// Assert
		assert.strictEqual(oSubSection._getTitleDomId(), false,
			"If only internal title set to visible false method should return false");

		// Act - _setBorrowedTitleDomId
		oSubSection._setBorrowedTitleDomId("TestID");

		// Assert
		assert.strictEqual(oSubSection._getTitleDomId(), "TestID",
			"The previously set Borrowed Title DOM ID should be returned");
	});

	QUnit.module("Content fit container", {
		beforeEach: function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: [ new ObjectPageSection({
					subSections: [new ObjectPageSubSectionClass({
						blocks: [ new sap.m.Panel({ height: "100%" })]
					})]
				})]
			});

			this.oObjectPage.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer expands the subSection to fit the container", function (assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			done = assert.async();

		//act
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			var iViewportHeight = oPage._getScrollableViewportHeight(false),
				iOffsetTop = oSubSection.$().position().top,
				iExpectedSubSectionHeight = Math.round(iViewportHeight - iOffsetTop);
			assert.ok(oSubSection.$().height(), iExpectedSubSectionHeight, "_setHeight is called");
			done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer expands the subSection with padding to fit the container any theme", function (assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			done = assert.async();

		//act
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);


		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			var iViewportHeight = oPage._getScrollableViewportHeight(false),
				iOffsetTop = oSubSection.$().position().top,
				iExpectedSubSectionHeight = Math.round(iViewportHeight - iOffsetTop);

			oSubSection.getDomRef().style.paddingTop = "20px";
			oPage._requestAdjustLayout(true);
			// check height
			assert.strictEqual(oSubSection.getDomRef().offsetHeight, iExpectedSubSectionHeight, "correct height");
			done();

		}, this);
	});

	QUnit.test("single subSection with sapUxAPObjectPageSubSectionFitContainer no scrolling", function (assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			done = assert.async();

		//act
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			function isPageScrollable() {
				return oPage._$opWrapper.get(0).scrollHeight > oPage._$opWrapper.get(0).offsetHeight;
			}
			assert.strictEqual(isPageScrollable(), false, "no scrolling when single subsection fits container");
			done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer class can be added late", function (assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			oSpy = sinon.spy(oPage, "_requestAdjustLayoutAndUxRules"),
			done = assert.async();

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy.reset();

			//act
			oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

			//check
			assert.strictEqual(oSpy.called, true, "_requestAdjustLayoutAndUxRules is called");
			done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer with dynamic header title - no scroll when only one SubSection",
		function (assert) {
			// Set-up
			var oPage = this.oObjectPage,
				oSection = this.oObjectPage.getSections()[0],
				oSubSection = oSection.getSubSections()[0],
				oToggleScrollingSpy = sinon.spy(oPage, "_toggleScrolling"),
				oComputerSpacerHeightSpy = sinon.spy(oPage, "_computeSpacerHeight"),
				done = assert.async();

			assert.expect(5);

			// Аct
			oPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

			oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// Assert
				assert.strictEqual(oPage._bAllContentFitsContainer, true, "_bAllContentFitsContainer is 'true'");
				assert.ok(oToggleScrollingSpy.calledWith(false), "oToggleScrollingSpy called with 'false' - scrolling is supressed");
				assert.strictEqual(oPage._$opWrapper.css("overflow-x"), "hidden", "Wrapper's overflow property is 'hidden'");
				assert.strictEqual(oComputerSpacerHeightSpy.args[0][2], false,
					"oComputerSpacerHeightSpy called with bAllowScrollSectionToTop = false");
				assert.ok(parseInt(oSubSection.$().css("height")) < oPage._getSectionsContainerHeight(false),
					"With content fit container no scrollbar is needed");
				done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer with tabs - snap without scroll when only one SubSection",
		function (assert) {
			// Set-up
			var oPage = this.oObjectPage,
				oSection1 = this.oObjectPage.getSections()[0],
				oSection1SubSection1 = oSection1.getSubSections()[0],
				oSection2SubSection1 = new ObjectPageSubSectionClass({ blocks: [ new sap.m.Panel({ height: "100px" })]}),
				oSection2SubSection2 = new ObjectPageSubSectionClass({ blocks: [ new sap.m.Panel({ height: "100px" })]}),
				oSection2 = new ObjectPageSection({ subSections: [oSection2SubSection1, oSection2SubSection2]}),
				oToggleScrollingSpy = sinon.spy(oPage, "_toggleScrolling"),
				iSnapPosition,
				done = assert.async();

			assert.expect(5);

			oPage.setUseIconTabBar(true);
			oPage.addSection(oSection2);
			oPage.setSelectedSection(oSection2.getId());
			oSection1SubSection1.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

			oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				iSnapPosition = oPage._getSnapPosition();
				oPage._$opWrapper.scrollTop(iSnapPosition + 1); // snap the header with scroll
				oPage._onScroll({ target : { scrollTop: iSnapPosition + 1}}); // process the scroll synchronously
				assert.strictEqual(oPage._bHeaderExpanded, false, "header is snapped");

				// Act: select the section with non-scrollable content
				oPage.setSelectedSection(oSection1.getId());

				// Assert
				assert.strictEqual(oPage._bAllContentFitsContainer, true, "_bAllContentFitsContainer is 'true'");
				assert.strictEqual(oPage._bHeaderExpanded, false, "header is still snapped");
				assert.ok(oToggleScrollingSpy.calledWith(false), "oToggleScrollingSpy called with 'false' - scrolling is supressed");
				assert.strictEqual(oPage._$opWrapper.css("overflow-x"), "hidden", "Wrapper's overflow property is 'hidden'");
				done();
			}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer with tabs - switch to snap with scroll",
		function (assert) {
			// Set-up
			var oPage = this.oObjectPage,
				oSection1 = this.oObjectPage.getSections()[0],
				oSection1SubSection1 = oSection1.getSubSections()[0],
				oSection2SubSection1 = new ObjectPageSubSectionClass({ blocks: [ new sap.m.Panel({ height: "100px" })]}),
				oSection2SubSection2 = new ObjectPageSubSectionClass({ blocks: [ new sap.m.Panel({ height: "100px" })]}),
				oSection2 = new ObjectPageSection({ subSections: [oSection2SubSection1, oSection2SubSection2]}),
				oToggleScrollingSpy = sinon.spy(oPage, "_toggleScrolling"),
				done = assert.async();

			assert.expect(5);

			oPage.setUseIconTabBar(true);
			oPage.addSection(oSection2);
			oSection1SubSection1.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

			oPage.attachEventOnce("onAfterRenderingDOMReady", function() {

				oPage._snapHeader(false);
				assert.strictEqual(oPage._bHeaderExpanded, false, "header is snapped");

				// Act: select the section with scrollable content
				oPage.setSelectedSection(oSection2.getId());

				// Assert
				assert.strictEqual(oPage._bAllContentFitsContainer, false, "_bAllContentFitsContainer is 'true'");
				assert.strictEqual(oPage._bHeaderExpanded, false, "header is still snapped");
				assert.ok(oToggleScrollingSpy.calledWith(true), "oToggleScrollingSpy called with 'true' - scrolling is supressed");
				assert.ok(oPage._$opWrapper.scrollTop() >= oPage._getSnapPosition(), "header is snapped with scroll");
				done();
			}, this);
	});

	QUnit.module("Invalidation", {
		beforeEach: function() {
			this.oObjectPageLayout = new ObjectPageLayout("page", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSectionClass({
							title: "Title",
							blocks: [new sap.m.Panel({ height: "100%" })]
						})
					]
				})
			});
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("applyUxRules", function (assert) {

		// Setup
		var oSubSection = this.oObjectPageLayout.getSections()[0].getSubSections()[0],
			oInvalidateSpy = sinon.spy(oSubSection, "invalidate"),
			done = assert.async();

		assert.expect(1);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Check
			assert.equal(oInvalidateSpy.callCount, 0, "subSection is not invalidated");
			done();
		}, this);

		this.oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();
		// Act
		this.oObjectPageLayout._applyUxRules(true);
	});

	QUnit.module("SubSection title visibility", {
		beforeEach: function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSectionClass({
							title: "Title",
							showTitle: false,
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSectionClass({
							title: "Title",
							showTitle: false,
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

			this.oObjectPage.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("SubSection without title has no title", function (assert) {
		var $section;

		$section = this.oObjectPage.getSections()[0].getSubSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSubSectionHeader').length, 0, "subsection has no title");

		this.oObjectPage.destroy();
	});
});
