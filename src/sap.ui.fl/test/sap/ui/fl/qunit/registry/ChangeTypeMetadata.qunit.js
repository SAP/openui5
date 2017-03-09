jQuery.sap.require("sap.ui.fl.registry.ChangeTypeMetadata");

(function(ChangeTypeMetadata) {

	QUnit.module("sap.ui.fl.registry.ChangeTypeMetadata", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("constructor - required params and their getter", function(assert) {
		//Arrange
		var mParam = {
			name: "ABC",
			changeHandler: "myChangeHandler"
		};

		//Act
		var instance = new ChangeTypeMetadata(mParam);

		//Assert
		equal(instance.getName(), "ABC");
		equal(instance.getChangeHandler(), "myChangeHandler");
	});

	QUnit.test("constructor - shall log error messages for missing mandatory parameters", function(assert) {
		//Arrange
		var errorLogStub = sinon.stub(jQuery.sap.log, "error");

		//Act
		var instance = new ChangeTypeMetadata({});

		//Assert
		sinon.assert.calledTwice(errorLogStub);
		errorLogStub.restore();
	});

	QUnit.test("constructor - all params and their getter", function(assert) {
		//Arrange
		var mParam = {
			name: "ABC",
			changeHandler: "myChangeHandler",
			labelKey: "myLabelKey",
			tooltipKey: "myTooltipKey",
			iconKey: "myIconKey",
			sortIndex: 5
		};

		//Act
		var instance = new ChangeTypeMetadata(mParam);

		//Assert
		equal(instance.getName(), "ABC");
		equal(instance.getChangeHandler(), "myChangeHandler");
		equal(instance.getLabel(), "myLabelKey");
		equal(instance.getTooltip(), "myTooltipKey");
		equal(instance.getIcon(), "myIconKey");
		equal(instance.getSortIndex(), 5);
	});

}(sap.ui.fl.registry.ChangeTypeMetadata));
