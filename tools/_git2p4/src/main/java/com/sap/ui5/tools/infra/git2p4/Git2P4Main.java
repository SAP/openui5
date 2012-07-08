package com.sap.ui5.tools.infra.git2p4;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.regex.Pattern;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.sap.ui5.tools.maven.MyReleaseButton;

public class Git2P4Main {

  static GitClient git = new GitClient();
  static P4Client p4 = new P4Client();
  static Git2P4 git2p4 = new Git2P4(git, p4);
  static String p4depotPath = null;
  static String p4change = null;
  static String range = null;
  static String resumeAfter = null;
  static boolean noFetch = false;

  static SortedSet<GitClient.Commit> allCommits = new TreeSet<GitClient.Commit>(new Comparator<GitClient.Commit>() {
    @Override
    public int compare(GitClient.Commit a, GitClient.Commit b) {
      int r = a.getCommitDate().compareTo(b.getCommitDate());
      if ( r != 0 )
        return r;
      return a.getId().compareTo(b.getId());
    }
  });

  static void updateRepository(Mapping repo) throws IOException {
    git.repository = repo.gitRepository;
    if ( !git.repository.isDirectory() || !(new File(git.repository, ".git").isDirectory()) && repo.giturl != null ) {
      git.repository.mkdirs();
      git.clone(repo.giturl);
    }
    if ( !noFetch ) {
      git.fetch();
    }
  }

  static void collect(Mapping repo, String range) throws IOException {
    git.repository = repo.gitRepository;
    if ( !git.repository.isDirectory() || !(new File(git.repository, ".git").isDirectory()) && repo.giturl != null ) {
      git.repository.mkdirs();
      git.clone(repo.giturl);
    }
    if ( !noFetch ) {
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

      File pom = new File(repo.gitRepository, "pom.xml");
      Document pomDoc = XMLUtils.getDOM(pom);
      Element versionEl = XMLUtils.findChild(pomDoc.getDocumentElement(), "version");
      if ( versionEl == null ) {
        versionEl = XMLUtils.findChild(pomDoc.getDocumentElement(), "parent");
        if ( versionEl != null ) {
          versionEl = XMLUtils.findChild(versionEl,  "version");
        }
      }
      if ( versionEl != null ) {
        System.out.println("found " + versionEl.getTextContent() + ", so far " + version);
        if ( version == null ) {
          version = versionEl.getTextContent();
        } else if ( !version.equals(versionEl.getTextContent()) ){
          System.out.println("version mismatch: " + version + " vs. " + versionEl.getTextContent());
          return null;
        }
      } else {
        System.out.println("no version found in " + pom);
        return null;
      }
    }
    return version;
  }

  static void milestone(String fromVersion, String toVersion, String branch) throws IOException {
    boolean guess = false;

    if ( branch == null ) {
      branch = "master";
      guess = true;
    }
    if ( fromVersion == null && toVersion == null ) {
      fromVersion = findVersion(branch);
      if ( fromVersion != null && fromVersion.endsWith("-SNAPSHOT") ) {
        toVersion = fromVersion.substring(0, fromVersion.length() - "-SNAPSHOT".length());
      }
      guess = true;
    }
    if ( fromVersion == null || toVersion == null ) {
      throw new RuntimeException("could not determine version info");
    }
    if ( guess ) {
      Log.println("Please confirm the automatically determined parameters:");
      Log.println("       branch: " + branch);
      Log.println("  fromVersion: " + fromVersion);
      Log.println("    toVersion: " + toVersion);
      int c;
      System.out.println("Parameters correct (y/n):");
      c = System.in.read();
      while ( System.in.available() > 0 ) {
        System.in.read();
      }
      if ( c != 'y' ) {
        throw new RuntimeException("operation aborted by user");
      }
    }
    increaseVersions(fromVersion, toVersion, branch);
  }

