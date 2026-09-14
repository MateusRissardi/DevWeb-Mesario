export default function Menu(){
    return (
        <br-menu
            id="menu-push"
            push
            is-open="true"
            >
            <br-menu-header
                slot="header"
                logo-src="https://picsum.photos/400"
                logo-alt="Logo Gov.br"
                signature="Gov.br"
            ></br-menu-header>

            <br-menu-list
                divider
                label="Relatórios"
                menu-level="0"
            >
                <i
                slot="icon"
                className="fas fa-chart-line"
                aria-hidden="true"
                ></i>
                <br-menu-item href="javascript:void(0)"
                ><i
                    slot="icon"
                    className="fas fa-chart-bar"
                    aria-hidden="true"
                ></i
                >Vendas</br-menu-item
                >
                <br-menu-list
                label="Analytics"
                menu-level="1"
                >
                <i
                    slot="icon"
                    className="fas fa-chart-pie"
                    aria-hidden="true"
                ></i>
                <br-menu-item href="javascript:void(0)"
                    ><i
                    slot="icon"
                    className="fas fa-users"
                    aria-hidden="true"
                    ></i
                    >Usuários</br-menu-item
                >
                <br-menu-item href="javascript:void(0)"
                    ><i
                    slot="icon"
                    className="fas fa-eye"
                    aria-hidden="true"
                    ></i
                    >Visualizações</br-menu-item
                >
                <br-menu-item href="javascript:void(0)"
                    ><i
                    slot="icon"
                    className="fas fa-mouse-pointer"
                    aria-hidden="true"
                    ></i
                    >Conversões</br-menu-item
                >
                </br-menu-list>

                <br-menu-item href="javascript:void(0)"
                ><i
                    slot="icon"
                    className="fas fa-file-pdf"
                    aria-hidden="true"
                ></i
                >Exportar PDF</br-menu-item
                >
            </br-menu-list>

            <br-menu-item
                divider
                href="javascript:void(0)"
            >
                <i
                slot="icon"
                className="fas fa-heart"
                aria-hidden="true"
                ></i>
                Favoritos
            </br-menu-item>
            </br-menu>
    )
}