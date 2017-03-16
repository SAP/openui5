sinon.config.useFakeTimers = true;
QUnit.config.autostart = false;
sap.ui.test.qunit.delayTestStart();

QUnit.module("initial rendering", {
	beforeEach: function(assert) {

		// act
		this.oAlignedFlowLayout = new sap.ui.layout.AlignedFlowLayout();

		// arrange
		this.oAlignedFlowLayout.placeAt("content");
		sap.ui.getCore().applyChanges();
	},
	afterEach: function(assert) {

		// cleanup
		this.oAlignedFlowLayout.destroy();
		this.oAlignedFlowLayout = null;
	}
});

QUnit.test("it should render a flow layout container without items", function(assert) {

	// arrange
	var CSS_CLASS = this.oAlignedFlowLayout.getRenderer().CSS_CLASS,
		oDomRef = this.oAlignedFlowLayout.getDomRef(),
		oStyles = getComputedStyle(oDomRef);

	// assert
	assert.ok(oDomRef.classList.contains(CSS_CLASS));
	//assert.strictEqual(oStyles.position, "relative");
	//assert.strictEqual(oStyles.display, "flex");
	//assert.strictEqual(oStyles.flexWrap, "wrap");
	//assert.strictEqual(oStyles.listStyleType, "none");
	//assert.strictEqual(oStyles.margin, "0px");
	//assert.strictEqual(oStyles.padding, "0px");
	assert.strictEqual(oDomRef.childElementCount, 0);
});

QUnit.test("it should not throw an exception when the content is destroyed", function(assert) {

	// arrange
	this.oAlignedFlowLayout.addEndContent(new sap.m.Button());

	// act
	this.oAlignedFlowLayout.destroyContent();
	sap.ui.getCore().applyChanges();

	// assert
	assert.strictEqual(this.oAlignedFlowLayout.getContent().length, 0);
});

QUnit.test("the end item should not overflow its container", function(assert) {

	// arrange
	var oButton = new sap.m.Button();
	this.oAlignedFlowLayout.addEndContent(oButton);
	sap.ui.getCore().applyChanges();
	var oDomRef = this.oAlignedFlowLayout.getDomRef(),
		oItemDomRef = oButton.getDomRef().parentElement,
		oItemStyles = getComputedStyle(oItemDomRef);

	// assert
	assert.ok(oDomRef.offsetHeight > 0);
	assert.strictEqual(oItemStyles.position, "relative", 'it should set the "position" CSS property to "relative"');
	assert.strictEqual(oItemDomRef.style.width, "", "it should not set the width to prevent a collisions when the end item is the only child");

	if (!sap.ui.Device.browser.phantomJS) {
		assert.strictEqual(oItemStyles.flexBasis, "auto");
	}
});