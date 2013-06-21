#Specford
_put this in your spec and smoke it_

##.spec files
You tell Specford what to do via '.spec' files. Those .spec files are made up of 
commands that are all **very minimal statements**. Before going into the '.spec' language, let's
look at a small example:

    visit http://google.com:
      $ body:
        text ? 'About Google'
        text !? 'Foo bar baz'

Specford reads this as:

+ Go to google.com
+ Query the document you find there for 'body', set that as the context
+ Check if the text 'About Google' exists (in the current context).
+ Check if the text 'Foo bar baz' does not exist (also in the context).

Other examples are in the 'specs' directory for your exampling pleasure. Without further
ado, I present the statements available to you in a '.spec' file.

###Visit and Query

####Visit

All '.spec' files **must** begin with a `visit` statement in the form:

    visit http://www.foo.com/bar:

The syntax is basically:

    <visit keyword> <someURL> <colon>

It can be any viable URL. Notice the colon at the end,  both `visit` and  `query` statements
terminate with colons. All further statements are indented at least one level from the opening
visit and there *should* be only one `visit` per spec (though) there can be multiple pages
visited via navigation (`click`, `submit` etc...).

####Query

The second command in a `.spec` file **must be a query**. If you want to act on the entire page
then `query` the **document body**.

A `query` is performed with the `$` operator and is used to set the context for a series
of statements. Along with the `visit` command `query` begins an indent block. Queries stack,
and un-stack By indent, so whitespace matters. For example:

    $ #foo:
      selector ? 'h1'
      
      $ .bar:
        selector exists 'a.baz'

The first `selector` command looks for an **h1** tag in the element with **id='foo'**, while the second
`selector` command looks for the **anchor tag class='baz' in the element id='foo'**.

### Existential Operations

The `?` and `!?` **assertions** are the key to testing if something exists (or does not).

####Selector

Confirming if an element exists (or doesn`t) is done using the `selector` statement. Typical for **.spec** commands it
is in 3 parts: **operator assertion reference**: 

    selector ? 'div#foo'

Also you could do:

    selector !? 'span.bar'

#####A Note On The Reference Component

The third piece of the `seletor` existential command is the `reference`. **It must be in single quotes**. Double quotes
may follow, and often will be nested within, but the outer most quotes must be single. Specford knows to handle references 
differently, as they are not part of the `.spec` language. You could think of them as _strings_. The 'reference' to a 'selector'
command **can be any legal css selector**.

####Text

Tries to match the `reference` against the **current context**'s **textContent**. The **current context** being whatever has 
been set through a previous `query` operation. In the form `text <assertion> <reference>`.

###Clicking Things

Click events performed by Specford are dispatched to a `selector` via another 3-part command:

    click selector '#btn.primary'

Or:

    click link 'a.foo'

Or:

    click submit 'button.submit'

Both examples begin with the `click` keyword and end with a reference (again any legal css selector) but vary in the middle.
The second piece to the click command tells specford to expect a **URL change** or not. The first variant, `click selector`
does not cause a listener for **URL change** to be employed (but may be paired with the `wait for` command...). The second, 
`click link` does (the `click submit` would as well). Any further statements will be executed once the web page has reloaded.
You, the developer, don't need to be cognizant of this. Just write your spec...

###Filling Inputs
