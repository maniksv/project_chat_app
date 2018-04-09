var socket = io();

function scrollToBottom () {
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function () {
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function(error) {
        if (error) {
            alert(error);
            window.location.href = '/';
        } else {
            console.log("No error");
        }
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected From Server');
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
    // 
    // console.log('newMessage', message);
    // var li = jQuery('<li></li>');
    // li.text(`${message.from} ${formattedTime}: ${message.text}`);

    // jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        url: message.url,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
    // var li = jQuery('<li></li>');
    // var a = jQuery(`<a target="_blank">My Location</a>`);

    // li.text(`${message.from} ${formattedTime}: `);
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
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