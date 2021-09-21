// selectors
export const REGEX_SELECTORS = {
  componentSelector: /export(\s+)class(\s+)[a-zA-Z0-9-_]+/g,
  componentHTMLselector: /selector:(\s+)(\"|')[a-zA-Z-_]+(\"|')/g,
  // inputs
  // @Input() variableName; and @Input() variableName
  regularInputSelector: /@Input\(\)(\s+)[a-zA-Z0-9-_]+(;|)/g,
  // @Input() variableName: type; and @Input() variableName: number = 9;
  regularInputWithTypeSelector: /@Input\(\)(\s+)[a-zA-Z0-9-_]+:(\s+)[a-zA-Z0-9-_]+((;|)|(\s+)[a-zA-Z0-9-_]+(\s+)=(\s+)[a-zA-Z0-9-_]+(;|))/g,
  // @Input('inputName') varName: type; and @Input("inputName") varName: type
  customNameInputWithTypeSelector: /@Input\(('|")[a-zA-Z0-9-_]+('|")\)(\s+)[a-zA-Z0-9-_]+:(\s+)[a-zA-Z0-9-_]+\;/g,
  regularInputLiteralTypeSelector: /@Input\(\)(\s+)[a-zA-Z0-9-_]+:((\s+)(('|")[a-zA-Z0-9-_]+('|")((\s+)\|)))+(\s+)('|")[a-zA-Z0-9-_]+('|")(;|:|)/g,
  //@Input() set foo(value) {}
  setterInputSelector: /@Input\(\)(\s+)set(\s+)[a-zA-Z0-9-_]+\([a-zA-Z0-9-_]+\)(\s+)/g,
  //@Input() set foo(value: type) {}
  setterInputWithTypeSelector: /@Input\(\)(\s+)set(\s+)[a-zA-Z0-9-_]+\([a-zA-Z0-9-_]+:(\s+)[a-zA-Z0-9-_]+\)(\s+)/g,
  // @Input('inputNameC') varName = 'adv';
  setterInputCustomNameSelector: /@Input\(("|')[a-zA-Z0-9-_]+("|')\)(\s+)[a-zA-Z0-9-_]+(\s+)=(\s+)[A-Za-z0-9"']+(;|)/g,
  //@Input() set foo(value: 'type1' | 'type2') {}
  setterInputLiteralTypeSelector:
    /@Input\(\)(\s+)set(\s+)[a-zA-Z0-9-_]+\([a-zA-Z0-9-_]+:((\s+)('|")[a-zA-Z0-9-_]+('|")(\s+)\|)+(\s)('|")[a-zA-Z0-9-_]+('|")\)/g,

  // outputs
  // @Output() buttonClick: EventEmitter<any> = new EventEmitter()
  regularOutputSelector: /@Output\(\)(\s+)[a-zA-Z0-9-_]+:(\s+)EventEmitter<[a-zA-Z0-9-_]+>(\s+)=(\s+)new(\s+)EventEmitter\(\);/g,

  // other
  extendedClassSelector: /export(\s+)class(\s+)[a-zA-Z0-9-_]+(\s+)extends(\s+)[a-zA-Z0-9-_]+/g,
  extendedClassPathSelector: /import(\s+){(\s+)[a-zA-Z0-9-_]+(\s+)}(\s+)from(\s+)[\/\@A-Za-z0-9."'_-]+/g,
};
