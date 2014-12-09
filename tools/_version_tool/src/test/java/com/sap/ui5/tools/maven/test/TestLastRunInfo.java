/*
 * Copyright 2014 by SAP AG, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP AG, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.tools.maven.test;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;

import org.junit.Before;
import org.junit.Test;

import com.sap.ui5.tools.maven.LastRunInfo;


public class TestLastRunInfo {
  
  @Before
  public void setup() throws Exception {
    saveKey("update-core-only", "pom.xml", "2");
    saveKey("default", "pom.xml", "2");
  }

  private void saveKey(String profile, String key, String value) throws IOException {
    LastRunInfo infoCoreOnly = new LastRunInfo(new File("src/test/resources/"), profile);
    infoCoreOnly.getDiffs().put(key, value);
    infoCoreOnly.save();
  }
  
  @Test
  public void testCreateAndSave() throws Exception {
    LastRunInfo infoCoreOnly = new LastRunInfo(new File("src/test/resources/"), "update-core-only");
    assertEquals("2", infoCoreOnly.getDiffs().get("pom.xml"));
    infoCoreOnly.getDiffs().put("pom.xml", "3");
    infoCoreOnly.save();
    LastRunInfo info = new LastRunInfo(new File("src/test/resources/"));
    assertEquals("2", info.getDiffs().get("pom.xml"));
  }
}
