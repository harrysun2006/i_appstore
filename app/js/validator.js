(function($) {
  function checkApplet(applet) {
    var error = false;
    if (applet === undefined || applet === null) {
      error = 'Invalid applet data!';
    } 
    return error;
  }
  
  function checkUser(user) {
    var error = false;
    if (user === undefined || user === null) {
      error = 'Invalid user data!';
      return error;
    }
    var setting = user.setting || {};
    if (user.username === undefined || user.username === null || user.username.length < 3) {
      error = 'Username is less than 3 characters!';
    } else if (user.password2 === undefined || user.password2 === null || user.password2 == '') {
      error = 'Confirmed password is blank!';
    } else if (user.password1 != user.password2) {
      error = 'Confirmed password is not same as password!';
    }
    return error;
  }

  $.validator = $.validator || {};
  $.extend($.validator, {
    checkApplet : checkApplet,
    checkUser : checkUser
  });
})(jQuery);
