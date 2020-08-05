/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"sap/ui/table/CreationRow",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Menu"
], function(TableQUnitUtils, Column, Table, CreationRow, JSONModel, Menu) {
	"use strict";

	QUnit.module("Basics");

	QUnit.test("Initialize skip propagation", function(assert) {
		var oColumn = new Column();

		assert.deepEqual(oColumn.mSkipPropagation, {
			template: true,
			creationTemplate: true
		}, "Skip propagation is correctly initialized for template aggregations");

		oColumn.destroy();
	});

	QUnit.module("API", {
		beforeEach: function() {
			this._oColumn = new Column();
		},
		afterEach: function() {
			this._oColumn.destroy();
		}
	});

	QUnit.test("shouldRender", function(assert) {
		var that = this;

		function test(bShouldRender, bVisible, bGrouped, vTemplate) {
			that._oColumn.setVisible(bVisible);
			that._oColumn.setGrouped(bGrouped);
			that._oColumn.setTemplate(vTemplate);

			assert.strictEqual(that._oColumn.shouldRender(), bShouldRender,
				"Returned " + bShouldRender + ": "
				+ (bVisible ? "Visible" : "Not visible")
				+ ", " + (bGrouped ? "grouped" : "not grouped")
				+ ", " + (vTemplate != null ? ",has template" : "has no template"));
		}

		test(true, true, false, "dummy");
		test(false, true, true, "dummy");
		test(false, false, false, "dummy");
		test(false, false, true, "dummy");
		test(false, true, true, null);
		test(false, true, false, null);
		test(false, false, false, null);
		test(false, false, true, null);
	});

	QUnit.module("Lazy Aggregations", {
		beforeEach: function() {
			this._oColumn = new Column();
		},
		afterEach: function() {
			this._oColumn.destroy();
		}
	});

	QUnit.test("Label", function(assert) {
		assert.equal(this._oColumn.getLabel(), null, "The column has no label defined");

		this._oColumn.setLabel("labelstring");
		var oLabel = this._oColumn.getLabel();
		assert.notEqual(oLabel, null, "Added label by passing a string");
		assert.strictEqual(oLabel.getText(), "labelstring", "The text of the label is correct");

		var oNewLabel = new TableQUnitUtils.TestControl({text: "labelinstance"});
		this._oColumn.setLabel(oNewLabel);
		assert.notEqual(oNewLabel, null, "Added label by passing a sap.m.Label instance");
		assert.notEqual(oLabel, oNewLabel, "The column has a new label");
		assert.strictEqual(oNewLabel.getText(), "labelinstance", "The text of the label is correct");
	});

	QUnit.test("Template", function(assert) {
		assert.equal(this._oColumn.getTemplate(), null, "The column has no template defined");

		this._oColumn.setTemplate("bindingpath");
		var oTemplate = this._oColumn.getTemplate();
		assert.notEqual(oTemplate, null, "Added template by passing a string");
		assert.strictEqual(oTemplate.getBindingPath("text"), "bindingpath", "The binding path of the template is correct");

		var oNewTemplate = new TableQUnitUtils.TestControl({text: "{anotherbindingpath}"});
		this._oColumn.setTemplate(oNewTemplate);
		assert.notEqual(oNewTemplate, null, "Added template by passing a sap.m.Text instance");
		assert.notEqual(oTemplate, oNewTemplate, "The column has a new template");
		assert.strictEqual(oNewTemplate.getBindingPath("text"), "anotherbindingpath", "The binding path of the template is correct");
	});

	QUnit.test("CreationTemplate", function(assert) {
		var bErrorThrown = false;

		try {
			this._oColumn.setCreationTemplate("bindingpath");
		} catch (e) {
			bErrorThrown = true;
		}

		assert.ok(bErrorThrown, "The creationTemplate is not a lazy aggregation. Passing a string in the setter should throw an error.");
	});

	QUnit.module("Column Menu Items", {
		beforeEach: function() {
			this._oTable = new Table();
			this._oColumn = new Column();
		},
		afterEach: function() {
			this._oColumn.destroy();
			this._oTable.destroy();
		}
	});

	QUnit.test("Pre-Check Menu Item Creation", function(assert) {

		//######################################################################################################
		// Filter menu item
		//######################################################################################################
		this._oColumn.setFilterProperty("");
		this._oColumn.setShowFilterMenuEntry(true);

		assert.ok(!this._oColumn.isFilterableByMenu(),
			"Not filterable by menu:"
			+ " filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "'"
			+ ", showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(false);
		assert.ok(!this._oColumn.isFilterableByMenu(),
			"Not filterable by menu:"
			+ " filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "'"
			+ ", showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setFilterProperty("myFilterPropertyName");
		assert.ok(!this._oColumn.isFilterableByMenu(),
			"Not filterable by menu:"
			+ " filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "'"
			+ ", showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		this._oColumn.setShowFilterMenuEntry(true);
		assert.ok(this._oColumn.isFilterableByMenu(),
			"Not filterable by menu:"
			+ " filterProperty: '" + (this._oColumn.getFilterProperty() ? this._oColumn.getFilterProperty() : "") + "'"
			+ ", showFilterMenuEntry: " + this._oColumn.getShowFilterMenuEntry());

		//######################################################################################################
		// Sort menu item
		//######################################################################################################
		this._oColumn.setSortProperty("");
		this._oColumn.setShowSortMenuEntry(true);

		assert.ok(!this._oColumn.isSortableByMenu(),
			"Not sortable by menu:"
			+ " sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", showSortMenuEntry: " + this._oColumn.getShowSortMenuEntry());

		this._oColumn.setShowSortMenuEntry(false);
		assert.ok(!this._oColumn.isSortableByMenu(),
			"Not sortable by menu:"
			+ " sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", showSortMenuEntry: " + this._oColumn.getShowSortMenuEntry());

		this._oColumn.setSortProperty("mySortPropertyName");
		assert.ok(!this._oColumn.isSortableByMenu(),
			"Not sortable by menu:"
			+ " sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", showSortMenuEntry: " + this._oColumn.getShowSortMenuEntry());

		this._oColumn.setShowSortMenuEntry(true);
		assert.ok(this._oColumn.isSortableByMenu(),
			"Not sortable by menu:"
			+ " sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", showSortMenuEntry: " + this._oColumn.getShowSortMenuEntry());

		//######################################################################################################
		// Group menu item
		//######################################################################################################

		// reset Column Properties
		this._oColumn.setFilterProperty("");
		this._oColumn.setShowFilterMenuEntry(true);
		this._oColumn.setSortProperty("");
		this._oColumn.setShowSortMenuEntry(true);

		// check column without parent
		this._oTable.setEnableGrouping(true);
		this._oColumn.setSortProperty("mySortPropertyName");
		assert.ok(!this._oColumn.isGroupable(),
			"Not groupable by menu:"
			+ " parent: '" + (this._oColumn.getParent() ? "Has parent" : "No Parent") + "'"
			+ ", sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", enableGrouping: " + this._oTable.getEnableGrouping());

		// check column with parent
		this._oTable.addColumn(this._oColumn);

		this._oTable.setEnableGrouping(true);
		this._oColumn.setSortProperty("");
		assert.ok(!this._oColumn.isGroupable(),
			"Not groupable by menu:"
			+ " parent: '" + (this._oColumn.getParent() ? "Has parent" : "No Parent") + "'"
			+ ", sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", enableGrouping: " + this._oTable.getEnableGrouping());

		this._oTable.setEnableGrouping(false);
		assert.ok(!this._oColumn.isGroupable(),
			"Not groupable by menu:"
			+ " parent: '" + (this._oColumn.getParent() ? "Has parent" : "No Parent") + "'"
			+ ", sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", enableGrouping: " + this._oTable.getEnableGrouping());

		this._oColumn.setSortProperty("mySortPropertyName");
		assert.ok(!this._oColumn.isGroupable(),
			"Not groupable by menu:"
			+ " parent: '" + (this._oColumn.getParent() ? "Has parent" : "No Parent") + "'"
			+ ", sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", enableGrouping: " + this._oTable.getEnableGrouping());

		this._oTable.setEnableGrouping(true);
		assert.ok(this._oColumn.isGroupable(),
			"Not groupable by menu:"
			+ " parent: '" + (this._oColumn.getParent() ? "Has parent" : "No Parent") + "'"
			+ ", sortProperty: '" + (this._oColumn.getSortProperty() ? this._oColumn.getSortProperty() : "") + "'"
			+ ", enableGrouping: " + this._oTable.getEnableGrouping());
	});

	QUnit.module("Column Menu", {
		beforeEach: function() {
			var oModel = new JSONModel();
			oModel.setData([{myProp: "someValue", myOtherProp: "someOtherValue"}]);
			this._oTable = new Table();
			this._oTable.bindRows("/");
			this._oTable.setModel(oModel);
			this._oColumnWithColumnMenu = new Column({
				filterProperty: "myProp",
				showFilterMenuEntry: true
			});

			this._oColumnWithUnifiedMenu = new Column({
				filterProperty: "myOtherProp",
				showFilterMenuEntry: true,
				menu: new Menu()
			});

			this._oTable.addColumn(this._oColumnWithColumnMenu);
			this._oTable.addColumn(this._oColumnWithUnifiedMenu);

			this._oTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this._oColumnWithColumnMenu.destroy();
			this._oColumnWithUnifiedMenu.destroy();
			this._oTable.destroy();
		}
	});

	QUnit.test("Filter on Column with ColumnMenu and UnifiedMenu", function(assert) {
		var oColumnMenu = this._oColumnWithColumnMenu.getMenu();
		var oSpyColumnMenu = this.spy(oColumnMenu, "_setFilterValue");
		this._oColumnWithColumnMenu.filter("filterValue");
		this._oColumnWithColumnMenu._openMenu();

		var oFilterField = sap.ui.getCore().byId(oColumnMenu.getId() + "-filter");
		assert.equal(oFilterField.getValue(), "filterValue", "Filter value set on ColumnMenu");
		assert.ok(oSpyColumnMenu.called, "_setFilterValue called on ColumnMenu");

		var oUnifiedMenu = this._oColumnWithUnifiedMenu.getMenu();
		// implement a dummy function to allow usage of sinon.spy
		oUnifiedMenu._setFilterValue = function() {};
		var oSpyUnifiedMenu = this.spy(oUnifiedMenu, "_setFilterValue");

		// if filter is called on a column, the filter state of the other columns must be updated as well
		var oSpyColumnMenuFilterState = this.spy(oColumnMenu, "_setFilterState");
		this._oColumnWithUnifiedMenu.filter("filterValue");
		assert.ok(!oSpyUnifiedMenu.called, "_setFilterValue not called on UnifiedMenu");
		assert.ok(oSpyColumnMenuFilterState.calledOnce, "_setFilterState called on ColumnMenu");
	});

	QUnit.test("Localization and Invalidation", function(assert) {
		var oColumnMenu = this._oColumnWithColumnMenu.getMenu();
		this._oColumnWithColumnMenu._openMenu();

		assert.ok(!oColumnMenu._bInvalidated, "ColumnMenu not invalidated");
		this._oTable._invalidateColumnMenus();
		assert.ok(oColumnMenu._bInvalidated, "ColumnMenu invalidated");
		this._oColumnWithColumnMenu._openMenu();
		assert.ok(!oColumnMenu._bInvalidated, "ColumnMenu not invalidated");
	});

	QUnit.module("Changes that affect rows", {
		beforeEach: function() {
			this.oColumn = new Column();
			this.oTable = new Table({
				columns: [this.oColumn]
			});
			this.oCreationRow = new CreationRow();
			this.oTable.setCreationRow(this.oCreationRow);

			this.oTable.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Property changes", function(assert) {
		var oInvalidateRowsAggregationSpy = sinon.spy(this.oTable, "invalidateRowsAggregation");
		var oCreationRowUpdateSpy = sinon.spy(this.oCreationRow, "_update");

		this.oColumn.setVisible(false);
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 1,
			"Table#invalidateRowsAggregation called after changing the 'visible' property");
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 1,
			"CreationRow#_update called after changing the 'visible' property");

		this.oColumn.setVisible(true);
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 2,
			"Table#invalidateRowsAggregation called after changing the 'visible' property");
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 2,
			"CreationRow#_update called after changing the 'visible' property");

		this.oColumn.setVisible(true);
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 2,
			"Table#invalidateRowsAggregation NOT called if only calling Column#setVisible without changing the value");
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 2,
			"CreationRow#_update NOT called if only calling Column#setVisible without changing the value");
	});

	QUnit.test("Template changes", function(assert) {
		var oInvalidateRowsAggregationSpy = sinon.spy(this.oTable, "invalidateRowsAggregation");
		var oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oColumn.setTemplate(new TableQUnitUtils.TestControl());
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 1,
			"Table#invalidateRowsAggregation called after setting the template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 1,
			"Table#invalidate called after setting the template");

		this.oColumn.setTemplate(this.oColumn.getTemplate());
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 2,
			"Table#invalidateRowsAggregation called after setting the same template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 2,
			"Table#invalidate called after setting the same template");

		this.oColumn.getTemplate().invalidate();
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 2,
			"Table#invalidateRowsAggregation NOT called when invalidating the template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 2,
			"Table#invalidate NOT called when invalidating the template");

		this.oColumn.setTemplate(null);
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 2,
			"Table#invalidateRowsAggregation NOT called after setting the template to 'null'");
		assert.strictEqual(oTableInvalidateSpy.callCount, 3,
			"Table#invalidate called after setting the template to 'null'");

		this.oColumn.setVisible(false);
		oInvalidateRowsAggregationSpy.reset();
		oTableInvalidateSpy.reset();
		this.oColumn.setTemplate(new TableQUnitUtils.TestControl());
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 0,
			"Table#invalidateRowsAggregation NOT called after setting the template for invisible column");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called after setting the template for invisible column");

		this.oColumn.setVisible(true);
		oInvalidateRowsAggregationSpy.reset();
		oTableInvalidateSpy.reset();
		this.oColumn.destroyTemplate();
		assert.strictEqual(oInvalidateRowsAggregationSpy.callCount, 0,
			"Table#invalidateRowsAggregation NOT called after destroying the template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 1,
			"Table#invalidate called after destroying the template");
	});

	QUnit.test("CreationTemplate changes", function(assert) {
		var oCreationRowUpdateSpy = sinon.spy(this.oCreationRow, "_update");
		var oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oColumn.setCreationTemplate(new TableQUnitUtils.TestControl());
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 1,
			"CreationRow#_update called after setting the template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called after setting the template");

		this.oColumn.setCreationTemplate(this.oColumn.getCreationTemplate());
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 2,
			"CreationRow#_update called after setting the same template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called after setting the same template");

		this.oColumn.getCreationTemplate().invalidate();
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 2,
			"CreationRow#_update NOT called when invalidating the template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called when invalidating the template");

		this.oColumn.setCreationTemplate(null);
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 2,
			"CreationRow#_update NOT called after setting the template to 'null'");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called after setting the template to 'null'");

		this.oColumn.setVisible(false);
		oCreationRowUpdateSpy.reset();
		oTableInvalidateSpy.reset();
		this.oColumn.setCreationTemplate(new TableQUnitUtils.TestControl());
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 0,
			"CreationRow#_update NOT called after setting the template for invisible column");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called after setting the template for invisible column");

		this.oColumn.setVisible(true);
		oCreationRowUpdateSpy.reset();
		oTableInvalidateSpy.reset();
		this.oColumn.destroyCreationTemplate();
		assert.strictEqual(oCreationRowUpdateSpy.callCount, 0,
			"CreationRow#_update NOT called after destroying the template");
		assert.strictEqual(oTableInvalidateSpy.callCount, 0,
			"Table#invalidate NOT called after destroying the template");
	});

	QUnit.module("Template Clones", {
		beforeEach: function() {
			this.oColumn = new Column();
			this.aTemplateTypes = Object.keys(this.oColumn._mTemplateClones);
			this.oCloneWithParent = this.createTemplateCloneDummy(true);
			this.oCloneWithoutParentA = this.createTemplateCloneDummy();
			this.oCloneWithoutParentB = this.createTemplateCloneDummy();
			this.oDestroyedClone = this.createTemplateCloneDummy(true, true);
		},
		afterEach: function() {
			this.oColumn._initTemplateClonePool(); // Some clones are just objects or stubbed controls. Destroying them would fail.
			this.oColumn.destroy();
		},
		getTemplateCloneCount: function() {
			return this.aTemplateTypes.reduce(function(iCount, sTemplateType) {
				return iCount + this.oColumn._mTemplateClones[sTemplateType].length;
			}.bind(this), 0);
		},
		setTemplate: function(sTemplateType, oTemplate) {
			this.oColumn["set" + (sTemplateType === "Standard" ? "" : sTemplateType) + "Template"].call(this.oColumn, oTemplate);
		},
		getTemplate: function(sTemplateType) {
			return this.oColumn["get" + (sTemplateType === "Standard" ? "" : sTemplateType) + "Template"].call(this.oColumn);
		},
		destroyTemplate: function(sTemplateType) {
			this.oColumn["destroy" + (sTemplateType === "Standard" ? "" : sTemplateType) + "Template"].call(this.oColumn);
		},
		createTemplateCloneDummy: function(bHasParent, bDestroyed) {
			return {
				getParent: function() { return bHasParent ? "i have a parent" : undefined; },
				destroy: function() {},
				bIsDestroyed: bDestroyed
			};
		}
	});

	QUnit.test("_getFreeTemplateClone: No free standard template clone available", function(assert) {
		for (var sTemplateType in this.oColumn._mTemplateClones) {
			this.oColumn._mTemplateClones[sTemplateType] = [
				null,
				this.oCloneWithParent,
				this.oDestroyedClone
			];

			var oFreeTemplateClone = this.oColumn._getFreeTemplateClone(sTemplateType);

			assert.strictEqual(oFreeTemplateClone, null, sTemplateType + " type: Returned null");
			assert.deepEqual(this.oColumn._mTemplateClones[sTemplateType], [this.oCloneWithParent],
				sTemplateType + " type: The clone pool has been cleaned up");
		}

		assert.strictEqual(this.oColumn._getFreeTemplateClone(), null, "undefined type: Returned null");
	});

	QUnit.test("_getFreeTemplateClone: Free template clones available", function(assert) {
		for (var sTemplateType in this.oColumn._mTemplateClones) {
			this.oColumn._mTemplateClones[sTemplateType] = [
				null,
				this.oCloneWithParent,
				this.oCloneWithoutParentA,
				this.oDestroyedClone,
				this.oCloneWithoutParentB
			];

			var oFreeTemplateClone = this.oColumn._getFreeTemplateClone(sTemplateType);

			assert.strictEqual(oFreeTemplateClone, this.oCloneWithoutParentA,  sTemplateType + " type: Returned the first free template clone");
			assert.deepEqual(this.oColumn._mTemplateClones[sTemplateType], [
				this.oCloneWithParent,
				this.oCloneWithoutParentA,
				this.oCloneWithoutParentB
			],  sTemplateType + " type: The clone pool has been cleaned up");
		}
	});

	QUnit.test("getTemplateClone: No parameters passed", function(assert) {
		this.oColumn.setTemplate(new TableQUnitUtils.TestControl());

		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");
		var oTemplateClone = this.oColumn.getTemplateClone();

		assert.ok(oGetFreeTemplateCloneSpy.notCalled, "Column#_getFreeTemplateClone was not called");
		assert.strictEqual(this.getTemplateCloneCount(), 0, "No template clones exist");
		assert.strictEqual(oTemplateClone, null, "Returned null");
	});

	QUnit.test("getTemplateClone: No type information passed", function(assert) {
		this.oColumn.setTemplate(new TableQUnitUtils.TestControl({text: "Standard"}));

		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");
		var oTemplateClone = this.oColumn.getTemplateClone(0);

		assert.ok(oGetFreeTemplateCloneSpy.calledWithExactly("Standard"), "Column#_getFreeTemplateClone was called with templateType=Standard");
		assert.strictEqual(this.getTemplateCloneCount(), 1, "1 template clone exists");
		assert.strictEqual(this.oColumn._mTemplateClones.Standard.length, 1, "1 standard template clone exists");
		assert.strictEqual(oTemplateClone, this.oColumn._mTemplateClones.Standard[0], "Returned the created standard template clone");
		assert.strictEqual(oTemplateClone.getText(), "Standard", "The correct template was cloned");
	});

	QUnit.test("getTemplateClone: Wrong type information passed", function(assert) {
		this.oColumn.setTemplate(new TableQUnitUtils.TestControl());
		var oTemplateClone = this.oColumn.getTemplateClone(0, "not a template type");
		assert.strictEqual(this.getTemplateCloneCount(), 0, "No template clone exists");
		assert.strictEqual(oTemplateClone, null, "Returned null");
	});

	QUnit.test("getTemplateClone: No index passed", function(assert) {
		for (var j = 0; j < this.aTemplateTypes.length; j++) {
			this.setTemplate(this.aTemplateTypes[j], new TableQUnitUtils.TestControl());
		}

		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			var sTemplateType = this.aTemplateTypes[i];
			var oTemplateClone = this.oColumn.getTemplateClone(null, sTemplateType);

			assert.strictEqual(oTemplateClone, null, sTemplateType + " type: Returned null");
		}

		assert.strictEqual(this.getTemplateCloneCount(), 0, "No template clones exist");
		assert.ok(oGetFreeTemplateCloneSpy.notCalled, "Column#_getFreeTemplateClone was not called");
	});

	QUnit.test("getTemplateClone: No template is defined", function(assert) {
		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			var sTemplateType = this.aTemplateTypes[i];
			var oTemplateClone = this.oColumn.getTemplateClone(0, sTemplateType);

			assert.strictEqual(oTemplateClone, null, sTemplateType + " type: Returned null");
			assert.ok(oGetFreeTemplateCloneSpy.notCalled, sTemplateType + " type: Column#_getFreeTemplateClone was not called");

			oGetFreeTemplateCloneSpy.reset();
		}

		assert.deepEqual(this.getTemplateCloneCount(), 0, "No template clones exist");
	});

	QUnit.test("getTemplateClone: No template clones exist -> Create a new template clone", function(assert) {
		var mTemplateCloneFunctionSpies = {};
		var sTemplateType;

		for (var j = 0; j < this.aTemplateTypes.length; j++) {
			sTemplateType = this.aTemplateTypes[j];

			var oTemplate = new TableQUnitUtils.TestControl({text: sTemplateType});

			this.setTemplate(sTemplateType, oTemplate);
			mTemplateCloneFunctionSpies[sTemplateType] = sinon.spy(oTemplate, "clone");
		}

		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			sTemplateType = this.aTemplateTypes[i];

			var oTemplateClone = this.oColumn.getTemplateClone(5, sTemplateType);

			assert.ok(oTemplateClone === this.oColumn._mTemplateClones[sTemplateType][0],
				sTemplateType + " type: Returned the created template clone");
			assert.strictEqual(oTemplateClone.getText(), sTemplateType, sTemplateType + " type: The correct template was cloned");

			assert.strictEqual(this.getTemplateCloneCount(), i + 1, (i + 1) + " template clone(s) exist(s)");
			assert.strictEqual(this.oColumn._mTemplateClones[sTemplateType].length, 1, sTemplateType + " type: 1 template clone exists");

			assert.strictEqual(this.oColumn, Column.ofCell(oTemplateClone),
				sTemplateType + " type: Column of the template clone can be obtained with Column.ofCell");

			assert.ok(oGetFreeTemplateCloneSpy.calledOnce, sTemplateType + " type: Column#_getFreeTemplateClone was called once");
			assert.ok(oGetFreeTemplateCloneSpy.calledWithExactly(sTemplateType),
				"Column#_getFreeTemplateClone was called with templateType=" + sTemplateType);

			assert.ok(mTemplateCloneFunctionSpies[sTemplateType].calledOnce, sTemplateType + " type: Template#clone was called once");

			oGetFreeTemplateCloneSpy.reset();
		}
	});

	QUnit.test("getTemplateClone: Only used template clones exist -> Create a new template clone", function(assert) {
		var mTemplateCloneFunctionSpies = {};
		var sTemplateType;

		for (var j = 0; j < this.aTemplateTypes.length; j++) {
			sTemplateType = this.aTemplateTypes[j];

			var oTemplate = new TableQUnitUtils.TestControl({text: sTemplateType});

			this.setTemplate(sTemplateType, oTemplate);
			sinon.stub(this.oColumn.getTemplateClone(0, sTemplateType), "getParent").returns("i have a parent");
			mTemplateCloneFunctionSpies[sTemplateType] = sinon.spy(oTemplate, "clone");
		}

		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			sTemplateType = this.aTemplateTypes[i];

			var oTemplateClone = this.oColumn.getTemplateClone(5, sTemplateType);

			assert.ok(oTemplateClone === this.oColumn._mTemplateClones[sTemplateType][1],
				sTemplateType + " type: Returned the created template clone");
			assert.strictEqual(oTemplateClone.getText(), sTemplateType, sTemplateType + " type: The correct template was cloned");

			assert.strictEqual(this.getTemplateCloneCount(), this.aTemplateTypes.length + i + 1,
				this.aTemplateTypes.length + i + 1 + " template clones exist");
			assert.strictEqual(this.oColumn._mTemplateClones[sTemplateType].length, 2, sTemplateType + " type: 2 template clones exist");

			assert.strictEqual(this.oColumn, Column.ofCell(oTemplateClone),
				sTemplateType + " type: Column of the template clone can be obtained with Column.ofCell");

			assert.ok(oGetFreeTemplateCloneSpy.calledOnce, sTemplateType + " type: Column#_getFreeTemplateClone was called once");
			assert.ok(oGetFreeTemplateCloneSpy.calledWithExactly(sTemplateType),
				"Column#_getFreeTemplateClone was called with templateType=" + sTemplateType);

			assert.ok(mTemplateCloneFunctionSpies[sTemplateType].calledOnce, "Template#clone was called once");

			oGetFreeTemplateCloneSpy.reset();
		}
	});

	QUnit.test("getTemplateClone: Reuse a free template clone", function(assert) {
		var mTemplateCloneFunctionSpies = {};
		var sTemplateType;
		var oTemplateClone;
		var mFreeTemplateClones = {};

		for (var j = 0; j < this.aTemplateTypes.length; j++) {
			var oTemplate = new TableQUnitUtils.TestControl();

			sTemplateType = this.aTemplateTypes[j];
			this.setTemplate(sTemplateType, oTemplate);
			sinon.stub(this.oColumn.getTemplateClone(0, sTemplateType), "getParent").returns("i have a parent");
			oTemplateClone = this.oColumn.getTemplateClone(1, sTemplateType);
			sinon.stub(oTemplateClone, "getParent").returns("i have a parent");
			sinon.stub(this.oColumn.getTemplateClone(2, sTemplateType), "getParent").returns("i have a parent");
			sinon.restore(oTemplateClone); // Now the clone is free.
			mTemplateCloneFunctionSpies[sTemplateType] = sinon.spy(oTemplate, "clone");
			mFreeTemplateClones[sTemplateType] = oTemplateClone;
		}

		var oGetFreeTemplateCloneSpy = sinon.spy(this.oColumn, "_getFreeTemplateClone");

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			sTemplateType = this.aTemplateTypes[i];

			oTemplateClone = this.oColumn.getTemplateClone(5, sTemplateType);

			assert.ok(oTemplateClone === mFreeTemplateClones[sTemplateType], sTemplateType + " type: Returned the free template clone");

			assert.strictEqual(this.getTemplateCloneCount(), this.aTemplateTypes.length * 3,
				(this.aTemplateTypes.length * 3) + " template clones exist");
			assert.strictEqual(this.oColumn._mTemplateClones[sTemplateType].length, 3, sTemplateType + " type: 3 template clones exist");

			assert.strictEqual(this.oColumn, Column.ofCell(oTemplateClone),
				sTemplateType + " type: Column of the template clone can be obtained with Column.ofCell");

			assert.ok(oGetFreeTemplateCloneSpy.calledOnce, sTemplateType + " type: Column#_getFreeTemplateClone was called once");
			assert.ok(oGetFreeTemplateCloneSpy.calledWithExactly(sTemplateType),
				"Column#_getFreeTemplateClone was called with templateType=" + sTemplateType);

			assert.ok(mTemplateCloneFunctionSpies[sTemplateType].notCalled, "Template#clone was not called");

			oGetFreeTemplateCloneSpy.reset();
		}
	});

	QUnit.test("_destroyTemplateClones", function(assert) {
		var mCloneSpies = {};
		var sTemplateType;
		var that = this;

		function createCloneAndDestroySpy(sTemplateType, bHasParent, bDestroyed) {
			var oClone = that.createTemplateCloneDummy(bHasParent, bDestroyed);

			if (mCloneSpies[sTemplateType] == null) {
				mCloneSpies[sTemplateType] = [];
			}

			mCloneSpies[sTemplateType].push(sinon.spy(oClone, "destroy"));

			return oClone;
		}

		function createTemplateClones() {
			for (var j = 0; j < that.aTemplateTypes.length; j++) {
				sTemplateType = that.aTemplateTypes[j];

				that.oColumn._mTemplateClones[sTemplateType] = [
					null,
					createCloneAndDestroySpy(sTemplateType, true),
					createCloneAndDestroySpy(sTemplateType),
					createCloneAndDestroySpy(sTemplateType, true, true),
					createCloneAndDestroySpy(sTemplateType)
				];
			}
		}

		// Destroy all clones
		createTemplateClones();
		this.oColumn._destroyTemplateClones();

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			sTemplateType = this.aTemplateTypes[i];

			assert.ok(
				mCloneSpies[sTemplateType][0].calledOnce
				&& mCloneSpies[sTemplateType][1].calledOnce
				&& mCloneSpies[sTemplateType][3].calledOnce,
				sTemplateType + " type: Template clones have been destroyed"
			);
			assert.ok(mCloneSpies[sTemplateType][2].notCalled, sTemplateType + " type: The already destroyed clone was not destroyed again");
		}

		assert.strictEqual(this.getTemplateCloneCount(), 0, "The clone pool has been cleared");

		// Destroy clones of a certain type
		mCloneSpies = {};
		createTemplateClones();

		for (var j = 0; j < this.aTemplateTypes.length; j++) {
			sTemplateType = this.aTemplateTypes[j];

			this.oColumn._destroyTemplateClones(sTemplateType);

			assert.ok(
				mCloneSpies[sTemplateType][0].calledOnce
				&& mCloneSpies[sTemplateType][1].calledOnce
				&& mCloneSpies[sTemplateType][3].calledOnce,
				sTemplateType + " type: Template clones have been destroyed"
			);
			assert.ok(mCloneSpies[sTemplateType][2].notCalled, sTemplateType + " type: The already destroyed clone was not destroyed again");
			assert.deepEqual(this.oColumn._mTemplateClones[sTemplateType], [],
				sTemplateType + " type: The clones of this type have been removed from the pool");
		}

		assert.strictEqual(this.getTemplateCloneCount(), 0, "The clone pool has been cleared");
	});

	QUnit.test("Setting a template", function(assert) {
		var oDestroyTemplateClonesSpy = sinon.spy(this.oColumn, "_destroyTemplateClones");

		for (var i = 0; i < this.aTemplateTypes.length; i++) {
			var sTemplateType = this.aTemplateTypes[i];

			this.setTemplate(sTemplateType, new TableQUnitUtils.TestControl());
			assert.ok(oDestroyTemplateClonesSpy.calledOnce,
				sTemplateType + " type: Column#_destroyTemplateClones was called once when setting a template");
			assert.ok(oDestroyTemplateClonesSpy.calledWithExactly(sTemplateType),
				sTemplateType + " type: Column#_destroyTemplateClones was called with the correct type information");

			oDestroyTemplateClonesSpy.reset();
		}
	});

	QUnit.test("Destruction of a template", function(assert) {
		var sTemplateType;
		var i;

		// Column#destroy*Template

		for (i = 0; i < this.aTemplateTypes.length; i++) {
			this.setTemplate(this.aTemplateTypes[i], new TableQUnitUtils.TestControl());
		}

		var oDestroyTemplateClonesSpy = sinon.spy(this.oColumn, "_destroyTemplateClones");

		for (i = 0; i < this.aTemplateTypes.length; i++) {
			sTemplateType = this.aTemplateTypes[i];

			this.destroyTemplate(sTemplateType);
			assert.ok(oDestroyTemplateClonesSpy.calledOnce,
				sTemplateType + " type: Column#_destroyTemplateClones was called once when destroying a template");
			assert.ok(oDestroyTemplateClonesSpy.calledWithExactly(sTemplateType),
				sTemplateType + " type: Column#_destroyTemplateClones was called with the correct type information");

			oDestroyTemplateClonesSpy.reset();
		}

		// Control#destroy

		for (i = 0; i < this.aTemplateTypes.length; i++) {
			this.setTemplate(this.aTemplateTypes[i], new TableQUnitUtils.TestControl());
		}

		oDestroyTemplateClonesSpy.reset();

		for (i = 0; i < this.aTemplateTypes.length; i++) {
			sTemplateType = this.aTemplateTypes[i];

			if (sTemplateType === "Creation") {
				if (this.oColumn.getMetadata().getAllPrivateAggregations().creationTemplate) {
					return;
				} else {
					assert.ok(false, "The 'creationTemplate' is not hidden anymore. Enable this test for this template type.");
				}
			}

			this.getTemplate(sTemplateType).destroy();
			assert.ok(oDestroyTemplateClonesSpy.calledOnce,
				sTemplateType + " type: Column#_destroyTemplateClones was called once when destroying a template");
			assert.ok(oDestroyTemplateClonesSpy.calledWithExactly(sTemplateType),
				sTemplateType + " type: Column#_destroyTemplateClones was called with the correct type information");

			oDestroyTemplateClonesSpy.reset();
		}
	});

	QUnit.test("Destruction of the column", function(assert) {
		var oDestroyTemplateClonesSpy = sinon.spy(this.oColumn, "_destroyTemplateClones");

		this.oColumn.destroy();

		assert.ok(oDestroyTemplateClonesSpy.calledOnce, "Column#_destroyTemplateClones was called once when destroying the column");
		assert.ok(oDestroyTemplateClonesSpy.calledWithExactly(), "Column#_destroyTemplateClones was called with the correct type information");
	});

	QUnit.module("Column Visibility Submenu", {
		beforeEach: function() {
			var oModel = new JSONModel();
			oModel.setData([{myProp: "someValue", myOtherProp: "someOtherValue"}]);
			this._oTable = new Table();
			this._oTable.bindRows("/");
			this._oTable.setModel(oModel);
			this._oTable.setShowColumnVisibilityMenu(true);

			this._oColumn1 = new Column({
				template: new TableQUnitUtils.TestControl({text: "col1value"}),
				label: new TableQUnitUtils.TestControl({text: "col1header"})
			});

			this._oColumn2 = new Column({
				template: new TableQUnitUtils.TestControl({text: "col2value"}),
				label: new TableQUnitUtils.TestControl({text: "col2header"})
			});

			this._oTable.addColumn(this._oColumn1);
			this._oTable.addColumn(this._oColumn2);

			this._oTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this._oColumn1.destroy();
			this._oColumn2.destroy();
			this._oTable.destroy();
		}
	});

	QUnit.test("Visibility Submenu number of items", function(assert) {
		this._oColumn1._openMenu();
		var oColumnMenuBefore = this._oColumn1.getMenu();
		var oVisibilitySubmenu = oColumnMenuBefore.getItems()[0].getSubmenu();
		assert.strictEqual(oVisibilitySubmenu.getItems().length, 2, "The visibility submenu has 2 items");

		this._oTable.removeColumn(this._oColumn2);
		this._oColumn1._openMenu();
		var oColumnMenuAfter = this._oColumn1.getMenu();
		oVisibilitySubmenu = oColumnMenuAfter.getItems()[0].getSubmenu();
		assert.strictEqual(oColumnMenuBefore, oColumnMenuAfter, "The column menu is not being recreated");
		assert.strictEqual(oVisibilitySubmenu.getItems().length, 1, "The visibility submenu has 1 items");

		oColumnMenuBefore = oColumnMenuAfter;
		this._oTable.removeAllColumns();
		this._oTable.addColumn(this._oColumn1);
		this._oTable.addColumn(this._oColumn2);
		this._oColumn3 = new Column({
			template: new TableQUnitUtils.TestControl({text: "col3value"}),
			label: new TableQUnitUtils.TestControl({text: "col3header"})
		});
		this._oTable.addColumn(this._oColumn3);
		this._oColumn1._openMenu();
		oColumnMenuAfter = this._oColumn1.getMenu();
		oVisibilitySubmenu = oColumnMenuAfter.getItems()[0].getSubmenu();
		assert.strictEqual(oColumnMenuBefore, oColumnMenuAfter, "The column menu is not being recreated");
		assert.strictEqual(oVisibilitySubmenu.getItems().length, 3, "The visibility submenu has 3 items");

		var spy = this.spy(this._oColumn3, "exit");
		this._oColumn3.destroy();
		assert.ok(spy.calledOnce, "The exit function was called");
	});

	QUnit.test("Set Visibility", function(assert) {
		this._oColumn1._openMenu();
		var oColumnMenuBefore = this._oColumn1.getMenu();
		var oVisibilitySubmenuBefore = oColumnMenuBefore.getItems()[0].getSubmenu();
		assert.strictEqual(oVisibilitySubmenuBefore.getItems()[0].getIcon(), "sap-icon://accept", "The visibility submenu item is checked");
		assert.strictEqual(oVisibilitySubmenuBefore.getItems()[1].getIcon(), "sap-icon://accept", "The visibility submenu item is checked");

		this._oColumn2.setVisible(false);
		this._oColumn1._openMenu();
		var oColumnMenuAfter = this._oColumn1.getMenu();
		var oVisibilitySubmenuAfter = oColumnMenuAfter.getItems()[0].getSubmenu();
		assert.strictEqual(oColumnMenuBefore, oColumnMenuAfter, "The column menu is not being recreated");
		assert.strictEqual(oVisibilitySubmenuBefore, oVisibilitySubmenuAfter, "The column visibility submenu is not being recreated");

		assert.strictEqual(oVisibilitySubmenuAfter.getItems()[0].getIcon(), "sap-icon://accept", "The visibility submenu item is checked");
		assert.strictEqual(oVisibilitySubmenuAfter.getItems()[1].getIcon(), "", "The visibility submenu item is not checked");
	});

	QUnit.test("Reorder Columns", function(assert) {
		this._oColumn1._openMenu();
		var oColumnMenu = this._oColumn1.getMenu();
		var oVisibilitySubmenu = oColumnMenu.getItems()[0].getSubmenu();
		assert.strictEqual(oVisibilitySubmenu.getItems()[0].getProperty("text"), "col1header", "The columns are initially in the correct order");
		assert.strictEqual(oVisibilitySubmenu.getItems()[1].getProperty("text"), "col2header", "The columns are initially in the correct order");
		this._oTable.removeColumn(this._oColumn1);
		this._oTable.insertColumn(this._oColumn1, 1);
		this._oColumn1._openMenu();
		var oColumnMenu = this._oColumn1.getMenu();
		var oVisibilitySubmenu = oColumnMenu.getItems()[0].getSubmenu();
		assert.strictEqual(oVisibilitySubmenu.getItems()[0].getProperty("text"), "col2header", "The columns are in the correct order after reordering");
		assert.strictEqual(oVisibilitySubmenu.getItems()[1].getProperty("text"), "col1header", "The columns are in the correct order after reordering");
	});

	QUnit.test("Multiple tables", function(assert) {
		var oModel = new JSONModel();
		oModel.setData([{myProp: "someValue", myOtherProp: "someOtherValue"}]);
		this._oTable2 = new Table();
		this._oTable2.bindRows("/");
		this._oTable2.setModel(oModel);
		this._oTable2.setShowColumnVisibilityMenu(true);

		this._oColumn21 = new Column({
			template: new TableQUnitUtils.TestControl({text: "col1value"}),
			label: new TableQUnitUtils.TestControl({text: "col1header"})
		});

		this._oColumn22 = new Column({
			template: new TableQUnitUtils.TestControl({text: "col2value"}),
			label: new TableQUnitUtils.TestControl({text: "col2header"})
		});

		this._oColumn23 = new Column({
			template: new TableQUnitUtils.TestControl({text: "col3value"}),
			label: new TableQUnitUtils.TestControl({text: "col3header"})
		});

		this._oTable2.addColumn(this._oColumn21);
		this._oTable2.addColumn(this._oColumn22);
		this._oTable2.addColumn(this._oColumn23);

		this._oTable2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		this._oColumn2.setVisible(false);
		this._oColumn1._openMenu();
		var oColumnMenuTable1 = this._oColumn1.getMenu();
		var oVisibilitySubmenuTable1 = oColumnMenuTable1.getItems()[0].getSubmenu();
		assert.strictEqual(oVisibilitySubmenuTable1.getItems()[0].getIcon(), "sap-icon://accept", "The visibility submenu item is checked");
		assert.strictEqual(oVisibilitySubmenuTable1.getItems()[1].getIcon(), "", "The visibility submenu item is not checked");

		this._oColumn21._openMenu();
		var oColumnMenuTable2 = this._oColumn21.getMenu();
		var oVisibilitySubmenuTable2 = oColumnMenuTable2.getItems()[0].getSubmenu();
		assert.strictEqual(oVisibilitySubmenuTable2.getItems()[0].getIcon(), "sap-icon://accept", "The visibility submenu item is checked");
		assert.strictEqual(oVisibilitySubmenuTable2.getItems()[1].getIcon(), "sap-icon://accept", "The visibility submenu item is checked. Changing the column visibility in the first table hasn't affected the column visibility in the second table");

		assert.notEqual(oVisibilitySubmenuTable1, oVisibilitySubmenuTable2, "The visibility submenu instances for both tables are not the same instance");
		assert.equal(oVisibilitySubmenuTable1.getItems().length, 2, "The visibility submenu of the first table has 2 items");
		assert.equal(oVisibilitySubmenuTable2.getItems().length, 3, "The visibility submenu of the second table has 3 items");

		this._oColumn21.destroy();
		this._oColumn22.destroy();
		this._oColumn23.destroy();
		this._oTable2.destroy();
	});
});