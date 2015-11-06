(function(){
  var url = 'https://git-backend-simple.herokuapp.com/';

  var flashEl = document.getElementById('flash');
  var filesEl = document.getElementById('files');
  var bodyEl = document.getElementById('body');
  var pathEl = document.getElementById('path');
  var messageEl = document.getElementById('message');
  var loadingEL = document.getElementsByClassName('loading')[0];

  request('post', 'clone').end(handler(function(payload) {
    updateFiles(payload);
    hideSpinner();
    read(payload.files[0]);
  }));

  function request(method, path) {
    return superagent[method](url + path).withCredentials();
  }

  function handler(success) {
    return function(err, res) { err ? flash('error', err) : success(res.body); };
  }

  function flash(type, message) {
    flashEl.innerHTML = message;
    flashEl.style.display = 'block';
    flashEl.className = type;
    setTimeout(function() { flashEl.style.display = 'none'; }, 2000);
  }

  function showSpinner() { loadingEL.style.display = 'block'; }
  function hideSpinner() { loadingEL.style.display = 'none'; }

  function updateFiles(payload) {
    filesEl.innerHTML = payload.files.map(function(path) {
      return '<option>' + path + '</option>'
    }).join('');
  }

  function ls() {
    request('get', 'ls').end(handler(updateFiles));
  }

  window.read = function(path) {
    request('get', 'read/' + path).end(handler(function(payload) {
      pathEl.value = path;
      bodyEl.value = payload.content;
    }));
  }

  window.newFile = function() {
    bodyEl.value = '';
    pathEl.value = '';
    filesEl.value = '';
  }

  window.deleteFile = function() {
    if(filesEl.value) {
      request('post', 'delete/' + filesEl.value).end(handler(ls));
    }
  }

  window.save = function() {
    if(!pathEl.value) { return flash('Must provide path'); }

    request('post', 'write/' + pathEl.value)
      .send(bodyEl.value)
      .end(handler(function() {
        if(filesEl.value !== pathEl.value) {
          if(filesEl.value) { deleteFile(); }
          ls();
        }
        flash('success', 'File saved!');
      }));
  }

  window.push = function() {
    showSpinner();
    request('post', 'push')
      .query({ 'message': messageEl.value })
      .end(handler(function() {
        messageEl.value = '';
        hideSpinner();
        flash('success', 'Committed and Pushed!');
      }));
  }
})();
