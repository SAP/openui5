/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/ListTableTypeBase",
	"sap/ui/core/Element",
	"sap/ui/mdc/table/TableTypeBase",
	"sap/ui/mdc/list/ListTypeBase"
], function(ListTableTypeBase, Element, TableTypeBase, ListTypeBase) {
	"use strict";

	QUnit.module("Hierarchy");

	QUnit.test("is abstract and extends sap.ui.core.Element", function(assert) {
		assert.ok(ListTableTypeBase.getMetadata().isAbstract(), "ListTableTypeBase is abstract");
		assert.ok(ListTableTypeBase.prototype instanceof Element, "ListTableTypeBase extends sap.ui.core.Element");
	});

	QUnit.test("TableTypeBase and ListTypeBase extend ListTableTypeBase", function(assert) {
		assert.ok(TableTypeBase.prototype instanceof ListTableTypeBase, "TableTypeBase extends ListTableTypeBase");
		assert.ok(ListTypeBase.prototype instanceof ListTableTypeBase, "ListTypeBase extends ListTableTypeBase");
	});

	QUnit.module("Shape");

	QUnit.test("getInnerControl is abstract", function(assert) {
		const oType = new ListTableTypeBase();
		assert.throws(() => oType.getInnerControl(), /does not implement #getInnerControl/, "getInnerControl throws on the bare base");
		oType.destroy();
	});

	QUnit.test("insertFilterInfoBar is abstract", function(assert) {
		const oType = new ListTableTypeBase();
		assert.throws(() => oType.insertFilterInfoBar({}), /does not implement #insertFilterInfoBar/, "insertFilterInfoBar throws on the bare base");
		oType.destroy();
	});

	QUnit.test("concrete type bases implement the shape", function(assert) {
		assert.notStrictEqual(TableTypeBase.prototype.getInnerControl, ListTableTypeBase.prototype.getInnerControl,
			"TableTypeBase overrides getInnerControl");
		assert.notStrictEqual(ListTypeBase.prototype.getInnerControl, ListTableTypeBase.prototype.getInnerControl,
			"ListTypeBase overrides getInnerControl");
		assert.notStrictEqual(ListTypeBase.prototype.insertFilterInfoBar, ListTableTypeBase.prototype.insertFilterInfoBar,
			"ListTypeBase overrides insertFilterInfoBar");
	});
});
