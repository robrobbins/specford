visit http://xkcd.com/149:
  $ #topContainer:

    selector '#masthead' exists

    $ #masthead:
      text 'A webcomic of' exists

    $ #news:
      selector 'img[title="the xkcd store"]' exists

  $ #middleContainer:
    selector '#ctitle' exists

    text 'Sandwich' exists

    $ .comicNav:
      click link 'a[rel="next"]'

      url matches '/xkcd.com\/150/'

  $ #middleContainer:
    text 'Grownups' exists
