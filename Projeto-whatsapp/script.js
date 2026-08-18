import { usuarios, listarUsuarios, listarContatosUsuario, listarMensagensUsuario } from "./contatos.js";

// ---------------------------------------------------------------------------
// Referências fixas do DOM
// ---------------------------------------------------------------------------
const fotoPerfilNav = document.querySelector('#foto-perfil');
const btnMensagens = document.querySelector('#btn-mensagens');
const secoesPerfil = document.querySelectorAll('.sessão-contato');
const botoesPerfil = document.querySelectorAll('.perfil');

const listaContatosEl = document.querySelector('.lista-contatos');
const gridMsg = document.querySelector('.grid-msg');
const fotoContatoHeader = document.querySelector('.foto-contato-header');
const nomeContatoHeader = document.querySelector('.foto-header-container p');

const formEnviar = document.querySelector('.aba-enviar');
const inputMsg = document.querySelector('#send-msg');
const botaoEnviar = document.querySelector('.botao-enviar');

// mapeia o nome exibido em "Trocar de Perfil" -> índice no array
// (necessário porque cada seção de perfil repete os 4 botões de troca,
// então document.querySelectorAll('.perfil') retorna 16 elementos, não 4 —
// usar o índice do forEach direto fazia sempre cair no perfil errado
// dependendo de qual seção estava ativa)
const nomeParaIndice = { ricky: 0, bear: 1, sand: 2, joe: 3 };

// ---------------------------------------------------------------------------
// Fotos via randomuser.me/api/portraits — essa API separa as fotos em pastas
// men/ e women/ (índices 0 a 99), então dá pra escolher de acordo com o
// campo "gender" do array. O pravatar.cc não tem esse filtro por gênero,
// por isso a troca. O número do contato/usuário vira o índice da foto,
// garantindo que a mesma pessoa sempre puxe a mesma imagem.
// ---------------------------------------------------------------------------
function indiceAvatar(seed) {
    const numero = parseInt(String(seed).replace(/\D/g, ''), 10);
    return Number.isFinite(numero) ? Math.abs(numero) % 100 : 0;
}

function fotoAvatar(gender, seed) {
    const pasta = gender === 'female' ? 'women' : 'men';
    const indice = indiceAvatar(seed);
    return `https://randomuser.me/api/portraits/${pasta}/${indice}.jpg`;
}

// ---------------------------------------------------------------------------
// Estado atual: qual usuário e qual contato estão abertos
// ---------------------------------------------------------------------------
let idUsuarioAtual = 0;
let idContatoAtual = 0;

// guarda o template do card e remove o exemplo estático do HTML
const templateCard = listaContatosEl.querySelector('.card-contato');
templateCard.remove();

// ---------------------------------------------------------------------------
// Renderiza a lista de contatos (sidebar esquerda) de um usuário
// ---------------------------------------------------------------------------
function renderizarContatos(idUsuario) {
    idUsuarioAtual = idUsuario;
    const contatos = usuarios["whats-users"][idUsuario].contacts;

    listaContatosEl.innerHTML = '';

    contatos.forEach((contato, idContato) => {
        const card = templateCard.cloneNode(true);
        card.dataset.idContato = idContato;

        const ultimaMsg = contato.messages[contato.messages.length - 1];

        card.querySelector('.foto-contato').src = fotoAvatar(contato.gender, contato.number);
        card.querySelector('.foto-contato').alt = contato.name;
        card.querySelector('.nome-contato').textContent = contato.name;
        card.querySelector('.msg-recebida').textContent = ultimaMsg.content;
        card.querySelector('.hora-da-mensagem-recebida').textContent = ultimaMsg.time;

        // sem contagem de não lidas nos dados por enquanto — esconde a bolinha
        card.querySelector('.quan-msg-recebida').style.display = 'none';

        card.addEventListener('click', () => {
            // remove o destaque de qualquer card selecionado antes
            listaContatosEl.querySelectorAll('.card-contato.selecionado')
                .forEach((c) => c.classList.remove('selecionado'));
            card.classList.add('selecionado');

            renderizarMensagens(idUsuario, idContato);
        });

        listaContatosEl.appendChild(card);
    });

    // abre a primeira conversa por padrão ao trocar de perfil, já destacada
    if (contatos.length > 0) {
        renderizarMensagens(idUsuario, 0);
        listaContatosEl.children[0]?.classList.add('selecionado');
    }
}

