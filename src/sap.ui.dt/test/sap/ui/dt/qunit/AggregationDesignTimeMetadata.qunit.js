/*global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/AggregationDesignTimeMetadata",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/thirdparty/sinon-4"

],function(
	AggregationDesignTimeMetadata,
	DesignTimeMetadata,
	sinon
){
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that an AggregationDesignTimeMetadata is created", {
		before : function() {
			this.oAggreationDesignTimeMetadata = new AggregationDesignTimeMetadata({
				data: {}
			});
		},
		after : function() {
			this.oAggreationDesignTimeMetadata.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when getLabel is called and DesignTimeMetadata.getLabel() returning undefined", function(assert) {
		var aMockArguments = ["testArg1", "testArg2"];
		var fnDtGetLabelStub = sandbox.stub(DesignTimeMetadata.prototype, "getLabel").withArgs.apply(DesignTimeMetadata.prototype.getLabel, aMockArguments);
		var sReturnValue = this.oAggreationDesignTimeMetadata.getLabel.apply(null, aMockArguments);
		assert.ok(fnDtGetLabelStub.calledOnce, "then DesignTimeMetadata.getLabel() called once with the passed arguments");
		assert.strictEqual(sReturnValue, aMockArguments[1], "then the second argument (aggregation name) is returned as a fallback");
	});

	QUnit.start();
});