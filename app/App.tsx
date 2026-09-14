export default function Header() {
  return (
    <br-header is-compact>
        <br-header-logo
            slot="logo"
            src="/assets/logo.svg"
        ></br-header-logo>
        <span slot="signature">Portal TSE</span>
        <br-header-list
            slot="links"
            list-title="Acesso Rápido"
        >
            <br-header-link href="javascript:void(0)">Início</br-header-link>
            <br-header-link href="javascript:void(0)">Serviços</br-header-link>
            <br-header-link href="javascript:void(0)">Notícias</br-header-link>
            <br-header-link href="javascript:void(0)">Atendimento</br-header-link>
            <br-header-link href="javascript:void(0)">Transparência</br-header-link>
            <br-header-link href="javascript:void(0)">Ajuda</br-header-link>
        </br-header-list>
        <br-header-list
            slot="functions"
            list-title="Funcionalidades do Sistema"
        >
            <br-header-function href="javascript:void(0)">
            <i
                slot="icon"
                className="fas fa-chart-bar"
                aria-hidden="true"
            ></i>
            Consultar serviços
            </br-header-function>
            <br-header-function>
            <i
                slot="icon"
                className="fas fa-headphones"
                aria-hidden="true"
            ></i>
            Acompanhar pedidos
            </br-header-function>
            <br-header-function href="javascript:void(0)">
            <i
                slot="icon"
                className="fas fa-comment"
                aria-hidden="true"
            ></i>
            Enviar mensagem
            </br-header-function>
            <br-header-function>
            <i
                slot="icon"
                className="fas fa-adjust"
                aria-hidden="true"
            ></i>
            Ajustar preferências
            </br-header-function>
        </br-header-list>
        <br-button
            slot="search-icon"
            shape="circle"
            density="small"
            emphasis="tertiary"
            aria-label="Abrir busca"
        >
            <br-icon
            src="/assets/icon-search.svg"
            aria-hidden="true"
            ></br-icon>
        </br-button>
        <br-input
            slot="search"
            id="highlight"
            placeholder="O que você procura?"
            is-highlight
            action-label="Buscar"
        >
            <i
            slot="action"
            className="fas fa-search"
            aria-hidden="true"
            ></i>
        </br-input>
        <br-sign-in
            slot="access"
            density="small"
            href="javascript:void(0)"
        >
            <i
            slot="icon"
            className="fas fa-user"
            aria-hidden="true"
            ></i>
            Entrar
        </br-sign-in>
        <br-button
            slot="menu-trigger"
            shape="circle"
            density="small"
            emphasis="tertiary"
            aria-label="Abrir menu"
        >
            <i
            className="fas fa-align-justify"
            aria-hidden="true"
            ></i>
        </br-button>
        <span slot="caption">Sistema de Gestão de Mesários</span>
        <span slot="subcaption">Gerenciamento de informações para controle de mesários</span>
        </br-header>
  );
}