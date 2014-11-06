package com.sap.ui5.tools.infra.git2p4;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.sap.ui5.tools.infra.git2p4.commands.relnotes.ReleaseNotes;
import com.sap.ui5.tools.maven.MyReleaseButton;

public class Git2P4Main {

  private static final String TOOLS_VERSION_HELPER_POM = "tools/_version_helper/pom";
  static final GitClient git = new GitClient();
  static final P4Client p4 = new P4Client();
  static final Git2P4 git2p4 = new Git2P4(git, p4);
  static String p4depotPath = null;
  static String p4change = null;
  static String resumeAfter = null;
  static boolean applyContributorsVersions = false; 
  static final SortedSet<GitClient.Commit> allCommits = new TreeSet<GitClient.Commit>(new Comparator<GitClient.Commit>() {
    @Override
    public int compare(GitClient.Commit a, GitClient.Commit b) {
      int r = a.getCommitDate().compareTo(b.getCommitDate());
      if ( r != 0 )
        return r;
      return a.getId().compareTo(b.getId());
    }
  });

  /**
   * This new context object is intended to contain all parameters in future
   * (or maybe Git2P4Main implements an interface with similar methods)
   * 
   * For now it only contains what is absolutely necessary for the ReleaseNotes command.
   */
  public static class Context {
    public final GitClient git = Git2P4Main.git;
    public final SortedSet<GitClient.Commit> allCommits = Git2P4Main.allCommits;
    public boolean fixOrFeatureOnly = false;
    public boolean includeCommitDetails = false;
    public boolean htmlOutput = false;
    public String range = null;
    public String branch = null;
    public boolean preview = false;
    public boolean noFetch = false;
    public String findVersion(String branch) throws IOException {
      return Git2P4Main.findVersion(branch);
    }
    public Set<String> getCommits(String...paths) throws IOException {
      Set<String> filter = new HashSet<String>();
      for(Mapping repo : mappings) {
        git.repository = repo.gitRepository;
        git.log(range, false, paths);
        filter.addAll(git.lastCommits.keySet());
      }
      return filter;
    }
  }
  
  static Context context = new Context();
  
  static void updateRepository(Mapping repo) throws IOException {
    git.repository = repo.gitRepository;
    if ( !git.repository.isDirectory() || !(new File(git.repository, ".git").isDirectory()) && repo.giturl != null ) {
      git.repository.mkdirs();
      git.clone(repo.giturl);
    }
    if ( !context.noFetch ) {
      git.fetch();
    }
  }

  static void collect(Mapping repo, String range) throws IOException {
    git.repository = repo.gitRepository;
    if ( !git.repository.isDirectory() || !(new File(git.repository, ".git").isDirectory()) && repo.giturl != null ) {
      git.repository.mkdirs();
      git.clone(repo.giturl);
    }
    if ( !context.noFetch ) {
      git.fetch();
    }
    git.log(range);
    List<GitClient.Commit> commits = new CommitHistoryOptimizer(git.lastCommits).run();
    for(GitClient.Commit commit : commits) {
      commit.data = repo;
    }
    allCommits.addAll(commits);
  }

  static final Pattern POM_VERSION = Pattern.compile("\\s*<version>([0-9]+(?:\\.[0-9]+(?:\\.[0-9]+)?)?(?:-SNAPSHOT)?)</version>\\s*");

  static String findVersion(String branch) throws IOException {

    String version = null;

    for(Mapping repo : mappings) {
      git.repository = repo.gitRepository;

      git.checkout("origin/" + branch);
      
      Map<String,String> info = repo.getRootPOMInfo();
      String v = info.get("version");
      if ( v != null ) {
        if ( version == null ) {
          version = v;
        } else if ( !version.equals(v) ){
          System.out.println("version mismatch between repositories: " + version + " vs. " + v);
          return null;
        }
      } else {
        System.out.println("no version found in " + repo.getRepositoryName());
        return null;
      }
    }
    return version;
  }

