'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { TextField } from '@/components/cidadao/Field';
import flow from '@/components/cidadao/Flow.module.css';
import styles from './CadastroMesario.module.css';

interface Mesario {
  cpf: string;
  titulo_eleitor: string;
  nome_civil: string;
  data_nascimento: string;
  nome_mae: string;
  nome_pai: string | null;
  municipio: string;
  zona_eleitoral: number;
  secao_eleitoral: number;
  local_votacao: string;
  telefone: string | null;
  email: string | null;
  status_interesse: boolean | null;
}

type DadosMesario = Omit<Mesario, 'status_interesse' | 'zona_eleitoral' | 'secao_eleitoral'> & {
  zona_eleitoral: string;
  secao_eleitoral: string;
};

const cadastroVazio: DadosMesario = {
  cpf: '',
  titulo_eleitor: '',
  nome_civil: '',
  data_nascimento: '',
  nome_mae: '',
  nome_pai: '',
  municipio: '',
  zona_eleitoral: '',
  secao_eleitoral: '',
  local_votacao: '',
  telefone: '',
  email: '',
};

async function lerResposta(response: Response) {
  return response.json().catch(() => ({}));
}

export default function CadastroMesario() {
  const [formData, setFormData] = useState<DadosMesario>(cadastroVazio);
  const [mesarios, setMesarios] = useState<Mesario[]>([]);
  const [cpfEmEdicao, setCpfEmEdicao] = useState<string | null>(null);
  const [statusInteresse, setStatusInteresse] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregarMesarios() {
    setCarregando(true);
    try {
      const response = await fetch('/api/mesarios');
      const result = await lerResposta(response);
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os cadastros.');
      setMesarios(result.data);
    } catch (error) {
      setMensagem(error instanceof Error ? error.message : 'Erro ao carregar os cadastros.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    fetch('/api/mesarios')
      .then(async (response) => {
        const result = await lerResposta(response);
        if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os cadastros.');
        return result.data as Mesario[];
      })
      .then((data) => {
        if (ativo) setMesarios(data);
      })
      .catch((error: unknown) => {
        if (ativo) {
          setMensagem(error instanceof Error ? error.message : 'Erro ao carregar os cadastros.');
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((atual) => ({ ...atual, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    setMensagem('');

    try {
      const editando = cpfEmEdicao !== null;
      const response = await fetch('/api/mesarios', {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editando
            ? {
                cpf: cpfEmEdicao,
                telefone: formData.telefone,
                email: formData.email,
                status_interesse: statusInteresse,
              }
            : formData,
        ),
      });
      const result = await lerResposta(response);
      if (!response.ok) throw new Error(result.error || result.message || 'Não foi possível salvar o cadastro.');

      setMensagem(editando ? 'Dados do mesário atualizados.' : 'Mesário cadastrado com sucesso.');
      cancelarEdicao();
      await carregarMesarios();
    } catch (error) {
      setMensagem(error instanceof Error ? error.message : 'Erro de conexão ao salvar o cadastro.');
    } finally {
      setCarregando(false);
    }
  }

  function iniciarEdicao(mesario: Mesario) {
    setCpfEmEdicao(mesario.cpf);
    setFormData({ ...cadastroVazio, telefone: mesario.telefone ?? '', email: mesario.email ?? '' });
    setStatusInteresse(mesario.status_interesse ?? true);
    setMensagem('');
    document.getElementById('form-mesario')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setCpfEmEdicao(null);
    setFormData(cadastroVazio);
    setStatusInteresse(true);
  }

  async function excluirMesario(cpf: string) {
    if (!window.confirm(`Excluir o cadastro de CPF ${cpf}? Esta ação não pode ser desfeita.`)) return;

    setCarregando(true);
    setMensagem('');
    try {
      const response = await fetch(`/api/mesarios?cpf=${encodeURIComponent(cpf)}`, { method: 'DELETE' });
      const result = await lerResposta(response);
      if (!response.ok) throw new Error(result.error || result.message || 'Não foi possível excluir o cadastro.');
      if (cpfEmEdicao === cpf) cancelarEdicao();
      setMensagem('Cadastro excluído com sucesso.');
      await carregarMesarios();
    } catch (error) {
      setMensagem(error instanceof Error ? error.message : 'Erro de conexão ao excluir o cadastro.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className={`${flow.content} ${styles.page}`} aria-labelledby="titulo-pagina">
      <h1 className={flow.title} id="titulo-pagina">Portal do mesário</h1>
      <p className={flow.text}>Cadastre e gerencie os dados dos mesários voluntários.</p>

      {mensagem && <p className={styles.message} role="status">{mensagem}</p>}

      <section className={styles.section} aria-labelledby="titulo-formulario">
        <h2 className={flow.sectionTitle} id="titulo-formulario">
          {cpfEmEdicao ? 'Atualizar dados do mesário' : 'Cadastrar mesário'}
        </h2>
        {cpfEmEdicao && <p className={flow.text}>CPF: {cpfEmEdicao}. Nesta edição, telefone, e-mail e status podem ser alterados.</p>}

        <form id="form-mesario" className={flow.form} onSubmit={handleSubmit}>
          {cpfEmEdicao ? (
            <>
              <TextField id="telefone" name="telefone" label="Telefone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={formData.telefone ?? ''} onChange={handleChange} />
              <TextField id="email" name="email" label="E-mail" type="email" autoComplete="email" placeholder="exemplo@email.com" value={formData.email ?? ''} onChange={handleChange} />
              <div className={styles.field}>
                <label className={styles.label} htmlFor="status-interesse">Status de interesse</label>
                <select id="status-interesse" className={styles.select} value={String(statusInteresse)} onChange={(e) => setStatusInteresse(e.target.value === 'true')}>
                  <option value="true">Interesse ativo</option>
                  <option value="false">Retirou o interesse</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <TextField id="cpf" name="cpf" label="CPF" obrigatorio autoComplete="off" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} required />
              <TextField id="titulo_eleitor" name="titulo_eleitor" label="Título de eleitor" obrigatorio value={formData.titulo_eleitor} onChange={handleChange} required />
              <TextField id="nome_civil" name="nome_civil" label="Nome completo" obrigatorio autoComplete="name" value={formData.nome_civil} onChange={handleChange} required />
              <TextField id="data_nascimento" name="data_nascimento" label="Data de nascimento" obrigatorio type="date" value={formData.data_nascimento} onChange={handleChange} required />
              <TextField id="nome_mae" name="nome_mae" label="Nome da mãe" obrigatorio value={formData.nome_mae} onChange={handleChange} required />
              <TextField id="nome_pai" name="nome_pai" label="Nome do pai" value={formData.nome_pai ?? ''} onChange={handleChange} />
              <TextField id="municipio" name="municipio" label="Município" obrigatorio placeholder="Ex.: Ibirama/SC" value={formData.municipio} onChange={handleChange} required />
              <div className={flow.pair}>
                <TextField id="zona_eleitoral" name="zona_eleitoral" label="Zona eleitoral" obrigatorio type="number" min="1" value={formData.zona_eleitoral} onChange={handleChange} required />
                <TextField id="secao_eleitoral" name="secao_eleitoral" label="Seção eleitoral" obrigatorio type="number" min="1" value={formData.secao_eleitoral} onChange={handleChange} required />
              </div>
              <TextField id="local_votacao" name="local_votacao" label="Local de votação" obrigatorio value={formData.local_votacao} onChange={handleChange} required />
              <TextField id="telefone" name="telefone" label="Telefone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={formData.telefone ?? ''} onChange={handleChange} />
              <TextField id="email" name="email" label="E-mail" type="email" autoComplete="email" placeholder="exemplo@email.com" value={formData.email ?? ''} onChange={handleChange} />
            </>
          )}

          <div className={flow.actions}>
            <button className={flow.primaryButton} type="submit" disabled={carregando}>
              {carregando ? 'Salvando...' : cpfEmEdicao ? 'Salvar alterações' : 'Cadastrar mesário'}
            </button>
            {cpfEmEdicao && <button className={flow.secondaryButton} type="button" onClick={cancelarEdicao}>Cancelar edição</button>}
          </div>
        </form>
      </section>

      <section className={styles.section} aria-labelledby="titulo-lista">
        <div className={styles.listHeading}>
          <h2 className={flow.sectionTitle} id="titulo-lista">Mesários cadastrados</h2>
          <button className={styles.refreshButton} type="button" onClick={() => void carregarMesarios()} disabled={carregando} aria-label="Atualizar lista" title="Atualizar lista">
            <i className="fas fa-sync-alt" aria-hidden="true" />
          </button>
        </div>
        {carregando && mesarios.length === 0 ? (
          <p className={flow.text} role="status">Carregando cadastros...</p>
        ) : mesarios.length === 0 ? (
          <p className={flow.text}>Nenhum mesário cadastrado.</p>
        ) : (
          <ul className={styles.list}>
            {mesarios.map((mesario) => (
              <li className={styles.record} key={mesario.cpf}>
                <div className={styles.recordDetails}>
                  <strong>{mesario.nome_civil}</strong>
                  <span>CPF: {mesario.cpf}</span>
                  <span>{mesario.email || 'E-mail não informado'}</span>
                  <span>Status: {mesario.status_interesse === null ? 'Não informado' : mesario.status_interesse ? 'Interesse ativo' : 'Retirou o interesse'}</span>
                </div>
                <div className={styles.recordActions}>
                  <button className={styles.iconButton} type="button" onClick={() => iniciarEdicao(mesario)} aria-label={`Editar ${mesario.nome_civil}`} title="Editar">
                    <i className="fas fa-pen" aria-hidden="true" />
                  </button>
                  <button className={`${styles.iconButton} ${styles.deleteButton}`} type="button" onClick={() => void excluirMesario(mesario.cpf)} disabled={carregando} aria-label={`Excluir ${mesario.nome_civil}`} title="Excluir">
                    <i className="fas fa-trash" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}