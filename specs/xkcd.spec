visit http://xkcd.com/149:
  $ #topContainer:
    selector ? '#masthead'

    $ #masthead:
      text ? 'A webcomic of'

    $ #news:
      text ? 'You can get'

  $ #middleContainer:
    selector ? '#ctitle'

    $ .comicNav:
      click 'a[rel="next"]'
      url ^= '/xkcd.com\/150/'
