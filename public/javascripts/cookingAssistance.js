/* global showNotification */
$(document).ready(() => {
  // create user button
  const createUserForm = $('#createUserForm');
  createUserForm.on('submit', (e) => {
    if (createUserForm[0].checkValidity()) {
      const userObject = {
        user: {
          name: $('#userNameInput').val(),
        },
      };
      $.ajax({
        method: 'PUT',
        url: '/users',
        contentType: 'application/json',
        data: JSON.stringify(userObject),
      })
        .done((msg) => {
          showNotification(msg.message, 'success', false, '/');
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    createUserForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  // admin panel buttons
  const starCrawlingForm = $('#startCrawlingForm');
  starCrawlingForm.on('submit', (e) => {
    if (starCrawlingForm[0].checkValidity()) {
      $.ajax({
        method: 'POST',
        url: '/crawler/init/allrecipes',
        contentType: 'application/json',
        data: JSON.stringify({
          beginIndex: $('#inputBeginIndex').val(),
          endIndex: $('#inputEndIndex').val(),
        }),
      })
        .done((msg) => {
          showNotification(msg.message, 'success');
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    starCrawlingForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  const startUpdatingForm = $('#startUpdatingForm');
  startUpdatingForm.on('submit', (e) => {
    if (startUpdatingForm[0].checkValidity()) {
      $.ajax({
        method: 'POST',
        url: '/crawler/init/allrecipes',
        contentType: 'application/json',
        data: JSON.stringify({
          continueErrorCount: $('#inputErrorsToStop').val(),
        }),
      })
        .done((msg) => {
          showNotification(msg.message, 'success');
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    startUpdatingForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  $('#resetRecipesBtn').click(() => {
    $.ajax({
      method: 'DELETE',
      url: '/recipes',
    })
      .done((msg) => {
        showNotification(msg.message, 'success');
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  $('#resetIndexBtn').click(() => {
    $.ajax({
      method: 'DELETE',
      url: '/crawler/index',
    })
      .done((msg) => {
        showNotification(msg.message, 'success');
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });
});