// ---------------------------------------------------------------------------
// Renderiza as mensagens (main) de um contato específico
// ---------------------------------------------------------------------------
function renderizarMensagens(idUsuario, idContato) {
    idUsuarioAtual = idUsuario;
    idContatoAtual = idContato;

    const contato = usuarios["whats-users"][idUsuario].contacts[idContato];

    gridMsg.innerHTML = '';

    contato.messages.forEach((msg) => {
        const artigo = document.createElement('article');
        artigo.classList.add(msg.sender === 'me' ? 'enviadas' : 'recebidas');

        const p = document.createElement('p');
        p.textContent = msg.content;

        const span = document.createElement('span');
        span.textContent = msg.time;

        artigo.append(p, span);
        gridMsg.appendChild(artigo);
    });

    fotoContatoHeader.src = fotoAvatar(contato.gender, contato.number);
    fotoContatoHeader.alt = contato.name;
    nomeContatoHeader.textContent = contato.name;

    gridMsg.scrollTop = gridMsg.scrollHeight;
}

// ---------------------------------------------------------------------------
// Atualiza a foto do usuário logado (nav + cabeçalho da aba de perfil)
// ---------------------------------------------------------------------------
function atualizarFotoUsuarioAtivo(idUsuario) {
    const usuario = usuarios["whats-users"][idUsuario];
    const foto = fotoAvatar(usuario.gender, usuario.number);

    fotoPerfilNav.src = foto;

    const secaoAtiva = secoesPerfil[idUsuario];
    if (secaoAtiva) {
        const imgPerfil = secaoAtiva.querySelector('.cabecalho-contato > img');
        if (imgPerfil) imgPerfil.src = foto;
    }
}

// ---------------------------------------------------------------------------
// Navegação: nav principal / aba de perfil
// ---------------------------------------------------------------------------
btnMensagens.addEventListener('click', () => {
    document.body.classList.remove('modo-perfil');
    secoesPerfil.forEach((secao) => secao.classList.remove('ativo'));
});

fotoPerfilNav.addEventListener('click', () => {
    document.body.classList.toggle('modo-perfil');

    if (document.body.classList.contains('modo-perfil')) {
        const algumaAtiva = document.querySelector('.sessão-contato.ativo');
        if (!algumaAtiva) {
            secoesPerfil[idUsuarioAtual].classList.add('ativo'); // abre no perfil atual
        }
    } else {
        secoesPerfil.forEach((secao) => secao.classList.remove('ativo'));
    }
});

// troca de perfil ao clicar em cada foto da lista "Trocar de Perfil"
// usa o texto do <h3> (ricky/bear/sand/joe) pra achar o índice certo no array,
// em vez do índice posicional do forEach (que se repete a cada seção)
botoesPerfil.forEach((perfil) => {
    perfil.addEventListener('click', () => {
        const nome = perfil.querySelector('h3').textContent.trim().toLowerCase();
        const idUsuario = nomeParaIndice[nome];

        if (idUsuario === undefined) return; // nome não reconhecido, ignora

        const alvo = document.querySelector(`#${nome}`);

        secoesPerfil.forEach((secao) => secao.classList.remove('ativo'));
        alvo.classList.add('ativo');

        atualizarFotoUsuarioAtivo(idUsuario);
        renderizarContatos(idUsuario);
    });
});

// ---------------------------------------------------------------------------
// Envio de mensagem (adiciona no DOM E persiste no array em memória)
// ---------------------------------------------------------------------------
formEnviar.addEventListener('submit', (e) => {
    e.preventDefault(); // evita recarregar a página (cobre o Enter também)

    const texto = inputMsg.value.trim();
    if (!texto) return;

    const agora = new Date();
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    const novaMensagem = { sender: 'me', content: texto, time: hora };

    // persiste no array do contato aberto, pra sobreviver se trocar de conversa
    usuarios["whats-users"][idUsuarioAtual].contacts[idContatoAtual].messages.push(novaMensagem);

    const artigo = document.createElement('article');
    artigo.classList.add('enviadas');

    const p = document.createElement('p');
    p.textContent = novaMensagem.content;

    const span = document.createElement('span');
    span.textContent = novaMensagem.time;

    artigo.append(p, span);
    gridMsg.appendChild(artigo);

    inputMsg.value = '';
    gridMsg.scrollTop = gridMsg.scrollHeight;
});

// clicar na imagem dispara o mesmo envio do form
botaoEnviar.addEventListener('click', () => {
    formEnviar.requestSubmit();
});

// ---------------------------------------------------------------------------
// Inicialização: abre o perfil 0 (Ricky) por padrão
// ---------------------------------------------------------------------------
atualizarFotoUsuarioAtivo(0);
renderizarContatos(0);