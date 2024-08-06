/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/core/mvc/XMLView",
	"sap/base/Log",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSectionBase",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/BlockBase",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/library",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/core/HTML"
],
function(Element, nextUIUpdate, $, Control, coreLibrary, XMLView, Log, ObjectPageDynamicHeaderTitle, ObjectPageSection, ObjectPageSectionBase, ObjectPageSubSectionClass, BlockBase, ObjectPageLayout, library, App, Button, Label, Panel, Text, Title, HTML) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

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
					ObjectPageSubSection._assignLayoutData(aBlocks, this.oLayoutConfig);

					aBlocks.forEach(function (oBlock, iIndex) {
						var expected = oHelpers.generateLayoutObject(oConfigToTest.expectedBlockConfig[iIndex]),
							actual = oHelpers.convertToLayoutObject(oBlock.getLayoutData(), aProperties);

						assert.propEqual(actual, expected, "Block " + (iIndex + 1) + " configuration is correct");
					});
				});
			}
		},
		aProperties = oHelpers.generateProperties(aPropertyTypes, aScreenTypes);


	QUnit.module("ObjectPageSubSection - FitContainer Height Adaptation", {
		beforeEach: async function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: [new ObjectPageSection({
					subSections: [new ObjectPageSubSectionClass({
						blocks: [new Panel({ height: "100%" })]
					})]
				})]
			});

			this.oObjectPage.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("height of single subSection with sapUxAPObjectPageSubSectionFitContainer adjusts with headerTitle adjusments", async function(assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			oBlock = oSubSection.getBlocks()[0],
			done = assert.async();

		assert.expect(2);

		//act
		oBlock.setHeight("845px");
		oPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
			heading: new Title({ text: "Title" })
		}));
		await nextUIUpdate();
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			var sHeight = oSubSection._height;
			assert.strictEqual(sHeight, "", "Height is auto when content is bigger than SubSection's height");

			//act
			oPage.destroyHeaderTitle();

			oPage.attachEventOnce("onAfterRenderingDOMReady", function () {
				var sNewHeight = oSubSection._height;
				assert.ok(sHeight !== sNewHeight, "Fixed height is changed when headerTitle is added/removed");

				done();
			});
		}, this);
	});

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

	QUnit.test("Layout is updated when visibility of a Block is changed", async function(assert) {
		var oSubSection = oHelpers.getSubSection(),
			oObjectPageLayout = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						oSubSection
					]
				})
			}),
			oBlock1 = oHelpers.getBlock(),
			oBlock2 = oHelpers.getBlock(),
			oApplyLayoutSpy = this.spy(oSubSection, "_applyLayout"),
			oSpyObserverCallback = this.spy(oSubSection._oBlocksObserver, "_fnCallback"),
			oInnerGrid,
			oGridAddAggregationSpy;

		oSubSection.addBlock(oBlock1);
		oSubSection.addBlock(oBlock2);

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		oInnerGrid = oSubSection._getGrid();
		oGridAddAggregationSpy = this.spy(oInnerGrid, "addAggregation");

		// Act: change visibility of one of the blocks
		oBlock2.setVisible(false);

		// Assert: check if _onBlocksChange listener and _applyLayout are called
		assert.strictEqual(oSpyObserverCallback.callCount, 1, "_onBlocksChange is called once, when visibility of one of the blocks is changed");
		assert.strictEqual(oApplyLayoutSpy.callCount, 2, "_applyLayout is called from onBeforeRendering and _onBlocksChange");
		assert.ok(oGridAddAggregationSpy.notCalled, "addAggregation is not called to inner Grid when visibility of the blocks is changed");

		// Act - remove all blocks and change visibility again
		oSpyObserverCallback.resetHistory();
		oSubSection.removeAllBlocks();
		oBlock2.setVisible(true);

		// Assert: _onBlocksChange listener should not be called if block is removed and its visibility is changed
		assert.strictEqual(oSpyObserverCallback.callCount, 0, "_onBlocksChange is not called, when blocks are removed");

		// Clean up
		oSubSection.destroy();
	});

	QUnit.test("Layout is updated when visibility of unstashed block is changed", function (assert) {
		var oSubSection,
			oInnerGrid,
			oBlock,
			oGridAddAggregationSpy,
			oApplyLayoutSpy,
			oObserverCallbackSpy,
			done = assert.async();

		XMLView.create({
			id: "UxAP-12-ObjectPageSubSectionStashing",
			viewName: "view.UxAP-12-ObjectPageSubSectionStashing"
		}).then(async function(oView) {
			this.objectPageSampleView = oView;
			this.objectPageSampleView.placeAt('qunit-fixture');
			await nextUIUpdate();

			// Setup: pick a subSection and unstash its blocks
			oSubSection = this.objectPageSampleView.byId("subsection10");
			await oSubSection.connectToModelsAsync();
			await nextUIUpdate();

			oBlock = oSubSection.getBlocks()[0];
			oInnerGrid = oSubSection._getGrid();
			oGridAddAggregationSpy = this.spy(oInnerGrid, "addAggregation");
			oApplyLayoutSpy = this.spy(oSubSection, "_applyLayout");
			oObserverCallbackSpy = this.spy(oSubSection._oBlocksObserver, "_fnCallback");

			// Act
			oBlock.setVisible(false);

			// Assert: check if _onBlocksChange listener and _applyLayout are called
			assert.strictEqual(oObserverCallbackSpy.callCount, 1, "_onBlocksChange is called once, when visibility of one of the blocks is changed");
			assert.strictEqual(oApplyLayoutSpy.callCount, 1, "_applyLayout is called from onBeforeRendering and _onBlocksChange");
			assert.ok(oGridAddAggregationSpy.notCalled, "addAggregation is not called to inner Grid when visibility of the blocks is changed");

			// Act - remove all blocks and change visibility again
			oObserverCallbackSpy.resetHistory();
			oSubSection.removeAllBlocks();
			oBlock.setVisible(true);

			// Assert: _onBlocksChange listener should not be called if block is removed and its visibility is changed
			assert.strictEqual(oObserverCallbackSpy.callCount, 0, "_onBlocksChange is not called, after blocks are removed");
			done();
		}.bind(this));
	});


	QUnit.test("removeAggregation", function (assert) {
		var sXmlView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:uxap="sap.uxap" xmlns:m="sap.m">' +
							'<uxap:ObjectPageLayout id="page">' +
								'<uxap:headerTitle>' +
									'<uxap:ObjectPageHeader objectTitle="Title" objectSubtitle="Subtitle">' +
										'<uxap:actions>' +
											'<m:Button press="doSomething" text="Remove Button"/>' +
										'</uxap:actions>' +
										'<uxap:breadcrumbs/>' +
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
						'</mvc:View>';

		return XMLView.create({
			definition: sXmlView
		}).then(async function(oView) {

			var oSubSection = oView.byId("subSection"),
				oButton = oView.byId("buttonToRemove");

			oView.placeAt("qunit-fixture");
			await nextUIUpdate();

			assert.strictEqual(oSubSection.getBlocks().length, 2, "subSection has two blocks");

			// act
			var oResult = oSubSection.removeAggregation("blocks", oButton);

			// assert
			assert.strictEqual(oResult, oButton, "removeAggregation returns the removed control");
			assert.strictEqual(oSubSection.getBlocks().length, 1, "subSection has only one block left");

			oView.destroy();
		});
	});

	QUnit.test("addAggregation", async function(assert) {
		var oSubSection = new ObjectPageSubSectionClass({
				blocks: [new Text({text: "sample"})]
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
		oSpy = this.spy(Log, "error"),
		oSetParentSpy,
		done = assert.async();

		opl.addEventDelegate({
			onBeforeRendering: function () {
				oSetParentSpy = this.spy(Control.prototype, "setParent");
			}.bind(this)
		});

		opl.addEventDelegate({
			onAfterRendering: function() {
				oSpy.resetHistory();
				oSubSection.addBlock(new BlockBase());
				oSubSection._applyLayout(opl);
				assert.equal(oSpy.callCount, 0, "no error on adding block");
				assert.ok(oSetParentSpy.calledWith(oSubSection, "blocks"), "Control's setParent is called with ObjectPageSubSection");
				assert.strictEqual(oSubSection.getBlocks().length, 2, "ObjectPageSubSection has two controls in 'blocks' aggregation");
				done();
				oSubSection.removeAllDependents();
				opl.destroy();
			}
		});

		new App({pages: [opl]}).placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.module("Object Page SubSection - moreBlocks aggregation");

	QUnit.test("Generates correct layout Configuration", function (assert) {
		var oSubSection = oHelpers.getSubSection(),
			oBlock1 = oHelpers.getBlock(),
			oBlock2 = oHelpers.getBlock(),
			iBlockCount = 0,
			iBlock2ExpectedIndex = 1;

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

	QUnit.test("SubSection Header is with title on the LEFT", async function(assert) {
		var oObjectPageLayout = new ObjectPageLayout({
				subSectionLayout: library.ObjectPageSubSectionLayout.TitleOnLeft,
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
		await nextUIUpdate();


		assert.ok(oSubSection.$("header").hasClass("titleOnLeftLayout"), "SubSection header has class titleOnLeftLayout");

		oObjectPageLayout.destroy();
	});

	QUnit.test("SubSection Header is with title on TOP", async function(assert) {
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
		await nextUIUpdate();


		assert.notOk(oSubSection.$("header").hasClass("titleOnLeftLayout"), "SubSection header has no titleOnLeftLayout class");

		oObjectPageLayout.destroy();
	});

	QUnit.test("SubSection action buttons visibility", async function(assert) {
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
		await nextUIUpdate();

		//assert
		assert.ok(oSubSection1.$("header").hasClass("sapUiHidden"), "SubSection header with no visisble title and actions should be invisible");
		assert.notOk(oSubSection2.$("header").hasClass("sapUiHidden"), "SubSection header with title and no visible actions should be visible");

		//act
		oActionButton1.setVisible(true);
		oSubSection2.setTitle("");
		await nextUIUpdate();

		//assert
		assert.notOk(oSubSection1.$("header").hasClass("sapUiHidden"), "SubSection header with visible actions should become visible");
		assert.ok(oSubSection2.$("header").hasClass("sapUiHidden"), "SubSection header with no visisble title and actions should become invisible");

		oObjectPageLayout.destroy();
	});

	QUnit.module("Object Page SubSection media classes", {
		beforeEach: async function() {
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
			this.fnOnScrollSpy = this.spy(this.oObjectPageLayout, "_onScroll");
			this.oObjectPageLayout.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test(".sapUxAPSubSectionSeeMoreContainer class is toggled correctly", function(assert) {
		// Arrange
		var oSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0],
			oChildrenSpy = this.spy($.fn, "children"),
			oSectionBaseSpy = this.spy(ObjectPageSectionBase.prototype, "_updateShowHideState");

		// Act
		oSubSection._updateShowHideState(true);

		// Assert
		assert.ok(oChildrenSpy.calledWith(".sapUxAPSubSectionSeeMoreContainer"),
			"Visibility of children with .sapUxAPSubSectionSeeMoreContainer is toggled");
		assert.ok(oSectionBaseSpy.calledWith(true), "_updateShowHideState method of ObjectPageSectionBase is called");

		oChildrenSpy.resetHistory();

		// Act
		oSubSection._updateShowHideState(true);
		assert.ok(oChildrenSpy.notCalled,
			"Visibility of children with .sapUxAPSubSectionSeeMoreContainer is not toggled when there is no change in visibility");
	});

	QUnit.test(".sapUxAPObjectPageSubSectionWithSeeMore is applied to SubSections correctly", async function(assert) {
		// Arrange
		var oSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0];

		// Act
		oSubSection.addMoreBlock(oHelpers.getBlock());
		await nextUIUpdate();

		// Assert
		assert.ok(oSubSection.$().hasClass("sapUxAPObjectPageSubSectionWithSeeMore"),
			".sapUxAPObjectPageSubSectionWithSeeMore class is added to SubSection with more blocks");
	});

	QUnit.test("Content scrollTop is preserved on section rerendering", function(assert) {
		// note that selected section is the last visible one
		var oLastSubSection = this.oObjectPageLayout.getSections()[1].getSubSections()[0],
		oObjectPageLayout = this.oObjectPageLayout,
		done = assert.async(),
		iReRenderingCount = 0,
		oScrollToSectionSpy = this.spy(oObjectPageLayout, "scrollToSection"),
		oSelectedSection;

		assert.expect(1);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSelectedSection = oObjectPageLayout.getSelectedSection();
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
				assert.ok(oScrollToSectionSpy.alwaysCalledWithMatch(oSelectedSection), "the correct scroll top is preserved");
				done();
			}});
		});
	});

	QUnit.module("SubSection access to parent", {
		beforeEach: async function() {
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
			await nextUIUpdate();
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

	QUnit.test("sParentAggregationName matches parent", function(assert) {
		var oSection = this.oObjectPageLayout.getSections()[0],
			oSubSection = oSection.getSubSections()[0];

		assert.equal(oSubSection.sParentAggregationName, "subSections", "the parent aggregation name matches the public parent");
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			return XMLView.create({
				id: "UxAP-13_objectPageSection",
				viewName: "view.UxAP-13_ObjectPageSection"
			}).then(async function(oView) {
				this.ObjectPageSectionView = oView;
				this.ObjectPageSectionView.placeAt('qunit-fixture');
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

    QUnit.test("Test aria-labelledby attribute", async function(assert) {
		// Arrange
		var oObjectPage = this.ObjectPageSectionView.byId("ObjectPageLayout"),
			oSubSectionWithoutTitle = this.ObjectPageSectionView.byId("subsection6"),
			sSubSectionWithoutTitleAriaLabelledBy = oSubSectionWithoutTitle.$().attr("aria-labelledby"),
			oSubSectionWithTitle = this.ObjectPageSectionView.byId("subsection1"),
			sSubSectionWithTitleAriaLabelledBy = oSubSectionWithTitle.$().attr("aria-labelledby"),
			oPromotedSubSection = this.ObjectPageSectionView.byId("subsection8"),
			sPromotedSubSectionAriaLabelledBy = oPromotedSubSection.$().attr("aria-labelledby"),
			sSubSectionControlName = ObjectPageSubSectionClass._getLibraryResourceBundle().getText("SUBSECTION_CONTROL_NAME");

		// Assert
		assert.strictEqual(Element.getElementById(sSubSectionWithoutTitleAriaLabelledBy).getText(),
			sSubSectionControlName, "Subsections without titles should have aria-label='Subsection'");

		// Assert
		assert.strictEqual(Element.getElementById(sSubSectionWithTitleAriaLabelledBy).getText(),
			oSubSectionWithTitle.getTitle(), "Subsection title is properly labelled");

		// Act
		oSubSectionWithTitle.setShowTitle(false);
		await nextUIUpdate();

		// Arrange
		sSubSectionWithTitleAriaLabelledBy = oSubSectionWithTitle.$().attr("aria-labelledby");

		// Assert
		assert.strictEqual(Element.getElementById(sSubSectionWithTitleAriaLabelledBy).getText(),
			sSubSectionControlName, "Subsection with hidden title should not not contain its title in aria-labelledby");
		assert.strictEqual(Element.getElementById(sPromotedSubSectionAriaLabelledBy).getText().indexOf(oPromotedSubSection.getTitle()) === -1,
			true, "Promoted Subsection title is properly labelled");

		// Act
		oObjectPage.setSubSectionLayout("TitleOnLeft");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(Element.getElementById(sPromotedSubSectionAriaLabelledBy).getText().indexOf(oPromotedSubSection.getTitle()) > -1,
			true, "Promoted Subsection title is properly labelled");
	});

	QUnit.module("Title ID propagation");

	QUnit.test("_initTitlePropagationSupport is called on init", function (assert) {
		// Arrange
		var oSpy = this.spy(ObjectPageSubSectionClass.prototype, "_initTitlePropagationSupport"),
			oControl;

		// Act
		oControl = new ObjectPageSubSectionClass();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initTitlePropagationSupport called on init of control");
		assert.ok(oSpy.calledOn(oControl), "The spy is called on the tested control instance");

		// Cleanup
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
		beforeEach: async function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: [ new ObjectPageSection({
					subSections: [new ObjectPageSubSectionClass({
						blocks: [ new Panel({ height: "100%" })]
					})]
				})]
			});

			this.oObjectPage.placeAt('qunit-fixture');
			await nextUIUpdate();
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
				iOffsetTop = library.Utilities.getChildPosition(oSubSection.$(), oPage._$contentContainer).top,
				iOffsetBottom = oPage.getDomRef().getBoundingClientRect().bottom - oSubSection.getDomRef().getBoundingClientRect().bottom,
				iExpectedSubSectionHeight = Math.round(iViewportHeight - iOffsetTop - iOffsetBottom),
				iSubSectionHeight = Math.round(oSubSection.$().outerHeight() + parseInt(oSection.$().css("marginTop")));
			assert.strictEqual(iSubSectionHeight, iExpectedSubSectionHeight, "the height is correct");
			done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer expands the subSection tab to fit the container", async function(assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			done = assert.async();

		oPage.addSection(new ObjectPageSection({
			subSections: new ObjectPageSubSectionClass({
				blocks: new Panel()
			})
		}));
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);
		oPage.setUseIconTabBar(true);
		await nextUIUpdate();

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			var iViewportHeight = oPage._getScrollableViewportHeight(false),
				iOffsetTop = library.Utilities.getChildPosition(oSubSection.$(), oPage._$contentContainer).top,
				iOffsetBottom = oPage.getDomRef().getBoundingClientRect().bottom - oSubSection.getDomRef().getBoundingClientRect().bottom,
				iExpectedSubSectionHeight = Math.round(iViewportHeight - iOffsetTop - iOffsetBottom),
				iSubSectionHeight = Math.round(oSubSection.$().outerHeight() + parseInt(oSection.$().css("marginTop")));
			assert.strictEqual(iSubSectionHeight, iExpectedSubSectionHeight, "the height is correct");
			done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer expands the subSection when header in title area", async function(assert) {
		var oPage = this.oObjectPage,
			oSection = oPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			done = assert.async();

		// ensure the achorBar is in the title area
		this.stub(oPage, "_shouldPreserveHeaderInTitleArea").returns(true);
		// ensure there is anchorBar (page has more than one section)
		oPage.addSection(new ObjectPageSection({
			subSections: new ObjectPageSubSectionClass({
				blocks: new Panel()
			})
		}));
		// ensure first subSection fits the container
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);
		// ensure only a single section rendered at a time (tabs mode enabled)
		oPage.setUseIconTabBar(true);
		await nextUIUpdate();

		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			var iViewportHeight = oPage._getScrollableViewportHeight(false),
				iOffsetTop = library.Utilities.getChildPosition(oSubSection.$(), oPage._$contentContainer).top,
				iOffsetBottom = oPage.getDomRef().getBoundingClientRect().bottom - oSubSection.getDomRef().getBoundingClientRect().bottom,
				iExpectedSubSectionHeight = Math.round(iViewportHeight - iOffsetTop - iOffsetBottom),
				iSubSectionHeight = Math.round(oSubSection.$().outerHeight() + parseInt(oSection.$().css("marginTop")));
			assert.strictEqual(iSubSectionHeight, iExpectedSubSectionHeight, "the height is correct");
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
				iOffsetTop = library.Utilities.getChildPosition(oSubSection.$(), oPage._$contentContainer).top,
				iOffsetBottom = oPage.getDomRef().getBoundingClientRect().bottom - oSubSection.getDomRef().getBoundingClientRect().bottom,
				iExpectedSubSectionHeight = Math.round(iViewportHeight - iOffsetTop - iOffsetBottom);

			oSubSection.getDomRef().style.paddingTop = "20px";
			oPage._requestAdjustLayout(true);
			// check height
			assert.strictEqual(oSubSection.getDomRef().offsetHeight + parseInt(oSection.$().css("marginTop")), iExpectedSubSectionHeight, "correct height");
			done();

		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer expands the subSection with title to fit the container", function (assert) {
		var oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			done = assert.async();

		//setup: make the subSection fit its container and ensure it has a title
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);
		oSubSection.setTitle("some title");
		//allow [by UX rule] the above title to render by making the subSection non-first:
		oSection.insertSubSection(new ObjectPageSubSectionClass({ // insert subsection above
			blocks: [new Text({text: "block content"})]
		}));

		var oStub = this.stub(oSubSection, "_setHeight").callsFake(function() {
			ObjectPageSubSectionClass.prototype._setHeight.apply(this, arguments);
			assert.strictEqual(oSubSection.getDomRef().scrollHeight, oSubSection.getDomRef().offsetHeight,
				"no scrollable content");
				oStub.restore();
			done();
		});
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
			oSpy = this.spy(oPage, "_requestAdjustLayoutAndUxRules"),
			done = assert.async();

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy.resetHistory();

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
				oToggleScrollingSpy = this.spy(oPage, "_toggleScrolling"),
				oComputerSpacerHeightSpy = this.spy(oPage, "_computeSpacerHeight"),
				done = assert.async();

			assert.expect(5);

			// Act
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

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer with dynamic header title - has scroll when content exceeds container",
		function (assert) {
			// Set-up
			var oPage = this.oObjectPage,
				oSection = this.oObjectPage.getSections()[0],
				oSubSection = oSection.getSubSections()[0],
				oToggleScrollingSpy = this.spy(oPage, "_toggleScrolling"),
				done = assert.async();

			assert.expect(2);

			this.stub(oSubSection, "_hasRestrictedHeight").returns(false);

			// Act
			oPage.setHeaderTitle(new ObjectPageDynamicHeaderTitle());
			oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

			oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// Assert
				assert.strictEqual(oPage._bAllContentFitsContainer, true, "_bAllContentFitsContainer is 'true'");
				assert.ok(oToggleScrollingSpy.calledWith(true), "oToggleScrollingSpy called with 'true' - scrolling is allowed");
				done();
		}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer with tabs - snap without scroll when only one SubSection",
		function (assert) {
			// Set-up
			var oPage = this.oObjectPage,
				oSection1 = this.oObjectPage.getSections()[0],
				oSection1SubSection1 = oSection1.getSubSections()[0],
				oSection2SubSection1 = new ObjectPageSubSectionClass({ blocks: [ new Panel({ height: "100px" })]}),
				oSection2SubSection2 = new ObjectPageSubSectionClass({ blocks: [ new Panel({ height: "100px" })]}),
				oSection2 = new ObjectPageSection({ subSections: [oSection2SubSection1, oSection2SubSection2]}),
				oToggleScrollingSpy = this.spy(oPage, "_toggleScrolling"),
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
				oSection2SubSection1 = new ObjectPageSubSectionClass({ blocks: [ new Panel({ height: "100px" })]}),
				oSection2SubSection2 = new ObjectPageSubSectionClass({ blocks: [ new Panel({ height: "100px" })]}),
				oSection2 = new ObjectPageSection({ subSections: [oSection2SubSection1, oSection2SubSection2]}),
				oToggleScrollingSpy = this.spy(oPage, "_toggleScrolling"),
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
				assert.strictEqual(oPage._bAllContentFitsContainer, false, "_bAllContentFitsContainer is 'false'");
				assert.strictEqual(oPage._bHeaderExpanded, false, "header is still snapped");
				assert.ok(oToggleScrollingSpy.calledWith(true), "oToggleScrollingSpy called with 'true' - scrolling is enabled");
				assert.ok(oPage._$opWrapper.scrollTop() >= oPage._getSnapPosition(), "header is snapped with scroll");
				done();
			}, this);
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer with tabs - rebuild anchorBar",
		function (assert) {
			var oPage = this.oObjectPage,
				oSection1 = oPage.getSections()[0],
				oSection2 = new ObjectPageSection({ subSections: [new ObjectPageSubSectionClass({ blocks: [ new Text()]})]}),
				oSection1SubSection1 = oSection1.getSubSections()[0],
				done = assert.async();

			assert.expect(2);

			// Setup: current tab fits the container
			oPage.setUseIconTabBar(true); // tabs mode
			oPage.addSection(oSection2); // more than one tab
			oSection1SubSection1.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS); // current tab fits the container

			oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// Assert init state
				assert.strictEqual(oPage._bAllContentFitsContainer, true, "_bAllContentFitsContainer is correct");

				// Act: take an action that requires rebuilding of anchor bar
				oSection1.setTitle("another"); // setTitle requires rebuilding of anchorBar => internally _adjustLayoutAndUxRules is called
				oPage._adjustLayoutAndUxRules(true); // call synchronously to speed up the test

				// Assert
				assert.strictEqual(oPage._bAllContentFitsContainer, true, "_bAllContentFitsContainer is still correct");

				done();
			});
	});

	QUnit.test("update sapUxAPObjectPageSubSectionFitContainer from _adjustLayoutAndUXRules",
		function (assert) {
			var oPage = this.oObjectPage,
				oLayoutSpy = this.spy(this.oObjectPage, "_requestAdjustLayout"),
				oDetectFullscreenSubSectionSpy = this.spy(this.oObjectPage, "_hasSingleVisibleFullscreenSubSection"),
				done = assert.async();

			assert.expect(1);

			oPage.setUseIconTabBar(true); // tabs mode

			oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				oPage._adjustLayoutAndUxRules(); // call synchronously to speed up the test

				// Assert
				assert.ok(oDetectFullscreenSubSectionSpy.calledBefore(oLayoutSpy),
					"fullscreen subSection is detected before applying the layout");

				done();
			});
	});

	QUnit.test("sapUxAPObjectPageSubSectionFitContainer preserves the minimal content height", function (assert) {
		var oPage = this.oObjectPage,
			oSection = this.oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			oQunitFixtureElement = document.getElementById("qunit-fixture"),
			sPageHeight = "200px",
			sPageContentHeight = "300px",
			done = assert.async();

		// Setup: content height is bigger than page height
		oSubSection.removeAllBlocks();
		oQunitFixtureElement.style.height = sPageHeight;
		oSubSection.addBlock(new HTML({content: '<div style="min-height:' + sPageContentHeight + '"></div>'}));

		//act
		oSubSection.addStyleClass(ObjectPageSubSectionClass.FIT_CONTAINER_CLASS);

		//setup
		oPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			//check
			assert.strictEqual(oSubSection.getDomRef().style.height, "", "the height of the section is not restricted");
			oQunitFixtureElement.style.height = ""; // clean up
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
							blocks: [new Panel({ height: "100%" })]
						})
					]
				})
			});
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("applyUxRules", async function(assert) {

		// Setup
		var oSubSection = this.oObjectPageLayout.getSections()[0].getSubSections()[0],
			oInvalidateSpy = this.spy(oSubSection, "invalidate"),
			done = assert.async();

		assert.expect(1);

		this.oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Check
			assert.equal(oInvalidateSpy.callCount, 0, "subSection is not invalidated");
			done();
		}, this);

		this.oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		// Act
		this.oObjectPageLayout._applyUxRules(true);
	});

	QUnit.module("SubSection title visibility", {
		beforeEach: async function() {
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
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("SubSection without title has no title", function (assert) {
		var oSubSection = this.oObjectPage.getSections()[0].getSubSections()[0],
			$section = oSubSection.$();

		assert.strictEqual($section.find('.sapUxAPObjectPageSubSectionHeader').length, 0, "subsection has no title");
		assert.strictEqual(oSubSection.getTitleVisible(), false, "titleVisible is false");

		this.oObjectPage.destroy();
	});

	QUnit.test("SubSection without title is not promoted", function (assert) {
		var oSection = this.oObjectPage.getSections()[0],
		$subSection = oSection.getSubSections()[0].$();

		assert.ok(oSection.getSubSections().length > 0, "subsection is not the only child");
		assert.notOk($subSection.hasClass("sapUxAPObjectPageSubSectionPromoted"), "subsection is not promoted");

		this.oObjectPage.destroy();
	});

	QUnit.test("getTitleVisible with showTitle=true", async function(assert) {
		// Arrange
		var oSubSection = this.oObjectPage.getSections()[0].getSubSections()[0];

		// Assert
		assert.strictEqual(oSubSection.getTitleVisible(), false, "titleVisible is false");

		// Act
		oSubSection.setShowTitle(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSubSection.getTitleVisible(), true, "titleVisible is true");

		this.oObjectPage.destroy();
	});

	QUnit.test("getTitleVisible with empty title", async function(assert) {
		// Arrange
		var oSubSection = this.oObjectPage.getSections()[0].getSubSections()[0];

		// Assert
		assert.strictEqual(oSubSection.getTitleVisible(), false, "titleVisible is false");

		// Act
		oSubSection.setShowTitle(true);
		oSubSection.setTitle("");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSubSection.getTitleVisible(), false, "titleVisible is still false as title is empty string");

		this.oObjectPage.destroy();
	});

	QUnit.module("SubSection internalTitle");

	QUnit.test("Subsection _setInternalTitleLevel should invalidate control", async function(assert) {
		// arrange
		var oSubSection = new ObjectPageSubSectionClass({
				title: "Title",
				titleLevel: TitleLevel.Auto,
				showTitle: true,
				blocks: [new Text({ text: "test" })]
			}),
			oObjectPage = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						oSubSection
					]
				})
			});

		oObjectPage.placeAt('qunit-fixture');
		await nextUIUpdate();

		// act
		oSubSection._setInternalTitleVisible(true);
		oSubSection._setInternalTitleLevel(TitleLevel.H5, true);

		await nextUIUpdate();

		// assert
		assert.strictEqual(oSubSection.$("headerTitle").attr("aria-level") === "5", true,
			"Title level should not be 'Auto' but auto generate value from 1 to 6");

		// clean up
		oObjectPage.destroy();
	});


	QUnit.module("See more / see less", {
		beforeEach: async function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSectionClass({
							title: "Title",
							showTitle: false,
							blocks: [new Text({text: "Test"})],
							moreBlocks: [new Button()]
						})
					]
				})
			});

			this.oObjectPage.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Focus handling when see more / see less button is selected", function (assert) {
		assert.expect(1);
		// setup
		var oSubSection = this.oObjectPage.getSections()[0].getSubSections()[0],
			done = assert.async();

		oSubSection.addEventDelegate({ onAfterRendering: function() {
			// assert
			assert.equal(document.activeElement, oSubSection._oSeeLessButton.getDomRef(), "See less button is focused correctly");
			done();
		}});
		// act
		oSubSection._oSeeMoreButton.firePress();
	});

	QUnit.test("Focus handling when see more / see less button is selected and focus was moved", function (assert) {
		assert.expect(1);

		// setup
		var oSubSection = this.oObjectPage.getSections()[0].getSubSections()[0],
			oMoreBlock = oSubSection.getMoreBlocks()[0],
			done = assert.async();

		oMoreBlock.addEventDelegate({ onAfterRendering: function() {
			// act - moving the focus the Button
			oMoreBlock.getDomRef().focus();
		}});

		oSubSection.addEventDelegate({ onAfterRendering: function() {
			// assert
			assert.equal(document.activeElement, oMoreBlock.getDomRef(), "Button in moreBlocks is focused");
			done();
		}});

		// act
		oSubSection._oSeeMoreButton.firePress();
	});

	QUnit.module("Column span", {
		beforeEach: async function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSectionClass({
							title: "Title",
							blocks: [new Text({text: "Test"})]
						}),
						new ObjectPageSubSectionClass({
							title: "Title1",
							blocks: [new Text({text: "Test1"})]
						})
					]
				})
			});

			this.oObjectPage.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("_setColumnSpan", function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[0],
			oSpy = this.spy(oSection, "invalidate");

		oSection.getSubSections().forEach(function(oSubSection) {
			oSubSection._setColumnSpan(ObjectPageSubSectionClass.COLUMN_SPAN.auto);
		});
		assert.equal(oSpy.callCount, 2, "parent section is invalidated");
	});
});
