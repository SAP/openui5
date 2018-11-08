/*eslint-env es6*/
sap.ui.define([
	"sap/ui/thirdparty/d3",
	"sap/ui/core/Control",
	"sap/ui/dom/includeStylesheet",
	"require"
], function(d3, Control, includeStylesheet, require) {
	"use strict";

	function renderTreeMap(oChart) {

		var dom = oChart.getDomRef();
		var data = oChart._oData.children[0];

		var w = dom.offsetWidth - 40,
			h = dom.offsetHeight - 40,
			xscale = d3.scale.linear().range([0, w]),
			yscale = d3.scale.linear().range([0, h]),
			color = d3.scale.category10(),
			headerHeight = 20,
			headerColor = "#aaaaaa",
			node, root, chart;
		var transitionDuration = 500;

		var treemap = d3.layout.treemap()
			.round(false)
			.size([w, h])
			.sticky(true)
			.value(function(d) { return d.count; });

		chart = d3.select("#" + oChart.getId())
			.style("width", w + "px")
			.style("height", h + "px")
			.style("padding", "20px")
			.append("svg:svg")
			.attr("width", w)
			.attr("height", h)
			.append("svg:g");

		node = root = data;
		//console.log(data);

		var tmr = treemap.nodes(root);

		var packages = tmr.filter(function(d) {return !!d.children; });
		var packageCells = chart.selectAll("g.cell.package").data(packages, (d) => `p-${d.name}`);

		var packageCellsEnter = packageCells.enter()
			.append("g")
			.attr("class", "cell package")
			.on("click", function(d) {
				return zoom(d);
			})
			.append("svg")
			.attr("class", "clip")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx);
			})
			.attr("height", headerHeight);

		packageCellsEnter.append("rect")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx);
			})
			.attr("height", headerHeight)
			.style("fill", headerColor);

		packageCellsEnter.append('text')
			.attr("class", "label")
			.attr("transform", "translate(3, 13)")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx);
			})
			.attr("height", headerHeight)
			.text(function(d) {
				return d.name;
			});

		// update transition
		var packageUpdateTransition = packageCells.transition().duration(transitionDuration);
		packageUpdateTransition.select(".cell")
			.attr("transform", function(d) {
				return "translate(" + d.dx + "," + d.y + ")";
			});
		packageUpdateTransition.select("rect")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx);
			})
			.attr("height", headerHeight)
			.style("fill", headerColor);
		packageUpdateTransition.select(".label")
			.attr("transform", "translate(3, 13)")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx);
			})
			.attr("height", headerHeight)
			.text(function(d) {
				return d.name;
			});
		// remove transition
		packageCells.exit()
			.remove();

		// create children cells
		var leaves = tmr.filter(function(d) {return !d.children; });
		var leafCells = chart.selectAll("g.cell.leaf").data(leaves, (d) => `c-${d.name}`);

		// enter transition
		var leafCellsEnter = leafCells.enter()
			.append("g")
			.attr("class", "cell leaf")
			.on("click", function(d) {
				zoom(node === d.parent ? root : d.parent);
			})
			.append("svg")
			.attr("class", "clip");

		leafCellsEnter.append("rect")
			.classed("background", true)
			.style("fill", function(d) {
				return color(d.parent.name);
			});

		leafCellsEnter.append("a")
			.attr("href", function(d) {
				return d.href;
			})
			.attr("target", "test")
			.append('text')
			.attr("class", "label")
			.attr('x', function(d) {
				return d.dx / 2;
			})
			.attr('y', function(d) {
				return d.dy / 2;
			})
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.style("display", "none")
			.text(function(d) {
				return d.name;
			});

		// update transition
		var leavesUpdateTransition = leafCells.transition().duration(transitionDuration);
		leavesUpdateTransition.select(".cell")
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		leavesUpdateTransition.select("rect")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx);
			})
			.attr("height", function(d) {
				return d.dy;
			})
			.style("fill", function(d) {
				return color(d.parent.name);
			});
		leavesUpdateTransition.select(".label")
			.attr('x', function(d) {
				return d.dx / 2;
			})
			.attr('y', function(d) {
				return d.dy / 2;
			})
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.style("display", "none")
			.text(function(d) {
				return d.name;
			});

		// exit transition
		leafCells.exit()
			.remove();

		zoom(node);

		function zoom(d) {
			treemap
				.padding([headerHeight / (h / d.dy), 0, 0, 0])
				.nodes(d);

			// moving the next two lines above treemap layout messes up padding of zoom result
			var kx = w / d.dx;
			var ky = h / d.dy;
			var level = d;

			xscale.domain([d.x, d.x + d.dx]);
			yscale.domain([d.y, d.y + d.dy]);

			if (node != level) {
				let allLeaves = chart.selectAll(".cell.leaf .label");
				allLeaves.style("display", "none");
			}

			var zoomTransition = chart.selectAll("g.cell").transition().duration(transitionDuration)
				.attr("transform", function(d) {
					return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")";
				})
				.each("start", function() {
					d3.select(this).select("label")
						.style("display", "none");
				})
				.each("end", function(d, i) {
					if (!i && (level !== root)) {
						chart.selectAll(".cell.leaf")
							.filter(function(d) {
								return d.parent === node; // only get the children for selected group
							})
							.select(".label")
							.style("display", "")
							.style("fill", function(d) {
								return idealTextColor(color(d.parent.name));
							});
					}
				});

			zoomTransition.select(".clip")
				.attr("width", function(d) {
					return Math.max(0.01, (kx * d.dx));
				})
				.attr("height", function(d) {
					return d.children ? headerHeight : Math.max(0.01, (ky * d.dy));
				});

			zoomTransition.select(".label")
				.attr("width", function(d) {
					return Math.max(0.01, (kx * d.dx));
				})
				.attr("height", function(d) {
					return d.children ? headerHeight : Math.max(0.01, (ky * d.dy));
				})
				.text(function(d) {
					return d.name;
				});

			zoomTransition.select(".leaf .label")
				.attr("x", function(d) {
					return kx * d.dx / 2;
				})
				.attr("y", function(d) {
					return ky * d.dy / 2;
				});

			zoomTransition.select("rect")
				.attr("width", function(d) {
					return Math.max(0.01, (kx * d.dx));
				})
				.attr("height", function(d) {
					return d.children ? headerHeight : Math.max(0.01, (ky * d.dy));
				})
				.style("fill", function(d) {
					return d.children ? headerColor : color(d.parent.name);
				});

			node = d;

			if (d3.event) {
				d3.event.stopPropagation();
			}

		}

	}


	function getRGBComponents(color) {
		var r = color.substring(1, 3);
		var g = color.substring(3, 5);
		var b = color.substring(5, 7);
		return {
			R: parseInt(r, 16),
			G: parseInt(g, 16),
			B: parseInt(b, 16)
		};
	}


	function idealTextColor(bgColor) {
		var nThreshold = 105;
		var components = getRGBComponents(bgColor);
		var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
		return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
	}


	function normalizeURL(testConfig) {
		let path, kind = "others";
		try {
			let url = new URL(testConfig.fullpage, document.baseURI),
				search = url.searchParams;

			search.delete("hidepassed");
			if ( url.pathname.includes("/resources/sap/ui/test/starter/Test.qunit.html") && search.has("testsuite") && search.has("test") ) {
				url.pathname = search.get("testsuite") + "/" + search.get("test");
				search.delete("testsuite");
				search.delete("test");
			} else if ( search.has("test") ) {
				url.pathname = url.pathname + "/" + search.get("test");
				search.delete("test");
			}
			path = url.pathname + url.search;
			if ( path.startsWith("/") ) {
				path = path.slice(1);
			}
			if ( url.protocol === "about:" ) {
				path = url.protocol + path;
			}
		} catch (e) {
			path = testConfig.fullpage;
		}

		// cut of app name
		if ( !path.startsWith("resources/") && path.indexOf("/resources/") > 0
			 || !path.startsWith("test-resources/") && path.indexOf("/test-resources/") > 0) {
			path = path.slice(path.indexOf("/") + 1);
		}

		if ( path.startsWith("resources/") )  {
			kind = "resources";
			path = path.slice("resources/".length);
		} else if ( path.startsWith("test-resources/") ) {
			kind = "test-resources";
			path = path.slice("test-resources/".length);
		}

		let segments = path.split("/");
		for ( let i = 0; i < segments.length; ) {
			// remove trivial segments
			if ( segments[i] === "qunit" || segments[i] === "testsuite.qunit" ) {
				segments.splice(i, 1);
				continue;
			}
			// remove named testsuite segment if the name matrches the containing folder
			let m = /^testsuite\.([^.]+)\.qunit$/.exec(segments[i]);
			if ( m ) {
				if ( i > 0 && segments[i - 1] === m[1] ) {
					segments.splice(i, 1);
					continue;
				}
				// keep segment but with shorter name
				segments[i] = m[1];
				if ( i > 0 && segments[i - 1] === "testsuites" ) {
					segments.splice(i - 1, 1);
					i--;
				}
			}
			// else keep segment
			i++;
		}
		path = segments.join("/");

		/*
		for ( let j = 0; j < LIBS.length; j++) {
			let libPath = LIBS[j].replace(/\./g, "/");
			if (path.startsWith(libPath)) {
			  	path = path.replace(libPath, LIBS[j].replace(/\./, "/")); // intentionally only replace first . by /
				break;
			}
		}*/

		return { path, kind };
	}

	function createTestHierarchy(tests) {

		var data = {
			count: 0,
			name: '',
			children: []
		};

		function findByName(node, childName) {
			return node.children.find((child) => child.name === childName);
		}

		/*
		 * structures files according to their path name in a node hierarchy
		 * Each node has a name and a count of children, including itself.
		 * If a node has children (it is a folder), then it also has a children array.
		 */
		function addFile(path, kind, test) {
			var segments = path.split('/');
			var node = data;
			var child;
			for ( var i = 0; i < segments.length; i++) {
				node.count++;
				if ( !node.children ) {
					node.children = [];
					child = null;
				} else {
					child = findByName(node, segments[i]);
				}
				if ( !child ) {
					child = {
						count: 0,
						name: segments[i],
						href: test.fullpage
					};
					node.children.push(child);
				}
				node = child;
			}
			node.count++;
			node.kind = kind;
		}

		tests.forEach( (test) => {
			var {path, kind} = normalizeURL(test);
			addFile(path, kind, test);
		});

		/*
		function clean(node, parent) {
			let result = node.children && node.children.length > 0;
			if ( Array.isArray(node.children) ) {
				node.children = node.children.filter( (child) => clean(child, node));
				if ( node.children.length === 0 ) {
					delete node.children;
				}
			}
			return result;
		} */

		//clean(data);
		return data;
	}

	includeStylesheet(require.toUrl("./TreeMapChart.css"));

	var TreeMapChart = Control.extend("sap.ui.test.starter.find.TreeMapChart", {

		setData: function(aPaths) {
			this._oData = createTestHierarchy(aPaths);
		},

		renderer: function(oRM, oChart) {
			oRM.write("<div");
			oRM.writeControlData(oChart);
			oRM.addStyle("width", "100%");
			oRM.addStyle("height", "100%");
			oRM.writeClasses();
			oRM.writeStyles();
			oRM.write(">");
			oRM.write("</div>");
		},

		onAfterRendering: function() {
			renderTreeMap(this);
		},

		setVisible: function(v) {
			this.setProperty("visible", v);
			if ( !this.getVisible() ) {
				this.$().empty(); // remove SVG
			}
			return this;
		}
	});

	return TreeMapChart;

});
