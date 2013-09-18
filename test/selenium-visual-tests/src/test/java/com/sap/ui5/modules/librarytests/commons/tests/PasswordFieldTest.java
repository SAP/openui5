package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.PasswordFieldPO;
import com.sap.ui5.selenium.common.TestBase;

public class PasswordFieldTest extends TestBase {

	private PasswordFieldPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/PasswordField.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, PasswordFieldPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testEnterPasswordEvent() {
		List<WebElement> eList = page.passwordFields;

		for (WebElement element : eList) {
			String elementId = element.getAttribute("id");
			element.sendKeys("ThisIsMyPassword");
			userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
			userAction.pressOneKey(KeyEvent.VK_ENTER);

			verifyElementUI(elementId, "EnterPassword-" + elementId);
			verifyElementUI(page.outputEventId, "Event-EnterPassword-" + elementId);
		}
	}

}
