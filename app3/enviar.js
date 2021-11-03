function enviaERecebe(){

    let consulta = document.getElementById("input").value;
    document.getElementById("query").innerHTML = "Loading..............";

    let options = {
        method: 'POST',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: consulta
    }

    const promise = fetch('/data', options);

    promise.then(response => {

        if(!response.ok){
            console.error(response)
        } else {
            return response.text();
        }
    }).then(result => {
        document.getElementById("query").innerHTML = result;
    });

}