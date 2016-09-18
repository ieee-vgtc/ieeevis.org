$(document).ready(function() {
	
	// Expand Panel
	$("#open").click(function(){
		$("div#panel").slideDown("slow");
	
	});	
	
	// Collapse Panel
	$("#close").click(function(){
		$("div#panel").slideUp("slow");	
	});		
	
	// Switch buttons from "Log In | Register" to "Close Panel" on click
	$("#toggle a").click(function () {
		$("#toggle a").toggle();
	});		
        
        // Login,Register and Password links
        $("#login a").click(function () {
                $("#login").addClass("clicked");
                $("#pass").removeClass("clicked");
                $("#register").removeClass("clicked");
                $("#login-form").removeClass("hidden");
                $("#pass-form").addClass("hidden");
                $("#register-form").addClass("hidden");
        });
/*
        $("#pass a").click(function () {
                $("#login").removeClass("clicked");
                $("#pass").addClass("clicked");
                $("#register").removeClass("clicked");
                $("#login-form").addClass("hidden");
                $("#pass-form").removeClass("hidden");
                $("#register-form").addClass("hidden");
        });
        $("#register a").click(function () {
                $("#login").removeClass("clicked");
                $("#pass").removeClass("clicked");
                $("#register").addClass("clicked");
                $("#login-form").addClass("hidden");
                $("#pass-form").addClass("hidden");
                $("#register-form").removeClass("hidden");
        });
*/


		
});
