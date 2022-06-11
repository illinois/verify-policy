/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 331:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 436:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(331);
const github = __nccwpck_require__(436);
const fs = __nccwpck_require__(147);

const checkDate = (rawDueDate) => {
    const currDate = new Date();
    try {
        var dueDate = new Date(rawDueDate);
    } catch (error) {
        core.setFailed(`Error parsing input \`due_date\` with error message:\n ${error.message}`);
        return;
    }
    if (currDate > dueDate) {
        core.setFailed(`Error! Workflow run after specified due date.`);
        return;
    }
}

const checkRequiredFiles = (rawFileList) => {
    const fileList = rawFileList.split(',');
    for (f in fileList) {
        if (!fs.existsSync(fileList[f].trim())) {
            core.setFailed(`Error! Required file ${fileList[f]} does not exist in this repository.`);
        }
    }
}

const openFile = (path) => {
    try {
        var fileData = fs.readFileSync(path);
    } catch (err) {
        core.setFailed(`Error when attempting to open file ${path} with error message:\n ${err.message}`);
        return '';
    }
    return fileData;
}

const checkReferenceFiles = (rawRefList) => {
    const refList = rawRefList.split(',');
    var refPairs = [];
    for (r in refList) {
        refPairs.push(refList[r].split(':'));
    }
    for (p in refPairs) {
        let ref = openFile(refPairs[p][0].trim());
        let comp = openFile(refPairs[p][1].trim());
        if (Buffer.compare(ref, comp) != 0) {
            core.setFailed(`Contents of files ${refPairs[p][0]} and ${refPairs[p][1]} are not equal.`);
        }
    }
}

const dueDate = core.getInput('due_date');
if (dueDate) checkDate(dueDate);

const requiredFiles = core.getInput('required_files');
if (requiredFiles) checkRequiredFiles(requiredFiles);

const referenceFiles = core.getInput('reference_files');
if (referenceFiles) checkReferenceFiles(referenceFiles);

})();

module.exports = __webpack_exports__;
/******/ })()
;