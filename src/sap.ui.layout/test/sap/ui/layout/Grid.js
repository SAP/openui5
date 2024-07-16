sap.ui.define([
	"sap/m/Label",
	"sap/ui/core/HTML",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
], function(Label, HTML, Grid, GridData) {
	"use strict";

	var oGrid = new Grid({
		hSpacing: 1,	// in rem; default half of the value for gutter, adds to left and right, for corrections
		vSpacing: 1, 	// in rem; together with horizontalSpacing it generates the .gridSpacingNone, .gridSpacingHalfFull class
		defaultSpan: "L3 M6 S12",
		content: [
			// headings

			new HTML({
				content: '<b>Grid with 1rem horizontal and vertical spacing</b>',
				layoutData: new GridData({
					span: "L12 M12 S12"
				})
			}),
			new Label({
				text: 'Area spanning over the full width of the grid on all resolutions (L12 M12 S12)',
				width: "100%",
				layoutData: new GridData({
					span: "L12 M12 S12",
				})
			}),

			// small

			new HTML({
				content: '<p> (L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),

			// medium

			new HTML({
				content: '<p>L4 M6 S12</p>',
				layoutData: new GridData({
					span: "L4 M6 S12"
				})
			}),
			new HTML({
				content: '<p>L4 M6 S12</p>',
				layoutData: new GridData({
					span: "L4 M6 S12"
				})
			}),
			new HTML({
				content: '<p>L4 M6 S12</p>',
				layoutData: new GridData({
					span: "L4 M6 S12"
				})
			}),

			new HTML({
				content: '<p>L3 M12 S6</p>',
				layoutData: new GridData({
					span: "L3 M12 S6"
				})
			}),
			new HTML({
				content: '<p>L3 M12 S6</p>',
				layoutData: new GridData({
					span: "L3 M12 S6"
				})
			}),
			new HTML({
				content: '<p>L3 M12 S6</p>',
				layoutData: new GridData({
					span: "L3 M12 S6"
				})
			}),
			new HTML({
				content: '<p>L3 M12 S6</p>',
				layoutData: new GridData({
					span: "L3 M12 S6"
				})
			}),

			// indents

			new HTML({
				content: '<p>L1 M1<br>Indent L1 M1</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indentL: 1,
					indentM: 1,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L8 M8</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "M8",
					indentL: 8,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L2 M2</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "L2 M2",
					linebreakL: true,
					linebreakM: true,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L6 M6</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "L6 M6",
					visibleS: false

				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L3 M3</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "L3 M3",
					linebreakL: true,
					linebreakM: true,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L4 M4</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "L4 M4",
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L4 M4</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "L4 M4",
					linebreakL: true,
					linebreakM: true,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L1 M1<br>Indent L2 M2</p>',
				layoutData: new GridData({
					span: "L1 M1",
					indent: "L2 M2",
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L2 M2<br>Indent L5 M5</p>',
				layoutData: new GridData({
					span: "L2 M2",
					indent: "L5 M5",
					linebreakL: true,
					linebreakM: true,
					visibleS: false
				})
			}),

			new HTML({
				content: '<p>L6 M6 S6<br>Indent L3 M3 S3<br>linebreakL linebreakM linebreakS</p>',
				layoutData: new GridData({
					span: "L6 M6 S6",
					indent: "L3 M3 S3",
					linebreakL: true,
					linebreakM: true,
					linebreakS: true
				})
			}),

			// visisble

			new HTML({
				content: '<p>L12 M12 S12<br>visibleL visibleM visibleS</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: true,
					visibleM: true,
					visibleS: true
				})
			}),
			new HTML({
				content: '<p>L12 M12 S12<br>visibleL</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: true,
					visibleM: false,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L12 M12 S12<br>visibleM</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: false,
					visibleM: true,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L12 M12 S12<br>visibleS</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: false,
					visibleM: false,
					visibleS: true
				})
			}),

			// small

			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			}),
			new HTML({
				content: '<p>(L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "L1 M1 S1"
				})
			})
		]
	});

	oGrid.placeAt('content');
});