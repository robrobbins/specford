visit http://xkcd.com/149:
  query #topContainer:

    selector '#masthead' exists

    query #masthead:
      text 'A webcomic of' exists

    query #news:
      selector 'a img' exists

  query #middleContainer:
    selector '#ctitle' exists

    text 'Sandwich' exists

    query .comicNav:
      click link 'a[rel="next"]'

      url matches '/xkcd.com\/150/'

  query #middleContainer:
    text 'Grownups' exists
