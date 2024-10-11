/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_TreeState"
], function (Log, _Helper, _TreeState) {
	"use strict";

	const mustBeMocked = function () { throw new Error("Must be mocked"); };

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._TreeState", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		// code under test
		const oTreeState = new _TreeState("~sNodeProperty~", "~fnGetKeyFilter~");

		assert.ok(oTreeState instanceof _TreeState);
		assert.strictEqual(oTreeState.sNodeProperty, "~sNodeProperty~");
		assert.strictEqual(oTreeState.fnGetKeyFilter, "~fnGetKeyFilter~");
		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {});
		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {});
		assert.strictEqual(oTreeState.getOutOfPlaceCount(), 0);
		assert.deepEqual(oTreeState.getOutOfPlacePredicates(), []);
	});

	//*********************************************************************************************
	QUnit.test("expand/collapse: default level", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~", mustBeMocked);

		this.mock(_Helper).expects("getPrivateAnnotation").thrice()
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		this.mock(oTreeState).expects("fnGetKeyFilter").twice()
			.withExactArgs("~oNode~").returns("~filter~");
		this.mock(_Helper).expects("drillDown").twice()
			.withExactArgs("~oNode~", "~sNodeProperty~").returns("~sNodeId~");

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo,
			{"~predicate~" : {filter : "~filter~", levels : 1, nodeId : "~sNodeId~"}});

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo,
			{"~predicate~" : {filter : "~filter~", levels : 1, nodeId : "~sNodeId~"}});

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {});
	});

	//*********************************************************************************************
[
	{iLevels : 1, vResult : 1},
	{iLevels : 42, vResult : 42},
	{iLevels : Number.MAX_SAFE_INTEGER, vResult : null},
	{iLevels : 1e16, vResult : null}
].forEach(function (oFixture) {
	QUnit.test("expand by levels: " + oFixture.iLevels, function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~", mustBeMocked);
		if (oFixture.vResult === null) {
			oTreeState.mPredicate2ExpandInfo["~predicate~"] = "~old~";
		}
		this.mock(oTreeState).expects("deleteExpandInfo")
			.exactly(oFixture.vResult ? 0 : 1).withExactArgs("~oNode~")
			.callsFake(function () {
				delete oTreeState.mPredicate2ExpandInfo["~predicate~"];
			});
		this.mock(_Helper).expects("getPrivateAnnotation").twice()
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		this.mock(oTreeState).expects("fnGetKeyFilter")
			.withExactArgs("~oNode~").returns("~filter~");
		this.mock(_Helper).expects("drillDown")
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.expand("~oNode~", oFixture.iLevels);

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {
			"~predicate~" :
				{filter : "~filter~", levels : oFixture.vResult, nodeId : "~sNodeId~"}
		});

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {});
	});
});

	//*********************************************************************************************
	QUnit.test("collapse/expand", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~", mustBeMocked);

		this.mock(_Helper).expects("getPrivateAnnotation").thrice()
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		this.mock(oTreeState).expects("fnGetKeyFilter").twice()
			.withExactArgs("~oNode~").returns("~filter~");
		this.mock(_Helper).expects("drillDown").twice()
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {
			"~predicate~" :
				{collapseAll : undefined, filter : "~filter~", levels : 0, nodeId : "~sNodeId~"}
		});

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {
			"~predicate~" :
				{collapseAll : undefined, filter : "~filter~", levels : 0, nodeId : "~sNodeId~"}
		});

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {});
	});

	//*********************************************************************************************
	QUnit.test("collapse all/expand", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~", mustBeMocked);

		this.mock(_Helper).expects("getPrivateAnnotation").twice()
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		this.mock(oTreeState).expects("fnGetKeyFilter").twice()
			.withExactArgs("~oNode~").returns("~filter~");
		this.mock(_Helper).expects("drillDown").twice()
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.collapse("~oNode~", true);

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {
			"~predicate~" :
				{collapseAll : true, filter : "~filter~", levels : 0, nodeId : "~sNodeId~"}
		});

		// code under test
		oTreeState.expand("~oNode~", 42);

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {
			"~predicate~" :
				{filter : "~filter~", levels : 42, nodeId : "~sNodeId~"}
		});
	});

	//*********************************************************************************************
	QUnit.test("collapse: bNested", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.mPredicate2ExpandInfo = {
			"~predicate~" : {collapseAll : false, nodeId : "~sNodeId~", levels : 0},
			foo : "bar"
		};

		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs("~oNode~", "predicate")
			.returns("~predicate~");

		// code under test
		oTreeState.collapse("~oNode~", /*bAll*/true, /*bNested*/true);

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {foo : "bar"});
	});

	//*********************************************************************************************
	QUnit.test("delete", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.mPredicate2ExpandInfo["foo"] = "bar";
		oTreeState.mPredicate2ExpandInfo["~predicate~"] = "~";

		const oTreeStateMock = this.mock(oTreeState);
		// initial call
		oTreeStateMock.expects("delete").withExactArgs("~oNode~").callThrough();
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		oTreeStateMock.expects("deleteOutOfPlace").withExactArgs("~predicate~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode~", "spliced", [])
			.returns(["~oChild0~", "~oChild1~"]);
		oTreeStateMock.expects("delete").withExactArgs("~oChild0~");
		oTreeStateMock.expects("delete").withExactArgs("~oChild1~");

		// code under test
		oTreeState.delete("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {foo : "bar"});
	});

	//*********************************************************************************************
	QUnit.test("deleteExpandInfo", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.mPredicate2ExpandInfo["foo"] = "bar";
		oTreeState.mPredicate2ExpandInfo["~predicate~"] = "~";

		const oTreeStateMock = this.mock(oTreeState);
		// initial call
		oTreeStateMock.expects("deleteExpandInfo").withExactArgs("~oNode~").callThrough();
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode~", "spliced", [])
			.returns(["~oChild0~", "~oChild1~"]);
		oTreeStateMock.expects("deleteExpandInfo").withExactArgs("~oChild0~");
		oTreeStateMock.expects("deleteExpandInfo").withExactArgs("~oChild1~");

		// code under test
		oTreeState.deleteExpandInfo("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {foo : "bar"});
	});

	//*********************************************************************************************
