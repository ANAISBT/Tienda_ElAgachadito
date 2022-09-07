const fragment = document.createDocumentFragment();
const items=document.getElementById('items');
const footer=document.getElementById('footer-carrito');
const templateProductos=document.getElementById('template-productos').content
const container_productos=document.getElementById('container-productos');
const templateFooter=document.getElementById('template-footer').content;
const templateCarrito=document.getElementById('template-carrito').content;
let carrito={}


//Bienvenido

const mostrarBienvenido = () =>{
    const alert = document.querySelector('.alert');
    setTimeout( function(){
        alert.classList.add('hide')
      }, 3000)
      alert.classList.remove('hide')
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData(); //Funcion para obtener los datos de la API
    mostrarBienvenido();
});

const fetchData= async () => {
    try{
        const respuesta=await fetch('api.json'); //Se obtienen los datos de la API
        const datos=await respuesta.json(); //Se convierten los datos a JSON
        //console.log(datos); //Se imprimen los datos
        showData(datos); //Se llama a la funcion para mostrar los datos
    }catch(error){
        console.log(error);
    }
}

const showData= (data) => {
    data.forEach(producto => {
        // console.log(producto);
        templateProductos.querySelector('h5').textContent=producto.nombre;
        templateProductos.querySelector('span').textContent=producto.precio;
        templateProductos.querySelector('img').setAttribute('src',producto.imagen);
        templateProductos.querySelector(".btnAgregar").dataset.id=producto.id;

        const copia=templateProductos.cloneNode(true)
        fragment.appendChild(copia)
    });
    container_productos.appendChild(fragment)
}

container_productos.addEventListener('click', evento=>{
    agregarCarrito(evento);
})

const agregarCarrito = evento =>{
    if(evento.target.classList.contains("btnAgregar")){
        setCarrito(evento.target.parentElement);
    }
    evento.stopPropagation()
}

const setCarrito = (objeto) =>{
    const producto={
        id: objeto.querySelector(".btnAgregar").dataset.id,
        nombre: objeto.querySelector("h5").textContent,
        precio: objeto.querySelector("span").textContent,
        cantidad:1
    }
    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad=carrito[producto.id].cantidad++;
        Swal.fire({
            title: 'Producto existente en el carrito',
            text: 'Se ha aumentado la cantidad del producto',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          })
    }else{
        carrito[producto.id]={...producto};
        Swal.fire({
            position: 'top-center',
            icon: 'success',
            title: 'Producto agregado al carrito',
            showConfirmButton: true,
            timer: 1500
        })
    }
    addLocalStorage();
    mostrarCarrito();
}

const mostrarCarrito = () =>{
    items.innerHTML='';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent=producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent=producto.nombre;
        templateCarrito.querySelectorAll('td')[1].textContent=producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id=producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id=producto.id;
        templateCarrito.querySelector('.btn_eliminar').dataset.id=producto.id;
        templateCarrito.querySelector('span').textContent=producto.cantidad*producto.precio;
        const copia=templateCarrito.cloneNode(true)
        fragment.appendChild(copia)
        
    });
    items.appendChild(fragment)
    mostrarFooter();
}

function addLocalStorage(){
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }

  window.onload = function(){
    const storage = JSON.parse(localStorage.getItem('carrito'));
    if(storage){
      carrito = storage;
    mostrarCarrito();
    }
  }
const mostrarFooter = () =>{
    footer.innerHTML='';
    if(Object.keys(carrito).length === 0){
        footer.innerHTML=`<th scope="row" colspan="5">No hay productos en el carrito</th>`;
        return
    }

    const total=Object.values(carrito).reduce((acum,{cantidad})=> acum+cantidad,0);
    const totalPrecio=Object.values(carrito).reduce((acum,{cantidad,precio})=> acum+cantidad*precio,0);
    templateFooter.querySelectorAll('td')[0].textContent=total;
    templateFooter.querySelector('span').textContent=totalPrecio;
    const copia=templateFooter.cloneNode(true)
    footer.appendChild(copia)
    // console.log(total);

    const btnVaciar=document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click',()=>{
        Swal.fire(
            'Carrito Vaciado!',
            'Los productos han sido eliminados del carrito',
            'success'
            )
        carrito={}
        deleteLocalStorage();
        mostrarCarrito();
        // footer.innerHTML=`<th scope="row" colspan="5">No hay productos en el carrito</th>`;
    })
    const btnComprar=document.getElementById('comprar-carrito');
    btnComprar.addEventListener('click',()=>{
        Comprar(true);
        setTimeout(()=>{
            console.info("Compró",carrito);
        carrito={}
        deleteLocalStorage();
        mostrarCarrito();
        },3000)
        // footer.innerHTML=`<th scope="row" colspan="5">No hay productos en el carrito</th>`;
    })

}

const Comprar = (res) =>{
    return new Promise((resolve,reject)=>{
        document.getElementById('idLoading').style.display ='block';
        setTimeout(()=>{
            res ? resolve("Compra realizada") : reject("No se pudo realizar la compra")
        },3000)
    }).then(()=>{
        Swal.fire(
            'Compra Realizada!',
            'Gracias por su compra',
            'success'
            )
        }).catch(()=>{
        Swal.fire(
            'Compra no realizada',
            'No se pudo realizar la compra',
            'error'
            )
        }).finally(()=>{
            document.getElementById('idLoading').style.display ='none';
        console.log("Proceso finalizado");
    })
}

function deleteLocalStorage(){
    localStorage.clear();
    }

items.addEventListener('click', evento=>{
    btnCantidad(evento);
})



const btnCantidad = evento =>{
    if(evento.target.classList.contains("btn-info")){
        const producto=carrito[evento.target.dataset.id];
        producto.cantidad++;
        carrito[evento.target.dataset.id]={...producto};
        mostrarCarrito();
    }
    if(evento.target.classList.contains("btn-danger")){
        const producto=carrito[evento.target.dataset.id];
        producto.cantidad--;
        if(producto.cantidad===0){
            Swal.fire({
                position: 'top-center',
                icon: ' success',
                title: 'Producto eliminado',
                showConfirmButton: false,
                timer: 1500
            })
            delete carrito[evento.target.dataset.id];
        }
        mostrarCarrito();
    }
    if(evento.target.classList.contains("btn_eliminar")){
                Swal.fire(
                'Eliminado!',
                'El producto ha sido eliminado',
                'success'
                )
        delete carrito[evento.target.dataset.id];
        mostrarCarrito();
    }
    evento.stopPropagation()
}

    

