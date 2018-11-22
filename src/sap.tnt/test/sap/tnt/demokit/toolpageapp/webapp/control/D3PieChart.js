sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./D3Chart",
	"sap/ui/thirdparty/d3",
	"sap/ui/core/theming/Parameters"
], function($, D3Chart, d3, Parameters) {
	"use strict";

	return D3Chart.extend("sap.ui.demo.toolpageapp.control.D3PieChart", {

		init: function () {
			D3Chart.prototype.init.call(this);
			this.setType("Pie");
		},
//comment
		_updateSVG: function (iWidth) {
			var aData = this.getBinding("data").getCurrentContexts().map(function (oContext) {
				return oContext.getObject();
			});

			var innerRadius = 30;
			var outerRadius = 50;
			var fnScaleValue = d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]);

			var arc = d3.svg.arc()
				.outerRadius(outerRadius)
				.innerRadius(innerRadius)
				.startAngle(fnScaleValue(0))
				.endAngle(function (d) {
					return fnScaleValue(d.data.v);
				});

			var pie = d3.layout.pie()
				.value(function(d) {
					return d.v;
				});

			// remove old transformation node
			var g = d3.select("#" + this._sContainerId).selectAll("g");
			g.remove();

			// add new transformation node
			var selContainer = d3.select("#" + this._sContainerId)
				.insert("g")
				.attr("transform", "translate(" + iWidth / 2 + "," + this._iHeight / 2 + ")");

			// prepare pie chart
			g = selContainer.selectAll("g")
				.data(pie(aData))
				.enter();

			// draw arcs
			g.append("path")
				.attr("fill", function() {
					return Parameters.get("sapUiChart1");
				})
				.attr("d", arc);

			var selTexts = selContainer.selectAll("text")
				.data(aData);

			// draw text in the center of the donut
			selTexts.enter()
				.append("text")
				.text(function (d) { return d.v; })
				.attr("font-size", "0.875rem")
				.attr("fill", function() { return Parameters.get("sapUiText"); } )
				.attr("text-anchor", "middle")
				.attr("y", function () {
					return $(this).height() / 2;
				});
		},

		renderer: function () {
			D3Chart.prototype.getRenderer().render.apply(this, arguments);
		}
	});
});