/*global QUnit */

sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/model/ClientTreeBindingAdapter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function(deepExtend, ClientTreeBindingAdapter, JSONModel, Filter, FilterOperator, Sorter) {
	"use strict";

	var oModel, oBinding;

	function createTreeBindingAdapter(sPath, oContext, aFilters, mParameters) {
		// create binding
		oBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters).initialize();
		//applying the odata tree binding adapter to the binding
		ClientTreeBindingAdapter.apply(oBinding);
	}

	// Test Data
	var oData = {
		bing: {
			name: "chandler",
			root: {
				name: "root",
				description: "moep moep",
				checked: false,
				0: {
					name: "Rock",
					description: "Rockmusik",
					checked: true,
					0: { //children as object references
						name: "Rock'n'Roll",
						description: "late 1940s",
						checked: true,
						children: [ // Children inside an array
							{
								name: "Elvis Presley",
								description: "*1935 - +1977",
								checked: true
							},
							{
								name: "Chuck Berry",
								description: "*1926",
								checked: true
							}
						],
						"flup": { // mixed with arrays and objects
							name: "Keith Richards",
							description: "*1943",
							checked: true
						}
					},
					1: {
						name: "Heavy Metal",
						description: "late 1960s",
						checked: true,
						0: {
							name: "Black Sabbath",
							description: "founded 1968",
							checked: true
						},
						1: {
							name: "Judas Priest",
							description: "founded 1969",
							checked: true
						}
					},
					2: {
						name: "Grunge",
						description: "Mid-1980s",
						checked: true,
						0: {
							name: "Nirvana",
							description: "1987",
							checked: true
						},
						1: {
							name: "Soundgarden",
							description: "1984",
							checked: true
						},
						2: {
							name: "Alice in Chains",
							description: "1987",
							checked: true
						}
					}
				},
				1: {
					name: "Hip-Hop",
					description: "Hip-Hop",
					checked: true,
					0: {
						name: "Old-School",
						description: "Mid 1970s",
						checked: true,
						0: {
							name: "The Sugarhill Gang",
							description: "1973",
							checked: true
						},
						1: {
							name: "Grandmaster Flash and the Furious Five",
							description: "1978",
							checked: true
						}
					},
					1: {
						name: "Rap-Rock",
						description: "early 1980s",
						checked: true,
						0: {
							name: "Run-D.M.C.",
							description: "1981 - 2002",
							checked: true
						},
						1: {
							name: "Beastie Boys",
							description: "1981 - 2012",
							checked: true
						}
					},
					2: {
						name: "Gangsta rap",
						description: "mid 1980s",
						checked: true,
						0: {
							name: "2Pac",
							description: "1971 - 1996",
							checked: true
						},
						1: {
							name: "N.W.A",
							description: "1986 - 1991, 1998 - 2002",
							checked: true
						}
					}
				},
				2: {
					name: "Swing/Big Band",
					description: "1930s",
					checked: true,
					0: {
						name: "Frank Sinatra",
						description: "1915 - 1998",
						checked: true
					},
					1: {
						name: "Count Basie",
						description: "1904 - 1984",
						checked: true
					}
				},
				3: {
					name: "ZZZ",
					description: "None",
					checked: true
				}
			}
		}
	};

	QUnit.module("ClientTreeBindingAdapter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			oModel = new JSONModel();
			oModel.setData(deepExtend({}, oData));
		},
		afterEach: function() {
			oModel = undefined;
		}
	});

	QUnit.test("Properties", function(assert) {
		createTreeBindingAdapter("/bing/root", null, [], {});
		assert.equal(oBinding.getPath(), "/bing/root", "TreeBinding path");
		assert.equal(oBinding.getModel(), oModel, "TreeBinding model");
		assert.ok(oBinding.isA("sap.ui.model.ClientTreeBinding"), "treeBinding class check");
	});

	QUnit.test("getRootContexts getNodeContexts", function(assert) {
		createTreeBindingAdapter("/bing/root", null, [], {
			displayRootNode: false
		});

		var oContext;

		// contexts should be now loaded
		var aContexts = oBinding.getContexts(0, 5);

		assert.equal(aContexts.length, 4, "TreeBinding rootContexts length");

		oContext = aContexts[0];
		assert.equal(oModel.getProperty("name", oContext), "Rock", "TreeBinding root content");

		oContext = aContexts[1];
		assert.equal(oModel.getProperty("name", oContext), "Hip-Hop", "TreeBinding root content");

		oContext = aContexts[2];
		assert.equal(oModel.getProperty("name", oContext), "Swing/Big Band", "TreeBinding root content");

		oContext = aContexts[3];
		assert.equal(oModel.getProperty("name", oContext), "ZZZ", "TreeBinding root content");

		var fnChangeHandler = function() {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 10);

			var oContext = oBinding.getContextByIndex(3);
			assert.equal(aContexts.length, 7, "TreeBinding nodeContexts length is 7");
			assert.equal(oBinding.getChildCount(oContext), 2, "TreeBinding childcount");

			oContext = oBinding.getContextByIndex(4);
			assert.equal(oModel.getProperty("name", oContext), "Gangsta rap", "TreeBinding node content");

			oContext = oBinding.getContextByIndex(5);
			assert.equal(oModel.getProperty("name", oContext), "Swing/Big Band", "TreeBinding node content");

			oContext = oBinding.getContextByIndex(6);
			assert.equal(oModel.getProperty("name", oContext), "ZZZ", "TreeBinding node content");
		};

		oBinding.attachChange(fnChangeHandler);

		oBinding.expand(1);
	});

	QUnit.test("getRootContexts getNodeContexts - binding path is '/'", function(assert) {
		createTreeBindingAdapter("/", null, [], {
			displayRootNode: false
		});

		var oContext;

		// contexts should be now loaded
		var aContexts = oBinding.getContexts(0, 5);

		assert.equal(aContexts.length, 1, "root contexts length");

		oContext = aContexts[0];
		assert.equal(oModel.getProperty("name", oContext), "chandler", "root node is 'chandler'");

		function fnChangeHandler() {
			oBinding.detachChange(fnChangeHandler);

			// contexts should be now loaded flattened
			var aContexts = oBinding.getContexts(0, 10);
			assert.equal(aContexts.length, 2);

			var oContext = oBinding.getContextByIndex(0);
			assert.equal(oModel.getProperty("name", oContext), "chandler", "root node is 'chandler'");
			assert.equal(oBinding.getChildCount(oContext), 1, "childcount for 'chandler' is 1");

			oContext = oBinding.getContextByIndex(1);
			assert.equal(oModel.getProperty("name", oContext), "root", "index 2 node is 'root'");
			assert.equal(oBinding.getChildCount(oContext), 4, "childcount for 'root' is 4");

			oBinding.attachChange(fnChangeHandler2);
			oBinding.expand(1);
		}

		oBinding.attachChange(fnChangeHandler);
		oBinding.expand(0);

		function fnChangeHandler2() {
			oBinding.detachChange(fnChangeHandler2);

			// contexts should be now loaded flattened
			var aContexts = oBinding.getContexts(0, 10);
			assert.equal(aContexts.length, 6);

			var oContext = oBinding.getContextByIndex(2);
			assert.equal(oModel.getProperty("name", oContext), "Rock", "node at index 2 is 'Rock'");
			assert.equal(oBinding.getChildCount(oContext), 3, "childcount for 'Rock' is 3");

			oContext = oBinding.getContextByIndex(3);
			assert.equal(oModel.getProperty("name", oContext), "Hip-Hop", "node at index 3 is 'Hip-Hop'");
			assert.equal(oBinding.getChildCount(oContext), 3, "childcount for 'Hip-Hop' is 1");

			oBinding.attachChange(fnChangeHandler3);
			oBinding.expand(2);
		}

		function fnChangeHandler3() {
			oBinding.detachChange(fnChangeHandler3);

			// There should be only 9 contexts in the flat array.
			// If there are more, than the group ID was not unique
			var aContexts = oBinding.getContexts(0, 20);
			assert.equal(aContexts.length, 9, "Only 9 Context flat available");
		}
	});

	QUnit.test("Magnitude of artificial node with relative binding path", function(assert) {
		createTreeBindingAdapter("root", oModel.getContext("/bing"), [], {
			displayRootNode: false
		});

		// contexts should be now loaded
		oBinding.getContexts(0, 5);
		var oArtificialNode = oBinding._oRootNode;

		assert.equal(oArtificialNode.magnitude, 4, "Artificial RootNode has correct magnitude");
	});

	QUnit.test("Display root node", function(assert) {
		createTreeBindingAdapter("/bing/root", null, [], {
			displayRootNode: true
		});

		var oContext;

		// contexts should be now loaded
		var aContexts = oBinding.getContexts(0, 10);

		assert.equal(aContexts.length, 1, "# of root contexts = 1");

		oContext = aContexts[0];
		assert.equal(oModel.getProperty("name", oContext), "root", "Root context values are correct");

		var fnExpandHandler = function() {
			aContexts = oBinding.getContexts(0, 10);

			assert.equal(aContexts.length, 5, "Length of returned contexts should be 6");

			oContext = aContexts[0];
			assert.equal(oContext.getProperty("name"), "root", "Root context values are correct");

			oContext = aContexts[1];
			assert.equal(oContext.getProperty("name"), "Rock", "[1] context values are correct");

			oContext = aContexts[2];
			assert.equal(oContext.getProperty("name"), "Hip-Hop", "[2] is correct");

			oContext = aContexts[3];
			assert.equal(oContext.getProperty("name"), "Swing/Big Band", "[3] is correct");

			oContext = aContexts[4];
			assert.equal(oContext.getProperty("name"), "ZZZ", "[4] is correct");
		};

		oBinding.attachChange(fnExpandHandler);
		oBinding.expand(0);

	});

	QUnit.test("Number of expanded levels", function(assert) {
		createTreeBindingAdapter("/bing/root", null, [], {
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		var aContexts = oBinding.getContexts(0, 20);

		var oContext;

		assert.equal(aContexts.length, 13, "# of contexts after autoExpand = 2 should be 13");

		oContext = aContexts[0];
		assert.equal(oContext.getProperty("name"), "root", "First node is correct");

		//Grunge should not be expanded
		oContext = oBinding.getContextByIndex(4);
		assert.equal(oContext.getProperty("name"), "Grunge", "Woohooo Grunge");
		assert.equal(oBinding.isExpanded(4), false, "Grunge is not expanded");
		assert.equal(oBinding.getChildCount(oContext), 3, "Grunge has 3 children");

		oContext = oBinding.getContextByIndex(5);
		assert.equal(oContext.getProperty("name"), "Hip-Hop", "Woohooo Hip-Hop");
		assert.equal(oBinding.isExpanded(5), true, "Hip-Hop is expanded");
		assert.equal(oBinding.getChildCount(oContext), 3, "Hip-Hop has 3 children");

		oContext = oBinding.getContextByIndex(6);
		var oNode = oBinding.findNode(6);
		assert.equal(oContext.getProperty("name"), "Old-School", "Woohoo Old-School");
		assert.equal(oNode.level, 2, "Old-School sits on level 2");
	});

	QUnit.test("Pagesize increasing", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			displayRootNode: true
		});

		var oContext;
		var aContexts = oBinding.getContexts(0, 10);
		assert.equal(aContexts.length, 1, "TreeBinding rootContexts length, 10 requested, only 1 node present");
		assert.equal(oBinding._iPageSize, 10, "PageSize must be 10, since 10 requested by getContexts");
		oContext = aContexts[0];
		assert.equal(oContext.getProperty("name"), "root", "Root Node OK");
		oBinding.expand(0);

		aContexts = oBinding.getContexts(1, 3);
		assert.equal(oBinding._iPageSize, 10, "PageSize must still be 10, since 10 was requested by getContexts earlier");

		assert.equal(aContexts.length, 3, "Check if getContexts returned the expected length for expanded 1st node");
		assert.equal(oBinding.getChildCount(oContext), 4, "ChildCount of expanded 1st node");

		// row index 4 must be present due to higher page size (10) although not requested by latest getContexts call
		oContext = oBinding.getContextByIndex(4);
		assert.equal(oContext.getProperty("name"), "ZZZ", "ZZZ Node OK");
	});

	QUnit.test("Pagesize not decreasing", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			displayRootNode: true
		});

		var oContext;
		var aContexts = oBinding.getContexts(0, 1);

		assert.equal(aContexts.length, 1, "TreeBinding rootContexts length, 10 requested, only 1 node present");
		assert.equal(oBinding._iPageSize, 1, "PageSize must be 1, since 1 requested by getContexts");

		oContext = aContexts[0];
		assert.equal(oContext.getProperty("name"), "root", "1st root child HierarchyNode check");

		oBinding.expand(0);

		aContexts = oBinding.getContexts(1, 5);
		assert.equal(oBinding._iPageSize, 5,
			"PageSize must now be 5, since 5 was requested by latest getContexts call and is higher than the first getContexts call");

		assert.equal(aContexts.length, 4, "Check if getContexts returned the expected length for expanded 1st node");
		assert.equal(oBinding.getChildCount(oContext), 4, "ChildCount of expanded 1st node");

		oContext = oBinding.getContextByIndex(4);
		assert.equal(oContext.getProperty("name"), "ZZZ", "Node ZZZ is OK");

		oContext = oBinding.getContextByIndex(5);
		assert.equal(oContext, null, "Context at row index 5 still missing.");
	});

	QUnit.test("Manual expand", function(assert) {
		var done = assert.async();
		var oContext;
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true
		});

		oBinding.getContexts(0, 100);
		//expand root node
		oBinding.expand(0);

		oBinding.getContexts(0, 100);
		oContext = oBinding.getContextByIndex(4);
		assert.equal(oContext.getProperty("name"), "ZZZ", "Node ZZZ OK");
		oBinding.expand(1);

		//expanded 0.3
		oBinding.getContexts(0, 100);
		oContext = oBinding.getContextByIndex(4);
		assert.equal(oContext.getProperty("name"), "Grunge", "Grunge Node OK");
		oBinding.expand(4);

		oBinding.getContexts(0, 100);
		oContext = oBinding.getContextByIndex(6);
		assert.equal(oContext.getProperty("name"), "Soundgarden", "Soundgarden Node OK");

		assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should be expanded");
		assert.ok(oBinding._mTreeState.expanded["/bing_root/"], "Artificial Root node should be expanded");
		assert.ok(oBinding._mTreeState.expanded["/bing_root/0/"], "1st Level node should be expanded");
		assert.ok(oBinding._mTreeState.expanded["/bing_root/0/0_2/"], "2nd Level node should be expanded");

		assert.deepEqual(oBinding._mTreeState.collapsed, {}, "No nodes should be collapsed");

		//collapsing to level 2
		oBinding.collapseToLevel(2);
		oBinding.getContexts(0, 100); //rebuild the tree, as usual

		assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should be expanded");
		assert.ok(oBinding._mTreeState.expanded["/bing_root/"], "Artificial Root node should be expanded");
		assert.ok(oBinding._mTreeState.expanded["/bing_root/0/"], "1st Level node should be expanded");

		assert.ok(oBinding._mTreeState.collapsed["/bing_root/0/0_2/"], "3rd Level node is now in the collapsed map");

		//finally collapse the whole tree
		oBinding.collapseToLevel(0);
		oBinding.getContexts(0, 100); //rebuild the tree, as usual

		oContext = oBinding.getContextByIndex(0);
		assert.equal(oContext.getProperty("name"), "root", "HierarchyNode check for root node, everything is still there");
		assert.equal(oBinding.isExpanded(0), false, "Root node is also collapsed now");

		assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should still be expanded");
		assert.ok(!oBinding._mTreeState.expanded["/bing_root/"], "1st Level node should NOT be expanded");
		//this node is still expanded, because collapseRecursive is set to false
		assert.ok(oBinding._mTreeState.expanded["/bing_root/0/"], "2nd Level node should still be expanded (collapseRecursive = false)");

		assert.ok(oBinding._mTreeState.collapsed["/bing_root/"], "Root node is now in the collapsed map");
		assert.ok(oBinding._mTreeState.collapsed["/bing_root/0/0_2/"], "3rd Level node is still in the collapsed map");

		// switch on collapseRecursive mode
		oBinding.setCollapseRecursive(true);

		// re-expand the root node and check if the expanded states are still correct
		oBinding.expandToLevel(1);
		assert.deepEqual(oBinding._mTreeState.collapsed, {}, "No nodes should be collapsed now, just before expanding to level X");
		oBinding.getContexts(0, 100); //rebuild the tree, as usual

		assert.equal(oBinding.isExpanded(0), true, "root is expanded again");
		assert.equal(oBinding.isExpanded(1), true, "Rock is still expanded");
		oBinding.expand(3);
		oBinding.expand(2);

		//collapse all again, this time recursive
		oBinding.collapseToLevel(0);

		//expand again
		oBinding.expandToLevel(1);

		oBinding.getContexts(0, 100); //rebuild the tree, as usual

		assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should still be expanded");
		assert.ok(oBinding._mTreeState.expanded["/bing_root/"], "1st Level node should be expanded again");
		//this node is still expanded, because collapseRecursive is set to false
		assert.ok(!oBinding._mTreeState.expanded["/bing_root/0/"], "2nd Level node should NOT be expanded (collapseRecursive = true)");

		// check for correct change reasons in event
		var fnChangeHandler5 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler5);
			assert.equal(oEvent.getParameter("reason"), "expand", "Change Reason expand is set");
			oBinding.attachChange(fnChangeHandler6);
			oBinding.collapse(1);
		};

		var fnChangeHandler6 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler6);
			assert.equal(oEvent.getParameter("reason"), "collapse", "Change Reason expand is set");
			done();
		};

		oBinding.attachChange(fnChangeHandler5);
		oBinding.expand(1);
	});

	QUnit.test("The length of binding should be independent from the parameters passed to getContexts", function(assert) {
		var iLength1, iLength2;
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: false,
			numberOfExpandedLevels: 99
		});

		oBinding.getContexts(0, 2);
		iLength1 = oBinding.getLength();

		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: false,
			numberOfExpandedLevels: 99
		});

		oBinding.getContexts(0, 10);
		iLength2 = oBinding.getLength();

		assert.equal(iLength1, iLength2, "binding length shouldn't be dependent on the contexts length");
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("SelectAll, Deselect All", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		oBinding.getContexts(0, 100);

		var fnSelectionChangeHandler1 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
			assert.equal(oEvent.mParameters.leadIndex, oBinding.getLength() - 1, "Event: leadIndex should be Binding length - 1");
			assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
			assert.equal(oEvent.mParameters.rowIndices.length, 13, "Event: length of changedIndices should be 13");
			assert.equal(oEvent.mParameters.selectAll, true, "Event: selectAll set");
		};

		var fnSelectionChangeHandler2 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
			assert.equal(oEvent.mParameters.leadIndex, -1, "Event: leadIndex should be - 1");
			assert.equal(oEvent.mParameters.oldIndex, oBinding.getLength() - 1, "Event: oldIndex should be Binding length -1");
			assert.equal(oEvent.mParameters.rowIndices.length, 5, "Event: length of changedIndices should be 5");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
		oBinding.selectAll();

		oBinding.collapseToLevel(1);
		oBinding.getContexts(0, 100); // rebuild tree after collapse
		var aSelectedIndices = oBinding.getSelectedIndices();
		assert.equal(aSelectedIndices.length, 5, "Number of selected Nodes after collapsing to level 1 must be 5");

		// check that selectAllMode is removed
		assert.equal(oBinding._oRootNode.nodeState.selectAllMode, true, "After selectAll, selectAllMode of root node is true");

		var aSelectedContexts = oBinding.getSelectedContexts();
		assert.equal(aSelectedIndices.length, aSelectedContexts.length, "Number of selected contexts and indeces must be the same");

		var oContext = aSelectedContexts[1];
		assert.equal(oContext.getProperty("name"), "Rock", "Number of selected contexts and indeces must be the same");

		var iLeadIndex = oBinding.getSelectedIndex();
		assert.equal(iLeadIndex, oBinding.getLength() - 1, "LeadIndex must be last node/context of the known/paged tree in SelectAll case");

		oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
		oBinding.clearSelection();
		aSelectedIndices = oBinding.getSelectedIndices();
		assert.equal(aSelectedIndices.length, 0, "There should be no selection after clearSelection");

		// check that selectAllMode is removed
		assert.equal(oBinding._oRootNode.nodeState.selectAllMode, false, "After clearSelection, selectAllMode of root node is false");

		iLeadIndex = oBinding.getSelectedIndex();
		assert.equal(iLeadIndex, -1, "LeadIndex must be -1 if there is no selection");

		done();
	});

	QUnit.test("getSelectedNodesCount with single selection", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			numberOfExpandedLevels: 1
		});

		oBinding.getContexts(0, 100);

		oBinding.setSelectedIndex(1);
		assert.equal(oBinding.getSelectedNodesCount(), 1, "Correct selected nodes count after selectAll call");
		assert.equal(oBinding.getLength(), 12, "Correct binding length");
	});

	QUnit.test("getSelectedNodesCount with selectAll", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			numberOfExpandedLevels: 1
		});

		oBinding.getContexts(0, 100);

		oBinding.selectAll();
		assert.equal(oBinding.getSelectedNodesCount(), 12, "Correct selected nodes count after selectAll call");
		assert.equal(oBinding.getLength(), 12, "Correct binding length");
	});

	QUnit.test("getSelectedNodesCount with selectAll and expand", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			numberOfExpandedLevels: 1
		});

		oBinding.getContexts(0, 100);

		oBinding.selectAll();
		assert.equal(oBinding.getSelectedNodesCount(), 12, "Correct selected nodes count after selectAll call");
		assert.equal(oBinding.getLength(), 12, "Correct binding length");

		oBinding.expand(1);
		oBinding.getContexts(0, 100); // rebuild tree after expand
		assert.equal(oBinding.getSelectedNodesCount(), 12, "Correct selected nodes count after expand of last node");
		assert.equal(oBinding.getLength(), 15, "Correct binding length");
	});

	QUnit.test("getSelectedNodesCount with selectAll and filter", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 3
		});

		oBinding.getContexts(0, 100);
		oBinding.filter(new Filter({
			path: "name",
			operator: FilterOperator.EQ,
			value1: "Hip-Hop"
		}));

		oBinding.selectAll();
		assert.equal(oBinding.getSelectedNodesCount(), 2, "Correct selected nodes count after selectAll call");
		assert.equal(oBinding.getLength(), 2, "Correct binding length");
	});

	QUnit.test("getSelectedNodesCount with selectAll and filter and expand", function(assert) {
		createTreeBindingAdapter("/bing/root", [], null, {
			numberOfExpandedLevels: 1
		});

		oBinding.getContexts(0, 100);

		oBinding.filter(new Filter({
			path: "name",
			operator: FilterOperator.Contains,
			value1: "chuck"
		}));

		oBinding.selectAll();
		assert.equal(oBinding.getSelectedNodesCount(), 2, "Correct selected nodes count after selectAll call");
		assert.equal(oBinding.getLength(), 2, "Correct binding length");

		oBinding.expand(1);
		oBinding.getContexts(0, 100); // rebuild tree after expand
		assert.equal(oBinding.getSelectedNodesCount(), 2, "Correct selected nodes count after expand of last node");
		assert.equal(oBinding.getLength(), 3, "Correct binding length");
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("Select single nodes", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true,
			numberOfExpandedLevels: 1
		});

		oBinding.getContexts(0, 100);

		var fnSelectionChangeHandler1 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
			assert.equal(oEvent.mParameters.leadIndex, 1, "Event: leadIndex should be 1");
			assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
			assert.equal(oEvent.mParameters.rowIndices.length, 1, "Event: length of changedIndices should be 1");
			assert.equal(oEvent.mParameters.rowIndices[0], 1, "Event: changedIndices[0] should be 1");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		var fnSelectionChangeHandler2 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
			assert.equal(oEvent.mParameters.leadIndex, 4, "Event: leadIndex should be 4");
			assert.equal(oEvent.mParameters.oldIndex, 1, "Event: oldIndex should be 1");
			assert.equal(oEvent.mParameters.rowIndices.length, 2, "Event: changedIndices should be 2");
			assert.equal(oEvent.mParameters.rowIndices[0], 1, "Event: changedIndices[0] should be 1");
			assert.equal(oEvent.mParameters.rowIndices[0], 1, "Event: changedIndices[1] should be 4");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		var fnSelectionChangeHandler3 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler3);
			assert.equal(oEvent.mParameters.leadIndex, 4, "Event: leadIndex should be 4");
			assert.equal(oEvent.mParameters.oldIndex, 4, "Event: oldIndex should be 4");
			assert.equal(oEvent.mParameters.rowIndices.length, 0, "Event: changedIndices should be undefined");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
		oBinding.setSelectedIndex(1);
		var oContext = oBinding.getContextByIndex(oBinding.getSelectedIndex());
		var aSelectedContexts = oBinding.getSelectedContexts();
		assert.equal(aSelectedContexts.length, 1, "One node should be selected");
		assert.deepEqual(oContext, aSelectedContexts[0], "Contexts should equal");
		assert.equal(oContext.getProperty("name"), "Rock", "Second Node should be selected");

		oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
		oBinding.setSelectedIndex(4);
		oContext = oBinding.getContextByIndex(oBinding.getSelectedIndex());
		aSelectedContexts = oBinding.getSelectedContexts();
		assert.equal(aSelectedContexts.length, 1, "Still only one node should be selected");
		assert.deepEqual(oContext, aSelectedContexts[0], "Contexts should still equal");
		assert.equal(oContext.getProperty("name"), "ZZZ", "Last Node should be selected");

		oBinding.attachSelectionChanged(fnSelectionChangeHandler3);
		oBinding.setSelectedIndex(4);
		oContext = oBinding.getContextByIndex(oBinding.getSelectedIndex());
		aSelectedContexts = oBinding.getSelectedContexts();
		assert.equal(aSelectedContexts.length, 1, "Still only one node should be selected");
		assert.deepEqual(oContext, aSelectedContexts[0], "Contexts should still equal");
		assert.equal(oContext.getProperty("name"), "ZZZ", "Last Node should be selected");

		//select index out of range
		oBinding.setSelectedIndex(300);
		assert.equal(oBinding.getSelectedIndex(), 4, "Selected index is still 9.");

		assert.equal(oBinding._isNodeSelectable(0), false, "Illegal nodes are not selectable.");
		assert.equal(oBinding._isNodeSelectable(null), false, "Illegal nodes are not selectable.");
		assert.equal(oBinding._isNodeSelectable(undefined), false, "Illegal nodes are not selectable.");
		assert.equal(oBinding._isNodeSelectable(""), false, "Illegal nodes are not selectable.");

		done();
	});

	QUnit.test("getSelectedIndex after parent collapse w/ recursive collapse", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: true,
			displayRootNode: true,
			numberOfExpandedLevels: 0
		});
		oBinding.expand(0);
		oBinding.getContexts(0, 100);

		oBinding.setSelectedIndex(1);
		assert.equal(oBinding.getSelectedIndex(), 1, "Selected index is 1");

		var fnChangeHandler1 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler1);
			oBinding.getContexts(0, 100); // rebuild tree
			assert.equal(oBinding.getSelectedIndex(), -1, "Selected index could not be found (-1)");

			oBinding.expand(0);
			oBinding.getContexts(0, 100);
			assert.equal(oBinding.getSelectedIndex(), -1,
				"Selected index has not been restored because of recursive collapse mode");
			done();
		};

		oBinding.attachChange(fnChangeHandler1);
		oBinding.collapse(0);
	});

	QUnit.test("getSelectedIndex after parent collapse w/o recursive collapse", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true,
			numberOfExpandedLevels: 0
		});

		oBinding.expand(0);
		oBinding.getContexts(0, 100);

		oBinding.setSelectedIndex(1);
		assert.equal(oBinding.getSelectedIndex(), 1, "Selected index is 1");

		var fnChangeHandler1 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler1);
			oBinding.getContexts(0, 100); // rebuild tree
			assert.equal(oBinding.getSelectedIndex(), -1, "Selected index could not be found (-1)");

			oBinding.expand(0);
			oBinding.getContexts(0, 100);
			assert.equal(oBinding.getSelectedIndex(), 1, "Selected index 1 has been restored");
			done();
		};

		oBinding.attachChange(fnChangeHandler1);
		oBinding.collapse(0);
	});

	QUnit.test("Add Selection Interval", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		oBinding.getContexts(0, 100);

		var fnSelectionChangeHandler1 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
			assert.equal(oEvent.mParameters.leadIndex, 7, "Event: leadIndex should be 7");
			assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
			assert.equal(oEvent.mParameters.rowIndices.length, 5, "Event: length of changedIndices should be 5");
			assert.equal(oEvent.mParameters.rowIndices[0], 3, "Event: first changedIndices[0] should be 3");
			assert.equal(oEvent.mParameters.rowIndices[4], 7, "Event: last changedIndices[4] should be 7");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		var fnSelectionChangeHandler2 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
			assert.equal(oEvent.mParameters.leadIndex, 11, "Event: leadIndex should be 11");
			assert.equal(oEvent.mParameters.oldIndex, 7, "Event: oldIndex should be 7");
			assert.equal(oEvent.mParameters.rowIndices.length, 3, "Event: length of changedIndices should be 3");
			assert.equal(oEvent.mParameters.rowIndices[0], 9, "Event: first changedIndices[0] should be 9");
			assert.equal(oEvent.mParameters.rowIndices[2], 11, "Event: last changedIndices[2] should be 11");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		var fnSelectionChangeHandler3 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler3);
			assert.equal(oEvent.mParameters.leadIndex, 12, "Event: leadIndex should be 12");
			assert.equal(oEvent.mParameters.oldIndex, 11, "Event: oldIndex should be 11");
			assert.equal(oEvent.mParameters.rowIndices.length, 2, "Event: length of changedIndices should be 2");
			assert.equal(oEvent.mParameters.rowIndices[0], 8, "Event: first changedIndices[0] should be 7");
			assert.equal(oEvent.mParameters.rowIndices[1], 12, "Event: last changedIndices[1] should be 12");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
		oBinding.addSelectionInterval(3, 7);

		oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
		oBinding.addSelectionInterval(9, 11);

		var aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [3, 4, 5, 6, 7, 9, 10, 11], "Selected indices array is correct");

		oBinding.attachSelectionChanged(fnSelectionChangeHandler3);
		oBinding.addSelectionInterval(7, 12);

		aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			"Selected indices array is correct, after selecting additional indices");

		done();
	});

	QUnit.test("Set Selection Interval", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		oBinding.getContexts(0, 100);

		var fnSelectionChangeHandler1 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
			assert.equal(oEvent.mParameters.leadIndex, 8, "Event: leadIndex should be 8");
			assert.equal(oEvent.mParameters.oldIndex, 11, "Event: oldIndex should be 11");
			assert.equal(oEvent.mParameters.rowIndices.length, 6, "Event: length of changedIndices should be 6");

			assert.deepEqual(oEvent.mParameters.rowIndices, [3, 4, 8, 9, 10, 11], "Changed indices after setSelectionInterval is correct");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		var fnSelectionChangeHandler2 = function(oEvent) {
			oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
			assert.equal(oEvent.mParameters.leadIndex, 0, "Event: leadIndex should be 0");
			assert.equal(oEvent.mParameters.oldIndex, 8, "Event: oldIndex should be 8");
			assert.equal(oEvent.mParameters.rowIndices.length, 5, "Event: length of changedIndices should be 5");

			assert.deepEqual(oEvent.mParameters.rowIndices, [0, 5, 6, 7, 8], "Changed indices after setSelectedIndex is correct");
			assert.ok(!oEvent.mParameters.selectAll, "Event: selectAll not set");
		};

		oBinding.addSelectionInterval(3, 7);
		oBinding.addSelectionInterval(9, 11);

		var aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [3, 4, 5, 6, 7, 9, 10, 11], "Selected indices array is correct, after selecting additional indices");

		oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
		oBinding.setSelectionInterval(5, 8);

		aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [5, 6, 7, 8], "Selected indices array is correct, after setting the selection");

		oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
		oBinding.setSelectedIndex(0);

		assert.equal(oBinding.getSelectedIndex(), 0, "Lead Index is 0");
		aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [0], "Selected indices array is correct, only one entry (0)");

		assert.equal(oBinding.findNode(5).selected, undefined, "Index 1 should not be selected anymore.");

		done();
	});

	QUnit.test("setSelectedIndex and getSelectedIndex", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: false,
			numberOfExpandedLevels: 1
		});

		oBinding.getContexts(0, 100);

		//invalidate tree
		oBinding._fireChange();

		oBinding.getLength();

		oBinding.setSelectedIndex(1);

		assert.equal(oBinding.isIndexSelected(1), true, "isIndexSelected(1) works");

		var aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [1], "Selected indices array is correct, after selecting additional indices");

		oBinding.setSelectedIndex(3);

		assert.equal(oBinding.isIndexSelected(1), false, "isIndexSelected(1) works");

		assert.equal(oBinding.isIndexSelected(3), true, "isIndexSelected(3) works");

		aSelectedIndices = oBinding.getSelectedIndices();
		assert.deepEqual(aSelectedIndices, [3], "Selected indices array is correct, after selecting additional indices");
		done();
	});

	QUnit.test("Sorting with stable expand states", function(assert) {
		var done = assert.async();

		createTreeBindingAdapter("/bing/root", null, null, {
			numberOfExpandedLevels: 1,
			displayRootNode: true
		});

		oBinding.getContexts(0, 100);
		oBinding.expand(3);
		oBinding.expand(1);

		//refresh after sort()
		function fnRefreshHandler() {
			oBinding.detachRefresh(fnRefreshHandler);

			assert.ok(oBinding._mTreeState.expanded["/bing_root/0/"], "NodeState for Rock still there.");
			assert.ok(oBinding._mTreeState.expanded["/bing_root/2/"], "NodeState for Swing/Big Band still there.");
			assert.equal(oBinding._mTreeState.expanded["/bing_root/0/"].expanded, true, "Node Rock is still expanded after sorting.");
			assert.equal(oBinding._mTreeState.expanded["/bing_root/2/"].expanded, true, "Node Swing/BigBand is still expanded after sorting.");

			done();
		}

		oBinding.attachChange(fnRefreshHandler);
		//sort descending
		oBinding.sort(new Sorter("name", true));
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("Clear selection", function(assert) {
		assert.expect(4);

		createTreeBindingAdapter("/bing/root", [], null, {
			collapseRecursive: false,
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		oBinding.getContexts(0, 100);
		oBinding.selectAll();

		var oFirstSubgroup = oBinding.getNodeByIndex(1);

		// Deselect the first subnode which groups more nodes underneath and therefore got a selectAllMode flag
		oBinding.setNodeSelection(oFirstSubgroup.nodeState, false);

		oBinding.clearSelection(); // Should deselect all nodes AND clear all selectAllMode flags (even from not currently selected nodes)

		var aSelectedIndices = oBinding.getSelectedIndices();
		assert.equal(aSelectedIndices.length, 0, "There should be no selection after clearSelection");

		// check that selectAllMode is removed from all nodes
		assert.equal(oBinding._oRootNode.nodeState.selectAllMode, false, "selectAllMode of root node should be cleared");
		assert.equal(oFirstSubgroup.nodeState.selectAllMode, false, "selectAllMode of first subgroup node should be cleared");
		var oSomeNode = oBinding.getNodeByIndex(2);
		assert.equal(oSomeNode.nodeState.selectAllMode, false, "selectAllMode of any other node should be cleared");
	});

	QUnit.test("Synchronous Expand", function(assert) {
		var done = assert.async();

		createTreeBindingAdapter("/bing/root", null, null, {
			numberOfExpandedLevels: 0,
			displayRootNode: false
		});

		var aContexts = oBinding.getContexts(0, 100);

		assert.equal(aContexts.length, 4);
		assert.equal(oBinding.getLength(), 4);

		// synchronous expands
		oBinding.expand(0);
		oBinding.expand(5); // this synchronous call was not working before

		oBinding.getContexts(0, 100);

		// synchronous tree update works
		assert.equal(oBinding.getLength(), 9, "Length is correctly calculated synchronously");

		done();
	});

	QUnit.test("Empty binding should not cause exceptions", function(assert) {
		createTreeBindingAdapter("/nothing", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2,
			rootLevel: 1
		});

		// Keep the binding empty, so that the adapter can't find any nodes

		// The following function calls should fail but not throw an exception
		oBinding.expand(999);
		oBinding.collapse(999);
		oBinding.toggleIndex(999);
		oBinding.setNodeSelection({});

		assert.ok(true, "No exceptions thrown");
	});

	QUnit.test("Expand with bSuppressChange flag should suppress the change event", function(assert) {
		createTreeBindingAdapter("/bing/root", null, [], {
			displayRootNode: false
		});

		oBinding.getContexts(0, 5);
		assert.ok(oBinding.findNode(1), "Node can be found"); // If the binding does not find a node, it also does not fire a change event

		var oSpy = window.sinon.spy(oBinding, "_fireChange");
		oBinding.expand(1, true);
		assert.ok(oSpy.notCalled, "No change event fired");
	});

	QUnit.test("Collapse with bSuppressChange flag should suppress the change event", function(assert) {
		createTreeBindingAdapter("/bing/root", null, [], {
			displayRootNode: false
		});

		oBinding.getContexts(0, 5);
		assert.ok(oBinding.findNode(0), "Node can be found"); // If the binding does not find a node, it also does not fire a change event

		var oSpy = window.sinon.spy(oBinding, "_fireChange");
		oBinding.collapse(0, true);
		assert.ok(oSpy.notCalled, "No change event fired");
	});

	var oData2 = {
		root: [
			{
				name: "node_0",
				root: [
					{
						name: "node_1",
						root: [{name: "node_1a"}, {name: "node_1b"}]
					},
					{
						name: "node_2",
						root: [{name: "node_2a"}, {name: "node_2b"}]
					}
				]
			}
		]
	};

	QUnit.module("ClientTreeBindingAdapter - Model Data 2", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			oModel = new JSONModel();
			oModel.setData(deepExtend({}, oData2));
		},
		afterEach: function() {
			oModel = undefined;
		}
	});

	QUnit.test("Expand with arrayNames == bindingPath", function(assert) {
		var done = assert.async();

		createTreeBindingAdapter("/root", null, null, {
			numberOfExpandedLevels: 1,
			displayRootNode: false,
			arrayNames: ["root"]
		});

		oBinding.getContexts(0, 100);

		// tree-state expectation
		// node_0
		//    node_1
		//    node_2
		assert.equal(oBinding.getLength(), 3, "initial length is OK");

		// epxand node_1
		oBinding.attachChange(handler1);
		oBinding.expand(1);
		oBinding.getContexts(0, 100);

		function handler1() {
			oBinding.detachChange(handler1);

			// tree-state expectation
			// node_0
			//    node_1
			//       node_1a
			//       node_1b
			//    node_2
			assert.equal(oBinding.getLength(), 5, "length after expand is ok");

			done();
		}
	});
});