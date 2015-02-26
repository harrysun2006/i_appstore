function checkApplet(applet) {
  var error = false;
  if (applet === undefined || applet === null) {
    error = 'Invalid applet data!';
  } else if (applet.name === undefined || applet.name === null || applet.name.length < 3) {
    error = 'Name is less than 3 characters!';
  } else if (applet.url === undefined || applet.url === null || applet.url == '') {
    error = 'URL is blank!';
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
  } else if (user.password != undefined && user.password != null && user.password.length < 4) {
    error = 'Current Password is less than 4 characters!';
  } else if (user.password1 === undefined || user.password1 === null || user.password1.length < 4) {
    error = 'Password is less than 4 characters!';
  } else if (user.password2 === undefined || user.password2 === null || user.password2 == '') {
    error = 'Confirmed password is blank!';
  } else if (user.password1 != user.password2) {
    error = 'Confirmed password is not same as password!';
  } 
  return error;
}

exports.checkApplet = checkApplet;
exports.checkUser = checkUser;
