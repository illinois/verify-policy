# verify-policy

> A Github action for verifying assignment policies on submission.

`verify-policy` performs the following actions:
- Checks the time of the workflow run against an assigned due date, preventing workflow runs from occurring after the due date.
- Verifies that certain required files exist in the assginment repository at workflow runtime.
- Cross-references files to verify that their contents have not been altered.

## Usage:

The following workflow will do the following:
- Verify that the workflow has been run before June 21st on Greenwich Mean Time (GMT)
- Require that there exist files on the paths `mp1/Makefile` and `.github/workflows/mp1-autograder-action.yml`.
- Require that the contents of `mp1/tests/test-file.cpp` and `reference/tests/test-file.cpp` are the same, and the contents of `mp1/Makefile` and `reference/Makefile` are the same.

```yaml
name: Test
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v4
  - uses: illinois/verify-policy@v2
    with:
      due_date: '2022-06-21T00:00:00+00:00'
      required_files: 'mp1/Makefile, .github/workflows/mp1-autograder-action.yml'
      reference_files: 'mp1/tests/test-file.cpp : reference/tests/test-file.cpp, mp1/Makefile : reference/Makefile'
```

## Parameters:

|Parameter|Required?|Description|Default|
|--------------------|--------|-----------|-------|
|`due_date`|No|An ISO 8601 formatted time stamp describing the exact due date and time of the assignment. `verify-policy` will reference this input the time that the action is run, and will fail if the run-time is after the time specified by `due_date`. If `due_date` is left blank, `verify-policy` will skip this check.|`''`|
|`required_files`|No|A comma-separated list of filepaths (using `$GITHUB_WORKSPACE$` as the base directory) of files/directories that are required to be in the assignment submission. If any file is not located in the exact path as specified by `required_files`, `verify_policy` will fail. If `required_files` is left blank, `verify-policy` will skip this check.|`''`|
|`reference_files`|No|A comma-separated list of filepaths (using `$GITHUB_WORKSPACE$` as the base directory) of files that will be used as reference files by `verify-policy`. The format of the path should be of the form `path/to/reference.txt:path/to/student_file.txt`. In the event that the contents of any pair of files specified in `reference_files` differ, `verify_policy` will fail. If `reference_files` is left blank, `verify_policy` will skip this check.|`''`|
