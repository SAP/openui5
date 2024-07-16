sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/table/library",
	"sap/ui/table/TreeTable",
	"sap/m/Text",
	"sap/m/Label"
], function(deepExtend, Button, Toolbar, JSONModel, Column, tableLibrary, TreeTable, Text, Label) {
	"use strict";

	const SelectionMode = tableLibrary.SelectionMode;

	// TABLE TEST DATA
	const oData = {
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
	};

	for (let i = 0; i < 20; i++) {
		oData["root"][3][i] = {
			name: "subitem3-" + i,
			description: "subitem3-" + i + " description",
			checked: false
		};
	}

	// create table with supported sap.m controls
	const oTable = new TreeTable({
		expandFirstLevel: true,
		columns: [
			new Column({label: new Label({text: "Alfa"}), template: new Text({text: "{name}", wrapping: false}), filterProperty: "name", sortProperty: "name"}),
			new Column({label: new Label({text: "Bravo"}), template: new Text({text: "{description}", wrapping: false}), sortProperty: "description"})
		]
	});

	oTable.setFooter("Sierra");
	oTable.setSelectionMode(SelectionMode.MultiToggle);

	oTable.addExtension(new Toolbar({content: [
		new Button({
			text: "November"
		}),
		new Button({
			text: "Oscar"
		})
	]}));

	// set Model and bind Table
	const oModel = new JSONModel();
	oModel.setData(oData);
	oTable.setModel(oModel);
	oTable.bindRows("/root");

	oTable.placeAt("content");

	const oButtonAfterTable = new Button({text: "Just a Button after the Table"});
	oButtonAfterTable.placeAt("content");
});