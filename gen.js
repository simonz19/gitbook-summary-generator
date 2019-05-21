const recursive = require("recursive-readdir");
const { relative, extname, parse } = require("path");
const { writeFile, statSync } = require("fs");
const paths = require("./utils/paths")(process.cwd());
const { bookjson, resolveApp, appDirectory } = paths;
const { gitbooksConfig } = require(bookjson) || {};

const { src = "", ignore = [], script } = gitbooksConfig || {};
const README = "README";
const bookPath = resolveApp(src);
const summaryPath = resolveApp("SUMMARY.md");

/**
 * return the relative path from given path to summary path
 * tips: path.relative() expects a folder rather than a file as its first argument
 * @param {*} path
 */
const relativeToSummary = path => relative(appDirectory, path);

/**
 * assemble flat datas by given filePath to the given target array
 * @param {*} arr
 */
const assembleFlatDatas = (arr = []) => {
  const assembleFunc = filePath => {
    const fileInfo = parse(filePath);
    const { dir, base, name } = fileInfo;
    if (!arr.some(f => f.path === filePath)) {
      arr.push({
        path: filePath,
        dir,
        base,
        name
      });
    }
    if (dir !== bookPath) {
      assembleFunc(dir);
    }
  };
  return assembleFunc;
};

/**
 * prepare flat datas
 * @param {*} files
 */
const flatFiles = files => {
  const flatDatas = [];
  const assembleFunc = assembleFlatDatas(flatDatas);
  files
    .filter(file => extname(file) === ".md") // only .md file is possible
    .forEach(file => {
      assembleFunc(file);
    });
  return flatDatas;
};

/**
 * transform flat datas to tree structure
 * @param {*} flat
 */
const flat2Tree = flat => {
  const result = [];
  const hash = {};
  flat.forEach(item => {
    hash[item.path] = item;
  });
  flat.forEach(item => {
    const hashVP = hash[item.dir];
    if (hashVP) {
      if (!hashVP.children) {
        hashVP.children = [];
      }
      hashVP.children.push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

/**
 * auto render SUMMARY.md
 * @param {*} tree
 */
const render = tree => {
  let text = "# Summary\n\n";
  text += "- [Introduction](README.md)\n";
  const renderText = (item, level = 0) => {
    const prefix = new Array(level).fill("  ").join("");
    const isFile = statSync(item.path).isFile();
    const isExistReadme = (item.children || []).find(
      child => child.name.toUpperCase() === README
    );
    text +=
      `${prefix}- ` +
      (isFile
        ? `[${item.name}](${relativeToSummary(item.path)})`
        : isExistReadme
        ? `[${item.name}](${relativeToSummary(isExistReadme.path)})` // link readme to parent node
        : item.name) +
      "\n";
    (item.children || [])
      .filter(child => child.name.toUpperCase() !== README) // filter readme file
      .forEach(child => {
        renderText(child, level + 1);
      });
  };
  tree.forEach(item => {
    renderText(item);
  });
  return text;
};

recursive(
  bookPath,
  [
    resolveApp("README.md"),
    resolveApp("SUMMARY.md"),
    resolveApp("_book")
  ].concat(ignore),
  function(err, files) {
    const flatDatas = flatFiles(files);
    const treeDatas = flat2Tree(flatDatas);
    let text = render(treeDatas);
    let nextText = text;
    if (script) {
      const scriptFunc = require(resolveApp(script));
      if (typeof scriptFunc !== "function") {
        console.error("the link to the specified script file should export a function as default");
        process.exit(1);
      }
      nextText = scriptFunc(nextText);
    }
    writeFile(summaryPath, nextText, err => {
      if (err) throw err;
      console.log("summary generate success");
    });
  }
);
