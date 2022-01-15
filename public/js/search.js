function search_doctor() {
    let input = document.getElementById('searchbar').value
    input=input.toLowerCase();
    let x = document.getElementsByClassName('card-title');
    let y = document.getElementsByClassName('card-text');
    let z = document.getElementsByClassName('col-sm-6');
      
    for (i = 0; i < x.length; i++) { 
        if (!x[i].innerHTML.toLowerCase().includes(input) && !y[i].innerHTML.toLowerCase().includes(input)) {
            z[i].style.display="none";
        }
        else {
            x[i].style.display="list-item";                 
        }
    }
}