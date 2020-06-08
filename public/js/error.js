const alert = $(".alert")

if(alert)
{
    window.setTimeout(function() {
        $(".alert").fadeOut(1000, 0).slideUp(1000, function(){
            $(this).remove(); 
        });
    }, 3000);
}