<p align="center">
    <img src="white_logo.svg" height="256" alt="logo">
</p>

# INGEO - GeoPolyMesh Input Manager

The point is to create a JSON file that is capable of validating (or invalidating) XML files with theses constraints :
- Validate the XML structure (like an XSD file would).
- Validate the XML tag arguments.
- Validate constraints on argmuents.

For exemple, if an ``<axis>`` tag is given, we want the axis to be directed by a vector, and so, we must have the tag like so :
```xml
<axis x="" y="" z=""/>
```
With `x`, `y` and `z` beeing `double`. So we not only want to assure that all three coordinates are given, but also that these coordinates are of the valid type.

The parser takes two arguments :
- A `json` file, which will configure the parser for this instance.
- An `xml` file, which is the file to validate.

## JSON configuration file for the parser

Here is the file structure graph :

<img src="JSON Structure.png" alt="File structure graph">

### Tag element

The **tag element** describes a XML tag. Here is the structure :
```jsonc
{
    "name": "my_tag",       // Mandatory property
    "isRoot": false,        // Defaults to false
    "isSelfClosing": false, // Defaults to false
    "args": [               // Defaults to []
        Arg1,
        Arg2,
        ...
    ]
}
```

This describes the following tag :
```xml
<my_tag Arg1 Arg2 ...></my_tag>
```

#### Property table

|Property name|Type|Is Mandatory ?|Default value|
|:-|:-|:-|:-|
|``name``|``string``|**yes**||
|``isRoot``|``boolean``|no|``false``|
|``isSelfClosing``|``boolean``|no|``false``|
|``args``|``arg[]``|no|``[]``|

### Arg element

The **arg element** describes a XML tag argument. Here is the structure :
```jsonc
{
    "name": "my_arg",       // Mandatory property
    "type": "uint8",        // Mandatory property
    "isMandatory": false,   // Defaults to false
    "possibleValues": [     // Defaults to []
        "value_a",
        "value_b",
        ...
    ], 
    "bindings": {           // Defaults to {}
        "other_arg": "\\d{10}",
        "another_arg": ".*",
        ...
    }
}
```

It is important to notice two main features :

If ``possibleValues`` is set, then the parser will only validate the argument if the value is in the list of possible values. <br/>
Of course, all possible values given must be valid regarding the ``type`` property.

The way ``bindings`` works is quite easy. It is a map of type ``map<arg.name, RegExp>``. Each map entry is a condition on another argument. <br/>
In the example above, ``other_arg`` must be a 10 digit number in order to ``my_arg`` to be valid. <br/>
Note that the RegExp is constructed as follows :
```js
"\\d{10}" -> "^\\d{10}$" -> /^\d{10}$/g
``` 

#### Property table

|Property name|Type|Is Mandatory ?|Default value|
|:-|:-|:-|:-|
|``name``|``string``|**yes**||
|``type``|``string``|**yes**||
|``isMandatory``|``boolean``|no|``false``|
|``possibleValues``|``string[]``|no|``[]``|
|``bindings``|``{key: string, value: RegExp}``|no|``{}``|

### Node element

The **node element** describes how a XML tag should be inside the XML hierarchy. Here is the structure :
```jsonc
{
    "tag": "my_tag",        // Mandatory property
    "isMandatory": false,   // Defaults to false
    "children": [           // Defaults to []
        node1,
        enum1,
        node2,
        node3,
        ...
    ],
}
```

This describes the following structure :
```xml
<my_tag>
    <other_tag />
    <other_tag />
    <other_tag />
    <other_tag />
</my_tag>
```

#### Property table

|Property name|Type|Is Mandatory ?|Default value|
|:-|:-|:-|:-|
|``tag``|``string``|**yes**||
|``isMandatory``|``boolean``|no|``false``|
|``children``|``(node\|enum)[]``|no|``[]``|

### Enum element

The **enum element** describes how a choice of tag can be made at a given level. Here is the structure :
```jsonc
{
    "isEnum": true,     // Mandatory property, must be true
    "enumCount": 1,     // Defaults to 1
    "enumList": [       // Mandatory property, must be at least of length 2
        node1,
        node2,
        ...
    ],
}
```

This describes the following structure :
```xml
<my_tag>
    <other_tag />
    <!-- start of enum -->
    <!-- Only n of choices can be in the enum -->
    <choice1 />
    <choice2 />
    <choice3 />
    <choice4 />
    <!-- end of enum -->
    <other_tag />
</my_tag>
```

The ``enumCount`` property allows to control how many choices must be included in the XML for the enum.

For ``enumCount == n`` : We must include exactly ``n`` nodes given in ``enumList``. 

#### Property table

|Property name|Type|Is Mandatory ?|Default value|
|:-|:-|:-|:-|
|``isEnum``|``boolean``|**yes**|``true``|
|``enumCount``|``integer``|no|``1``|
|``enumList``|``(node\|enum)[]``|**yes**||
