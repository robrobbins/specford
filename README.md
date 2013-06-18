##Specford
_Integration test bot_

###.spec files

All '.spec' files begin with a `visit` in the form:

    visit http://www.foo.com/bar:

The syntax is basically:

    <visit keyword> <someURL> <colon>

It can be any viable URL. Notice the colon at the end,  both `visit` and  `query` statements
terminate with colons. All further statements are indented at least one level from the opening
visit and there *should* be only one `visit` per spec (though) there can be multiple pages
visited via navigation (`click`, `submit` etc...).
