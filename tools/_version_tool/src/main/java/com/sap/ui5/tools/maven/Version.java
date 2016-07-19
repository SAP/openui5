package com.sap.ui5.tools.maven;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.sap.ui5.tools.maven.MyReleaseButton.ReleaseOperation;

public class Version {

  public final String str;
  public final int major;
  public final int minor;
  public final int patch;
  public final String suffix;
  
  private static final Pattern REGEX = Pattern.compile("([0-9]+)(?:\\.([0-9]+)(?:\\.([0-9]+))?)?(.+)?"); 
  private static final String SNAPSHOT_SUFFIX = "-SNAPSHOT";
  
  public Version(String str) {
    this.str = str;
    Matcher m = REGEX.matcher(str);
    if ( m.matches() ) {
      major = Integer.valueOf(m.group(1));
      minor = m.group(2) == null ? 0 : Integer.valueOf(m.group(2)); 
      patch = m.group(3) == null ? 0 : Integer.valueOf(m.group(3)); 
      suffix = m.group(4); 
    } else {
      throw new IllegalArgumentException("Version '" + str + "' doesn't conform to expected syntax");
    }
  }

  public Version(int major, int minor, int patch, String suffix) {
    if ( (major < 0 && (minor > 0 || patch > 0)) 
         || (minor < 0 && patch > 0) 
         || (suffix != null && suffix.matches("^[0-9]")) ) {
      throw new IllegalArgumentException("parameters don't match the constraints for versions");
    }
      
    this.major = major < 0 ? 0 : major;
    this.minor = minor < 0 ? 0 : minor;
    this.patch = patch < 0 ? 0 : patch;
    this.suffix = suffix;
    StringBuilder str = new StringBuilder(32);
    str.append(major);
    if ( minor >= 0 ) {
      str.append('.').append(minor);
      if ( patch >= 0 ) {
        str.append('.').append(patch);
      }
    }
    if ( suffix != null ) {
      str.append(suffix);
    }
    this.str = str.toString();
  }

  public boolean isMilestone() {
    return (minor % 2) == 1;
  }
  
  public boolean isSnapshot() {
    return suffix != null && suffix.endsWith(SNAPSHOT_SUFFIX);
  }
  
  public String toString() {
    return str;
  }

  public Set<ReleaseOperation> guessOperations(boolean isMaster) {
    Set<ReleaseOperation> ops = new HashSet<ReleaseOperation>();
    if ( isSnapshot() ) {
      if ( !isMilestone() ) {
        ops.add(ReleaseOperation.PatchRelease);
      } else {
        ops.add(ReleaseOperation.MajorRelease);
        ops.add(ReleaseOperation.MinorRelease);
        ops.add(ReleaseOperation.MilestoneRelease);
      }
    } else {
      if ( isMaster ) {
        ops.add(ReleaseOperation.MilestoneDevelopment);
      } else {
        ops.add(ReleaseOperation.PatchDevelopment);
      }
    }
    return ops;
  }
  
  public Version nextVersion(ReleaseOperation op) {

    int newMajor = major;
    int newMinor = minor;
    int newPatch = patch;
    String newSuffix = suffix;
    
    switch (op ) {
    case MajorRelease:
      if ( !isMilestone() || !isSnapshot() ) {
        throw new IllegalArgumentException("can only release when current version is milestone and -SNAPSHOT, but is " + this);
      }
      newMajor++;
      newMinor = newPatch = 0;
      newSuffix = null;
      break;
    case MinorRelease:
      if ( !isMilestone() || !isSnapshot() ) {
        throw new IllegalArgumentException("can only release when current version is milestone and -SNAPSHOT, but is " + this);
      }
      newMinor++;
      newPatch = 0;
      newSuffix = null;
      break;
    case MilestoneRelease:
      if ( !isMilestone() || !isSnapshot() ) {
        throw new IllegalArgumentException("can only milestone when current version is milestone and -SNAPSHOT, but is " + this);
      }
      newSuffix = null;
      break;
    case PatchRelease:
      if ( isMilestone() || !isSnapshot() ) {
        throw new IllegalArgumentException("can only patch when current version is a release and a -SNAPSHOT, but is " + this);
      }
      newSuffix = null;
      break;
    case MilestoneDevelopment:
      if ( (!isMilestone() && patch != 0) ) {
        throw new IllegalArgumentException("can only switch to milestone development from initial release or milestone, but is " + this);
      }
      // TODO: adopt this code here to make it more clear!
      if ( !isMilestone() || isSnapshot() ) {
        newMinor += 1;
        newPatch = 0;
      } else {
        newPatch++;
      }
      newSuffix = SNAPSHOT_SUFFIX;
      break;
    case PatchDevelopment:
      if ( isMilestone() || isSnapshot() ) {
        throw new IllegalArgumentException("can only switch to patch development from release or patch, but is " + this);
      }
      newPatch++;
      newSuffix = SNAPSHOT_SUFFIX;
      break;
    }
    
   return new Version(newMajor, newMinor, newPatch, newSuffix);
  }
}