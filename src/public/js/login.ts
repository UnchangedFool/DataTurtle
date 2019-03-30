$(document).ready(() => {
    $(document).find("#login-button").click((event) => {
        const username: string = <string>$("#username").val();
        const password: string = <string>$("#password").val();

        $.ajax({
            data: {
                username: username,
                password: password
            },
            url: "login",
            dataType: "json"
        }).done((data) => {
            $("#message").text(data.msg);
        });
    });

    $(document).find("#save-button").click((event) => {
        const username: string = <string>$("#username").val();
        const password: string = <string>$("#password").val();
        
        $.ajax({
            data: {
                username: username,
                password: password
            },
            url: "signup",
            dataType: "json"
        }).done((data) => {
            $("#message").text(data.msg);
        });;
    });
});