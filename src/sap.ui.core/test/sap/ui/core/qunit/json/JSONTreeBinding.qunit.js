/*global QUnit */
sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONTreeBinding"
], function(
	Filter,
	FilterOperator,
	FilterType,
	Sorter,
	JSONModel,
	JSONTreeBinding
) {
	"use strict";

	var oModel;
	var testData;
	var bindings;

	function setup(){
		// reset bindings
		bindings = [];
		testData = {
			orgStructure:{
				 0: {
					name: "Peter Cliff",
					gender: "male",
					0: {
						name: "Inga Horst",
						gender: "female",
						0: {
							name: "John Wallace",
							gender: "male"
						},
						1: {
							name: "Frank Wallace",
							gender: "male"
						},
						2: {
							name: "Gina Rush",
							gender: "female"
						},
						noTreeNode: null //Test cases should not break because of null nodes
					},
					1: {
						name: "Tom Bay",
						gender: "male"
					},
					2: {
						name: "Catherine Platte",
						gender: "female"
					},
					noTreeNode: null
				}
			},
			orgStructure2: [
				{
					name: "Inga Horst",
					gender: "female",
					children: [
						{
							name: "John Wallace",
							gender: "male"
						},
						{
							name: "Frank Wallace",
							gender: "male"
						},
						{
							name: "Gina Rush",
							gender: "female"
						},
						null
					]
				},
				{
					name: "Tom Bay",
					gender: "male"
				},
				{
					name: "Catherine Platte",
					gender: "female"
				},
				null
			],
			orgStructureAppControlFilter:{
				 0: {
					name: "Peter Cliff",
					gender: "male",
					tree: "#1",
					0: {
						name: "Inga Horst",
						gender: "female",
						tree: "#1",
						0: {
							name: "John Doe",
							gender: "male",
							tree: "#1"
						},
						1: {
							name: "Jennifer Wallace",
							gender: "female",
							tree: "#1"
						},
						noTreeNode: null //Test cases should not break because of null nodes
					},
					1: {
						name: "Tom Bay",
						gender: "male",
						0: {
							name: "Jane Fields",
							gender: "female",
							0: {
								name: "Catherine Brook",
								gender: "female"
							},
							1: {
								name: "Rick Lee",
								gender: "male"
							}
						}
					},
					2: {
						name: "Catherine Platte",
						gender: "female"
					},
					noTreeNode: null
				}
			}
		};
		oModel = new JSONModel();
		oModel.setData(testData);
	}


	//creates a certain data
	function createData(iAmount) {
		var oData = {
			root:{
				id: "root",
				name: "root",
				description: "moep moep",
				checked: false,
				children: []
			}
		};

		var addChildren = function (oNode, iChildCount) {
			for (var i = 0; i < iChildCount; i++) {
				var sGroupID = oNode.id + "-" + i;
				oNode.children.push({
					id: sGroupID,
					name: "Node(" + sGroupID + ")",
					description: "Hello, I am the description for node #" + sGroupID,
					children: []
				});
			}
		};

		addChildren(oData.root, iAmount);

		for (var i = 0; i < oData.root.children.length; i++) {
			var oChild = oData.root.children[i];
			addChildren(oChild, iAmount);
		}

		oModel = new JSONModel();
		oModel.setData(oData);
	}


	function createTreeBinding(sPath, oContext, aFilters, mParameters, aSorters){
		// create binding
		bindings = [];
		bindings[0] = oModel.bindTree(sPath, oContext, aFilters || [], mParameters, aSorters);
	}

	function getErrorWithMessage(sFilter) {
		return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
	}

	QUnit.module("sap.ui.model.json.JSONTreebinding", {
		beforeEach: function () {
			setup();
		}
	});

	QUnit.test("TreeBinding getRootContexts getNodeContexts", function(assert) {
		createTreeBinding("/orgStructure");
		var treeBinding = bindings[0],
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure", "TreeBinding path");
		assert.equal(treeBinding.getModel(), oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Peter Cliff", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(context);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Inga Horst", "TreeBinding node content");

		context = contexts[2];
		assert.equal(oModel.getProperty("name", context), "Catherine Platte", "TreeBinding node content");

		assert.equal(treeBinding.getChildCount(contexts[0]), 3, "TreeBinding childcount");
		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Frank Wallace", "TreeBinding node content");

	});

	QUnit.test("TreeBinding relative getRootContexts getNodeContexts", function(assert) {
		 createTreeBinding("orgStructure");
		 var treeBinding = bindings[0],
			 contexts,
			 context;

		 treeBinding.setContext(oModel.getContext("/"));

		 assert.equal(treeBinding.getPath(), "orgStructure", "TreeBinding path");
		 assert.equal(treeBinding.getModel(), oModel, "TreeBinding model");

		 contexts = treeBinding.getRootContexts();
		 assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		 context = contexts[0];
		 assert.equal(oModel.getProperty("name", context), "Peter Cliff", "TreeBinding root content");

		 contexts = treeBinding.getNodeContexts(context);
		 assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		 context = contexts[0];
		 assert.equal(oModel.getProperty("name", context), "Inga Horst", "TreeBinding node content");

		 context = contexts[2];
		 assert.equal(oModel.getProperty("name", context), "Catherine Platte", "TreeBinding node content");

		 assert.equal(treeBinding.getChildCount(contexts[0]), 3, "TreeBinding childcount");
		 contexts = treeBinding.getNodeContexts(contexts[0]);
		 assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		 context = contexts[1];
		 assert.equal(oModel.getProperty("name", context), "Frank Wallace", "TreeBinding node content");

	 });

	QUnit.test("TreeBinding getRootContexts getNodeContexts", function(assert) {
		createTreeBinding("/orgStructure");
		var treeBinding = bindings[0],
			contexts,
			context;

		assert.ok(treeBinding instanceof JSONTreeBinding, "treeBinding class check");
		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		var newData = {
			orgStructure:{
				0: {
					name: "root1",
					0: {
						name: "subnode1",
						0: {
							name: "subsubnode1"
						}
					}
				},
				1: {
					name: "root2",
					0: {
						name: "subnode2"
					}
				}
			}
		};
		oModel.setData(newData);
		createTreeBinding("/orgStructure");
		treeBinding = bindings[0];

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 2, "TreeBinding rootContexts length");
		context = contexts[1];
		contexts = treeBinding.getNodeContexts(context);
		assert.equal(contexts.length, 1, "TreeBinding nodeContexts length");
		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "subnode2", "TreeBinding node content");
	});

	QUnit.test("TreeBinding single filters", function(assert) {
		createTreeBinding("/orgStructure");

		var treeBinding = bindings[0];

		// Filter for node with name containing 'in', three matches expected: Inga Horst, Catherine Platte and Gina Rush
		var oFilter1 = new Filter("name", FilterOperator.Contains, "in");
		treeBinding.filter(oFilter1);

		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 2, "TreeBinding nodeContexts length");

		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");

		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "Gina Rush", "TreeBinding filter value");
		assert.equal(oModel.getProperty(nodeContexts1[1].getPath()).name, "Catherine Platte", "TreeBinding filter value");
	});

	QUnit.test("TreeBinding multi filters", function(assert) {
		createTreeBinding("/orgStructure");

		var treeBinding = bindings[0];

		var oFilter1 = new Filter("name", FilterOperator.Contains, "in");
		var oFilter2 = new Filter("name", FilterOperator.Contains, "al");
		var oMultiFilter1 = new Filter([oFilter1, oFilter2], false);
		var oFilter3 = new Filter("gender", FilterOperator.EQ, "female");
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], true);
		treeBinding.filter([oMultiFilter2]);
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 2, "TreeBinding nodeContexts length");
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "Gina Rush", "TreeBinding filter value");
		assert.equal(oModel.getProperty(nodeContexts1[1].getPath()).name, "Catherine Platte", "TreeBinding filter value");
	});

	QUnit.test("TreeBinding filters and setData again", function(assert) {
		createTreeBinding("/orgStructure");

		var treeBinding = bindings[0];
		oModel.addBinding(treeBinding);

		// Filter for node with name containing 'alla'
		var oFilter1 = new Filter("name", FilterOperator.Contains, "alla");
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

		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "John Wallace", "TreeBinding filter value");
		assert.equal(oModel.getProperty(nodeContexts2[1].getPath()).name, "Frank Wallace", "TreeBinding filter value");

		var newData = {orgStructure:{
			 0: {
					name: "Peter Cliffs",
					gender: "male",
					1: {
						name: "Mason Storm",
						gender: "male"
					},
					2: {
						name: "Catherine Pallate",
						gender: "female"
					}
				}
			}
		};

		oModel.setData(newData);

		// check if filter got reapplied:
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(treeBinding.getChildCount(filteredContext[0]), 1, "TreeBinding rootContexts length");

		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(treeBinding.getChildCount(nodeContexts1[0]), 0, "TreeBinding nodeContexts length");

		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Catherine Pallate", "TreeBinding filter value");
		oModel.removeBinding(treeBinding);
	});

	QUnit.test("TreeBinding - Application & Control filters - initial filters", function(assert) {
		createTreeBinding("/orgStructureAppControlFilter", null,
			[new Filter("tree", FilterOperator.Contains, "#1")]
		);

		var treeBinding = bindings[0];

		//control filters after initial application filters
		treeBinding.filter(new Filter("name", FilterOperator.Contains, "John"), FilterType.Control);

		//Peter
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Peter Cliff", "TreeBinding filter value");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "John Doe", "TreeBinding filter value");
	});

	QUnit.test("TreeBinding - Application & Control filters - clear filters", function(assert) {
		createTreeBinding("/orgStructureAppControlFilter", null,
			[new Filter("tree", FilterOperator.Contains, "#1")]
		);

		var treeBinding = bindings[0];

		//control filters after initial application filters
		treeBinding.filter(new Filter("name", FilterOperator.Contains, "John"), FilterType.Control);

		//Peter
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Peter Cliff", "TreeBinding filter value");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "John Doe", "TreeBinding filter value");

		//remove filters by calling filter with no arguments
		treeBinding.filter();

		// root level is still 1
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "root level length is 1");

		//2nd lvl
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 3, "2nd level length is 3");

		//3rd lvl
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 2, "2rd level length is 2");
	});

	QUnit.test("TreeBinding - Application & Control filters - clear filters separately", function(assert) {
		createTreeBinding("/orgStructureAppControlFilter", null,
			[new Filter("tree", FilterOperator.Contains, "#1")]
		);

		var treeBinding = bindings[0];

		//control filters after initial application filters
		treeBinding.filter(new Filter("name", FilterOperator.Contains, "John"), FilterType.Control);

		//Peter
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Peter Cliff", "TreeBinding filter value");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "John Doe", "TreeBinding filter value");

		//remove application filter...control filter should still exist
		treeBinding.filter([], FilterType.Application);

		//Peter
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Peter Cliff", "TreeBinding filter value");

		//Inga
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "John Doe", "TreeBinding filter value");

		//remove control filters by calling filter with no arguments
		treeBinding.filter([], FilterType.Control);

		// root level is still 1
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "root level length is 1");

		//2nd lvl
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 3, "2nd level length is 3");

		//3rd lvl
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 2, "2rd level length is 2");
	});

	QUnit.test("TreeBinding - Application & Control filters - changing filters", function(assert) {
		createTreeBinding("/orgStructureAppControlFilter");

		var treeBinding = bindings[0];

		// apply application/control filters
		treeBinding.filter(new Filter("tree", FilterOperator.Contains, "#1"), "Application");
		treeBinding.filter(new Filter("name", FilterOperator.Contains, "Jennifer"), FilterType.Control);

		//Peter
		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		//Inga
		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");

		//only Jennifer Wallace filtered
		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "Jennifer Wallace", "TreeBinding filter value");

		//change control filter
		treeBinding.filter(new Filter("name", FilterOperator.Contains, "John"), FilterType.Control);

		//Peter
		filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");
		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Peter Cliff", "TreeBinding filter value");

		//Inga
		nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Inga Horst", "TreeBinding filter value");

		//only John Doe filtered
		nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "John Doe", "TreeBinding filter value");
	});

	QUnit.test("Display root node", function(assert) {
		createTreeBinding("/orgStructure/0", null, [], {
			displayRootNode: true
		});

		var treeBinding = bindings[0],
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure/0", "TreeBinding path");
		assert.equal(treeBinding.getModel(), oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 1, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Peter Cliff", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(context);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Inga Horst", "TreeBinding node content");

		context = contexts[2];
		assert.equal(oModel.getProperty("name", context), "Catherine Platte", "TreeBinding node content");

		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Frank Wallace", "TreeBinding node content");
	});

	QUnit.test("TreeBinding single filter ignoring model size limit", function(assert) {
		oModel.setSizeLimit(1);
		createTreeBinding("/orgStructure");

		var treeBinding = bindings[0];

		// Filter for node with name containing 'Gina', only one expected: Gina Rush
		var oFilter1 = new Filter("name", FilterOperator.Contains, "Gina");
		treeBinding.filter(oFilter1);

		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 1, "TreeBinding rootContexts length");

		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length");

		var nodeContexts2 = treeBinding.getNodeContexts(nodeContexts1[0]);
		assert.equal(nodeContexts2.length, 1, "TreeBinding nodeContexts length");

		// Gina is the third child of node "Peter Cliff". If the size limit is ignored correctly, Gina should be found.
		assert.equal(oModel.getProperty(nodeContexts2[0].getPath()).name, "Gina Rush", "TreeBinding filter value");
	});

	QUnit.test("Bind aggregation", function(assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: true
		});

		var treeBinding = bindings[0],
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure2", "TreeBinding path");
		assert.equal(treeBinding.getModel(), oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 3, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Inga Horst", "TreeBinding root content");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Tom Bay", "TreeBinding root content");

		context = contexts[2];
		assert.equal(oModel.getProperty("name", context), "Catherine Platte", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "John Wallace", "TreeBinding node content");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Frank Wallace", "TreeBinding node content");

		context = contexts[2];
		assert.equal(oModel.getProperty("name", context), "Gina Rush", "TreeBinding node content");
	});

	QUnit.test("Bind aggregation with arrayNames param", function(assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: true,
			arrayNames: ["children"]
		});

		var treeBinding = bindings[0],
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure2", "TreeBinding path");
		assert.equal(treeBinding.getModel(), oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts();
		assert.equal(contexts.length, 3, "TreeBinding rootContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Inga Horst", "TreeBinding root content");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Tom Bay", "TreeBinding root content");

		context = contexts[2];
		assert.equal(oModel.getProperty("name", context), "Catherine Platte", "TreeBinding root content");

		contexts = treeBinding.getNodeContexts(contexts[0]);
		assert.equal(contexts.length, 3, "TreeBinding nodeContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "John Wallace", "TreeBinding node content");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Frank Wallace", "TreeBinding node content");

		context = contexts[2];
		assert.equal(oModel.getProperty("name", context), "Gina Rush", "TreeBinding node content");
	});

	QUnit.test("Paging", function(assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: true
		});

		var treeBinding = bindings[0],
			contexts,
			context;

		assert.equal(treeBinding.getPath(), "/orgStructure2", "TreeBinding path");
		assert.equal(treeBinding.getModel(), oModel, "TreeBinding model");

		contexts = treeBinding.getRootContexts(0,2);
		assert.equal(contexts.length, 2, "TreeBinding returned rootContexts length");
		assert.equal(treeBinding.getChildCount(null), 3, "TreeBinding actual rootContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Inga Horst", "TreeBinding root content");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Tom Bay", "TreeBinding root content");

		context = contexts[0];
		contexts = treeBinding.getNodeContexts(context, 1, 2);
		assert.equal(contexts.length, 2, "TreeBinding returned nodeContexts length");
		assert.equal(treeBinding.getChildCount(context), 3, "TreeBinding actual nodeContexts length");

		context = contexts[0];
		assert.equal(oModel.getProperty("name", context), "Frank Wallace", "TreeBinding node content");

		context = contexts[1];
		assert.equal(oModel.getProperty("name", context), "Gina Rush", "TreeBinding node content");
	});

	QUnit.test("Sorting - Sorters in bindTree", function (assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: true
		},
		[new Sorter("name")]);

		var treeBinding = bindings[0];

		var aRootContexts = treeBinding.getRootContexts(0, 3);

		assert.equal(aRootContexts[0].getProperty("name"), "Catherine Platte", "1st node after sorting is: Catherine Platte");
		assert.equal(aRootContexts[1].getProperty("name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("name"), "Tom Bay", "3rd node after sorting is: Tom Bay");

		var aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("name"), "Frank Wallace", "Inga child node[0] after sorting is: Frank Wallace");
		assert.equal(aChildContexts[1].getProperty("name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("name"), "John Wallace", "Inga child node[2]] after sorting is: John Wallace");

		//call sort afterwards
		treeBinding.sort(new Sorter("name", true));

		aRootContexts = treeBinding.getRootContexts(0, 3);

		assert.equal(aRootContexts[0].getProperty("name"), "Tom Bay", "1st node after sorting is: Tom Bay");
		assert.equal(aRootContexts[1].getProperty("name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("name"), "Catherine Platte", "3rd node after sorting is: Catherine Platte");

		aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("name"), "John Wallace", "Inga child node[0] after sorting is: John Wallace");
		assert.equal(aChildContexts[1].getProperty("name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("name"), "Frank Wallace", "Inga child node[2]] after sorting is: Frank Wallace");

	});

	QUnit.test("Sorting - sort() call", function (assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: true
		});

		var treeBinding = bindings[0];

		treeBinding.sort(new Sorter("name"));

		var aRootContexts = treeBinding.getRootContexts(0, 3);

		assert.equal(aRootContexts[0].getProperty("name"), "Catherine Platte", "1st node after sorting is: Catherine Platte");
		assert.equal(aRootContexts[1].getProperty("name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("name"), "Tom Bay", "3rd node after sorting is: Tom Bay");

		var aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("name"), "Frank Wallace", "Inga child node[0] after sorting is: Frank Wallace");
		assert.equal(aChildContexts[1].getProperty("name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("name"), "John Wallace", "Inga child node[2]] after sorting is: John Wallace");

		//now change the sorter to descending
		treeBinding.sort(new Sorter("name", true));

		aRootContexts = treeBinding.getRootContexts(0, 3);

		assert.equal(aRootContexts[0].getProperty("name"), "Tom Bay", "1st node after sorting is: Tom Bay");
		assert.equal(aRootContexts[1].getProperty("name"), "Inga Horst", "2nd node after sorting is: Inga Horst");
		assert.equal(aRootContexts[2].getProperty("name"), "Catherine Platte", "3rd node after sorting is: Catherine Platte");

		aChildContexts = treeBinding.getNodeContexts(aRootContexts[1]);
		assert.equal(aChildContexts[0].getProperty("name"), "John Wallace", "Inga child node[0] after sorting is: John Wallace");
		assert.equal(aChildContexts[1].getProperty("name"), "Gina Rush", "Inga child node[1] after sorting is: Gina Rush");
		assert.equal(aChildContexts[2].getProperty("name"), "Frank Wallace", "Inga child node[2]] after sorting is: Frank Wallace");

		//empty sort() call, removes the sorters
		treeBinding.sort();

		aRootContexts = treeBinding.getRootContexts(0, 3);

		assert.equal(aRootContexts[0].getProperty("name"), "Inga Horst", "1st node after sorting is: Inga Horst");
		assert.equal(aRootContexts[1].getProperty("name"), "Tom Bay", "2nd node after sorting is: Tom Bay");
		assert.equal(aRootContexts[2].getProperty("name"), "Catherine Platte", "3rd node after sorting is: Catherine Platte");

		aChildContexts = treeBinding.getNodeContexts(aRootContexts[0]);
		assert.equal(aChildContexts[0].getProperty("name"), "John Wallace", "Inga child node[0] after sorting is: John Wallace");
		assert.equal(aChildContexts[1].getProperty("name"), "Frank Wallace", "Inga child node[1] after sorting is: Frank Wallace");
		assert.equal(aChildContexts[2].getProperty("name"), "Gina Rush", "Inga child node[2] after sorting is: Gina Rush");
	});

	QUnit.test("TreeBinding single filter with array structure", function(assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: false
		});

		var treeBinding = bindings[0];

		// Filter for node with name containing 'in', three matches expected: Inga Horst, Catherine Platte and Gina Rush
		var oFilter1 = new Filter("name", FilterOperator.Contains, "in");
		treeBinding.filter(oFilter1);

		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 2, "TreeBinding rootContexts length"); // Inga and Catherine

		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length"); // Gina

		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Inga Horst", "TreeBinding filter value");
		assert.equal(oModel.getProperty(filteredContext[1].getPath()).name, "Catherine Platte", "TreeBinding filter value");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Gina Rush", "TreeBinding filter value");
	});

	QUnit.test("TreeBinding single filter with array structure and arrayNames param", function(assert) {
		createTreeBinding("/orgStructure2", null, [], {
			displayRootNode: false,
			arrayNames: ["children"]
		});

		var treeBinding = bindings[0];

		// Filter for node with name containing 'in', three matches expected: Inga Horst, Catherine Platte and Gina Rush
		var oFilter1 = new Filter("name", FilterOperator.Contains, "in");
		treeBinding.filter(oFilter1);

		var filteredContext = treeBinding.getRootContexts();
		assert.equal(filteredContext.length, 2, "TreeBinding rootContexts length"); // Inga and Catherine

		var nodeContexts1 = treeBinding.getNodeContexts(filteredContext[0]);
		assert.equal(nodeContexts1.length, 1, "TreeBinding nodeContexts length"); // Gina

		assert.equal(oModel.getProperty(filteredContext[0].getPath()).name, "Inga Horst", "TreeBinding filter value");
		assert.equal(oModel.getProperty(filteredContext[1].getPath()).name, "Catherine Platte", "TreeBinding filter value");
		assert.equal(oModel.getProperty(nodeContexts1[0].getPath()).name, "Gina Rush", "TreeBinding filter value");
	});

	QUnit.test("Check public API calls for tree with >1000 nodes", function (assert) {
		//create a tree with 2 levels and 200 * 200 nodes
		createData(200);
		createTreeBinding("/root", null, [], {
			displayRootNode: false
		});

		var oBinding = bindings[0];

		assert.ok(!oBinding.hasChildren(), "hasChildren() with no arguments still returns 'false'");

		var aRootContexts = oBinding.getRootContexts(0, 200);

		assert.equal(aRootContexts.length, 200, "Number of Root Contexts is correct");
		assert.equal(oBinding.getChildCount(), 200, "getChildCount() returns the correct value (200)");
		assert.equal(oBinding.getChildCount(null), 200, "getChildCount(null) returns the correct value (200)");

		//check if child contexts are returned correctly
		var oContext = aRootContexts[42];
		//paged access with some additional nodes at the end (should not be there)
		var aChildContexts = oBinding.getNodeContexts(oContext, 30, 400);

		assert.equal(aChildContexts.length, 170, "Number of child contexts is correct (170)");
		assert.equal(oBinding.getChildCount(oContext), 200, "getChildCount(oContext) returns the correct number of child nodes (200)");

		//one level deeper should be empty
		oContext = aChildContexts[128];
		assert.ok(oContext, "level 1 child is available");
		assert.equal(oBinding.getChildCount(oContext), 0, "getChildCount(oContext) returns the correct number of child nodes (0)");
	});

	QUnit.test("getChildCount without length cache", function (assert) {
		//create a tree with 2 levels and 200 * 200 nodes
		createData(200);
		createTreeBinding("/root", null, [], {
			displayRootNode: false
		});

		var oBinding = bindings[0];

		assert.equal(oBinding.getChildCount(), 200, "getChildCount() returns the correct value (200)");

		//check if child contexts are returned correctly
		var oContext = oBinding.getRootContexts(0, 1)[0];

		assert.equal(oBinding.getChildCount(oContext), 200, "getChildCount(oContext) returns the correct number of child nodes (200)");
	});

	QUnit.test("constructor - Any/All are rejected", function (assert) {
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});

				var oMultiFilter = new Filter([oFilter, oFilter2], true);

				oModel.bindTree("/teamMembers", undefined, [oMultiFilter]);
			},
			getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("filter() - Any/All are rejected", function(assert) {
		var oTreeBinding = oModel.bindTree("/teamMembers", undefined, []);

		// "Any" at last position fails
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.GT, "Wallace");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id1", condition: new Filter()});
				oTreeBinding.filter([oFilter, oFilter2]);
			},
			getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// "All" at first position fails
		assert.throws(
			function() {
				var oFilter = new Filter({path: "lastName", operator: FilterOperator.All, variable: "id2", condition: new Filter()});
				var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Rush");
				oTreeBinding.filter([oFilter, oFilter2]);
			},
			getErrorWithMessage(FilterOperator.All),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// Multifilter containing "All" or "Any" fails
		assert.throws(
			function() {
				var oFilter = new Filter({path: "lastName", operator: FilterOperator.All, variable: "id3", condition: new Filter()});
				var oFilter2 = new Filter("firstName", FilterOperator.EQ, "Bar");

				var oMultiFilter = new Filter({
					filters: [oFilter, oFilter2],
					and: false
				});

				oTreeBinding.filter([oMultiFilter]);
			},
			getErrorWithMessage(FilterOperator.All),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);

		// Multifilter containing "All" or "Any" fails
		assert.throws(
			function() {
				var oFilter = new Filter("lastName", FilterOperator.NE, "Foo");
				var oFilter2 = new Filter({path: "firstName", operator: FilterOperator.Any, variable: "id4", condition: new Filter()});

				var oMultiFilter = new Filter([oFilter, oFilter2], true);

				oTreeBinding.filter([oMultiFilter]);
			},
			getErrorWithMessage(FilterOperator.Any),
			"Error thrown if filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("Multi Filters (Complex) 1 - Unsupported are not OK", function(assert) {
		var oTreeBinding = oModel.bindTree("/teamMembers", undefined, []);

		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter({path: "y", operator: FilterOperator.All, variable: "id1", condition: new Filter()});
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter({
			filters: [oMultiFilter2, oFilter4],
			and: true
		});

		assert.throws(
			function() {
				oTreeBinding.filter([oMultiFilter3]);
			},
			getErrorWithMessage(FilterOperator.All),
			"Error thrown if  multi-filter instances contain an unsupported FilterOperator"
		);
	});

	QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function(assert) {
		var oTreeBinding = oModel.bindTree("/teamMembers", undefined, []);

		var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
		var oFilter2 = new Filter({
			path: "y",
			operator: FilterOperator.All,
			variable: "id1",
			condition: new Filter([
				new Filter("t", FilterOperator.GT, 66),
				new Filter({path: "g", operator: FilterOperator.Any, variable: "id2", condition: new Filter("f", FilterOperator.NE, "hello")})
			], true)
		});
		var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
		var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");

		var oMultiFilter1 = new Filter({
			filters: [oFilter1, oFilter2],
			and: true
		});
		var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);

		var oMultiFilter3 = new Filter({
			filters: [oMultiFilter2, oFilter4],
			and: true
		});

		assert.throws(
			function() {
				oTreeBinding.filter([oMultiFilter3]);
			},
			getErrorWithMessage(FilterOperator.All),
			"Error thrown if  multi-filter instances contain an unsupported FilterOperator"
		);
	});

	//**********************************************************************************************
	QUnit.test("getRootsContexts: call getResolvedPath", function (assert) {
		var oBinding = {
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.deepEqual(JSONTreeBinding.prototype.getRootContexts.call(oBinding, 1, 1), []);
	});

	//**********************************************************************************************
	QUnit.test("getCount: integration tests", function(assert) {
		var oBinding;

		// tree with objects
		createTreeBinding("/orgStructure");
		oBinding = bindings[0];

		// code under test
		assert.strictEqual(oBinding.getCount(), 7, "All nodes; root is an object");

		// tree with arrays and objects
		createTreeBinding("/orgStructure2");
		oBinding = bindings[0];

		// code under test
		assert.strictEqual(oBinding.getCount(), 6, "All nodes; root is an array");

		// tree reduced via arrayNames
		createTreeBinding("/orgStructure", undefined, undefined, {arrayNames : ["0"]});
		oBinding = bindings[0];

		// code under test
		assert.strictEqual(oBinding.getCount(), 3, "using array names");

		// adding an array will count all inner objects
		// checkUpdate of #setProperty is only called if the binding has a change handler
		oBinding.attachChange(function () {});
		oBinding.oModel.setProperty("/orgStructure/0/0/0/0", [{name : "foo"}, {name : "bar"}]);

		// code under test
		assert.strictEqual(oBinding.getCount(), 5, "update count after changing the date");

		// filtered tree
		createTreeBinding("/orgStructure");
		oBinding = bindings[0];

		// code under test
		oBinding.filter(new Filter("name", FilterOperator.Contains, "in"));
		assert.strictEqual(oBinding.getCount(), 3, "filtered data");
	});
});