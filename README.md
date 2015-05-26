#Specford
_integration bot from the future_

##.spec files and The Rule of 3
You tell Specford what to do via `.spec` files. Those files are syntactically minimalistic, made up of only 2 things: **Commands** and **Observations**. Each adhering, in some way, to the _rule of three_. Before going deeper into the `.spec` language, let's look at a small example:

    visit http://google.com:
    query body:
      text 'About' exists
      text 'Foo bar baz' doesNotExist

Specford reads this as:

+ Go to google.com
+ Query the document for 'body', set that as the context
+ Check if the text 'About' exists (in the current context).
+ Check if the text 'Foo bar baz' does not exist (also in the context).

###Commands
Statements in which Specford does stuff that has side effects. 

####Visit
Before Specford can operate on a page, you need to send him to one.

    visit www.foo.com/bar:

The syntax breakdown reveals 3 things:

    <visit keyword> <some/url> <colon>

Notice the colon at the end. `visit`, and the yet-to-be-mentioned `query`, both terminate with a colon. What's `query`? Segue!

####Query
A `query` is used to set the context for a series of **Commands** and **Observations**.

    query div.foo:

That syntax breakdown; still 3 parts:

    <query keyword> <css-selector> <colon>

The *css-selector* portion of the command is any valid CSS. If it would work with `querySelector` it will work here.

#####Indenting, Stacking, Scoping
Unique to the `query` _Command_ is the fact that its indent level is tracked. This allows _queries_ to be stacked (and unstacked), combining to form the _current context_, via whitespace.

    query .main-content:
      query h1:

This forms the _context_ `main-content h1`, scoping any **Commands** or **Observations** to those Elements that this would apply. Larger indents stack, equal levels replace, and smaller unstack:

    query .container:
      query #foo:
        -- current context is ".container #foo"
        query span:
          -- current context is".container #foo span"
      query #bar:
        -- current context is ".container #bar"
    query footer:
      -- current context is "footer"

####Click
Instruct Specford to click something:

    click selector 'input.btn-primary'
    
The three parts here can be defined as:

    <click keyword> <selector keyword> <css-selector reference>
    
#####References
Notice the CSS selector in the above _click command_ is in **single quotes**. This is what we call a **Reference**.
A **Reference** is any series of characters that may, or may not, at some point, contain whitespace.

* Values for the `fill` Command
* Text to be verified via the `text` Observation
* CSS selectors not in a Query Command

A Reference must be wrapped in single quotes, **not double**. You may use double quotes inside of a Reference however:

    click selector 'a[href="foo/bar"]'
    
_Remember that the Visit and Query Commands do not utilize References. They do not require the use of quotation marks_

#####Keywords
These are syntax components that are not References, but combine with them to make up the Commands and Observations
of the `.spec` language.

####Fill
Insert values into an input field:

    fill 'input.foo-bar' 'bazzy baz'
   
Notice the use of two References here:

    <fill keyword> <css-selector reference> <value reference>
    
The first Reference is the field, the second is the value to be inserted.

###Observations
Tests that Specford performs, scoped to the _current context_.

####exists, doesNotExist
Is a given _Reference_ on (or not on) the page? This "existential" Observation can be made on:

    // Text:
      
    text 'foo bar' exists
    
    // Element(s) via a CSS selector: 
    
    selector '.popup-foo' doesNotExist

Remember that these observations apply to only the _context_ you have set via Query.

####Url Observation
There are two observations specific to the page URL, `contains` and `matches`:

    // does any part of the current URL "contain" a reference
    
    url contains 'foo'
    
    // does the entire URL match the Reference exactly
    
    url matches 'https://www.my-site.com/foo'
