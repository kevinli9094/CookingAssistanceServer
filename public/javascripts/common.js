/* eslint-disable no-unused-vars, no-param-reassign */
// show notification popup
function showNotification(msg, type, reloadPage, redirect) {
  // defaults to false
  reloadPage = reloadPage || false;

  // defaults to null
  redirect = redirect || null;

  // Check for message or fallback to unknown
  if (!msg) {
    msg = 'Unknown error has occured. Check inputs.';
  }

  $('#notify_message').removeClass();
  $('#notify_message').addClass(`alert-${type}`);
  $('#notify_message').html(msg);
  $('#notify_message').slideDown(600).delay(2500).slideUp(600, () => {
    if (redirect) {
      window.location = redirect;
    }
    if (reloadPage === true) {
      window.location.reload();
    }
  });
}
