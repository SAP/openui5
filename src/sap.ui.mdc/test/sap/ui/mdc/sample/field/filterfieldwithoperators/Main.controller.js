sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/type/Integer",
//	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/mdc/field/FieldBaseDelegate", // just to have it in Fields from beginning
	"sap/ui/mdc/FilterField",
	"./BoolExprTool",
	"sap/m/MessageToast",
	"sap/m/Slider",
	"sap/m/Dialog",
	"sap/m/Button"
], function(
		Controller,
		Filter,
		TypeInteger,
//		ResourceModel,
		JSONModel,
		ConditionModel,
		Condition,
		FilterOperatorUtil,
		Operator,
		RangeOperator,
		BaseType,
		FieldBaseDelegate,
		FilterField,
		BoolExprTool,
		MessageToast,
		Slider,
		Dialog,
		Button
	) {
	"use strict";

	return Controller.extend("my.Main", {

		onInit: function() {

			// add messageManager. TODO: should work automatically
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

			// create a ConditionModel for the listbinding
			var oCM = new ConditionModel();

			// init/add some default conditions
			// oCM.addCondition("title", Condition.createCondition("Contains", ["Wars"]));
			//oCM.addCondition("*title,genre*", Condition.createCondition("StartsWith", ["Star"]));
			oCM.addCondition("title", Condition.createCondition("BT", ["A", "Z"]));
			oCM.addCondition("rating", Condition.createCondition("GE", [7.5]));
			oCM.addCondition("genre", Condition.createItemCondition("action", "Action"));
			oCM.addCondition("silentMovie", Condition.createCondition("EQ", [false]));
			//oCM.addCondition("releaseDate", Condition.createCondition("BT", [new Date(2017, 3, 25, 0, 0, 0, 0), new Date(2017, 3, 29, 0, 0, 0, 0)]));
			oCM.addCondition("runningTime", Condition.createCondition("EQ", [90]));

			//set the model on your view
			this.getView().setModel(oCM, "cm");

			// add some custom operations to the Fields
			this.addCustomOperators();

			//listen on ConditionModel change event to handle model changes
			var oConditionChangeBinding = oCM.bindProperty("/", oCM.getContext("/"));
			oConditionChangeBinding.attachChange(function(oEvent) {
				var n = 0;
				for ( var sFieldPath in oEvent.oSource.oValue.conditions) {
					n = n + oEvent.oSource.oValue.conditions[sFieldPath].length;
				}
				setTimeout(function() {
					MessageToast.show(n + "# conditions");
				}, 3000);

				var oCM = oEvent.oSource.getModel();
				if (oCM.getConditions("genre").length > 1) {
					MessageToast.show("max 'genre' conditions reached!!!");
				}

				var oView = this.getView();
				var oModel = oView.getModel();

				//update chart filter
				for (var i = 0; i < oModel.oData.genreChartElements.length; i++) {
					oModel.oData.genreChartElements[i].selected = false;
				}
				var aConditions = oCM.getConditions("genre");
				aConditions.forEach(function(oCondition) {
					// var sFieldPath = oCondition.fieldPath;
					var sGenre = oCondition.values[0];
					for (var i = 0; i < oModel.oData.genreChartElements.length; i++) {
						if (oModel.oData.genreChartElements[i].key === sGenre) {
							oModel.oData.genreChartElements[i].selected = true;
						}
					}
				});

				oModel.checkUpdate();

				if (this.byId("liveupdate").getSelected()) {
					var bValid = this.applyFilters(oCM, false);
					this.byId("movieTable").setShowOverlay(!bValid);
				}
			}.bind(this));

			// make the default filtering of the table
			var bValid = this.applyFilters(oCM, false);
			this.byId("movieTable").setShowOverlay(!bValid);
		},

		applyFilters: function(oCM, bValidate) {
			var oListBinding = this.byId("movieTable").getBinding("items");
			var oFilter = oCM.getFilters();
			oListBinding.filter(oFilter);
			return true; // TODO remove validation logic
		},

		addCustomOperators: function() {
			//TODO:
			//Howto clone an operator
			//HowTo overwrite the tokenText and longText

			// var op = FilterOperatorUtil.getOperator("EQ");
			// op.longText = "Date";
			// op.tokenText = "Date";

			// new EQ Operator for Date
			var myEqual =  new Operator({
				name: "MYEQ",
				filterOperator: "EQ",
				tokenParse: "^=(.+)$",
				tokenFormat: "Date - {0}",
				longText: "Date",
				tokenText: "Date",
				valueTypes: [Operator.ValueType.Self],
				exclude: false
			});
			FilterOperatorUtil.addOperator(myEqual);

			// new Years range Operator
			FilterOperatorUtil.addOperator(new RangeOperator({
				name: "LASTXYYEARS",
				tokenParse: "^#tokenText#$",
				tokenFormat: "#tokenText#",
				longText: "last x-y years",
				tokenText: "last $0-$1 years",
				valueTypes: ["sap.ui.model.type.Integer", "sap.ui.model.type.Integer"],
				paramTypes: ["(\\d+)", "(\\d+)"],
				getModelFilter: function(oCondition, sFieldPath) {
					return new Filter({ path: sFieldPath, operator: "BT", value1: new Date(new Date().getFullYear() - oCondition.values[0], 0, 1), value2: new Date(new Date().getFullYear() - oCondition.values[1], 11, 31) });
				}
			}));


			var aOperators = FilterOperatorUtil.getOperatorsForType(BaseType.Date);
			// aOperators.splice(0, 1); // remove EQ
			aOperators[0] = "MYEQ"; // overwrite the old EQ
			aOperators.push("LASTXYYEARS");

			//add the LASTXYEARS operation to the date Fields
			var oFilterField = this.byId("releaseDateFF");
			// assign the new Operators to the Date field
			oFilterField.setOperators(aOperators);

			// Or update the default operator for the type
			// FilterOperatorUtil.setOperatorsForType(BaseType.Date, aOperators, "MYEQ");
		},

		onSaveVariant: function() {
			var oTable = this.byId("movieTable");
			var oListBinding = oTable.getBinding("items");
			var sVariant = this.getView().getModel("cm").serialize(oListBinding);
			this.byId("variant").setValue(sVariant);
		},

		onLoadVariant: function() {
			var oCM = this.getView().getModel("cm");
			oCM.parse(this.byId("variant").getValue());

			var bValid = this.applyFilters(oCM, false);
			this.byId("movieTable").setShowOverlay(!bValid);
		},

		prettyPrintFilters: function(oFilter) {
			var sRes;
			if (!oFilter) {
				return "";
			}
			if (oFilter._bMultiFilter) {
				sRes = "";
				var bAnd = oFilter.bAnd;
				oFilter.aFilters.forEach(function(oFilter, index, aFilters) {
					sRes += this.prettyPrintFilters(oFilter);
					if (aFilters.length - 1 != index) {
						sRes += bAnd ? " and " : " or ";
					}
				}, this);
				return "(" + sRes + ")";
			} else {
				sRes = oFilter.sPath + " " + oFilter.sOperator + " '" + oFilter.oValue1 + "'";
				if (oFilter.sOperator === "BT") {
					sRes += "...'" + oFilter.oValue2 + "'";
				}
				return sRes;
			}
		},

		onGo: function() {
			var oCM = this.getView().getModel("cm");

			// Either use the applyFilters
			var bValid = this.applyFilters(oCM, true);
			this.byId("movieTable").setShowOverlay(!bValid);

			window.console.log(this.prettyPrintFilters(oCM.getFilters()));
		},

		CountFormatter: function(oConditions) {
			var i = 0;
			for ( var sFieldPath in oConditions) {
				i = i + oConditions[sFieldPath].length;
			}
			return "Filter " + (i > 0 ? "(" + i + ")" : "");
		},

		onConditionModelToExpr: function() {
			this.byId("expert").setValue(BoolExprTool.prettyPrintCM(this.getView().getModel("cm")));
		},

		onExprToConditionModel: function() {
			var sExpr = this.byId("expert").getValue();
			var oCM = this.getView().getModel("cm");

			var ast = BoolExprTool.booleanExprParser(sExpr, oCM);
			oCM.removeAllConditions();
			BoolExprTool.ASTtoCM(ast, oCM);

			// update the saved conditionModel content
			this.onSaveVariant();
		},

		onFormatAst: function() {
			var sValue = this.byId("ast").getValue();

			if (sValue) {
				var ast = JSON.parse(sValue);
				this.byId("expert").setValue(BoolExprTool.booleanExprFormatter(ast, this.getView().getModel("cm")));
			}
		},

		onExprChange: function() {
			this.onParseExpr();
		},

		onParseExpr: function() {
			var sValue = this.byId("expert").getValue();
			var oCM = this.getView().getModel("cm");

			try {
				window.console.log("parse:'" + sValue + "'");
				var ast = BoolExprTool.booleanExprParser(sValue, oCM); //"a and b or !(f1: =c)");
				window.console.log("stringify(ast) : " + JSON.stringify(ast));
				window.console.log("format(ast) : " + BoolExprTool.booleanExprFormatter(ast, oCM));

				this.byId("ast").setValue(JSON.stringify(ast, null, "  "));
				// this.byId("asterror").setText("");

			} catch (error) {
				window.console.error(error.message);
				// this.byId("ast").setValue("");
				this.byId("ast").setValue(error.message);
			}
		},

		onDonutChartSelectionChanged: function(oEvent) {
			var oSegment = oEvent.getParameter("segment");
			var sKey = oSegment._getBindingContext().getObject().key;

			var oCM = this.getView().getModel("cm");
			var oCondition = Condition.createItemCondition(sKey, oSegment.getLabel());
			if (oSegment.getSelected()) {
				oCM.addCondition("genre", oCondition);
			} else {
				oCM.removeCondition("genre", oCondition);
			}
		},

		onBarChartSelectionChanged: function(oEvent) {
			var oBar = oEvent.getParameter("bar");
			var sKey = oBar._getBindingContext().getObject().key;

			var oCM = this.getView().getModel("cm");
			var oCondition = Condition.createItemCondition(sKey, oBar.getLabel());
			if (oBar.getSelected()) {
				oCM.addCondition("genre", oCondition);
			} else {
				oCM.removeCondition("genre", oCondition);
			}
		},

		onLineChartSelectionChanged: function(oEvent) {
			var oPoint = oEvent.getParameter("point");
			var sKey = oPoint._getBindingContext().getObject().key;

			var oCM = this.getView().getModel("cm");
			var oCondition = Condition.createItemCondition(sKey, oPoint.getLabel());
			if (oPoint.getSelected()) {
				oCM.addCondition("genre", oCondition);
			} else {
				oCM.removeCondition("genre", oCondition);
			}
		}
	});

});