  static void modifyVersions(ReleaseOperation op, String branch, String fromVersion, String toVersion) throws IOException {

    boolean guess = false;
    
    // first ensure branch and op
    if ( branch != null && op == null ) {
      if ( fromVersion == null ) {
        fromVersion = findVersion(branch);
        guess = true;
      }
      Set<ReleaseOperation> ops = new Version(fromVersion).guessOperations("master".equals(branch));
      if ( ops.size() == 1 ) {
        op = ops.iterator().next();
        guess = true;
      } else {
        throw new IllegalArgumentException("can't guess operation, might be one of " + ops);
      }
    } else if ( branch == null && op != null ) {
      if ( op == ReleaseOperation.MajorRelease || op == ReleaseOperation.MinorRelease || op == ReleaseOperation.MilestoneRelease || op == ReleaseOperation.MilestoneDevelopment ) {
        branch = "master";
        guess = true;
      } else {
        throw new IllegalArgumentException("for patch operations, a branch must be specified");
      }
    } else if ( branch == null && op == null ) {
      throw new IllegalArgumentException("either branch or operation must be specified");
    }

    
    if ( fromVersion == null ) {
      fromVersion = findVersion(branch);
    }

    if ( toVersion == null && op != null ) {
      // Note: might throw an exception if the operation doesn't match the current (from) version 
      toVersion = new Version(fromVersion).nextVersion(op).toString();
    }
    
    if ( op == null || branch == null || fromVersion == null || toVersion == null ) {
      throw new IllegalArgumentException("incomplete information for version change");
    }

    if ( guess ) {
      Log.println("Automatically determined parameters:");
      Log.println("       branch: " + branch);
      Log.println("    operation: " + op);
      Log.println("  fromVersion: " + fromVersion);
      Log.println("    toVersion: " + toVersion);
    }
    
    if ( guess && git2p4.interactive ) {
      int c;
      System.out.println("Are the above parameters correct (y/n):");
      c = System.in.read();
      while ( System.in.available() > 0 ) {
        System.in.read();
      }
      if ( c != 'y' ) {
        throw new RuntimeException("operation aborted by user");
      }
    }
    
    Properties contributorsVersions = retrieveLatestVersions(fromVersion, op);
        
    Map<String,Map<String,String[]>> suspiciousRepositories = new LinkedHashMap<String,Map<String,String[]>>(); 
    
    for(Mapping repo : mappings) {
      git.repository = repo.gitRepository;

      git.checkout("origin/" + branch);

      Map<String,String[]> suspiciousChanges = new TreeMap<String,String[]>();
      int diffs = MyReleaseButton.updateVersion(repo.gitRepository, fromVersion, toVersion, contributorsVersions, suspiciousChanges);

      git.addAll();

      String label = "milestone development";
      if ( branch.equals("master") && !toVersion.endsWith("-SNAPSHOT") ) {
        label = "milestone";
      } else if ( !branch.equals("master") && toVersion.endsWith("-SNAPSHOT") ) {
        label = "patch development";
      } else if ( !branch.equals("master") && !toVersion.endsWith("-SNAPSHOT") && toVersion.endsWith(".0") ) {
        label = "release";
      } else if ( !branch.equals("master") && !toVersion.endsWith("-SNAPSHOT") && !toVersion.endsWith(".0") ) {
        label = "patch";
      }

      git.commit("VERSION CHANGE ONLY\n\nUpdate versions to next " + label + " version " + toVersion);

      git.log(1);

      if ( diffs != 0 ) {
        suspiciousRepositories.put(repo.gitRepository.getName(), suspiciousChanges);
      }
      
      if ( !context.preview ) {
        int c = 'y';
        if ( git2p4.interactive ) {
          System.out.println("Git commit prepared for version change (" + diffs + " diffs compared to last run). Push to gerrit? (y/n):");
          c = System.in.read();
          while ( System.in.available() > 0 ) {
            System.in.read();
          }
        }
        if ( c == 'y' ) {
          git.push(repo.giturl, "HEAD:refs/for/" + branch);
        }
      }
    }
    
    for(Map.Entry<String,Map<String,String[]>> repo : suspiciousRepositories.entrySet() ) {
      if ( repo.getValue().isEmpty() ) {
        System.out.println("**** warning: no previous version change summary found for repository " + repo.getKey());
      } else {
        System.out.println("**** warning: suspicious version changes in repository " + repo.getKey() + ":" );
        for(Map.Entry<String, String[]> change : repo.getValue().entrySet() ) {
          System.out.println("  " + change.getKey() + ": " + change.getValue()[0] + " (old) vs. " + change.getValue()[1] + " (new)");
        }
      }
    }

    exitcode = suspiciousRepositories.size();
  }


