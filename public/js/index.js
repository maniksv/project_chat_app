var socket = io();

socket.on('connect', function () {
    console.log("Connected to server");
});

socket.on('disconnect', function () {
    console.log('Disconnected From Server');
});

socket.on('newMessage', function (message) {
    console.log('newMessage', message);
    var li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);

    jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
    console.log('here to give location');
    var li = jQuery('<li></li>');
    var a = jQuery(`<a target="_blank">My Location</a>`);

    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);
    jQuery('#messages').append(li);
})

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();

    var messageTextBox = jQuery('[name=message]')
    socket.emit('createMessage', {
        from: 'User',
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('')
    })
});

var myLocation = jQuery('#send-location');
myLocation.on('click', function() {
    if (!navigator.geolocation) {
        return alert('Location is not supported');
    }
    myLocation.attr('disabled', 'disabled').text('Sending Location...');

    navigator.geolocation.getCurrentPosition(function(position) {
        myLocation.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }, function() {
        myLocation.removeAttr('disabled').text('Send Location');
        alert('Unable to fetch location');
    })
})