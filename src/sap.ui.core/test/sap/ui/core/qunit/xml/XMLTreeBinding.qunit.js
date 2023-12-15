/*global QUnit */
sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/xml/XMLModel",
	"sap/ui/model/xml/XMLTreeBinding"
], function(Filter, FilterOperator, FilterType, Sorter, XMLModel, XMLTreeBinding) {
	"use strict";

	var testData =
		"<root>" +
			"<orgStructure>" +
				"<level00 name=\"Peter Cliff\" gender=\"male\">" +
					"<level10 name=\"Inga Horst\" gender=\"female\">" +
						"<level20 name=\"John Wallace\" gender=\"male\"></level20>" +
						"<level21 name=\"Frank Wallace\" gender=\"male\"></level21>" +
						"<level22 name=\"Gina Rush\" gender=\"female\"></level22>" +
					"</level10>" +
					"<level11 name=\"Tom Bay\" gender=\"male\">" +
					"</level11>" +
					"<level12 name=\"Catherine Platte\" gender=\"female\">" +
					"</level12>" +
				"</level00>" +
			"</orgStructure>" +
			"<orgStructure2>" +
				"<level00 name=\"Inga Horst\" gender=\"female\">" +
					"<level10 name=\"John Wallace\" gender=\"male\"></level10>" +
					"<level11 name=\"Frank Wallace\" gender=\"male\"></level11>" +
					"<level12 name=\"Gina Rush\" gender=\"female\"></level12>" +
				"</level00>" +
				"<level00 name=\"Tom Bay\" gender=\"male\"></level00>" +
				"<level00 name=\"Catherine Platte\" gender=\"female\"></level00>" +
			"</orgStructure2>" +
			"<orgStructureAppControlFilter>" +
				"<level00 name=\"Peter Cliff\" gender=\"male\" tree=\"#1\">" +
					"<level10 name=\"Inga Horst\" gender=\"female\" tree=\"#1\">" +
						"<level20 name=\"John Doe\" gender=\"male\" tree=\"#1\"></level20>" +
						"<level21 name=\"Jennifer Wallace\" gender=\"female\" tree=\"#1\"></level21>" +
					"</level10>" +
					"<level11 name=\"Tom Bay\" gender=\"male\">" +
					"</level11>" +
					"<level12 name=\"Catherine Platte\" gender=\"female\">" +
					"</level12>" +
				"</level00>" +
			"</orgStructureAppControlFilter>" +
		"</root>";


	QUnit.module("sap.ui.model.xml.XMLTreeBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			this.oModel = new XMLModel();
			this.oModel.setXML(testData);
		},
		afterEach: function() {
			this.oModel.destroy();
		},
		createTreeBinding: function(sPath, oContext, aFilters, mParameters, aSorters) {
			return this.oModel.bindTree(sPath, oContext, aFilters || [], mParameters, aSorters);
		}
	});

	QUnit.test("TreeBinding getRootContexts getNodeContexts", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure");
		var contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure", "TreeBinding path");
		assert.equal(treeBinding.getModel(), this.oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name",context), "Peter Cliff", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(context);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name",context), "Inga Horst", "TreeBinding node content");

		context = contexts[2];
		assert.equal(this.oModel.getProperty("@name",context), "Catherine Platte", "TreeBinding node content");

		assert.equal(treeBinding.getChildCount(contexts[0]), 3, "TreeBinding childcount");
		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name",context), "Frank Wallace", "TreeBinding node content");

	});

	QUnit.test("TreeBinding relative getRootContexts getNodeContexts", function(assert) {
		var treeBinding = this.createTreeBinding("orgStructure"),
			contexts,
			context;

		 treeBinding.setContext(this.oModel.getContext("/"));

		 assert.equal(treeBinding.getPath(), "orgStructure", "TreeBinding path");
		 assert.equal(treeBinding.getModel(), this.oModel, "TreeBinding model");

		 contexts = treeBinding.getRootContexts();
		 assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		 context = contexts[0];
		 assert.equal(this.oModel.getProperty("@name",context), "Peter Cliff", "TreeBinding root content");

		 contexts = treeBinding.getNodeContexts(context);
		 assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		 context = contexts[0];
		 assert.equal(this.oModel.getProperty("@name",context), "Inga Horst", "TreeBinding node content");

		 context = contexts[2];
		 assert.equal(this.oModel.getProperty("@name",context), "Catherine Platte", "TreeBinding node content");

		 assert.equal(treeBinding.getChildCount(contexts[0]), 3, "TreeBinding childcount");
		 contexts = treeBinding.getNodeContexts(contexts[0]);
		 assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		 context = contexts[1];
		 assert.equal(this.oModel.getProperty("@name",context), "Frank Wallace", "TreeBinding node content");

	 });

	QUnit.test("TreeBinding getRootContexts getNodeContexts setXML", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure"),
			contexts,
			context;

		assert.ok(treeBinding instanceof XMLTreeBinding, "treeBinding class check");
		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		var newData = "<root>" +
				"<orgStructure>" +
					"<level00 name=\"root1\">" +
						"<level10 name=\"subnode1\">" +
							"<level20 name=\"subsubnode1\"></level20>" +
						"</level10>" +
					"</level00>" +
					"<level01 name=\"root2\">" +
						"<level10 name=\"subnode2\">" +
						"</level10>" +
					"</level01>" +
				"</orgStructure>" +
			"</root>";
		this.oModel.setXML(newData);
		treeBinding = this.createTreeBinding("/orgStructure");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 2, "TreeBinding rootContexts length");
		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name", context), "root2", "TreeBinding node content");
		contexts = treeBinding.getNodeContexts(context);
		assert.equal(contexts.length, 1, "TreeBinding nodeContexts length");
		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name", context), "subnode2", "TreeBinding node content");

		this.oModel.createBindingContext("/orgStructure/level00", null, function(newContext){
			context = newContext;
		});
		assert.equal(this.oModel.getProperty("@name", context), "root1", "TreeBinding node content");
		this.oModel.createBindingContext("/orgStructure/level00/level10", null, function(newContext){
			context = newContext;
		});
		assert.equal(this.oModel.getProperty("@name", context), "subnode1", "TreeBinding node content");
		this.oModel.createBindingContext("/orgStructure/level00/level10/level20", null, function(newContext){
			context = newContext;
		});
		assert.equal(this.oModel.getProperty("@name", context), "subsubnode1", "TreeBinding node content");

	});

	QUnit.test("TreeBinding filters and setData again", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure");

		this.oModel.addBinding(treeBinding);

		// Filter for node with name containing 'in'
		var oFilter1 = new Filter("@name", FilterOperator.Contains, "alla");
		treeBinding.filter(oFilter1);

		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(treeBinding.getChildCount(), 1, "TreeBinding rootContexts length");
		assert.equal(treeBinding.getChildCount(filteredContext[0]), 1, "TreeBinding rootContexts length");

		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(treeBinding.getChildCount(nodeContexts1[0]), 2, "TreeBinding nodeContexts length");

		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 2, "TreeBinding nodeContexts length");
		assert.equal(treeBinding.getChildCount(nodeContexts2[0]), 0, "TreeBinding nodeContexts length");
		assert.equal(treeBinding.getChildCount(nodeContexts2[1]), 0, "TreeBinding nodeContexts length");

		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "John Wallace", "TreeBinding filter value");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[1]), "Frank Wallace", "TreeBinding filter value");

		var newData = "<root>" +
		"<orgStructure>" +
		"<level00 name=\"Peter Cliffs\" gender=\"male\">" +
			"<level11 name=\"Mason Storm\" gender=\"male\">" +
			"</level11>" +
			"<level12 name=\"Catherine Pallate\" gender=\"female\">" +
			"</level12>" +
		"</level00>" +
		"</orgStructure></root>";
		this.oModel.setXML(newData);

		// check if filter got reapplied:
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(treeBinding.getChildCount(filteredContext[0]), 1, "TreeBinding rootContexts length");

		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(treeBinding.getChildCount(nodeContexts1[0]), 0, "TreeBinding nodeContexts length");

		assert.equal(this.oModel.getProperty("@name", nodeContexts1[0]), "Catherine Pallate", "TreeBinding filter value");
		this.oModel.removeBinding(treeBinding);
	});

	QUnit.test("TreeBinding multi filters", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure");

		var oFilter1 = new Filter("@name", FilterOperator.Contains, "in");
		var oFilter2 = new Filter("@name", FilterOperator.Contains, "al");
		var oMultiFilter1 = new Filter([oFilter1, oFilter2], false);
		var oFilter3 = new Filter("@gender", FilterOperator.EQ, "female");
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], true);
		treeBinding.filter([oMultiFilter2]);
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 2, "TreeBinding nodeContexts length");
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "Gina Rush", "TreeBinding filter value");
		assert.equal(this.oModel.getProperty("@name", nodeContexts1[1]), "Catherine Platte", "TreeBinding filter value");
	});

	QUnit.test("TreeBinding - Application & Control filters - initial filters", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructureAppControlFilter", null,
			[new Filter("@tree", FilterOperator.Contains, "#1")]
		);

		//control filters after initial application filters
		treeBinding.filter(new Filter("@name", FilterOperator.Contains, "John"), FilterType.Control);

		//Peter
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(this.oModel.getProperty("@name", filteredContext[0]), "Peter Cliff", "TreeBinding filter value");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts1[0]), "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "John Doe", "TreeBinding filter value");
	});

	QUnit.test("TreeBinding - Application & Control filters - clear filters", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructureAppControlFilter");

		// apply application/control filters
		treeBinding.filter(new Filter("@tree", FilterOperator.Contains, "#1"), "Application");
		treeBinding.filter(new Filter("@name", FilterOperator.Contains, "Jennifer"), FilterType.Control);

		//Peter
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");

		//only Jennifer Wallace filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "Jennifer Wallace", "TreeBinding filter value");

		//change control filter
		treeBinding.filter();

		//1st level
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//2nd level
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 3, "2nd level length is correct");

		//3rd level
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 2, "3rd level length is correct");
	});

	QUnit.test("TreeBinding - Application & Control filters - clear filters separately", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructureAppControlFilter"),
			filteredContext;

		// apply application/control filters
		treeBinding.filter(new Filter("@tree", FilterOperator.Contains, "#1"), "Application");
		treeBinding.filter(new Filter("@name", FilterOperator.Contains, "Jennifer"), FilterType.Control);

		//Peter
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");

		//only Jennifer Wallace filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "Jennifer Wallace", "TreeBinding filter value");

		//remove app filter but not control filter
		treeBinding.filter([], FilterType.Application);

		//Peter
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//Inga
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");

		//only Jennifer Wallace filtered
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "Jennifer Wallace", "TreeBinding filter value");

		treeBinding.filter([], FilterType.Control);

		//1st level
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//2nd level
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 3, "2nd level length is correct");

		//3rd level
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 2, "3rd level length is correct");
	});

	QUnit.test("TreeBinding - Application & Control filters - changing filters", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructureAppControlFilter"),
			filteredContext;

		// apply application/control filters
		treeBinding.filter(new Filter("@tree", FilterOperator.Contains, "#1"), "Application");
		treeBinding.filter(new Filter("@name", FilterOperator.Contains, "Jennifer"), FilterType.Control);

		//Peter
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");

		//only Jennifer Wallace filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "Jennifer Wallace", "TreeBinding filter value");

		//change control filter
		treeBinding.filter(new Filter("@name", FilterOperator.Contains, "John"), FilterType.Control);

		//Peter
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(this.oModel.getProperty("@name", filteredContext[0]), "Peter Cliff", "TreeBinding filter value");

		//Inga
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts1[0]), "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(this.oModel.getProperty("@name", nodeContexts2[0]), "John Doe", "TreeBinding filter value");
	});

	QUnit.test("Display Root Node", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure/level00", null, [], {
				displayRootNode: true
			}),
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure/level00", "TreeBinding path");
		assert.equal(treeBinding.getModel(), this.oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name",context), "Peter Cliff", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(context);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name",context), "Inga Horst", "TreeBinding node content");

		context = contexts[2];
		assert.equal(this.oModel.getProperty("@name",context), "Catherine Platte", "TreeBinding node content");

		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name",context), "Frank Wallace", "TreeBinding node content");

	});

	QUnit.test("Bind aggregation (not possible with XML behave normal)", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure2"),
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure2", "TreeBinding path");
		assert.equal(treeBinding.getModel(), this.oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 3, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name", context), "Inga Horst", "TreeBinding root content");

		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name", context), "Tom Bay", "TreeBinding root content");

		context = contexts[2];
		assert.equal(this.oModel.getProperty("@name", context), "Catherine Platte", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name", context), "John Wallace", "TreeBinding node content");

		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name", context), "Frank Wallace", "TreeBinding node content");

		context = contexts[2];
		assert.equal(this.oModel.getProperty("@name", context), "Gina Rush", "TreeBinding node content");
	});

	QUnit.test("Paging", function(assert) {
		var treeBinding = this.createTreeBinding("/orgStructure2"),
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure2", "TreeBinding path");
		assert.equal(treeBinding.getModel(), this.oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts(0,2);
		assert.equal(contexts.length, 2, "TreeBinding returned rootContexts length");
		assert.equal(treeBinding.getChildCount(null), 3, "TreeBinding actual rootContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name", context), "Inga Horst", "TreeBinding root content");

		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name", context), "Tom Bay", "TreeBinding root content");

		context = contexts[0];
		contexts = treeBinding.getNodeContexts(context, 1, 2);
		assert.equal(contexts.length, 2, "TreeBinding returned nodeContexts length");
		assert.equal(treeBinding.getChildCount(context), 3, "TreeBinding actual nodeContexts length");

		context = contexts[0];
		assert.equal(this.oModel.getProperty("@name", context), "Frank Wallace", "TreeBinding node content");

		context = contexts[1];
		assert.equal(this.oModel.getProperty("@name", context), "Gina Rush", "TreeBinding node content");
	});
	// sPath, oContext, aFilters, mParameters, aSorters
	QUnit.test("Sorting - bindTree calls", function (assert) {
		var treeBinding = this.createTreeBinding("/orgStructure2", null, [], {
				displayRootNode: false
			},
			[new Sorter("@name")]); //bindTree parameter

		var aRootContexts = treeBinding.getRootContexts(0, 3);
		assert.equal(aRootContexts[0].getProperty("@name"), "Catherine Platte", "1st node after sorting is: Catherine Platte");
		assert.equal(aRootContexts[1].getProperty("@name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("@name"), "Tom Bay", "3rd node after sorting is: Tom Bay");

		var aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("@name"), "Frank Wallace", "Inga child node[0] after sorting is: Frank Wallace");
		assert.equal(aChildContexts[1].getProperty("@name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("@name"), "John Wallace", "Inga child node[2]] after sorting is: John Wallace");

		//change sorters afterwards
		treeBinding.sort(new Sorter("@name", true));

		aRootContexts = treeBinding.getRootContexts(0, 3);
		assert.equal(aRootContexts[0].getProperty("@name"), "Tom Bay", "1st node after sorting is: Tom Bay");
		assert.equal(aRootContexts[1].getProperty("@name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("@name"), "Catherine Platte", "3rd node after sorting is: Catherine Platte");

		aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("@name"), "John Wallace", "Inga child node[0] after sorting is: John Wallace");
		assert.equal(aChildContexts[1].getProperty("@name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("@name"), "Frank Wallace", "Inga child node[2]] after sorting is: Frank Wallace");

	});

	QUnit.test("Sorting - sort() calls", function (assert) {
		var treeBinding = this.createTreeBinding("/orgStructure2", {
			displayRootNode: true
		});

		treeBinding.sort(new Sorter("@name"));

		var aRootContexts = treeBinding.getRootContexts(0, 3);
		assert.equal(aRootContexts[0].getProperty("@name"), "Catherine Platte", "1st node after sorting is: Catherine Platte");
		assert.equal(aRootContexts[1].getProperty("@name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("@name"), "Tom Bay", "3rd node after sorting is: Tom Bay");

		var aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("@name"), "Frank Wallace", "Inga child node[0] after sorting is: Frank Wallace");
		assert.equal(aChildContexts[1].getProperty("@name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("@name"), "John Wallace", "Inga child node[2]] after sorting is: John Wallace");

		//change sorters afterwards -> descending
		treeBinding.sort(new Sorter("@name", true));

		aRootContexts = treeBinding.getRootContexts(0, 3);
		assert.equal(aRootContexts[0].getProperty("@name"), "Tom Bay", "1st node after sorting is: Tom Bay");
		assert.equal(aRootContexts[1].getProperty("@name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("@name"), "Catherine Platte", "3rd node after sorting is: Catherine Platte");

		aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("@name"), "John Wallace", "Inga child node[0] after sorting is: John Wallace");
		assert.equal(aChildContexts[1].getProperty("@name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("@name"), "Frank Wallace", "Inga child node[2]] after sorting is: Frank Wallace");

		// empty sort() -> remove sorters
		treeBinding.sort();

		aRootContexts = treeBinding.getRootContexts(0, 3);
		assert.equal(aRootContexts[0].getProperty("@name"), "Inga Horst", "1st node after sorting is: Inga Horst");
		assert.equal(aRootContexts[1].getProperty("@name"), "Tom Bay", "2nd node after sorting is: Tom Bay");
		assert.equal(aRootContexts[2].getProperty("@name"), "Catherine Platte", "3rd node after sorting is: Catherine Platte");

		aChildContexts = treeBinding.getNodeContexts(aRootContexts[0]);
		assert.equal(aChildContexts[0].getProperty("@name"), "John Wallace", "Inga child node[0] after sorting is: John Wallace");
		assert.equal(aChildContexts[1].getProperty("@name"), "Frank Wallace", "Inga child node[1] after sorting is: Frank Wallace");
		assert.equal(aChildContexts[2].getProperty("@name"), "Gina Rush", "Inga child node[2] after sorting is: Gina Rush");
	});

});
