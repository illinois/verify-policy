const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

function parseDate(rawDate) {
    // ISO timestamp
    console.log('Checking for ISO timestamp...');
    var date = DateTime.fromISO(rawDate);
    if (date.isValid) return date;

    // Date object
    console.log('Checking for date dictionary...');
    const dateDict = parseDateObject(rawDate);
    date = DateTime.fromObject(dateDict[0], dateDict[1]);
    if (!date.isValid) core.setFailed(`No valid date format provided. Exiting...`);
    return date;
}

function parseDateObject(dateDict) {
    var splitDict = dateDict.replace(/\s/g, '').split(',');
    var d = {};
    var opts = {};
    for (let i = 0; i < splitDict.length; i++) {
        const pair = splitDict[i].split(':');
        if (pair.length != 2) {
            core.setFailed(`Failed to parse ${splitDict[i]}. Exiting...`);
            return;
        }
        isNaN(parseInt(pair[1])) ? opts[pair[0].toLowerCase()] = pair[1] : d[pair[0].toLowerCase()] = Number(pair[1]);
    }
    return [d, opts];
}

function checkDate(rawDueDate) {
    const currDate = DateTime.now();
    console.log(`Current time: ${currDate.toString()}`)
    var dueDate = parseDate(rawDueDate);
    console.log(`Due date: ${dueDate.toString()}`)
    if (currDate > dueDate) {
        core.setFailed(`Workflow run at time ${currDate.toString()} is after specified due date ${dueDate.toString()}`);
    }
}

function checkRequiredFiles(rawFileList) {
    const fileList = rawFileList.split(',');
    for (f in fileList) {
        if (!fs.existsSync(fileList[f].trim())) {
            core.setFailed(`Required file ${fileList[f]} does not exist in this repository.`);
        }
    }
}

function checkReferenceFiles(rawRefList) {
    const refList = rawRefList.split(',');
    var refPairs = [];
    for (r in refList) {
        refPairs.push(refList[r].split(':'));
    }
    for (p in refPairs) {
        referenceRecursive(refPairs[p][0].trim(), refPairs[p][1].trim());
    }
}

function referenceRecursive(src, ref) {
    if (!fs.existsSync(ref)) {
        core.setFailed(`File ${ref} does not exist locally and cannot be referenced. Exiting...`)
    }
	var isDirectory = fs.statSync(src).isDirectory();
	if (isDirectory) {
	  fs.readdirSync(src).forEach((child) => {
		referenceRecursive(path.join(src, child),
						   path.join(ref, child));
	  });
	} else {
        let srcFile = fs.readFileSync(src, 'utf8');
        let refFile = fs.readFileSync(ref, 'utf8');
        if (srcFile != refFile) {
            core.setFailed(`Contents of files ${src} and ${ref} are not equal. Exiting...`);
        }
	}
}

const dueDate = core.getInput('due');
if (dueDate) checkDate(dueDate);

const requiredFiles = core.getInput('required_files');
if (requiredFiles) checkRequiredFiles(requiredFiles);

const referenceFiles = core.getInput('reference_files');
if (referenceFiles) checkReferenceFiles(referenceFiles);