  private static Properties retrieveLatestVersions(String fromVersion, ReleaseOperation op) throws IOException, FileNotFoundException {
    //Filter operations to apply to
    if (!applyContributorsVersions) {
      return null;
    }
    //read latest versions for uilib-collections.pom
    Version fromV = new Version(fromVersion);
    String versionRange = "[" + new Version(fromV.major, fromV.minor, 0, "").toString() + "," + new Version(fromV.major, fromV.minor + 1, 0, "").toString() + ")";
    Log.println("Contributors version range: " + versionRange);
    MvnClient.execute(new File(".", TOOLS_VERSION_HELPER_POM).getAbsoluteFile(), "install", "-DversionOrRange=" + versionRange);
    File versionFile = new File(".", TOOLS_VERSION_HELPER_POM + "/target/LatestVersions.prop");
    Log.println("Version properties file: " + versionFile.getAbsolutePath());
    Properties contributorsVersions = new Properties();
    contributorsVersions.load(new FileInputStream(versionFile));
    Log.println("Versions loaded from file: " + contributorsVersions.toString());
    if (op.equals(ReleaseOperation.PatchDevelopment)){
      //get core version
      String coreVersion = contributorsVersions.get("com.sap.ui5:core").toString();
      //set all versions to version range
      Object devRange = "[" + new Version(fromV.major, fromV.minor, 0, "-SNAPSHOT").toString() + "," + new Version(fromV.major, fromV.minor + 1, 0, "-SNAPSHOT").toString() + ")";
      for (Object key : contributorsVersions.keySet()){
        contributorsVersions.put(key, devRange);
      }
      //set next snapshot core version 
      contributorsVersions.put("com.sap.ui5:core",  new Version(coreVersion).nextVersion(op).toString());
    }
    return contributorsVersions;
  }


  static void createVersionTags(String branch, String fromVersion) throws IOException {
    
    if ( branch == null ) {
      throw new IllegalArgumentException("for tag command, a branch must be specified");
    }
    if ( fromVersion == null ) {
      fromVersion = findVersion(branch);
    }
    Version v = new Version(fromVersion);
    if ( v.isSnapshot() || v.patch > 0 && "master".equals(branch) ) {
      throw new IllegalArgumentException("Tags can only be created for release versions and not in the master branch (except for patch level = 0)");
    }
    
    for(Mapping repo : mappings) {
      git.repository = repo.gitRepository;
      git.checkout("origin/" + branch);
      
      // retrieve GAV coordinates from root pom.xml
      Map<String,String> info = repo.getRootPOMInfo();
      
      // create tag message
      String NL = System.getProperty("line.separator");
      StringBuilder message = new StringBuilder(1024);
      message
        .append("GAV: ")
        .append(info.get("groupId")).append(':').append(info.get("artifactId")).append(':').append(fromVersion).append(NL);
      message
        .append("Release-Metadata: ")
        .append("http://nexus:8081/nexus/content/groups/build.milestones/")
        .append(info.get("groupId").replace('.', '/')).append('/')
        .append(info.get("artifactId")).append('/')
        .append(fromVersion).append('/')
        .append(info.get("artifactId")).append('-').append(fromVersion).append("-releaseMetadata.zip")
        .append(NL);
      
      // create tag
      if ( git.tag(fromVersion) ) {
        System.out.println("tag " + fromVersion + " exists already for " + repo.getRepositoryName() + " (skipped)");
      } else {
        
        git.tag(fromVersion, message);
        
        System.out.println("Git tag created locally with message '" + message + "'.");
        if ( !context.preview ) {
          int c = 'y';
          if ( git2p4.interactive ) {
            System.out.println("Push to gerrit? (y/n):");
            c = System.in.read();
            while ( System.in.available() > 0 ) {
              System.in.read();
            }
          }
          if ( c == 'y' ) {
            git.push(repo.giturl, "--tags");
          }
        }
      }
      
    }
    
  }

