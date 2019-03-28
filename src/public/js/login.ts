$(document).ready(() => {
    $(document).find("#login-button").click((event) => {
        let username = $("#username").val();
        let password = $("#password").val();

        $.ajax({
            data: {
                username: username,
                password: password
            },
            url: "login/send",
            dataType: "json"
        }).done((data) => {
            $("#message").text(data.msg);
        });
    });
});