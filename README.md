# ng-vs-snippets
![ts](https://badgen.net/badge/Built%20With/TypeScript/blue) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)



Automatic VS Code snippets generation for Angular codebases. Seamlessly maintain up-to-date VS Code snippets of all of your code.

Currently, we support snippet generation from the following Angular elements:

<center>

| Element   | Status                                    |
|-----------|:-----------------------------------------:|
| Component | :white_check_mark: Supported              |
| Directive | :construction_worker: Not yet supported   |
| Pipe      | :construction_worker: Not yet supported   |

</center>

## Installation

Install ```ng-vs-snippets``` as a dev-dependency in your Angular project. To do so, run:

```
npm i ng-vs-snippets --save-dev
```

Create a ```package.json``` script to extract snippets from your codebase:

```json
"scripts": {
    "ng-vs-snippets": "ng-vs-snippets --dir ./src --output ./.vscode",
},
```

Execute the script by running:

```
npm run ng-vs-snippets
```

The script will generate a ```out.code-snippets``` file containing all the definitions. **Make sure you don't have any file with the same name** since the data contained in that file **is going to be replaced**.

## Troubleshooting
Sometimes, due to VS Code configuration issues, snippets don't appear in the suggestion's dropdown. Make sure to specify, in VS Code ```settings.json``` configuration file the following properties:

```json
"editor.tabCompletion": "on",
"editor.snippetSuggestions": "top"
```
If this doesn't fix the problem, open the command palette and search for ```Preferences: Configure User Snippets``` to ensure the editor is considering the fille where your generated snippets are defined.

## Documentation

You can find the [full document design at this url]().

## Contributing

Pull requests are welcome :) Make sure to create an issue first so anyone's work is overlaped.