["collapse", "delete", "expand"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": no sNodeProperty", function (assert) {
		const oTreeState = new _TreeState();

		oTreeState.mPredicate2ExpandInfo["foo"] = "bar";
		this.mock(_Helper).expects("drillDown").never();

		// code under test
		oTreeState[sMethod]("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {foo : "bar"});
	});
});

	//*********************************************************************************************
	QUnit.test("getExpandFilters", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		const fnDoNotCallMe = mustBeMocked;

		// code under test
		assert.deepEqual(oTreeState.getExpandFilters(fnDoNotCallMe), []);

		oTreeState.mPredicate2ExpandInfo = {
			foo : {filter : "qux"},
			bar : {filter : "baz"},
			out : {filter : "n/a"}
		};

		assert.deepEqual(
			// code under test
			oTreeState.getExpandFilters((sPredicate) => sPredicate !== "out"),
			["qux", "baz"]);

		// code under test
		assert.deepEqual(oTreeState.getExpandFilters(() => false), []);
	});

	//*********************************************************************************************
	QUnit.test("getExpandLevels/reset", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.oOutOfPlace = "~oOutOfPlace~";

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), undefined);

		oTreeState.mPredicate2ExpandInfo = {
			foo : {collapseAll : true, nodeId : "baz", levels : 42},
			bar : {collapseAll : false, nodeId : "qux", levels : 23}
		};
		const sPredicate2ExpandInfo = JSON.stringify(oTreeState.mPredicate2ExpandInfo);

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(),
			'[{"NodeID":"baz","Levels":42},{"NodeID":"qux","Levels":23}]');

		assert.strictEqual(JSON.stringify(oTreeState.mPredicate2ExpandInfo),
			sPredicate2ExpandInfo);

		this.mock(oTreeState).expects("resetOutOfPlace").withExactArgs();

		// code under test
		oTreeState.reset();

		assert.deepEqual(oTreeState.mPredicate2ExpandInfo, {});
	});

	//*********************************************************************************************
	QUnit.test("out of place", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~", mustBeMocked);

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), []);

		const oTreeStateMock = this.mock(oTreeState);
		oTreeStateMock.expects("deleteOutOfPlace").never();
		const oNode1 = {"@$ui5.context.isTransient" : false};
		const oContext1 = {
			ID : "~oContext1~", // for #deepEqual
			setOutOfPlace : mustBeMocked
		};
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode1), "context").returns(oContext1);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs(sinon.match.same(oNode1))
			.returns("~node1Filter~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode1), "predicate").returns("~node1Predicate~");
		this.mock(oContext1).expects("setOutOfPlace").withExactArgs(true);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent1~")
			.returns("~parent1Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oParent1~", "predicate")
			.returns("~parent1Predicate~");

		// code under test
		oTreeState.setOutOfPlace(oNode1, "~oParent1~");

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {
			"~node1Predicate~" : {
				context : oContext1,
				nodeFilter : "~node1Filter~",
				nodePredicate : "~node1Predicate~",
				parentFilter : "~parent1Filter~",
				parentPredicate : "~parent1Predicate~"
			}
		});
		assert.strictEqual(oTreeState.getOutOfPlaceCount(), 1);
		assert.deepEqual(oTreeState.getOutOfPlacePredicates(), ["~node1Predicate~"]);

		const oNode3 = {"@$ui5.context.isTransient" : false};
		const oContext3 = {
			ID : "~oContext3~", // for #deepEqual
			setOutOfPlace : mustBeMocked
		};
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode3), "context").returns(oContext3);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs(sinon.match.same(oNode3))
			.returns("~node3Filter~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode3), "predicate").returns("~node3Predicate~");
		this.mock(oContext3).expects("setOutOfPlace").withExactArgs(true);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent2~")
			.returns("~parent2Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oParent2~", "predicate")
			.returns("~parent2Predicate~");

		// code under test
		oTreeState.setOutOfPlace(oNode3, "~oParent2~");

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {
			"~node1Predicate~" : {
				context : oContext1,
				nodeFilter : "~node1Filter~",
				nodePredicate : "~node1Predicate~",
				parentFilter : "~parent1Filter~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node3Predicate~" : {
				context : oContext3,
				nodeFilter : "~node3Filter~",
				nodePredicate : "~node3Predicate~",
				parentFilter : "~parent2Filter~",
				parentPredicate : "~parent2Predicate~"
			}
		});
		assert.strictEqual(oTreeState.getOutOfPlaceCount(), 2);
		assert.deepEqual(oTreeState.getOutOfPlacePredicates(),
			["~node1Predicate~", "~node3Predicate~"]);

		const oNode2 = {"@$ui5.context.isTransient" : false};
		const oContext2 = {
			ID : "~oContext2~", // for #deepEqual
			setOutOfPlace : mustBeMocked
		};
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode2), "context").returns(oContext2);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs(sinon.match.same(oNode2))
			.returns("~node2Filter~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode2), "predicate").returns("~node2Predicate~");
		this.mock(oContext2).expects("setOutOfPlace").withExactArgs(true);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent1~")
			.returns("~parent1Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oParent1~", "predicate")
			.returns("~parent1Predicate~");

		// code under test
		oTreeState.setOutOfPlace(oNode2, "~oParent1~");

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {
			"~node1Predicate~" : {
				context : oContext1,
				nodeFilter : "~node1Filter~",
				nodePredicate : "~node1Predicate~",
				parentFilter : "~parent1Filter~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node3Predicate~" : {
				context : oContext3,
				nodeFilter : "~node3Filter~",
				nodePredicate : "~node3Predicate~",
				parentFilter : "~parent2Filter~",
				parentPredicate : "~parent2Predicate~"
			},
			"~node2Predicate~" : {
				context : oContext2,
				nodeFilter : "~node2Filter~",
				nodePredicate : "~node2Predicate~",
				parentFilter : "~parent1Filter~",
				parentPredicate : "~parent1Predicate~"
			}
		});
		// code under test
		assert.strictEqual(oTreeState.getOutOfPlaceCount(), 3);
		assert.deepEqual(oTreeState.getOutOfPlacePredicates(),
			["~node1Predicate~", "~node3Predicate~", "~node2Predicate~"]);

		const oNode4 = {"@$ui5.context.isTransient" : false};
		const oContext4 = {
			ID : "~oContext4~", // for #deepEqual
			setOutOfPlace : mustBeMocked
		};
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode4), "context").returns(oContext4);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs(sinon.match.same(oNode4))
			.returns("~node4Filter~");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode4), "predicate").returns("~node4Predicate~");
		this.mock(oContext4).expects("setOutOfPlace").withExactArgs(true);

		// code under test
		oTreeState.setOutOfPlace(oNode4);

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {
			"~node1Predicate~" : {
				context : oContext1,
				nodeFilter : "~node1Filter~",
				nodePredicate : "~node1Predicate~",
				parentFilter : "~parent1Filter~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node3Predicate~" : {
				context : oContext3,
				nodeFilter : "~node3Filter~",
				nodePredicate : "~node3Predicate~",
				parentFilter : "~parent2Filter~",
				parentPredicate : "~parent2Predicate~"
			},
			"~node2Predicate~" : {
				context : oContext2,
				nodeFilter : "~node2Filter~",
				nodePredicate : "~node2Predicate~",
				parentFilter : "~parent1Filter~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node4Predicate~" : {
				context : oContext4,
				nodeFilter : "~node4Filter~",
				nodePredicate : "~node4Predicate~"
			}
		});
		// code under test
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), [{
			nodeFilters : ["~node1Filter~", "~node2Filter~"],
			nodePredicates : ["~node1Predicate~", "~node2Predicate~"],
			parentFilter : "~parent1Filter~",
			parentPredicate : "~parent1Predicate~"
		}, {
			nodeFilters : ["~node3Filter~"],
			nodePredicates : ["~node3Predicate~"],
			parentFilter : "~parent2Filter~",
			parentPredicate : "~parent2Predicate~"
		}, {
			nodeFilters : ["~node4Filter~"],
			nodePredicates : ["~node4Predicate~"],
			parentFilter : undefined,
			parentPredicate : undefined
		}]);

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlace("~node3Predicate~"), {
			context : oContext3,
			nodeFilter : "~node3Filter~",
			nodePredicate : "~node3Predicate~",
			parentFilter : "~parent2Filter~",
			parentPredicate : "~parent2Predicate~"
		});

		oTreeStateMock.expects("getOutOfPlacePredicates").withExactArgs().returns(["a", "b", "c"]);
		oTreeStateMock.expects("deleteOutOfPlace").withExactArgs("a");
		oTreeStateMock.expects("deleteOutOfPlace").withExactArgs("b");
		oTreeStateMock.expects("deleteOutOfPlace").withExactArgs("c");

		// code under test
		oTreeState.resetOutOfPlace();
	});

	//*********************************************************************************************
	QUnit.test("setOutOfPlace: Not 'created persisted'", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		[{}, {"@$ui5.context.isTransient" : undefined}, {"@$ui5.context.isTransient" : true}]
			.forEach((oNode) => {
				assert.throws(function () {
					oTreeState.setOutOfPlace(oNode);
				}, new Error("Not 'created persisted'"));
			});

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {});
	});

	//*********************************************************************************************
	QUnit.test("stillOutOfPlace", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.mPredicate2OutOfPlace["('a')"] = {
			context : "~context~"
		};
		const oNode = {};
		this.mock(_Helper).expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oNode), "context", "~context~");

		// code under test
		oTreeState.stillOutOfPlace(oNode, "('a')");

		assert.deepEqual(oNode, {"@$ui5.context.isTransient" : false});
	});

	//*********************************************************************************************
	QUnit.test("deleteOutOfPlace", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		// we ignore the filters as they are not relevant
		oTreeState.mPredicate2OutOfPlace = {
			"~node0Predicate~" : {
				nodePredicate : "~node0Predicate~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node1Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node1Predicate~",
				parentPredicate : "~node0Predicate~"
			},
			"~node2Predicate~" : {
				nodePredicate : "~node2Predicate~"
			},
			"~node3Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node3Predicate~",
				parentPredicate : "~node1Predicate~"
			},
			"~node4Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node4Predicate~",
				parentPredicate : "~node3Predicate~"
			}
		};

		// code under test
		oTreeState.deleteOutOfPlace("~parent1Predicate~");

		assert.deepEqual(Object.keys(oTreeState.mPredicate2OutOfPlace), [
				"~node0Predicate~",
				"~node1Predicate~",
				"~node2Predicate~",
				"~node3Predicate~",
				"~node4Predicate~"
			], "unchanged");

		this.mock(oTreeState.mPredicate2OutOfPlace["~node1Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);
		this.mock(oTreeState.mPredicate2OutOfPlace["~node3Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);
		this.mock(oTreeState.mPredicate2OutOfPlace["~node4Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);

		// code under test
		oTreeState.deleteOutOfPlace("~node1Predicate~");

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {
			"~node0Predicate~" : {
				nodePredicate : "~node0Predicate~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node2Predicate~" : {
				nodePredicate : "~node2Predicate~"
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("deleteOutOfPlace: bUpAndDown", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		// we ignore the filters as they are not relevant
		// parent1
		//   node1
		//     node3
		//       node4
		//       node5
		//     node6
		// node2
		oTreeState.mPredicate2OutOfPlace = {
			"~node1Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node1Predicate~",
				parentPredicate : "~parent1Predicate~"
			},
			"~node2Predicate~" : {
				nodePredicate : "~node2Predicate~"
			},
			"~node3Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node3Predicate~",
				parentPredicate : "~node1Predicate~"
			},
			"~node4Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node4Predicate~",
				parentPredicate : "~node3Predicate~"
			},
			"~node5Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node5Predicate~",
				parentPredicate : "~node3Predicate~"
			},
			"~node6Predicate~" : {
				context : {
					setOutOfPlace : mustBeMocked
				},
				nodePredicate : "~node6Predicate~",
				parentPredicate : "~node1Predicate~"
			}
		};
		this.mock(oTreeState.mPredicate2OutOfPlace["~node1Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);
		this.mock(oTreeState.mPredicate2OutOfPlace["~node3Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);
		this.mock(oTreeState.mPredicate2OutOfPlace["~node4Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);
		this.mock(oTreeState.mPredicate2OutOfPlace["~node5Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);
		this.mock(oTreeState.mPredicate2OutOfPlace["~node6Predicate~"].context)
			.expects("setOutOfPlace").withExactArgs(false);

		// code under test
		oTreeState.deleteOutOfPlace("~node4Predicate~", true);

		assert.deepEqual(oTreeState.mPredicate2OutOfPlace, {
			"~node2Predicate~" : {
				nodePredicate : "~node2Predicate~"
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("isOutOfPlace", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		// we ignore all details as they are not relevant
		oTreeState.mPredicate2OutOfPlace = {
			"~node1Predicate~" : {},
			"~node2Predicate~" : null
		};

		// code under test
		assert.strictEqual(oTreeState.isOutOfPlace("~node1Predicate~"), true);

		// code under test
		assert.strictEqual(oTreeState.isOutOfPlace("~node2Predicate~"), true);

		// code under test
		assert.strictEqual(oTreeState.isOutOfPlace("~node3Predicate~"), false);
	});
});
