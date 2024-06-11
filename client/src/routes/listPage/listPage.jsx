import './listPage.scss';
import Filter from '../../components/filter/Filter';
import Card from '../../components/card/Card';
import Map from '../../components/map/Map';
import { Await, useLoaderData } from 'react-router-dom';
import { Suspense } from 'react';

function ListPage() {
    const data = useLoaderData();
    return (
        <div className="listPage">
            <div className="listContainer">
                <div className="wrapper">
                    <Filter />

                    {/* Mientras carga el fallback se encargara de mostrar un mensaje o imagen o codigo que queramos para que el usuario sepa que esta "cargandose" el conteido */}
                    <Suspense fallback={<p>Loading...</p>}>
                        {/* Await de react-router-dom nos hara resolver una promosa, es decir literalmente esperara a que nuestra variable data tenga contenido para mostrar la lista y de no ser asi mostrara el error de que no se pudieron cargar */}
                        <Await
                            resolve={data.postResponse}
                            errorElement={<p>Error Loading posts!...</p>}
                        >
                            {(postResponse) =>
                                postResponse.data.map((post) => (
                                    <Card key={post.id} item={post} />
                                ))
                            }
                        </Await>
                    </Suspense>
                </div>
            </div>
            <div className="mapContainer">
                <Suspense fallback={<p>Map Loading...</p>}>
                    <Await
                        resolve={data.postResponse}
                        errorElement={<p>Error Loading posts!...</p>}
                    >
                        {(postResponse) => <Map items={postResponse.data} />}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
}

export default ListPage;
