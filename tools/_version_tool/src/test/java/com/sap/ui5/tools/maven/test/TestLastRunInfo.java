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
    saveKey("update-core-only", "pom.xml", "2", "master");
    saveKey("default", "pom.xml", "2", "master");
  }

  private void saveKey(String profile, String key, String value, String branch) throws IOException {
    LastRunInfo infoCoreOnly = new LastRunInfo(new File("src/test/resources/"), profile, branch);
    infoCoreOnly.getDiffs().put(key, value);
    infoCoreOnly.save();
  }
  
  @Test
  public void testCreateAndSave() throws Exception {
    LastRunInfo infoCoreOnly = new LastRunInfo(new File("src/test/resources/"), "update-core-only", "master");
    assertEquals("2", infoCoreOnly.getDiffs().get("pom.xml"));
    infoCoreOnly.getDiffs().put("pom.xml", "3");
    infoCoreOnly.save();
    LastRunInfo info = new LastRunInfo(new File("src/test/resources/"), "master");
    assertEquals("2", info.getDiffs().get("pom.xml"));
  }
  
  @Test
  public void testLastCommitPerVersionCompatability() throws Exception {
    LastRunInfo lastRunInfo = new LastRunInfo(new File("src/test/resources/"), "master");
    assertEquals("d25b90d4432fd6765961bdd9620d65ea0ccca298", lastRunInfo.getLastCommitId());
  }
  
  @Test
  public void testLastCommitPerVersion() throws Exception {
    LastRunInfo lastRunInfo = new LastRunInfo(new File("src/test/resources/input"), "master");
    assertEquals("d25b90d4432fd6765961bdd9620d65ea0ccca299", lastRunInfo.getLastCommitId());
  }
}
