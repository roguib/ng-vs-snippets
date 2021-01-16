# Design overview

## General overview
Recursively read all directories inside the root folder of the project. Save the path to the files that are candidates of having a ```@Component``` defined inside (file name ending in .ts).

Read every file looking for the ```@Component``` annotation. Save the location of the component, the name of the component and every ```@Input``` and ```@Output``` into an object.

Once every file has been parsed, generate a JSON with the information gathered about the components and save it to ```./.vscode```.

## High-level implementation
```ts
public walker(root: string): Array<string>
```

The function ```walker``` will start at the root directory and save those files candidates of having components defined inside of them. Only will consider files with ```.ts``` extension. Should traverse all the file tree from the root up to the bottom and return the full path to every candidate file.

```ts
public parser(filePaths: Array<string>): Array<File>
```

```ts
interface File {
    fileLocation: string;
    prefix: string;
    componentName: string;
    inputs: Array<Input>;
    outputs: Array<Output>;
}

interface Input {
    inputName: string;
    type: string;
}

interface Output {
    outputName: string;
    type: string;
}
```

The ```parser``` function receives as a parameter an array of absolute paths to every file candidate of containing a definition of a component. The parser then opens the file and looks for the ```@Component``` annotation. If present, creates a File object with the extracted information about the component.

Considerations (review in the future):
- We will suppose the component is well-formed and does compile.

```ts
public snippetsGenerator(files: Array<File>): string
```

This function will be responsible of generating de JSON with all the information about the components. It will return the JSON as a string.

Considerations (review in the future):
- Scope will always be html.
- We suppose the component doesn't wrap anything (other components, text, etc)
- We don't care about formating (Prettier and other libraries handle automatic formating)

An example of the generated JSON:

```json
"Component Name": {
    "scope": "html",
    "prefix": "app-prefix",
    "body": [
        "<app-prefix (click)=\"$1\" theme=\"${2|primary,secondary|}\" [block]=\"${3|false,true|}\" size=\"${4|md,lg,sm|}\" [block]=\"${5|false,true|}\">",
        "</app-prefix>"
    ]
}
```

## Considerations (review in the future):
- Notice every time we're parsing the files, although we could keep track of those files that already have been parsed and have not been modified in order to skip them in the ```parser``` function.
- Files are going to be read in sequential order but the performance will increase if parallel reading is implemented.