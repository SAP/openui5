package com.sap.ui5.tools.maven.test;
import org.junit.Assert;
import org.junit.Test;

import com.sap.ui5.tools.maven.Version;


/**
 * @author Frank Weigel
 */
public class TestVersion {

  private Version testVersion(String versionStr, int major, int minor, int patch, String suffix, boolean isSnapshot) {
    return testVersion(versionStr, major, minor, patch, suffix, isSnapshot, versionStr);
  }

  private Version testVersion(String versionStr, int major, int minor, int patch, String suffix, boolean isSnapshot, String toString) {
    Version version = new Version(versionStr);
    Assert.assertEquals("major should match", major, version.major);
    Assert.assertEquals("minor should match", minor, version.minor);
    Assert.assertEquals("patch should match", patch, version.patch);
    Assert.assertEquals("suffix should match", suffix, version.suffix);
    Assert.assertEquals("isSnapshot should match", isSnapshot, version.isSnapshot());
    Assert.assertEquals("toString should match", toString, version.toString());
    return version;
  }

  @Test
  public void testFullVersions() throws Exception {
    testVersion("1.8.6", 1, 8, 6, null, false);
    testVersion("1.8.6-SNAPSHOT", 1, 8, 6, "-SNAPSHOT", true);
  }
  
  @Test
  public void testMajorMinorVersions() {
    testVersion("1.8", 1, 8, 0, null, false);
    testVersion("1.8-SNAPSHOT", 1, 8, 0, "-SNAPSHOT", true);
    testVersion("1", 1, 0, 0, null, false);
    testVersion("1-SNAPSHOT", 1, 0, 0, "-SNAPSHOT", true);
  }
  
  @Test
  public void testMajorVersions() {
    testVersion("1", 1, 0, 0, null, false);
    testVersion("1-SNAPSHOT", 1, 0, 0, "-SNAPSHOT", true);
  }
  
  @Test
  public void testMilestones() {
    Assert.assertEquals("should be a release", false, new Version("1.8.6").isMilestone());
    Assert.assertEquals("should be a release", false, new Version("1.8.7").isMilestone());
    Assert.assertEquals("should be a release", false, new Version("1.8").isMilestone());
    Assert.assertEquals("should be a release", false, new Version("1").isMilestone());
    Assert.assertEquals("should be a milestone", true, new Version("1.9.1").isMilestone());
    Assert.assertEquals("should be a milestone", true, new Version("1.9.2").isMilestone());
    Assert.assertEquals("should be a milestone", true, new Version("1.9").isMilestone());
  }
  
  @Test(expected=IllegalArgumentException.class)
  public void testBrokenVersion1() {
    new Version("x");
  }

}
 