  static void increaseVersions(String fromVersion, String toVersion, String branch) throws IOException {
    for(Mapping repo : mappings) {
      git.repository = repo.gitRepository;

      git.checkout("origin/" + branch);

      MyReleaseButton.main(new String[] { repo.gitRepository.getPath(), fromVersion, toVersion});

      git.addAll();

      String label = "development";
      if ( branch.equals("master") && !toVersion.endsWith("-SNAPSHOT") ) {
        label = "milestone";
      } else if ( !branch.equals("master") && toVersion.endsWith("-SNAPSHOT") ) {
        label = "patch development";
      } else if ( !branch.equals("master") && !toVersion.endsWith("-SNAPSHOT") && toVersion.endsWith(".0") ) {
        label = "release";
      } else if ( !branch.equals("master") && !toVersion.endsWith("-SNAPSHOT") && !toVersion.endsWith(".0") ) {
        label = "patch";
      }

      git.commit("Release: update to next " + label + " version " + toVersion);

      git.log(1);

      int c = 'y';
      if ( git2p4.interactive ) {
        System.out.println("Git commit prepared for version change. Push to gerrit? (y/n):");
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
  }

  private static List<Mapping> mappings = new ArrayList<Mapping>();

  private static void createUI5Mappings(File repositoryRoot, String p4depotPrefix) {
    mappings.clear();
    mappings.add(new Mapping(
        "git.wdf.sap.corp:29418/sapui5/sapui5.runtime.git",
        new File(repositoryRoot, "sapui5.runtime"),
        p4depotPrefix,
        "pom.xml,src/,test/",
        "src/dist/_osgi/,src/dist/_osgi_tools/,src/platforms/,test/_selenium_tests_lsf/"
        ));
    mappings.add(new Mapping(
        "git.wdf.sap.corp:29418/sapui5/sapui5.platforms.gwt.git",
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
    mappings.add(new Mapping(
        "git.wdf.sap.corp:29418/sapui5/sapui5.osgi.runtime.git",
        new File(repositoryRoot, "sapui5.osgi.runtime"),
        p4depotPrefix + "/src/dist/_osgi",
        null,
        null
        ));
    mappings.add(new Mapping(
        "git.wdf.sap.corp:29418/sapui5/sapui5.osgi.tools.git",
        new File(repositoryRoot, "sapui5.osgi.tools"),
        p4depotPrefix + "/src/dist/_osgi_tools",
        null,
        null
        ));
  }

  private static void usage(String errormsg) {
    if ( errormsg != null ) {
      System.out.println("**** error: " + errormsg);
      System.out.println();
    }
    System.out.println("Transports a range of commits from a set of Git repositories to a Perforce depot.");
    System.out.println();
    System.out.println("Usage: Git2P4main cmd [options | -template <file> ] <commit-range>");
    System.out.println();
    System.out.println("Commands:");
    System.out.println(" --transfer             transfer commits from git to Perforce");
    System.out.println(" --list                 list commits to be transferred to Perforce");
    System.out.println(" --version <from> <to> <branch> update the version infos in branch <branch> from <from> to <to>");
    System.out.println();
    System.out.println("Perforce options:");
    System.out.println(" -p, --p4-port          Perforce Host and Port (e.g. perforce1666:1666)");
    System.out.println(" -u, --p4-user          Perforce User (e.g. claus)");
    System.out.println(" -P, --p4-password      Perforce Password (e.g. *****)");
    System.out.println(" -C, --p4-client        Perforce Client Workspace (e.g. MYLAPTOP0815)");
    System.out.println(" -d, --p4-dest-path     root path in Perforce depot (e.g. //depot/project/dev)");
    System.out.println(" -c, --p4-change        an existing (pending) Perforce change list to be used for the first transport");
    System.out.println();
    System.out.println("Git/Mapping options:");
    System.out.println(" --git-user             SSH id used for clone operations");
    System.out.println(" --git-no-fetch         suppress fetch operations (use local repository only)");
    System.out.println(" --git-dir              Git repository root");
    System.out.println(" --ui5-git-root         Git repository root for multiple (hardcoded) UI5 repositories");
    System.out.println(" --includes             List of paths, relative to root, to be included from transport");
    System.out.println(" --excludes             List of paths, relative to root, to be excluded from transport");
    System.out.println(" -ra, --resume-after    Commit after which to resume the transport (must be a full SHA1)");
    System.out.println(" --no-auto-resume       Do NOT automatically resume after last commit");
    System.out.println(" -opt, --optimize-diffs Remove 'scatter' in diffs (e.g. whitespace changes or RCS keyword expansion)");
    System.out.println(" -i, --interactive      ask user after each change has been prepared, but before it is submitted");
    System.out.println(" -s, --submit           ask user after each change has been prepared, but before it is submitted");
    System.out.println();
    System.out.println("General options:");
    System.out.println(" -h, --help             shows this help text");
    System.out.println(" -v, --verbose          be more verbose");
    System.out.println(" -l, --log-file         file path to write the log to");
    System.out.println();

    if ( errormsg != null ) {
      throw new RuntimeException(errormsg);
    }
  }
  public static void main(String[] args) throws IOException {
    String template = null;
    String mode = "transfer";
    boolean autoResume = true;
    String fromVersion = null;
    String toVersion = null;
    String branch = null;

    for(int i=0; i<args.length; i++) {
      if ( "-h".equals(args[i]) || "--help".equals(args[i]) ) {
        usage(null);
        return;
      } else if ( "-v".equals(args[i]) || "--verbose".equals(args[i]) ) {
        p4.verbose = true;
        git.verbose = true;
      } else if ( "-l".equals(args[i]) || "--log-file".equals(args[i]) ) {
        Log.setLogFile(new File(args[++i]), false);
      } else if ( "-lt".equals(args[i]) || "--log-file-template".equals(args[i]) ) {
        template = args[++i];
      } else if ( "-p".equals(args[i]) || "--p4-port".equals(args[i]) ) {
        p4.port = args[++i];
      } else if ( "-u".equals(args[i]) || "--p4-user".equals(args[i]) ) {
        p4.user = args[++i];
      } else if ( "-P".equals(args[i]) || "--p4-password".equals(args[i]) ) {
        p4.passwd = args[i];
      } else if ( "-C".equals(args[i]) || "--p4-client".equals(args[i]) ) {
        p4.client = args[++i];
      } else if ( "-c".equals(args[i]) || "--p4-change".equals(args[i]) ) {
        p4change = args[++i];
      } else if ( "-d".equals(args[i]) || "--p4-dest-path".equals(args[i])) {
        p4depotPath = args[++i];
      } else if ( "--git-user".equals(args[i]) ) {
        git.sshuser = args[++i];
      } else if ( "--git-no-fetch".equals(args[i]) ) {
        noFetch = true;
      } else if ( "--ui5-git-root".equals(args[i]) ) {
        if ( p4depotPath == null ) {
          throw new RuntimeException("p4depot path must be specifed before a UI5 repository root");
        }
        createUI5Mappings(new File(args[++i]), p4depotPath);
      } else if ( "--git-dir".equals(args[i]) ) {
        if ( p4depotPath == null ) {
          throw new RuntimeException("p4depot path must be specifed before a git repository root");
        }
        mappings.clear();
        mappings.add(new Mapping(null, new File(args[++i]), p4depotPath, null, null));
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
        git2p4.submit = true;
      } else if ( "--split-logs".equals(args[i]) ) {
        mode = "splitLogs";
      } else if ( "--list".equals(args[i]) ) {
        mode = "list";
      } else if ( "--transfer".equals(args[i]) ) {
        mode = "transfer";
      } else if ( "--version".equals(args[i]) ) {
        mode = "version";
      } else if ( "--milestone".equals(args[i]) ) {
        mode = "milestone";
      } else if ( "--fromVersion".equals(args[i]) ) {
        fromVersion = args[++i];
      } else if ( "--toVersion".equals(args[i]) ) {
        toVersion = args[++i];
      } else if ( "--branch".equals(args[i]) ) {
        branch = args[++i];
      } else if ( args[i].startsWith("-") ) {
        throw new RuntimeException("unsupported option " + args[i]);
      } else {
        range = args[i];
      }
    }

    Log.println("args = " + Arrays.toString(args));
    Log.println("");

    // clone & fetch repos
    for(Mapping repoMapping : mappings) {
      updateRepository(repoMapping);
    }

    if ( "version".equals(mode) ) {
      if ( branch == null || branch.isEmpty() || branch.contains("..") || branch.contains("/") ) {
        throw new RuntimeException("for --version, a branch must be specified(e.g. master or 1.4)");
      }
      boolean guess=true;
      if ( fromVersion == null ) {
        fromVersion = findVersion(branch);
        guess = true;
      }
      if ( guess ) {
        Log.println("Please confirm the automatically determined parameters:");
        Log.println("       branch: " + branch);
        Log.println("  fromVersion: " + fromVersion);
        Log.println("    toVersion: " + toVersion);
        int c;
        System.out.println("Parameters correct (y/n):");
        c = System.in.read();
        while ( System.in.available() > 0 ) {
          System.in.read();
        }
        if ( c != 'y' ) {
          throw new RuntimeException("operation aborted by user");
        }
      }
      increaseVersions(fromVersion, toVersion, branch);
      return;
    }

    if ( "milestone".equals(mode) ) {
      milestone(fromVersion, toVersion, branch);
      return;
    }

    if ( range == null || range.isEmpty() || !range.contains("..") ) {
      throw new RuntimeException("A valid commit range must be provided, e.g. 1.4..origin/master");
    }

    // collect commits across repositories
    for(Mapping repoMapping : mappings) {
      collect(repoMapping, range);
    }
    int index=0;
    for(GitClient.Commit commit : allCommits) {
      Log.println((index++) + ": [" + commit.repository + "] " + commit.getId() + " " + commit.getCommitDate()+ " " + commit.getSummary());
    }

    // autoresume
    if ( resumeAfter == null && autoResume ) {
      // analyze the submitted changelists to find the last commitID
      String lastCommit = git2p4.findLastCommit(p4depotPath);
      // if one is fonud check whether it exists in the current commits
      if ( lastCommit != null ) {
        for(GitClient.Commit commit : allCommits) {
          if ( lastCommit.equals(commit.getId()) ) {
            // use only existing ids as resumeID (otherwise nothing would be transferred)
            resumeAfter = lastCommit;
            Log.println("resume after " + resumeAfter);
            break;
          }
        }
      }
    }

    if ( "list".equals(mode) ) {
      return;
    }
    if ( "splitLogs".equals(mode) ) {
      SplitLogs.run(template, allCommits);
      return;
    }

    for(GitClient.Commit commit : allCommits) {
      Log.println(commit.repository + " " + commit.getId() + " " + commit.getCommitDate());
      if ( resumeAfter != null ) {
        if ( resumeAfter.equals(commit.getId()) ) {
          resumeAfter = null;
        }
        Log.println("skip");
        continue;
      }
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

}
