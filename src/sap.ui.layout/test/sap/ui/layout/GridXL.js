sap.ui.define([
	"sap/m/Label",
	"sap/ui/core/HTML",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData"
], function(Label, HTML, Grid, GridData) {
	"use strict";

	new Grid({
		hSpacing: 1,	// in rem; default half of the value for gutter, adds to left and right, for corrections
		vSpacing: 1, 	// in rem; together with horizontalSpacing it generates the .gridSpacingNone, .gridSpacingHalfFull class
		defaultSpan: "XL4 L3 M6 S12",
		defaultIndent:"XL4",
		content: [

			// headings

			new HTML({
				content: '<b>Grid with 1rem horizontal and vertical spacing</b>'
			}),
			new Label({
				text: 'Area spanning over the full width of the grid on all resolutions (XL8 L12 M12 S12)',
				width: "100%",
				layoutData: new GridData({
					span: "XL6 L12 M12 S12",
					spanXL: 8,
					indent: "XL6",
					indentXL: 2
				})
			}),
			new HTML({
				content: '<p>(XL4 L1 M1 S1)</p>',
				layoutData: new GridData({
					span: "XL4 L1 M1 S1",
					indentXL: 2
				})
			}),
			new HTML({
				content: '<p>XL2 L2 M2<br />Indent XL2 L5 M5 and linebreakXL true, L false</p>',
				layoutData: new GridData({
					span: "XL2 L2 M2",
					indent: "XL2 L5 M5",
					linebreakL: false,
					linebreakXL: true,
					linebreakM: true,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>XL2 L6 M6 S6<br />Indent XL6 L3 M3 S3<br />linebreakL linebreakM linebreakS = true and linebreakXL = false</p>',
				layoutData: new GridData({
					span: "XL2 L6 M6 S6",
					indent: "XL6 L3 M3 S3",
					linebreakL: true,
					linebreakM: true,
					linebreakS: true,
					linebreakXL: false
				})
			}),

			// visisble

			new HTML({
				content: '<p>L12 M12 S12<br />visibleL visibleM visibleS and linebreak for XL same as L  ( L = true)</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: true,
					visibleM: true,
					visibleS: true,
					linebreakL: true,
					linebreakM: true,
					linebreakS: true
				})
			}),
			new HTML({
				content: '<p>L12 M12 S12<br />visibleL</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: true,
					visibleM: false,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L12 M12 S12<br />visibleM</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: false, // test deprecated properties
					visibleM: true,
					visibleS: false
				})
			}),
			new HTML({
				content: '<p>L12 M12 S12<br />visibleS</p>',
				layoutData: new GridData({
					span: "L12 M12 S12",
					visibleL: false,
					visibleM: true,
					visibleS: true
				})
			}),
			new HTML({
				content: '<p>No layout Data - all defaults</p>'
			}),
			new HTML({
				content: '<b>NO layout Data - Default is L5 M6, Indent L3</b>'
			}),
			new Label({
				text: 'NO layout Data - Default is L5 M6, Indent L3',
				width: "100%"
			}),
			new HTML({
				content: '<p>Span L5, Indent L8</p>'
			})
		]
	}).placeAt('content1');

	new Grid({
		hSpacing: 0.5,	// in rem; default half of the value for gutter, adds to left and right, for corrections
		vSpacing: 2, 	// in rem; together with horizontalSpacing it generates the .gridSpacingNone, .gridSpacingHalfFull class
		defaultSpan: "L4 M6",
		defaultIndent:"L4",
		content: [
			new HTML({
				content: '<b>Grid with 2rem horizontal and vertical spacing</b>'
			}),
			new Label({
				text: 'Area spanning over the full width of the grid on all resolutions (XL8 L12 M12 S12)',
				layoutData: new GridData({
					span: "XL6 L12 M12 S12",
					spanXL: 8,
					indent: "XL6",
					indentXL: 2
				})
			}),
			new HTML({
				content: '<p>No layout Data - all defaults</p>'
			}),
			new HTML({
				content: '<b>NO layout Data</b>'
			}),
			new Label({
				text: 'NO layout Data',
				width: "100%"
			})
		]
	}).placeAt('content2');
});