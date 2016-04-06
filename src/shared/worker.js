onmessage = function (e) {
    var url = e.data;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            postMessage(request.responseText);
        }
    }
    request.open('GET', url);
    request.send();
}