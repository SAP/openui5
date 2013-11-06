package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ImagePO;
import com.sap.ui5.selenium.common.TestBase;

public class ImageTest extends TestBase {

	private ImagePO page;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Image.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ImagePO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testClickAction() {
		// Avoid generating no dashed on FIREFOX
		new Actions(driver).sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();

		page.image8.click();
		verifyElement(page.target8AreaId, page.image8.getAttribute("id") + "-clicked");
		verifyElement(page.outputTargetId, "checkPressEventHandler");
	}

	@Test
	public void testTooptip() {
		showToolTip(page.imageI2Id, 1500);
		verifyBrowserViewBox(page.imageI2Id + "-toolTip");
	}

}
