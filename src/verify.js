const core = require('@actions/core');
const fs = require('fs');

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