  static class Mapping {
    String giturl;
    File gitRepository;
    String p4path;
    String targetIncludes;
    String targetExcludes;
    
    Mapping(String giturl, File gitRepository, String p4path, String includes, String excludes) {
      this.giturl = giturl;
      this.gitRepository = gitRepository;
      this.p4path = p4path;
      this.targetIncludes = includes;
      this.targetExcludes = excludes;
    }
    
    public String getRepositoryName() {
      return gitRepository.getName();
    }
    
    public Map<String,String> getRootPOMInfo() {

      class POMAnalyzer {
        private Element docElement;
        private Element parentElement;
        Map<String,String> info = new HashMap<String,String>();
        
        POMAnalyzer() {
          File pom = new File(gitRepository, "pom.xml");
          Document pomDoc = XMLUtils.getDOM(pom);
          docElement = pomDoc.getDocumentElement();
          parentElement = XMLUtils.findChild(docElement, "parent");
          addGAVCoordinate("groupId");
          addGAVCoordinate("artifactId");
          addGAVCoordinate("version");
        }
        
        private void addGAVCoordinate(String name) {
          Element elem = XMLUtils.findChild(docElement, name);
          if ( elem == null && parentElement != null ) {
            elem = XMLUtils.findChild(parentElement, name);
          }
          if ( elem != null ) {
            info.put(name, elem.getTextContent());
          }
        }
      }
      
      return new POMAnalyzer().info;
    }
  }

  private static List<Mapping> mappings = new ArrayList<Mapping>();

  private static void createUI5Mappings(File repositoryRoot, String p4depotPrefix, String branch) {
    mappings.clear();
    mappings.add(new Mapping(
        "/sapui5/sapui5.runtime.git",
        new File(repositoryRoot, "sapui5.runtime"),
        p4depotPrefix,
        "pom.xml,src/,test/",
        "src/dist/_osgi/,src/dist/_osgi_tools/,src/dist/_osgi_gwt,src/platforms/,test/_selenium_tests_lsf/"
        ));
    mappings.add(new Mapping(
        "/sapui5/sapui5.platforms.gwt.git",
        new File(repositoryRoot, "sapui5.platforms.gwt"),
        p4depotPrefix + "/src/platforms/gwt",
        null,
        null
        ));
    /*
    mappings.add(new Mapping(
        new File(repositoryRoot, "sapui5.platforms.qtp-addin"),
        p4depotPrefix + "/src/platforms/qtp-addin",
        null,
        null
    ));
     */
    if ( "rel-1.10".equals(branch) ) {
      mappings.add(new Mapping(
          "/sapui5/sapui5.osgi.runtime.git",
          new File(repositoryRoot, "sapui5.osgi.runtime"),
          p4depotPrefix + "/src/dist/_osgi",
          null,
          null
          ));
      mappings.add(new Mapping(
          "/sapui5/sapui5.osgi.tools.git",
          new File(repositoryRoot, "sapui5.osgi.tools"),
          p4depotPrefix + "/src/dist/_osgi_tools",
          null,
          null
          ));
      mappings.add(new Mapping(
          "/sapui5/sapui5.osgi.runtime.gwt.git",
          new File(repositoryRoot, "sapui5.osgi.runtime.gwt"),
          p4depotPrefix + "/src/dist/_osgi_gwt",
          null,
          null
          ));
    }
  }
    
  private static void createUI5DistMappings(File repositoryRoot, String p4depotPrefix, String branch) {
    mappings.clear();
    mappings.add(new Mapping(
        "/sapui5/sapui5.dist.git",
        new File(repositoryRoot, "sapui5.dist"),
        p4depotPrefix,
        null,
        null
        ));
  }
    

