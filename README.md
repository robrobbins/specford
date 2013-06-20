#Specford
_Integration test bot_

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
+ Check if the text 'About Google' exists.
+ Check if the text 'Foo bar baz' does not exist.

Other examples are in the 'specs' directory for your exampling pleasure. Without further
ado, I present the statements available to you in a '.spec' file.

###Visit

All '.spec' files begin with a `visit` statement in the form:

    visit http://www.foo.com/bar:

The syntax is basically:

    <visit keyword> <someURL> <colon>

It can be any viable URL. Notice the colon at the end,  both `visit` and  `query` statements
terminate with colons. All further statements are indented at least one level from the opening
visit and there *should* be only one `visit` per spec (though) there can be multiple pages
visited via navigation (`click`, `submit` etc...).

###Query

A `query` is performed with the `$` operator and is used to set the context for a series
of statements. Along with the `visit` command `query`

