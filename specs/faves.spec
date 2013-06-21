visit http://combo-staging-2.taskrabbit.in/business/login:

  $ .login-container form:
    fill 'input.email' 'users.josh.email'
    fill 'input.password' 'users.josh.password'
    click submit '.btn'

  $ ul.primary-links:
    click link 'li a[href="/business/favorites"]'

  $ ul.past li:nth-child(2):
    text ? 'Abigail Y.'

    $ div.action ul.secondary:
      click selector 'li a'

  $ ul.favs li:first-child:
    wait for 'Abagail to appear in the favs'
    text ? 'Abigail Y.'
  
  $ ul.past:
    text !? 'Abigail Y.'
  
  $ ul.favs li:first-child:
    $ div.action ul.secondary:
      click selector 'li a'

  $ ul.past li:first-child:
    wait for 'Abigail is back in the past rabbits'
    text ? 'Abigail Y.'

  $ ul.favs:
    text !? 'Abagail Y.'

