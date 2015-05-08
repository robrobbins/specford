#Specford
_put this in your spec and smoke it_

## Getting started
First, [install node and npm](http://nodejs.org/)
```
git clone https://github.com/robrobbins/specford.git
cd specford
npm install
sh specford.sh
```
Create new .spec files in the `specs/` directory. Then, run:
```
node compile
sh specford.sh
```

##.spec files
You tell Specford what to do via '.spec' files. Those .spec files are made up of
commands that are all **very minimal statements**. Before going into the '.spec' language, let's
look at a small example:

    visit http://google.com:
      query body:
        text 'About Google' exists
        text 'Foo bar baz' doesNotExist

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
terminate with colons. All further statements are indented at least one level from the
visit. There can be one `visit` per spec, or multiple `visit` commands (just be sure to reset the indentation
level when starting another 'visit').

####Query

The second command in a `.spec` file **must be a query**. If you want to act on the entire page
then `query` the **document body**.

A `query` is performed with the `query` operator and is used to set the context for a series
of statements. Along with the `visit` command `query` begins an indent block. Queries stack,
and un-stack By indent, so whitespace matters. For example:

    query #foo:
      selector 'h1' exists

      query .bar:
        selector 'a.baz' exists

The first `selector` command looks for an **h1** tag in the element with **id='foo'**, while the second
`selector` command looks for the **anchor tag class='baz' inside a match to the selector '#foo .bar'**.

### Existential Operations

The `exists` and `doesNotExist` **assertions** are the key to testing if something exists (or does not).

####Selector

Confirming if an element exists (or doesn`t) is done using the `selector` statement. Typical for **.spec** commands it
is in 3 parts: **operator reference assertion** (in most cases, some are reversed):

    selector 'div#foo' exists

Also you could do:

    selector 'span.bar' doesNotExist

#####A Note On The Reference Component

The second piece of the `seletor` existential command is the `reference`. **It must be in single quotes**. Double quotes may follow, and often will be nested within, but the outer most quotes must be single. Specford knows to handle references differently, as they are not part of the `.spec` language. You could think of them as _strings_. The 'reference' to a 'selector' command **can be any legal css selector**.

####Text

Tries to match the `reference` against the **current context**'s **textContent**. The **current context** being whatever has been set through a previous `query` operation. In the form `text <reference> <assertion>`.

###Clicking Things

Click events performed by Specford are dispatched to a `selector` via another 3-part command:

    click selector '#btn.primary'

Or:

    click link 'a.foo'

Or:

    click submit 'button.submit'

Both examples begin with the `click` keyword and end with a reference (again any legal css selector) but vary in the middle.
Specford understands the differences between selectors, links, and submitting a form. You, the developer, don't need to be cognizant of this.
Just write your spec... Obviously, there could be overlap with these commands. You could use `click selector ...` for all of these,
but by being explicit in your spec language, pertaining to **what** you are clicking, produces superior readability.

Notice that the syntax of the `click` operator has the `reference` component at the end.

###Filling Inputs

The `fill` command has another slight variant in its syntax, it takes 2 references:

    fill 'input.foo' 'bar baz'

This would find the **input class='foo' in the current context** and fill it with the **value** 'bar baz'. The second command
after the `fill` operator is the **selector** and the third is the **value**.

####Fill And Fixtures

Specford utilizes **fixtures** in the form of an **Object Literal**. The `fill` command understands this and
checks to see if the **value** 'reference' (the third piece) of a `fill` statement matches a key (or 'key path') in
the loaded fixture Object. If so, the **value** located at that key (or 'path') is used as the `fill` value. A **key** is
simply a top level entry in your **fixtures** object, and a path is a key contained in a nested object of the **fixtures**.
For example, if this were the content of the `all.js` fixture:

    {
      foo: 'bar'
      baz: {
        qux: 'vop'
      }
    }

You could use the value located at **foo** in a spec by simply putting that **key** as the **value** in a `fill` command.

    fill 'input.bar' 'foo'

A **path** is a dot-delimited string that leads to a value in an object, so to use the value at **qux**:

    fill 'input.foo' 'baz.qux'

###Waiting For *

and more coming soon...
