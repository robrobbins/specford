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

####Select
Instruct Specford to select an `option`, `checkbox`, or `radio` via CSS selector:

    select selector 'value[foo="bar"]'

The three parts here can be defined as:

    <select keyword> <selector keyword> <css-selector reference>


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

####Screenshots
Use the `capture` _Command_ to get a screenshot. It will save in the Specford root directory.

    capture jpeg 'screenshot'

    // <capture keyword> <jpg | jpeg | png> <name reference>

The second piece of the command is obviously an option for image type. You can use `jpeg`, `jpg`, or `png`.
Notice that this part is not a _Reference_ and does not need to be in quotations (as whitespace is never an option here).
Last is a _Reference_, so *do* use single quotes there.

###Observations
Tests that Specford performs, scoped to the _current context_.

####exists, doesNotExist
Is a given _Reference_ on (or not on) the page? This "existential" Observation can be made on:

#####Text:
Take the **textContent** of the _current context_ and see if it contains the stated _Reference_.

    text 'foo bar' exists

Keep in mind that this is just a [match operation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match) with the given the paramaters (non-global). How exact the search is will be
dependant on how much you reference.

#####Element via a CSS selector:
Does a _querySelector_ operation on the _current context_ with the given _Reference_ return a truthy result?

    selector '.popup-foo' doesNotExist

#####Counting and exist
Execute a _querySelectorAll_ operation on the _current context_. Is the resulting NodeList:

    // equal to the reference?
    3 '.foo' exist

    // less-than the reference?
    <4 '.bar' exist

    // greater-than the ref?
    >5 '.baz' exist

Notice that the cases with quantifier (gt, lt) use a combined **operand+number**. Don't separate those
with any space. **Rule of three** remember? There is also a slight tweak to the language in that
the word `exist` is used here as `exists` would just be bad grammar. Syntax breakdown:

    <number> <reference> <exist keyword>

######doesNotExist does not exist
In _counting_ use cases there is no `doesNotExist`. You do have the option of either

    // explicitly state 0
    0 '.foo' exist

    // or...
    selector '.foo' doesNotExist


####Display vs Visibility
Yes, there is a _big-assed_ difference between `display:none` and `visibility:hidden`. Specford, like a user, does not give a damn. It's for this reason that the provided `isVisible` and `isNotVisible` observations bundle the two.

    selector '.foo' isNotVisible

The above *observation* will be truthy if `.foo` is either `dispaly:none` *or* `visibility:hidden`. Why? Because a user wouldn't see it either way.

####isSelected, isNotSelected
Does a given _Reference_ on the page have the `selected` or `checked` attribute?
This Observation can be made on `option`, `checkbox`, or `radio` elements:

    selector '[value="foo"]' isSelected'
    selector '[value="bar"]' isNotSelected

####Url Observation
There are two observations specific to the page URL, `contains` and `matches`:

    // does any part of the current URL "contain" a reference

    url contains 'foo'

    // does the entire URL match the Reference exactly

    url matches 'https://www.my-site.com/foo'

#### After
Things on a page don't happen instantly. Sometimes Specford should wait. You can tell Specford to
wait until some _Observation_ is true before proceeding. You do this by simply adding the _after_
keyword to any _Observation_.

    after selector '.foo' exists

    after >2 '.bar' exist

    after text 'Delete Me!' doesNotExist

Stating the obvious, that syntax is:

    <after keyword> <Observation>

#####That's not 3!
Correct, _after_ is viewed as a modifier, if you will, to an _Observation_. The _Observation_ still
observes the rule, _after_ is just a stipulation.

The mechanics of the process are such that, when encountering the _after_ keyword, Specford knows to
keep executing the _Observation_ until either one of two conditions are met:

* the _Observation_ returns a truthy result (pass)
* three seconds pass and the result of the _Observation_ is still falsy (fail)

Notice the **three seconds** part. Specford executes the observation once every **250ms** for those 3s, doing
nothing else until, well, after. Remember that regardless of the outcome your _.spec_ will then continue.

    5 '.foo' exist

    click selector '.delete-a-foo'

    after 4 '.foo' exist

    fill 'input.finished' 'YAY!'

#### Require
Use this command to set a variable that the `fill` command can use as a "fixture".

    require users/bob Bob

This command will look for a 'bob.json' (or 'bob.js') in a `/users` directory in
the provided '/fixtures' directory. It will set what that file exports as "Bob".
The synax essentially then is:

    <require keyword> <path/to/file/in/fixtures> <name>

The `name` can then be used in conjunction with the `fill` command

    fill 'input.foo' 'Bob.firstName'

### Installation
Obviously you clone this repo. Obviously you `cd` into this repo, then you can
`npm install`, Next...

Specford's default _runner_ is [slimerjs](https://slimerjs.org/). If you are
of the Mac persuasion you can use *homebrew*

    brew install slimerjs

Slimer, depending on release, will usually need a version of Firefox that is not
the latest to run. Our solution is to get an [older Firefox](http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/) and place that the
`/runners` directory located in the *Specford* root. Current Slimerjs on Homebrew seems to like `36.0.4`.
There is a handy `bash` snippet provided in the addons, `whereIsRunners.sh`, copy that into a *dot file* of
your choice (`~/.bash_profile` for instance), and adjust the path for where you cloned the *Specford* project.

    export SLIMERJSLAUNCHER=~/github/specford/lib/runners/Firefox.app/Contents/MacOS/firefox

Is the authors entry.

### Compiling and Running

Write your `spec` files and place them in the `specs` directory in the *Specford* root.

    gulp compile foo

Will look for a `foo.spec` in your `specs` directory and compile that into a
runnable script that Slimerjs (or other runner) can use.

You can then run your `spec`

    specford foo

If you are using the provided bash add-on, if not there is a gulp task

    gulp run --spec foo