  private static String getPerforceCodelineForBranch(String branch) {
    
    Matcher m = Pattern.compile("(?:rel-)?([0-9]+\\.[0-9]+)|master").matcher(branch);
    if ( m.matches() ) {
      return m.group(1) == null ? "dev" : (m.group(1) + "_COR");
    }
    throw new IllegalArgumentException("branch " + branch + " doesn't match a known pattern ('x.y' or 'rel-x.y')");
  }
  
  private static void usage(String errormsg) {
    if ( errormsg != null ) {
      System.out.println("**** error: " + errormsg);
      System.out.println();
    }
    System.out.println("Transports a range of commits from a set of Git repositories to a Perforce depot.");
    System.out.println();
    System.out.println("Usage: git2p4 <command> [<option> * ] [<commit-range>]");
    System.out.println();
    System.out.println("Commands:");
    System.out.println(" transfer [-b <branch>] [options] <range>   transfer commits from a set of Git repositories to Perforce");
    System.out.println(" version-change [-b <branch>]               update the version infos in branch <branch> from <from> to <to>");
    System.out.println(" milestone-release                          special 'version-change' cmd for a milestone release build in master");
    System.out.println(" minor-release                              special 'version-change' cmd for a minor release build in master");
    System.out.println(" major-release                              special 'version-change' cmd for a major release build in master");
    System.out.println(" patch-release -b <branch>                  special 'version-change' cmd for a patch release build");
    System.out.println(" tag [-b <branch>]                          creates tags for the current head revision in the given branch (tag name == root pom version)");
    System.out.println();
    System.out.println("Git/Mapping options:");
    System.out.println(" --git-ssh-user         User used for clone operations (always via SSH), defaults to ${user.name}||sapui5");
    System.out.println(" --git-use-https        true to use HTTPS for commit or push otherwise SSH is used, defaults to false");
    System.out.println(" --git-user             User used for commit or push operations, defaults to ${user.name}||sapui5");
    System.out.println(" --git-email            Email used for the commit message (if not present the local .gitconfig is used)");
    System.out.println(" --git-password         Password used for clone or push operations");
    System.out.println(" --git-no-fetch         suppress fetch operations (use local repository only)");
    System.out.println(" --git-dir              Git repository root");
    System.out.println(" --ui5-git-root         Git repository root for multiple (hardcoded) UI5 repositories, defaults to current directory");
    System.out.println(" --ui5-dist-git-root    Git repository root for multiple (hardcoded) UI5 repositories, defaults to current directory");
    System.out.println(" --includes             List of paths, relative to root, to be included from transport");
    System.out.println(" --excludes             List of paths, relative to root, to be excluded from transport");
    
    System.out.println(" -ra, --resume-after    Commit after which to resume the transport (must be a full SHA1)");
    System.out.println(" --no-auto-resume       Do NOT automatically resume after last commit");
    System.out.println(" -opt, --optimize-diffs Remove 'scatter' in diffs (e.g. whitespace changes or RCS keyword expansion)");
    System.out.println(" -i, --interactive      ask user after each change has been prepared, but before it is submitted");
    System.out.println(" -s, --submit           ask user after each change has been prepared, but before it is submitted");
    System.out.println(" -b, --branch           Git branch to operate on");
    System.out.println(" --fromVersion          source version whose occurrences should be modified");
    System.out.println(" --toVersion            target version that should replace the source version");
    System.out.println();
    System.out.println("Perforce options:");
    System.out.println(" -p, --p4-port          Perforce Host and Port, defaults to perforce3003.wdf.sap.corp:3003");
    System.out.println(" -u, --p4-user          Perforce User, defaults to ${user.name}|TBS");
    System.out.println(" -P, --p4-password      Perforce Password (e.g. *****)");
    System.out.println(" -C, --p4-client        Perforce Client Workspace (e.g. MYLAPTOP0815)");
    System.out.println(" -d, --p4-dest-path     target root path in Perforce depot (e.g. //depot/project/dev)");
    System.out.println(" -c, --p4-change        an existing (pending) Perforce change list to be used for the first transport");
    System.out.println();
    System.out.println("General options:");
    System.out.println(" -h, --help                 shows this help text");
    System.out.println(" -v, --verbose              be more verbose");
    System.out.println(" -l, --log-file             file path to write the log to");
    System.out.println(" -lt, --log-file-template   file name template, results in a separate log file per transferred commit ('#' will be replaced by commit id)");
    System.out.println(" --preview                  file name template, results in a separate log file per transferred commit ('#' will be replaced by commit id)");
    System.out.println();

    if ( errormsg != null ) {
      throw new RuntimeException(errormsg);
    }
  }

