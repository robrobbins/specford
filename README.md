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
does not cause a listener for **URL change** to be employed (but may be paired with the `wait for` command... more on that later). 
The second, `click link` and third `click submit` do. Any further statements will be executed once the web page has reloaded.
You, the developer, don't need to be cognizant of this. Just write your spec...

###Filling Inputs

The `fill` command has a slight variant in its syntax, it takes 2 references:

    fill 'input.foo' 'bar baz'

This would find the **input class='foo' in the current context** and fill it with the **value** 'bar baz'.

####Fill And Fixtures

Specford utilizes **fixtures** in the form of an **Object Literal**. The `fill` command understands this and
checks to see if the second 'reference' (the third piece) of a `fill` statement matches a key (or 'key path') in
the loaded fixture Object. If so, the **value** located at that key (or 'path') is used as the `fill` value.

###Waiting For *

As alluded to in "Clicking Things" the `click selector` command doesn't set a listener for **URL change**, in fact it
doesn't do anything but click something. It is a common issue then to need to check that _something_ happened. The
_something_ that should happen though may not happen immediately. It may be an animation, an AJAX operation or 
what-have-you. The `wait for` operation solves this:

    wait for 'bar to be in baz'

Alone, however, it doesn't make much sense. The typical use case would be to have something before it, like a `click`, then
something after, such as a 'query' and an existential operation:

    click selector '.foo'

    $ #baz:
      wait for 'bar to be in baz'
      text ? 'bar'

Here, Specford:

1. Clicks the **element class='foo'**
2. Sets the 'query' **context** to the **element id='baz'**
3. Begins checking the **context textContent** for 'bar' every 250ms for up to 3 seconds

If the text is found within the **3 second window** it passes and fails if not. Either way testing continues after. Note that
Specford marks **the first non-query command** following a 'wait for' as the statement to execute in the 'timed manner'. 
