
const alertFunction = function(div){
    div.classList.remove('d-none');
    div.classList.add('d-block');
    setTimeout(() => {
        div.classList.remove('d-block');
        div.classList.add('d-none');
    }, 3000);
}
function updatePageNumber(hasMoreProducts,hasPreviousProducts) { 
    if(hasMoreProducts){
        pagination_div.querySelector('#nextBtn').classList.remove("disabled");
    }else {
        pagination_div.querySelector('#nextBtn').classList.add("disabled");
    }
    if(hasPreviousProducts){
        pagination_div.querySelector('#previousBtn').classList.remove("disabled");
    }else{
        pagination_div.querySelector('#previousBtn').classList.add("disabled");
    }
}
export default{
    alertFunction,
    updatePageNumber,
}