  public static void main0(String[] args) throws IOException {
    String template = null;
    String command = "transfer";
    boolean autoResume = true;
    String fromVersion = null;
    String toVersion = null;
    String branch = null;
    String mappingSet = "runtime";
    File gitDir = new File(".");
    String gitRepository = null;
    ReleaseOperation op = null;
    
    String[] argsForTrace = new String[args.length];
    System.arraycopy(args, 0, argsForTrace, 0, args.length);

    for(int i=0; i<args.length; i++) {
      if ( "-h".equals(args[i]) || "--help".equals(args[i]) ) {
        usage(null);
        return;
      } else if ( "-v".equals(args[i]) || "--verbose".equals(args[i]) ) {
        p4.verbose = true;
        git.verbose = true;
        MvnClient.verbose = true;
      } else if ( "-l".equals(args[i]) || "--log-file".equals(args[i]) ) {
        Log.setLogFile(new File(args[++i]), false);
      } else if ( "-lt".equals(args[i]) || "--log-file-template".equals(args[i]) ) {
        template = args[++i];
      } else if ( "-p".equals(args[i]) || "--p4-port".equals(args[i]) ) {
        p4.port = args[++i];
      } else if ( "-u".equals(args[i]) || "--p4-user".equals(args[i]) ) {
        p4.user = args[++i];
      } else if ( "-P".equals(args[i]) || "--p4-password".equals(args[i]) ) {
        p4.passwd = args[++i];
        argsForTrace[i] = "******";
      } else if ( "-C".equals(args[i]) || "--p4-client".equals(args[i]) ) {
        p4.client = args[++i];
      } else if ( "-c".equals(args[i]) || "--p4-change".equals(args[i]) ) {
        p4change = args[++i];
      } else if ( "-d".equals(args[i]) || "--p4-dest-path".equals(args[i])) {
        p4depotPath = args[++i];
      } else if ( "--git-ssh-user".equals(args[i]) ) {
        git.sshUser = args[++i];
      } else if ( "--git-use-https".equals(args[i]) ) {
        git.useHTTPS = true;
      } else if ( "--git-user".equals(args[i]) ) {
        git.user = args[++i];
      } else if ( "--git-email".equals(args[i]) ) {
        git.email = args[++i];
      } else if ( "--git-password".equals(args[i]) ) {
        git.password = args[++i];
      } else if ( "--git-no-fetch".equals(args[i]) ) {
        context.noFetch = true;
      } else if ( "--git-no-checkout".equals(args[i]) ) {
        git.noCheckout = true;
      } else if ( "--ui5-git-root".equals(args[i]) ) {
        gitDir = new File(args[++i]);
        mappingSet = "runtime";
      } else if ( "--repository-set".equals(args[i]) ) {
        mappingSet = args[++i];
      } else if ( "--git-dir".equals(args[i]) ) {
        gitDir = new File(args[++i]);
        if ( "runtime".equals(mappingSet) ) {
          mappingSet = null;
        }
      } else if ( "--git-repository".equals(args[i]) ) {
        gitRepository = args[++i];
      } else if ( "--includes".equals(args[i]) ) {
        if ( mappings.size() != 1 ) {
          throw new RuntimeException("includes can only be specified for an (already defined) single src root");
        }
        mappings.get(0).targetIncludes = args[++i];
      } else if ( "--excludes".equals(args[i]) ) {
        if ( mappings.size() != 1 ) {
          throw new RuntimeException("excludes can only be specified for an (already defined) single src root");
        }
        mappings.get(0).targetExcludes = args[++i];
      } else if ( "-ra".equals(args[i]) || "--resume-after".equals(args[i]) ) {
        resumeAfter = args[++i];
      } else if ( "-ra".equals(args[i]) || "--no-auto-resume".equals(args[i]) ) {
        autoResume = false;
      } else if ( "-opt".equals(args[i]) || "--optimize-diffs".equals(args[i]) ) {
        git2p4.opt = true;
      } else if ( "-i".equals(args[i]) || "--interactive".equals(args[i]) ) {
        git2p4.interactive = true;
      } else if ( "-s".equals(args[i]) || "--submit".equals(args[i]) ) {
        git2p4.preview = false;
        context.preview = false;
      } else if ( "--preview".equals(args[i]) ) {
        git2p4.preview = true;
        context.preview = true;
      } else if ( "--fix-or-feature-only".equals(args[i]) ) {
        context.fixOrFeatureOnly = true;
      } else if ( "--include-commit-details".equals(args[i]) ) {
        context.includeCommitDetails = true;
      } else if ( "--html-output".equals(args[i]) ) {
        context.htmlOutput = true;
      } else if ( "--split-logs".equals(args[i]) ) {
        command = "splitLogs";
      } else if ( "release-notes".equals(args[i]) ) {
        command = "release-notes";
        autoResume = false;
      } else if ( "list".equals(args[i]) || "--list".equals(args[i]) ) {
        command = "list";
      } else if ( "transfer".equals(args[i]) || "--transfer".equals(args[i]) ) {
        command = "transfer";
      } else if ( "version-change".equals(args[i]) || "--version".equals(args[i]) ) {
        op = null;
        command = "version-change";
      } else if ( "milestone-release".equals(args[i]) || "--milestone".equals(args[i]) ) {
        op = ReleaseOperation.MilestoneRelease;
        command = "version-change";
      } else if ( "patch-release".equals(args[i]) || "--patch".equals(args[i])) {
        op = ReleaseOperation.PatchRelease;
        command = "version-change";
      } else if ( "major-release".equals(args[i]) ) {
        op = ReleaseOperation.MajorRelease;
        command = "version-change";
      } else if ( "minor-release".equals(args[i]) || "--release".equals(args[i]) ) {
        op = ReleaseOperation.MinorRelease;
        command = "version-change";
      } else if ( "development".equals(args[i]) || "dev".equals(args[i]) ) {
        op = ReleaseOperation.MilestoneDevelopment;
        command = "version-change";
      } else if ( "patch-development".equals(args[i]) || "patch-dev".equals(args[i]) ) {
        op = ReleaseOperation.PatchDevelopment;
        command = "version-change";
      } else if ( "tag".equals(args[i]) ) {
        command = "tag";
      } else if ( "--fromVersion".equals(args[i]) ) {
        fromVersion = args[++i];
      } else if ( "--toVersion".equals(args[i]) ) {
        toVersion = args[++i];
      } else if ( "--branch".equals(args[i]) ) {
        branch = args[++i];
      } else if ( "--rebuild".equals(args[i]) ) {
        command = "noop";
      } else if ( args[i].startsWith("-") ) {
        throw new IllegalArgumentException("unsupported option " + args[i]);
      } else if ( command != null ) {
        context.range = args[i];
      } else {
        throw new IllegalArgumentException("unsupported command " + args[i]);
      }
    }

    Log.println("args = " + Arrays.toString(argsForTrace));
    Log.println("");
    Log.println("command: " + command);
    
    if ( "noop".equals(command) ) {
      return;
    }

    if ( "version-change".equals(command) && branch == null 
       && (op == ReleaseOperation.MajorRelease || op == ReleaseOperation.MinorRelease 
           || op == ReleaseOperation.MilestoneRelease || op == ReleaseOperation.MilestoneDevelopment) ) {
      branch = "master";
    }
    
    // automatically determine codeline from branch
    if ( p4depotPath == null && "transfer".equals(command) ) {
      throw new IllegalArgumentException("p4-dest-path path must be specifed before a UI5 repository root");
    }
    if ( p4depotPath.contains("#") ) {
      if ( branch == null ) {
        throw new IllegalArgumentException("branch must be specified when p4-dest-path contains a wildcard ('#')");
      }
      p4depotPath = p4depotPath.replace("#",  getPerforceCodelineForBranch(branch));
      Log.println("resolved depot path: " + p4depotPath);
    }

    if ( (mappingSet == null || "manual".equals(mappingSet)) && gitDir != null ) {
      mappings.clear();
      mappings.add(new Mapping(gitRepository, gitDir, p4depotPath, null, null));
    } else if ( "runtime".equals(mappingSet) ) {
      createUI5Mappings(gitDir, p4depotPath, branch);
    } else if ( "dist".equals(mappingSet) ) {
      createUI5DistMappings(gitDir, p4depotPath, branch);
      applyContributorsVersions = true;
    } else {
      throw new IllegalArgumentException("no repositories configured, either ui5 root dir or git root dir must be specified");
    }

    
    // clone & fetch repositories
    for(Mapping repoMapping : mappings) {
      updateRepository(repoMapping);
    }

    if ( "version-change".equals(command) ) {
      modifyVersions(op, branch, fromVersion, toVersion);
      return;
    }

    if ( "tag".equals(command) ) {
      createVersionTags(branch, fromVersion);
      return;
    }
    
    if ( "release-notes".equals(command) && context.range == null ) {
      Version current = new Version(findVersion(branch));
      context.range = "tags/" + current.major + "." + current.minor + "." + (current.patch <= 0 ? 0 : current.patch-1) + "..origin/" + branch;
    }
    
    if ( context.range == null || context.range.isEmpty() || !context.range.contains("..") ) {
      throw new IllegalArgumentException("A valid commit range must be provided, e.g. 1.4..origin/master");
    }

    // collect commits across repositories
    for(Mapping repoMapping : mappings) {
      collect(repoMapping, context.range);
    }
    int index=0;
    for(GitClient.Commit commit : allCommits) {
      Log.println((index++) + ": [" + commit.repository + "] " + commit.getId() + " " + commit.getCommitDate()+ " " + commit.getSummary());
    }

    if ( "transfer".equals(command) || (resumeAfter == null && autoResume) ) {
      p4.login();
    }

    // autoresume
    if ( resumeAfter == null && autoResume ) {
      // analyze the submitted changelists in perforce to find the last commitID
      String lastCommit = git2p4.findLastCommit(p4depotPath);
      // if one is found check whether it exists in the current commits
      if ( lastCommit != null ) {
        for(GitClient.Commit commit : allCommits) {
          if ( lastCommit.equals(commit.getId()) ) {
            // use only existing ids as resumeID (otherwise nothing would be transferred)
            resumeAfter = lastCommit;
            Log.println("resume after " + resumeAfter);
            break;
          }
        }
        if ( resumeAfter == null ) {
          throw new IllegalStateException("could not find last perforce commit in list of git changes: " + lastCommit);
        }
      }
    }

    if ( "list".equals(command) ) {
      return;
    }

    if ( "release-notes".equals(command) ) {
      context.branch = branch;
      new ReleaseNotes().execute(context);
      return;
    }
    
    if ( "splitLogs".equals(command) ) {
      SplitLogs.run(template, allCommits);
      return;
    }

    for(GitClient.Commit commit : allCommits) {

      if ( resumeAfter != null ) {
        if ( resumeAfter.equals(commit.getId()) ) {
          resumeAfter = null;
        }
        Log.println("[" + commit.repository + "] " + commit.getId() + " " + commit.getCommitDate() + " ... skip");
        continue;
      }
      Log.println("[" + commit.repository + "] " + commit.getId() + " " + commit.getCommitDate() + " " + commit.getSummary());

      if ( template != null ) {
        String filename = template.replace("#", commit.getId());
        Log.setLogFile(new File(filename), true);
      }
      p4change = git2p4.run(commit, p4change);
      if ( template != null ) {
        Log.restorePrevious();
      }
    }

  }
  
  private static int exitcode = 0;
  public static void main(String[] args) throws IOException {
    main0(args);
    System.exit(exitcode);
  }

}
