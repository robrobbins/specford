visit http://plangrid-test.herokuapp.com/en#signup:
  query body:
    selector '.popup-container' exists
    selector 'form.signup' exists
    query form.signup:
      click selector 'button'
      -- should have all_the_errors
      text 'Your full name is required' exists
      text 'Your email is required' exists
      text 'Your password needs to be at least 8 characters' exists
      -- last name err
      fill 'input[placeholder="First"]' 'Finn'
      click selector 'button'
      text 'Your full name is required' doesNotExist
      text 'Your last name is required' exists
